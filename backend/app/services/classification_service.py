"""
backend/app/services/classification_service.py
Service functions for document classification lifecycle, background integration,
versioning, caching, and audit logging.
"""

import json
from uuid import uuid4
from pathlib import Path
from typing import Optional
from sqlalchemy.orm import Session

from app.db.models import SubmittedDocument, BidderDocument, DocumentClassification
from app.ai_engine.ocr_extractor import extract_text_from_file
from app.ai_engine.classification_engine import classify_document_multi_layer
from app.services.audit_service import log_action


def get_latest_document_classification(db: Session, document_id: str) -> Optional[DocumentClassification]:
    """Retrieves the latest version of classification for a document."""
    return db.query(DocumentClassification).filter(
        DocumentClassification.document_id == document_id,
        DocumentClassification.is_latest == True
    ).first()


def classify_submitted_document(
    db: Session,
    document_id: str,
    officer_email: str = "system@bidsentinel.gov.in"
) -> DocumentClassification:
    """
    Runs Phase 3 classification pipeline on a document.
    Consumes Phase 2 OCR/text evidence, applies multi-layer classification,
    persists classification record with audit trailing and versioning.
    """
    # 1. Audit Start
    log_action(
        db=db,
        user=officer_email,
        action="DOCUMENT_CLASSIFICATION_STARTED",
        entity="DOCUMENT",
        entity_id=document_id,
        source="CLASSIFICATION_SERVICE",
        result="IN_PROGRESS",
        details={"document_id": document_id}
    )

    # 2. Retrieve Document Record (SubmittedDocument or legacy BidderDocument)
    submitted_doc = db.query(SubmittedDocument).filter(SubmittedDocument.document_id == document_id).first()
    legacy_doc = None
    if not submitted_doc:
        legacy_doc = db.query(BidderDocument).filter(BidderDocument.id == document_id).first()

    if not submitted_doc and not legacy_doc:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_CLASSIFICATION_FAILED",
            entity="DOCUMENT",
            entity_id=document_id,
            source="CLASSIFICATION_SERVICE",
            result="DOCUMENT_NOT_FOUND",
            details={"reason": f"Document '{document_id}' not found."}
        )
        raise ValueError(f"Document '{document_id}' not found.")

    filename = submitted_doc.original_filename if submitted_doc else legacy_doc.document_name
    storage_path_str = submitted_doc.storage_path if submitted_doc else (legacy_doc.file_path or "")
    submission_id = submitted_doc.submission_id if submitted_doc else None

    # 3. Extract Phase 2 OCR/Text Evidence
    text_content = ""
    if storage_path_str and Path(storage_path_str).exists():
        text_content = extract_text_from_file(Path(storage_path_str), filename)
    else:
        text_content = f"Document content representation for {filename}"

    # 4. Execute Multi-Layer Classification Engine
    res = classify_document_multi_layer(
        text=text_content,
        filename=filename,
        document_id=document_id
    )

    # 5. Versioning: Mark previous classifications as not latest
    existing_records = db.query(DocumentClassification).filter(
        DocumentClassification.document_id == document_id
    ).all()

    next_version = 1
    if existing_records:
        next_version = max(r.version for r in existing_records) + 1
        for rec in existing_records:
            rec.is_latest = False

    cls_uuid = uuid4().hex[:8].upper()
    cls_id = f"CLS-{document_id}-{next_version}-{cls_uuid}"

    classification_record = DocumentClassification(
        classification_id=cls_id,
        document_id=document_id,
        submission_id=submission_id,
        predicted_type=res["predicted_type"],
        confidence=res["confidence"],
        confidence_level=res["confidence_level"],
        classification_method=res["classification_method"],
        classification_status=res["classification_status"],
        alternatives_json=json.dumps(res["alternatives"]),
        evidence_json=json.dumps(res["evidence"]),
        section_metadata_json=json.dumps(res["section_breakdown"]),
        model_version=res["model_version"],
        version=next_version,
        is_latest=True
    )

    # Update document status fields
    if submitted_doc:
        submitted_doc.document_type = res["predicted_type"]
        submitted_doc.upload_status = res["classification_status"]
        submitted_doc.processing_status = "COMPLETED" if res["classification_status"] == "CLASSIFIED" else "REVIEW_REQUIRED"
    elif legacy_doc:
        legacy_doc.document_type = res["predicted_type"]
        legacy_doc.verification_status = "VERIFIED" if res["classification_status"] == "CLASSIFIED" else "PENDING"

    db.add(classification_record)
    db.commit()
    db.refresh(classification_record)

    # 6. Log Audit Completion Event
    audit_action = (
        "DOCUMENT_CLASSIFICATION_COMPLETED"
        if res["classification_status"] == "CLASSIFIED"
        else "DOCUMENT_CLASSIFICATION_REVIEW_REQUIRED"
    )

    log_action(
        db=db,
        user=officer_email,
        action=audit_action,
        entity="DOCUMENT",
        entity_id=document_id,
        source="CLASSIFICATION_SERVICE",
        result=res["classification_status"],
        details={
            "predicted_type": res["predicted_type"],
            "confidence": res["confidence"],
            "confidence_level": res["confidence_level"],
            "classification_status": res["classification_status"],
            "review_reasons": res.get("review_reasons", [])
        }
    )

    return classification_record

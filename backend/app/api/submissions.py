"""
backend/app/api/submissions.py
Submissions and Submission-level Secure Document Ingestion API endpoints.
"""

import json
from uuid import uuid4
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import BidSubmission, Tender, Bidder, SubmittedDocument
from app.core.config import settings
from app.core.security import get_current_user_email
from app.services.audit_service import log_action
from app.services.document_security import (
    is_path_traversal_attempt,
    sanitize_filename,
    calculate_sha256,
    detect_mime_and_magic,
    validate_document_content,
)
from app.schemas.document import DocumentUploadResponse, DocumentDetailResponse

router = APIRouter(prefix="/submissions", tags=["Submissions"])


@router.post("/{submission_id}/documents", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_submission_document(
    submission_id: str,
    tender_id: Optional[str] = Form(None),
    bidder_id: Optional[str] = Form(None),
    document_type: Optional[str] = Form("GENERAL"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """
    Secure Bid-Aware Document Ingestion Endpoint (Phase 1).
    Validates submission ownership chain, file size, format, MIME-extension match,
    magic bytes, path traversal, encryption/corruption, and duplicate SHA-256.
    """
    # Audit upload start
    log_action(
        db=db,
        user=officer_email,
        action="DOCUMENT_UPLOAD_STARTED",
        entity="SUBMISSION",
        entity_id=submission_id,
        source="UPLOAD_PORTAL",
        result="IN_PROGRESS",
        details={"filename": file.filename, "document_type": document_type}
    )

    # 1. Verify Submission Exists
    submission = db.query(BidSubmission).filter(BidSubmission.submission_id == submission_id).first()
    if not submission:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_REJECTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="NOT_FOUND",
            details={"reason": f"Submission {submission_id} not found."}
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found."
        )

    resolved_tender_id = submission.tender_id
    resolved_bidder_id = submission.bidder_id

    # 2. Verify Tender Exists
    tender = db.query(Tender).filter(Tender.tender_id == resolved_tender_id).first()
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{resolved_tender_id}' linked to submission not found."
        )

    # 3. Verify Bidder Exists
    bidder = db.query(Bidder).filter(Bidder.bidder_id == resolved_bidder_id).first()
    if not bidder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bidder '{resolved_bidder_id}' linked to submission not found."
        )

    # 4. Verify Server-Side Ownership Consistency (Tender & Bidder)
    if tender_id and tender_id != resolved_tender_id:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_REJECTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="OWNERSHIP_MISMATCH",
            details={"provided_tender_id": tender_id, "resolved_tender_id": resolved_tender_id}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Submission '{submission_id}' does not belong to tender '{tender_id}'."
        )

    if bidder_id and bidder_id != resolved_bidder_id:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_REJECTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="OWNERSHIP_MISMATCH",
            details={"provided_bidder_id": bidder_id, "resolved_bidder_id": resolved_bidder_id}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Submission '{submission_id}' does not belong to bidder '{bidder_id}'."
        )

    # 5. Filename Sanitization & Path Traversal Prevention
    sanitized_name = sanitize_filename(file.filename)

    # 6. Read Content & Check Size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    if file_size == 0:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_REJECTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="ZERO_BYTE_FILE",
            details={"filename": file.filename}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zero-byte file is not allowed."
        )

    max_bytes = settings.MAX_DOCUMENT_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_REJECTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="OVERSIZED_FILE",
            details={"file_size": file_size, "max_allowed": max_bytes}
        )
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size} bytes) exceeds maximum allowed limit of {settings.MAX_DOCUMENT_SIZE_MB}MB."
        )

    # 7. Dual MIME & Extension Validation (Magic Bytes)
    actual_mime, ext, is_valid_type, error_reason = detect_mime_and_magic(file.filename, file_bytes)
    if not is_valid_type:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_VALIDATION_FAILED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="UNSUPPORTED_OR_MISMATCH",
            details={"reason": error_reason, "filename": file.filename}
        )
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=error_reason
        )

    # 8. SHA-256 Checksum Calculation
    checksum = calculate_sha256(file_bytes)

    # 9. Duplicate Check within the same Submission
    existing_duplicate = db.query(SubmittedDocument).filter(
        SubmittedDocument.submission_id == submission_id,
        SubmittedDocument.checksum_sha256 == checksum
    ).first()

    if existing_duplicate:
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_DUPLICATE",
            entity="DOCUMENT",
            entity_id=existing_duplicate.document_id,
            source="UPLOAD_PORTAL",
            result="DUPLICATE_DETECTED",
            details={
                "submission_id": submission_id,
                "checksum": checksum,
                "existing_document_id": existing_duplicate.document_id
            }
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Duplicate document detected for submission '{submission_id}'. Document '{existing_duplicate.original_filename}' with matching SHA-256 checksum already exists."
        )

    # 10. Content Integrity & Encryption / Corruption Validation
    val_status, val_error = validate_document_content(file_bytes, actual_mime)

    if val_status == "ENCRYPTED":
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_ENCRYPTED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="ENCRYPTED_FILE",
            details={"reason": val_error, "filename": file.filename}
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Document rejected: {val_error}"
        )

    if val_status == "VALIDATION_FAILED":
        log_action(
            db=db,
            user=officer_email,
            action="DOCUMENT_VALIDATION_FAILED",
            entity="SUBMISSION",
            entity_id=submission_id,
            source="UPLOAD_PORTAL",
            result="CORRUPT_FILE",
            details={"reason": val_error, "filename": file.filename}
        )
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Document validation failed: {val_error}"
        )

    # 11. Generate Unique Document Identifiers & Storage Path
    doc_uuid = uuid4().hex[:8].upper()
    doc_id = f"DOC-{submission_id}-{doc_uuid}"
    storage_key = f"{doc_id}_{sanitized_name}"
    storage_path = settings.DOCUMENT_STORAGE_PATH / storage_key

    # 12. Transaction Safety: Save File -> Save Metadata to DB -> Commit -> Audit
    try:
        with open(storage_path, "wb") as f:
            f.write(file_bytes)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to secure storage: {str(exc)}"
        )

    submitted_doc = SubmittedDocument(
        document_id=doc_id,
        submission_id=submission_id,
        bidder_id=resolved_bidder_id,
        tender_id=resolved_tender_id,
        original_filename=sanitized_name,
        stored_filename=storage_key,
        storage_key=storage_key,
        mime_type=actual_mime,
        file_size=file_size,
        document_type=document_type or "GENERAL",
        checksum_sha256=checksum,
        upload_status="VALIDATED",
        processing_status="PENDING",
        uploaded_by=officer_email,
        validation_error=None,
        storage_path=str(storage_path),
        is_duplicate=False,
        version=1,
        metadata_json=json.dumps({"original_filename": file.filename})
    )

    try:
        db.add(submitted_doc)
        db.commit()
        db.refresh(submitted_doc)
    except Exception as db_exc:
        db.rollback()
        # Clean up saved file to prevent orphaned storage
        if storage_path.exists():
            try:
                storage_path.unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database persistence failed: {str(db_exc)}"
        )

    # Log successful audit event
    log_action(
        db=db,
        user=officer_email,
        action="DOCUMENT_UPLOADED",
        entity="DOCUMENT",
        entity_id=doc_id,
        source="UPLOAD_PORTAL",
        result="SUCCESS",
        details={
            "submission_id": submission_id,
            "filename": sanitized_name,
            "checksum_sha256": checksum,
            "status": "VALIDATED"
        }
    )

    return DocumentUploadResponse(
        success=True,
        document_id=doc_id,
        submission_id=submission_id,
        bidder_id=resolved_bidder_id,
        tender_id=resolved_tender_id,
        status="VALIDATED",
        filename=sanitized_name,
        checksum_sha256=checksum,
        message="Document uploaded successfully"
    )


@router.get("/{submission_id}/documents", response_model=List[DocumentDetailResponse])
def get_submission_documents(
    submission_id: str,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """
    Retrieves all validated documents belonging exclusively to a specific submission.
    """
    submission = db.query(BidSubmission).filter(BidSubmission.submission_id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Submission '{submission_id}' not found."
        )

    docs = db.query(SubmittedDocument).filter(SubmittedDocument.submission_id == submission_id).all()
    results = []
    for d in docs:
        results.append(DocumentDetailResponse(
            document_id=d.document_id,
            submission_id=d.submission_id,
            bidder_id=d.bidder_id,
            tender_id=d.tender_id,
            original_filename=d.original_filename,
            stored_filename=d.stored_filename,
            storage_key=d.storage_key,
            document_type=d.document_type,
            mime_type=d.mime_type,
            file_size=d.file_size,
            checksum_sha256=d.checksum_sha256,
            upload_status=d.upload_status,
            processing_status=d.processing_status,
            uploaded_by=d.uploaded_by,
            validation_error=d.validation_error,
            is_duplicate=d.is_duplicate,
            version=d.version,
            created_at=d.created_at.isoformat() if d.created_at else "",
            updated_at=d.updated_at.isoformat() if d.updated_at else ""
        ))
    return results

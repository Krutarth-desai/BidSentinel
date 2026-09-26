"""
backend/app/api/classification.py
Phase 3 Intelligent Document Classification API endpoints.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import SubmittedDocument, BidderDocument, DocumentClassification
from app.core.security import get_current_user_email
from app.services.classification_service import (
    classify_submitted_document,
    get_latest_document_classification
)
from app.schemas.classification import DocumentClassificationResponse

router = APIRouter(prefix="/documents", tags=["Document Classification"])


def build_classification_response(cls: DocumentClassification) -> DocumentClassificationResponse:
    """Formats DocumentClassification model into DocumentClassificationResponse schema."""
    alts = json.loads(cls.alternatives_json) if cls.alternatives_json else []
    evs = json.loads(cls.evidence_json) if cls.evidence_json else []
    sec_meta = json.loads(cls.section_metadata_json) if cls.section_metadata_json else []

    return DocumentClassificationResponse(
        classification_id=cls.classification_id,
        document_id=cls.document_id,
        submission_id=cls.submission_id,
        predicted_type=cls.predicted_type,
        confidence=cls.confidence,
        confidence_level=cls.confidence_level or "HIGH_CONFIDENCE",
        classification_method=cls.classification_method,
        classification_status=cls.classification_status,
        alternatives=alts,
        evidence=evs,
        section_breakdown=sec_meta,
        review_reasons=[],
        model_version=cls.model_version,
        version=cls.version,
        is_latest=cls.is_latest,
        created_at=cls.created_at.isoformat() if cls.created_at else "",
        updated_at=cls.updated_at.isoformat() if cls.updated_at else ""
    )


@router.get("/{document_id}/classification", response_model=DocumentClassificationResponse)
def get_document_classification(
    document_id: str,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """
    Retrieves the classification result and evidence for a specific document.
    Triggers automatic classification if not already processed.
    """
    # Check if document exists
    s_doc = db.query(SubmittedDocument).filter(SubmittedDocument.document_id == document_id).first()
    l_doc = db.query(BidderDocument).filter(BidderDocument.id == document_id).first() if not s_doc else None

    if not s_doc and not l_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found."
        )

    # Retrieve existing latest classification or trigger classification automatically
    cls = get_latest_document_classification(db, document_id)
    if not cls:
        cls = classify_submitted_document(db, document_id, officer_email)

    return build_classification_response(cls)


@router.post("/{document_id}/classify", response_model=DocumentClassificationResponse)
def trigger_document_classification(
    document_id: str,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """
    Triggers on-demand classification or re-classification of a document.
    """
    s_doc = db.query(SubmittedDocument).filter(SubmittedDocument.document_id == document_id).first()
    l_doc = db.query(BidderDocument).filter(BidderDocument.id == document_id).first() if not s_doc else None

    if not s_doc and not l_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document '{document_id}' not found."
        )

    try:
        cls = classify_submitted_document(db, document_id, officer_email)
        return build_classification_response(cls)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Classification processing failed: {str(e)}"
        )

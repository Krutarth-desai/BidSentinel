"""
backend/app/api/documents.py
Document upload, classification, and OCR extraction endpoints.
"""

import json
import shutil
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import BidderDocument, Bidder
from app.ai_engine.document_classifier import classify_document
from app.ai_engine.ocr_extractor import extract_text_from_file
from app.ai_engine.field_extractor import extract_fields
from app.core.config import UPLOAD_DIR
from app.services.audit_service import log_action
from app.core.security import get_current_user_email

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.post("/upload")
async def upload_document(
    bidder_id: str = Form(...),
    tender_id: Optional[str] = Form(None),
    document_type: Optional[str] = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    bidder = db.query(Bidder).filter(Bidder.bidder_id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    # Validate file extension
    suffix = Path(file.filename).suffix.lower()
    if suffix not in [".pdf", ".png", ".jpg", ".jpeg", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, PNG, JPG, or JPEG.")

    save_path = UPLOAD_DIR / f"{bidder_id}_{file.filename}"
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 1. OCR text extraction
    extracted_text = extract_text_from_file(save_path, file.filename)

    # 2. Document classification
    detected_type, confidence = classify_document(extracted_text, file.filename)
    final_type = document_type or detected_type

    # 3. Field extraction
    fields = extract_fields(final_type, extracted_text)

    doc_id = f"DOC-{bidder_id}-{file.filename[:15]}"
    doc = BidderDocument(
        id=doc_id,
        bidder_id=bidder_id,
        tender_id=tender_id,
        document_name=file.filename,
        document_type=final_type,
        upload_date="2026-09-25",
        status="SUBMITTED",
        file_path=str(save_path),
        expiry_date=fields.get("valid_until"),
        extracted_data_json=json.dumps(fields),
        verification_status="VERIFIED" if confidence >= 0.85 else "PENDING"
    )
    db.add(doc)
    db.commit()

    log_action(
        db=db,
        user=officer_email,
        action="UPLOAD_DOCUMENT",
        entity="DOCUMENT",
        entity_id=doc_id,
        source="UPLOAD_PORTAL",
        result=f"Classified as {final_type}",
        details={"filename": file.filename, "type": final_type, "confidence": confidence}
    )

    return {
        "id": doc.id,
        "document_name": doc.document_name,
        "document_type": doc.document_type,
        "classification_confidence": confidence,
        "extracted_data": fields,
        "verification_status": doc.verification_status
    }


@router.get("/{doc_id}")
def get_document_details(doc_id: str, db: Session = Depends(get_db)):
    """Fetch details and extracted data for a specific document."""
    doc = db.query(BidderDocument).filter(BidderDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    extracted_data = {}
    if doc.extracted_data_json:
        try:
            extracted_data = json.loads(doc.extracted_data_json)
        except Exception:
            extracted_data = {}

    return {
        "id": doc.id,
        "bidder_id": doc.bidder_id,
        "tender_id": doc.tender_id,
        "document_name": doc.document_name,
        "document_type": doc.document_type,
        "upload_date": doc.upload_date,
        "status": doc.status,
        "expiry_date": doc.expiry_date,
        "extracted_data": extracted_data,
        "verification_status": doc.verification_status,
        "file_exists": bool(doc.file_path and Path(doc.file_path).exists())
    }

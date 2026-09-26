"""
backend/app/schemas/document.py
Pydantic schemas for Document Ingestion API responses and requests.
"""

from typing import Optional
from pydantic import BaseModel, ConfigDict

class DocumentUploadResponse(BaseModel):
    success: bool
    document_id: str
    submission_id: str
    bidder_id: str
    tender_id: str
    status: str
    filename: str
    checksum_sha256: str
    message: str

class DocumentDetailResponse(BaseModel):
    document_id: str
    submission_id: str
    bidder_id: str
    tender_id: str
    original_filename: str
    stored_filename: str
    storage_key: str
    document_type: str
    mime_type: str
    file_size: int
    checksum_sha256: str
    upload_status: str
    processing_status: str
    uploaded_by: str
    validation_error: Optional[str] = None
    is_duplicate: bool
    version: int
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

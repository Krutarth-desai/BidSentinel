"""
backend/app/schemas/bidder.py
Pydantic schemas for bidder management and bidder profiles.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class DocumentItem(BaseModel):
    id: str
    document_name: str
    document_type: str
    upload_date: Optional[str] = None
    status: str
    expiry_date: Optional[str] = None
    verification_status: str
    extracted_data: Optional[Dict[str, Any]] = None

class BidderBase(BaseModel):
    bidder_id: str
    company_name: str
    pan: str
    gstin: str
    cin: Optional[str] = None
    udyam_number: Optional[str] = None
    address: Optional[str] = None
    company_type: str = "PRIVATE_LIMITED"
    msme_status: str = "NOT_APPLICABLE"
    msme_category: Optional[str] = None
    startup_status: str = "NOT_APPLICABLE"
    startup_certificate: Optional[str] = None
    nsic_status: str = "NOT_REGISTERED"
    epfo_id: Optional[str] = None
    esic_id: Optional[str] = None
    claimed_msme_benefit: bool = False
    claimed_startup_benefit: bool = False
    declared_local_content: float = 0.0
    oem_authorized: bool = False
    oem_product: Optional[str] = None
    oem_name: Optional[str] = None
    oem_expiry: Optional[str] = None
    itr_filed_year: Optional[str] = None
    blacklisted: bool = False

class BidderResponse(BidderBase):
    expected_score: int = 0
    expected_risk: str = "LOW"
    notes: Optional[str] = None
    documents: List[DocumentItem] = []
    latest_verification: Optional[Dict[str, Any]] = None
    officer_decision: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

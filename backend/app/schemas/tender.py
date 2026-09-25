"""
backend/app/schemas/tender.py
Pydantic schemas for tenders and extracted requirements.
"""

from typing import List, Optional
from pydantic import BaseModel

class TenderRequirementBase(BaseModel):
    id: str
    tender_id: str
    title: str
    category: str
    mandatory: str
    condition: Optional[str] = None
    verification_source: str
    rule_code: Optional[str] = None
    weight: int = 10
    is_custom: bool = False

class TenderRequirementCreate(BaseModel):
    title: str
    category: str
    mandatory: str
    condition: Optional[str] = None
    verification_source: str
    rule_code: Optional[str] = None
    weight: int = 10

class TenderBase(BaseModel):
    tender_id: str
    title: str
    department: str
    ministry: Optional[str] = None
    reference_number: Optional[str] = None
    created_date: Optional[str] = None
    closing_date: Optional[str] = None
    estimated_value_inr: float = 0.0
    status: str = "ACTIVE"
    category: Optional[str] = None
    description: Optional[str] = None

class TenderCreate(BaseModel):
    tender_id: str
    title: str
    department: str
    ministry: Optional[str] = None
    reference_number: Optional[str] = None
    estimated_value_inr: float = 0.0
    category: Optional[str] = None
    description: Optional[str] = None

class TenderResponse(TenderBase):
    requirements: List[TenderRequirementBase] = []
    bidders_count: int = 0

    class Config:
        from_attributes = True

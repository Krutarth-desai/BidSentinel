"""
backend/app/schemas/classification.py
Pydantic schemas for Phase 3 Intelligent Document Classification API responses and payloads.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict

class AlternativePrediction(BaseModel):
    type: str
    confidence: float

class ClassificationEvidence(BaseModel):
    layer: str
    page: int
    matched_term: Optional[str] = None
    pattern: Optional[str] = None
    text: str
    bbox: Optional[List[float]] = None

class SectionClassification(BaseModel):
    start_page: int
    end_page: int
    document_type: str
    confidence: float

class DocumentClassificationResponse(BaseModel):
    classification_id: str
    document_id: str
    submission_id: Optional[str] = None
    predicted_type: str
    confidence: float
    confidence_level: str
    classification_method: str
    classification_status: str
    alternatives: List[AlternativePrediction] = []
    evidence: List[ClassificationEvidence] = []
    section_breakdown: List[SectionClassification] = []
    review_reasons: List[str] = []
    model_version: str
    version: int
    is_latest: bool
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

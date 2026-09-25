"""
backend/app/schemas/compliance.py
Pydantic schemas for compliance results, evidence viewing, and officer decisions.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class RequirementResult(BaseModel):
    req_id: str
    title: str
    category: str
    mandatory: str
    status: str # COMPLIANT, NON_COMPLIANT, MISSING, REVIEW_REQUIRED, NOT_APPLICABLE, UNVERIFIED
    source: str
    evidence_summary: str
    reason: str
    rule_code: Optional[str] = None
    confidence: float = 1.0
    field_discrepancy: Optional[Dict[str, Any]] = None

class ScoreBreakdown(BaseModel):
    total_score: int
    max_score: int = 100
    statutory: float
    statutory_max: float = 25
    tender_specific: float
    tender_specific_max: float = 30
    document_verification: float
    document_verification_max: float = 25
    govt_verification: float
    govt_verification_max: float = 20

class RiskFactor(BaseModel):
    severity: str # HIGH, MEDIUM, LOW
    factor: str
    impact: str

class VerificationRunResponse(BaseModel):
    tender_id: str
    bidder_id: str
    compliance_score: int
    risk_level: str # LOW, MEDIUM, HIGH
    score_breakdown: ScoreBreakdown
    risk_factors: List[RiskFactor]
    findings: List[str]
    ai_recommendation: str
    requirement_results: List[RequirementResult]
    verified_at: str
    prototype_notice: str = "Prototype / Synthetic Government Connector Mode"

class DecisionRequest(BaseModel):
    tender_id: str
    bidder_id: str
    decision: str # APPROVED, REJECTED, CLARIFICATION_REQUESTED
    comments: str

class DecisionResponse(BaseModel):
    id: int
    tender_id: str
    bidder_id: str
    officer_email: str
    decision: str
    comments: str
    decided_at: str

"""
backend/app/db/models.py
SQLAlchemy ORM models for BidSentinel.
"""

from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from app.db.session import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="PROCUREMENT_OFFICER")
    designation = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)

class Tender(Base):
    __tablename__ = "tenders"
    tender_id = Column(String(100), primary_key=True, index=True) # e.g. GEM/2026/B/100001
    title = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    ministry = Column(String(255), nullable=True)
    reference_number = Column(String(100), nullable=True)
    created_date = Column(String(50), nullable=True)
    closing_date = Column(String(50), nullable=True)
    estimated_value_inr = Column(Float, default=0.0)
    status = Column(String(50), default="ACTIVE")
    category = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    
    requirements = relationship("TenderRequirement", back_populates="tender", cascade="all, delete-orphan")
    verifications = relationship("VerificationResult", back_populates="tender", cascade="all, delete-orphan")
    decisions = relationship("OfficerDecision", back_populates="tender", cascade="all, delete-orphan")
    submissions = relationship("BidSubmission", back_populates="tender", cascade="all, delete-orphan")

class TenderRequirement(Base):
    __tablename__ = "tender_requirements"
    id = Column(String(100), primary_key=True, index=True)
    tender_id = Column(String(100), ForeignKey("tenders.tender_id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False) # STATUTORY, MSME, TENDER_SPECIFIC, MAKE_IN_INDIA, etc.
    mandatory = Column(String(50), default="YES") # YES, NO, CONDITIONAL
    condition = Column(Text, nullable=True)
    verification_source = Column(String(100), nullable=False)
    rule_code = Column(String(100), nullable=True)
    weight = Column(Integer, default=10)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    
    tender = relationship("Tender", back_populates="requirements")

class Bidder(Base):
    __tablename__ = "bidders"
    bidder_id = Column(String(100), primary_key=True, index=True) # e.g. BID-001
    company_name = Column(String(255), nullable=False, index=True)
    pan = Column(String(20), nullable=False, index=True)
    gstin = Column(String(30), nullable=False, index=True)
    cin = Column(String(50), nullable=True)
    udyam_number = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    company_type = Column(String(100), default="PRIVATE_LIMITED")
    msme_status = Column(String(100), default="NOT_APPLICABLE")
    msme_category = Column(String(50), nullable=True) # MICRO, SMALL, MEDIUM, LARGE
    startup_status = Column(String(100), default="NOT_APPLICABLE")
    startup_certificate = Column(String(100), nullable=True)
    nsic_status = Column(String(100), default="NOT_REGISTERED")
    epfo_id = Column(String(50), nullable=True)
    esic_id = Column(String(50), nullable=True)
    claimed_msme_benefit = Column(Boolean, default=False)
    claimed_startup_benefit = Column(Boolean, default=False)
    declared_local_content = Column(Float, default=0.0)
    oem_authorized = Column(Boolean, default=False)
    oem_product = Column(String(255), nullable=True)
    oem_name = Column(String(255), nullable=True)
    oem_expiry = Column(String(50), nullable=True)
    itr_filed_year = Column(String(50), nullable=True)
    blacklisted = Column(Boolean, default=False)
    expected_score = Column(Integer, default=0)
    expected_risk = Column(String(20), default="LOW")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    documents = relationship("BidderDocument", back_populates="bidder", cascade="all, delete-orphan")
    verifications = relationship("VerificationResult", back_populates="bidder", cascade="all, delete-orphan")
    decisions = relationship("OfficerDecision", back_populates="bidder", cascade="all, delete-orphan")
    submissions = relationship("BidSubmission", back_populates="bidder", cascade="all, delete-orphan")

class BidSubmission(Base):
    __tablename__ = "bid_submissions"
    submission_id = Column(String(100), primary_key=True, index=True) # e.g. SUB001
    tender_id = Column(String(100), ForeignKey("tenders.tender_id"), nullable=False, index=True)
    bidder_id = Column(String(100), ForeignKey("bidders.bidder_id"), nullable=False, index=True)
    submission_date = Column(String(50), nullable=True)
    status = Column(String(50), default="SUBMITTED")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    tender = relationship("Tender", back_populates="submissions")
    bidder = relationship("Bidder", back_populates="submissions")
    submitted_documents = relationship("SubmittedDocument", back_populates="submission", cascade="all, delete-orphan")

class SubmittedDocument(Base):
    __tablename__ = "submitted_documents"
    document_id = Column(String(100), primary_key=True, index=True)
    submission_id = Column(String(100), ForeignKey("bid_submissions.submission_id"), nullable=False, index=True)
    bidder_id = Column(String(100), ForeignKey("bidders.bidder_id"), nullable=False, index=True)
    tender_id = Column(String(100), ForeignKey("tenders.tender_id"), nullable=False, index=True)
    original_filename = Column(String(255), nullable=False)
    stored_filename = Column(String(255), nullable=False)
    storage_key = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size = Column(Integer, nullable=False)
    document_type = Column(String(100), nullable=False, default="GENERAL")
    checksum_sha256 = Column(String(64), nullable=False, index=True)
    upload_status = Column(String(50), nullable=False, default="UPLOADED") # UPLOADED, VALIDATING, VALIDATED, VALIDATION_FAILED, UNSUPPORTED, ENCRYPTED, QUEUED, PROCESSING, PROCESSED
    processing_status = Column(String(50), nullable=False, default="PENDING") # PENDING, QUEUED, PROCESSING, COMPLETED, FAILED
    uploaded_by = Column(String(255), nullable=False)
    validation_error = Column(Text, nullable=True)
    storage_path = Column(String(500), nullable=False)
    is_duplicate = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    submission = relationship("BidSubmission", back_populates="submitted_documents")
    bidder = relationship("Bidder")
    tender = relationship("Tender")
    classifications = relationship("DocumentClassification", back_populates="document", cascade="all, delete-orphan")

class DocumentClassification(Base):
    __tablename__ = "document_classifications"
    classification_id = Column(String(100), primary_key=True, index=True) # e.g. CLS-DOC-001-V1
    document_id = Column(String(100), ForeignKey("submitted_documents.document_id"), nullable=False, index=True)
    submission_id = Column(String(100), nullable=True, index=True)
    predicted_type = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    classification_method = Column(String(50), default="RULE_BASED") # RULE_BASED, FILENAME_HEURISTIC, HYBRID_MULTI_LAYER
    classification_status = Column(String(50), default="CLASSIFIED") # CLASSIFIED, REVIEW_REQUIRED, CLASSIFICATION_FAILED
    confidence_level = Column(String(50), default="HIGH_CONFIDENCE") # HIGH_CONFIDENCE, MEDIUM_CONFIDENCE, LOW_CONFIDENCE
    alternatives_json = Column(Text, nullable=True) # JSON list of alternative candidate predictions
    evidence_json = Column(Text, nullable=True) # JSON list of evidence snippets pointing back to Phase 2 text evidence
    section_metadata_json = Column(Text, nullable=True) # JSON list of section-level classifications
    model_version = Column(String(50), default="v1.0.0-phase3")
    version = Column(Integer, default=1)
    is_latest = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    document = relationship("SubmittedDocument", back_populates="classifications")

class BidderDocument(Base):
    __tablename__ = "bidder_documents"
    id = Column(String(100), primary_key=True, index=True)
    bidder_id = Column(String(100), ForeignKey("bidders.bidder_id"), nullable=False, index=True)
    tender_id = Column(String(100), nullable=True, index=True)
    document_name = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False) # GST_CERTIFICATE, PAN, UDYAM, ITR, OEM_AUTH, etc.
    upload_date = Column(String(50), nullable=True)
    status = Column(String(50), default="SUBMITTED") # SUBMITTED, VERIFIED, EXPIRED, MISMATCH, MISSING
    file_path = Column(String(500), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    extracted_data_json = Column(Text, nullable=True) # JSON of fields extracted via OCR/AI
    verification_status = Column(String(50), default="PENDING") # PENDING, VERIFIED, REJECTED, FLAG_REVIEW
    created_at = Column(DateTime, default=utc_now)

    bidder = relationship("Bidder", back_populates="documents")

class VerificationResult(Base):
    __tablename__ = "verification_results"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(String(100), ForeignKey("tenders.tender_id"), nullable=False, index=True)
    bidder_id = Column(String(100), ForeignKey("bidders.bidder_id"), nullable=False, index=True)
    compliance_score = Column(Integer, default=0)
    risk_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH
    statutory_score = Column(Float, default=0.0)
    tender_score = Column(Float, default=0.0)
    document_score = Column(Float, default=0.0)
    govt_score = Column(Float, default=0.0)
    findings_json = Column(Text, nullable=True) # JSON list of findings
    rule_results_json = Column(Text, nullable=True) # JSON dict of detailed rule executions
    risk_factors_json = Column(Text, nullable=True) # JSON dict of risk drivers
    ai_recommendation = Column(Text, nullable=True)
    verified_at = Column(DateTime, default=utc_now)

    tender = relationship("Tender", back_populates="verifications")
    bidder = relationship("Bidder", back_populates="verifications")

class OfficerDecision(Base):
    __tablename__ = "officer_decisions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tender_id = Column(String(100), ForeignKey("tenders.tender_id"), nullable=False, index=True)
    bidder_id = Column(String(100), ForeignKey("bidders.bidder_id"), nullable=False, index=True)
    officer_email = Column(String(255), nullable=False)
    officer_name = Column(String(255), nullable=True)
    decision = Column(String(50), nullable=False) # APPROVED, REJECTED, CLARIFICATION_REQUESTED
    comments = Column(Text, nullable=False)
    decided_at = Column(DateTime, default=utc_now)

    tender = relationship("Tender", back_populates="decisions")
    bidder = relationship("Bidder", back_populates="decisions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    timestamp = Column(DateTime, default=utc_now, index=True)
    user = Column(String(255), nullable=False)
    action = Column(String(255), nullable=False)
    entity = Column(String(100), nullable=False)
    entity_id = Column(String(100), nullable=True)
    source = Column(String(100), default="SYSTEM")
    result = Column(String(100), nullable=True)
    details_json = Column(Text, nullable=True)

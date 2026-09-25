"""
backend/app/api/bidders.py
Bidder Management and Bidder Profile endpoints.
"""

import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Bidder, BidderDocument, VerificationResult, OfficerDecision
from app.core.config import DATA_DIR

router = APIRouter(prefix="/bidders", tags=["Bidders"])

@router.get("/")
def list_bidders(db: Session = Depends(get_db)):
    bidders = db.query(Bidder).all()
    results = []
    for b in bidders:
        # Get latest verification
        latest_ver = db.query(VerificationResult).filter(
            VerificationResult.bidder_id == b.bidder_id
        ).order_by(VerificationResult.verified_at.desc()).first()

        decision = db.query(OfficerDecision).filter(
            OfficerDecision.bidder_id == b.bidder_id
        ).order_by(OfficerDecision.decided_at.desc()).first()

        results.append({
            "bidder_id": b.bidder_id,
            "company_name": b.company_name,
            "pan": b.pan,
            "gstin": b.gstin,
            "cin": b.cin,
            "udyam_number": b.udyam_number,
            "address": b.address,
            "company_type": b.company_type,
            "msme_status": b.msme_status,
            "msme_category": b.msme_category,
            "startup_status": b.startup_status,
            "claimed_msme_benefit": b.claimed_msme_benefit,
            "claimed_startup_benefit": b.claimed_startup_benefit,
            "declared_local_content": b.declared_local_content,
            "compliance_score": latest_ver.compliance_score if latest_ver else b.expected_score,
            "risk_level": latest_ver.risk_level if latest_ver else b.expected_risk,
            "documents_count": len(b.documents),
            "decision": decision.decision if decision else "PENDING_REVIEW",
            "notes": b.notes
        })
    return results

@router.get("/{bidder_id}")
def get_bidder_profile(bidder_id: str, db: Session = Depends(get_db)):
    bidder = db.query(Bidder).filter(Bidder.bidder_id == bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    docs = []
    for d in bidder.documents:
        docs.append({
            "id": d.id,
            "document_name": d.document_name,
            "document_type": d.document_type,
            "upload_date": d.upload_date,
            "status": d.status,
            "expiry_date": d.expiry_date,
            "verification_status": d.verification_status,
            "extracted_data": json.loads(d.extracted_data_json) if d.extracted_data_json else {}
        })

    latest_ver = db.query(VerificationResult).filter(
        VerificationResult.bidder_id == bidder_id
    ).order_by(VerificationResult.verified_at.desc()).first()

    decision = db.query(OfficerDecision).filter(
        OfficerDecision.bidder_id == bidder_id
    ).order_by(OfficerDecision.decided_at.desc()).first()

    ver_dict = None
    if latest_ver:
        ver_dict = {
            "compliance_score": latest_ver.compliance_score,
            "risk_level": latest_ver.risk_level,
            "statutory_score": latest_ver.statutory_score,
            "tender_score": latest_ver.tender_score,
            "document_score": latest_ver.document_score,
            "govt_score": latest_ver.govt_score,
            "findings": json.loads(latest_ver.findings_json) if latest_ver.findings_json else [],
            "risk_factors": json.loads(latest_ver.risk_factors_json) if latest_ver.risk_factors_json else [],
            "requirement_results": json.loads(latest_ver.rule_results_json) if latest_ver.rule_results_json else [],
            "ai_recommendation": latest_ver.ai_recommendation,
            "verified_at": latest_ver.verified_at.isoformat() if latest_ver.verified_at else None
        }

    dec_dict = None
    if decision:
        dec_dict = {
            "id": decision.id,
            "decision": decision.decision,
            "officer_email": decision.officer_email,
            "comments": decision.comments,
            "decided_at": decision.decided_at.isoformat() if decision.decided_at else None
        }

    return {
        "bidder_id": bidder.bidder_id,
        "company_name": bidder.company_name,
        "pan": bidder.pan,
        "gstin": bidder.gstin,
        "cin": bidder.cin,
        "udyam_number": bidder.udyam_number,
        "address": bidder.address,
        "company_type": bidder.company_type,
        "msme_status": bidder.msme_status,
        "msme_category": bidder.msme_category,
        "startup_status": bidder.startup_status,
        "startup_certificate": bidder.startup_certificate,
        "nsic_status": bidder.nsic_status,
        "epfo_id": bidder.epfo_id,
        "esic_id": bidder.esic_id,
        "claimed_msme_benefit": bidder.claimed_msme_benefit,
        "claimed_startup_benefit": bidder.claimed_startup_benefit,
        "declared_local_content": bidder.declared_local_content,
        "oem_authorized": bidder.oem_authorized,
        "oem_product": bidder.oem_product,
        "oem_name": bidder.oem_name,
        "oem_expiry": bidder.oem_expiry,
        "itr_filed_year": bidder.itr_filed_year,
        "blacklisted": bidder.blacklisted,
        "expected_score": bidder.expected_score,
        "expected_risk": bidder.expected_risk,
        "notes": bidder.notes,
        "documents": docs,
        "latest_verification": ver_dict,
        "officer_decision": dec_dict
    }

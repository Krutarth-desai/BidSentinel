"""
backend/app/api/verification.py
Compliance Verification endpoints and One-Click Demo execution.
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Tender, Bidder, VerificationResult
from app.services.verification_service import run_bidder_verification
from app.core.security import get_current_user_email

router = APIRouter(prefix="/verification", tags=["Verification"])

class VerificationRequest(BaseModel):
    tender_id: str
    bidder_id: str

@router.post("/run")
def trigger_verification(
    payload: VerificationRequest,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    try:
        result = run_bidder_verification(
            db=db,
            tender_id=payload.tender_id,
            bidder_id=payload.bidder_id,
            officer_email=officer_email
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Verification failure: {str(e)}")

@router.post("/run-all")
def trigger_batch_verification(
    tender_id: str = Query("GEM/2026/B/100001"),
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """
    One-click demo batch: runs AI verification across all active bidders for the demo tender.
    """
    bidders = db.query(Bidder).all()
    results = []
    for b in bidders[:5]: # Top 5 primary demo bidders
        try:
            res = run_bidder_verification(db, tender_id, b.bidder_id, officer_email)
            results.append({
                "bidder_id": b.bidder_id,
                "company_name": b.company_name,
                "compliance_score": res["compliance_score"],
                "risk_level": res["risk_level"]
            })
        except Exception as e:
            results.append({
                "bidder_id": b.bidder_id,
                "error": str(e)
            })

    return {
        "message": "Batch AI verification completed",
        "tender_id": tender_id,
        "processed_count": len(results),
        "results": results
    }

@router.get("/{tender_id}/{bidder_id}")
def get_verification_result(
    tender_id: str,
    bidder_id: str,
    db: Session = Depends(get_db)
):
    # Try fetching existing
    existing = db.query(VerificationResult).filter(
        VerificationResult.tender_id == tender_id,
        VerificationResult.bidder_id == bidder_id
    ).first()

    if not existing:
        # Run on-demand if not already verified
        return run_bidder_verification(db, tender_id, bidder_id)

    import json
    return {
        "tender_id": existing.tender_id,
        "bidder_id": existing.bidder_id,
        "compliance_score": existing.compliance_score,
        "risk_level": existing.risk_level,
        "score_breakdown": {
            "total_score": existing.compliance_score,
            "statutory": existing.statutory_score,
            "tender_specific": existing.tender_score,
            "document_verification": existing.document_score,
            "govt_verification": existing.govt_score
        },
        "findings": json.loads(existing.findings_json) if existing.findings_json else [],
        "risk_factors": json.loads(existing.risk_factors_json) if existing.risk_factors_json else [],
        "requirement_results": json.loads(existing.rule_results_json) if existing.rule_results_json else [],
        "ai_recommendation": existing.ai_recommendation,
        "verified_at": existing.verified_at.isoformat() if existing.verified_at else None,
        "prototype_notice": "Prototype / Synthetic Government Connector Mode"
    }

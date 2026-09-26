"""
backend/app/api/decisions.py
Procurement Officer Final Decision and Evaluation Concurrence endpoints.
Upholds strict Human-in-the-Loop decision governance.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import OfficerDecision, Tender, Bidder
from app.schemas.compliance import DecisionRequest, DecisionResponse
from app.services.audit_service import log_action
from app.core.security import get_current_user_email

router = APIRouter(prefix="/decisions", tags=["Decisions"])

@router.post("/", response_model=DecisionResponse)
def submit_officer_decision(
    payload: DecisionRequest,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    if not payload.comments or len(payload.comments.strip()) < 5:
        raise HTTPException(
            status_code=400,
            detail="Officer comments are mandatory for accountability and audit compliance."
        )

    valid_decisions = ["APPROVED", "REJECTED", "CLARIFICATION_REQUESTED"]
    if payload.decision not in valid_decisions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid decision type. Must be one of: {valid_decisions}"
        )

    # Check tender & bidder
    tender = db.query(Tender).filter(Tender.tender_id == payload.tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    bidder = db.query(Bidder).filter(Bidder.bidder_id == payload.bidder_id).first()
    if not bidder:
        raise HTTPException(status_code=404, detail="Bidder not found")

    decision_record = OfficerDecision(
        tender_id=payload.tender_id,
        bidder_id=payload.bidder_id,
        officer_email=officer_email,
        officer_name="Senior Procurement Officer",
        decision=payload.decision,
        comments=payload.comments.strip(),
        decided_at=datetime.now(timezone.utc)
    )
    db.add(decision_record)
    db.commit()
    db.refresh(decision_record)

    # Log to immutable audit trail
    log_action(
        db=db,
        user=officer_email,
        action="RECORD_OFFICER_DECISION",
        entity="OFFICER_DECISION",
        entity_id=str(decision_record.id),
        source="OFFICER_CONSOLE",
        result=payload.decision,
        details={
            "tender_id": payload.tender_id,
            "bidder_id": payload.bidder_id,
            "decision": payload.decision,
            "comments": payload.comments
        }
    )

    return {
        "id": decision_record.id,
        "tender_id": decision_record.tender_id,
        "bidder_id": decision_record.bidder_id,
        "officer_email": decision_record.officer_email,
        "decision": decision_record.decision,
        "comments": decision_record.comments,
        "decided_at": decision_record.decided_at.isoformat()
    }

@router.get("/{tender_id:path}/{bidder_id}")
def get_officer_decision(
    tender_id: str,
    bidder_id: str,
    db: Session = Depends(get_db)
):
    dec = db.query(OfficerDecision).filter(
        OfficerDecision.tender_id == tender_id,
        OfficerDecision.bidder_id == bidder_id
    ).order_by(OfficerDecision.decided_at.desc()).first()

    if not dec:
        return {"status": "PENDING_OFFICER_DECISION", "decision": None}

    return {
        "id": dec.id,
        "tender_id": dec.tender_id,
        "bidder_id": dec.bidder_id,
        "officer_email": dec.officer_email,
        "decision": dec.decision,
        "comments": dec.comments,
        "decided_at": dec.decided_at.isoformat()
    }

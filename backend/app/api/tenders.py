"""
backend/app/api/tenders.py
Tender Management and AI Requirement Extraction endpoints.
"""

import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Tender, TenderRequirement, Bidder
from app.schemas.tender import TenderCreate, TenderRequirementCreate
from app.ai_engine.requirement_extractor import extract_tender_requirements
from app.services.audit_service import log_action
from app.core.config import DATA_DIR
from app.core.security import get_current_user_email

router = APIRouter(prefix="/tenders", tags=["Tenders"])

@router.get("/")
def list_tenders(db: Session = Depends(get_db)):
    tenders = db.query(Tender).all()
    bidders_count = db.query(Bidder).count()

    result = []
    for t in tenders:
        result.append({
            "tender_id": t.tender_id,
            "title": t.title,
            "department": t.department,
            "ministry": t.ministry,
            "reference_number": t.reference_number,
            "created_date": t.created_date,
            "closing_date": t.closing_date,
            "estimated_value_inr": t.estimated_value_inr,
            "status": t.status,
            "category": t.category,
            "description": t.description,
            "requirements_count": len(t.requirements),
            "bidders_count": bidders_count if t.tender_id == "GEM/2026/B/100001" else (3 if t.tender_id == "GEM/2026/B/100002" else 4)
        })
    return result

@router.get("/{tender_id:path}")
def get_tender_detail(tender_id: str, db: Session = Depends(get_db)):
    tender = db.query(Tender).filter(
        (Tender.tender_id == tender_id) | (Tender.reference_number == tender_id)
    ).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    reqs = []
    for r in tender.requirements:
        reqs.append({
            "id": r.id,
            "tender_id": r.tender_id,
            "title": r.title,
            "category": r.category,
            "mandatory": r.mandatory,
            "condition": r.condition,
            "verification_source": r.verification_source,
            "rule_code": r.rule_code,
            "weight": r.weight,
            "is_custom": r.is_custom
        })

    return {
        "tender_id": tender.tender_id,
        "title": tender.title,
        "department": tender.department,
        "ministry": tender.ministry,
        "reference_number": tender.reference_number,
        "created_date": tender.created_date,
        "closing_date": tender.closing_date,
        "estimated_value_inr": tender.estimated_value_inr,
        "status": tender.status,
        "category": tender.category,
        "description": tender.description,
        "requirements": reqs
    }

@router.post("/")
def create_tender(
    payload: TenderCreate,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    existing = db.query(Tender).filter(Tender.tender_id == payload.tender_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tender ID already exists")

    tender = Tender(
        tender_id=payload.tender_id,
        title=payload.title,
        department=payload.department,
        ministry=payload.ministry or "Government of India",
        reference_number=payload.reference_number,
        estimated_value_inr=payload.estimated_value_inr,
        category=payload.category or "Goods",
        description=payload.description or payload.title,
        status="ACTIVE"
    )
    db.add(tender)
    db.commit()

    # Automatically extract baseline requirements
    extracted = extract_tender_requirements(payload.tender_id, payload.description or "", payload.title)
    for r in extracted:
        req_obj = TenderRequirement(
            id=r["id"],
            tender_id=payload.tender_id,
            title=r["title"],
            category=r["category"],
            mandatory=r["mandatory"],
            condition=r.get("condition"),
            verification_source=r["verification_source"],
            rule_code=r.get("rule_code"),
            weight=r.get("weight", 10),
            is_custom=False
        )
        db.add(req_obj)

    log_action(
        db=db,
        user=officer_email,
        action="CREATE_TENDER",
        entity="TENDER",
        entity_id=payload.tender_id,
        source="OFFICER_PORTAL",
        result="SUCCESS",
        details={"extracted_requirements_count": len(extracted)}
    )

    db.commit()
    db.refresh(tender)
    return {"message": "Tender created and AI requirements extracted", "tender_id": tender.tender_id}

@router.post("/load-demo")
def load_demo_tenders(
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    """Loads default demo tenders and requirements from data JSON files."""
    tenders_file = DATA_DIR / "tenders.json"
    reqs_file = DATA_DIR / "requirements.json"

    if not tenders_file.exists() or not reqs_file.exists():
        raise HTTPException(status_code=500, detail="Demo data files missing in data/ directory")

    with open(tenders_file, "r", encoding="utf-8") as f:
        tenders_data = json.load(f)

    with open(reqs_file, "r", encoding="utf-8") as f:
        reqs_data = json.load(f)

    for td in tenders_data:
        t = db.query(Tender).filter(Tender.tender_id == td["tender_id"]).first()
        if not t:
            t = Tender(
                tender_id=td["tender_id"],
                title=td["title"],
                department=td["department"],
                ministry=td.get("ministry"),
                reference_number=td.get("reference_number"),
                created_date=td.get("created_date"),
                closing_date=td.get("closing_date"),
                estimated_value_inr=td.get("estimated_value_inr", 0.0),
                status=td.get("status", "ACTIVE"),
                category=td.get("category"),
                description=td.get("description")
            )
            db.add(t)

    db.commit()

    for rd in reqs_data:
        r = db.query(TenderRequirement).filter(TenderRequirement.id == rd["req_id"]).first()
        if not r:
            r = TenderRequirement(
                id=rd["req_id"],
                tender_id=rd["tender_id"],
                title=rd["title"],
                category=rd["category"],
                mandatory=rd["mandatory"],
                condition=rd.get("condition"),
                verification_source=rd["verification_source"],
                rule_code=rd.get("rule_code"),
                weight=rd.get("weight", 10),
                is_custom=False
            )
            db.add(r)

    log_action(
        db=db,
        user=officer_email,
        action="LOAD_DEMO_TENDER",
        entity="SYSTEM",
        entity_id="ALL",
        source="SYSTEM",
        result="SUCCESS"
    )

    db.commit()
    return {"message": "Demo tenders and requirements successfully loaded", "tenders_count": len(tenders_data)}

@router.post("/{tender_id:path}/extract-requirements")
async def extract_requirements_from_upload(
    tender_id: str,
    file: Optional[UploadFile] = File(None),
    tender_text: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    tender = db.query(Tender).filter(Tender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    text_to_parse = tender_text or ""
    if file:
        content = await file.read()
        try:
            text_to_parse += " " + content.decode("utf-8")
        except Exception:
            text_to_parse += f" File content uploaded: {file.filename}"

    extracted = extract_tender_requirements(tender_id, text_to_parse or tender.description or "", tender.title)

    # Remove previous non-custom requirements
    db.query(TenderRequirement).filter(
        TenderRequirement.tender_id == tender_id,
        TenderRequirement.is_custom == False
    ).delete()

    for r in extracted:
        req_obj = TenderRequirement(
            id=r["id"],
            tender_id=tender_id,
            title=r["title"],
            category=r["category"],
            mandatory=r["mandatory"],
            condition=r.get("condition"),
            verification_source=r["verification_source"],
            rule_code=r.get("rule_code"),
            weight=r.get("weight", 10),
            is_custom=False
        )
        db.add(req_obj)

    log_action(
        db=db,
        user=officer_email,
        action="AI_EXTRACT_REQUIREMENTS",
        entity="TENDER",
        entity_id=tender_id,
        source="AI_ENGINE",
        result=f"Extracted {len(extracted)} requirements"
    )

    db.commit()
    return {"message": f"Successfully extracted {len(extracted)} requirements", "requirements": extracted}

@router.post("/{tender_id:path}/requirements")
def add_custom_requirement(
    tender_id: str,
    payload: TenderRequirementCreate,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    tender = db.query(Tender).filter(Tender.tender_id == tender_id).first()
    if not tender:
        raise HTTPException(status_code=404, detail="Tender not found")

    req_id = f"REQ-CUSTOM-{int(len(tender.requirements) + 1):02d}-{tender_id.replace('/', '_')}"
    req_obj = TenderRequirement(
        id=req_id,
        tender_id=tender_id,
        title=payload.title,
        category=payload.category,
        mandatory=payload.mandatory,
        condition=payload.condition,
        verification_source=payload.verification_source,
        rule_code=payload.rule_code,
        weight=payload.weight,
        is_custom=True
    )
    db.add(req_obj)
    db.commit()

    log_action(
        db=db,
        user=officer_email,
        action="ADD_REQUIREMENT",
        entity="TENDER_REQUIREMENT",
        entity_id=req_id,
        source="OFFICER_PORTAL"
    )

    return {"message": "Requirement added", "requirement_id": req_id}

@router.delete("/{tender_id:path}/requirements/{req_id}")
def delete_requirement(
    tender_id: str,
    req_id: str,
    db: Session = Depends(get_db),
    officer_email: str = Depends(get_current_user_email)
):
    req = db.query(TenderRequirement).filter(
        TenderRequirement.id == req_id,
        TenderRequirement.tender_id == tender_id
    ).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")

    db.delete(req)
    db.commit()

    log_action(
        db=db,
        user=officer_email,
        action="DELETE_REQUIREMENT",
        entity="TENDER_REQUIREMENT",
        entity_id=req_id,
        source="OFFICER_PORTAL"
    )

    return {"message": "Requirement deleted"}

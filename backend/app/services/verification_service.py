"""
backend/app/services/verification_service.py
Core coordinator service for AI bid compliance verification.
Runs complete multi-stage pipeline: OCR/Extraction -> Connectors -> Rules -> Scoring -> Risk -> Audit.
"""

import json
from datetime import datetime, timezone
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Tender, Bidder, VerificationResult
from app.compliance_engine.rule_engine import evaluate_requirements
from app.compliance_engine.scoring_engine import calculate_score
from app.compliance_engine.risk_engine import evaluate_risk
from app.compliance_engine.recommendation_engine import generate_recommendation
from app.services.audit_service import log_action

def run_bidder_verification(
    db: Session,
    tender_id: str,
    bidder_id: str,
    officer_email: str = "officer@gem-demo.gov.in"
) -> Dict[str, Any]:
    """
    Executes end-to-end verification for a bidder against a tender.
    Returns structured results suitable for UI and report generation.
    """
    tender = db.query(Tender).filter(Tender.tender_id == tender_id).first()
    if not tender:
        raise ValueError(f"Tender {tender_id} not found")

    bidder = db.query(Bidder).filter(Bidder.bidder_id == bidder_id).first()
    if not bidder:
        raise ValueError(f"Bidder {bidder_id} not found")

    # Serialize requirements
    reqs_data = []
    for r in tender.requirements:
        reqs_data.append({
            "id": r.id,
            "req_id": r.id,
            "title": r.title,
            "category": r.category,
            "mandatory": r.mandatory,
            "condition": r.condition,
            "verification_source": r.verification_source,
            "rule_code": r.rule_code,
            "weight": r.weight
        })

    # Serialize bidder
    bidder_dict = {
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
        "blacklisted": bidder.blacklisted
    }

    # Documents
    docs_data = []
    for d in bidder.documents:
        docs_data.append({
            "id": d.id,
            "document_name": d.document_name,
            "document_type": d.document_type,
            "status": d.status,
            "expiry_date": d.expiry_date,
            "extracted_data": json.loads(d.extracted_data_json) if d.extracted_data_json else {}
        })

    tender_dict = {
        "tender_id": tender.tender_id,
        "title": tender.title,
        "department": tender.department
    }

    # 1. Evaluate rules across all requirements
    evaluated_results = evaluate_requirements(reqs_data, bidder_dict, docs_data, tender_dict)

    # 2. Calculate compliance score
    scores = calculate_score(evaluated_results)

    # 3. Calculate risk level
    risk_level, risk_factors = evaluate_risk(evaluated_results)

    # 4. Generate AI findings and recommendation
    findings, recommendation = generate_recommendation(
        evaluated_results,
        scores["total_score"],
        risk_level,
        bidder.company_name
    )

    now_iso = datetime.now(timezone.utc).isoformat()

    # 5. Save or update VerificationResult in DB
    existing_res = db.query(VerificationResult).filter(
        VerificationResult.tender_id == tender_id,
        VerificationResult.bidder_id == bidder_id
    ).first()

    if existing_res:
        existing_res.compliance_score = scores["total_score"]
        existing_res.risk_level = risk_level
        existing_res.statutory_score = scores["statutory"]
        existing_res.tender_score = scores["tender_specific"]
        existing_res.document_score = scores["document_verification"]
        existing_res.govt_score = scores["govt_verification"]
        existing_res.findings_json = json.dumps(findings)
        existing_res.rule_results_json = json.dumps(evaluated_results)
        existing_res.risk_factors_json = json.dumps(risk_factors)
        existing_res.ai_recommendation = recommendation
        existing_res.verified_at = datetime.now(timezone.utc)
    else:
        new_res = VerificationResult(
            tender_id=tender_id,
            bidder_id=bidder_id,
            compliance_score=scores["total_score"],
            risk_level=risk_level,
            statutory_score=scores["statutory"],
            tender_score=scores["tender_specific"],
            document_score=scores["document_verification"],
            govt_score=scores["govt_verification"],
            findings_json=json.dumps(findings),
            rule_results_json=json.dumps(evaluated_results),
            risk_factors_json=json.dumps(risk_factors),
            ai_recommendation=recommendation,
            verified_at=datetime.now(timezone.utc)
        )
        db.add(new_res)

    # Log to audit trail
    log_action(
        db=db,
        user=officer_email,
        action="RUN_AI_VERIFICATION",
        entity="BIDDER",
        entity_id=bidder_id,
        source="AI_VERIFICATION_ENGINE",
        result=f"Score: {scores['total_score']}/100, Risk: {risk_level}",
        details={
            "tender_id": tender_id,
            "bidder_id": bidder_id,
            "compliance_score": scores["total_score"],
            "risk_level": risk_level,
            "rules_evaluated": len(evaluated_results)
        }
    )

    db.commit()

    return {
        "tender_id": tender_id,
        "bidder_id": bidder_id,
        "bidder_name": bidder.company_name,
        "compliance_score": scores["total_score"],
        "risk_level": risk_level,
        "score_breakdown": scores,
        "risk_factors": risk_factors,
        "findings": findings,
        "ai_recommendation": recommendation,
        "requirement_results": evaluated_results,
        "verified_at": now_iso,
        "prototype_notice": "Prototype / Synthetic Government Connector Mode"
    }

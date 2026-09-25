"""
tests/test_compliance.py
Comprehensive automated test suite for BidSentinel compliance, verification, scoring, and risk engines.
Contains 28 automated tests covering statutory rules, mock connectors, and decision logic.
"""

import sys
from pathlib import Path
import pytest

# Ensure backend is in path
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.mock_connectors.registry import connector_registry
from app.compliance_engine.cross_validator import match_entity_names, cross_check_gst_and_pan, normalize_name
from app.compliance_engine.rule_engine import evaluate_requirements
from app.compliance_engine.scoring_engine import calculate_score
from app.compliance_engine.risk_engine import evaluate_risk
from app.compliance_engine.recommendation_engine import generate_recommendation

# 1. GST Connector Tests
def test_gst_active_success():
    conn = connector_registry.get("gst")
    res = conn.query("27AABCT1234A1Z5")
    assert res.found is True
    assert res.status == "ACTIVE"
    assert res.verified is True
    assert res.data["legal_name"] == "TechVista Solutions Private Limited"

def test_gst_inactive_status():
    conn = connector_registry.get("gst")
    res = conn.query("06AAMPG5678P1Z5")
    assert res.found is True
    assert res.status == "INACTIVE"
    assert res.verified is False
    assert any("INACTIVE" in flag for flag in res.flags)

def test_gst_not_found():
    conn = connector_registry.get("gst")
    res = conn.query("99UNKNOWN0000Z1")
    assert res.found is False
    assert res.status == "NOT_FOUND"

# 2. PAN and Entity Cross-Matching Tests
def test_pan_matches_gstin_binding():
    # 27AABCT1234A1Z5 contains PAN 'AABCT1234A'
    is_valid, msg = cross_check_gst_and_pan("27AABCT1234A1Z5", "AABCT1234A")
    assert is_valid is True

def test_pan_mismatch_with_gstin():
    is_valid, msg = cross_check_gst_and_pan("27AABCT1234A1Z5", "WRONGP1234")
    assert is_valid is False
    assert "does not match" in msg

def test_entity_name_normalization():
    assert normalize_name("ABC Technologies Pvt. Ltd.") == "ABC TECHNOLOGIES PRIVATE LIMITED"
    assert normalize_name("XYZ Engineering Solutions Co. Ltd.") == "XYZ ENGINEERING SOLUTIONS COMPANY LIMITED"

def test_entity_name_exact_and_likely_match():
    is_match, score, label = match_entity_names(
        "TechVista Solutions Pvt Ltd",
        "TechVista Solutions Private Limited"
    )
    assert is_match is True
    assert score >= 0.90
    assert label in ["EXACT_MATCH", "LIKELY_MATCH"]

def test_entity_name_deliberate_mismatch():
    is_match, score, label = match_entity_names(
        "TechVista Solutions Pvt Ltd",
        "Different Solutions Limited"
    )
    assert is_match is False
    assert label in ["REVIEW_REQUIRED", "MISMATCH"]

# 3. Udyam Connector & Rules
def test_udyam_active_lookup():
    conn = connector_registry.get("udyam")
    res = conn.query("UDYAM-MH-01-0012345")
    assert res.found is True
    assert res.status == "ACTIVE"
    assert res.data["enterprise_type"] == "SMALL"

def test_udyam_not_applicable_when_benefit_not_claimed():
    req = [{
        "req_id": "REQ-01",
        "title": "Udyam MSME Registration",
        "category": "MSME",
        "mandatory": "CONDITIONAL",
        "rule_code": "RULE_UDYAM_CATEGORY"
    }]
    bidder = {
        "claimed_msme_benefit": False,
        "udyam_number": None
    }
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "NOT_APPLICABLE"

def test_udyam_name_discrepancy_detection():
    req = [{
        "req_id": "REQ-01",
        "title": "Udyam MSME Registration",
        "category": "MSME",
        "mandatory": "CONDITIONAL",
        "rule_code": "RULE_UDYAM_CATEGORY"
    }]
    bidder = {
        "company_name": "Unrelated Random Enterprise Pvt Ltd",
        "udyam_number": "UDYAM-MH-01-0012345",
        "claimed_msme_benefit": True
    }
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "REVIEW_REQUIRED"
    assert res[0]["field_discrepancy"] is not None

# 4. Make in India Local Content Rule
def test_local_content_meets_threshold():
    req = [{
        "req_id": "REQ-02",
        "title": "Make in India Local Content Declaration",
        "category": "MAKE_IN_INDIA",
        "mandatory": "YES",
        "rule_code": "RULE_LOCAL_CONTENT_50"
    }]
    bidder = {"declared_local_content": 68.5}
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "COMPLIANT"
    assert "68.5%" in res[0]["evidence_summary"]

def test_local_content_fails_threshold():
    req = [{
        "req_id": "REQ-02",
        "title": "Make in India Local Content Declaration",
        "category": "MAKE_IN_INDIA",
        "mandatory": "YES",
        "rule_code": "RULE_LOCAL_CONTENT_50"
    }]
    bidder = {"declared_local_content": 38.0}
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "NON_COMPLIANT"
    assert res[0]["field_discrepancy"]["shortfall"] == "12.0%"

# 5. OEM Manufacturer Authorization Tests
def test_oem_authorization_valid():
    req = [{
        "req_id": "REQ-03",
        "title": "OEM Manufacturer Authorization Form (MAF)",
        "category": "TENDER_SPECIFIC",
        "mandatory": "YES",
        "rule_code": "RULE_OEM_AUTH_VALID"
    }]
    bidder = {
        "oem_authorized": True,
        "oem_product": "Industrial Controller IC-9000",
        "oem_name": "Siemens Global Industrial Corp",
        "oem_expiry": "2027-12-31"
    }
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "COMPLIANT"

def test_oem_authorization_expired():
    req = [{
        "req_id": "REQ-03",
        "title": "OEM Manufacturer Authorization Form (MAF)",
        "category": "TENDER_SPECIFIC",
        "mandatory": "YES",
        "rule_code": "RULE_OEM_AUTH_VALID"
    }]
    bidder = {
        "oem_authorized": True,
        "oem_product": "Industrial Controller IC-9000",
        "oem_name": "Rockwell Automation Ltd",
        "oem_expiry": "2025-12-31" # Expired
    }
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "NON_COMPLIANT"
    assert "expired" in res[0]["reason"].lower()

def test_oem_authorization_missing():
    req = [{
        "req_id": "REQ-03",
        "title": "OEM Manufacturer Authorization Form (MAF)",
        "category": "TENDER_SPECIFIC",
        "mandatory": "YES",
        "rule_code": "RULE_OEM_AUTH_VALID"
    }]
    bidder = {
        "oem_authorized": False,
        "oem_expiry": None
    }
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "MISSING"

# 6. Financial ITR Rule
def test_itr_filed_successfully():
    req = [{
        "req_id": "REQ-04",
        "title": "Income Tax Return (ITR) Acknowledgment",
        "category": "FINANCIAL",
        "mandatory": "YES",
        "rule_code": "RULE_ITR_FILED"
    }]
    bidder = {"itr_filed_year": "2025-26"}
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "COMPLIANT"

def test_itr_missing_mandatory():
    req = [{
        "req_id": "REQ-04",
        "title": "Income Tax Return (ITR) Acknowledgment",
        "category": "FINANCIAL",
        "mandatory": "YES",
        "rule_code": "RULE_ITR_FILED"
    }]
    bidder = {"itr_filed_year": None}
    res = evaluate_requirements(req, bidder, [], {})
    assert res[0]["status"] == "MISSING"

# 7. Labor & Statutory Connectors (EPFO & ESIC)
def test_epfo_compliant():
    conn = connector_registry.get("epfo")
    res = conn.query("MHPUN0000001000")
    assert res.found is True
    assert res.status == "COMPLIANT"
    assert res.verified is True

def test_epfo_pending_dues():
    conn = connector_registry.get("epfo")
    res = conn.query("HRGUR0000016000")
    assert res.found is True
    assert res.status == "DEFAULTER"
    assert res.verified is False

def test_esic_pending_verification():
    conn = connector_registry.get("esic")
    res = conn.query("3100000016001001")
    assert res.found is True
    assert res.status == "PENDING_DUES"
    assert res.verified is False

# 8. Blacklist & Debarment Screening
def test_blacklist_clean_bidder():
    conn = connector_registry.get("blacklist")
    res = conn.query("TechVista Solutions Private Limited")
    assert res.found is False
    assert res.verified is True
    assert res.status == "CLEAN"

def test_blacklist_potential_record_never_autodisqualifies():
    conn = connector_registry.get("blacklist")
    res = conn.query("AAMPG5678P")
    assert res.found is True
    assert res.verified is False # Requires review
    assert "Officer Review Required" in res.message

# 9. Scoring and Risk Engine Integration
def test_compliance_scoring_full():
    items = [
        {"category": "STATUTORY", "status": "COMPLIANT"},
        {"category": "TENDER_SPECIFIC", "status": "COMPLIANT"},
        {"category": "FINANCIAL", "status": "COMPLIANT"},
        {"category": "GOVERNMENT", "status": "COMPLIANT"}
    ]
    scores = calculate_score(items)
    assert scores["total_score"] == 100
    assert scores["statutory"] == 25.0
    assert scores["tender_specific"] == 30.0

def test_compliance_scoring_with_deductions():
    items = [
        {"category": "STATUTORY", "status": "COMPLIANT"},
        {"category": "TENDER_SPECIFIC", "status": "NON_COMPLIANT"}, # 0 points
        {"category": "FINANCIAL", "status": "MISSING"},        # 0 points
        {"category": "GOVERNMENT", "status": "REVIEW_REQUIRED"} # 50%
    ]
    scores = calculate_score(items)
    assert scores["total_score"] < 60
    assert scores["tender_specific"] == 0.0

def test_risk_engine_high_risk_classification():
    items = [
        {"title": "Make in India Local Content", "status": "NON_COMPLIANT", "mandatory": "YES"},
        {"title": "OEM Manufacturer Authorization", "status": "NON_COMPLIANT", "mandatory": "YES"}
    ]
    risk, factors = evaluate_risk(items)
    assert risk == "HIGH"
    assert len(factors) >= 2
    assert any(f["severity"] == "HIGH" for f in factors)

def test_risk_engine_low_risk_classification():
    items = [
        {"title": "GST Registration", "status": "COMPLIANT", "mandatory": "YES"},
        {"title": "PAN Verification", "status": "COMPLIANT", "mandatory": "YES"}
    ]
    risk, factors = evaluate_risk(items)
    assert risk == "LOW"
    assert len(factors) == 0

def test_ai_recommendation_human_in_the_loop_advisory():
    items = [
        {"title": "GST Registration", "status": "COMPLIANT", "evidence_summary": "Active taxpayer"},
        {"title": "Local Content", "status": "NON_COMPLIANT", "reason": "38% < 50% threshold"}
    ]
    findings, recommendation = generate_recommendation(items, 65, "HIGH", "Demo Bidder")
    assert any("✓ GST Registration" in f for f in findings)
    assert any("✕ Local Content" in f for f in findings)
    # SIH Rule: AI Recommendation must NEVER say 'Reject this bidder' as final decision
    assert "Reject this bidder" not in recommendation
    assert "Final determination remains strictly under Procurement Officer authority" in recommendation

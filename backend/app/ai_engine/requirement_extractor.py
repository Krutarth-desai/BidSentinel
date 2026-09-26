"""
backend/app/ai_engine/requirement_extractor.py
AI Tender Requirement Extraction Engine.
Analyzes tender descriptions and tender PDFs to extract structured compliance criteria.
"""

import re
from typing import List, Dict, Any

DEFAULT_REQUIREMENT_TEMPLATES = [
    {
        "title": "GST Registration",
        "category": "STATUTORY",
        "mandatory": "YES",
        "condition": "Active GSTIN in bidder's legal name with regular returns filed.",
        "verification_source": "GSTN",
        "rule_code": "RULE_GST_ACTIVE",
        "weight": 10
    },
    {
        "title": "Permanent Account Number (PAN)",
        "category": "STATUTORY",
        "mandatory": "YES",
        "condition": "Valid PAN linked with registered corporate identity.",
        "verification_source": "ITD",
        "rule_code": "RULE_PAN_VALID",
        "weight": 10
    },
    {
        "title": "Udyam MSME Registration",
        "category": "MSME",
        "mandatory": "CONDITIONAL",
        "condition": "Required if bidder claims MSME price preference or EMD exemption.",
        "verification_source": "UDYAM",
        "rule_code": "RULE_UDYAM_CATEGORY",
        "weight": 8
    },
    {
        "title": "OEM Manufacturer Authorization Form (MAF)",
        "category": "TENDER_SPECIFIC",
        "mandatory": "YES",
        "condition": "Valid manufacturer authorization specifying tender item and valid beyond bid validity.",
        "verification_source": "OEM_DOCUMENT",
        "rule_code": "RULE_OEM_AUTH_VALID",
        "weight": 15
    },
    {
        "title": "Make in India Local Content Declaration",
        "category": "MAKE_IN_INDIA",
        "mandatory": "YES",
        "condition": "Class-I Local Supplier declaration >= 50% domestic value addition.",
        "verification_source": "SELF_DECLARATION",
        "rule_code": "RULE_LOCAL_CONTENT_50",
        "weight": 15
    },
    {
        "title": "Income Tax Return (ITR) Acknowledgment",
        "category": "FINANCIAL",
        "mandatory": "YES",
        "condition": "ITR submission for Assessment Year 2025-26 (Financial Year 2024-25).",
        "verification_source": "ITD_DOCUMENT",
        "rule_code": "RULE_ITR_FILED",
        "weight": 10
    },
    {
        "title": "EPFO Statutory Compliance",
        "category": "STATUTORY",
        "mandatory": "CONDITIONAL",
        "condition": "Applicable for commercial establishments with >= 20 staff; active ECR filing.",
        "verification_source": "EPFO",
        "rule_code": "RULE_EPFO_COMPLIANT",
        "weight": 8
    },
    {
        "title": "ESIC Statutory Registration",
        "category": "STATUTORY",
        "mandatory": "CONDITIONAL",
        "condition": "Valid employer code and up-to-date contribution returns.",
        "verification_source": "ESIC",
        "rule_code": "RULE_ESIC_COMPLIANT",
        "weight": 8
    },
    {
        "title": "DPIIT Startup Recognition",
        "category": "STARTUP",
        "mandatory": "CONDITIONAL",
        "condition": "Required if claiming prior experience & turnover exemption under GFR 173(i).",
        "verification_source": "DPIIT",
        "rule_code": "RULE_DPIIT_STARTUP",
        "weight": 6
    },
    {
        "title": "Non-Blacklisting & Integrity Declaration",
        "category": "ELIGIBILITY",
        "mandatory": "YES",
        "condition": "Not debarred or under investigation by GeM, CVC, or any Central/State Ministry.",
        "verification_source": "CENTRAL_DEBARMENT_REGISTRY",
        "rule_code": "RULE_NON_BLACKLISTED",
        "weight": 10
    }
]

def extract_tender_requirements(tender_id: str, tender_text: str = "", tender_title: str = "") -> List[Dict[str, Any]]:
    """
    Extracts tender requirements by parsing tender specifications or applying
    tender-specific procurement domain rules.
    """
    reqs: List[Dict[str, Any]] = []
    text_lower = (tender_text + " " + tender_title).lower()

    # Base requirements present in almost all GeM tenders
    for idx, tmpl in enumerate(DEFAULT_REQUIREMENT_TEMPLATES, 1):
        req = tmpl.copy()
        req["id"] = f"REQ-{tender_id.replace('/', '_')}-{idx:02d}"
        req["tender_id"] = tender_id

        # Adjust conditional thresholds if specific keywords found in tender text
        if "50%" in text_lower or "class-i" in text_lower:
            if req["rule_code"] == "RULE_LOCAL_CONTENT_50":
                req["condition"] = "Minimum 50% domestic local content required under MII Public Procurement Order."
        elif "20%" in text_lower or "class-ii" in text_lower:
            if req["rule_code"] == "RULE_LOCAL_CONTENT_50":
                req["condition"] = "Minimum 20% domestic local content required."

        # If defense/aerospace tender, add BIS or Defense conformity
        if "uav" in text_lower or "defense" in text_lower or "aerospace" in text_lower:
            if req["title"] == "OEM Manufacturer Authorization Form (MAF)":
                req["condition"] = "Direct OEM authorization from certified Aerospace/Defense propulsion manufacturer."

        reqs.append(req)

    # Optional BIS requirement if electrical equipment tender
    if "electrical" in text_lower or "protection" in text_lower or "power" in text_lower:
        reqs.append({
            "id": f"REQ-{tender_id.replace('/', '_')}-11",
            "tender_id": tender_id,
            "title": "BIS Conformity Certification",
            "category": "TECHNICAL",
            "mandatory": "YES",
            "condition": "BIS Product Certification as per IS/IEC 61439 or relevant standard.",
            "verification_source": "BIS",
            "rule_code": "RULE_BIS_VALID",
            "weight": 8
        })

    return reqs

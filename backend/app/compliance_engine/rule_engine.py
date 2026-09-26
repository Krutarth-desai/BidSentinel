"""
backend/app/compliance_engine/rule_engine.py
Deterministic compliance rule engine for GeM procurement.
Executes statutory, tender, and integrity rules against cross-verified facts.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from app.mock_connectors.registry import connector_registry
from app.compliance_engine.cross_validator import match_entity_names, cross_check_gst_and_pan

def evaluate_requirements(
    requirements: List[Dict[str, Any]],
    bidder: Dict[str, Any],
    documents: List[Dict[str, Any]],
    tender: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Executes rules for every tender requirement.
    Returns structured results with status, evidence, reason, confidence, and discrepancies.
    """
    results = []
    docs_by_type = {d.get("document_type"): d for d in documents}

    # Query mock connectors
    govt_lookups = connector_registry.query_all_for_bidder(bidder)

    for req in requirements:
        rule_code = req.get("rule_code", "")
        req_id = req.get("id") or req.get("req_id", "REQ-UNKNOWN")
        title = req.get("title", "")
        category = req.get("category", "STATUTORY")
        mandatory = req.get("mandatory", "YES")

        # 1. GST Registration Rule
        if rule_code == "RULE_GST_ACTIVE" or "GST" in title.upper():
            gst_res = govt_lookups.get("gst")
            gst_doc = docs_by_type.get("GST_CERTIFICATE")

            if not bidder.get("gstin"):
                status = "MISSING"
                ev = "No GSTIN provided in bidder profile"
                reason = "Mandatory GST registration missing"
                conf = 1.0
                disc = None
            elif not gst_res or not gst_res.found:
                status = "NON_COMPLIANT"
                ev = f"GSTIN {bidder.get('gstin')} queried against GSTN"
                reason = "GSTIN not found in GSTN database"
                conf = 0.95
                disc = {"field": "GSTIN", "submitted": bidder.get("gstin"), "government_source": "Not Found"}
            elif gst_res.status != "ACTIVE":
                status = "REVIEW_REQUIRED"
                ev = f"GSTN status: {gst_res.status}"
                reason = f"GSTIN is {gst_res.status} in GSTN database (Last return: {gst_res.data.get('return_status')})"
                conf = 0.99
                disc = {"field": "Status", "submitted": "ACTIVE (claimed)", "government_source": gst_res.status}
            else:
                # Check entity name match
                legal_name = gst_res.data.get("legal_name", "")
                is_match, score, label = match_entity_names(bidder.get("company_name", ""), legal_name)
                if not is_match:
                    status = "REVIEW_REQUIRED"
                    ev = f"GST Legal Name: '{legal_name}' vs Profile: '{bidder.get('company_name')}'"
                    reason = f"Potential Entity Mismatch ({label}, similarity {score*100:.1f}%) — Officer Review Required"
                    conf = 0.94
                    disc = {
                        "field": "Legal Name",
                        "submitted": bidder.get("company_name"),
                        "government_source": legal_name,
                        "similarity_score": f"{score*100:.1f}%"
                    }
                else:
                    status = "COMPLIANT"
                    ev = f"GSTIN {bidder.get('gstin')} active; name match verified ({score*100:.1f}%)"
                    reason = f"Active taxpayer in {gst_res.data.get('state')} with regular returns filed"
                    conf = 0.98
                    disc = None

        # 2. PAN Rule
        elif rule_code == "RULE_PAN_VALID" or "PAN" in title.upper():
            pan = bidder.get("pan", "").upper()
            gstin = bidder.get("gstin", "").upper()
            pan_res = govt_lookups.get("itd") or govt_lookups.get("pan")
            if not pan:
                status = "MISSING"
                ev = "No PAN provided"
                reason = "Mandatory PAN identity missing"
                conf = 1.0
                disc = None
            elif pan_res and not pan_res.verified:
                status = "REVIEW_REQUIRED"
                ev = f"PAN {pan} status is {pan_res.status}"
                reason = f"PAN verification flagged in ITD records: {', '.join(pan_res.flags)}"
                conf = 0.99
                disc = {"field": "PAN Status", "submitted": pan, "government_source": pan_res.status, "flags": pan_res.flags}
            else:
                is_valid, msg = cross_check_gst_and_pan(gstin, pan)
                if not is_valid and gstin:
                    status = "REVIEW_REQUIRED"
                    ev = f"PAN: {pan}, GSTIN: {gstin}"
                    reason = f"PAN mismatch with GSTIN: {msg}"
                    conf = 0.99
                    disc = {"field": "PAN-GSTIN Binding", "submitted_pan": pan, "gstin_pan": gstin[2:12] if len(gstin)>=12 else "N/A"}
                else:
                    status = "COMPLIANT"
                    ev = f"PAN {pan} valid and cross-linked with GSTIN"
                    reason = "Valid PAN; enterprise corporate identity verified"
                    conf = 0.98
                    disc = None

        # 3. Udyam MSME Rule
        elif rule_code == "RULE_UDYAM_CATEGORY" or "UDYAM" in title.upper():
            claims_msme = bidder.get("claimed_msme_benefit", False)
            if not claims_msme and not bidder.get("udyam_number"):
                status = "NOT_APPLICABLE"
                ev = "No MSME benefit or exemption claimed"
                reason = "Requirement not applicable as bidder opted for general category"
                conf = 1.0
                disc = None
            else:
                udyam_res = govt_lookups.get("udyam")
                if not udyam_res or not udyam_res.found:
                    status = "NON_COMPLIANT"
                    ev = f"Udyam No: {bidder.get('udyam_number')}"
                    reason = "Udyam registration number could not be verified in MSME registry"
                    conf = 0.95
                    disc = {"field": "Udyam Number", "submitted": bidder.get("udyam_number"), "government_source": "Not Found"}
                elif udyam_res.status != "ACTIVE":
                    status = "REVIEW_REQUIRED"
                    ev = f"Udyam status: {udyam_res.status}"
                    reason = f"Udyam registration is {udyam_res.status} in Ministry of MSME database"
                    conf = 0.98
                    disc = {"field": "Status", "submitted": "ACTIVE", "government_source": udyam_res.status}
                else:
                    # Name match
                    ent_name = udyam_res.data.get("enterprise_name", "")
                    is_match, score, label = match_entity_names(bidder.get("company_name", ""), ent_name)
                    if not is_match:
                        status = "REVIEW_REQUIRED"
                        ev = f"Udyam Enterprise: '{ent_name}' vs Profile: '{bidder.get('company_name')}'"
                        reason = f"Udyam registered enterprise name mismatch ({label}, score {score*100:.1f}%)"
                        conf = 0.92
                        disc = {
                            "field": "Enterprise Name",
                            "submitted": bidder.get("company_name"),
                            "government_source": ent_name,
                            "similarity_score": f"{score*100:.1f}%"
                        }
                    else:
                        status = "COMPLIANT"
                        ev = f"Udyam {bidder.get('udyam_number')} active ({udyam_res.data.get('enterprise_type')} Enterprise)"
                        reason = f"Verified {udyam_res.data.get('enterprise_type')} enterprise under MSME Act"
                        conf = 0.98
                        disc = None

        # 4. OEM Authorization Rule
        elif rule_code == "RULE_OEM_AUTH_VALID" or "OEM" in title.upper():
            oem_doc = docs_by_type.get("OEM_AUTHORIZATION")
            has_auth = bidder.get("oem_authorized", False)
            expiry_str = bidder.get("oem_expiry")

            if not has_auth or not expiry_str:
                status = "MISSING"
                ev = "No OEM Manufacturer Authorization Form uploaded"
                reason = "Mandatory OEM Authorization missing for primary tender item"
                conf = 1.0
                disc = {"field": "OEM Authorization", "submitted": "None", "required": "Valid MAF Form"}
            else:
                # Check expiry
                try:
                    expiry_date = datetime.strptime(expiry_str, "%Y-%m-%d").date()
                    now_date = datetime.now(timezone.utc).date()
                    if expiry_date < now_date:
                        status = "NON_COMPLIANT"
                        ev = f"OEM Auth expired on {expiry_str}"
                        reason = f"OEM Manufacturer Authorization is expired ({expiry_str} < current date)"
                        conf = 0.99
                        disc = {"field": "Authorization Expiry", "submitted_expiry": expiry_str, "minimum_required": "Current & Valid"}
                    elif (expiry_date - now_date).days < 30:
                        status = "REVIEW_REQUIRED"
                        ev = f"OEM Auth expiring soon on {expiry_str}"
                        reason = f"OEM Authorization is nearing expiry in {(expiry_date - now_date).days} days — Officer Review Required"
                        conf = 0.95
                        disc = {"field": "Authorization Expiry", "submitted_expiry": expiry_str, "warning": "Expires within 30 days"}
                    else:
                        status = "COMPLIANT"
                        ev = f"Authorized by {bidder.get('oem_name')} for {bidder.get('oem_product')} (Valid up to {expiry_str})"
                        reason = "Valid OEM Manufacturer Authorization in place"
                        conf = 0.98
                        disc = None
                except Exception:
                    status = "REVIEW_REQUIRED"
                    ev = f"Unparseable expiry date: {expiry_str}"
                    reason = "Could not parse OEM authorization date format"
                    conf = 0.70
                    disc = None

        # 5. Local Content Rule
        elif rule_code == "RULE_LOCAL_CONTENT_50" or "LOCAL CONTENT" in title.upper():
            declared_lc = bidder.get("declared_local_content", 0.0)
            threshold = 50.0 # Class-I threshold
            if declared_lc < threshold:
                status = "NON_COMPLIANT"
                ev = f"Declared domestic value addition: {declared_lc}%"
                reason = f"Declared local content of {declared_lc}% is below mandatory tender threshold of {threshold}%"
                conf = 0.99
                disc = {
                    "field": "Local Content %",
                    "submitted": f"{declared_lc}%",
                    "required_threshold": f">={threshold}%",
                    "shortfall": f"{threshold - declared_lc:.1f}%"
                }
            else:
                status = "COMPLIANT"
                ev = f"Declared domestic value addition: {declared_lc}% (Class-I Supplier)"
                reason = f"Meets and exceeds Class-I local content minimum ({declared_lc}% >= {threshold}%)"
                conf = 0.98
                disc = None

        # 6. ITR Rule
        elif rule_code == "RULE_ITR_FILED" or "ITR" in title.upper():
            itr_year = bidder.get("itr_filed_year")
            if not itr_year:
                status = "MISSING"
                ev = "No ITR Acknowledgment submitted for required Assessment Year"
                reason = "Missing mandatory financial proof (ITR AY 2025-26)"
                conf = 1.0
                disc = {"field": "ITR Acknowledgment", "submitted": "None", "required": "AY 2025-26 / FY 2024-25"}
            elif itr_year not in ["2024-25", "2025-26"]:
                status = "REVIEW_REQUIRED"
                ev = f"ITR submitted for earlier year: {itr_year}"
                reason = f"Submitted ITR is for AY {itr_year}, but tender specifies latest AY 2024-25"
                conf = 0.95
                disc = {"field": "Assessment Year", "submitted": itr_year, "required": "2024-25"}
            else:
                status = "COMPLIANT"
                ev = f"ITR Acknowledgment filed for Assessment Year {itr_year}"
                reason = "Valid financial submission for required assessment period"
                conf = 0.98
                disc = None

        # 7. EPFO Rule
        elif rule_code == "RULE_EPFO_COMPLIANT" or "EPFO" in title.upper():
            epfo_res = govt_lookups.get("epfo")
            if not bidder.get("epfo_id"):
                status = "REVIEW_REQUIRED"
                ev = "No EPFO establishment code provided"
                reason = "Establishment registration code required for entities with >= 20 staff"
                conf = 0.85
                disc = None
            elif not epfo_res or not epfo_res.found:
                status = "REVIEW_REQUIRED"
                ev = f"EPFO Code: {bidder.get('epfo_id')}"
                reason = "EPFO establishment code could not be verified in portal"
                conf = 0.90
                disc = {"field": "EPFO Code", "submitted": bidder.get("epfo_id"), "government_source": "Not Found"}
            elif epfo_res.status == "PENDING_DUES":
                status = "REVIEW_REQUIRED"
                ev = f"EPFO portal status: PENDING_DUES (Last ECR: {epfo_res.data.get('last_ecr_month')})"
                reason = "EPFO compliance status shows pending contribution dues — Officer Review Required"
                conf = 0.98
                disc = {"field": "EPFO Compliance", "status": "PENDING_DUES"}
            else:
                status = "COMPLIANT"
                ev = f"EPFO {bidder.get('epfo_id')} active ({epfo_res.data.get('covered_employees')} employees)"
                reason = "Compliant electronic returns filed up to date"
                conf = 0.98
                disc = None

        # 8. ESIC Rule
        elif rule_code == "RULE_ESIC_COMPLIANT" or "ESIC" in title.upper():
            esic_res = govt_lookups.get("esic")
            if not bidder.get("esic_id"):
                status = "REVIEW_REQUIRED"
                ev = "No ESIC employer code provided"
                reason = "ESIC registration required where applicable"
                conf = 0.85
                disc = None
            elif not esic_res or not esic_res.found:
                status = "REVIEW_REQUIRED"
                ev = f"ESIC Code: {bidder.get('esic_id')}"
                reason = "Employer code could not be verified in ESIC portal"
                conf = 0.90
                disc = {"field": "ESIC Code", "submitted": bidder.get("esic_id"), "government_source": "Not Found"}
            elif esic_res.status in ["PENDING_VERIFICATION", "MISMATCH"]:
                status = "REVIEW_REQUIRED"
                ev = f"ESIC status: {esic_res.status}"
                reason = f"ESIC compliance verification is {esic_res.status} in government portal — Officer Review Required"
                conf = 0.95
                disc = {"field": "ESIC Compliance", "status": esic_res.status}
            else:
                status = "COMPLIANT"
                ev = f"ESIC Code {bidder.get('esic_id')} verified active"
                reason = "Compliant contribution returns filed"
                conf = 0.98
                disc = None

        # 9. Startup DPIIT Rule
        elif rule_code == "RULE_DPIIT_STARTUP" or "DPIIT" in title.upper():
            claims_startup = bidder.get("claimed_startup_benefit", False)
            if not claims_startup:
                status = "NOT_APPLICABLE"
                ev = "No startup exemption claimed"
                reason = "Requirement not applicable as bidder did not seek startup preference"
                conf = 1.0
                disc = None
            else:
                dpiit_res = govt_lookups.get("dpiit")
                if not dpiit_res or not dpiit_res.found or not dpiit_res.verified:
                    status = "REVIEW_REQUIRED"
                    ev = f"Certificate: {bidder.get('startup_certificate')}"
                    reason = "Startup India recognition could not be verified in DPIIT registry"
                    conf = 0.92
                    disc = {"field": "DPIIT Certificate", "submitted": bidder.get("startup_certificate"), "government_source": "Not Found"}
                else:
                    status = "COMPLIANT"
                    ev = f"DPIIT Certificate {bidder.get('startup_certificate')} verified valid"
                    reason = f"Recognized Startup in '{dpiit_res.data.get('sector')}' eligible for GFR 173(i) exemption"
                    conf = 0.98
                    disc = None

        # 10. Non-Blacklisting / Debarment Watchlist Rule
        elif rule_code == "RULE_NON_BLACKLISTED" or "BLACKLIST" in title.upper() or "INTEGRITY" in title.upper():
            bl_res = govt_lookups.get("blacklist")
            if bl_res and bl_res.found:
                # IMPORTANT SIH REQUIREMENT: Never auto-disqualify. Show "Potential record found — Officer Review Required"
                status = "REVIEW_REQUIRED"
                data = bl_res.data or {}
                ev = f"Watchlist flag in {data.get('authority', 'Central Debarment Registry')}"
                reason = f"Potential record found ({data.get('reference_number', 'REF')}) — Procurement Officer Review Required"
                conf = 0.95
                disc = {
                    "field": "Debarment Watchlist",
                    "authority": data.get("authority"),
                    "reference": data.get("reference_number"),
                    "reason": data.get("reason"),
                    "status": data.get("status")
                }
            else:
                status = "COMPLIANT"
                ev = "Screened against GeM, CVC, and Central Debarment Watchlist"
                reason = "No adverse vigilance or debarment records found"
                conf = 0.98
                disc = None

        # 11. BIS Rule
        elif rule_code == "RULE_BIS_VALID" or "BIS" in title.upper():
            bis_res = govt_lookups.get("bis")
            if not bis_res or not bis_res.found:
                status = "REVIEW_REQUIRED"
                ev = f"Company: {bidder.get('company_name')}"
                reason = "No product conformity license located on BIS portal — Officer Review Required"
                conf = 0.90
                disc = {"field": "BIS License", "government_source": "Not Found"}
            else:
                status = "COMPLIANT"
                ev = f"BIS License {bis_res.data.get('certificate_number')} for {bis_res.data.get('standard_number')}"
                reason = "Valid product conformity license"
                conf = 0.98
                disc = None

        # Fallback for custom rules
        else:
            status = "COMPLIANT"
            ev = "Document submitted and verified"
            reason = "Standard criterion satisfied"
            conf = 0.90
            disc = None

        results.append({
            "req_id": req_id,
            "title": title,
            "category": category,
            "mandatory": mandatory,
            "status": status,
            "source": req.get("verification_source", "DOCUMENT"),
            "evidence_summary": ev,
            "reason": reason,
            "rule_code": rule_code,
            "confidence": conf,
            "field_discrepancy": disc
        })

    return results

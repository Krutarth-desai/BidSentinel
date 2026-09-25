"""
backend/app/compliance_engine/risk_engine.py
Calculates procurement risk levels and categorizes individual risk factors.
Output: LOW, MEDIUM, HIGH + categorized risk factor list.
"""

from typing import List, Dict, Any, Tuple

def evaluate_risk(evaluated_requirements: List[Dict[str, Any]]) -> Tuple[str, List[Dict[str, str]]]:
    """
    Evaluates cumulative risk and extracts specific risk drivers.
    Returns (risk_level, risk_factors).
    """
    risk_factors: List[Dict[str, str]] = []
    high_count = 0
    med_count = 0
    low_count = 0

    for item in evaluated_requirements:
        title = item.get("title", "")
        status = item.get("status", "")
        mandatory = item.get("mandatory", "YES")
        disc = item.get("field_discrepancy")

        if status == "NON_COMPLIANT":
            if "LOCAL CONTENT" in title.upper():
                high_count += 1
                risk_factors.append({
                    "severity": "HIGH",
                    "factor": f"{title} Shortfall",
                    "impact": item.get("reason", "Domestic content threshold failed")
                })
            elif "OEM" in title.upper():
                high_count += 1
                risk_factors.append({
                    "severity": "HIGH",
                    "factor": "Expired or Invalid OEM Authorization",
                    "impact": item.get("reason", "OEM validity failed")
                })
            else:
                high_count += 1
                risk_factors.append({
                    "severity": "HIGH",
                    "factor": f"Failed Requirement: {title}",
                    "impact": item.get("reason", "Non-compliant condition")
                })

        elif status == "MISSING":
            if mandatory == "YES":
                high_count += 1
                risk_factors.append({
                    "severity": "HIGH",
                    "factor": f"Missing Mandatory Document: {title}",
                    "impact": "Core statutory or financial evidence absent"
                })
            else:
                low_count += 1
                risk_factors.append({
                    "severity": "LOW",
                    "factor": f"Missing Optional Submission: {title}",
                    "impact": "Exemption claim documents not provided"
                })

        elif status == "REVIEW_REQUIRED":
            if disc and "Legal Name" in str(disc):
                med_count += 1
                risk_factors.append({
                    "severity": "MEDIUM",
                    "factor": f"Entity Name Discrepancy ({title})",
                    "impact": item.get("reason", "Cross-registry name variation requires officer clarification")
                })
            elif "Watchlist" in str(disc) or "Debarment" in title:
                high_count += 1
                risk_factors.append({
                    "severity": "HIGH",
                    "factor": "Watchlist Screening Alert",
                    "impact": "Potential record located on Debarment Watchlist — Officer Review Required"
                })
            elif "expir" in item.get("reason", "").lower():
                med_count += 1
                risk_factors.append({
                    "severity": "MEDIUM",
                    "factor": f"{title} Nearing Expiry",
                    "impact": "Authorization or license will expire shortly during tender execution"
                })
            elif "dues" in item.get("reason", "").lower() or "pending" in item.get("reason", "").lower():
                med_count += 1
                risk_factors.append({
                    "severity": "MEDIUM",
                    "factor": f"Statutory Verification Pending ({title})",
                    "impact": item.get("reason", "Pending contribution or verification status in government portal")
                })
            else:
                low_count += 1
                risk_factors.append({
                    "severity": "LOW",
                    "factor": f"Verification Warning ({title})",
                    "impact": item.get("reason", "Requires officer visual inspection")
                })

    # Overall risk classification
    if high_count > 0:
        overall_risk = "HIGH"
    elif med_count >= 2:
        overall_risk = "HIGH"
    elif med_count == 1:
        overall_risk = "MEDIUM"
    elif low_count >= 2:
        overall_risk = "MEDIUM"
    else:
        overall_risk = "LOW"

    return overall_risk, risk_factors

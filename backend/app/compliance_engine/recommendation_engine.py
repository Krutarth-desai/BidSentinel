"""
backend/app/compliance_engine/recommendation_engine.py
AI Recommendation & Executive Decision-Support Synthesis.
Generates structured findings and officer advisory while upholding strict human-in-the-loop control.
"""

from typing import List, Dict, Any, Tuple

def generate_recommendation(
    evaluated_requirements: List[Dict[str, Any]],
    compliance_score: int,
    risk_level: str,
    bidder_name: str
) -> Tuple[List[str], str]:
    """
    Synthesizes findings into structured points and an officer advisory recommendation.
    Returns (findings_list, recommendation_text).
    """
    findings = []
    issues = []
    warnings = []

    for item in evaluated_requirements:
        status = item.get("status")
        title = item.get("title", "")
        ev = item.get("evidence_summary", "")

        if status == "COMPLIANT":
            findings.append(f"✓ {title}: Verified ({ev})")
        elif status == "REVIEW_REQUIRED":
            warnings.append(f"⚠ {title}: Review Required ({item.get('reason')})")
        elif status in ["NON_COMPLIANT", "MISSING"]:
            issues.append(f"✕ {title}: Non-Compliant / Missing ({item.get('reason')})")

    # Order findings: Compliant first, then warnings, then non-compliant
    all_findings = findings + warnings + issues

    # Advisory recommendation text
    if not issues and not warnings:
        advisory = (
            f"All mandatory statutory criteria and tender-specific requirements have been verified "
            f"with positive concordance across government sources. Compliance score is {compliance_score}/100 (Risk: {risk_level}). "
            f"Recommended Officer Action: Suitable for technical qualification consideration, subject to officer final concurrence."
        )
    elif issues:
        failed_items = ", ".join([i.split(":")[0].replace("✕ ", "") for i in issues])
        advisory = (
            f"Material compliance deficiencies detected regarding {failed_items}. "
            f"Compliance score is {compliance_score}/100 (Risk: {risk_level}). "
            f"Recommended Officer Action: Issue formal clarification notice or evaluate tender disqualification clauses per GeM General Terms. "
            f"Final determination remains strictly under Procurement Officer authority."
        )
    else:
        warn_items = ", ".join([w.split(":")[0].replace("⚠ ", "") for w in warnings])
        advisory = (
            f"Concordance review required regarding {warn_items}. "
            f"Compliance score is {compliance_score}/100 (Risk: {risk_level}). "
            f"Recommended Officer Action: Review submitted documentary evidence against portal records; request bidder representation if needed. "
            f"Final determination remains strictly under Procurement Officer authority."
        )

    return all_findings, advisory

"""
backend/app/compliance_engine/scoring_engine.py
Calculates structured compliance scores and dimensional breakdowns.
Statutory (25), Tender-Specific (30), Document Verification (25), Government Sources (20).
"""

from typing import List, Dict, Any

def calculate_score(evaluated_requirements: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes weighted score out of 100 with category breakdowns.
    """
    # Category totals
    statutory_items = []
    tender_items = []
    doc_items = []
    govt_items = []

    for item in evaluated_requirements:
        cat = item.get("category", "").upper()
        status = item.get("status", "UNVERIFIED")

        # Multiplier
        if status == "COMPLIANT":
            mult = 1.0
        elif status == "NOT_APPLICABLE":
            mult = 1.0
        elif status == "REVIEW_REQUIRED":
            mult = 0.5
        else: # NON_COMPLIANT, MISSING, UNVERIFIED
            mult = 0.0

        if cat in ["STATUTORY", "ELIGIBILITY"]:
            statutory_items.append(mult)
        elif cat in ["TENDER_SPECIFIC", "MAKE_IN_INDIA", "TECHNICAL"]:
            tender_items.append(mult)
        elif cat in ["FINANCIAL", "DOCUMENT"]:
            doc_items.append(mult)
        else:
            govt_items.append(mult)

    # Calculate dimensional scores
    def avg_score(items, max_val):
        if not items:
            return float(max_val)
        return round((sum(items) / len(items)) * max_val, 1)

    statutory_score = avg_score(statutory_items, 25.0)
    tender_score = avg_score(tender_items, 30.0)
    doc_score = avg_score(doc_items, 25.0)
    govt_score = avg_score(govt_items, 20.0)

    total_score = int(round(statutory_score + tender_score + doc_score + govt_score))
    total_score = max(0, min(100, total_score))

    return {
        "total_score": total_score,
        "max_score": 100,
        "statutory": statutory_score,
        "statutory_max": 25.0,
        "tender_specific": tender_score,
        "tender_specific_max": 30.0,
        "document_verification": doc_score,
        "document_verification_max": 25.0,
        "govt_verification": govt_score,
        "govt_verification_max": 20.0
    }

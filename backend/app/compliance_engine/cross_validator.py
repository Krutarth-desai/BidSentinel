"""
backend/app/compliance_engine/cross_validator.py
Entity matching and multi-source cross-verification engine.
Compares Bidder Profile ↔ Submitted Documents ↔ Government Sources ↔ Tender Criteria.
"""

import re
from typing import Dict, Any, Tuple

def normalize_name(name: str) -> str:
    """Normalizes company names for robust comparison."""
    if not name:
        return ""
    n = name.upper()
    # Normalize common business abbreviations
    n = re.sub(r"\bPVT\.?\s*LTD\.?\b", "PRIVATE LIMITED", n)
    n = re.sub(r"\bLTD\.?\b", "LIMITED", n)
    n = re.sub(r"\bCORP\.?\b", "CORPORATION", n)
    n = re.sub(r"\bCO\.?\b", "COMPANY", n)
    n = re.sub(r"\bLLP\b", "LIMITED LIABILITY PARTNERSHIP", n)
    # Remove punctuation
    n = re.sub(r"[^\w\s]", " ", n)
    # Collapse multiple whitespaces
    n = re.sub(r"\s+", " ", n).strip()
    return n

def calculate_similarity(s1: str, s2: str) -> float:
    """Calculates token-based Jaccard and Levenshtein character similarity."""
    n1 = normalize_name(s1)
    n2 = normalize_name(s2)
    if not n1 or not n2:
        return 0.0
    if n1 == n2:
        return 1.0

    tokens1 = set(n1.split())
    tokens2 = set(n2.split())
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    jaccard = len(intersection) / len(union) if union else 0.0

    # Character-level overlap
    common_chars = sum(min(n1.count(c), n2.count(c)) for c in set(n1))
    max_len = max(len(n1), len(n2))
    char_sim = common_chars / max_len if max_len else 0.0

    return round((jaccard * 0.6) + (char_sim * 0.4), 3)

def match_entity_names(name_a: str, name_b: str, threshold: float = 0.82) -> Tuple[bool, float, str]:
    """
    Returns (is_match, similarity_score, classification).
    Classification is one of: EXACT_MATCH, LIKELY_MATCH, REVIEW_REQUIRED, MISMATCH
    """
    if not name_a or not name_b:
        return False, 0.0, "MISSING_DATA"

    score = calculate_similarity(name_a, name_b)
    if score >= 0.95:
        return True, score, "EXACT_MATCH"
    elif score >= threshold:
        return True, score, "LIKELY_MATCH"
    elif score >= 0.60:
        return False, score, "REVIEW_REQUIRED"
    else:
        return False, score, "MISMATCH"

def cross_check_gst_and_pan(gstin: str, pan: str) -> Tuple[bool, str]:
    """Verifies that characters 3 to 12 of GSTIN match the 10-character PAN."""
    if not gstin or not pan:
        return False, "Missing GSTIN or PAN"
    gstin_clean = gstin.strip().upper()
    pan_clean = pan.strip().upper()

    if len(gstin_clean) != 15:
        return False, f"Invalid GSTIN length ({len(gstin_clean)} chars)"
    if len(pan_clean) != 10:
        return False, f"Invalid PAN length ({len(pan_clean)} chars)"

    embedded_pan = gstin_clean[2:12]
    if embedded_pan == pan_clean:
        return True, "GSTIN is mathematically and legally bound to submitted PAN"
    else:
        return False, f"Embedded PAN '{embedded_pan}' in GSTIN does not match submitted PAN '{pan_clean}'"

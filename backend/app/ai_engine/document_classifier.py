"""
backend/app/ai_engine/document_classifier.py
AI / Heuristic Document Classifier for BidSentinel.
Classifies incoming bidder documents into standardized procurement categories.
"""

import re
from typing import Tuple, Dict

DOCUMENT_PATTERNS: Dict[str, list] = {
    "GST_CERTIFICATE": [
        r"goods and services tax", r"gstin", r"form gst reg-06", r"registration certificate",
        r"taxpayer identification", r"government of india.*gst"
    ],
    "PAN_CARD": [
        r"income tax department", r"permanent account number", r"pan card", r"govt\. of india.*income tax"
    ],
    "UDYAM_CERTIFICATE": [
        r"udyam registration certificate", r"ministry of micro, small and medium enterprises",
        r"udyam-\w{2}-\d{2}-\d+", r"enterprise type", r"msme"
    ],
    "OEM_AUTHORIZATION": [
        r"manufacturer authorization", r"oem authorization", r"manufacturer['’]s authorization form",
        r"authorized distributor", r"authorization letter", r"we hereby authorize"
    ],
    "LOCAL_CONTENT_DECLARATION": [
        r"local content declaration", r"make in india", r"preference to make in india",
        r"percentage of local content", r"class-i local supplier", r"public procurement preference"
    ],
    "ITR_ACKNOWLEDGMENT": [
        r"indian income tax return", r"itr-v", r"acknowledgement.*income tax",
        r"assessment year", r"verification form", r"total income"
    ],
    "EPFO_ECR": [
        r"employees['’]? provident fund", r"electronic challan cum return", r"ecr",
        r"establishment code", r"epfo"
    ],
    "ESIC_CHALLAN": [
        r"employees['’]? state insurance", r"esic", r"monthly contribution details",
        r"employer code"
    ],
    "DPIIT_STARTUP_CERTIFICATE": [
        r"department for promotion of industry and internal trade", r"dpiit",
        r"certificate of recognition", r"startup india"
    ],
    "NSIC_CERTIFICATE": [
        r"national small industries corporation", r"nsic", r"single point registration",
        r"sprs"
    ],
    "BIS_CERTIFICATE": [
        r"bureau of indian standards", r"bis", r"standard mark", r"isi mark",
        r"conformity assessment"
    ],
    "NON_BLACKLISTING_DECLARATION": [
        r"non-blacklisting", r"integrity pact", r"debarment declaration",
        r"not been blacklisted", r"never been banned"
    ]
}

def classify_document(text: str, filename: str = "") -> Tuple[str, float]:
    """
    Classifies a document based on text content and optional filename clues.
    Returns (document_type, confidence).
    """
    normalized_text = (text + " " + filename).lower()
    
    # Priority filename matching
    fn_lower = filename.lower()
    if "gst" in fn_lower:
        return "GST_CERTIFICATE", 0.95
    if "udyam" in fn_lower or "msme" in fn_lower:
        return "UDYAM_CERTIFICATE", 0.95
    if "oem" in fn_lower or "maf" in fn_lower or "authorization" in fn_lower:
        return "OEM_AUTHORIZATION", 0.95
    if "local_content" in fn_lower or "mii" in fn_lower:
        return "LOCAL_CONTENT_DECLARATION", 0.95
    if "itr" in fn_lower:
        return "ITR_ACKNOWLEDGMENT", 0.95
    if "pan" in fn_lower:
        return "PAN_CARD", 0.95
    if "dpiit" in fn_lower or "startup" in fn_lower:
        return "DPIIT_STARTUP_CERTIFICATE", 0.95
    if "nsic" in fn_lower:
        return "NSIC_CERTIFICATE", 0.95
    if "epfo" in fn_lower:
        return "EPFO_ECR", 0.95
    if "esic" in fn_lower:
        return "ESIC_CHALLAN", 0.95
    if "bis" in fn_lower:
        return "BIS_CERTIFICATE", 0.95
    if "blacklist" in fn_lower or "debar" in fn_lower:
        return "NON_BLACKLISTING_DECLARATION", 0.95

    best_type = "OTHER"
    highest_score = 0

    for doc_type, patterns in DOCUMENT_PATTERNS.items():
        score = 0
        for pattern in patterns:
            matches = len(re.findall(pattern, normalized_text))
            score += matches
        if score > highest_score:
            highest_score = score
            best_type = doc_type

    confidence = min(0.99, max(0.60, highest_score * 0.25)) if highest_score > 0 else 0.50
    return best_type, confidence

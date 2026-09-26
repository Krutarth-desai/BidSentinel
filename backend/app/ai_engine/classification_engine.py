"""
backend/app/ai_engine/classification_engine.py
Layered Document Classification Engine (Phase 3).

Layer 1: Filename / Metadata Signals
Layer 2: Text Keyword / Pattern Signals & Evidence Snippet Extraction
Layer 3: Document Layout / Structural Signals
Layer 4: Modular AI/ML Hook (Extensible Interface)
Layer 5: Confidence Aggregation & Thresholding
Layer 6: Human Review Fallback Triggers

Security Note: Extracted document text is treated purely as data.
Prompt injection tokens are safely ignored and never executed.
"""

import re
from typing import Dict, Any, List, Tuple, Optional
from app.ai_engine.classification_rules import CLASSIFICATION_RULES, normalize_category_name

# Prompt Injection Defense Filter (Sanitizes control tokens from raw text during pattern matching)
PROMPT_INJECTION_TOKENS = [
    r"ignore previous instructions",
    r"ignore all prior instructions",
    r"system prompt override",
    r"you are now an ai",
    r"disregard safety guidelines",
    r"eval\(", r"exec\("
]


def sanitize_text_input(text: str) -> str:
    """
    Security Barrier: Neutralizes potential prompt injection strings in document text.
    Treats document content strictly as passive untrusted data text.
    """
    if not text:
        return ""
    clean_text = text
    for token_pattern in PROMPT_INJECTION_TOKENS:
        clean_text = re.sub(token_pattern, "[SECURITY_FILTERED]", clean_text, flags=re.IGNORECASE)
    return clean_text


def layer1_filename_signals(filename: str) -> Tuple[Dict[str, float], List[Dict[str, Any]]]:
    """
    Layer 1: Evaluates filename clues and extension patterns.
    Returns (candidate_scores, evidence_list)
    """
    fn_lower = filename.lower()
    scores: Dict[str, float] = {}
    evidence: List[Dict[str, Any]] = []

    for doc_type, rule in CLASSIFICATION_RULES.items():
        if doc_type == "UNKNOWN_DOCUMENT":
            continue
        patterns = rule.get("filename_patterns", [])
        for pat in patterns:
            if re.search(pat, fn_lower):
                scores[doc_type] = scores.get(doc_type, 0.0) + 0.45
                evidence.append({
                    "layer": "Layer 1 (Filename Signal)",
                    "page": 1,
                    "matched_term": fn_lower,
                    "pattern": pat,
                    "text": f"Filename '{filename}' matched signal pattern '{pat}'"
                })

    return scores, evidence


def layer2_text_signals(text: str) -> Tuple[Dict[str, float], List[Dict[str, Any]], Dict[int, str]]:
    """
    Layer 2: Scans text content / Phase 2 evidence for weighted keyword/regex patterns.
    Collects text evidence snippets with page references.
    Returns (candidate_scores, evidence_list, page_text_map)
    """
    safe_text = sanitize_text_input(text)
    scores: Dict[str, float] = {}
    evidence: List[Dict[str, Any]] = []

    # Split text into pages if page markers exist (e.g. --- Page X ---)
    pages = re.split(r"---?\s*Page\s*(\d+)\s*---?", safe_text, flags=re.IGNORECASE)
    page_map: Dict[int, str] = {}

    if len(pages) > 1:
        current_page = 1
        for i in range(1, len(pages), 2):
            try:
                pg_num = int(pages[i])
            except ValueError:
                pg_num = current_page
            pg_text = pages[i + 1] if i + 1 < len(pages) else ""
            page_map[pg_num] = pg_text
            current_page = pg_num + 1
    else:
        page_map[1] = safe_text

    for pg_num, pg_text in page_map.items():
        pg_text_lower = pg_text.lower()
        for doc_type, rule in CLASSIFICATION_RULES.items():
            if doc_type == "UNKNOWN_DOCUMENT":
                continue
            keywords = rule.get("keywords", [])
            for kw_pattern in keywords:
                matches = list(re.finditer(kw_pattern, pg_text_lower, flags=re.IGNORECASE))
                if matches:
                    weight = rule.get("weight", 1.0)
                    added_score = min(0.60, len(matches) * 0.25 * weight)
                    scores[doc_type] = scores.get(doc_type, 0.0) + added_score

                    # Extract context snippet around match
                    match = matches[0]
                    start = max(0, match.start() - 30)
                    end = min(len(pg_text), match.end() + 50)
                    snippet = pg_text[start:end].replace("\n", " ").strip()

                    evidence.append({
                        "layer": "Layer 2 (Text Keyword Signal)",
                        "page": pg_num,
                        "matched_term": match.group(0),
                        "pattern": kw_pattern,
                        "text": f"...{snippet}...",
                        "bbox": None
                    })

    return scores, evidence, page_map


def layer3_structure_signals(text: str, filename: str) -> Tuple[Dict[str, float], List[Dict[str, Any]]]:
    """
    Layer 3: Evaluates document structure and layout markers.
    Returns (candidate_scores, evidence_list)
    """
    safe_text = sanitize_text_input(text).lower()
    scores: Dict[str, float] = {}
    evidence: List[Dict[str, Any]] = []

    structural_markers = {
        "GST_CERTIFICATE": (r"form gst reg-06", 0.30, "Official Form GST REG-06 header detected"),
        "UDYAM_CERTIFICATE": (r"udyam registration certificate", 0.30, "Official Udyam heading layout detected"),
        "PAN_CERTIFICATE": (r"income tax department", 0.25, "Official Income Tax Department header layout"),
        "STARTUP_INDIA_CERTIFICATE": (r"certificate of recognition", 0.25, "Startup India recognition header structure"),
        "EPFO_DOCUMENT": (r"electronic challan cum return", 0.30, "Official EPFO ECR challan header layout"),
        "ESIC_DOCUMENT": (r"monthly contribution details", 0.30, "Official ESIC contribution statement layout"),
        "OEM_AUTHORIZATION": (r"we hereby authorize", 0.25, "Standard OEM authorization clause structure"),
        "LOCAL_CONTENT_DECLARATION": (r"percentage of local content", 0.25, "MII local content calculation structure"),
        "AUDITED_FINANCIAL_STATEMENT": (r"independent auditor['’]?s report", 0.30, "Independent Auditor's Report header structure")
    }

    for doc_type, (pattern, weight, desc) in structural_markers.items():
        if re.search(pattern, safe_text):
            scores[doc_type] = scores.get(doc_type, 0.0) + weight
            evidence.append({
                "layer": "Layer 3 (Structural Signal)",
                "page": 1,
                "matched_term": pattern,
                "pattern": pattern,
                "text": desc
            })

    return scores, evidence


def layer4_ml_hook(text: str, filename: str) -> Tuple[Dict[str, float], List[Dict[str, Any]]]:
    """
    Layer 4: Modular AI/ML Hook.
    Extensible interface for future ML/VLM classifiers.
    Currently returns empty dict allowing seamless future extension.
    """
    return {}, []


def compute_section_breakdown(page_map: Dict[int, str], filename: str) -> List[Dict[str, Any]]:
    """
    Computes section-level classification breakdown for multi-page documents (Section 9).
    """
    sections: List[Dict[str, Any]] = []

    for pg_num, pg_text in page_map.items():
        pg_scores, pg_ev, _ = layer2_text_signals(pg_text)
        fn_scores, _ = layer1_filename_signals(filename)

        combined_scores: Dict[str, float] = {}
        for dt, s in pg_scores.items():
            combined_scores[dt] = combined_scores.get(dt, 0.0) + s
        for dt, s in fn_scores.items():
            combined_scores[dt] = combined_scores.get(dt, 0.0) + (s * 0.3)

        if combined_scores:
            best_type = max(combined_scores.items(), key=lambda x: x[1])[0]
            score = min(0.99, max(0.50, combined_scores[best_type]))
        else:
            best_type = "UNKNOWN_DOCUMENT"
            score = 0.50

        sections.append({
            "start_page": pg_num,
            "end_page": pg_num,
            "document_type": normalize_category_name(best_type),
            "confidence": round(score, 2)
        })

    return sections


def classify_document_multi_layer(
    text: str,
    filename: str = "",
    document_id: str = ""
) -> Dict[str, Any]:
    """
    Phase 3 Multi-Layer Document Classification Entry Point.
    Processes Layer 1 through Layer 6.
    """
    # 1. Gather Layer Scores & Evidence Snippets
    l1_scores, l1_ev = layer1_filename_signals(filename)
    l2_scores, l2_ev, page_map = layer2_text_signals(text)
    l3_scores, l3_ev = layer3_structure_signals(text, filename)
    l4_scores, l4_ev = layer4_ml_hook(text, filename)

    # 2. Layer 5: Aggregate Confidence Scores across Layers
    aggregated_scores: Dict[str, float] = {}
    all_evidence = l1_ev + l2_ev + l3_ev + l4_ev

    for doc_type in CLASSIFICATION_RULES.keys():
        if doc_type == "UNKNOWN_DOCUMENT":
            continue
        s1 = l1_scores.get(doc_type, 0.0)
        s2 = l2_scores.get(doc_type, 0.0)
        s3 = l3_scores.get(doc_type, 0.0)
        s4 = l4_scores.get(doc_type, 0.0)

        # Weighted combination across layers
        total_raw = (s1 * 0.40) + (s2 * 0.50) + (s3 * 0.20) + (s4 * 0.0)

        # Bonus if filename signal and text signal concur
        if s1 > 0 and s2 > 0:
            total_raw += 0.25

        if total_raw > 0:
            confidence = min(0.99, max(0.40, 0.60 + total_raw * 0.40))
            aggregated_scores[doc_type] = round(confidence, 2)

    # Sort candidates by confidence
    sorted_candidates = sorted(aggregated_scores.items(), key=lambda x: x[1], reverse=True)

    if not sorted_candidates:
        predicted_type = "UNKNOWN_DOCUMENT"
        top_confidence = 0.30
        alternatives = []
    else:
        predicted_type = sorted_candidates[0][0]
        top_confidence = sorted_candidates[0][1]
        alternatives = [
            {"type": normalize_category_name(dt), "confidence": conf}
            for dt, conf in sorted_candidates[1:4]
        ]

    predicted_type_norm = normalize_category_name(predicted_type)

    # Determine Confidence Level
    if top_confidence >= 0.90:
        confidence_level = "HIGH_CONFIDENCE"
    elif top_confidence >= 0.70:
        confidence_level = "MEDIUM_CONFIDENCE"
    else:
        confidence_level = "LOW_CONFIDENCE"

    # 3. Layer 6: Human Review Fallback Triggers
    review_required = False
    review_reasons = []

    if top_confidence < 0.70:
        review_required = True
        review_reasons.append("Classification confidence below threshold (0.70).")

    if predicted_type_norm == "UNKNOWN_DOCUMENT":
        review_required = True
        review_reasons.append("Evidence is insufficient to classify document type.")

    # Check for score ambiguity among top 2 candidates
    if len(sorted_candidates) >= 2:
        diff = sorted_candidates[0][1] - sorted_candidates[1][1]
        if diff < 0.15 and top_confidence < 0.90:
            review_required = True
            review_reasons.append(f"Ambiguous top candidates between {sorted_candidates[0][0]} and {sorted_candidates[1][0]} (score gap: {round(diff, 2)}).")

    # Check for filename vs text conflict
    if l1_scores and l2_scores:
        top_fn = max(l1_scores.items(), key=lambda x: x[1])[0]
        top_txt = max(l2_scores.items(), key=lambda x: x[1])[0]
        if top_fn != top_txt and top_confidence < 0.88:
            review_required = True
            review_reasons.append(f"Conflicting signals between filename ({top_fn}) and text content ({top_txt}).")

    classification_status = "REVIEW_REQUIRED" if review_required else "CLASSIFIED"

    # Multi-page section breakdown
    section_breakdown = compute_section_breakdown(page_map, filename) if len(page_map) > 1 else []

    return {
        "document_id": document_id,
        "predicted_type": predicted_type_norm,
        "confidence": top_confidence,
        "confidence_level": confidence_level,
        "classification_method": "RULE_BASED",
        "classification_status": classification_status,
        "alternatives": alternatives,
        "evidence": all_evidence[:10],
        "section_breakdown": section_breakdown,
        "review_reasons": review_reasons,
        "model_version": "v1.0.0-phase3"
    }

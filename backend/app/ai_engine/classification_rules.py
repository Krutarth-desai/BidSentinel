"""
backend/app/ai_engine/classification_rules.py
Configurable Rule Registry and Terminology Map for Intelligent Document Classification.
Supports procurement document categories as specified in Phase 3.
"""

from typing import Dict, List, Any

# Standardized Category Definitions and Weighted Keywords
CLASSIFICATION_RULES: Dict[str, Dict[str, Any]] = {
    # ── 1. IDENTITY / REGISTRATION ─────────────────────────────────────────────
    "PAN_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"permanent account number", r"income tax department", r"pan card",
            r"govt\.? of india.*income tax", r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
        ],
        "filename_patterns": [r"pan", r"pan_card", r"pan_certificate"]
    },
    "GST_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"goods and services tax", r"gstin", r"form gst reg-06", r"registration certificate",
            r"taxpayer identification", r"government of india.*gst", r"gstin/uin"
        ],
        "filename_patterns": [r"gst", r"gst_certificate", r"gst_reg"]
    },
    "UDYAM_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"udyam registration certificate", r"ministry of micro, small and medium enterprises",
            r"udyam-\w{2}-\d{2}-\d+", r"udyam registration number", r"msme registration", r"enterprise type"
        ],
        "filename_patterns": [r"udyam", r"msme"]
    },
    "CIN_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"certificate of incorporation", r"corporate identity number", r"cin",
            r"registrar of companies", r"ministry of corporate affairs", r"mca21"
        ],
        "filename_patterns": [r"cin", r"incorporation", r"mca"]
    },
    "STARTUP_INDIA_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"department for promotion of industry and internal trade", r"dpiit",
            r"certificate of recognition", r"startup india", r"dipp\d+"
        ],
        "filename_patterns": [r"startup", r"dpiit", r"dipp"]
    },
    "NSIC_CERTIFICATE": {
        "category": "IDENTITY / REGISTRATION",
        "weight": 1.0,
        "keywords": [
            r"national small industries corporation", r"nsic", r"single point registration",
            r"sprs", r"monetary limit"
        ],
        "filename_patterns": [r"nsic", r"sprs"]
    },

    # ── 2. TAX / FINANCIAL ─────────────────────────────────────────────────────
    "INCOME_TAX_RETURN": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"indian income tax return", r"itr-v", r"acknowledgement.*income tax",
            r"assessment year", r"verification form", r"total income", r"itr"
        ],
        "filename_patterns": [r"itr", r"tax_return", r"income_tax"]
    },
    "INCOME_TAX_COMPLIANCE": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"tax clearance certificate", r"income tax clearance", r"section 194n",
            r"form 26as", r"tax compliance certificate"
        ],
        "filename_patterns": [r"it_clearance", r"tax_compliance"]
    },
    "GST_RETURN": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"gstr-1", r"gstr-3b", r"gstr-9", r"gst return summary", r"tax payment receipt"
        ],
        "filename_patterns": [r"gstr", r"gst_return"]
    },
    "AUDITED_FINANCIAL_STATEMENT": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"independent auditor['’]?s report", r"audited financial statements",
            r"chartered accountant", r"notes to financial statements", r"auditor['’]?s opinion"
        ],
        "filename_patterns": [r"audited", r"financials", r"ca_report"]
    },
    "BALANCE_SHEET": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"balance sheet", r"statement of financial position", r"assets and liabilities",
            r"equity and liabilities", r"non-current assets"
        ],
        "filename_patterns": [r"balance_sheet", r"bs"]
    },
    "PROFIT_LOSS_STATEMENT": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"profit and loss statement", r"statement of profit and loss", r"income statement",
            r"total revenue", r"operating expenses"
        ],
        "filename_patterns": [r"profit_loss", r"pnl", r"p_and_l"]
    },
    "TURNOVER_CERTIFICATE": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"turnover certificate", r"annual turnover", r"gross turnover",
            r"ca certificate turnover", r"average annual turnover"
        ],
        "filename_patterns": [r"turnover", r"turnover_cert"]
    },
    "BANK_CERTIFICATE": {
        "category": "TAX / FINANCIAL",
        "weight": 1.0,
        "keywords": [
            r"bank certificate", r"solvency certificate", r"bank guarantee",
            r"account statement", r"bank confirmation letter"
        ],
        "filename_patterns": [r"bank", r"solvency", r"bank_guarantee"]
    },

    # ── 3. LABOUR ──────────────────────────────────────────────────────────────
    "EPFO_DOCUMENT": {
        "category": "LABOUR",
        "weight": 1.0,
        "keywords": [
            r"employees['’]? provident fund", r"electronic challan cum return", r"ecr",
            r"establishment code", r"epfo", r"universal account number"
        ],
        "filename_patterns": [r"epfo", r"ecr", r"pf"]
    },
    "ESIC_DOCUMENT": {
        "category": "LABOUR",
        "weight": 1.0,
        "keywords": [
            r"employees['’]? state insurance", r"esic", r"monthly contribution details",
            r"employer code", r"esi challan"
        ],
        "filename_patterns": [r"esic", r"esi"]
    },
    "EPF_COMPLIANCE_CERTIFICATE": {
        "category": "LABOUR",
        "weight": 1.0,
        "keywords": [
            r"epf compliance certificate", r"provident fund clearance", r"no dues certificate epfo"
        ],
        "filename_patterns": [r"epf_compliance", r"pf_clearance"]
    },
    "ESIC_COMPLIANCE_CERTIFICATE": {
        "category": "LABOUR",
        "weight": 1.0,
        "keywords": [
            r"esic compliance certificate", r"esi clearance certificate", r"no dues certificate esic"
        ],
        "filename_patterns": [r"esic_compliance", r"esi_clearance"]
    },

    # ── 4. PROCUREMENT ─────────────────────────────────────────────────────────
    "BID_DOCUMENT": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"tender document", r"notice inviting tender", r"nit", r"invitation for bids",
            r"gem bid", r"bidding document"
        ],
        "filename_patterns": [r"bid_document", r"tender", r"nit"]
    },
    "TECHNICAL_BID": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"technical bid", r"technical proposal", r"technical specifications",
            r"specification sheet", r"compliance matrix"
        ],
        "filename_patterns": [r"technical", r"tech_bid"]
    },
    "FINANCIAL_BID": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"financial bid", r"price bid", r"bill of quantities", r"boq",
            r"financial proposal", r"price schedule"
        ],
        "filename_patterns": [r"financial", r"price_bid", r"boq"]
    },
    "OEM_AUTHORIZATION": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"manufacturer authorization", r"oem authorization", r"manufacturer['’]?s authorization form",
            r"authorized distributor", r"authorization letter", r"we hereby authorize"
        ],
        "filename_patterns": [r"oem", r"maf", r"authorization"]
    },
    "EXPERIENCE_CERTIFICATE": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"experience certificate", r"past performance", r"track record",
            r"client performance certificate", r"satisfactory completion"
        ],
        "filename_patterns": [r"experience", r"performance", r"track_record"]
    },
    "WORK_ORDER": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"work order", r"letter of award", r"loa", r"award of contract"
        ],
        "filename_patterns": [r"work_order", r"loa"]
    },
    "PURCHASE_ORDER": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"purchase order", r"po number", r"supply order"
        ],
        "filename_patterns": [r"purchase_order", r"po"]
    },
    "COMPLETION_CERTIFICATE": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"work completion certificate", r"completion certificate", r"successfully commissioned",
            r"taking over certificate"
        ],
        "filename_patterns": [r"completion", r"commissioning"]
    },
    "LOCAL_CONTENT_DECLARATION": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"local content declaration", r"make in india", r"preference to make in india",
            r"percentage of local content", r"class-i local supplier", r"public procurement preference"
        ],
        "filename_patterns": [r"local_content", r"mii", r"make_in_india"]
    },
    "MANUFACTURER_DECLARATION": {
        "category": "PROCUREMENT",
        "weight": 1.0,
        "keywords": [
            r"manufacturer declaration", r"factory inspection certificate", r"production capacity declaration"
        ],
        "filename_patterns": [r"manufacturer_declaration"]
    },

    # ── 5. LEGAL / ELIGIBILITY ─────────────────────────────────────────────────
    "AFFIDAVIT": {
        "category": "LEGAL / ELIGIBILITY",
        "weight": 1.0,
        "keywords": [
            r"affidavit", r"sworn statement", r"notary public", r"solemnly affirm"
        ],
        "filename_patterns": [r"affidavit", r"sworn"]
    },
    "DECLARATION": {
        "category": "LEGAL / ELIGIBILITY",
        "weight": 1.0,
        "keywords": [
            r"self declaration", r"declaration form", r"general declaration"
        ],
        "filename_patterns": [r"declaration"]
    },
    "UNDERTAKING": {
        "category": "LEGAL / ELIGIBILITY",
        "weight": 1.0,
        "keywords": [
            r"undertaking", r"we hereby undertake", r"solemn undertaking"
        ],
        "filename_patterns": [r"undertaking"]
    },
    "NON_BLACKLISTING_DECLARATION": {
        "category": "LEGAL / ELIGIBILITY",
        "weight": 1.0,
        "keywords": [
            r"non-blacklisting", r"integrity pact", r"debarment declaration",
            r"not been blacklisted", r"never been banned"
        ],
        "filename_patterns": [r"blacklist", r"non_blacklisting", r"debarment"]
    },
    "AUTHORIZATION_LETTER": {
        "category": "LEGAL / ELIGIBILITY",
        "weight": 1.0,
        "keywords": [
            r"letter of authority", r"power of attorney", r"board resolution authorization"
        ],
        "filename_patterns": [r"authorization_letter", r"poa"]
    },

    # ── 6. DIGITAL / AUTHENTICITY ──────────────────────────────────────────────
    "DIGILOCKER_DOCUMENT": {
        "category": "DIGITAL / AUTHENTICITY",
        "weight": 1.0,
        "keywords": [
            r"digilocker verified", r"issued by digilocker", r"digital locker"
        ],
        "filename_patterns": [r"digilocker"]
    },
    "DIGITAL_CERTIFICATE": {
        "category": "DIGITAL / AUTHENTICITY",
        "weight": 1.0,
        "keywords": [
            r"digital certificate", r"x\.509", r"public key certificate"
        ],
        "filename_patterns": [r"digital_cert"]
    },
    "DIGITAL_SIGNATURE_DOC": {
        "category": "DIGITAL / AUTHENTICITY",
        "weight": 1.0,
        "keywords": [
            r"digitally signed", r"digital signature certificate", r"esign"
        ],
        "filename_patterns": [r"dsc", r"esign", r"signature"]
    },

    # ── 7. OTHER ───────────────────────────────────────────────────────────────
    "COVER_LETTER": {
        "category": "OTHER",
        "weight": 1.0,
        "keywords": [
            r"covering letter", r"cover letter", r"submission letter"
        ],
        "filename_patterns": [r"cover", r"covering_letter"]
    },
    "SUPPORTING_DOCUMENT": {
        "category": "OTHER",
        "weight": 1.0,
        "keywords": [
            r"supporting document", r"annexure", r"attachment"
        ],
        "filename_patterns": [r"annexure", r"supporting"]
    },
    "UNKNOWN_DOCUMENT": {
        "category": "OTHER",
        "weight": 0.0,
        "keywords": [],
        "filename_patterns": []
    }
}

# Mapping legacy document types to standard Phase 3 category names
SYNONYM_MAP: Dict[str, str] = {
    "PAN_CARD": "PAN_CERTIFICATE",
    "ITR_ACKNOWLEDGMENT": "INCOME_TAX_RETURN",
    "EPFO_ECR": "EPFO_DOCUMENT",
    "ESIC_CHALLAN": "ESIC_DOCUMENT",
    "DPIIT_STARTUP_CERTIFICATE": "STARTUP_INDIA_CERTIFICATE",
    "BIS_CERTIFICATE": "SUPPORTING_DOCUMENT",
    "STATUTORY_DECLARATION": "DECLARATION",
    "INCORPORATION_CERTIFICATE": "CIN_CERTIFICATE"
}


def normalize_category_name(category: str) -> str:
    """Normalizes category name applying synonym mappings."""
    if not category:
        return "UNKNOWN_DOCUMENT"
    cat_upper = category.upper().strip()
    return SYNONYM_MAP.get(cat_upper, cat_upper)

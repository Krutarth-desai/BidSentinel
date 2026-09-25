"""
scripts/generate_mock_data.py
Generates comprehensive synthetic demo data for BidSentinel.
Reads raw dataset CSVs (udyam.csv, tenders.csv, pan.csv, dpiit.csv)
and exports synchronized JSON datasets into data/ directory.
"""

import csv
import json
from pathlib import Path
from typing import Dict, Any, List

ROOT_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

STATE_CODE_MAP = {
    "MAHARASHTRA": "27",
    "KARNATAKA": "29",
    "TAMIL NADU": "33",
    "DELHI": "07",
    "NEW DELHI": "07",
    "RAJASTHAN": "08",
    "TELANGANA": "36",
    "GUJARAT": "24",
    "KERALA": "32",
    "MADHYA PRADESH": "23",
    "HARYANA": "06",
    "WEST BENGAL": "19",
    "PUNJAB": "03",
    "BIHAR": "10",
    "ASSAM": "18",
    "JHARKHAND": "20",
    "CHHATTISGARH": "22",
    "MEGHALAYA": "17",
    "HIMACHAL PRADESH": "02",
    "UTTARAKHAND": "05",
    "GOA": "30",
    "SIKKIM": "11",
    "NAGALAND": "13",
    "ANDHRA PRADESH": "37",
    "UTTAR PRADESH": "09",
    "ODISHA": "21",
    "PAN INDIA": "07",
    "KERALA & AP": "32"
}

STATE_CODE_TO_EPFO_PREFIX = {
    "27": "MHPUN",
    "29": "KABAN",
    "33": "TNMAD",
    "07": "DLCPM",
    "08": "RJJAI",
    "36": "TSHYD",
    "24": "GJAHM",
    "32": "KLKOC",
    "23": "MPBHO",
    "06": "HRGUR",
    "19": "WBKOL",
    "03": "PBLUD",
    "10": "BRPAT",
    "18": "ASGHY",
    "20": "JHRAN",
    "22": "CGRAI",
    "17": "MLSHL",
    "02": "HPSHI",
    "05": "UKDEH",
    "30": "GAPNJ",
    "11": "SKGTK",
    "13": "NLDMR",
    "37": "APVZG",
    "09": "UPKAN",
    "21": "ORBBS"
}

NON_UDYAM_INFO = {
    "BID003": {"state": "Maharashtra", "district": "Mumbai", "nic": "2811"},
    "BID008": {"state": "Delhi", "district": "New Delhi", "nic": "4100"},
    "BID011": {"state": "Karnataka", "district": "Bengaluru", "nic": "3040"},
    "BID014": {"state": "Delhi", "district": "New Delhi", "nic": "2711"},
    "BID021": {"state": "Kerala", "district": "Kochi", "nic": "3011"},
    "BID023": {"state": "Odisha", "district": "Bhubaneswar", "nic": "0710"},
    "BID030": {"state": "Gujarat", "district": "Surat", "nic": "2593"},
    "BID047": {"state": "Uttar Pradesh", "district": "Kanpur", "nic": "1511"},
    "BID050": {"state": "Delhi", "district": "New Delhi", "nic": "4210"},
}

def load_csv(filename: str) -> List[Dict[str, str]]:
    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise FileNotFoundError(f"Missing required CSV: {filepath}")
    with open(filepath, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))

def generate_tenders(tenders_csv_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    result = []
    for r in tenders_csv_rows:
        tid = r["tender_id"].strip()
        val_cr = float(r.get("estimated_value_cr", 10.0))
        t_obj = {
            "tender_id": tid,
            "title": r["tender_title"].strip(),
            "reference_number": r["tender_reference"].strip(),
            "department": r["cpse_name"].strip(),
            "ministry": r["buying_organization"].strip(),
            "created_date": r["published_date"].strip(),
            "closing_date": r["bid_closing_date"].strip(),
            "bid_opening_date": r.get("bid_opening_date", "").strip(),
            "estimated_value_inr": val_cr * 10000000.0,
            "estimated_value_cr": val_cr,
            "status": "UNDER_EVALUATION" if "EVALUATION" in r.get("tender_status", "").upper() else "ACTIVE",
            "category": f"{r['tender_category'].strip()} - {r['product_service_category'].strip()}",
            "tender_type": r["tender_type"].strip(),
            "delivery_location": r["delivery_location"].strip(),
            "delivery_state": r["delivery_state"].strip(),
            "evaluation_method": r.get("evaluation_method", "QCBS").strip(),
            "make_in_india_applicable": r.get("make_in_india_applicable", "TRUE").strip().upper() == "TRUE",
            "minimum_local_content_pct": float(r.get("minimum_local_content_pct", 50.0)),
            "msme_purchase_preference": r.get("msme_purchase_preference", "TRUE").strip().upper() == "TRUE",
            "startup_preference": r.get("startup_preference", "TRUE").strip().upper() == "TRUE",
            "epfo_esic_required": r.get("epfo_esic_required", "TRUE").strip().upper() == "TRUE",
            "oem_authorization_required": r.get("oem_authorization_required", "TRUE").strip().upper() == "TRUE",
            "bis_certification_required": r.get("bis_certification_required", "FALSE").strip().upper() == "TRUE",
            "experience_years_required": int(r.get("experience_years_required", 3)),
            "min_turnover_required_cr": float(r.get("min_turnover_required_cr", 5.0)),
            "description": f"{r['tender_title'].strip()}. Buyer Organization: {r['buying_organization'].strip()} ({r['cpse_name'].strip()}). Primary Delivery Location: {r['delivery_location'].strip()}, {r['delivery_state'].strip()}."
        }
        result.append(t_obj)
    return result

def generate_requirements(tenders_csv_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    reqs = []
    for r in tenders_csv_rows:
        tid = r["tender_id"].strip()
        min_lc = float(r.get("minimum_local_content_pct", 50.0))
        min_turnover = float(r.get("min_turnover_required_cr", 2.0))
        exp_years = int(r.get("experience_years_required", 2))

        # 1. GST Registration
        reqs.append({
            "req_id": f"REQ-{tid}-01",
            "tender_id": tid,
            "title": "GST Registration",
            "category": "STATUTORY",
            "mandatory": "YES",
            "condition": "Active GSTIN registered in the bidder's legal entity name with regular monthly return filings.",
            "verification_source": "GSTN",
            "rule_code": "RULE_GST_ACTIVE",
            "weight": 10
        })

        # 2. PAN Verification
        reqs.append({
            "req_id": f"REQ-{tid}-02",
            "tender_id": tid,
            "title": "Permanent Account Number (PAN)",
            "category": "STATUTORY",
            "mandatory": "YES",
            "condition": "Valid PAN cross-linked with corporate registry and active tax jurisdiction.",
            "verification_source": "ITD",
            "rule_code": "RULE_PAN_VALID",
            "weight": 10
        })

        # 3. Income Tax Return (ITR) Proof
        reqs.append({
            "req_id": f"REQ-{tid}-03",
            "tender_id": tid,
            "title": "Income Tax Return (ITR) Acknowledgment",
            "category": "FINANCIAL",
            "mandatory": "YES",
            "condition": f"Submission of verified ITR filing for Assessment Year 2024-25 with minimum turnover of INR {min_turnover} Cr.",
            "verification_source": "ITD_DOCUMENT",
            "rule_code": "RULE_ITR_FILED",
            "weight": 10
        })

        # 4. Make in India Local Content Declaration
        if r.get("make_in_india_applicable", "TRUE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-04",
                "tender_id": tid,
                "title": "Make in India Local Content Declaration",
                "category": "MAKE_IN_INDIA",
                "mandatory": "YES",
                "condition": f"Class-I/Class-II Local Supplier declaration with minimum {min_lc}% domestic value addition.",
                "verification_source": "SELF_DECLARATION",
                "rule_code": "RULE_LOCAL_CONTENT_50",
                "weight": 15
            })

        # 5. Udyam MSME Registration (if MSME preference)
        if r.get("msme_purchase_preference", "TRUE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-05",
                "tender_id": tid,
                "title": "Udyam MSME Registration",
                "category": "MSME",
                "mandatory": "CONDITIONAL",
                "condition": "Valid Udyam Registration Certificate required to avail MSME purchase preference and EMD exemption.",
                "verification_source": "UDYAM",
                "rule_code": "RULE_UDYAM_CATEGORY",
                "weight": 10
            })

        # 6. DPIIT Startup Recognition (if startup preference)
        if r.get("startup_preference", "TRUE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-06",
                "tender_id": tid,
                "title": "DPIIT Startup Recognition",
                "category": "STARTUP",
                "mandatory": "CONDITIONAL",
                "condition": "Valid DPIIT Certificate of Recognition required if claiming exemption from prior turnover and experience under GFR 173(i).",
                "verification_source": "DPIIT",
                "rule_code": "RULE_DPIIT_STARTUP",
                "weight": 8
            })

        # 7. OEM Manufacturer Authorization Form (MAF)
        if r.get("oem_authorization_required", "TRUE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-07",
                "tender_id": tid,
                "title": "Manufacturer Authorization Form (MAF)",
                "category": "TENDER_SPECIFIC",
                "mandatory": "YES",
                "condition": f"Original manufacturer authorization form for primary tender supply valid beyond {r['bid_closing_date'].strip()}.",
                "verification_source": "OEM_DOCUMENT",
                "rule_code": "RULE_OEM_AUTH_VALID",
                "weight": 15
            })

        # 8. BIS Product Certification (if applicable)
        if r.get("bis_certification_required", "FALSE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-08",
                "tender_id": tid,
                "title": "Bureau of Indian Standards (BIS) License",
                "category": "QUALITY",
                "mandatory": "YES",
                "condition": "Valid BIS product conformity license or mandatory ISI mark certificate for tendered product line.",
                "verification_source": "BIS",
                "rule_code": "RULE_BIS_VALID",
                "weight": 10
            })

        # 9. EPFO Statutory Compliance
        if r.get("epfo_esic_required", "TRUE").strip().upper() == "TRUE":
            reqs.append({
                "req_id": f"REQ-{tid}-09",
                "tender_id": tid,
                "title": "EPFO Statutory Compliance",
                "category": "STATUTORY",
                "mandatory": "CONDITIONAL",
                "condition": "Valid establishment code and active ECR monthly contribution returns for commercial establishments with >= 20 staff.",
                "verification_source": "EPFO",
                "rule_code": "RULE_EPFO_COMPLIANT",
                "weight": 8
            })
            reqs.append({
                "req_id": f"REQ-{tid}-10",
                "tender_id": tid,
                "title": "ESIC Statutory Registration",
                "category": "STATUTORY",
                "mandatory": "CONDITIONAL",
                "condition": "Valid ESIC employer code and active contribution status under ESI Act, 1948.",
                "verification_source": "ESIC",
                "rule_code": "RULE_ESIC_COMPLIANT",
                "weight": 8
            })

        # 10. Non-Blacklisting & Integrity Declaration
        reqs.append({
            "req_id": f"REQ-{tid}-11",
            "tender_id": tid,
            "title": "Debarment & Integrity Screening",
            "category": "ELIGIBILITY",
            "mandatory": "YES",
            "condition": "Bidder must not be debarred, blacklisted, or under vigilance investigation by GeM, CVC, or any Central/State Ministry.",
            "verification_source": "CENTRAL_DEBARMENT_REGISTRY",
            "rule_code": "RULE_NON_BLACKLISTED",
            "weight": 12
        })

    return reqs

def generate_udyam_json(udyam_csv_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    result = []
    for r in udyam_csv_rows:
        result.append({
            "bidder_id": r["bidder_id"].strip(),
            "udyam_number": r["udyam_number"].strip(),
            "enterprise_name": r["enterprise_name"].strip(),
            "enterprise_type": r["enterprise_type"].strip().upper(),
            "major_activity": r["major_activity"].strip().upper(),
            "nic_codes": [r["nic_2_digit"].strip(), r["nic_4_digit"].strip()],
            "date_of_registration": r["date_of_registration"].strip(),
            "date_of_commencement": r["date_of_commencement"].strip(),
            "social_category": r["social_category"].strip(),
            "gender": r["gender"].strip(),
            "date_of_udyam_registration": r["date_of_udyam_registration"].strip(),
            "status": r["status"].strip().upper(),
            "investment_plant_machinery_cr": float(r.get("investment_plant_machinery_cr", 0.5)),
            "turnover_cr": float(r.get("turnover_cr", 5.0)),
            "district": r["district"].strip(),
            "state": r["state"].strip(),
            "is_valid": r["is_valid"].strip().upper() == "TRUE",
            "last_verified_date": r.get("last_verified_date", "2026-08-15").strip(),
            "verification_source": r.get("verification_source", "Udyam Portal API").strip()
        })
    return result

def generate_dpiit_json(dpiit_csv_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    result = []
    for r in dpiit_csv_rows:
        is_rec = r["is_recognized"].strip().upper() == "TRUE"
        rec_status = r["recognition_status"].strip().upper()
        tax_status = r["tax_exemption_status"].strip()
        val_status = "VALID" if (rec_status == "ACTIVE" and tax_status != "Expired") else "EXPIRED"

        result.append({
            "bidder_id": r["bidder_id"].strip(),
            "certificate_number": r["dpiit_recognition_number"].strip(),
            "startup_name": r["startup_name"].strip(),
            "recognition_date": r["date_of_recognition"].strip(),
            "date_of_incorporation": r["date_of_incorporation"].strip(),
            "sector": r["industry_sector"].strip(),
            "sub_sector": r["sub_sector"].strip(),
            "state": r["state"].strip(),
            "city": r["city"].strip(),
            "is_recognized": is_rec,
            "recognition_status": rec_status,
            "validity_status": val_status,
            "tax_exemption_status": tax_status,
            "has_80iac_certificate": r["has_80iac_certificate"].strip().upper() == "TRUE",
            "patent_count": int(r.get("patent_count", 0)),
            "funding_stage": r["funding_stage"].strip(),
            "total_funding_cr": float(r.get("total_funding_cr", 1.0)),
            "is_women_led": r["is_women_led"].strip().upper() == "TRUE",
            "is_sc_st_led": r["is_sc_st_led"].strip().upper() == "TRUE",
            "entity_type": r["entity_type"].strip(),
            "cin": r["cin"].strip() if r.get("cin") else None,
            "last_verified_date": r.get("last_verified_date", "2026-09-10").strip(),
            "notes": r.get("notes", "").strip()
        })
    return result

def generate_pan_json(pan_csv_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    result = []
    for r in pan_csv_rows:
        result.append({
            "bidder_id": r["bidder_id"].strip(),
            "pan": r["pan"].strip().upper(),
            "pan_holder_name": r["pan_holder_name"].strip(),
            "pan_status": r["pan_status"].strip().upper(),
            "pan_type": r["pan_type"].strip(),
            "date_of_birth_incorporation": r["date_of_birth_incorporation"].strip(),
            "aadhaar_linked": r.get("aadhaar_linked", "N/A").strip(),
            "itr_filed_ay_2024_25": r.get("itr_filed_ay_2024_25", "Filed").strip(),
            "itr_filed_ay_2023_24": r.get("itr_filed_ay_2023_24", "Filed").strip(),
            "itr_filed_ay_2022_23": r.get("itr_filed_ay_2022_23", "Filed").strip(),
            "itr_type_ay_2024_25": r.get("itr_type_ay_2024_25", "ITR-6").strip(),
            "total_income_ay_2024_25_cr": float(r.get("total_income_ay_2024_25_cr") or 0.0),
            "tax_paid_ay_2024_25_cr": float(r.get("tax_paid_ay_2024_25_cr") or 0.0),
            "itr_verification_status_2024_25": r.get("itr_verification_status_2024_25", "Verified").strip(),
            "tax_demand_pending_cr": float(r.get("tax_demand_pending_cr") or 0.0),
            "has_tax_notice": r.get("has_tax_notice", "FALSE").strip().upper() == "TRUE",
            "tds_compliance_pct": int(r.get("tds_compliance_pct") or 100),
            "pan_aadhaar_link_status": r.get("pan_aadhaar_link_status", "N/A").strip(),
            "last_verified_date": r.get("last_verified_date", "2026-09-10").strip(),
            "verification_source": r.get("verification_source", "NSDL PAN Verification").strip(),
            "notes": r.get("notes", "").strip()
        })
    return result

def generate_bidders_and_connectors(
    pan_rows: List[Dict[str, str]],
    udyam_rows: List[Dict[str, str]],
    dpiit_rows: List[Dict[str, str]]
):
    udyam_by_bid = {r["bidder_id"].strip(): r for r in udyam_rows}
    dpiit_by_bid = {r["bidder_id"].strip(): r for r in dpiit_rows}

    bidders = []
    gst_list = []
    mca_list = []
    epfo_list = []
    esic_list = []

    for r in pan_rows:
        bid_id = r["bidder_id"].strip()
        pan = r["pan"].strip().upper()
        holder_name = r["pan_holder_name"].strip()
        pan_type = r["pan_type"].strip()
        incorp_date = r["date_of_birth_incorporation"].strip()
        incorp_year = incorp_date.split("-")[0] if "-" in incorp_date else "2020"
        bidder_num = int("".join([c for c in bid_id if c.isdigit()]) or "1")

        ud = udyam_by_bid.get(bid_id)
        dp = dpiit_by_bid.get(bid_id)

        # Determine state & city
        if ud:
            state = ud["state"].strip()
            district = ud["district"].strip()
            nic = ud["nic_2_digit"].strip()
        elif dp:
            state = dp["state"].strip()
            district = dp["city"].strip()
            nic = "72"
        elif bid_id in NON_UDYAM_INFO:
            state = NON_UDYAM_INFO[bid_id]["state"]
            district = NON_UDYAM_INFO[bid_id]["district"]
            nic = NON_UDYAM_INFO[bid_id]["nic"][:2]
        else:
            state = "Maharashtra"
            district = "Mumbai"
            nic = "62"

        state_upper = state.upper()
        st_code = STATE_CODE_MAP.get(state_upper, "27")
        epfo_prefix = STATE_CODE_TO_EPFO_PREFIX.get(st_code, "MHPUN")

        # Company type
        if "LLP" in holder_name or pan_type == "Firm/LLP":
            company_type = "LIMITED_LIABILITY_PARTNERSHIP" if "LLP" in holder_name else "PARTNERSHIP"
        elif pan_type == "Individual":
            company_type = "PROPRIETORSHIP"
        elif pan_type == "AOP/Trust" or "Co-op" in holder_name or "Cooperative" in holder_name:
            company_type = "COOPERATIVE"
        else:
            company_type = "PRIVATE_LIMITED" if "Private" in holder_name or "Pvt" in holder_name else "PUBLIC_LIMITED"

        # Identifiers
        gstin = f"{st_code}{pan}1Z5"
        if dp and dp.get("cin"):
            cin = dp["cin"].strip()
        elif company_type in ["PRIVATE_LIMITED", "PUBLIC_LIMITED"]:
            prefix = "U" if company_type == "PRIVATE_LIMITED" else "L"
            cin = f"{prefix}{nic}00{st_code}{incorp_year}PTC{bidder_num:06d}"
        elif company_type == "LIMITED_LIABILITY_PARTNERSHIP":
            cin = f"AAA-{bidder_num:04d}"
        else:
            cin = None

        epfo_id = f"{epfo_prefix}00{bidder_num:05d}000"
        esic_id = f"31000{bidder_num:05d}001001"

        # MSME & Startup status
        has_udyam = (ud is not None)
        ud_valid = has_udyam and (ud["is_valid"].strip().upper() == "TRUE")
        msme_status = "MICRO_SMALL_ENTERPRISE" if has_udyam else "NOT_APPLICABLE"
        msme_category = ud["enterprise_type"].strip().upper() if has_udyam else None
        udyam_number = ud["udyam_number"].strip() if has_udyam else None

        has_dpiit = (dp is not None)
        dp_valid = has_dpiit and (dp["is_recognized"].strip().upper() == "TRUE") and (dp["recognition_status"].strip().upper() == "ACTIVE")
        startup_status = "STARTUP_RECOGNIZED" if has_dpiit else "NOT_APPLICABLE"
        startup_cert = dp["dpiit_recognition_number"].strip() if has_dpiit else None

        # ITR status
        itr_filed = r.get("itr_filed_ay_2024_25", "Filed").strip()
        itr_year = "2024-25" if itr_filed == "Filed" else None

        # OEM Authorization
        is_oem = (company_type in ["PRIVATE_LIMITED", "PUBLIC_LIMITED", "LIMITED_LIABILITY_PARTNERSHIP"] and bidder_num in [1, 2, 4, 6, 7, 10, 11, 14, 18, 19, 21, 22, 25, 27, 28, 31, 32, 34, 38, 42, 44, 49])
        oem_expiry = "2027-12-31"
        if bid_id == "BID003":
            oem_expiry = "2025-12-31" # Expired OEM test case

        # Local content percentage
        declared_lc = 68.5
        if bid_id == "BID003":
            declared_lc = 38.0 # Non-compliant local content test case
        elif bid_id in ["BID005", "BID020", "BID027"]:
            declared_lc = 76.0
        elif has_dpiit:
            declared_lc = 65.0
        elif ud:
            declared_lc = 58.0 + (bidder_num % 15)

        # Risk and Expected Score
        notes_str = r.get("notes", "").strip()
        is_blacklisted = False
        compliance_score = 96
        risk_level = "LOW"
        exp_notes = "Fully compliant bidder with valid statutory registrations, active tax returns, and verified credentials."

        if bid_id == "BID016": # Gupta Trading
            is_blacklisted = True
            compliance_score = 24
            risk_level = "HIGH"
            exp_notes = "PAN deactivated by tax authority; no ITR filed for 3 years; critical unresolved tax default; Udyam cancelled."
        elif bid_id == "BID008": # Metro Construction
            compliance_score = 64
            risk_level = "HIGH"
            exp_notes = "Unresolved tax demand INR 4.5 Cr under active scrutiny notice Section 143(2); AY 2022-23 ITR unfiled."
        elif bid_id == "BID033": # Jharkhand Minerals
            compliance_score = 56
            risk_level = "HIGH"
            exp_notes = "Udyam registration expired; unresolved tax demand INR 2.1 Cr; AY 2023-24 return missing."
        elif bid_id == "BID048": # NorthEast IT Solutions (Expired startup)
            compliance_score = 74
            risk_level = "MEDIUM"
            exp_notes = "DPIIT Startup certificate expired; requires renewal for GFR 173(i) exemption."
        elif bid_id == "BID003": # Local content shortfall & expired OEM
            compliance_score = 62
            risk_level = "HIGH"
            exp_notes = "Declared domestic value addition 38% falls below Class-I 50% requirement; submitted OEM authorization is expired."
        elif not itr_year:
            compliance_score = 72
            risk_level = "MEDIUM"
            exp_notes = "Mandatory ITR acknowledgment for AY 2024-25 missing."

        bidder_entry = {
            "bidder_id": bid_id,
            "company_name": holder_name,
            "pan": pan,
            "gstin": gstin,
            "cin": cin,
            "udyam_number": udyam_number,
            "address": f"Plot {10 + bidder_num}, Industrial Zone, {district}, {state}",
            "company_type": company_type,
            "msme_status": msme_status,
            "msme_category": msme_category,
            "startup_status": startup_status,
            "startup_certificate": startup_cert,
            "nsic_status": "REGISTERED" if bidder_num in [1, 2, 5, 7, 9, 27, 38] else "NOT_REGISTERED",
            "epfo_id": epfo_id,
            "esic_id": esic_id,
            "claimed_msme_benefit": ud_valid,
            "claimed_startup_benefit": dp_valid,
            "declared_local_content": declared_lc,
            "oem_authorized": is_oem,
            "oem_product": f"Model Series-{100 + bidder_num} Certified Equipment",
            "oem_name": "Siemens Global Industrial Corp" if bidder_num % 2 == 1 else "Schneider Automation SE",
            "oem_expiry": oem_expiry if is_oem else None,
            "itr_filed_year": itr_year,
            "blacklisted": is_blacklisted,
            "expected_profile": {
                "compliance_score": compliance_score,
                "risk_level": risk_level,
                "notes": exp_notes
            }
        }
        bidders.append(bidder_entry)

        # Connector record: GST
        gst_status = "INACTIVE" if is_blacklisted else "ACTIVE"
        gst_ret_status = "CANCELLED" if is_blacklisted else ("DELAYED" if bid_id in ["BID008", "BID033"] else "FILED")
        gst_list.append({
            "gstin": gstin,
            "legal_name": holder_name,
            "trade_name": holder_name.split()[0] + " Tech & Solutions",
            "registration_date": incorp_date,
            "status": gst_status,
            "state": state,
            "last_return_period": "2026-08",
            "return_status": gst_ret_status
        })

        # Connector record: MCA (for companies and LLPs)
        if cin:
            mca_list.append({
                "cin": cin,
                "company_name": holder_name,
                "company_status": "ACTIVE",
                "class_of_company": "Private" if "Private" in holder_name else "Public",
                "date_of_incorporation": incorp_date,
                "registered_state": state,
                "authorized_capital_inr": int(max(float(r.get("total_income_ay_2024_25_cr") or 5.0) * 10000000, 1000000)),
                "paid_up_capital_inr": int(max(float(r.get("total_income_ay_2024_25_cr") or 2.0) * 8000000, 500000))
            })

        # Connector record: EPFO
        epfo_comp = "DEFAULTER" if is_blacklisted else "COMPLIANT"
        epfo_list.append({
            "establishment_id": epfo_id,
            "establishment_name": holder_name,
            "compliance_status": epfo_comp,
            "covered_employees": 35 if ud else 180,
            "last_ecr_month": "2026-08",
            "dues_pending_inr": 2500000 if is_blacklisted else 0
        })

        # Connector record: ESIC
        esic_comp = "PENDING_DUES" if is_blacklisted else "COMPLIANT"
        esic_list.append({
            "employer_id": esic_id,
            "employer_name": holder_name,
            "compliance_status": esic_comp,
            "last_contribution_month": "2026-08",
            "employees_count": 28 if ud else 140
        })

    return bidders, gst_list, mca_list, epfo_list, esic_list

def generate_bis() -> List[Dict[str, Any]]:
    return [
        {
            "certificate_number": "CM/L-7890101",
            "company": "TechVista Solutions Private Limited",
            "product": "IT and Electronic Infrastructure Equipment",
            "standard_number": "IS 13252",
            "status": "VALID",
            "valid_until": "2027-12-31"
        },
        {
            "certificate_number": "CM/L-7890103",
            "company": "Bharat Heavy Components Limited",
            "product": "Heavy Industrial Switchgear & Control Assemblies",
            "standard_number": "IS/IEC 61439",
            "status": "VALID",
            "valid_until": "2027-10-31"
        },
        {
            "certificate_number": "CM/L-7890105",
            "company": "Rajasthan Steel Works",
            "product": "High Strength Deformed Steel Bars & Wires",
            "standard_number": "IS 1786",
            "status": "VALID",
            "valid_until": "2027-08-31"
        },
        {
            "certificate_number": "CM/L-7890107",
            "company": "Sai Pharma Industries Private Limited",
            "product": "Medical Devices Quality Systems",
            "standard_number": "IS/ISO 13485",
            "status": "VALID",
            "valid_until": "2027-09-30"
        },
        {
            "certificate_number": "CM/L-7890131",
            "company": "GreenEnergy Solar Private Limited",
            "product": "Crystalline Silicon Terrestrial Photovoltaic (PV) Modules",
            "standard_number": "IS 14286",
            "status": "VALID",
            "valid_until": "2028-03-31"
        },
        {
            "certificate_number": "CM/L-7890138",
            "company": "Rathi Iron and Steel Works",
            "product": "Hot Rolled Medium and High Tensile Structural Steel",
            "standard_number": "IS 2062",
            "status": "VALID",
            "valid_until": "2027-06-30"
        },
        {
            "certificate_number": "CM/L-7890140",
            "company": "Nagpur Cement Products Co",
            "product": "53 Grade Ordinary Portland Cement",
            "standard_number": "IS 12269",
            "status": "VALID",
            "valid_until": "2027-11-30"
        },
        {
            "certificate_number": "CM/L-7890142",
            "company": "Falcon Aerospace Components Pvt Ltd",
            "product": "Aerospace Critical Propulsion Fasteners & Bearings",
            "standard_number": "IS/AS 9100",
            "status": "VALID",
            "valid_until": "2028-05-31"
        }
    ]

def generate_nsic() -> List[Dict[str, Any]]:
    return [
        {
            "registration_number": "NSIC/SPRS/2023/001",
            "enterprise_name": "TechVista Solutions Private Limited",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "monetary_limit_inr": 50000000,
            "status": "VALID",
            "valid_until": "2027-06-30"
        },
        {
            "registration_number": "NSIC/SPRS/2023/002",
            "enterprise_name": "GreenLeaf Enterprises",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "monetary_limit_inr": 15000000,
            "status": "VALID",
            "valid_until": "2027-08-31"
        },
        {
            "registration_number": "NSIC/SPRS/2023/005",
            "enterprise_name": "Rajasthan Steel Works",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "monetary_limit_inr": 20000000,
            "status": "VALID",
            "valid_until": "2027-05-15"
        },
        {
            "registration_number": "NSIC/SPRS/2023/007",
            "enterprise_name": "Sai Pharma Industries Private Limited",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "monetary_limit_inr": 80000000,
            "status": "VALID",
            "valid_until": "2027-11-20"
        },
        {
            "registration_number": "NSIC/SPRS/2023/009",
            "enterprise_name": "Sunrise Textiles Private Limited",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "monetary_limit_inr": 35000000,
            "status": "VALID",
            "valid_until": "2027-04-10"
        }
    ]

def generate_digilocker() -> List[Dict[str, Any]]:
    return [
        {
            "uri": "in.gov.gst-GSTCER-27AABCT1234A1Z5",
            "document_type": "GST_CERTIFICATE",
            "holder": "TechVista Solutions Private Limited",
            "issuer": "Goods and Services Tax Network (GSTN)",
            "issued_date": "2020-06-14",
            "verification_status": "VERIFIED"
        },
        {
            "uri": "in.gov.msme-UDYAM-UDYAM-MH-01-0012345",
            "document_type": "UDYAM_CERTIFICATE",
            "holder": "TechVista Solutions Pvt Ltd",
            "issuer": "Ministry of Micro, Small and Medium Enterprises",
            "issued_date": "2021-07-15",
            "verification_status": "VERIFIED"
        },
        {
            "uri": "in.gov.incometax-ITR-AABCT1234A-2024",
            "document_type": "ITR_ACKNOWLEDGMENT",
            "holder": "TechVista Solutions Private Limited",
            "issuer": "Income Tax Department (ITD)",
            "issued_date": "2024-07-28",
            "verification_status": "VERIFIED"
        }
    ]

def generate_blacklist() -> List[Dict[str, Any]]:
    return [
        {
            "entity_name": "Gupta Trading Company",
            "pan": "AAMPG5678P",
            "authority": "GeM Incident Management & Debarment Committee",
            "reference_number": "GEM-INC-2026-0891",
            "status": "DEBARRED",
            "start_date": "2026-06-15",
            "end_date": "2029-06-14",
            "reason": "PAN deactivated; unfiled ITR for 3 consecutive assessment years; pending tax demand INR 8.2 Cr; cancelled Udyam.",
            "recommendation_flag": "Potential record found in Central Debarment Watchlist — Procurement Officer Review Required"
        },
        {
            "entity_name": "Metro Construction Company",
            "pan": "AAKPM0123H",
            "authority": "Income Tax Department Scrutiny Division",
            "reference_number": "ITD-SCRUTINY-2026-441",
            "status": "UNDER_INVESTIGATION",
            "start_date": "2026-04-10",
            "end_date": "2027-04-09",
            "reason": "Pending tax demand of INR 4.5 Cr; active scrutiny assessment notice under Section 143(2); unfiled AY 2022-23.",
            "recommendation_flag": "Potential record found in ITD Scrutiny Division — Procurement Officer Review Required"
        },
        {
            "entity_name": "Jharkhand Minerals Trading Co",
            "pan": "AAKPJ3456G",
            "authority": "Income Tax Department & MSME Vigilance",
            "reference_number": "MSME-VIG-2026-102",
            "status": "UNDER_INVESTIGATION",
            "start_date": "2026-05-01",
            "end_date": "2027-04-30",
            "reason": "Expired Udyam registration, unfiled AY 2023-24 returns, pending recovery demand INR 2.1 Cr.",
            "recommendation_flag": "Potential record found in MSME Vigilance Registry — Procurement Officer Review Required"
        },
        {
            "entity_name": "Eastern Infra Power Allied Pvt. Ltd.",
            "pan": "DEMOE9999M",
            "authority": "Central Vigilance Commission (CVC)",
            "reference_number": "CVC-ADV-2024-110",
            "status": "DEBARRED",
            "start_date": "2024-01-01",
            "end_date": "2027-01-01",
            "reason": "Debarment under GFR 151(iii) for fraudulent declaration of local content."
        }
    ]

def main():
    print("Reading canonical CSV files from data/...")
    udyam_rows = load_csv("udyam.csv")
    tenders_rows = load_csv("tenders.csv")
    pan_rows = load_csv("pan.csv")
    dpiit_rows = load_csv("dpiit.csv")

    print(f"Loaded: {len(pan_rows)} PAN records, {len(udyam_rows)} Udyam records, {len(dpiit_rows)} DPIIT records, {len(tenders_rows)} Tenders.")

    tenders = generate_tenders(tenders_rows)
    requirements = generate_requirements(tenders_rows)
    udyam = generate_udyam_json(udyam_rows)
    dpiit = generate_dpiit_json(dpiit_rows)
    pan = generate_pan_json(pan_rows)
    bidders, gst, mca, epfo, esic = generate_bidders_and_connectors(pan_rows, udyam_rows, dpiit_rows)
    bis = generate_bis()
    nsic = generate_nsic()
    digilocker = generate_digilocker()
    blacklist = generate_blacklist()

    files = {
        "bidders.json": bidders,
        "tenders.json": tenders,
        "requirements.json": requirements,
        "udyam.json": udyam,
        "dpiit.json": dpiit,
        "pan.json": pan,
        "gst.json": gst,
        "mca.json": mca,
        "epfo.json": epfo,
        "esic.json": esic,
        "bis.json": bis,
        "nsic.json": nsic,
        "digilocker.json": digilocker,
        "blacklist.json": blacklist
    }

    for filename, data in files.items():
        filepath = DATA_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully generated {filename} ({len(data)} items)")

if __name__ == "__main__":
    main()

"""
scripts/generate_mock_data.py
Generates comprehensive synthetic demo data for BidSentinel.
All entities, numbers, and identifiers are purely synthetic.
"""

import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def generate_bidders():
    return [
        {
            "bidder_id": "BID-001",
            "company_name": "ABC Technologies Pvt. Ltd.",
            "pan": "DEMOA1234X",
            "gstin": "27DEMOA1234F1Z5",
            "cin": "U12345MH2020PTC100001",
            "udyam_number": "UDYAM-MH-12-0001001",
            "address": "Plot 42, Tech Park Phase 2, Pune, Maharashtra 411057",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "SMALL",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "REGISTERED",
            "epfo_id": "MHPUN0012345000",
            "esic_id": "31000123450001001",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 68.5,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Siemens Global Industrial Corp",
            "oem_expiry": "2027-12-31",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 96,
                "risk_level": "LOW",
                "notes": "Fully compliant benchmark bidder. Valid statutory registrations, MSME certificate, OEM auth, and local content."
            }
        },
        {
            "bidder_id": "BID-002",
            "company_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "pan": "DEMOX5678Y",
            "gstin": "27DEMOX5678F1Z2",
            "cin": "U12345MH2019PTC100002",
            "udyam_number": "UDYAM-MH-12-0001002",
            "address": "Sector 18, Electronic Zone, Navi Mumbai, Maharashtra 400705",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "MEDIUM",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "MHPUN0012346000",
            "esic_id": "31000123460001002",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 54.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Schneider Automation SE",
            "oem_expiry": "2026-10-10",  # Nearing expiry
            "itr_filed_year": None,        # Missing ITR
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 74,
                "risk_level": "MEDIUM",
                "notes": "Missing ITR filing FY 2025-26, ESIC verification pending in government source, OEM auth expiring soon."
            }
        },
        {
            "bidder_id": "BID-003",
            "company_name": "PQR Industrial Systems Pvt. Ltd.",
            "pan": "DEMOP9012Z",
            "gstin": "27DEMOP9012F1Z9",
            "cin": "U12345MH2018PTC100003",
            "udyam_number": "UDYAM-MH-12-0001003",
            "address": "MIDC Bhosari, Industrial Area, Pune, Maharashtra 411026",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "SMALL",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "MHPUN0012347000",
            "esic_id": "31000123470001003",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 38.0, # Below 50% threshold
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Rockwell Automation Ltd",
            "oem_expiry": "2025-12-31",  # Expired OEM
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 58,
                "risk_level": "HIGH",
                "notes": "GST legal name mismatch vs MCA, Udyam registered name discrepancy, local content 38% < 50%, expired OEM auth."
            }
        },
        {
            "bidder_id": "BID-004",
            "company_name": "Zenith Micro Devices LLP",
            "pan": "DEMOZ3456L",
            "gstin": "06DEMOZ3456F1Z1",
            "cin": "AAA-1234",
            "udyam_number": "UDYAM-HR-01-0001004",
            "address": "Udyog Vihar Phase 4, Gurugram, Haryana 122016",
            "company_type": "LIMITED_LIABILITY_PARTNERSHIP",
            "msme_status": "MICRO_ENTERPRISE",
            "msme_category": "MICRO",
            "startup_status": "DPIIT_RECOGNIZED",
            "startup_certificate": "DPIIT-ST-2024-9876",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "HRGGN0012348000",
            "esic_id": "13000123480001004",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": True,
            "declared_local_content": 72.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Zenith Micro Devices LLP (Self OEM)",
            "oem_expiry": "2028-06-30",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 82,
                "risk_level": "MEDIUM",
                "notes": "Startup claiming prior turnover & experience exemption under Rule 173(i) GFR 2017. GSTR-3B return delayed."
            }
        },
        {
            "bidder_id": "BID-005",
            "company_name": "Bharat Heavy Spares Corp",
            "pan": "DEMOB7890C",
            "gstin": "07DEMOB7890F1Z4",
            "cin": "U12345DL2015PTC100005",
            "udyam_number": "UDYAM-DL-02-0001005",
            "address": "Okhla Industrial Area Phase 1, New Delhi 110020",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "NOT_APPLICABLE",
            "msme_category": "LARGE",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "DLCPM0012349000",
            "esic_id": "20000123490001005",
            "claimed_msme_benefit": False,
            "claimed_startup_benefit": False,
            "declared_local_content": 55.0,
            "oem_authorized": False,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": None,
            "oem_expiry": None,
            "itr_filed_year": "2024-25",
            "blacklisted": True,
            "expected_profile": {
                "compliance_score": 42,
                "risk_level": "HIGH",
                "notes": "GST status INACTIVE in mock GSTN. Potential record on CVC watchlist requiring officer review. No OEM auth."
            }
        },
        {
            "bidder_id": "BID-006",
            "company_name": "Apex Automation Systems Pvt. Ltd.",
            "pan": "DEMOA6543K",
            "gstin": "29DEMOA6543F1Z8",
            "cin": "U12345KA2017PTC100006",
            "udyam_number": "UDYAM-KR-03-0001006",
            "address": "Peenya 2nd Stage, Bengaluru, Karnataka 560058",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "MEDIUM",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "REGISTERED",
            "epfo_id": "KNBLR0012350000",
            "esic_id": "53000123500001006",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 62.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Honeywell Industrial Solutions",
            "oem_expiry": "2027-08-31",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 91,
                "risk_level": "LOW",
                "notes": "Highly compliant bidder. Active GST, valid Udyam, active EPFO and ESIC registrations."
            }
        },
        {
            "bidder_id": "BID-007",
            "company_name": "Titan Electro Dynamics Ltd.",
            "pan": "DEMOT2109M",
            "gstin": "33DEMOT2109F1Z3",
            "cin": "L12345TN2012PLC100007",
            "udyam_number": "UDYAM-TN-02-0001007",
            "address": "Ambattur Industrial Estate, Chennai, Tamil Nadu 600058",
            "company_type": "PUBLIC_LIMITED",
            "msme_status": "NOT_APPLICABLE",
            "msme_category": "LARGE",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "TNMAS0012351000",
            "esic_id": "51000123510001007",
            "claimed_msme_benefit": False,
            "claimed_startup_benefit": False,
            "declared_local_content": 52.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "ABB Automation Technologies",
            "oem_expiry": "2026-11-30",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 68,
                "risk_level": "MEDIUM",
                "notes": "Public limited entity. EPFO compliance marked PENDING_DUES in mock EPFO source."
            }
        },
        {
            "bidder_id": "BID-008",
            "company_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "pan": "DEMOK8765N",
            "gstin": "24DEMOK8765F1Z7",
            "cin": "U12345GJ2016PTC100008",
            "udyam_number": "UDYAM-GJ-01-0001008",
            "address": "GIDC Makarpura, Vadodara, Gujarat 390010",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "SMALL",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "REGISTERED",
            "epfo_id": "GJBDA0012352000",
            "esic_id": "37000123520001008",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 78.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Yokogawa Electric Corp",
            "oem_expiry": "2028-03-31",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 89,
                "risk_level": "LOW",
                "notes": "Strong domestic manufacturing compliance. BIS certification valid for electrical safety."
            }
        },
        {
            "bidder_id": "BID-009",
            "company_name": "Nova Robotics India Pvt. Ltd.",
            "pan": "DEMON4321P",
            "gstin": "36DEMON4321F1Z6",
            "cin": "U12345TG2021PTC100009",
            "udyam_number": "UDYAM-TS-09-0001009",
            "address": "HITEC City Phase 1, Hyderabad, Telangana 500081",
            "company_type": "PRIVATE_LIMITED",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "MICRO",
            "startup_status": "DPIIT_RECOGNIZED",
            "startup_certificate": "DPIIT-ST-2024-5544",
            "nsic_status": "NOT_REGISTERED",
            "epfo_id": "TSHYD0012353000",
            "esic_id": "52000123530001009",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": True,
            "declared_local_content": 45.0, # Below 50%
            "oem_authorized": False,        # Missing OEM
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": None,
            "oem_expiry": None,
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 61,
                "risk_level": "HIGH",
                "notes": "Missing OEM Authorization; local content declaration (45%) fails mandatory 50% threshold."
            }
        },
        {
            "bidder_id": "BID-010",
            "company_name": "Delta Power Equipments LLP",
            "pan": "DEMOD9876R",
            "gstin": "19DEMOD9876F1Z0",
            "cin": "AAB-5678",
            "udyam_number": "UDYAM-WB-10-0001010",
            "address": "Sector 5, Salt Lake, Kolkata, West Bengal 700091",
            "company_type": "LIMITED_LIABILITY_PARTNERSHIP",
            "msme_status": "MICRO_SMALL_ENTERPRISE",
            "msme_category": "SMALL",
            "startup_status": "NOT_APPLICABLE",
            "nsic_status": "REGISTERED",
            "epfo_id": "WBCAL0012354000",
            "esic_id": "41000123540001010",
            "claimed_msme_benefit": True,
            "claimed_startup_benefit": False,
            "declared_local_content": 58.0,
            "oem_authorized": True,
            "oem_product": "Industrial Controller IC-9000",
            "oem_name": "Mitsubishi Electric Corp",
            "oem_expiry": "2027-04-30",
            "itr_filed_year": "2025-26",
            "blacklisted": False,
            "expected_profile": {
                "compliance_score": 79,
                "risk_level": "MEDIUM",
                "notes": "LLP registered. Minor address mismatch in MCA registered address vs GST place of business."
            }
        }
    ]

def generate_gst():
    return [
        {
            "gstin": "27DEMOA1234F1Z5",
            "legal_name": "ABC Technologies Pvt. Ltd.",
            "trade_name": "ABC Tech",
            "registration_date": "2020-06-14",
            "status": "ACTIVE",
            "state": "Maharashtra",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        },
        {
            "gstin": "27DEMOX5678F1Z2",
            "legal_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "trade_name": "XYZ Engg",
            "registration_date": "2019-04-10",
            "status": "ACTIVE",
            "state": "Maharashtra",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        },
        {
            "gstin": "27DEMOP9012F1Z9",
            # Deliberate mismatch: "PQR Industrial Systems Pvt Ltd" vs "PQR Industries Ltd"
            "legal_name": "PQR Industries Limited",
            "trade_name": "PQR Systems",
            "registration_date": "2018-09-22",
            "status": "ACTIVE",
            "state": "Maharashtra",
            "last_return_period": "2026-07",
            "return_status": "DELAYED"
        },
        {
            "gstin": "06DEMOZ3456F1Z1",
            "legal_name": "Zenith Micro Devices LLP",
            "trade_name": "Zenith Micro",
            "registration_date": "2024-02-01",
            "status": "ACTIVE",
            "state": "Haryana",
            "last_return_period": "2026-07",
            "return_status": "DELAYED"
        },
        {
            "gstin": "07DEMOB7890F1Z4",
            "legal_name": "Bharat Heavy Spares Corp",
            "trade_name": "Bharat Spares",
            "registration_date": "2015-11-19",
            "status": "INACTIVE", # Deliberate inactive GST status
            "state": "Delhi",
            "last_return_period": "2025-10",
            "return_status": "NOT_FILED"
        },
        {
            "gstin": "29DEMOA6543F1Z8",
            "legal_name": "Apex Automation Systems Pvt. Ltd.",
            "trade_name": "Apex Automation",
            "registration_date": "2017-03-12",
            "status": "ACTIVE",
            "state": "Karnataka",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        },
        {
            "gstin": "33DEMOT2109F1Z3",
            "legal_name": "Titan Electro Dynamics Ltd.",
            "trade_name": "Titan Dynamics",
            "registration_date": "2012-08-05",
            "status": "ACTIVE",
            "state": "Tamil Nadu",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        },
        {
            "gstin": "24DEMOK8765F1Z7",
            "legal_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "trade_name": "Kavach Shield",
            "registration_date": "2016-12-01",
            "status": "ACTIVE",
            "state": "Gujarat",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        },
        {
            "gstin": "36DEMON4321F1Z6",
            "legal_name": "Nova Robotics India Pvt. Ltd.",
            "trade_name": "Nova Robotics",
            "registration_date": "2021-05-18",
            "status": "ACTIVE",
            "state": "Telangana",
            "last_return_period": "2026-07",
            "return_status": "DELAYED"
        },
        {
            "gstin": "19DEMOD9876F1Z0",
            "legal_name": "Delta Power Equipments LLP",
            "trade_name": "Delta Power",
            "registration_date": "2020-10-15",
            "status": "ACTIVE",
            "state": "West Bengal",
            "last_return_period": "2026-08",
            "return_status": "FILED"
        }
    ]

def generate_udyam():
    return [
        {
            "udyam_number": "UDYAM-MH-12-0001001",
            "enterprise_name": "ABC Technologies Pvt. Ltd.",
            "enterprise_type": "SMALL",
            "organisation_type": "Private Limited Company",
            "registration_date": "2020-06-14",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2610", "2620"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-MH-12-0001002",
            "enterprise_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "enterprise_type": "MEDIUM",
            "organisation_type": "Private Limited Company",
            "registration_date": "2019-04-10",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2610"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-MH-12-0001003",
            # Deliberate enterprise name difference
            "enterprise_name": "PQR Manufacturing Units Enterprise",
            "enterprise_type": "SMALL",
            "organisation_type": "Proprietary",
            "registration_date": "2018-09-22",
            "major_activity": "SERVICES",
            "nic_codes": ["6201"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-HR-01-0001004",
            "enterprise_name": "Zenith Micro Devices LLP",
            "enterprise_type": "MICRO",
            "organisation_type": "Limited Liability Partnership",
            "registration_date": "2024-02-01",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2610"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-DL-02-0001005",
            "enterprise_name": "Bharat Heavy Spares Corp",
            "enterprise_type": "MEDIUM",
            "organisation_type": "Private Limited Company",
            "registration_date": "2015-11-19",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2819"],
            "status": "EXPIRED" # Mock expired Udyam
        },
        {
            "udyam_number": "UDYAM-KR-03-0001006",
            "enterprise_name": "Apex Automation Systems Pvt. Ltd.",
            "enterprise_type": "MEDIUM",
            "organisation_type": "Private Limited Company",
            "registration_date": "2017-03-12",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2610", "2710"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-TN-02-0001007",
            "enterprise_name": "Titan Electro Dynamics Ltd.",
            "enterprise_type": "MEDIUM",
            "organisation_type": "Public Limited Company",
            "registration_date": "2012-08-05",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2790"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-GJ-01-0001008",
            "enterprise_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "enterprise_type": "SMALL",
            "organisation_type": "Private Limited Company",
            "registration_date": "2016-12-01",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2610", "2829"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-TS-09-0001009",
            "enterprise_name": "Nova Robotics India Pvt. Ltd.",
            "enterprise_type": "MICRO",
            "organisation_type": "Private Limited Company",
            "registration_date": "2021-05-18",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2829"],
            "status": "ACTIVE"
        },
        {
            "udyam_number": "UDYAM-WB-10-0001010",
            "enterprise_name": "Delta Power Equipments LLP",
            "enterprise_type": "SMALL",
            "organisation_type": "Limited Liability Partnership",
            "registration_date": "2020-10-15",
            "major_activity": "MANUFACTURING",
            "nic_codes": ["2710"],
            "status": "ACTIVE"
        }
    ]

def generate_mca():
    return [
        {
            "cin": "U12345MH2020PTC100001",
            "company_name": "ABC Technologies Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2020-01-15",
            "registered_address": "Plot 42, Tech Park Phase 2, Pune, Maharashtra 411057",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 5000000,
            "paid_up_capital_inr": 2500000
        },
        {
            "cin": "U12345MH2019PTC100002",
            "company_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2019-02-20",
            "registered_address": "Sector 18, Electronic Zone, Navi Mumbai, Maharashtra 400705",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 10000000,
            "paid_up_capital_inr": 7500000
        },
        {
            "cin": "U12345MH2018PTC100003",
            # Name discrepancy: "PQR Industrial Systems Pvt. Ltd."
            "company_name": "PQR Industrial Systems Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2018-05-11",
            "registered_address": "MIDC Bhosari, Industrial Area, Pune, Maharashtra 411026",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 5000000,
            "paid_up_capital_inr": 3000000
        },
        {
            "cin": "AAA-1234",
            "company_name": "Zenith Micro Devices LLP",
            "company_status": "ACTIVE",
            "incorporation_date": "2024-01-10",
            "registered_address": "Udyog Vihar Phase 4, Gurugram, Haryana 122016",
            "company_type": "Limited Liability Partnership",
            "authorized_capital_inr": 1000000,
            "paid_up_capital_inr": 1000000
        },
        {
            "cin": "U12345DL2015PTC100005",
            "company_name": "Bharat Heavy Spares Corp",
            "company_status": "ACTIVE",
            "incorporation_date": "2015-08-14",
            "registered_address": "Okhla Industrial Area Phase 1, New Delhi 110020",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 20000000,
            "paid_up_capital_inr": 18000000
        },
        {
            "cin": "U12345KA2017PTC100006",
            "company_name": "Apex Automation Systems Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2017-02-14",
            "registered_address": "Peenya 2nd Stage, Bengaluru, Karnataka 560058",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 10000000,
            "paid_up_capital_inr": 8000000
        },
        {
            "cin": "L12345TN2012PLC100007",
            "company_name": "Titan Electro Dynamics Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2012-04-18",
            "registered_address": "Ambattur Industrial Estate, Chennai, Tamil Nadu 600058",
            "company_type": "Public company",
            "authorized_capital_inr": 50000000,
            "paid_up_capital_inr": 35000000
        },
        {
            "cin": "U12345GJ2016PTC100008",
            "company_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2016-10-05",
            "registered_address": "GIDC Makarpura, Vadodara, Gujarat 390010",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 8000000,
            "paid_up_capital_inr": 6000000
        },
        {
            "cin": "U12345TG2021PTC100009",
            "company_name": "Nova Robotics India Pvt. Ltd.",
            "company_status": "ACTIVE",
            "incorporation_date": "2021-03-22",
            "registered_address": "HITEC City Phase 1, Hyderabad, Telangana 500081",
            "company_type": "Non-govt company",
            "authorized_capital_inr": 5000000,
            "paid_up_capital_inr": 2000000
        },
        {
            "cin": "AAB-5678",
            "company_name": "Delta Power Equipments LLP",
            "company_status": "ACTIVE",
            "incorporation_date": "2020-07-29",
            "registered_address": "Sector 5, Salt Lake, Kolkata, West Bengal 700091",
            "company_type": "Limited Liability Partnership",
            "authorized_capital_inr": 2500000,
            "paid_up_capital_inr": 2500000
        }
    ]

def generate_epfo():
    return [
        {
            "establishment_id": "MHPUN0012345000",
            "establishment_name": "ABC Technologies Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2020-07-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 48
        },
        {
            "establishment_id": "MHPUN0012346000",
            "establishment_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2019-05-15",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 110
        },
        {
            "establishment_id": "MHPUN0012347000",
            "establishment_name": "PQR Industrial Systems Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2018-10-10",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 35
        },
        {
            "establishment_id": "HRGGN0012348000",
            "establishment_name": "Zenith Micro Devices LLP",
            "status": "ACTIVE",
            "registration_date": "2024-03-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 16
        },
        {
            "establishment_id": "DLCPM0012349000",
            "establishment_name": "Bharat Heavy Spares Corp",
            "status": "INACTIVE",
            "registration_date": "2015-09-01",
            "compliance_status": "PENDING_DUES",
            "last_ecr_month": "2025-11",
            "covered_employees": 85
        },
        {
            "establishment_id": "KNBLR0012350000",
            "establishment_name": "Apex Automation Systems Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2017-04-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 72
        },
        {
            "establishment_id": "TNMAS0012351000",
            "establishment_name": "Titan Electro Dynamics Ltd.",
            "status": "ACTIVE",
            "registration_date": "2012-09-01",
            "compliance_status": "PENDING_DUES", # Dues pending scenario
            "last_ecr_month": "2026-06",
            "covered_employees": 320
        },
        {
            "establishment_id": "GJBDA0012352000",
            "establishment_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2017-01-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 58
        },
        {
            "establishment_id": "TSHYD0012353000",
            "establishment_name": "Nova Robotics India Pvt. Ltd.",
            "status": "ACTIVE",
            "registration_date": "2021-06-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 22
        },
        {
            "establishment_id": "WBCAL0012354000",
            "establishment_name": "Delta Power Equipments LLP",
            "status": "ACTIVE",
            "registration_date": "2020-11-01",
            "compliance_status": "COMPLIANT",
            "last_ecr_month": "2026-08",
            "covered_employees": 28
        }
    ]

def generate_esic():
    return [
        {
            "employer_id": "31000123450001001",
            "employer_name": "ABC Technologies Pvt. Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "31000123460001002",
            "employer_name": "XYZ Engineering Solutions Pvt. Ltd.",
            "status": "PENDING",
            "compliance_status": "PENDING_VERIFICATION", # Pending scenario
            "last_contribution_month": "2026-05"
        },
        {
            "employer_id": "31000123470001003",
            "employer_name": "PQR Industrial Systems Pvt. Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "13000123480001004",
            "employer_name": "Zenith Micro Devices LLP",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "20000123490001005",
            "employer_name": "Bharat Heavy Spares Corp",
            "status": "INACTIVE",
            "compliance_status": "MISMATCH",
            "last_contribution_month": "2025-09"
        },
        {
            "employer_id": "53000123500001006",
            "employer_name": "Apex Automation Systems Pvt. Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "51000123510001007",
            "employer_name": "Titan Electro Dynamics Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "37000123520001008",
            "employer_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "52000123530001009",
            "employer_name": "Nova Robotics India Pvt. Ltd.",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        },
        {
            "employer_id": "41000123540001010",
            "employer_name": "Delta Power Equipments LLP",
            "status": "ACTIVE",
            "compliance_status": "COMPLIANT",
            "last_contribution_month": "2026-08"
        }
    ]

def generate_dpiit():
    return [
        {
            "certificate_number": "DPIIT-ST-2024-9876",
            "startup_name": "Zenith Micro Devices LLP",
            "recognition_status": "RECOGNIZED",
            "recognition_date": "2024-02-15",
            "validity_status": "VALID",
            "sector": "Electronics & Hardware Systems",
            "valid_until": "2034-02-14"
        },
        {
            "certificate_number": "DPIIT-ST-2024-5544",
            "startup_name": "Nova Robotics India Pvt. Ltd.",
            "recognition_status": "RECOGNIZED",
            "recognition_date": "2024-04-10",
            "validity_status": "VALID",
            "sector": "Robotics & Automation",
            "valid_until": "2034-04-09"
        }
    ]

def generate_nsic():
    return [
        {
            "certificate_number": "NSIC/GP/PUN/2023/00142",
            "enterprise_name": "ABC Technologies Pvt. Ltd.",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "status": "VALID",
            "valid_until": "2027-05-31",
            "monetary_limit_inr": 25000000
        },
        {
            "certificate_number": "NSIC/GP/BLR/2023/00298",
            "enterprise_name": "Apex Automation Systems Pvt. Ltd.",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "status": "VALID",
            "valid_until": "2027-03-31",
            "monetary_limit_inr": 50000000
        },
        {
            "certificate_number": "NSIC/GP/VAD/2023/00311",
            "enterprise_name": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "status": "VALID",
            "valid_until": "2027-09-30",
            "monetary_limit_inr": 35000000
        },
        {
            "certificate_number": "NSIC/GP/KOL/2024/00085",
            "enterprise_name": "Delta Power Equipments LLP",
            "scheme": "Single Point Registration Scheme (SPRS)",
            "status": "VALID",
            "valid_until": "2027-11-30",
            "monetary_limit_inr": 20000000
        }
    ]

def generate_digilocker():
    return [
        {
            "document_id": "DL-PAN-2020-00101",
            "issuer": "Income Tax Department",
            "document_type": "PAN_VERIFICATION_RECORD",
            "holder": "ABC Technologies Pvt. Ltd.",
            "verification_status": "VERIFIED",
            "issued_date": "2020-01-20",
            "doc_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069"
        },
        {
            "document_id": "DL-GST-2020-00102",
            "issuer": "Goods and Services Tax Network",
            "document_type": "GST_REGISTRATION_CERTIFICATE",
            "holder": "ABC Technologies Pvt. Ltd.",
            "verification_status": "VERIFIED",
            "issued_date": "2020-06-14",
            "doc_hash": "sha256:1a84f932f913d0774a3f5a0be53495d4ed7f9b8c2c8f8b63a9486c905b4588e2"
        },
        {
            "document_id": "DL-UDYAM-2020-00103",
            "issuer": "Ministry of Micro, Small and Medium Enterprises",
            "document_type": "UDYAM_REGISTRATION_CERTIFICATE",
            "holder": "ABC Technologies Pvt. Ltd.",
            "verification_status": "VERIFIED",
            "issued_date": "2020-06-14",
            "doc_hash": "sha256:ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d"
        },
        {
            "document_id": "DL-PAN-2019-00201",
            "issuer": "Income Tax Department",
            "document_type": "PAN_VERIFICATION_RECORD",
            "holder": "XYZ Engineering Solutions Pvt. Ltd.",
            "verification_status": "VERIFIED",
            "issued_date": "2019-03-01",
            "doc_hash": "sha256:3b64db6bc7ced88907377112345b9a850e0e090a9b6b7d7b8756858a8a4746d0"
        }
    ]

def generate_bis():
    return [
        {
            "certificate_number": "CM/L-7890123",
            "company": "Kavach Safety & Shielding Solutions Pvt. Ltd.",
            "product": "Low Voltage Switchgear and Controlgear Assemblies",
            "standard_number": "IS/IEC 61439",
            "status": "VALID",
            "valid_until": "2027-10-31"
        },
        {
            "certificate_number": "CM/L-7890124",
            "company": "ABC Technologies Pvt. Ltd.",
            "product": "Industrial Electronic Control Units",
            "standard_number": "IS 13252",
            "status": "VALID",
            "valid_until": "2027-12-31"
        },
        {
            "certificate_number": "CM/L-7890125",
            "company": "Apex Automation Systems Pvt. Ltd.",
            "product": "Industrial Programmable Controllers",
            "standard_number": "IS/IEC 61131",
            "status": "VALID",
            "valid_until": "2027-05-31"
        }
    ]

def generate_blacklist():
    return [
        {
            "entity_name": "Bharat Heavy Spares Corp",
            "pan": "DEMOB7890C",
            "authority": "GeM Incident Management & Debarment Committee",
            "reference_number": "GEM-INC-2025-0891",
            "status": "UNDER_INVESTIGATION",
            "start_date": "2025-11-15",
            "end_date": "2026-11-14",
            "reason": "Repeated supply delay and non-submission of genuine OEM warranty certificate in Tender GEM/2025/B/90812.",
            "recommendation_flag": "Potential record found in GeM Debarment Watchlist — Procurement Officer Review Required"
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

def generate_tenders():
    return [
        {
            "tender_id": "GEM/2026/B/100001",
            "title": "Supply of Industrial Control Units",
            "department": "Public Sector Engineering Division",
            "ministry": "Ministry of Heavy Industries",
            "reference_number": "PSED-PROC-2026-ICU-01",
            "created_date": "2026-09-01",
            "closing_date": "2026-10-15",
            "estimated_value_inr": 45000000,
            "status": "UNDER_EVALUATION",
            "category": "Goods - Electronic Equipment",
            "bidders_count": 5,
            "description": "Procurement of programmable Industrial Control Units (IC-9000 class) with embedded real-time diagnostic telemetry, dual redundant power inputs, and Class-1 environmental compliance."
        },
        {
            "tender_id": "GEM/2026/B/100002",
            "title": "Supply of UAV Engine Components",
            "department": "Defense & Aerospace R&D Organisation",
            "ministry": "Ministry of Defence",
            "reference_number": "DARDO-AERO-2026-UAV-42",
            "created_date": "2026-09-10",
            "closing_date": "2026-11-01",
            "estimated_value_inr": 120000000,
            "status": "ACTIVE",
            "category": "Defence & Aerospace Products",
            "bidders_count": 3,
            "description": "High-precision titanium-alloy turbine blisk sets and electronic throttle governing assemblies for tactical UAV propulsion systems."
        },
        {
            "tender_id": "GEM/2026/B/100003",
            "title": "Supply of Electrical Protection Equipment",
            "department": "National Power Transmission Corp",
            "ministry": "Ministry of Power",
            "reference_number": "NPTC-SUBSTATION-2026-PROT-109",
            "created_date": "2026-09-15",
            "closing_date": "2026-10-30",
            "estimated_value_inr": 32000000,
            "status": "ACTIVE",
            "category": "Power & Electrical Gear",
            "bidders_count": 4,
            "description": "Numerical distance protection relays and high-speed busbar differential protection panels for 400kV automated grid substations."
        }
    ]

def generate_requirements():
    return [
        # Requirements for GEM/2026/B/100001 (Supply of Industrial Control Units)
        {
            "req_id": "REQ-100001-01",
            "tender_id": "GEM/2026/B/100001",
            "title": "GST Registration",
            "category": "STATUTORY",
            "mandatory": "YES",
            "condition": "Active GSTIN in bidder's legal name with regular returns filed.",
            "verification_source": "GSTN",
            "rule_code": "RULE_GST_ACTIVE",
            "weight": 10
        },
        {
            "req_id": "REQ-100001-02",
            "tender_id": "GEM/2026/B/100001",
            "title": "Permanent Account Number (PAN)",
            "category": "STATUTORY",
            "mandatory": "YES",
            "condition": "Valid PAN linked with registered corporate identity.",
            "verification_source": "ITD",
            "rule_code": "RULE_PAN_VALID",
            "weight": 10
        },
        {
            "req_id": "REQ-100001-03",
            "tender_id": "GEM/2026/B/100001",
            "title": "Udyam MSME Registration",
            "category": "MSME",
            "mandatory": "CONDITIONAL",
            "condition": "Required if bidder claims MSME price preference or EMD exemption.",
            "verification_source": "UDYAM",
            "rule_code": "RULE_UDYAM_CATEGORY",
            "weight": 8
        },
        {
            "req_id": "REQ-100001-04",
            "tender_id": "GEM/2026/B/100001",
            "title": "OEM Manufacturer Authorization Form (MAF)",
            "category": "TENDER_SPECIFIC",
            "mandatory": "YES",
            "condition": "Valid manufacturer authorization specifying tender item and valid beyond 2026-10-31.",
            "verification_source": "OEM_DOCUMENT",
            "rule_code": "RULE_OEM_AUTH_VALID",
            "weight": 15
        },
        {
            "req_id": "REQ-100001-05",
            "tender_id": "GEM/2026/B/100001",
            "title": "Make in India Local Content Declaration",
            "category": "MAKE_IN_INDIA",
            "mandatory": "YES",
            "condition": "Class-I Local Supplier declaration >= 50% domestic value addition.",
            "verification_source": "SELF_DECLARATION",
            "rule_code": "RULE_LOCAL_CONTENT_50",
            "weight": 15
        },
        {
            "req_id": "REQ-100001-06",
            "tender_id": "GEM/2026/B/100001",
            "title": "Income Tax Return (ITR) Acknowledgment",
            "category": "FINANCIAL",
            "mandatory": "YES",
            "condition": "ITR submission for Assessment Year 2025-26 (Financial Year 2024-25).",
            "verification_source": "ITD_DOCUMENT",
            "rule_code": "RULE_ITR_FILED",
            "weight": 10
        },
        {
            "req_id": "REQ-100001-07",
            "tender_id": "GEM/2026/B/100001",
            "title": "EPFO Statutory Compliance",
            "category": "STATUTORY",
            "mandatory": "CONDITIONAL",
            "condition": "Applicable for commercial establishments with >= 20 staff; active ECR filing.",
            "verification_source": "EPFO",
            "rule_code": "RULE_EPFO_COMPLIANT",
            "weight": 8
        },
        {
            "req_id": "REQ-100001-08",
            "tender_id": "GEM/2026/B/100001",
            "title": "ESIC Statutory Registration",
            "category": "STATUTORY",
            "mandatory": "CONDITIONAL",
            "condition": "Valid employer code and up-to-date contribution returns.",
            "verification_source": "ESIC",
            "rule_code": "RULE_ESIC_COMPLIANT",
            "weight": 8
        },
        {
            "req_id": "REQ-100001-09",
            "tender_id": "GEM/2026/B/100001",
            "title": "DPIIT Startup Recognition",
            "category": "STARTUP",
            "mandatory": "CONDITIONAL",
            "condition": "Required if claiming prior experience & turnover exemption under GFR 173(i).",
            "verification_source": "DPIIT",
            "rule_code": "RULE_DPIIT_STARTUP",
            "weight": 6
        },
        {
            "req_id": "REQ-100001-10",
            "tender_id": "GEM/2026/B/100001",
            "title": "Non-Blacklisting & Integrity Declaration",
            "category": "ELIGIBILITY",
            "mandatory": "YES",
            "condition": "Not debarred or under investigation by GeM, CVC, or any Central/State Ministry.",
            "verification_source": "CENTRAL_DEBARMENT_REGISTRY",
            "rule_code": "RULE_NON_BLACKLISTED",
            "weight": 10
        }
    ]

def main():
    files = {
        "bidders.json": generate_bidders(),
        "gst.json": generate_gst(),
        "udyam.json": generate_udyam(),
        "mca.json": generate_mca(),
        "epfo.json": generate_epfo(),
        "esic.json": generate_esic(),
        "dpiit.json": generate_dpiit(),
        "nsic.json": generate_nsic(),
        "digilocker.json": generate_digilocker(),
        "bis.json": generate_bis(),
        "blacklist.json": generate_blacklist(),
        "tenders.json": generate_tenders(),
        "requirements.json": generate_requirements()
    }

    for filename, data in files.items():
        filepath = DATA_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Generated {filepath} ({len(data)} items)")

if __name__ == "__main__":
    main()

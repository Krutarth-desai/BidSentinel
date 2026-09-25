"""
backend/app/mock_connectors/connectors.py
Individual Mock Government Connectors for GST, Udyam, MCA, EPFO, ESIC, DPIIT, NSIC, DigiLocker, BIS, and Blacklist.
All clearly labeled: 'Prototype / Mock Government Connector'.
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
from app.core.config import DATA_DIR
from app.mock_connectors.base import GovernmentConnector, ConnectorResult

def _load_json(filename: str) -> List[Dict[str, Any]]:
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


class GSTConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "gst"

    @property
    def display_name(self) -> str:
        return "GSTN (Goods & Services Tax Network)"

    def query(self, gstin: str, **kwargs) -> ConnectorResult:
        records = _load_json("gst.json")
        gstin_clean = gstin.strip().upper()
        match = next((r for r in records if r.get("gstin", "").upper() == gstin_clean), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["GSTIN not found in GSTN database"],
                message=f"No registration record located for GSTIN {gstin_clean}"
            )

        status = match.get("status", "INACTIVE")
        is_active = (status == "ACTIVE")
        flags = []
        if not is_active:
            flags.append(f"GST registration status is {status}")
        if match.get("return_status") != "FILED":
            flags.append(f"Recent GST return status: {match.get('return_status')}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_active and (match.get("return_status") == "FILED"),
            status=status,
            data=match,
            flags=flags,
            message=f"GSTIN {gstin_clean} verified active in state of {match.get('state')}." if is_active else f"GSTIN {gstin_clean} is {status} in GSTN database."
        )


class UdyamConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "udyam"

    @property
    def display_name(self) -> str:
        return "Udyam Registration Portal (Ministry of MSME)"

    def query(self, udyam_number: str, **kwargs) -> ConnectorResult:
        records = _load_json("udyam.json")
        clean_num = udyam_number.strip().upper()
        match = next((r for r in records if r.get("udyam_number", "").upper() == clean_num), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["Udyam number not found in MSME registry"],
                message=f"No MSME registration found for {clean_num}"
            )

        status = match.get("status", "ACTIVE")
        is_active = (status == "ACTIVE")
        flags = []
        if not is_active:
            flags.append(f"Udyam registration is {status}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_active,
            status=status,
            data=match,
            flags=flags,
            message=f"Enterprise registered as {match.get('enterprise_type')} under Udyam {clean_num}."
        )


class MCAConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "mca"

    @property
    def display_name(self) -> str:
        return "Ministry of Corporate Affairs (MCA21)"

    def query(self, cin_or_name: str, **kwargs) -> ConnectorResult:
        records = _load_json("mca.json")
        query_val = cin_or_name.strip().upper()
        match = next((r for r in records if r.get("cin", "").upper() == query_val or r.get("company_name", "").upper() == query_val), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["Company record not found in MCA21 registry"],
                message=f"No corporate record located for {query_val}"
            )

        status = match.get("company_status", "ACTIVE")
        is_active = (status == "ACTIVE")
        flags = []
        if not is_active:
            flags.append(f"MCA corporate status is {status}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_active,
            status=status,
            data=match,
            flags=flags,
            message=f"Company status is {status} with authorized capital INR {match.get('authorized_capital_inr', 0):,}."
        )


class EPFOConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "epfo"

    @property
    def display_name(self) -> str:
        return "Employees' Provident Fund Organisation (EPFO)"

    def query(self, establishment_id: str, **kwargs) -> ConnectorResult:
        records = _load_json("epfo.json")
        clean_id = establishment_id.strip().upper()
        match = next((r for r in records if r.get("establishment_id", "").upper() == clean_id), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["Establishment ID not found in EPFO portal"],
                message=f"No EPFO record for {clean_id}"
            )

        comp_status = match.get("compliance_status", "PENDING_DUES")
        is_compliant = (comp_status == "COMPLIANT")
        flags = []
        if not is_compliant:
            flags.append(f"EPFO compliance status is {comp_status}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_compliant,
            status=comp_status,
            data=match,
            flags=flags,
            message=f"EPFO returns filed up to {match.get('last_ecr_month', 'N/A')} for {match.get('covered_employees', 0)} employees."
        )


class ESICConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "esic"

    @property
    def display_name(self) -> str:
        return "Employees' State Insurance Corporation (ESIC)"

    def query(self, employer_id: str, **kwargs) -> ConnectorResult:
        records = _load_json("esic.json")
        clean_id = employer_id.strip()
        match = next((r for r in records if r.get("employer_id", "") == clean_id), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["Employer code not found in ESIC database"],
                message=f"No ESIC registration found for {clean_id}"
            )

        comp_status = match.get("compliance_status", "PENDING_VERIFICATION")
        is_compliant = (comp_status == "COMPLIANT")
        flags = []
        if not is_compliant:
            flags.append(f"ESIC compliance status is {comp_status}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_compliant,
            status=comp_status,
            data=match,
            flags=flags,
            message=f"ESIC status: {comp_status} (Last return month: {match.get('last_contribution_month', 'N/A')})."
        )


class DPIITConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "dpiit"

    @property
    def display_name(self) -> str:
        return "DPIIT Startup India Portal"

    def query(self, cert_or_name: str, **kwargs) -> ConnectorResult:
        records = _load_json("dpiit.json")
        clean_val = cert_or_name.strip().upper()
        match = next((r for r in records if r.get("certificate_number", "").upper() == clean_val or r.get("startup_name", "").upper() == clean_val), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["Startup recognition not found in DPIIT registry"],
                message=f"No DPIIT Startup India certificate for {clean_val}"
            )

        is_valid = (match.get("validity_status") == "VALID")
        flags = []
        if not is_valid:
            flags.append(f"Startup recognition status: {match.get('validity_status')}")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_valid,
            status=match.get("recognition_status", "RECOGNIZED"),
            data=match,
            flags=flags,
            message=f"Recognized Startup in sector '{match.get('sector')}' valid until {match.get('valid_until')}."
        )


class NSICConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "nsic"

    @property
    def display_name(self) -> str:
        return "National Small Industries Corporation (NSIC - SPRS)"

    def query(self, enterprise_name: str, **kwargs) -> ConnectorResult:
        records = _load_json("nsic.json")
        clean_name = enterprise_name.strip().upper()
        match = next((r for r in records if clean_name in r.get("enterprise_name", "").upper() or r.get("enterprise_name", "").upper() in clean_name), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["No active NSIC SPRS certificate found"],
                message=f"No NSIC registration for {clean_name}"
            )

        is_valid = (match.get("status") == "VALID")
        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_valid,
            status=match.get("status", "VALID"),
            data=match,
            flags=[],
            message=f"Registered under SPRS scheme with monetary limit INR {match.get('monetary_limit_inr', 0):,}."
        )


class DigiLockerConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "digilocker"

    @property
    def display_name(self) -> str:
        return "DigiLocker National Document Exchange"

    def query(self, doc_type_or_holder: str, **kwargs) -> ConnectorResult:
        records = _load_json("digilocker.json")
        holder_name = kwargs.get("holder", "").strip().upper()
        doc_type = doc_type_or_holder.strip().upper()

        match = None
        for r in records:
            if doc_type in r.get("document_type", "").upper():
                if not holder_name or (holder_name in r.get("holder", "").upper()):
                    match = r
                    break

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_VERIFIED",
                flags=["Document not anchored in DigiLocker repository"],
                message=f"No electronic certificate found in DigiLocker for {doc_type}"
            )

        is_ver = (match.get("verification_status") == "VERIFIED")
        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_ver,
            status=match.get("verification_status", "VERIFIED"),
            data=match,
            flags=[],
            message=f"Cryptographically verified by {match.get('issuer')} (Issued {match.get('issued_date')})."
        )


class BISConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "bis"

    @property
    def display_name(self) -> str:
        return "Bureau of Indian Standards (BIS Portal)"

    def query(self, company_name: str, **kwargs) -> ConnectorResult:
        records = _load_json("bis.json")
        clean_name = company_name.strip().upper()
        match = next((r for r in records if clean_name in r.get("company", "").upper() or r.get("company", "").upper() in clean_name), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["No BIS product conformity license located"],
                message=f"No BIS license found for {clean_name}"
            )

        is_valid = (match.get("status") == "VALID")
        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_valid,
            status=match.get("status", "VALID"),
            data=match,
            flags=[] if is_valid else [f"BIS License status: {match.get('status')}"],
            message=f"Conformity license {match.get('certificate_number')} for standard {match.get('standard_number')} (Valid until {match.get('valid_until')})."
        )


class BlacklistConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "blacklist"

    @property
    def display_name(self) -> str:
        return "Central Debarment & Debarment Watchlist (CVC / GeM)"

    def query(self, entity_or_pan: str, **kwargs) -> ConnectorResult:
        records = _load_json("blacklist.json")
        clean_val = entity_or_pan.strip().upper()
        match = next((r for r in records if clean_val in r.get("entity_name", "").upper() or clean_val == r.get("pan", "").upper()), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=True, # Clean - no adverse records
                status="CLEAN",
                flags=[],
                message="No adverse records or debarment listings found in Central Watchlist."
            )

        # IMPORTANT SIH RULE: Never auto-disqualify. Show: "Potential record found — Officer Review Required"
        status = match.get("status", "UNDER_INVESTIGATION")
        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=False, # Flagged for officer review!
            status=status,
            data=match,
            flags=[
                f"Potential record found in {match.get('authority')} Watchlist ({match.get('reference_number')}). Officer Review Required.",
                f"Reason: {match.get('reason')}"
            ],
            message="Potential record found — Officer Review Required."
        )


class ITDConnector(GovernmentConnector):
    @property
    def name(self) -> str:
        return "itd"

    @property
    def display_name(self) -> str:
        return "Income Tax Department (ITD / NSDL PAN Portal)"

    def query(self, pan_number: str, **kwargs) -> ConnectorResult:
        records = _load_json("pan.json")
        clean_pan = pan_number.strip().upper()
        match = next((r for r in records if r.get("pan", "").upper() == clean_pan), None)

        if not match:
            return ConnectorResult(
                connector_name=self.name,
                display_name=self.display_name,
                found=False,
                verified=False,
                status="NOT_FOUND",
                flags=["PAN record not located in ITD/NSDL database"],
                message=f"No taxpayer record found for PAN {clean_pan}"
            )

        status = match.get("pan_status", "ACTIVE")
        is_active = (status == "ACTIVE")
        flags = []
        if not is_active:
            flags.append(f"PAN status is {status}")
        if match.get("has_tax_notice"):
            flags.append(f"Active Tax Scrutiny Notice: Outstanding demand INR {match.get('tax_demand_pending_cr', 0)} Cr")
        if match.get("itr_filed_ay_2024_25") != "Filed":
            flags.append("ITR AY 2024-25 not filed")

        return ConnectorResult(
            connector_name=self.name,
            display_name=self.display_name,
            found=True,
            verified=is_active and not match.get("has_tax_notice"),
            status=status,
            data=match,
            flags=flags,
            message=f"PAN {clean_pan} is {status} in Income Tax Department records for {match.get('pan_holder_name')}."
        )


"""
backend/app/mock_connectors/registry.py
Connector registry for looking up and querying government data sources.
"""

from typing import Dict, Any, List
from app.mock_connectors.base import GovernmentConnector, ConnectorResult
from app.mock_connectors.connectors import (
    GSTConnector,
    UdyamConnector,
    MCAConnector,
    EPFOConnector,
    ESICConnector,
    DPIITConnector,
    NSICConnector,
    DigiLockerConnector,
    BISConnector,
    BlacklistConnector,
    ITDConnector
)

class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, GovernmentConnector] = {
            "gst": GSTConnector(),
            "udyam": UdyamConnector(),
            "mca": MCAConnector(),
            "epfo": EPFOConnector(),
            "esic": ESICConnector(),
            "dpiit": DPIITConnector(),
            "nsic": NSICConnector(),
            "digilocker": DigiLockerConnector(),
            "bis": BISConnector(),
            "blacklist": BlacklistConnector(),
            "itd": ITDConnector(),
            "pan": ITDConnector()
        }

    def get(self, name: str) -> GovernmentConnector:
        name_clean = name.lower().strip()
        if name_clean in self._connectors:
            return self._connectors[name_clean]
        raise ValueError(f"Unknown government connector: {name}")

    def query_all_for_bidder(self, bidder_dict: Dict[str, Any]) -> Dict[str, ConnectorResult]:
        """Perform unified multi-authority statutory lookups for a bidder profile."""
        results = {}
        # GST
        if bidder_dict.get("gstin"):
            results["gst"] = self.get("gst").query(bidder_dict["gstin"])

        # Udyam
        if bidder_dict.get("udyam_number"):
            results["udyam"] = self.get("udyam").query(bidder_dict["udyam_number"])

        # MCA
        if bidder_dict.get("cin"):
            results["mca"] = self.get("mca").query(bidder_dict["cin"])
        elif bidder_dict.get("company_name"):
            results["mca"] = self.get("mca").query(bidder_dict["company_name"])

        # EPFO
        if bidder_dict.get("epfo_id"):
            results["epfo"] = self.get("epfo").query(bidder_dict["epfo_id"])

        # ESIC
        if bidder_dict.get("esic_id"):
            results["esic"] = self.get("esic").query(bidder_dict["esic_id"])

        # DPIIT
        if bidder_dict.get("startup_certificate"):
            results["dpiit"] = self.get("dpiit").query(bidder_dict["startup_certificate"])
        elif bidder_dict.get("company_name") and bidder_dict.get("claimed_startup_benefit"):
            results["dpiit"] = self.get("dpiit").query(bidder_dict["company_name"])

        # NSIC
        if bidder_dict.get("company_name") and bidder_dict.get("nsic_status") == "REGISTERED":
            results["nsic"] = self.get("nsic").query(bidder_dict["company_name"])

        # BIS
        if bidder_dict.get("company_name"):
            results["bis"] = self.get("bis").query(bidder_dict["company_name"])

        # ITD / PAN
        if bidder_dict.get("pan"):
            results["itd"] = self.get("itd").query(bidder_dict["pan"])
            results["pan"] = results["itd"]

        # Blacklist / Debarment Screening
        search_term = bidder_dict.get("pan") or bidder_dict.get("company_name", "")
        results["blacklist"] = self.get("blacklist").query(search_term)

        return results

connector_registry = ConnectorRegistry()

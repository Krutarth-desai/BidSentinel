"""
backend/app/mock_connectors/base.py
Abstract base class for all Government Integration Connectors.
Follows adapter pattern so mock data can seamlessly be replaced with live authorized APIs.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ConnectorResult(BaseModel):
    connector_name: str
    display_name: str
    source_label: str = "Prototype / Mock Government Connector"
    is_live_api: bool = False
    found: bool = False
    verified: bool = False
    status: str = "UNKNOWN"
    data: Optional[Dict[str, Any]] = None
    flags: List[str] = []
    message: str = ""

class GovernmentConnector(ABC):
    @property
    @abstractmethod
    def name(self) -> str:
        """Unique identifier of the connector (e.g. 'gst', 'udyam')."""
        pass

    @property
    @abstractmethod
    def display_name(self) -> str:
        """Human-readable name of the authority/system."""
        pass

    @property
    def source_label(self) -> str:
        return f"{self.display_name} — Prototype Mock Connector"

    @abstractmethod
    def query(self, identifier: str, **kwargs) -> ConnectorResult:
        """Perform lookup against mock data or production API."""
        pass

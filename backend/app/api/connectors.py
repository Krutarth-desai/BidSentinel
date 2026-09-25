"""
backend/app/api/connectors.py
Endpoints for inspecting and testing Government Integration Connectors.
Clearly labels all integrations as Prototype Mock Connectors.
"""

from fastapi import APIRouter, Query, HTTPException
from app.mock_connectors.registry import connector_registry

router = APIRouter(prefix="/connectors", tags=["Government Connectors"])

@router.get("/list")
def list_connectors():
    """Lists all available mock government connectors and their operational status."""
    connectors = [
        {"id": "gst", "name": "GSTN", "title": "Goods & Services Tax Network", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "udyam", "name": "Udyam", "title": "Ministry of MSME Udyam Portal", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "mca", "name": "MCA21", "title": "Ministry of Corporate Affairs", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "epfo", "name": "EPFO", "title": "Employees' Provident Fund Organisation", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "esic", "name": "ESIC", "title": "Employees' State Insurance Corporation", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "dpiit", "name": "DPIIT", "title": "Startup India Recognition Registry", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "nsic", "name": "NSIC", "title": "Single Point Registration Scheme", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "digilocker", "name": "DigiLocker", "title": "National Digital Document Exchange", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "bis", "name": "BIS", "title": "Bureau of Indian Standards Portal", "type": "Mock Connector", "status": "ONLINE (MOCK)"},
        {"id": "blacklist", "name": "Debarment Registry", "title": "CVC & GeM Debarment Watchlist", "type": "Mock Connector", "status": "ONLINE (MOCK)"}
    ]
    return {
        "prototype_mode": True,
        "connector_count": len(connectors),
        "source_label": "Prototype / Mock Government Connector",
        "connectors": connectors
    }

@router.get("/query/{connector_id}")
def test_query_connector(
    connector_id: str,
    identifier: str = Query(..., description="Query identifier (GSTIN, Udyam No, PAN, CIN, etc.)")
):
    """Direct lookup test against a specific government connector."""
    try:
        conn = connector_registry.get(connector_id)
        res = conn.query(identifier)
        return res
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

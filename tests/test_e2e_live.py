"""
tests/test_e2e_live.py
Live End-to-End API Integration Test against the running BidSentinel backend.
"""

import json
import urllib.request
import pytest

BASE_URL = "http://127.0.0.1:8000/api/v1"

def post_json(endpoint: str, data: dict, token: str = None) -> dict:
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(endpoint: str, token: str = None) -> dict:
    url = f"{BASE_URL}{endpoint}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def test_live_officer_workflow():
    # 1. Login
    auth_resp = post_json("/auth/login", {
        "username": "officer@gem-demo.gov.in",
        "password": "demo123"
    })
    token = auth_resp.get("access_token")
    assert token is not None, "Login should return access_token"

    # 2. Get dashboard overview
    dash = get_json("/dashboard/overview", token=token)
    assert "kpi" in dash
    assert dash["kpi"]["active_tenders"] >= 3

    # 3. List tenders and bidders
    tenders = get_json("/tenders/", token=token)
    assert len(tenders) >= 3

    bidders = get_json("/bidders/", token=token)
    assert len(bidders) >= 10

    # 4. Trigger AI verification for Bharat Heavy Components (BID003)
    # Expected: High Risk, around 70% compliance score, local content shortfall
    ver_res = post_json("/verification/run", {
        "tender_id": "TND001",
        "bidder_id": "BID003"
    }, token=token)

    assert ver_res["bidder_id"] == "BID003"
    assert ver_res["risk_level"] == "HIGH"
    assert 50 <= ver_res["compliance_score"] <= 75
    assert len(ver_res["findings"]) > 0
    assert len(ver_res["requirement_results"]) >= 8
    assert "Procurement Officer authority" in ver_res["ai_recommendation"]

    # 5. Submit Procurement Officer Decision
    dec_res = post_json("/decisions/", {
        "tender_id": "TND001",
        "bidder_id": "BID003",
        "decision": "CLARIFICATION_REQUESTED",
        "comments": "Requesting updated OEM Authorization and proof of Local Content meeting 50% threshold.",
        "officer_name": "Dr. Rajeshwar Sharma, IAS"
    }, token=token)

    assert dec_res["decision"] == "CLARIFICATION_REQUESTED"
    assert dec_res["officer_email"] == "officer@gem-demo.gov.in"

    # 6. Verify Audit Trail entry was recorded
    audits = get_json("/audit/", token=token)
    assert len(audits) >= 1
    recent_action = audits[0]
    assert recent_action["user"] == "officer@gem-demo.gov.in"

    # 7. Check Mock Connectors status
    conn_data = get_json("/connectors/list", token=token)
    assert conn_data["connector_count"] >= 10
    assert conn_data["prototype_mode"] is True

    print("\n--- ALL 7 LIVE E2E WORKFLOW PHASES VERIFIED SUCCESSFULLY ---")

if __name__ == "__main__":
    test_live_officer_workflow()

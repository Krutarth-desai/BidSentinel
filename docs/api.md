# BidSentinel REST API Reference

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication
### `POST /auth/login`
- **Request**:
  ```json
  {
    "username": "officer@gem-demo.gov.in",
    "password": "demo123"
  }
  ```
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "email": "officer@gem-demo.gov.in",
      "full_name": "Dr. Rajeshwar Sharma, IAS",
      "role": "PROCUREMENT_OFFICER"
    }
  }
  ```

### `GET /auth/me`
Returns the authenticated Procurement Officer's profile.

---

## 2. Dashboard Overview
### `GET /dashboard/overview`
Returns high-level statistics for KPI metric cards:
- Active Tenders
- Bidders Under Verification
- Pending Reviews
- High Risk Bidders
- Average Compliance Score
- Recent Audit Activities

---

## 3. Tender Management
- `GET /tenders/`: List all tenders with requirement and bidder counts.
- `GET /tenders/{id}`: Detailed specifications and extracted compliance criteria.
- `POST /tenders/`: Create new tender and auto-extract requirements.
- `POST /tenders/load-demo`: Preload 3 official demo tenders and criteria.
- `POST /tenders/{id}/extract-requirements`: Trigger AI requirement extraction on uploaded tender specification.
- `POST /tenders/{id}/requirements`: Add custom requirement.
- `DELETE /tenders/{id}/requirements/{req_id}`: Remove a requirement.

---

## 4. Bidder Management
- `GET /bidders/`: List all synthetic bidders with current scores and risk levels.
- `GET /bidders/{id}`: Retrieve detailed bidder profile, submitted documents, latest verification result, and officer decision.

---

## 5. AI Verification Engine
### `POST /verification/run`
- **Request**:
  ```json
  {
    "tender_id": "GEM/2026/B/100001",
    "bidder_id": "BID-001"
  }
  ```
- **Response**:
  ```json
  {
    "tender_id": "GEM/2026/B/100001",
    "bidder_id": "BID-001",
    "compliance_score": 96,
    "risk_level": "LOW",
    "score_breakdown": {
      "statutory": 25.0,
      "tender_specific": 30.0,
      "document_verification": 25.0,
      "govt_verification": 20.0
    },
    "findings": [...],
    "ai_recommendation": "...",
    "requirement_results": [...]
  }
  ```

### `POST /verification/run-all`
One-click demo batch run for all demo bidders.

---

## 6. Officer Decisions
### `POST /decisions/`
- **Request**:
  ```json
  {
    "tender_id": "GEM/2026/B/100001",
    "bidder_id": "BID-001",
    "decision": "APPROVED",
    "comments": "Statutory registrations verified and compliant with tender terms."
  }
  ```

---

## 7. Reports & Compliance Dossier
- `GET /reports/{tender_id}/{bidder_id}`: Complete JSON compliance report data.
- `GET /reports/{tender_id}/{bidder_id}/html`: High-fidelity, print-ready, government formatted verification dossier.

---

## 8. Government Connectors
- `GET /connectors/list`: Status of all 10 mock government connectors.
- `GET /connectors/query/{connector_id}?identifier=...`: Direct test interface for testing live/mock connector responses.

---

## 9. Audit Trail
- `GET /audit/?limit=50`: Paginated, immutable audit trail events.

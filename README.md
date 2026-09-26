# BidSentinel — AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

[![SIH 2026 Prototype](https://img.shields.io/badge/SIH_2026-Prototype_Ready-blue.svg)](https://github.com/Krutarth-desai/BidSentinel)
[![Backend](https://img.shields.io/badge/Backend-FastAPI_Python_3.11+-009688.svg)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js_15_TypeScript_Tailwind-black.svg)](https://nextjs.org)
[![Tests](https://img.shields.io/badge/Tests-28_Passed-success.svg)](https://docs.pytest.org)

An enterprise-grade, decision-support platform designed for **Government e-Marketplace (GeM) Procurement Officers**. BidSentinel automates the extraction, statutory cross-verification, and risk assessment of bidder eligibility, corporate identities, and technical compliance criteria, while guaranteeing strict **Human-in-the-Loop governance**.

---

## 1. Problem Statement & Mission

In high-value public procurement, officers manually verify dozens of statutory and technical criteria across disparate portals (GSTN, Udyam MSME, MCA21, EPFO, ESIC, DPIIT, NSIC, BIS, and central vigilance watchlists). This manual workflow is vulnerable to:
- Overlooked statutory disqualifications and inactive GSTINs.
- Inconsistent legal naming variations between incorporation records and tender bids.
- Sub-threshold domestic local content claims under the Make in India (MII) order.
- Expired manufacturer authorizations (OEM MAF forms).
- Undetected debarment listings.

**BidSentinel solves this by providing a unified AI verification console** that cross-checks self-declared bidder profiles against submitted OCR document extractions and government registries, scoring compliance and highlighting discrepancies with granular evidence.

> **CRITICAL SIH PRINCIPLE:** The AI is strictly a **decision-support system**. It **NEVER** makes the final qualification or disqualification decision. The final decision remains with the authorized Procurement Officer, and all determinations require signed justifications stored in an immutable audit trail.

---

## 2. System Architecture

```text
┌────────────────────────────────────────────────────────┐
│               Procurement Officer UI                   │
│   (Next.js 15, React 19, TypeScript, Tailwind CSS)     │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API (JSON)
┌──────────────────────────▼─────────────────────────────┐
│                    FastAPI Backend                     │
│  (Auth, Tender Services, Bidder Services, Audit Trail) │
└──────┬───────────────────┬───────────────────┬─────────┘
       │                   │                   │
┌──────▼──────┐     ┌──────▼────────┐   ┌──────▼─────────┐
│  AI Engine  │     │  Rule Engine  │   │  Audit Engine  │
│ OCR/Extract │     │ Deterministic │   │   Immutable    │
│ Classifier  │     │ Scoring & Risk│   │   Event Logs   │
└──────┬──────┘     └──────┬────────┘   └────────────────┘
       │                   │
┌──────▼───────────────────▼─────────────────────────────┐
│     Government Connector Adapter Bus (10 Authorities)   │
│  GSTN | Udyam | MCA21 | EPFO | ESIC | DPIIT | NSIC    │
│         DigiLocker | BIS | Debarment Watchlist         │
└────────────────────────────────────────────────────────┘
```

### Verification Decision Chain (Evidence Viewer)
```text
Document Evidence ──> Extracted Field ──> Authority Source ──> Compliance Rule ──> Confidence & Score
```

---

## 3. Technology Stack

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Uvicorn, Pydantic v2.
- **Database:** SQLite (default zero-config local engine), seamlessly portable to PostgreSQL/Supabase via `DATABASE_URL`.
- **AI / Document Pipeline:** Text extraction, document classification, regex entity parsing, requirement extraction, fuzzy Jaccard/Levenshtein matching.
- **Testing:** Pytest (28 automated tests covering all statutory rules, edge cases, and scoring).

---

## 4. Repository Structure

```text
BidSentinel/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entrypoint
│   │   ├── core/                       # Security, token management, settings
│   │   ├── db/                         # SQLAlchemy models & database session
│   │   ├── schemas/                    # Pydantic validation schemas
│   │   ├── api/                        # REST API routers (auth, tenders, bidders, etc.)
│   │   ├── ai_engine/                  # Document classifier, OCR, field & criteria extraction
│   │   ├── compliance_engine/          # Rule engine, cross-validator, scoring & risk engines
│   │   ├── mock_connectors/            # 10 pluggable government connector adapters
│   │   └── services/                   # Verification and audit logging services
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/                        # Next.js App Router pages
│   │   │   ├── page.tsx                # Officer login & welcome
│   │   │   ├── dashboard/              # Executive KPI dashboard
│   │   │   ├── tenders/                # Tender list & AI-extracted criteria
│   │   │   ├── bidders/                # Bidder registry & document dossiers
│   │   │   ├── verification/           # AI Verification Console & One-Click Demo
│   │   │   ├── audit/                  # Immutable Audit Trail
│   │   │   ├── connectors/             # Government Connectors Explorer
│   │   │   └── reports/                # Printable/Downloadable Compliance Dossier
│   │   ├── components/                 # Reusable UI widgets (EvidenceModal, DecisionModal, etc.)
│   │   └── lib/                        # API client, TypeScript types, utilities
│   ├── package.json
│   └── Dockerfile
├── data/                               # Synthetic mock government datasets (JSON)
├── documents/                          # Pre-seeded document samples
├── scripts/
│   ├── generate_mock_data.py           # Dataset generator
│   └── seed_database.py                # Database population script
├── tests/
│   └── test_compliance.py              # 28 automated pytest test cases
├── docs/
│   ├── architecture.md                 # Deep-dive architectural specification
│   ├── api.md                          # REST API specification
│   └── demo.md                         # SIH 2026 Judge Walkthrough Script
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 5. Quickstart & Installation

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm
- Git

### 🚀 One-Click Run (Recommended)
You can directly run the entire platform (both FastAPI backend and Next.js frontend with auto-checks and auto-seed) using:
```bash
python run.py
```
This automatically verifies prerequisites, launches both servers, and opens `http://localhost:3000` in your default browser.

---

### Manual Setup & Execution (Alternative)

#### 1. Setup Backend
```bash
cd backend
python -m venv .venv

# Activate venv:
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### 2. Generate Data & Seed Database
```bash
cd ..
python scripts/generate_mock_data.py
python scripts/seed_database.py
```

#### 3. Run Backend API Server
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation (Swagger UI): `http://localhost:8000/docs`

#### 4. Setup & Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Portal: `http://localhost:3000`

---

## 6. Official SIH Demo Credentials

- **URL:** `http://localhost:3000`
- **Username:** `officer@gem-demo.gov.in`
- **Password:** `demo123`
*(A convenient **"Auto-Fill Demo Credentials"** button is provided on the login page).*

---

## 7. Preloaded SIH Evaluation Scenarios

| Scenario | Bidder | Score | Risk | Issues Demonstrated |
| :--- | :--- | :---: | :---: | :--- |
| **A. Fully Compliant** | ABC Technologies Pvt. Ltd. | **96 / 100** | **LOW** | Benchmark bidder. Active GST, valid Udyam Small, valid OEM auth, 68.5% local content >= 50%. |
| **B. Missing Financials** | XYZ Engineering Solutions Pvt. Ltd. | **74 / 100** | **MEDIUM** | Missing ITR FY 2025-26, ESIC verification pending in portal, OEM auth expiring in 15 days. |
| **C. Material Failures** | PQR Industrial Systems Pvt. Ltd. | **58 / 100** | **HIGH** | GST legal name mismatch vs MCA, Udyam registered name discrepancy, local content 38% < 50%, expired OEM auth. |
| **D. Startup Exemption** | Zenith Micro Devices LLP | **82 / 100** | **MEDIUM** | Startup DPIIT certified; claims turnover exemption under GFR 173(i); minor return delay. |
| **E. Debarment Watchlist** | Bharat Heavy Spares Corp | **42 / 100** | **HIGH** | Inactive GST status; Potential match found on GeM Incident Debarment list requiring officer review. |

---

## 8. Automated Testing

Run the automated test suite covering all statutory rules, entity cross-matching, risk determination, and scoring breakdowns:

```bash
pytest tests/test_compliance.py -v
```

**Results:** `28 passed in 0.17s`

---

## 9. Mock Government Connectors

All connectors follow an adapter architecture extending the `GovernmentConnector` base class and are clearly watermarked as **"Prototype / Mock Government Connector"**:

1. **GSTN Connector:** Validates active GSTIN, legal name concordance, return filing period.
2. **Udyam MSME Connector:** Validates enterprise classification (Micro, Small, Medium) and status.
3. **MCA21 Connector:** Validates corporate status, CIN, authorized capital, and registered address.
4. **EPFO Connector:** Validates establishment code and monthly ECR contribution status.
5. **ESIC Connector:** Validates employer registration and up-to-date contribution filings.
6. **DPIIT Startup Connector:** Validates Startup India recognition number and sector eligibility.
7. **NSIC Connector:** Validates Single Point Registration Scheme (SPRS) validity and monetary limit.
8. **DigiLocker Connector:** Validates cryptographically anchored document hashes and issuers.
9. **BIS Connector:** Validates product standard conformity license numbers.
10. **Debarment Watchlist Connector:** Screens against CVC, GeM Incident Management, and Ministry blacklists.

---

## 10. Future Production Integrations & Security

- **Production APIs:** Connectors can be switched to live OAuth2/mTLS API endpoints for GSTN (via GSP/ASP), MCA V3 APIs, and DigiLocker APIs simply by updating connector adapter classes.
- **Role-Based Access Control:** Separate roles for Verification Assistants, Senior Procurement Officers, and Vigilance Auditors.
- **Digital Signatures:** Integration with DSC (Digital Signature Certificates) / eSign for official determination sign-offs.
- **Untrusted File Sandboxing:** Uploaded documents are treated as untrusted inputs and processed in isolated worker sandboxes.

---

## 11. License & Disclaimer

Developed for the **Smart India Hackathon (SIH 2026)**.
This software is a prototype decision-support tool. It does not replace the statutory authority of designated procurement officers under the General Financial Rules (GFR 2017) or GeM guidelines.

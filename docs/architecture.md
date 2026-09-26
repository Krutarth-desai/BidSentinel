# BidSentinel Architecture & System Design
**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**
*Smart India Hackathon (SIH 2026) Prototype*

---

## 1. System Overview

**BidSentinel** is an enterprise-grade AI decision-support platform designed specifically for Government e-Marketplace (GeM) Procurement Officers. The system automates the labor-intensive, error-prone verification of statutory eligibility, technical tender criteria, document authenticity, and vigilance/debarment status, while guaranteeing that **the final qualification or disqualification decision remains strictly with the human Procurement Officer**.

```text
┌────────────────────────────────────────────────────────┐
│               Procurement Officer UI                   │
│   (Next.js 14/15, Tailwind CSS, Lucide, App Router)    │
└──────────────────────────┬─────────────────────────────┘
                           │ REST API / JSON
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
│       Government Connector Adapter Bus (10 Sources)    │
│  GSTN | Udyam | MCA21 | EPFO | ESIC | DPIIT | NSIC    │
│         DigiLocker | BIS | Debarment Watchlist         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Core Design Principles

1. **Human-in-the-Loop Governance (Non-Negotiable)**
   - AI and rules provide decision support, finding highlights, discrepancy flags, and compliance scores.
   - The platform **NEVER** issues an automated final disqualification or qualification.
   - Every officer decision requires justification comments recorded in an immutable audit trail.

2. **Adapter/Connector Extensibility**
   - All government data sources are abstracted through a uniform `GovernmentConnector` interface.
   - Prototype currently leverages rich synthetic JSON datasets in `data/`.
   - Production migration requires only swapping connector query implementations with authorized REST/SOAP government endpoints without touching frontend or rule logic.

3. **Multi-Source Cross-Verification Engine**
   - Cross-checks across 4 separate dimensions:
     1. **Bidder Profile** (Self-declared data on GeM)
     2. **Submitted Documents** (Extracted OCR fields)
     3. **Government Registries** (Statutory source records)
     4. **Tender Requirements** (Mandatory thresholds & tender-specific conditions)

4. **Transparent Explainability & Evidence Drilling**
   - Every compliance check provides a verifiable evidence trail:
     `Document -> Extracted Field -> Government Source -> Rule -> Verification Result & Confidence %`.

---

## 3. Component Details

### 3.1 AI Document Processing Pipeline
```text
Uploaded Document (PDF / PNG / JPEG / TXT)
                  │
                  ▼
         Format & Size Validation
                  │
                  ▼
         Text & OCR Extraction
                  │
                  ▼
         Document Classification
   (GST, PAN, Udyam, OEM MAF, Local Content, ITR, etc.)
                  │
                  ▼
      Structured Field Extraction
 (GSTIN, Legal Name, Expiry Dates, Local Content %, AY)
                  │
                  ▼
         Cross-Source Alignment
```

### 3.2 Compliance Scoring Methodology (Total 100 Points)
- **Statutory Compliance (25 Points)**: GST status, PAN validity, active tax compliance.
- **Tender-Specific Compliance (30 Points)**: OEM Manufacturer Authorization, Make in India local content threshold, BIS certification.
- **Document Integrity (25 Points)**: Mandatory ITR acknowledgment, document completeness, non-expired certificates.
- **Government Verification (20 Points)**: EPFO, ESIC, Udyam MSME concordance, debarment watchlist screening.

### 3.3 Risk Assessment Matrix
- **HIGH RISK**:
  - Inactive or cancelled GST status.
  - Missing mandatory documents (ITR, OEM Authorization).
  - Expired authorization or license.
  - Make in India local content percentage below tender threshold.
  - Screening match on Central Debarment Watchlist.
- **MEDIUM RISK**:
  - Certificates expiring within 30 days.
  - Pending statutory dues (EPFO or ESIC pending verification).
  - Corporate name variations across registries requiring officer review.
- **LOW RISK**:
  - All verified with full concordance across databases.

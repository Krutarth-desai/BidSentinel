# BidSentinel — SIH 2026 Judge Demonstration Guide

This guide describes the complete, 3-minute live demonstration flow for the Smart India Hackathon jury.

---

## 1. Demo Credentials

- **URL**: `http://localhost:3000`
- **Username**: `officer@gem-demo.gov.in`
- **Password**: `demo123`
*(A "Quick Demo Login" button is available on the login screen to autofill credentials instantly).*

---

## 2. Key Scenarios to Show Judges

| Scenario | Bidder | Expected Score | Risk | Key Issues Demonstrated |
| :--- | :--- | :---: | :---: | :--- |
| **A. Fully Compliant** | ABC Technologies Pvt. Ltd. | **96 / 100** | **LOW** | Benchmark bidder. Active GST, valid Udyam Small, valid OEM auth, 68.5% local content >= 50%. |
| **B. Missing Financials** | XYZ Engineering Solutions Pvt. Ltd. | **74 / 100** | **MEDIUM** | Missing ITR FY 2025-26, ESIC verification pending in portal, OEM auth expiring in 15 days. |
| **C. Material Failures** | PQR Industrial Systems Pvt. Ltd. | **58 / 100** | **HIGH** | GST legal name mismatch vs MCA, Udyam registered name discrepancy, local content 38% < 50%, expired OEM auth. |
| **D. Debarment Alert** | Bharat Heavy Spares Corp | **42 / 100** | **HIGH** | Inactive GST status; Watchlist record located on GeM Incident Management list requiring officer review. |

---

## 3. Step-by-Step Walkthrough

### Step 1: Login & Executive Dashboard
1. Open `http://localhost:3000`. Click **"Auto-Fill Demo Credentials"** -> Click **"Secure Officer Login"**.
2. Point out:
   - Modern, clean Government Enterprise design (no distracting flashiness).
   - Prominent **"PROTOTYPE MODE — Synthetic Government Connectors"** indicator.
   - Real-time KPI Cards: Active Tenders, Bidders Under Verification, High Risk Bidders, Average Compliance Score.

### Step 2: Tender-Aware Requirements
1. Click **"Tenders"** on sidebar -> Select `GEM/2026/B/100001` (Supply of Industrial Control Units).
2. Point out the **AI-Extracted Requirements** table:
   - Statutory (GST, PAN), MSME (Udyam), Tender-specific (OEM MAF), Make in India (50% Local Content), Financial (ITR AY 2025-26), Vigilance (Non-Blacklisting).
   - Officer can add/edit custom criteria or re-run AI extraction on any new tender document.

### Step 3: Run AI Verification (Live Stepper)
1. Go to **"Compliance Verification"** or click **"Verify Bidder"** for `BID-003` (PQR Industrial Systems).
2. Click the prominent **"RUN AI VERIFICATION"** button.
3. Observe the live 9-step progress sequence:
   - *Analyzing tender ... ✓*
   - *Extracting requirements ... ✓*
   - *Classifying documents ... ✓*
   - *Extracting fields ... ✓*
   - *Checking government sources ... ✓*
   - *Cross-validating entities ... ✓*
   - *Applying compliance rules ... ✓*
   - *Calculating risk ... ✓*
   - *Generating recommendation ... ✓*

### Step 4: Evidence Drill-Down
1. Note the resulting **58/100** score and **HIGH RISK** badge.
2. In the requirements table, find **Make in India Local Content** (✕ NON-COMPLIANT) and click **"View Evidence"**.
3. Show the side-by-side Evidence Modal:
   - **Tender Requirement**: Minimum 50% domestic content.
   - **Submitted Declaration**: 38.0%.
   - **Discrepancy**: 12.0% shortfall.
   - **Source**: `Local_Content_Declaration.pdf` (Confidence: 99%).
4. Repeat for **GST Registration** to show the **Entity Name Discrepancy**:
   - MCA Record: `PQR Industrial Systems Pvt. Ltd.`
   - GSTN Record: `PQR Industries Limited` (Name variation flagged for officer review).

### Step 5: Human-in-the-Loop Officer Determination
1. Scroll down to the **Officer Final Decision Panel**.
2. Note the AI recommendation text:
   > *"Recommended Officer Action: Issue formal clarification notice... Final determination remains strictly under Procurement Officer authority."*
3. Click **"Request Clarification"** -> Enter officer comments:
   > *"Bidder must clarify 12% local content shortfall and explain discrepancy between GST legal name and MCA incorporation."*
4. Click **"Submit Official Determination"**.

### Step 6: Immutable Audit Trail & Compliance Report
1. Click **"Audit Trail"** on the sidebar: show the timestamped record of the verification and the officer's decision.
2. Click **"Generate Report"** to show the print-ready, official government verification dossier with watermark and decision block.

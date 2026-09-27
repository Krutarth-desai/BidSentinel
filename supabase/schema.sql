-- ============================================================================
-- BidSentinel — Supabase PostgreSQL Schema Definition
-- AI-Powered Integrated Bid Compliance Verification Platform for GeM
-- SIH 2026
-- ============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'PROCUREMENT_OFFICER',
    designation VARCHAR(255),
    department VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);

-- 2. Tenders
CREATE TABLE IF NOT EXISTS tenders (
    tender_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    ministry VARCHAR(255),
    reference_number VARCHAR(100),
    created_date VARCHAR(50),
    closing_date VARCHAR(50),
    estimated_value_inr DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_tenders_tender_id ON tenders(tender_id);

-- 3. Tender Requirements
CREATE TABLE IF NOT EXISTS tender_requirements (
    id VARCHAR(100) PRIMARY KEY,
    tender_id VARCHAR(100) NOT NULL REFERENCES tenders(tender_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    mandatory VARCHAR(50) DEFAULT 'YES',
    condition TEXT,
    verification_source VARCHAR(100) NOT NULL,
    rule_code VARCHAR(100),
    weight INTEGER DEFAULT 10,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_tender_requirements_tender_id ON tender_requirements(tender_id);

-- 4. Bidders Master Registry
CREATE TABLE IF NOT EXISTS bidders (
    bidder_id VARCHAR(100) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    pan VARCHAR(20) NOT NULL,
    gstin VARCHAR(30) NOT NULL,
    cin VARCHAR(50),
    udyam_number VARCHAR(50),
    address TEXT,
    company_type VARCHAR(100) DEFAULT 'PRIVATE_LIMITED',
    msme_status VARCHAR(100) DEFAULT 'NOT_APPLICABLE',
    msme_category VARCHAR(50),
    startup_status VARCHAR(100) DEFAULT 'NOT_APPLICABLE',
    startup_certificate VARCHAR(100),
    nsic_status VARCHAR(100) DEFAULT 'NOT_REGISTERED',
    epfo_id VARCHAR(50),
    esic_id VARCHAR(50),
    claimed_msme_benefit BOOLEAN DEFAULT FALSE,
    claimed_startup_benefit BOOLEAN DEFAULT FALSE,
    declared_local_content DOUBLE PRECISION DEFAULT 0.0,
    oem_authorized BOOLEAN DEFAULT FALSE,
    oem_product VARCHAR(255),
    oem_name VARCHAR(255),
    oem_expiry VARCHAR(50),
    itr_filed_year VARCHAR(50),
    blacklisted BOOLEAN DEFAULT FALSE,
    expected_score INTEGER DEFAULT 0,
    expected_risk VARCHAR(20) DEFAULT 'LOW',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_bidders_bidder_id ON bidders(bidder_id);
CREATE INDEX IF NOT EXISTS ix_bidders_company_name ON bidders(company_name);
CREATE INDEX IF NOT EXISTS ix_bidders_pan ON bidders(pan);
CREATE INDEX IF NOT EXISTS ix_bidders_gstin ON bidders(gstin);

-- 5. Bidder Uploaded Documents
CREATE TABLE IF NOT EXISTS bidder_documents (
    id VARCHAR(100) PRIMARY KEY,
    bidder_id VARCHAR(100) NOT NULL REFERENCES bidders(bidder_id) ON DELETE CASCADE,
    tender_id VARCHAR(100),
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    upload_date VARCHAR(50),
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    file_path VARCHAR(500),
    expiry_date VARCHAR(50),
    extracted_data_json TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_bidder_documents_bidder_id ON bidder_documents(bidder_id);
CREATE INDEX IF NOT EXISTS ix_bidder_documents_tender_id ON bidder_documents(tender_id);

-- 6. AI Verification Results
CREATE TABLE IF NOT EXISTS verification_results (
    id SERIAL PRIMARY KEY,
    tender_id VARCHAR(100) NOT NULL REFERENCES tenders(tender_id) ON DELETE CASCADE,
    bidder_id VARCHAR(100) NOT NULL REFERENCES bidders(bidder_id) ON DELETE CASCADE,
    compliance_score INTEGER DEFAULT 0,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    statutory_score DOUBLE PRECISION DEFAULT 0.0,
    tender_score DOUBLE PRECISION DEFAULT 0.0,
    document_score DOUBLE PRECISION DEFAULT 0.0,
    govt_score DOUBLE PRECISION DEFAULT 0.0,
    findings_json TEXT,
    rule_results_json TEXT,
    risk_factors_json TEXT,
    ai_recommendation TEXT,
    verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_verification_results_tender_id ON verification_results(tender_id);
CREATE INDEX IF NOT EXISTS ix_verification_results_bidder_id ON verification_results(bidder_id);

-- 7. Officer Determinations (Human-in-the-Loop)
CREATE TABLE IF NOT EXISTS officer_decisions (
    id SERIAL PRIMARY KEY,
    tender_id VARCHAR(100) NOT NULL REFERENCES tenders(tender_id) ON DELETE CASCADE,
    bidder_id VARCHAR(100) NOT NULL REFERENCES bidders(bidder_id) ON DELETE CASCADE,
    officer_email VARCHAR(255) NOT NULL,
    officer_name VARCHAR(255),
    decision VARCHAR(50) NOT NULL,
    comments TEXT NOT NULL,
    decided_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_officer_decisions_tender_id ON officer_decisions(tender_id);
CREATE INDEX IF NOT EXISTS ix_officer_decisions_bidder_id ON officer_decisions(bidder_id);

-- 8. Immutable Audit Trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "user" VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    source VARCHAR(100) DEFAULT 'SYSTEM',
    result VARCHAR(100),
    details_json TEXT
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_timestamp ON audit_logs(timestamp);

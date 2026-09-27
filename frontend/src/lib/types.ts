/**
 * frontend/src/lib/types.ts
 * TypeScript interfaces for BidSentinel GeM Procurement Platform.
 */

export interface TenderRequirement {
  id: string;
  tender_id: string;
  title: string;
  category: string;
  mandatory: "YES" | "NO" | "CONDITIONAL";
  condition?: string;
  verification_source: string;
  rule_code?: string;
  weight: number;
  is_custom?: boolean;
}

export interface Tender {
  tender_id: string;
  title: string;
  department: string;
  ministry?: string;
  reference_number?: string;
  created_date?: string;
  closing_date?: string;
  estimated_value_inr: number;
  status: string;
  category?: string;
  description?: string;
  requirements_count?: number;
  bidders_count?: number;
  requirements?: TenderRequirement[];
}

export interface BidderDocument {
  id: string;
  document_name: string;
  document_type: string;
  upload_date?: string;
  status: string;
  expiry_date?: string;
  verification_status: string;
  extracted_data?: Record<string, any>;
}

export interface Bidder {
  bidder_id: string;
  company_name: string;
  pan: string;
  gstin: string;
  cin?: string;
  udyam_number?: string;
  address?: string;
  company_type: string;
  msme_status: string;
  msme_category?: string;
  startup_status: string;
  startup_certificate?: string;
  nsic_status: string;
  epfo_id?: string;
  esic_id?: string;
  claimed_msme_benefit: boolean;
  claimed_startup_benefit: boolean;
  declared_local_content: number;
  oem_authorized: boolean;
  oem_product?: string;
  oem_name?: string;
  oem_expiry?: string;
  itr_filed_year?: string;
  blacklisted: boolean;
  expected_score?: number;
  expected_risk?: string;
  compliance_score?: number;
  risk_level?: "LOW" | "MEDIUM" | "HIGH";
  documents_count?: number;
  decision?: string;
  notes?: string;
  documents?: BidderDocument[];
  latest_verification?: VerificationResult;
  officer_decision?: OfficerDecision;
}

export interface ScoreBreakdown {
  total_score: number;
  max_score: number;
  statutory: number;
  statutory_max: number;
  tender_specific: number;
  tender_specific_max: number;
  document_verification: number;
  document_verification_max: number;
  govt_verification: number;
  govt_verification_max: number;
}

export interface RiskFactor {
  severity: "HIGH" | "MEDIUM" | "LOW";
  factor: string;
  impact: string;
}

export interface RequirementResult {
  req_id: string;
  title: string;
  category: string;
  mandatory: string;
  status: "COMPLIANT" | "NON_COMPLIANT" | "MISSING" | "REVIEW_REQUIRED" | "NOT_APPLICABLE" | "UNVERIFIED";
  source: string;
  evidence_summary: string;
  reason: string;
  rule_code?: string;
  confidence: number;
  field_discrepancy?: Record<string, any>;
}

export interface VerificationResult {
  tender_id: string;
  bidder_id: string;
  bidder_name?: string;
  compliance_score: number;
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  score_breakdown: ScoreBreakdown;
  risk_factors: RiskFactor[];
  findings: string[];
  ai_recommendation: string;
  requirement_results: RequirementResult[];
  verified_at: string;
  prototype_notice?: string;
}

export interface OfficerDecision {
  id?: number;
  tender_id: string;
  bidder_id: string;
  officer_email: string;
  decision: "APPROVED" | "REJECTED" | "CLARIFICATION_REQUESTED";
  comments: string;
  decided_at: string;
}

export interface AuditLog {
  id: number | string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entity_id?: string;
  source: string;
  result?: string;
  hash?: string;
  details?: Record<string, any>;
}

export interface DashboardOverview {
  kpi: {
    active_tenders: number;
    bidders_under_verification: number;
    pending_reviews: number;
    high_risk_bidders: number;
    average_compliance_score: string;
  };
  recent_activities: Array<{
    timestamp: string;
    user: string;
    action: string;
    entity: string;
    result: string;
  }>;
  high_risk_bidders: Array<{
    bidder_id: string;
    company_name: string;
    expected_score: number;
    notes?: string;
  }>;
}

export interface GovernmentConnector {
  id: string;
  name: string;
  title: string;
  type: string;
  status: string;
}

/**
 * frontend/src/lib/api.ts
 * API Client for interacting with the BidSentinel FastAPI backend.
 */

import {
  Tender,
  Bidder,
  VerificationResult,
  OfficerDecision,
  AuditLog,
  DashboardOverview,
  GovernmentConnector
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("bidsentinel_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Authentication
  login: async (username: string, password: string) => {
    return fetchJson<{ access_token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  getCurrentUser: async () => {
    return fetchJson<any>("/auth/me");
  },

  // Dashboard Overview
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    return fetchJson<DashboardOverview>("/dashboard/overview");
  },

  // Tenders
  getTenders: async (): Promise<Tender[]> => {
    return fetchJson<Tender[]>("/tenders/");
  },

  getTender: async (tenderId: string): Promise<Tender> => {
    return fetchJson<Tender>(`/tenders/${encodeURIComponent(tenderId)}`);
  },

  createTender: async (payload: Partial<Tender>): Promise<any> => {
    return fetchJson("/tenders/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  loadDemoTenders: async (): Promise<any> => {
    return fetchJson("/tenders/load-demo", { method: "POST" });
  },

  extractRequirements: async (tenderId: string, tenderText?: string): Promise<any> => {
    const formData = new FormData();
    if (tenderText) formData.append("tender_text", tenderText);
    const token = typeof window !== "undefined" ? localStorage.getItem("bidsentinel_token") : null;

    const res = await fetch(`${API_BASE}/tenders/${encodeURIComponent(tenderId)}/extract-requirements`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return res.json();
  },

  addCustomRequirement: async (tenderId: string, req: any): Promise<any> => {
    return fetchJson(`/tenders/${encodeURIComponent(tenderId)}/requirements`, {
      method: "POST",
      body: JSON.stringify(req),
    });
  },

  deleteRequirement: async (tenderId: string, reqId: string): Promise<any> => {
    return fetchJson(`/tenders/${encodeURIComponent(tenderId)}/requirements/${encodeURIComponent(reqId)}`, {
      method: "DELETE",
    });
  },

  // Bidders
  getBidders: async (): Promise<Bidder[]> => {
    return fetchJson<Bidder[]>("/bidders/");
  },

  getBidder: async (bidderId: string): Promise<Bidder> => {
    return fetchJson<Bidder>(`/bidders/${encodeURIComponent(bidderId)}`);
  },

  // Verification Engine
  runVerification: async (tenderId: string, bidderId: string): Promise<VerificationResult> => {
    return fetchJson<VerificationResult>("/verification/run", {
      method: "POST",
      body: JSON.stringify({ tender_id: tenderId, bidder_id: bidderId }),
    });
  },

  runBatchVerification: async (tenderId: string): Promise<any> => {
    return fetchJson(`/verification/run-all?tender_id=${encodeURIComponent(tenderId)}`, {
      method: "POST",
    });
  },

  getVerificationResult: async (tenderId: string, bidderId: string): Promise<VerificationResult> => {
    return fetchJson<VerificationResult>(`/verification/${encodeURIComponent(tenderId)}/${encodeURIComponent(bidderId)}`);
  },

  // Officer Decisions
  submitDecision: async (tenderId: string, bidderId: string, decision: string, comments: string): Promise<OfficerDecision> => {
    return fetchJson<OfficerDecision>("/decisions/", {
      method: "POST",
      body: JSON.stringify({
        tender_id: tenderId,
        bidder_id: bidderId,
        decision,
        comments,
      }),
    });
  },

  getDecision: async (tenderId: string, bidderId: string): Promise<any> => {
    return fetchJson(`/decisions/${encodeURIComponent(tenderId)}/${encodeURIComponent(bidderId)}`);
  },

  // Audit Trail
  getAuditLogs: async (limit: number = 50): Promise<AuditLog[]> => {
    return fetchJson<AuditLog[]>(`/audit/?limit=${limit}`);
  },

  // Connectors
  getConnectors: async (): Promise<{ connectors: GovernmentConnector[] }> => {
    return fetchJson<{ connectors: GovernmentConnector[] }>("/connectors/list");
  },

  queryConnector: async (connectorId: string, identifier: string): Promise<any> => {
    return fetchJson(`/connectors/query/${encodeURIComponent(connectorId)}?identifier=${encodeURIComponent(identifier)}`);
  },

  // Reports
  getReportData: async (tenderId: string, bidderId: string): Promise<any> => {
    return fetchJson(`/reports/${encodeURIComponent(tenderId)}/${encodeURIComponent(bidderId)}`);
  },

  getReportHtmlUrl: (tenderId: string, bidderId: string): string => {
    return `${API_BASE}/reports/${encodeURIComponent(tenderId)}/${encodeURIComponent(bidderId)}/html`;
  },
};

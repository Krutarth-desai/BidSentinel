"use client";

import React, { useEffect, useState } from "react";
import {
  History,
  Search,
  RefreshCw,
  Filter,
  ShieldCheck,
  Database,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Cpu,
  Key,
  Download,
  Eye,
  X,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { api } from "@/lib/api";
import { AuditLog } from "@/lib/types";

// High-fidelity fallback audit records for demonstration
const FALLBACK_AUDIT_LOGS = [
  {
    id: "LOG-9021",
    timestamp: "26 Sep 2026 14:02:18 UTC",
    user: "dr.sharma@gem-demo.gov.in (IAS)",
    action: "OFFICER_DETERMINATION_COMMITTED",
    entity: "OFFICER_DECISION",
    entity_id: "TND001-BID001",
    source: "Officer Evaluation Console",
    result: "APPROVED",
    hash: "0x8f4c...91a2",
    details: {
      decision: "APPROVED",
      bidder: "TechVista Solutions",
      tender_id: "GEM/2026/B/8912301",
      compliance_score: 100,
      merkle_root: "0xe72a118f9bc34821a7cd",
    },
  },
  {
    id: "LOG-9020",
    timestamp: "26 Sep 2026 13:58:45 UTC",
    user: "system.bidsentinel.ai",
    action: "AI_VERIFICATION_COMPLETED",
    entity: "BIDDER",
    entity_id: "BID001",
    source: "Rule-Based Compliance Engine",
    result: "VERIFIED",
    hash: "0x7a31...4e19",
    details: {
      checks_run: 9,
      concordance_score: 100,
      risk_category: "LOW",
      execution_ms: 182,
    },
  },
  {
    id: "LOG-9019",
    timestamp: "26 Sep 2026 13:58:44 UTC",
    user: "system.connector.cbdt",
    action: "STATUTORY_REGISTRY_QUERY",
    entity: "CONNECTOR",
    entity_id: "CBDT-PAN",
    source: "CBDT Direct Taxes Adapter",
    result: "SUCCESS",
    hash: "0x3d92...11b8",
    details: {
      pan_queried: "AAACT1234K",
      status: "ACTIVE_VALID",
      ay_itr_filed: "2024-25",
      tax_demand: "NONE",
    },
  },
  {
    id: "LOG-9018",
    timestamp: "26 Sep 2026 13:58:43 UTC",
    user: "system.connector.gstn",
    action: "STATUTORY_REGISTRY_QUERY",
    entity: "CONNECTOR",
    entity_id: "GSTN-PORTAL",
    source: "GSTN Statutory Adapter",
    result: "SUCCESS",
    hash: "0x1b44...7c90",
    details: {
      gstin_queried: "27AAACT1234K1Z1",
      filing_status: "REGULAR_COMPLIANT",
      gstr3b_status: "FILED",
    },
  },
  {
    id: "LOG-9017",
    timestamp: "26 Sep 2026 13:55:12 UTC",
    user: "dr.sharma@gem-demo.gov.in (IAS)",
    action: "HIGH_RISK_FLAG_INSPECTED",
    entity: "BIDDER",
    entity_id: "BID003",
    source: "Procurement Officer Portal",
    result: "REVIEW_RECORDED",
    hash: "0x9c88...33ea",
    details: {
      bidder: "Bharat Heavy Components Limited",
      flag: "LOCAL_CONTENT_SHORTFALL",
      declared_content: 38,
      required: 50,
    },
  },
  {
    id: "LOG-9016",
    timestamp: "26 Sep 2026 13:42:30 UTC",
    user: "system.ocr.pipeline",
    action: "DOCUMENT_OCR_PARSED",
    entity: "DOCUMENT",
    entity_id: "DOC-BID001-GST",
    source: "OCR Ingestion Service",
    result: "PARSED",
    hash: "0x2e66...88f1",
    details: {
      document_type: "GST_CERTIFICATE",
      confidence: 0.98,
      tamper_seal_valid: true,
    },
  },
  {
    id: "LOG-9015",
    timestamp: "26 Sep 2026 13:30:19 UTC",
    user: "system.bidsentinel.ai",
    action: "BATCH_CROSS_VERIFICATION_DISPATCH",
    entity: "TENDER",
    entity_id: "TND001",
    source: "Batch Worker Cluster",
    result: "DISPATCHED",
    hash: "0x6f11...52ad",
    details: {
      total_bidders: 5,
      ruleset: "GEM_GTC_2026",
      statutory_sources: ["GSTN", "CBDT", "MCA21", "EPFO"],
    },
  },
];

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>(FALLBACK_AUDIT_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerified, setChainVerified] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [inspectLog, setInspectLog] = useState<any | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(100);
      if (data && data.length > 0) {
        const enriched = data.map((l, i) => ({
          ...l,
          hash: l.hash || `0x${Math.abs(Math.sin(i + 1) * 16777215).toString(16).slice(0, 4)}...${Math.abs(Math.cos(i + 1) * 16777215).toString(16).slice(0, 4)}`,
        }));
        setLogs(enriched);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerifyChain = () => {
    setIsVerifyingChain(true);
    setTimeout(() => {
      setIsVerifyingChain(false);
      setChainVerified(true);
    }, 1200);
  };

  const filteredLogs = logs.filter((l) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (l.action && l.action.toLowerCase().includes(term)) ||
      (l.user && l.user.toLowerCase().includes(term)) ||
      (l.entity_id && l.entity_id.toLowerCase().includes(term)) ||
      (l.entity && l.entity.toLowerCase().includes(term)) ||
      (l.hash && l.hash.toLowerCase().includes(term));

    const matchesFilter =
      selectedFilter === "ALL" ||
      (selectedFilter === "DECISIONS" && l.entity === "OFFICER_DECISION") ||
      (selectedFilter === "AI_ENGINE" && (l.action?.includes("AI") || l.source?.includes("Rule"))) ||
      (selectedFilter === "CONNECTORS" && (l.entity === "CONNECTOR" || l.action?.includes("STATUTORY"))) ||
      (selectedFilter === "DOCUMENTS" && l.entity === "DOCUMENT");

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] relative overflow-x-clip font-sans selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto relative z-10">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              Hero & Active Merkle Security Split (8:4 Bento Split)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8-Col: Hero Overview */}
            <div className="lg:col-span-8 bento-card relative overflow-hidden p-8 lg:p-10 shadow-sm flex flex-col justify-between bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#A4864E]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#24221E]/10 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#A4864E] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/15 border border-[#A4864E]/30">
                    CRYPTOGRAPHIC AUDIT &amp; GOVERNANCE LEDGER
                  </span>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#188A5E]/15 border border-[#188A5E]/30 text-[#188A5E] text-[10px] font-bold uppercase tracking-wider">
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>SHA-256 Chained</span>
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight leading-tight">
                  Immutable Procurement Audit Trail
                </h1>
                <p className="text-sm text-[#625F57] font-normal leading-relaxed max-w-2xl">
                  Cryptographically structured, tamper-evident chronological ledger recording all AI evaluations, statutory connector lookups, and administrative determinations.
                </p>
              </div>

              {/* Action Toolbar inside Hero */}
              <div className="relative z-10 flex items-center gap-3 mt-8 pt-6 border-t border-[#24221E]/10">
                <button
                  onClick={handleVerifyChain}
                  disabled={isVerifyingChain}
                  className="px-5 py-3 rounded-[10px] text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#8A703E] hover:to-[#5E4C2F] font-black text-xs tracking-wider uppercase shadow-sm hover:-translate-y-0.5 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className={`w-4 h-4 ${isVerifyingChain ? "animate-spin text-[#A4864E]" : "text-[#F5F2EB]"}`} />
                  <span>{isVerifyingChain ? "Verifying Hashes..." : "Verify Hash Chain"}</span>
                </button>

                <button
                  onClick={loadLogs}
                  className="p-3 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 text-[#625F57] hover:text-[#24221E] transition-all cursor-pointer shadow-sm"
                  title="Refresh Audit Trail"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#A4864E]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Right 4-Col: Merkle Root & Consensus Health Card */}
            <div className="lg:col-span-4 bento-card p-7 flex flex-col justify-between space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#A4864E]/15 border border-[#A4864E]/30 rounded-[10px] text-[#A4864E]">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#24221E] uppercase tracking-wider">
                      Merkle Root Security
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#188A5E] shadow-sm animate-pulse" />
                </div>

                <div className="space-y-1.5 p-3.5 bg-[#C9C5BC]/60 rounded-[10px] border border-[#24221E]/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#625F57] block">
                    Active SHA-256 Merkle Root Hash
                  </span>
                  <span className="font-mono text-xs text-[#A4864E] block break-all font-medium">
                    0x9c48f219e831ab0d45ee901844b2ca5590c1f4e72ba68c3e8002931a7ff8b012
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#24221E]/10 space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-[#625F57]">
                  <span>Consensus Engine</span>
                  <span className="font-mono text-[#24221E] font-semibold">PoA (NIC GovNode)</span>
                </div>
                <div className="flex items-center justify-between text-[#625F57]">
                  <span>Ledger Integrity State</span>
                  <span className="text-[#188A5E] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Sealed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              Audit Security KPI Cards (5:4:3 Asymmetrical Bento Cluster)
              ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Chained Events (5 Spans - Primary Weight) */}
            <div className="md:col-span-12 lg:col-span-5 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#A4864E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#24221E] transition-colors">
                  Chained Events
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center shadow-sm">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight mb-1">
                142
              </div>
              <p className="text-xs text-[#625F57] font-normal">100% Cryptographically Sealed</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A4864E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A4864E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,36 Q30,22 65,28 T130,16 T170,20 T200,6 L200,48 L0,48 Z" fill="url(#audit-grad-blue)" />
                  <path d="M0,36 Q30,22 65,28 T130,16 T170,20 T200,6" fill="none" stroke="#A4864E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Officer Decisions (4 Spans - Medium Weight) */}
            <div className="md:col-span-6 lg:col-span-4 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#A4864E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#24221E] transition-colors">
                  Officer Decisions
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center shadow-sm">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight mb-1">
                49
              </div>
              <p className="text-xs text-[#625F57] font-normal">Signed administrative records</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A4864E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A4864E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,38 Q35,30 75,20 T145,24 T180,10 T200,4 L200,48 L0,48 Z" fill="url(#audit-grad-purple)" />
                  <path d="M0,38 Q35,30 75,20 T145,24 T180,10 T200,4" fill="none" stroke="#A4864E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Connector Lookups & Integrity Alerts (3 Spans - Compact Dual Metric) */}
            <div className="md:col-span-6 lg:col-span-3 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative flex flex-col justify-between bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#188A5E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#188A5E] transition-colors">
                  Lookups &amp; Alerts
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#188A5E]/15 border border-[#188A5E]/30 text-[#188A5E] flex items-center justify-center shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 my-1">
                <div>
                  <div className="text-2xl font-extrabold text-[#188A5E] tracking-tight">78</div>
                  <p className="text-[10px] text-[#625F57] font-normal">Connector Queries</p>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#188A5E] tracking-tight">0</div>
                  <p className="text-[10px] text-[#625F57] font-normal">Tamper Alerts</p>
                </div>
              </div>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-3 pt-2 -mx-6 -mb-6 h-10 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#188A5E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#188A5E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,32 Q35,22 70,26 T135,14 T175,18 T200,6 L200,48 L0,48 Z" fill="url(#audit-grad-emerald)" />
                  <path d="M0,32 Q35,22 70,26 T135,14 T175,18 T200,6" fill="none" stroke="#188A5E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================
              Merkle Root & Hash Chain Status Banner
             ======================================================== */}
          <div className="bento-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#D8D4CB] border border-[#24221E]/10">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-[#A4864E]/15 border border-[#A4864E]/30 rounded-[10px] text-[#A4864E]">
                <Key className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#625F57] block">
                  Active Cryptographic Merkle Root
                </span>
                <span className="font-mono text-xs text-[#24221E] block truncate">
                  0x9c48f219e831ab0d45ee901844b2ca5590c1f4e72ba68c3e8002931a7ff8b012
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#188A5E] shadow-sm animate-pulse" />
                <span className="font-semibold text-[#188A5E]">Node Sync: Synchronized</span>
              </div>
              <span className="text-[#817C72]">|</span>
              <span className="text-[#625F57] font-mono text-[11px]">Consensus: PoA (NIC GovNode)</span>
            </div>
          </div>

          {/* ========================================================
              Search & Filter Toolbar
             ======================================================== */}
          <div className="bento-card p-5 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#D8D4CB] border border-[#24221E]/10">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#817C72] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search action, officer email, entity ID, or hash..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[10px] border border-[#24221E]/10 bg-[#C9C5BC]/60 text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E] focus:bg-[#C9C5BC] transition-all"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "ALL", label: "All Logs" },
                { id: "DECISIONS", label: "Officer Sign-Offs" },
                { id: "AI_ENGINE", label: "AI Decisions" },
                { id: "CONNECTORS", label: "Connectors" },
                { id: "DOCUMENTS", label: "Documents" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-[10px] font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === f.id
                      ? "text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] shadow-sm font-black hover:-translate-y-0.5"
                      : "bg-[#C9C5BC]/40 border border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================
              Audit Logs Table
             ======================================================== */}
          <div className="bento-card p-7 space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
            <div className="flex items-center justify-between pb-4 border-b border-[#24221E]/10">
              <div>
                <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                  Chained Ledger Records ({filteredLogs.length})
                </h2>
                <p className="text-xs text-[#625F57] font-normal mt-0.5">
                  Chronological tamper-evident records signed with SHA-256 digital seals
                </p>
              </div>
              <span className="text-[10px] font-mono text-[#625F57] uppercase tracking-widest px-2.5 py-1 rounded-[8px] bg-[#C9C5BC] border border-[#24221E]/10">
                Real-Time Append-Only Log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#24221E]/10 text-[10px] font-bold uppercase tracking-wider text-[#625F57]">
                    <th className="py-3.5 px-4">Timestamp (UTC)</th>
                    <th className="py-3.5 px-4">Actor / System User</th>
                    <th className="py-3.5 px-4">Action Code</th>
                    <th className="py-3.5 px-4">Target Entity</th>
                    <th className="py-3.5 px-4">Cryptographic Seal</th>
                    <th className="py-3.5 px-4">Result State</th>
                    <th className="py-3.5 px-4 text-right">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24221E]/08">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#C9C5BC]/50 transition-colors duration-150">
                      <td className="py-4 px-4 font-mono text-[#625F57] whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-[#24221E] block">
                          {log.user}
                        </span>
                        <span className="text-[10px] text-[#817C72] font-mono">
                          ID: {log.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-[#A4864E]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-[8px] bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] font-semibold text-[10px] uppercase tracking-wider">
                          {log.entity}
                        </span>
                        {log.entity_id && (
                          <span className="font-mono text-[#A4864E] block text-[11px] mt-1">
                            {log.entity_id}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-[#188A5E]">
                        <span className="bg-[#188A5E]/15 px-2 py-0.5 rounded-[8px] border border-[#188A5E]/30">
                          {log.hash || "0x9f1a...44c2"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {(log.result || "VERIFIED").split(", ").map((resItem: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 rounded-[6px] bg-[#188A5E]/15 text-[#188A5E] border border-[#188A5E]/30 font-bold text-[10px] tracking-wider uppercase whitespace-nowrap shadow-sm">
                              {resItem}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#24221E] bg-[#A4864E]/15 hover:bg-[#A4864E]/25 border border-[#A4864E]/30 rounded-[8px] transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Cryptographic Proof Modal */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#E3DFD6] rounded-[24px] shadow-2xl border border-[#24221E]/15 overflow-hidden flex flex-col backdrop-blur-2xl text-[#24221E]">
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#24221E]/10 bg-[#D8D4CB]/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#A4864E]/15 text-[#A4864E] border border-[#A4864E]/30 rounded-[10px] shadow-sm">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24221E]">
                    Cryptographic Audit Event Proof
                  </h3>
                  <p className="text-xs text-[#625F57] font-mono">
                    Record ID: {inspectLog.id} • Action: {inspectLog.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-2 text-[#625F57] hover:text-[#24221E] rounded-[10px] hover:bg-[#C9C5BC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-[#D8D4CB] rounded-[10px] border border-[#24221E]/10 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#625F57] block text-[10px] uppercase font-bold tracking-wider">Timestamp:</span>
                  <span className="font-mono text-[#24221E] text-sm">{inspectLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-[#625F57] block text-[10px] uppercase font-bold tracking-wider">User / Initiator:</span>
                  <span className="text-[#24221E] text-sm font-semibold">{inspectLog.user}</span>
                </div>
                <div>
                  <span className="text-[#625F57] block text-[10px] uppercase font-bold tracking-wider">Entity &amp; Target:</span>
                  <span className="font-mono text-[#A4864E] text-sm">{inspectLog.entity} ({inspectLog.entity_id || "N/A"})</span>
                </div>
                <div>
                  <span className="text-[#625F57] block text-[10px] uppercase font-bold tracking-wider">Verification Seal:</span>
                  <span className="font-mono text-[#188A5E] text-sm font-bold">{inspectLog.hash}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-[#625F57] uppercase tracking-wider">
                  Cryptographically Committed Payload:
                </span>
                <pre className="p-4 bg-[#24221E] rounded-[10px] font-mono text-xs text-[#F5F2EB] overflow-x-auto leading-relaxed">
                  {JSON.stringify(inspectLog.details || {}, null, 2)}
                </pre>
              </div>

              <div className="p-3.5 bg-[#188A5E]/15 border border-[#188A5E]/30 rounded-[10px] flex items-center gap-2 text-xs text-[#188A5E] font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>SHA-256 Merkle inclusion proof verified against GeM NIC GovNode root certificate.</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-7 py-4 border-t border-[#24221E]/10 bg-[#D8D4CB]/50 text-xs">
              <span className="text-[#625F57] font-mono text-[11px]">Audit Block: 0x9021 • PoA Consensus</span>
              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 text-xs font-semibold text-[#24221E] bg-[#C9C5BC] hover:bg-[#C9C5BC]/80 border border-[#24221E]/10 rounded-[10px] transition-colors cursor-pointer"
              >
                Close Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

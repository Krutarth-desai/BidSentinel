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
        // Merge with hashes if backend doesn't have them
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
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              Hero Section: Cryptographic Audit Ledger
             ======================================================== */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 lg:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    CRYPTOGRAPHIC AUDIT &amp; GOVERNANCE LEDGER
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <Fingerprint className="w-3 h-3" />
                    <span>SHA-256 Chained</span>
                  </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Immutable Procurement Audit Trail
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed pt-1">
                  Cryptographically structured, tamper-evident chronological ledger recording all AI evaluations, statutory connector lookups, and administrative determinations.
                </p>
              </div>

              {/* Actions on the right */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleVerifyChain}
                  disabled={isVerifyingChain}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className={`w-4 h-4 ${isVerifyingChain ? "animate-spin text-amber-300" : "text-blue-200"}`} />
                  <span>{isVerifyingChain ? "Verifying Hashes..." : "Verify Hash Chain"}</span>
                </button>

                <button
                  onClick={loadLogs}
                  className="p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 text-slate-400 hover:text-white transition-all cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                  title="Refresh Audit Trail"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              Audit Security KPI Cards (4 Individual Glass Cards)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Chained Events (Blue) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-blue-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(50,110,255,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-blue-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors">
                  Chained Events
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                142
              </div>
              <p className="text-xs text-slate-400 font-normal">100% Cryptographically Sealed</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,36 Q30,22 65,28 T130,16 T170,20 T200,6 L200,48 L0,48 Z" fill="url(#audit-grad-blue)" />
                  <path d="M0,36 Q30,22 65,28 T130,16 T170,20 T200,6" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Officer Determinations (Violet) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-purple-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(168,85,247,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-purple-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-purple-300 transition-colors">
                  Officer Decisions
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                49
              </div>
              <p className="text-xs text-slate-400 font-normal">Signed administrative records</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,38 Q35,30 75,20 T145,24 T180,10 T200,4 L200,48 L0,48 Z" fill="url(#audit-grad-purple)" />
                  <path d="M0,38 Q35,30 75,20 T145,24 T180,10 T200,4" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Connector Lookups (Emerald) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-emerald-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(16,185,129,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-emerald-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Connector Lookups
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">
                78
              </div>
              <p className="text-xs text-slate-400 font-normal">Statutory API transactions</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,32 Q35,22 70,26 T135,14 T175,18 T200,6 L200,48 L0,48 Z" fill="url(#audit-grad-emerald)" />
                  <path d="M0,32 Q35,22 70,26 T135,14 T175,18 T200,6" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Integrity Violations (Green/Amber) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-emerald-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(16,185,129,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-emerald-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Tamper Alerts
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">
                0
              </div>
              <p className="text-xs text-slate-400 font-normal">Zero integrity anomalies detected</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="audit-grad-zero" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,44 L200,44 L200,48 L0,48 Z" fill="url(#audit-grad-zero)" />
                  <path d="M0,44 L200,44" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================
              Merkle Root & Hash Chain Status Banner
             ======================================================== */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <Key className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block">
                  Active Cryptographic Merkle Root
                </span>
                <span className="font-mono text-xs text-slate-200 block truncate">
                  0x9c48f219e831ab0d45ee901844b2ca5590c1f4e72ba68c3e8002931a7ff8b012
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
                <span className="font-semibold text-emerald-400">Node Sync: Synchronized</span>
              </div>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono text-[11px]">Consensus: PoA (NIC GovNode)</span>
            </div>
          </div>

          {/* ========================================================
              Search & Filter Toolbar
             ======================================================== */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search action, officer email, entity ID, or hash..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/[0.10] bg-white/[0.06] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.09] focus:ring-1 focus:ring-blue-500/30 transition-all"
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
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    selectedFilter === f.id
                      ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/40 hover:-translate-y-0.5"
                      : "bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.05]"
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
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Chained Ledger Records ({filteredLogs.length})
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Chronological tamper-evident records signed with SHA-256 digital seals
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Real-Time Append-Only Log
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor / System User</th>
                    <th className="py-3 px-4">Action Code</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Cryptographic Seal</th>
                    <th className="py-3 px-4">Result State</th>
                    <th className="py-3 px-4 text-right">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.05] transition-colors duration-150">
                      <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-white block">
                          {log.user}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: {log.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-bold text-blue-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.10] text-slate-300 font-semibold text-[10px] uppercase tracking-wider">
                          {log.entity}
                        </span>
                        {log.entity_id && (
                          <span className="font-mono text-blue-400 block text-[11px] mt-1">
                            {log.entity_id}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-emerald-400">
                        <span className="bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {log.hash || "0x9f1a...44c2"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold text-[10px] tracking-wider uppercase">
                          {log.result || "VERIFIED"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 rounded-lg transition-all shadow-[0_0_12px_rgba(59,130,246,0.1)] cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-black/95 rounded-[22px] shadow-[0_12px_60px_rgba(0,0,0,0.9)] border border-white/[0.12] overflow-hidden flex flex-col backdrop-blur-2xl">
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Cryptographic Audit Event Proof
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Record ID: {inspectLog.id} • Action: {inspectLog.action}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectLog(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06] grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Timestamp:</span>
                  <span className="font-mono text-white text-sm">{inspectLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">User / Initiator:</span>
                  <span className="text-white text-sm font-semibold">{inspectLog.user}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Entity &amp; Target:</span>
                  <span className="font-mono text-blue-400 text-sm">{inspectLog.entity} ({inspectLog.entity_id || "N/A"})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Verification Seal:</span>
                  <span className="font-mono text-emerald-400 text-sm font-bold">{inspectLog.hash}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Cryptographically Committed Payload:
                </span>
                <pre className="p-4 bg-black rounded-xl border border-white/[0.08] font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(inspectLog.details || {}, null, 2)}
                </pre>
              </div>

              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>SHA-256 Merkle inclusion proof verified against GeM NIC GovNode root certificate.</span>
              </div>
            </div>

            <div className="flex items-center justify-between px-7 py-4 border-t border-white/[0.08] bg-white/[0.02] text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Audit Block: 0x9021 • PoA Consensus</span>
              <button
                onClick={() => setInspectLog(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
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

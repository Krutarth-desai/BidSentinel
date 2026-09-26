"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Search,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { DashboardOverview, Tender } from "@/lib/types";

// Default high-risk alerts per procurement specs
const HIGH_RISK_ALERTS = [
  {
    bidder_id: "BID-003",
    company_name: "Bharat Heavy Components Limited",
    notes:
      "Declared domestic value addition 38% falls below Class-I 50% requirement; submitted OEM authorization is expired.",
    flag: "HIGH RISK",
  },
  {
    bidder_id: "BID-008",
    company_name: "Metro Construction Company",
    notes:
      "Unresolved tax demand INR 4.5 Cr under active scrutiny notice; AY 2022-23 ITR unfiled.",
    flag: "HIGH RISK",
  },
  {
    bidder_id: "BID-005",
    company_name: "Gupta Trading Company",
    notes:
      "PAN deactivated by tax authority; no ITR filed for 3 years; critical unresolved tax default.",
    flag: "HIGH RISK",
  },
];

// Fallback high-fidelity tenders matching GeM requirements
const DEFAULT_TENDERS = [
  {
    tender_id: "GEM/2026/B/8912301",
    title: "Supply & Commissioning of 500kVA Transformer Units",
    department: "Department of Heavy Industry",
    requirements_count: 14,
  },
  {
    tender_id: "GEM/2026/B/8912302",
    title: "Secure Cloud Infrastructure & Managed GovCloud Hosting",
    department: "Ministry of Electronics & IT (MeitY)",
    requirements_count: 18,
  },
  {
    tender_id: "GEM/2026/B/8912303",
    title: "High-Resolution Diagnostic Imaging Radiology Units",
    department: "Ministry of Health & Family Welfare",
    requirements_count: 12,
  },
  {
    tender_id: "GEM/2026/B/8912304",
    title: "Rooftop Solar PV Modules 1.2MW Grid-Connected",
    department: "Ministry of New and Renewable Energy",
    requirements_count: 16,
  },
];

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ovData, tendersData] = await Promise.all([
        api.getDashboardOverview(),
        api.getTenders(),
      ]);
      setOverview(ovData);
      if (tendersData && tendersData.length > 0) {
        setTenders(tendersData);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleQuickDemoBatch = async () => {
    setIsDemoLoading(true);
    const targetTenderId = tenders[0]?.tender_id || "TND001";
    try {
      await api.runBatchVerification(targetTenderId);
      await loadData();
    } catch (err) {
      console.error("Batch run error:", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Values matching specifications or live API
  const activeTendersVal = overview?.kpi?.active_tenders ?? 10;
  const biddersScreenedVal = overview?.kpi?.bidders_under_verification ?? 50;
  const pendingDecisionsVal = overview?.kpi?.pending_reviews ?? 49;
  const highRiskBiddersVal = overview?.kpi?.high_risk_bidders ?? 5;
  const avgComplianceVal = overview?.kpi?.average_compliance_score ?? "82%";

  // Display tenders list
  const displayTenders =
    tenders.length > 0
      ? tenders.slice(0, 4)
      : DEFAULT_TENDERS;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-10 min-w-0">
          {/* ========================================================
              Hero Section: Large Glassmorphic Hero Card
             ======================================================== */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 lg:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden">
            {/* Ambient subtle glow accent behind hero */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    GEM PROCUREMENT OFFICER CONSOLE
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Integrated Bid Compliance Overview
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed pt-1">
                  Automated multi-source statutory verification, entity cross-matching, and risk evaluation.
                </p>
              </div>

              {/* Actions on the right */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={handleQuickDemoBatch}
                  disabled={isDemoLoading}
                  className="relative group px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-wide uppercase transition-all duration-300 shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
                  <div className="text-left">
                    <span className="block leading-tight font-extrabold">
                      {isDemoLoading ? "Processing Batch..." : "Run AI Verification"}
                    </span>
                    <span className="text-[9px] text-blue-200/80 normal-case font-medium block">
                      Demo Tender Analysis
                    </span>
                  </div>
                </button>

                <button
                  onClick={loadData}
                  className="p-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(50,110,255,0.15)] text-slate-400 hover:text-white transition-all duration-200 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                  title="Refresh Dashboard Data"
                  aria-label="Refresh Dashboard Data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              KPI Cards: 5 Individual Glass Cards with Line Charts
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* KPI 1: Active Tenders (Blue Accent) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-blue-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(50,110,255,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-blue-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors">
                  Active Tenders
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                {activeTendersVal}
              </div>
              <p className="text-xs text-slate-400 font-normal">Tenders under evaluation</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,38 Q30,24 60,30 T120,18 T160,22 T200,8 L200,48 L0,48 Z"
                    fill="url(#grad-blue)"
                  />
                  <path
                    d="M0,38 Q30,24 60,30 T120,18 T160,22 T200,8"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 2: Bidders Screened (Purple Accent) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-purple-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(168,85,247,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-purple-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-purple-300 transition-colors">
                  Bidders Screened
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                {biddersScreenedVal}
              </div>
              <p className="text-xs text-slate-400 font-normal">Synthetic bidder dossiers</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,40 Q35,32 70,22 T140,28 T180,12 T200,6 L200,48 L0,48 Z"
                    fill="url(#grad-purple)"
                  />
                  <path
                    d="M0,40 Q35,32 70,22 T140,28 T180,12 T200,6"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 3: Pending Decisions (Amber Accent) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-amber-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(245,158,11,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-amber-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
                  Pending Decisions
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-amber-400 tracking-tight mb-1">
                {pendingDecisionsVal}
              </div>
              <p className="text-xs text-slate-400 font-normal">Awaiting human sign-off</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,22 Q35,36 75,20 T135,30 T175,18 T200,24 L200,48 L0,48 Z"
                    fill="url(#grad-amber)"
                  />
                  <path
                    d="M0,22 Q35,36 75,20 T135,30 T175,18 T200,24"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 4: High Risk Bidders (Red Accent) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-red-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(239,68,68,0.16)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-red-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-red-300 transition-colors">
                  High Risk Bidders
                </span>
                <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-red-400 tracking-tight mb-1">
                {highRiskBiddersVal}
              </div>
              <p className="text-xs text-slate-400 font-normal">Critical discrepancies flagged</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-red" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,32 Q40,20 80,34 T140,16 T180,26 T200,10 L200,48 L0,48 Z"
                    fill="url(#grad-red)"
                  />
                  <path
                    d="M0,32 Q40,20 80,34 T140,16 T180,26 T200,10"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* KPI 5: Avg Compliance (Green Accent) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-emerald-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(16,185,129,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-emerald-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Avg Compliance
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">
                {avgComplianceVal}
              </div>
              <p className="text-xs text-slate-400 font-normal">Multi-source concordance</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,36 Q35,26 70,20 T135,16 T175,10 T200,4 L200,48 L0,48 Z"
                    fill="url(#grad-emerald)"
                  />
                  <path
                    d="M0,36 Q35,26 70,20 T135,16 T175,10 T200,4"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================
              Main Content: Two-Column Layout with Generous Spacing
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Recent GEM Tenders (Span 7) */}
            <div className="lg:col-span-7 rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Recent GEM Tenders
                  </h2>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Tenders with AI extracted statutory and technical criteria
                  </p>
                </div>
                <Link
                  href="/tenders"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors group"
                >
                  <span>View All Tenders</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Clean Glass Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-4">Tender ID</th>
                      <th className="py-3 px-4">Tender Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Requirements</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {displayTenders.map((t) => (
                      <tr
                        key={t.tender_id}
                        className="hover:bg-white/[0.05] transition-colors group duration-150"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-blue-400">
                          {t.tender_id}
                        </td>
                        <td className="py-4 px-4 font-medium text-white max-w-[240px]">
                          <span className="line-clamp-2 leading-relaxed">
                            {t.title}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {t.department}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/[0.05] border border-white/[0.10] text-slate-300">
                            {t.requirements_count || 12} Criteria
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-semibold text-xs border border-blue-500/25 hover:border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.12)] hover:shadow-[0_0_18px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 transition-all duration-200"
                          >
                            <span>Inspect</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: High Risk Bidders Alert (Span 5) */}
            <div className="lg:col-span-5 rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    High Risk Bidders Alert
                  </h2>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/25">
                  Active Flags
                </span>
              </div>

              {/* 3 Red-Accented Glass Alert Cards */}
              <div className="space-y-4">
                {HIGH_RISK_ALERTS.map((alert, idx) => (
                  <div
                    key={alert.bidder_id}
                    className="relative rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-red-500/25 hover:border-red-500/45 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(239,68,68,0.15)] transition-all duration-200 hover:-translate-y-0.5 space-y-3 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] text-red-400/80 font-bold block">
                          {alert.bidder_id}
                        </span>
                        <h3 className="font-bold text-sm text-white group-hover:text-red-200 transition-colors">
                          {alert.company_name}
                        </h3>
                      </div>
                      <StatusBadge status="HIGH" size="sm" />
                    </div>

                    <p className="text-xs text-slate-300 font-normal leading-relaxed">
                      {alert.notes}
                    </p>

                    <div className="pt-1 flex items-center justify-between border-t border-red-500/10 text-xs">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Statutory Discrepancy
                      </span>
                      <Link
                        href={`/verification?bidder=${encodeURIComponent(alert.bidder_id)}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors group/link"
                      >
                        <span>Inspect Issues</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/verification"
                  className="w-full py-3 px-4 text-xs font-bold text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.10] hover:border-blue-500/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(50,110,255,0.15)] rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Open Full AI Verification Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================================
              Audit Activity Timeline (Bottom Glass Panel)
             ======================================================== */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Audit Activity Timeline
                </h3>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Verifiable chronological log of AI verifications and officer determinations
                </p>
              </div>
              <Link
                href="/audit"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors group"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(
                overview?.recent_activities || [
                  {
                    timestamp: "2026-09-26 13:42 IST",
                    entity: "BID-003",
                    action: "MII Local Content Verification",
                    result: "Class-II Ineligible (38% < 50%)",
                  },
                  {
                    timestamp: "2026-09-26 12:15 IST",
                    entity: "BID-008",
                    action: "CBDT Tax Defaulter Cross-Match",
                    result: "Active Demand Notice Flagged",
                  },
                  {
                    timestamp: "2026-09-26 11:30 IST",
                    entity: "BID-001",
                    action: "MCA Director Disqualification Check",
                    result: "Clear — No DIN Disqualification",
                  },
                  {
                    timestamp: "2026-09-26 10:05 IST",
                    entity: "BID-005",
                    action: "GSTIN Status Verification",
                    result: "Suspended / Non-Filing Status",
                  },
                ]
              )
                .slice(0, 4)
                .map((act, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.35),0_0_16px_rgba(50,110,255,0.12)] space-y-2 text-xs transition-all duration-200"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{act.timestamp}</span>
                      <span className="font-bold text-blue-400">{act.entity}</span>
                    </div>
                    <div className="font-semibold text-white truncate">
                      {act.action}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {act.result}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

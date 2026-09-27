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
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              TOP BENTO ROW: Hero Overview (8-Col) + Featured Compliance Block (4-Col)
              ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Hero Overview Header (Span 8) */}
            <div className="lg:col-span-8 bento-card bento-glow-gold p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-4 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold text-[#725C3A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/12 border border-[#A4864E]/25">
                    GEM PROCUREMENT OFFICER CONSOLE
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight leading-tight">
                  Integrated Bid Compliance Overview
                </h1>
                <p className="text-sm text-[#625F57] font-normal leading-relaxed">
                  Automated multi-source statutory verification, entity cross-matching, and risk evaluation for official procurement determinations.
                </p>
              </div>

              {/* Action Toolbar anchored at bottom of Hero */}
              <div className="relative z-10 flex flex-wrap items-center gap-4 pt-6 mt-4 border-t border-black/[0.08]">
                <button
                  onClick={handleQuickDemoBatch}
                  disabled={isDemoLoading}
                  className="relative group px-6 py-3 rounded-[10px] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] text-[#F1EEE6] font-extrabold text-xs tracking-wide uppercase transition-all duration-200 shadow-[0_2px_12px_rgba(164,134,78,0.25)] border border-[#C2A96D]/40 hover:-translate-y-0.5 disabled:opacity-50 flex items-center gap-3 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#F1EEE6]" />
                  <div className="text-left">
                    <span className="block leading-tight font-extrabold">
                      {isDemoLoading ? "Processing Batch..." : "Run AI Verification"}
                    </span>
                    <span className="text-[9px] text-[#F1EEE6]/80 normal-case font-medium block">
                      Demo Tender Analysis
                    </span>
                  </div>
                </button>

                <button
                  onClick={loadData}
                  className="p-3 rounded-[10px] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.08] hover:border-[#A4864E]/40 hover:-translate-y-0.5 text-[#625F57] hover:text-[#24221E] transition-all duration-200 cursor-pointer shadow-xs"
                  title="Refresh Dashboard Data"
                  aria-label="Refresh Dashboard Data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#A4864E]" : ""}`} />
                </button>
              </div>
            </div>

            {/* Featured Hero Metric: Avg Compliance (Span 4) */}
            <div className="lg:col-span-4 bento-card bento-glow-emerald p-7 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  Avg Compliance
                </span>
                <div className="w-10 h-10 rounded-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="my-6 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl lg:text-6xl font-black text-emerald-700 tracking-tight">
                    {avgComplianceVal}
                  </span>
                  <span className="text-xs text-emerald-800 font-bold uppercase tracking-wider">
                    Concordance
                  </span>
                </div>
                <p className="text-xs text-[#625F57] font-normal leading-relaxed">
                  Cross-registry statutory alignment score across all evaluated bidders.
                </p>
              </div>

              {/* Progress gauge bar */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.08]">
                <div className="flex items-center justify-between text-[10px] text-[#625F57] font-medium">
                  <span>Concordance Health</span>
                  <span className="text-emerald-700 font-bold">Optimal</span>
                </div>
                <div className="w-full bg-black/[0.08] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              MID BENTO ROW: Asymmetrical KPI Metric Cluster (5:4:3 Ratio)
              ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
            {/* Active Tenders — Wide Featured Metric (Span 5) */}
            <div className="sm:col-span-6 lg:col-span-5 bento-card bento-glow-gold p-6 flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between text-[#625F57] mb-3">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                    Active Tenders
                  </span>
                  <div className="w-9 h-9 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center">
                    <FileSpreadsheet className="w-4.5 h-4.5" />
                  </div>
                </div>
                <div className="text-4xl font-black text-[#24221E] tracking-tight mb-1">
                  {activeTendersVal}
                </div>
                <p className="text-xs text-[#625F57] font-normal">Tenders under evaluation</p>
              </div>

              {/* Warm Mini Chart Accent */}
              <div className="mt-5 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-50">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="grad-bento-gold" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A4864E" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#A4864E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,38 Q30,24 60,30 T120,18 T160,22 T200,8 L200,48 L0,48 Z"
                    fill="url(#grad-bento-gold)"
                  />
                  <path
                    d="M0,38 Q30,24 60,30 T120,18 T160,22 T200,8"
                    fill="none"
                    stroke="#A4864E"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Bidders Screened — Mid Metric Block (Span 4) */}
            <div className="sm:col-span-6 lg:col-span-4 bento-card bento-glow-bronze p-6 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between text-[#625F57] mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  Bidders Screened
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#725C3A]/15 border border-[#725C3A]/30 text-[#725C3A] flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-4xl font-black text-[#24221E] tracking-tight mb-1">
                {biddersScreenedVal}
              </div>
              <p className="text-xs text-[#625F57] font-normal">Synthetic bidder dossiers</p>
            </div>

            {/* Pending Decisions — Compact Metric Block (Span 3) */}
            <div className="sm:col-span-12 lg:col-span-3 bento-card bento-glow-amber p-6 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between text-[#625F57] mb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  Pending Decisions
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-4xl font-black text-amber-700 tracking-tight mb-1">
                {pendingDecisionsVal}
              </div>
              <p className="text-xs text-[#625F57] font-normal">Awaiting officer sign-off</p>
            </div>
          </div>

          {/* ========================================================
              MAIN BENTO SPLIT: Recent Tenders Table (Span 7) + High Risk Right Tower (Span 5)
              ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Bento Panel: Recent GEM Tenders (Span 7) */}
            <div className="lg:col-span-7 bento-card p-7 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                <div>
                  <h2 className="text-lg font-bold text-[#24221E] tracking-tight">
                    Recent GEM Tenders
                  </h2>
                  <p className="text-xs text-[#625F57] font-normal mt-0.5">
                    Tenders with AI extracted statutory and technical criteria
                  </p>
                </div>
                <Link
                  href="/tenders"
                  className="text-xs font-semibold text-[#A4864E] hover:text-[#725C3A] flex items-center gap-1.5 transition-colors group"
                >
                  <span>View All Tenders</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {/* Clean Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/[0.08] text-[10px] font-extrabold uppercase tracking-widest text-[#817C72]">
                      <th className="py-3 px-4">Tender ID</th>
                      <th className="py-3 px-4">Tender Title</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Requirements</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06]">
                    {displayTenders.map((t) => (
                      <tr
                        key={t.tender_id}
                        className="hover:bg-black/[0.03] transition-colors group duration-150"
                      >
                        <td className="py-4 px-4 font-mono font-bold text-[#725C3A]">
                          {t.tender_id}
                        </td>
                        <td className="py-4 px-4 font-semibold text-[#24221E] max-w-[240px]">
                          <span className="line-clamp-2 leading-relaxed">
                            {t.title}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#625F57]">
                          {t.department}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/[0.04] border border-black/[0.08] text-[#625F57]">
                            {t.requirements_count || 12} Criteria
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-[#A4864E]/12 hover:bg-[#A4864E]/20 text-[#725C3A] hover:text-[#24221E] font-semibold text-xs border border-[#A4864E]/30 transition-all duration-200"
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

            {/* Right Bento Column: Interlocked High Risk Tower (Span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* High Risk Metric Block */}
              <div className="bento-card bento-glow-red p-6 border-red-500/25 flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">
                      High Risk Bidders
                    </span>
                  </div>
                  <div className="text-3xl font-black text-red-700 tracking-tight">
                    {highRiskBiddersVal}
                  </div>
                  <p className="text-[11px] text-[#625F57] font-normal">Critical statutory discrepancies flagged</p>
                </div>
                <div className="w-11 h-11 rounded-[10px] bg-red-500/15 border border-red-500/30 text-red-700 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>

              {/* High Risk Bidders Alert Container */}
              <div className="bento-card bento-glow-red p-7 border-red-500/20 flex-1 flex flex-col justify-between space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                      High Risk Bidders Alert
                    </h2>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-[8px] bg-red-500/15 text-red-700 border border-red-500/30">
                    Active Flags
                  </span>
                </div>

                {/* 3 Red-Accented Alert Cards */}
                <div className="space-y-3.5 flex-1">
                  {HIGH_RISK_ALERTS.map((alert) => (
                    <div
                      key={alert.bidder_id}
                      className="relative rounded-[14px] bg-[#E3DFD6] border border-red-500/25 p-4 shadow-xs hover:border-red-500/45 transition-all duration-200 hover:-translate-y-0.5 space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-mono text-[10px] text-red-700 font-bold block">
                            {alert.bidder_id}
                          </span>
                          <h3 className="font-bold text-xs text-[#24221E]">
                            {alert.company_name}
                          </h3>
                        </div>
                        <StatusBadge status="HIGH" size="sm" />
                      </div>

                      <p className="text-[11px] text-[#625F57] font-normal leading-relaxed">
                        {alert.notes}
                      </p>

                      <div className="pt-2 flex items-center justify-between border-t border-black/[0.06] text-xs">
                        <span className="text-[10px] text-[#817C72] font-medium">
                          Statutory Discrepancy
                        </span>
                        <Link
                          href={`/verification?bidder=${encodeURIComponent(alert.bidder_id)}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 transition-colors group/link"
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
                    className="w-full py-3 px-4 text-xs font-bold text-[#24221E] bg-[#E3DFD6] hover:bg-[#EEEAE1] border border-black/[0.10] hover:border-[#A4864E]/40 hover:-translate-y-0.5 rounded-[10px] flex items-center justify-center gap-2 transition-all duration-200 shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#A4864E]" />
                    <span>Open Full AI Verification Console</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              BOTTOM BENTO STREAM: Audit Activity Timeline (Full Width)
              ======================================================== */}
          <div className="bento-card p-7 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div>
                <h3 className="text-base font-bold text-[#24221E] tracking-tight">
                  Audit Activity Timeline
                </h3>
                <p className="text-xs text-[#625F57] font-normal mt-0.5">
                  Verifiable chronological log of AI verifications and officer determinations
                </p>
              </div>
              <Link
                href="/audit"
                className="text-xs font-semibold text-[#A4864E] hover:text-[#725C3A] flex items-center gap-1.5 transition-colors group"
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
                    className="p-4 rounded-[12px] bg-[#E3DFD6] hover:bg-[#EEEAE1] border border-black/[0.08] hover:border-[#A4864E]/35 hover:-translate-y-0.5 space-y-2 text-xs transition-all duration-200 shadow-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#817C72] font-mono">
                      <span>{act.timestamp}</span>
                      <span className="font-bold text-[#725C3A]">{act.entity}</span>
                    </div>
                    <div className="font-bold text-[#24221E] truncate">
                      {act.action}
                    </div>
                    <div className="text-[11px] text-[#625F57] truncate">
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

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  AlertTriangle,
  Award,
  Clock,
  ArrowRight,
  ShieldCheck,
  Building,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { DashboardOverview, Tender } from "@/lib/types";

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
      setTenders(tendersData);
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
    try {
      await api.runBatchVerification("GEM/2026/B/100001");
      await loadData();
    } catch (err) {
      console.error("Batch run error:", err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
          {/* Welcome Header & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  GeM Procurement Officer Console
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Integrated Bid Compliance Overview
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automated multi-source statutory verification, entity cross-matching, and risk evaluation.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleQuickDemoBatch}
                disabled={isDemoLoading}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isDemoLoading ? "Processing Batch..." : "Run AI Verification (Demo Tender)"}</span>
              </button>

              <button
                onClick={loadData}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                title="Refresh Metrics"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* 5 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Card 1: Active Tenders */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Tenders</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {overview?.kpi.active_tenders ?? 3}
              </div>
              <span className="text-[11px] text-slate-400">Tenders under evaluation</span>
            </div>

            {/* Card 2: Bidders Under Verification */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Bidders Screened</span>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {overview?.kpi.bidders_under_verification ?? 10}
              </div>
              <span className="text-[11px] text-slate-400">Synthetic bidder dossiers</span>
            </div>

            {/* Card 3: Pending Reviews */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Officer Decisions</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-600">
                {overview?.kpi.pending_reviews ?? 4}
              </div>
              <span className="text-[11px] text-slate-400">Awaiting human sign-off</span>
            </div>

            {/* Card 4: High Risk Bidders */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">High Risk Bidders</span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600">
                {overview?.kpi.high_risk_bidders ?? 2}
              </div>
              <span className="text-[11px] text-slate-400">Critical discrepancies flagged</span>
            </div>

            {/* Card 5: Average Compliance */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Compliance</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-600">
                {overview?.kpi.average_compliance_score ?? "76%"}
              </div>
              <span className="text-[11px] text-slate-400">Multi-source concordance</span>
            </div>
          </div>

          {/* 2-Column Grid: Active Tenders & High Risk Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Tenders List (Span 2) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                    Recent GeM Tenders
                  </h3>
                  <p className="text-xs text-slate-400">Tenders with AI extracted statutory and technical criteria</p>
                </div>
                <Link
                  href="/tenders"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Tender ID</th>
                      <th className="py-2.5 px-3">Tender Title</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Requirements</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tenders.slice(0, 4).map((t) => (
                      <tr key={t.tender_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {t.tender_id}
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                          {t.title}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{t.department}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">
                            {t.requirements_count || 10} Criteria
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-md transition-colors"
                          >
                            Inspect Criteria
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* High Risk Bidders Attention Box (Span 1) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="uppercase tracking-wider">High Risk Bidders Alert</h3>
              </div>

              <div className="space-y-3">
                {overview?.high_risk_bidders?.map((b) => (
                  <div
                    key={b.bidder_id}
                    className="p-3 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {b.company_name}
                      </span>
                      <StatusBadge status="HIGH" size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {b.notes || "Discrepancy in statutory filings or domestic content threshold."}
                    </p>
                    <div className="pt-1 flex justify-between items-center text-[11px]">
                      <span className="font-mono text-slate-400">{b.bidder_id}</span>
                      <Link
                        href={`/verification?bidder=${b.bidder_id}`}
                        className="font-bold text-rose-600 hover:underline"
                      >
                        Inspect Issues →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/verification"
                  className="w-full py-2 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Open Verification Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Audit Activity Timeline
                </h3>
                <p className="text-xs text-slate-400">Verifiable chronological log of AI verifications and officer determinations</p>
              </div>
              <Link
                href="/audit"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Full Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {overview?.recent_activities?.slice(0, 4).map((act, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{act.timestamp}</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{act.entity}</span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {act.action}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
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

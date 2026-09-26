"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, FileText, Download, CheckCircle2, Building, Sparkles, ArrowRight, ShieldCheck, Layers } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { Tender } from "@/lib/types";

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // New tender form state
  const [tenderId, setTenderId] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");

  const loadTenders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTenders();
      setTenders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  const handleLoadDemo = async () => {
    try {
      await api.loadDemoTenders();
      await loadTenders();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTender = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await api.createTender({
        tender_id: tenderId,
        title,
        department,
        estimated_value_inr: parseFloat(estimatedValue) || 10000000,
        status: "ACTIVE",
      });
      setShowModal(false);
      setTenderId("");
      setTitle("");
      setDepartment("");
      setEstimatedValue("");
      await loadTenders();
    } catch (err) {
      alert("Error creating tender: " + err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* Header Card */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    GEM PROCUREMENT EVALUATION
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Tender Management &amp; AI Criteria
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 font-normal leading-relaxed">
                  Manage active tenders, inspect AI-extracted statutory clauses and technical compliance rules.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(50,110,255,0.15)] rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(0,0,0,0.4)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Load Demo Tenders</span>
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Tender</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tenders Table Card */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Registered Tenders ({tenders.length})
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Tenders undergoing automated compliance scrutiny and entity cross-checking
                </p>
              </div>
              <button
                onClick={loadTenders}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                title="Refresh Tenders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Tender ID</th>
                    <th className="py-3 px-4">Tender Name</th>
                    <th className="py-3 px-4">Organization / Department</th>
                    <th className="py-3 px-4">Est. Value (INR)</th>
                    <th className="py-3 px-4">AI Requirements</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tenders.map((t) => (
                    <tr key={t.tender_id} className="hover:bg-white/[0.05] transition-colors duration-150">
                      <td className="py-4 px-4 font-mono font-bold text-blue-400">
                        {t.tender_id}
                      </td>
                      <td className="py-4 px-4 max-w-sm">
                        <span className="font-semibold text-white block leading-snug">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">
                          {t.category || "Goods"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {t.department}
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-200">
                        ₹{t.estimated_value_inr?.toLocaleString("en-IN") || "4,50,00,000"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 font-semibold text-[10px] uppercase tracking-wide">
                          <Layers className="w-3 h-3" />
                          <span>{t.requirements_count || 10} Extracted Rules</span>
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={t.status || "ACTIVE"} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="px-3 py-1.5 text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.09] text-slate-300 hover:text-white border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 transition-all rounded-lg"
                          >
                            View Criteria
                          </Link>
                          <Link
                            href={`/verification?tender=${encodeURIComponent(t.tender_id)}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:-translate-y-0.5 rounded-lg shadow-[0_0_12px_rgba(59,130,246,0.15)] transition-all"
                          >
                            <span>Verify Bids</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Create Tender Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-black/90 border border-white/[0.12] rounded-[22px] shadow-[0_12px_50px_rgba(0,0,0,0.8)] p-7 space-y-5 backdrop-blur-2xl">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Create New Procurement Tender
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter tender specifications. BidSentinel will automatically extract statutory and technical rules.
              </p>
            </div>

            <form onSubmit={handleCreateTender} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Tender ID (e.g. GEM/2026/B/100004)
                </label>
                <input
                  type="text"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  placeholder="GEM/2026/B/100004"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Tender Title / Item Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Supply of Precision Micro-Sensors"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Procuring Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="National Instrumentation Laboratory"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Estimated Value (INR)
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="25000000"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? "Extracting Rules..." : "Create & Extract Criteria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              TOP BENTO ROW: Header Overview (8-Col) + Scrutiny Summary Card (4-Col)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Header Card (Span 8) */}
            <div className="lg:col-span-8 bento-card bento-glow-gold p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold text-[#725C3A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/12 border border-[#A4864E]/25">
                    GEM PROCUREMENT EVALUATION
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24221E] tracking-tight">
                  Tender Management &amp; AI Criteria
                </h1>
                <p className="text-xs lg:text-sm text-[#625F57] font-normal leading-relaxed">
                  Manage active tenders, inspect AI-extracted statutory clauses and technical compliance rules.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3 shrink-0 pt-6 mt-4 border-t border-black/[0.08]">
                <button
                  onClick={handleLoadDemo}
                  className="px-4 py-2.5 text-xs font-semibold text-[#24221E] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.10] hover:border-[#A4864E]/40 hover:-translate-y-0.5 rounded-[10px] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A4864E]" />
                  <span>Load Demo Tenders</span>
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="px-5 py-2.5 text-xs font-extrabold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] rounded-[10px] transition-all duration-200 shadow-[0_2px_12px_rgba(164,134,78,0.25)] border border-[#C2A96D]/40 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#F1EEE6]" />
                  <span>Create Tender</span>
                </button>
              </div>
            </div>

            {/* Featured Scrutiny Summary Metric (Span 4) */}
            <div className="lg:col-span-4 bento-card bento-glow-gold p-7 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  Tender Roster Health
                </span>
                <div className="w-10 h-10 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="my-4 space-y-1">
                <div className="text-4xl font-black text-[#24221E] tracking-tight">
                  {tenders.length} <span className="text-sm text-[#625F57] font-normal">Active Tenders</span>
                </div>
                <p className="text-xs text-[#625F57] font-normal">
                  Over 55+ automated compliance rules active
                </p>
              </div>

              <div className="pt-3 border-t border-black/[0.08] flex items-center justify-between text-xs">
                <span className="text-[10px] text-[#817C72] uppercase tracking-widest font-extrabold">Scrutiny Status</span>
                <span className="text-[#A4864E] font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#A4864E] animate-pulse" />
                  <span>Real-Time Ingestion</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tenders Table Card */}
          <div className="bento-card p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div>
                <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                  Registered Tenders ({tenders.length})
                </h2>
                <p className="text-xs text-[#625F57] font-normal mt-0.5">
                  Tenders undergoing automated compliance scrutiny and entity cross-checking
                </p>
              </div>
              <button
                onClick={loadTenders}
                className="p-2.5 rounded-[10px] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.10] hover:border-[#A4864E]/40 hover:-translate-y-0.5 text-[#625F57] hover:text-[#24221E] transition-all cursor-pointer shadow-xs"
                title="Refresh Tenders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#A4864E]" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.08] text-[10px] font-extrabold uppercase tracking-widest text-[#817C72]">
                    <th className="py-3 px-4 whitespace-nowrap">Tender ID</th>
                    <th className="py-3 px-4 w-[35%] min-w-[250px]">Tender Name</th>
                    <th className="py-3 px-4 whitespace-nowrap">Organization</th>
                    <th className="py-3 px-4 whitespace-nowrap">Est. Value (INR)</th>
                    <th className="py-3 px-4 whitespace-nowrap">AI Requirements</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {tenders.map((t) => (
                    <tr key={t.tender_id} className="hover:bg-black/[0.03] transition-colors duration-150">
                      <td className="py-4 px-4 font-mono font-bold text-[#725C3A] whitespace-nowrap">
                        {t.tender_id}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[#24221E] block leading-snug">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-[#625F57] font-normal mt-0.5 block">
                          {t.category || "Goods"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#625F57] whitespace-nowrap">
                        {t.department}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-[#24221E] whitespace-nowrap">
                        ₹{t.estimated_value_inr?.toLocaleString("en-IN") || "4,50,00,000"}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#A4864E]/12 text-[#725C3A] border border-[#A4864E]/25 font-bold text-[10px] uppercase tracking-wide">
                          <Layers className="w-3 h-3" />
                          <span>{t.requirements_count || 10} Extracted Rules</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={t.status || "ACTIVE"} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="inline-flex items-center justify-center h-8 whitespace-nowrap px-3 text-xs font-semibold bg-[#E3DFD6] hover:bg-[#EEEAE1] text-[#24221E] border border-black/[0.10] rounded-[8px] transition-all"
                          >
                            View Criteria
                          </Link>
                          <Link
                            href={`/verification?tender=${encodeURIComponent(t.tender_id)}`}
                            className="inline-flex items-center justify-center h-8 whitespace-nowrap gap-1.5 px-3 text-xs font-semibold bg-[#A4864E]/15 hover:bg-[#A4864E]/25 text-[#725C3A] hover:text-[#24221E] border border-[#A4864E]/30 rounded-[8px] transition-all"
                          >
                            <span>Verify Bids</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Create Tender Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="w-full max-w-lg bg-[#E3DFD6] rounded-2xl p-7 space-y-5 shadow-2xl border border-black/[0.14]">
                <div>
                  <h3 className="text-lg font-bold text-[#24221E] tracking-tight">
                    Create New Procurement Tender
                  </h3>
                  <p className="text-xs text-[#625F57] mt-1">
                    Enter tender specifications. BidSentinel will automatically extract statutory and technical rules.
                  </p>
                </div>

                <form onSubmit={handleCreateTender} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-wider mb-1">
                      Tender ID Number
                    </label>
                    <input
                      type="text"
                      value={tenderId}
                      onChange={(e) => setTenderId(e.target.value)}
                      placeholder="e.g. GEM/2026/B/9012345"
                      className="w-full p-3 rounded-[10px] border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-wider mb-1">
                      Item / Service Description
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Procurement of High-Resolution Ultrasonic Scanners"
                      className="w-full p-3 rounded-[10px] border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-wider mb-1">
                        Procuring Department
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g. Ministry of Health"
                        className="w-full p-3 rounded-[10px] border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-wider mb-1">
                        Est. Value (INR)
                      </label>
                      <input
                        type="number"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        placeholder="e.g. 50000000"
                        className="w-full p-3 rounded-[10px] border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.08]">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2.5 font-semibold text-[#625F57] hover:text-[#24221E] bg-[#D8D4CB] border border-black/[0.10] rounded-[10px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreating}
                      className="px-5 py-2.5 font-bold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] rounded-[10px] shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isCreating ? "Extracting Rules..." : "Create & Extract Criteria"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

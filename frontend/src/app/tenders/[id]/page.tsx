"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  ShieldAlert,
  Cpu,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { Tender, TenderRequirement } from "@/lib/types";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params.id as string;
  const tenderId = decodeURIComponent(rawId);

  const [tender, setTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New requirement form
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("TECHNICAL");
  const [newMandatory, setNewMandatory] = useState<"YES" | "NO" | "CONDITIONAL">("YES");
  const [newCondition, setNewCondition] = useState("");
  const [newSource, setNewSource] = useState("DOCUMENT");

  const loadTender = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTender(tenderId);
      setTender(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTender();
  }, [tenderId]);

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addCustomRequirement(tenderId, {
        title: newTitle,
        category: newCategory,
        mandatory: newMandatory,
        condition: newCondition,
        verification_source: newSource,
        rule_code: "RULE_CUSTOM_CHECK",
        weight: 10,
      });
      setShowAddModal(false);
      setNewTitle("");
      setNewCondition("");
      await loadTender();
    } catch (err) {
      alert("Error adding requirement: " + err);
    }
  };

  const handleDeleteRequirement = async (reqId: string) => {
    if (!confirm("Are you sure you want to remove this compliance requirement?")) return;
    try {
      await api.deleteRequirement(tenderId, reqId);
      await loadTender();
    } catch (err) {
      alert("Error deleting requirement: " + err);
    }
  };

  const handleReExtract = async () => {
    setIsExtracting(true);
    try {
      await api.extractRequirements(tenderId, tender?.description);
      await loadTender();
    } catch (err) {
      alert("Error re-extracting: " + err);
    } finally {
      setIsExtracting(false);
    }
  };

  if (isLoading && !tender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Tenders</span>
            </Link>

            <Link
              href={`/verification?tender=${encodeURIComponent(tenderId)}`}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Verify Bidders on this Tender</span>
            </Link>
          </div>

          {/* Tender Header Summary Card */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-bold text-blue-400 block tracking-wider">
                  {tender?.tender_id}
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {tender?.title}
                </h1>
              </div>
              <div className="shrink-0">
                <StatusBadge status={tender?.status || "ACTIVE"} size="md" />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs pt-1">
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                  Department
                </span>
                <span className="font-medium text-white block text-sm">
                  {tender?.department}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                  Estimated Value
                </span>
                <span className="font-mono font-bold text-white block text-sm">
                  ₹{tender?.estimated_value_inr?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                  Ref Number
                </span>
                <span className="font-mono text-slate-300 block text-sm">
                  {tender?.reference_number || "N/A"}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold text-[11px] uppercase tracking-wider">
                  Bid Closing Date
                </span>
                <span className="text-slate-300 block text-sm">
                  {tender?.closing_date || "2026-10-31"}
                </span>
              </div>
            </div>

            <div className="pt-3 text-xs text-slate-300 bg-white/[0.04] p-4 rounded-xl border border-white/[0.08] leading-relaxed">
              <strong className="text-blue-400 font-semibold uppercase text-[10px] tracking-wider block mb-1">
                Procurement Scope &amp; AI Directives:
              </strong>{" "}
              {tender?.description}
            </div>
          </div>

          {/* AI Extracted Requirements Card */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">
                    AI Extracted Tender Requirements ({tender?.requirements?.length || 0})
                  </h2>
                </div>
                <p className="text-xs text-slate-400 font-normal mt-1">
                  Extracted compliance rules applied automatically during multi-source bidder verification.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReExtract}
                  disabled={isExtracting}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(50,110,255,0.15)] rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isExtracting ? "animate-spin" : ""}`} />
                  <span>Re-Extract via AI</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Criterion</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mandatory</th>
                    <th className="py-3 px-4">Condition / Threshold</th>
                    <th className="py-3 px-4">Verification Source</th>
                    <th className="py-3 px-4">Rule Code</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {tender?.requirements?.map((req) => (
                    <tr key={req.id} className="hover:bg-white/[0.05] transition-colors duration-150">
                      <td className="py-4 px-4 font-semibold text-white">
                        {req.title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.10] text-slate-300 font-semibold text-[10px] uppercase tracking-wider">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                            req.mandatory === "YES"
                              ? "bg-red-500/10 text-red-400 border border-red-500/25"
                              : req.mandatory === "CONDITIONAL"
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/25"
                              : "bg-white/[0.04] text-slate-400 border border-white/[0.08]"
                          }`}
                        >
                          {req.mandatory}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                        {req.condition || "Standard compliance check"}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-300 font-medium">
                          {req.verification_source}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-blue-400">
                        {req.rule_code || "RULE_STANDARD"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRequirement(req.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Remove Requirement"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Custom Criterion Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-black/90 border border-white/[0.12] rounded-[22px] shadow-[0_12px_50px_rgba(0,0,0,0.8)] p-7 space-y-5 backdrop-blur-2xl">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Add Tender Compliance Requirement
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Configure a custom verification clause or statutory condition.
              </p>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Criterion Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ISO 9001 Quality Management Certificate"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="STATUTORY">STATUTORY</option>
                  <option value="MSME">MSME</option>
                  <option value="TENDER_SPECIFIC">TENDER SPECIFIC</option>
                  <option value="MAKE_IN_INDIA">MAKE IN INDIA</option>
                  <option value="FINANCIAL">FINANCIAL</option>
                  <option value="TECHNICAL">TECHNICAL</option>
                  <option value="ELIGIBILITY">ELIGIBILITY</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Mandatory Status
                </label>
                <select
                  value={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="YES">YES (Mandatory)</option>
                  <option value="CONDITIONAL">CONDITIONAL (If benefit claimed)</option>
                  <option value="NO">NO (Optional)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Condition / Rule Threshold
                </label>
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Valid ISO certificate from accredited registrar"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Verification Source
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. ISO_REGISTRAR or DOCUMENT"
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer"
                >
                  Add Requirement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-[#C9C5BC]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#A4864E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* Breadcrumb & Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#625F57] hover:text-[#24221E] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Tenders</span>
            </Link>

            <Link
              href={`/verification?tender=${encodeURIComponent(tenderId)}`}
              className="px-5 py-2.5 text-xs font-extrabold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] rounded-xl transition-all duration-200 shadow-[0_2px_12px_rgba(164,134,78,0.25)] border border-[#C2A96D]/40 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 text-[#F1EEE6]" />
              <span>Verify Bidders on this Tender</span>
            </Link>
          </div>

          {/* Asymmetrical Tender Summary Section (8:4 Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Tender Details & Scope Card (Span 8) */}
            <div className="lg:col-span-8 bento-card bento-glow-gold p-8 space-y-6 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-black/[0.08] pb-4">
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold text-[#725C3A] block tracking-wider">
                      {tender?.tender_id}
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24221E] tracking-tight">
                      {tender?.title}
                    </h1>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={tender?.status || "ACTIVE"} size="md" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                  <div className="space-y-1">
                    <span className="text-[#817C72] block font-extrabold text-[10px] uppercase tracking-widest">
                      Department
                    </span>
                    <span className="font-semibold text-[#24221E] block text-sm">
                      {tender?.department}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#817C72] block font-extrabold text-[10px] uppercase tracking-widest">
                      Estimated Value
                    </span>
                    <span className="font-mono font-bold text-[#24221E] block text-sm">
                      ₹{tender?.estimated_value_inr?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#817C72] block font-extrabold text-[10px] uppercase tracking-widest">
                      Ref Number
                    </span>
                    <span className="font-mono text-[#625F57] block text-sm">
                      {tender?.reference_number || "N/A"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#817C72] block font-extrabold text-[10px] uppercase tracking-widest">
                      Bid Closing Date
                    </span>
                    <span className="text-[#625F57] block text-sm">
                      {tender?.closing_date || "2026-10-31"}
                    </span>
                  </div>
                </div>

                <div className="pt-3 text-xs text-[#625F57] bg-[#E3DFD6] p-4 rounded-xl border border-black/[0.08] leading-relaxed">
                  <strong className="text-[#725C3A] font-extrabold uppercase text-[10px] tracking-widest block mb-1">
                    Procurement Scope &amp; AI Directives:
                  </strong>{" "}
                  {tender?.description}
                </div>
              </div>
            </div>

            {/* AI Extraction Health Card (Span 4) */}
            <div className="lg:col-span-4 bento-card bento-glow-gold p-7 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  AI Rules Engine Health
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </div>

              <div className="my-5 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-[#24221E] tracking-tight">
                    {tender?.requirements?.length || 0}
                  </span>
                  <span className="text-xs text-[#625F57] font-bold uppercase tracking-wider">
                    Extracted Clauses
                  </span>
                </div>
                <p className="text-xs text-[#625F57] font-normal leading-relaxed">
                  Automated statutory, technical, and Make-in-India criteria extracted from procurement document.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-black/[0.08] text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#625F57] font-medium">Mandatory Rules:</span>
                  <span className="font-bold text-emerald-700">
                    {tender?.requirements?.filter((r) => r.mandatory === "YES").length || 0} Clauses
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#625F57] font-medium">Conditional Rules:</span>
                  <span className="font-bold text-amber-700">
                    {tender?.requirements?.filter((r) => r.mandatory === "CONDITIONAL").length || 0} Clauses
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Extracted Requirements Card */}
          <div className="bento-card p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/[0.08]">
              <div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#A4864E]" />
                  <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                    AI Extracted Tender Requirements ({tender?.requirements?.length || 0})
                  </h2>
                </div>
                <p className="text-xs text-[#625F57] font-normal mt-1">
                  Extracted compliance rules applied automatically during multi-source bidder verification.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReExtract}
                  disabled={isExtracting}
                  className="px-4 py-2 text-xs font-semibold text-[#24221E] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.10] hover:border-[#A4864E]/40 hover:-translate-y-0.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#A4864E] ${isExtracting ? "animate-spin" : ""}`} />
                  <span>Re-Extract via AI</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-xs font-extrabold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] rounded-xl flex items-center gap-2 transition-all shadow-xs hover:-translate-y-0.5 cursor-pointer border border-[#C2A96D]/40"
                >
                  <Plus className="w-3.5 h-3.5 text-[#F1EEE6]" />
                  <span>Add Criterion</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/[0.08] text-[10px] font-extrabold uppercase tracking-widest text-[#817C72]">
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mandatory</th>
                    <th className="py-3 px-4">Condition / Threshold</th>
                    <th className="py-3 px-4">Verification Source</th>
                    <th className="py-3 px-4">Rule Code</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.06]">
                  {tender?.requirements?.map((req) => (
                    <tr key={req.id} className="hover:bg-black/[0.03] transition-colors duration-150">
                      <td className="py-4 px-4 font-bold text-[#24221E]">
                        {req.title}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-black/[0.04] border border-black/[0.08] text-[#625F57] font-semibold text-[10px] uppercase tracking-wider">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                            req.mandatory === "YES"
                              ? "bg-red-500/15 text-red-700 border border-red-500/30"
                              : req.mandatory === "CONDITIONAL"
                              ? "bg-amber-500/15 text-amber-800 border border-amber-500/30"
                              : "bg-black/[0.04] text-[#625F57] border border-black/[0.08]"
                          }`}
                        >
                          {req.mandatory}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#625F57] max-w-xs truncate">
                        {req.condition || "Standard compliance check"}
                      </td>
                      <td className="py-4 px-4 font-mono text-[#24221E] font-medium">
                        {req.verification_source}
                      </td>
                      <td className="py-4 px-4 font-mono text-[11px] text-[#725C3A] font-bold">
                        {req.rule_code || "RULE_STANDARD"}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRequirement(req.id)}
                          className="p-1.5 text-[#817C72] hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#E3DFD6] rounded-2xl p-7 space-y-5 shadow-2xl border border-black/[0.14]">
            <div>
              <h3 className="text-lg font-bold text-[#24221E] tracking-tight">
                Add Tender Compliance Requirement
              </h3>
              <p className="text-xs text-[#625F57] mt-1">
                Configure a custom verification clause or statutory condition.
              </p>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Criterion Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ISO 9001 Quality Management Certificate"
                  className="w-full p-2.5 rounded-xl border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] focus:outline-none focus:border-[#A4864E]/60"
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
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Mandatory Status
                </label>
                <select
                  value={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] focus:outline-none focus:border-[#A4864E]/60"
                >
                  <option value="YES">YES (Mandatory)</option>
                  <option value="CONDITIONAL">CONDITIONAL (If benefit claimed)</option>
                  <option value="NO">NO (Optional)</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Condition / Rule Threshold
                </label>
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Valid ISO certificate from accredited registrar"
                  className="w-full p-2.5 rounded-xl border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                />
              </div>

              <div>
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Verification Source
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. ISO_REGISTRAR or DOCUMENT"
                  className="w-full p-2.5 rounded-xl border border-black/[0.12] bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-black/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 font-semibold text-[#625F57] hover:text-[#24221E] bg-[#D8D4CB] border border-black/[0.10] rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 font-bold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] rounded-xl shadow-xs cursor-pointer"
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

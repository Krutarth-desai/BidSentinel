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
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/tenders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Tenders</span>
            </Link>

            <Link
              href={`/verification?tender=${encodeURIComponent(tenderId)}`}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Verify Bidders on this Tender</span>
            </Link>
          </div>

          {/* Tender Header Summary Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  {tender?.tender_id}
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {tender?.title}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300">
                  {tender?.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-1">
              <div>
                <span className="text-slate-400 block font-semibold">Department</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{tender?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Estimated Value</span>
                <span className="font-medium font-mono text-slate-800 dark:text-slate-200">
                  ₹{tender?.estimated_value_inr?.toLocaleString("en-IN")}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Ref Number</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{tender?.reference_number || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Bid Closing Date</span>
                <span className="text-slate-700 dark:text-slate-300">{tender?.closing_date || "2026-10-31"}</span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-700 dark:text-slate-300">Procurement Scope:</strong> {tender?.description}
            </div>
          </div>

          {/* AI Extracted Requirements Header */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    AI Extracted Tender Requirements ({tender?.requirements?.length || 0})
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Extracted compliance rules applied automatically during bidder verification.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReExtract}
                  disabled={isExtracting}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? "animate-spin" : ""}`} />
                  <span>Re-Extract via AI</span>
                </button>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Criterion</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mandatory</th>
                    <th className="py-3 px-4">Condition / Threshold</th>
                    <th className="py-3 px-4">Verification Source</th>
                    <th className="py-3 px-4">Rule Code</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tender?.requirements?.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {req.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-semibold ${
                            req.mandatory === "YES"
                              ? "text-rose-600"
                              : req.mandatory === "CONDITIONAL"
                              ? "text-amber-600"
                              : "text-slate-500"
                          }`}
                        >
                          {req.mandatory}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {req.condition || "Standard compliance check"}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {req.verification_source}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                        {req.rule_code || "RULE_STANDARD"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteRequirement(req.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Add Tender Compliance Requirement
            </h3>
            <form onSubmit={handleAddRequirement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Criterion Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. ISO 9001 Quality Management Certificate"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
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
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Mandatory Status
                </label>
                <select
                  value={newMandatory}
                  onChange={(e) => setNewMandatory(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="YES">YES (Mandatory)</option>
                  <option value="CONDITIONAL">CONDITIONAL (If benefit claimed)</option>
                  <option value="NO">NO (Optional)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Condition / Rule Threshold
                </label>
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="e.g. Valid ISO certificate from accredited registrar"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Verification Source
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. ISO_REGISTRAR or DOCUMENT"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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

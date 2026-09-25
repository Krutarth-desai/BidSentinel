"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, RefreshCw, FileText, Download, CheckCircle2, Building, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
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
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                GeM Procurement Evaluation
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Tender Management & AI Criteria
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage tenders, inspect AI-extracted statutory and technical compliance rules.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleLoadDemo}
                className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo Tenders</span>
              </button>

              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Tender</span>
              </button>
            </div>
          </div>

          {/* Tenders Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Registered Tenders ({tenders.length})
              </h2>
              <button
                onClick={loadTenders}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Refresh Tenders"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">Tender ID</th>
                    <th className="py-3 px-4">Tender Name</th>
                    <th className="py-3 px-4">Organization / Department</th>
                    <th className="py-3 px-4">Est. Value (INR)</th>
                    <th className="py-3 px-4">AI Requirements</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tenders.map((t) => (
                    <tr key={t.tender_id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {t.tender_id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">
                          {t.title}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {t.category || "Goods"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {t.department}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        ₹{t.estimated_value_inr?.toLocaleString("en-IN") || "4,50,00,000"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold text-[11px] border border-blue-200 dark:border-blue-900">
                          {t.requirements_count || 10} Extracted Rules
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[10px] tracking-wide uppercase">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/tenders/${encodeURIComponent(t.tender_id)}`}
                            className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200 rounded-md transition-colors"
                          >
                            View Criteria
                          </Link>
                          <Link
                            href={`/verification?tender=${encodeURIComponent(t.tender_id)}`}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                          >
                            Verify Bids
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Procurement Tender
            </h3>
            <p className="text-xs text-slate-500">
              Enter tender specifications. BidSentinel will automatically extract statutory and technical rules.
            </p>

            <form onSubmit={handleCreateTender} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tender ID (e.g. GEM/2026/B/100004)
                </label>
                <input
                  type="text"
                  value={tenderId}
                  onChange={(e) => setTenderId(e.target.value)}
                  placeholder="GEM/2026/B/100004"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tender Title / Item Description
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Supply of Precision Micro-Sensors"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Procuring Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="National Instrumentation Laboratory"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Value (INR)
                </label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="25000000"
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
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

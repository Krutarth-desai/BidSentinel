"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Building,
  ShieldCheck,
  AlertTriangle,
  Award,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { Bidder } from "@/lib/types";

export default function BiddersPage() {
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const loadBidders = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBidders();
      setBidders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBidders();
  }, []);

  const filteredBidders = bidders.filter((b) => {
    const matchesSearch =
      b.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.pan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.gstin.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL" || b.risk_level?.toUpperCase() === riskFilter;

    return matchesSearch && matchesRisk;
  });

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
                GeM Procurement Registry
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Bidder Profiles & Compliance Roster
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Multi-source cross-checked statutory identities and document dossiers.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/verification"
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Open Verification Console</span>
              </Link>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, PAN, or GSTIN..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
              <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-xs">
                {["ALL", "LOW", "MEDIUM", "HIGH"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3 py-1 font-semibold transition-colors ${
                      riskFilter === lvl
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bidder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBidders.map((b) => (
              <div
                key={b.bidder_id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {b.bidder_id}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 line-clamp-1">
                        {b.company_name}
                      </h3>
                    </div>
                    <StatusBadge status={b.risk_level || "LOW"} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-2.5">
                    {b.claimed_msme_benefit && (
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
                        MSME ({b.msme_category || "SMALL"})
                      </span>
                    )}
                    {b.claimed_startup_benefit && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                        DPIIT STARTUP
                      </span>
                    )}
                    {b.oem_authorized && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                        OEM AUTH
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span>PAN:</span>
                      <strong className="font-mono text-slate-700 dark:text-slate-300">{b.pan}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>GSTIN:</span>
                      <strong className="font-mono text-slate-700 dark:text-slate-300">{b.gstin}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Local Content:</span>
                      <strong className="text-slate-700 dark:text-slate-300">{b.declared_local_content}%</strong>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded border border-slate-100 dark:border-slate-800 line-clamp-2">
                      {b.notes}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Score
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                      {b.compliance_score || 0}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/bidders/${encodeURIComponent(b.bidder_id)}`}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md transition-colors"
                    >
                      Dossier
                    </Link>
                    <Link
                      href={`/verification?bidder=${encodeURIComponent(b.bidder_id)}`}
                      className="px-3 py-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-xs"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

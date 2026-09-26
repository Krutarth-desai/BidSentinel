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
  FileText,
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
                    GEM PROCUREMENT REGISTRY
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Bidder Profiles &amp; Compliance Roster
                </h1>
                <p className="text-xs lg:text-sm text-slate-400 font-normal leading-relaxed">
                  Multi-source cross-checked statutory identities, tax records, and document dossiers.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={loadBidders}
                  className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 text-slate-400 hover:text-white transition-all cursor-pointer"
                  title="Refresh Bidders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-400" : ""}`} />
                </button>

                <Link
                  href="/verification"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Open Verification Console</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, PAN, or GSTIN..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-white/[0.10] bg-white/[0.06] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.09] focus:ring-1 focus:ring-blue-500/30 transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[11px] uppercase tracking-wider">Risk Level:</span>
              </div>
              <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.02] p-1 gap-1 text-xs">
                {["ALL", "LOW", "MEDIUM", "HIGH"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      riskFilter === lvl
                        ? lvl === "HIGH"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                          : lvl === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                          : lvl === "LOW"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bidder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBidders.map((b) => (
              <div
                key={b.bidder_id}
                className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-blue-500/35 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(50,110,255,0.12)] flex flex-col justify-between group overflow-hidden"
              >
                {/* Subtle top accent based on risk level */}
                <div
                  className={`absolute top-0 left-6 right-6 h-[2px] rounded-b ${
                    b.risk_level === "HIGH"
                      ? "bg-red-500/60"
                      : b.risk_level === "MEDIUM"
                      ? "bg-amber-500/60"
                      : "bg-emerald-500/60"
                  }`}
                />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[10px] font-bold text-blue-400 block tracking-wider">
                        {b.bidder_id}
                      </span>
                      <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-300 transition-colors">
                        {b.company_name}
                      </h3>
                    </div>
                    <StatusBadge status={b.risk_level || "LOW"} size="sm" />
                  </div>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {b.claimed_msme_benefit && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/25 text-[10px] font-bold uppercase tracking-wider">
                        MSME ({b.msme_category || "SMALL"})
                      </span>
                    )}
                    {b.claimed_startup_benefit && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">
                        DPIIT STARTUP
                      </span>
                    )}
                    {b.oem_authorized && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 text-[10px] font-bold uppercase tracking-wider">
                        OEM AUTH
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-white/[0.04]">
                    <div className="flex justify-between">
                      <span className="text-[11px] text-slate-500">PAN:</span>
                      <strong className="font-mono text-slate-200">{b.pan}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-slate-500">GSTIN:</span>
                      <strong className="font-mono text-slate-200">{b.gstin}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[11px] text-slate-500">Local Content:</span>
                      <strong className="text-white font-semibold">{b.declared_local_content}%</strong>
                    </div>
                  </div>

                  {b.notes && (
                    <p className="text-[11px] text-slate-400 mt-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.04] line-clamp-2 leading-relaxed">
                      {b.notes}
                    </p>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                      Compliance Score
                    </span>
                    <span className="text-xl font-extrabold text-white">
                      {b.compliance_score || 0}
                      <span className="text-xs text-slate-500 font-normal"> / 100</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      href={`/bidders/${encodeURIComponent(b.bidder_id)}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] rounded-xl transition-all"
                    >
                      Dossier
                    </Link>
                    <Link
                      href={`/verification?bidder=${encodeURIComponent(b.bidder_id)}`}
                      className="px-3.5 py-1.5 text-xs font-bold bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 rounded-xl transition-all shadow-[0_0_12px_rgba(59,130,246,0.15)] flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <ArrowRight className="w-3 h-3" />
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

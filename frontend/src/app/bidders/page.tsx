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
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              TOP BENTO ROW: Registry Header (8-Col) + Roster KPI Card (4-Col)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Header Card (Span 8) */}
            <div className="lg:col-span-8 bento-card bento-glow-bronze p-8 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-extrabold text-[#725C3A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/12 border border-[#A4864E]/25">
                    GEM PROCUREMENT REGISTRY
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24221E] tracking-tight">
                  Bidder Profiles &amp; Compliance Roster
                </h1>
                <p className="text-xs lg:text-sm text-[#625F57] font-normal leading-relaxed">
                  Multi-source cross-checked statutory identities, tax records, and document dossiers.
                </p>
              </div>

              <div className="relative z-10 flex items-center gap-3 shrink-0 pt-6 mt-4 border-t border-black/[0.08]">
                <button
                  onClick={loadBidders}
                  className="p-2.5 rounded-[10px] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.10] hover:border-[#A4864E]/40 hover:-translate-y-0.5 text-[#625F57] hover:text-[#24221E] transition-all cursor-pointer shadow-xs"
                  title="Refresh Bidders"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#A4864E]" : ""}`} />
                </button>

                <Link
                  href="/verification"
                  className="px-5 py-2.5 text-xs font-extrabold text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] rounded-[10px] transition-all duration-200 shadow-[0_2px_12px_rgba(164,134,78,0.25)] border border-[#C2A96D]/40 hover:-translate-y-0.5 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F1EEE6]" />
                  <span>Open Verification Console</span>
                </Link>
              </div>
            </div>

            {/* Statutory Roster KPI Card (Span 4) */}
            <div className="lg:col-span-4 bento-card bento-glow-bronze p-7 flex flex-col justify-between group relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                  Statutory Roster Summary
                </span>
                <div className="w-10 h-10 rounded-[10px] bg-[#725C3A]/15 border border-[#725C3A]/30 text-[#725C3A] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="my-4 space-y-1">
                <div className="text-4xl font-black text-[#24221E] tracking-tight">
                  {bidders.length} <span className="text-sm text-[#625F57] font-normal">Registered Bidders</span>
                </div>
                <p className="text-xs text-[#625F57] font-normal">
                  Statutory identities verified against GSTN, CBDT, &amp; MCA
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-black/[0.08] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#625F57]">High Risk Flagged:</span>
                  <span className="font-bold text-red-700">
                    {bidders.filter((b) => b.risk_level === "HIGH").length} Entities
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#625F57]">MSME Benefit Claimants:</span>
                  <span className="font-bold text-[#725C3A]">
                    {bidders.filter((b) => b.claimed_msme_benefit).length} Entities
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bento-card p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#817C72] pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, PAN, or GSTIN..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[10px] border border-black/[0.10] bg-[#C2BDB3]/60 text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60 focus:bg-[#D8D4CB] transition-all"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#625F57]">
                <Filter className="w-3.5 h-3.5 text-[#625F57]" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest">Risk Level:</span>
              </div>
              <div className="flex rounded-[10px] border border-black/[0.10] bg-[#C2BDB3]/60 p-1 gap-1 text-xs">
                {["ALL", "LOW", "MEDIUM", "HIGH"].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setRiskFilter(lvl)}
                    className={`px-3.5 py-1.5 rounded-[8px] font-bold text-[11px] transition-all cursor-pointer ${
                      riskFilter === lvl
                        ? lvl === "HIGH"
                          ? "bg-red-500/20 text-red-800 border border-red-500/35"
                          : lvl === "MEDIUM"
                          ? "bg-amber-500/20 text-amber-800 border border-amber-500/35"
                          : lvl === "LOW"
                          ? "bg-emerald-500/20 text-emerald-800 border border-emerald-500/35"
                          : "bg-gradient-to-r from-[#A4864E] to-[#725C3A] text-[#F1EEE6]"
                        : "text-[#625F57] hover:text-[#24221E] hover:bg-black/[0.04]"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dense Asymmetrical Self-Packing Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 [grid-auto-flow:dense] gap-6 items-stretch">
            {filteredBidders.map((b) => {
              const isHighRisk = b.risk_level === "HIGH";
              const gridSpanClass = isHighRisk
                ? "col-span-1 sm:col-span-2 md:col-span-2 lg:col-span-2"
                : "col-span-1 sm:col-span-1 md:col-span-1 lg:col-span-1";

              return (
                <div
                  key={b.bidder_id}
                  className={`${gridSpanClass} bento-card p-6 flex flex-col justify-between group overflow-hidden ${
                    b.risk_level === "HIGH"
                      ? "bento-glow-red border-red-500/30"
                      : b.risk_level === "MEDIUM"
                      ? "bento-glow-amber border-amber-500/25"
                      : "bento-glow-emerald"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-[#725C3A] block tracking-wider">
                          {b.bidder_id}
                        </span>
                        <h3 className="font-bold text-sm text-[#24221E] line-clamp-1">
                          {b.company_name}
                        </h3>
                      </div>
                      <StatusBadge status={b.risk_level || "LOW"} size="sm" />
                    </div>

                    <div className="flex flex-wrap gap-1.5 my-3">
                      {b.claimed_msme_benefit && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#A4864E]/12 text-[#725C3A] border border-[#A4864E]/25 text-[10px] font-bold uppercase tracking-wider">
                          MSME ({b.msme_category || "SMALL"})
                        </span>
                      )}
                      {b.claimed_startup_benefit && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/25 text-[10px] font-bold uppercase tracking-wider">
                          DPIIT STARTUP
                        </span>
                      )}
                      {b.oem_authorized && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#A4864E]/12 text-[#725C3A] border border-[#A4864E]/25 text-[10px] font-bold uppercase tracking-wider">
                          OEM AUTH
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-[#625F57] pt-3 border-t border-black/[0.06]">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-[#817C72]">PAN:</span>
                        <strong className="font-mono text-[#24221E]">{b.pan}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-[#817C72]">GSTIN:</span>
                        <strong className="font-mono text-[#24221E]">{b.gstin}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-[#817C72]">Local Content:</span>
                        <strong className="text-[#24221E] font-semibold">{b.declared_local_content}%</strong>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-[11px] text-[#625F57] mt-3 bg-[#E3DFD6] p-3 rounded-[10px] border border-black/[0.06] line-clamp-2 leading-relaxed">
                        {b.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-black/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#817C72]">Statutory Profile</span>
                    <Link
                      href={`/bidders/${encodeURIComponent(b.bidder_id)}`}
                      className="inline-flex items-center gap-1 font-bold text-[#A4864E] hover:text-[#725C3A] transition-colors group/link"
                    >
                      <span>Full Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

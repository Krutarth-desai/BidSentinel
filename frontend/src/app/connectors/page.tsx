"use client";

import React, { useEffect, useState } from "react";
import {
  Network,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  ArrowRight,
  Sparkles,
  Terminal,
  Activity,
  Shield,
  Layers,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { PrototypeBadge } from "@/components/PrototypeBadge";
import { api } from "@/lib/api";
import { GovernmentConnector } from "@/lib/types";

const CONNECTOR_METADATA: Record<string, { latency: string; protocol: string; testId: string; description: string }> = {
  gst: {
    latency: "34ms",
    protocol: "REST / mTLS",
    testId: "27DEMOA1234F1Z5",
    description: "Validates active GST registration, monthly GSTR-3B filings, and tax compliance track record.",
  },
  udyam: {
    latency: "42ms",
    protocol: "REST / OAuth 2.0",
    testId: "UDYAM-MH-12-0001001",
    description: "Verifies MSME enterprise classification (Micro/Small/Medium) for statutory public procurement preferences.",
  },
  mca: {
    latency: "51ms",
    protocol: "SOAP / XML",
    testId: "U12345MH2020PTC100001",
    description: "Cross-checks Corporate Identification Number (CIN), active directors, and MCA disqualification records.",
  },
  epfo: {
    latency: "39ms",
    protocol: "REST / JSON",
    testId: "MHPUN0012345000",
    description: "Confirms provident fund establishment registration and active Electronic Challan Returns (ECR).",
  },
  esic: {
    latency: "44ms",
    protocol: "REST / JSON",
    testId: "31000123450001001",
    description: "Authenticates employee state insurance registration code and statutory wage contribution status.",
  },
  dpiit: {
    latency: "28ms",
    protocol: "REST / OpenAPI",
    testId: "DPIIT-ST-2024-9876",
    description: "Checks Startup India recognized entity credentials for turnover and experience requirement exemptions.",
  },
  nsic: {
    latency: "48ms",
    protocol: "REST / JSON",
    testId: "ABC Technologies Pvt. Ltd.",
    description: "Validates Single Point Registration Scheme (SPRS) certification for Earnest Money Deposit (EMD) waivers.",
  },
  digilocker: {
    latency: "31ms",
    protocol: "DigiLocker API v3",
    testId: "DOC-BID001-GST",
    description: "Cryptographically validates government digital certificates directly against the issuer repository.",
  },
  bis: {
    latency: "45ms",
    protocol: "REST / JSON",
    testId: "Kavach Safety & Shielding Solutions Pvt. Ltd.",
    description: "Queries Bureau of Indian Standards product certification and ISI mark conformity validity.",
  },
  blacklist: {
    latency: "22ms",
    protocol: "REST / Fast-InMem",
    testId: "DEMOB7890C",
    description: "Scans consolidated Central Vigilance Commission (CVC) and GeM debarment and blacklisting records.",
  },
};

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<GovernmentConnector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState("gst");
  const [queryInput, setQueryInput] = useState("27DEMOA1234F1Z5");
  const [queryResponse, setQueryResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getConnectors();
        setConnectors(res.connectors);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleTestQuery = async (e?: React.FormEvent, customId?: string, customInput?: string) => {
    if (e) e.preventDefault();
    const connId = customId || selectedConnector;
    const inputVal = customInput || queryInput;

    setIsLoading(true);
    try {
      const res = await api.queryConnector(connId, inputVal);
      setQueryResponse(res);
    } catch (err: any) {
      setQueryResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConnector = (id: string) => {
    setSelectedConnector(id);
    const suggested = CONNECTOR_METADATA[id]?.testId || "ABC Technologies Pvt. Ltd.";
    setQueryInput(suggested);
  };

  const handleQuickPreset = (id: string, presetQuery: string) => {
    setSelectedConnector(id);
    setQueryInput(presetQuery);
    handleTestQuery(undefined, id, presetQuery);
  };

  const handlePingAll = () => {
    setIsPinging(true);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 1000);
  };

  const handleCopyResponse = () => {
    if (!queryResponse) return;
    navigator.clipboard.writeText(JSON.stringify(queryResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              Hero Section: Government Connectors Bus
             ======================================================== */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 lg:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                    EXTENSIBLE STATUTORY INTEGRATION BUS
                  </span>
                  <PrototypeBadge />
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Government Authority Connectors
                </h1>
                <p className="text-sm text-slate-400 font-normal leading-relaxed pt-1">
                  Standardized high-speed connector adapters interfacing directly with statutory registries including GSTN, MCA-21, CBDT, EPFO, ESIC, DPIIT, and CVC Watchlists.
                </p>
              </div>

              {/* Actions on the right */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePingAll}
                  disabled={isPinging}
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${isPinging ? "animate-spin text-amber-300" : "text-blue-200"}`} />
                  <span>{isPinging ? "Pinging Gateways..." : pingSuccess ? "10/10 Online ✓" : "Ping All Gateways"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================
              Connector Bus Health KPI Cards (4 Individual Glass Cards)
             ======================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Active Gateways (Blue) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-blue-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(50,110,255,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-blue-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition-colors">
                  Connected Gateways
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                10 <span className="text-xl text-slate-500 font-normal">/ 10</span>
              </div>
              <p className="text-xs text-slate-400 font-normal">All official endpoints online</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,32 Q40,24 80,26 T140,16 T180,18 T200,8 L200,48 L0,48 Z" fill="url(#conn-grad-blue)" />
                  <path d="M0,32 Q40,24 80,26 T140,16 T180,18 T200,8" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Concordance Match Rate (Emerald) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-emerald-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(16,185,129,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-emerald-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition-colors">
                  Concordance Rate
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-emerald-400 tracking-tight mb-1">
                98.4%
              </div>
              <p className="text-xs text-slate-400 font-normal">Cross-registry entity match accuracy</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,38 Q35,26 70,22 T140,16 T180,12 T200,4 L200,48 L0,48 Z" fill="url(#conn-grad-emerald)" />
                  <path d="M0,38 Q35,26 70,22 T140,16 T180,12 T200,4" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Average Query Latency (Violet) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-purple-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(168,85,247,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-purple-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-purple-300 transition-colors">
                  Average Latency
                </span>
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-1">
                38ms
              </div>
              <p className="text-xs text-slate-400 font-normal">Real-time mock adapter bus</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,28 Q35,32 75,20 T145,26 T180,14 T200,8 L200,48 L0,48 Z" fill="url(#conn-grad-purple)" />
                  <path d="M0,28 Q35,32 75,20 T145,26 T180,14 T200,8" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 4: Statutory Watchlists (Amber) */}
            <div className="relative rounded-[20px] bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border border-white/[0.10] hover:border-amber-500/40 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(245,158,11,0.14)] transition-all duration-200 hover:-translate-y-0.5 overflow-hidden group">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-amber-500/50 rounded-b" />
              <div className="flex items-center justify-between text-slate-400 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 transition-colors">
                  Debarment Watchlists
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-amber-400 tracking-tight mb-1">
                3
              </div>
              <p className="text-xs text-slate-400 font-normal">CVC, GeM &amp; CBDT defaulter lists</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-amber" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,26 Q40,36 80,24 T140,28 T180,18 T200,22 L200,48 L0,48 Z" fill="url(#conn-grad-amber)" />
                  <path d="M0,26 Q40,36 80,24 T140,28 T180,18 T200,22" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================
              Quick Presets Scenarios Bar
             ======================================================== */}
          <div className="rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.10] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
              1-Click Connector Validation Presets:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleQuickPreset("gst", "27DEMOA1234F1Z5")}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-blue-600/15 border border-white/[0.08] hover:border-blue-500/40 text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                GSTN: 27DEMOA1234F1Z5 (Compliant)
              </button>
              <button
                onClick={() => handleQuickPreset("udyam", "UDYAM-MH-12-0001001")}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-blue-600/15 border border-white/[0.08] hover:border-blue-500/40 text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                Udyam: UDYAM-MH-12-0001001 (Small Enterprise)
              </button>
              <button
                onClick={() => handleQuickPreset("mca", "U12345MH2020PTC100001")}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-blue-600/15 border border-white/[0.08] hover:border-blue-500/40 text-slate-300 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                MCA21: U12345MH2020PTC100001 (Active Private Ltd)
              </button>
              <button
                onClick={() => handleQuickPreset("blacklist", "DEMOB7890C")}
                className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-300 hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                Watchlist: DEMOB7890C (CVC Debarred)
              </button>
            </div>
          </div>

          {/* ========================================================
              Connectors Grid (10 Government Registries)
             ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectors.map((c) => {
              const isSelected = selectedConnector === c.id;
              const meta = CONNECTOR_METADATA[c.id] || {
                latency: "35ms",
                protocol: "REST / JSON",
                description: "Standard statutory registry verification adapter.",
              };

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConnector(c.id)}
                  className={`relative p-6 rounded-[22px] border cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group overflow-hidden ${
                    isSelected
                      ? "bg-blue-600/15 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.25)]"
                      : "bg-white/[0.06] hover:bg-white/[0.09] backdrop-blur-xl border-white/[0.10] hover:border-blue-500/40 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.35),0_0_18px_rgba(50,110,255,0.12)]"
                  }`}
                >
                  {/* Subtle top indicator bar */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] rounded-b transition-colors ${
                      isSelected ? "bg-blue-400" : "bg-transparent group-hover:bg-white/20"
                    }`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-blue-400">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {meta.protocol}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{meta.latency}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-white mt-1 leading-snug group-hover:text-blue-300 transition-colors">
                      {c.title}
                    </h3>

                    <p className="text-xs text-slate-400 font-normal mt-2 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      ID: {c.id}
                    </span>
                    <span
                      className={`font-bold text-xs flex items-center gap-1.5 transition-colors ${
                        isSelected ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      <span>{isSelected ? "Active Lookup" : "Select & Test"}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ========================================================
              Interactive Diagnostic Query Console Box
             ======================================================== */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-blue-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Live Connector Diagnostic Query Console
                  </h2>
                  <p className="text-xs text-slate-400 font-normal mt-0.5">
                    Execute real-time synthetic queries against standardized adapter schemas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Active Adapter:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/25 font-mono text-xs font-bold">
                  {selectedConnector.toUpperCase()}
                </span>
              </div>
            </div>

            <form onSubmit={handleTestQuery} className="flex flex-col sm:flex-row gap-3 text-xs">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-xs">
                  ID:
                </div>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter query identifier (GSTIN, Udyam No, PAN, CIN, etc.)..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/[0.08] bg-black text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-blue-500/50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)] disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? "Querying Adapter..." : "Execute Lookup"}</span>
              </button>
            </form>

            {/* Response Viewer */}
            {queryResponse && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Standardized Registry JSON Payload</span>
                  </div>
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>

                <pre className="p-6 rounded-2xl bg-black text-emerald-400 font-mono text-xs overflow-x-auto border border-white/[0.08] shadow-inner leading-relaxed">
                  {JSON.stringify(queryResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

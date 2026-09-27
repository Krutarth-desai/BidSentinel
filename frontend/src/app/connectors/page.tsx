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
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] relative overflow-x-clip font-sans selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto relative z-10">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* ========================================================
              Hero & Active Bus Status Split (8:4 Bento Split)
             ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8-Col: Hero Overview */}
            <div className="lg:col-span-8 bento-card relative overflow-hidden p-8 lg:p-10 shadow-sm flex flex-col justify-between bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#A4864E]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#24221E]/10 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-3.5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-[#A4864E] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/15 border border-[#A4864E]/30">
                    EXTENSIBLE STATUTORY INTEGRATION BUS
                  </span>
                  <PrototypeBadge />
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight leading-tight">
                  Government Authority Connectors
                </h1>
                <p className="text-sm text-[#625F57] font-normal leading-relaxed max-w-2xl">
                  Standardized high-speed connector adapters interfacing directly with statutory registries including GSTN, MCA-21, CBDT, EPFO, ESIC, DPIIT, and CVC Watchlists.
                </p>
              </div>

              {/* Action Toolbar inside Hero */}
              <div className="relative z-10 flex items-center gap-3 mt-8 pt-6 border-t border-[#24221E]/10">
                <button
                  onClick={handlePingAll}
                  disabled={isPinging}
                  className="px-5 py-3 rounded-[10px] text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#8A703E] hover:to-[#5E4C2F] font-black text-xs tracking-wider uppercase shadow-sm hover:-translate-y-0.5 flex items-center gap-2.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Activity className={`w-4 h-4 ${isPinging ? "animate-spin text-[#A4864E]" : "text-[#F5F2EB]"}`} />
                  <span>{isPinging ? "Pinging Gateways..." : pingSuccess ? "10/10 Online ✓" : "Ping All Gateways"}</span>
                </button>
              </div>
            </div>

            {/* Right 4-Col: Bus Telemetry Card */}
            <div className="lg:col-span-4 bento-card p-7 flex flex-col justify-between space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#A4864E]/15 border border-[#A4864E]/30 rounded-[10px] text-[#A4864E]">
                      <Network className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-[#24221E] uppercase tracking-wider">
                      Gateway Bus Health
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-[#188A5E] shadow-sm animate-pulse" />
                </div>

                <div className="space-y-2 p-3.5 bg-[#C9C5BC]/60 rounded-[12px] border border-[#24221E]/10">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#625F57]">Endpoint Status:</span>
                    <span className="text-[#188A5E] font-bold">10/10 Online</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#625F57]">Bus Encryption:</span>
                    <span className="text-[#A4864E] font-mono font-semibold">mTLS / TLS 1.3</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#24221E]/10 flex items-center justify-between text-xs text-[#625F57]">
                <span>Avg Processing Latency</span>
                <span className="font-mono text-[#24221E] font-bold text-sm">38ms</span>
              </div>
            </div>
          </div>

          {/* ========================================================
              Connector Bus Health KPI Cards (5:4:3 Asymmetrical Bento Cluster)
              ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Connected Gateways (5 Spans - Primary Weight) */}
            <div className="md:col-span-12 lg:col-span-5 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#A4864E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#24221E] transition-colors">
                  Connected Gateways
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center shadow-sm">
                  <Network className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#24221E] tracking-tight mb-1">
                10 <span className="text-xl text-[#817C72] font-normal">/ 10</span>
              </div>
              <p className="text-xs text-[#625F57] font-normal">All official endpoints online</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A4864E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A4864E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,32 Q40,24 80,26 T140,16 T180,18 T200,8 L200,48 L0,48 Z" fill="url(#conn-grad-blue)" />
                  <path d="M0,32 Q40,24 80,26 T140,16 T180,18 T200,8" fill="none" stroke="#A4864E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Concordance Match Rate (4 Spans - Medium Weight) */}
            <div className="md:col-span-6 lg:col-span-4 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#188A5E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#188A5E] transition-colors">
                  Concordance Rate
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#188A5E]/15 border border-[#188A5E]/30 text-[#188A5E] flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-extrabold text-[#188A5E] tracking-tight mb-1">
                98.4%
              </div>
              <p className="text-xs text-[#625F57] font-normal">Cross-registry entity match accuracy</p>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-4 pt-2 -mx-6 -mb-6 h-12 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#188A5E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#188A5E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,38 Q35,26 70,22 T140,16 T180,12 T200,4 L200,48 L0,48 Z" fill="url(#conn-grad-emerald)" />
                  <path d="M0,38 Q35,26 70,22 T140,16 T180,12 T200,4" fill="none" stroke="#188A5E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 3: Bus Latency & Debarment Watchlists (3 Spans - Dual Micro Metric) */}
            <div className="md:col-span-6 lg:col-span-3 bento-card p-6 hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden relative flex flex-col justify-between bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-[#A4864E]/50 rounded-b" />
              <div className="flex items-center justify-between text-[#625F57] mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#625F57] group-hover:text-[#A4864E] transition-colors">
                  Telemetry &amp; Watchlists
                </span>
                <div className="w-9 h-9 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center shadow-sm">
                  <Zap className="w-4 h-4" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 my-1">
                <div>
                  <div className="text-2xl font-extrabold text-[#24221E] tracking-tight">38ms</div>
                  <p className="text-[10px] text-[#625F57] font-normal">Avg Latency</p>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-[#D97706] tracking-tight">3</div>
                  <p className="text-[10px] text-[#625F57] font-normal">Debarment Lists</p>
                </div>
              </div>

              {/* Glowing Line Chart at bottom */}
              <div className="mt-3 pt-2 -mx-6 -mb-6 h-10 relative overflow-hidden pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity">
                <svg className="w-full h-full" viewBox="0 0 200 48" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="conn-grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A4864E" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#A4864E" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,28 Q35,32 75,20 T145,26 T180,14 T200,8 L200,48 L0,48 Z" fill="url(#conn-grad-purple)" />
                  <path d="M0,28 Q35,32 75,20 T145,26 T180,14 T200,8" fill="none" stroke="#A4864E" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* ========================================================
              Quick Presets Scenarios Bar
              ======================================================== */}
          <div className="bento-card p-5 bg-[#D8D4CB] border border-[#24221E]/10">
            <span className="text-[10px] font-bold text-[#625F57] uppercase tracking-widest block mb-2.5">
              1-Click Connector Validation Presets:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleQuickPreset("gst", "27DEMOA1234F1Z5")}
                className="px-3.5 py-1.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                GSTN: 27DEMOA1234F1Z5 (Compliant)
              </button>
              <button
                onClick={() => handleQuickPreset("udyam", "UDYAM-MH-12-0001001")}
                className="px-3.5 py-1.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                Udyam: UDYAM-MH-12-0001001 (Small Enterprise)
              </button>
              <button
                onClick={() => handleQuickPreset("mca", "U12345MH2020PTC100001")}
                className="px-3.5 py-1.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                MCA21: U12345MH2020PTC100001 (Active Private Ltd)
              </button>
              <button
                onClick={() => handleQuickPreset("blacklist", "DEMOB7890C")}
                className="px-3.5 py-1.5 rounded-[10px] bg-[#D95757]/15 hover:bg-[#D95757]/25 border border-[#D95757]/30 text-[#D95757] hover:-translate-y-0.5 transition-all cursor-pointer font-medium"
              >
                Watchlist: DEMOB7890C (CVC Debarred)
              </button>
            </div>
          </div>

          {/* ========================================================
              Connectors Grid (Asymmetrical Featured vs Standard Tiles)
              ======================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectors.map((c) => {
              const isSelected = selectedConnector === c.id;
              const isPrimary = c.id === "gst" || c.id === "mca" || c.id === "udyam";
              const meta = CONNECTOR_METADATA[c.id] || {
                latency: "35ms",
                protocol: "REST / JSON",
                description: "Standard statutory registry verification adapter.",
              };

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConnector(c.id)}
                  className={`bento-card ${isPrimary ? "md:col-span-2 lg:col-span-2" : "md:col-span-1 lg:col-span-1"} ${
                    isSelected ? "border-[#A4864E] shadow-md bg-[#D8D4CB]" : "bg-[#D8D4CB] border-[#24221E]/10"
                  } p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between group overflow-hidden relative border`}
                >
                  {/* Top glowing bar */}
                  <div
                    className={`absolute top-0 left-6 right-6 h-[2px] rounded-b transition-colors ${
                      isSelected ? "bg-[#A4864E]" : "bg-transparent group-hover:bg-[#24221E]/20"
                    }`}
                  />

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {isPrimary && (
                          <span className="px-2 py-0.5 rounded-[8px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[10px] font-bold text-[#A4864E] uppercase tracking-wider">
                            Primary Registry
                          </span>
                        )}
                        <span className="font-mono text-xs font-extrabold text-[#A4864E]">
                          {c.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#625F57]">
                          {meta.protocol}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#188A5E]/15 text-[#188A5E] border border-[#188A5E]/30 text-[10px] font-bold uppercase shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#188A5E] animate-pulse" />
                        <span>{meta.latency}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-[#24221E] mt-1 leading-snug group-hover:text-[#A4864E] transition-colors">
                      {c.title}
                    </h3>

                    <p className="text-xs text-[#625F57] font-normal mt-2 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#24221E]/10 flex items-center justify-between text-xs">
                    <span className="text-[10px] font-mono text-[#625F57] uppercase">
                      ID: {c.id}
                    </span>
                    <span
                      className={`font-bold text-xs flex items-center gap-1.5 transition-colors ${
                        isSelected ? "text-[#A4864E]" : "text-[#625F57] group-hover:text-[#24221E]"
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
          <div className="bento-card p-8 space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#24221E]/10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#A4864E]/15 border border-[#A4864E]/30 rounded-[10px] text-[#A4864E] shadow-sm">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                    Live Connector Diagnostic Query Console
                  </h2>
                  <p className="text-xs text-[#625F57] font-normal mt-0.5">
                    Execute real-time synthetic queries against standardized adapter schemas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#625F57] uppercase tracking-wider font-semibold">
                  Active Adapter:
                </span>
                <span className="px-3 py-1 rounded-[8px] bg-[#A4864E]/15 text-[#A4864E] border border-[#A4864E]/30 font-mono text-xs font-bold shadow-sm">
                  {selectedConnector.toUpperCase()}
                </span>
              </div>
            </div>

            <form onSubmit={handleTestQuery} className="flex flex-col sm:flex-row gap-3 text-xs">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#817C72] font-mono text-xs">
                  ID:
                </div>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Enter query identifier (GSTIN, Udyam No, PAN, CIN, etc.)..."
                  className="w-full pl-10 pr-4 py-3 rounded-[10px] border border-[#24221E]/10 bg-[#C9C5BC]/60 text-[#24221E] placeholder-[#817C72] font-mono text-xs focus:outline-none focus:border-[#A4864E] transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 font-black text-[#F1EEE6] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#8A703E] hover:to-[#5E4C2F] rounded-[10px] flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-50 cursor-pointer shrink-0 hover:-translate-y-0.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? "Querying Adapter..." : "Execute Lookup"}</span>
              </button>
            </form>

            {/* Response Viewer */}
            {queryResponse && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#625F57] uppercase tracking-wider">
                    <Terminal className="w-3.5 h-3.5 text-[#188A5E]" />
                    <span>Standardized Registry JSON Payload</span>
                  </div>
                  <button
                    onClick={handleCopyResponse}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 text-xs text-[#625F57] hover:text-[#24221E] transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#188A5E]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy JSON"}</span>
                  </button>
                </div>

                <pre className="p-6 rounded-[14px] bg-[#24221E] text-[#F5F2EB] font-mono text-xs overflow-x-auto shadow-inner leading-relaxed">
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

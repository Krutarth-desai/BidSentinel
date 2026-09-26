"use client";

import React, { useEffect, useState } from "react";
import { Network, Database, Search, CheckCircle2, AlertCircle, RefreshCw, Send, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { PrototypeBadge } from "@/components/PrototypeBadge";
import { api } from "@/lib/api";
import { GovernmentConnector } from "@/lib/types";

export default function ConnectorsPage() {
  const [connectors, setConnectors] = useState<GovernmentConnector[]>([]);
  const [selectedConnector, setSelectedConnector] = useState("gst");
  const [queryInput, setQueryInput] = useState("27DEMOA1234F1Z5");
  const [queryResponse, setQueryResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleTestQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.queryConnector(selectedConnector, queryInput);
      setQueryResponse(res);
    } catch (err: any) {
      setQueryResponse({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConnector = (id: string) => {
    setSelectedConnector(id);
    // Suggest good test input
    if (id === "gst") setQueryInput("27DEMOA1234F1Z5");
    else if (id === "udyam") setQueryInput("UDYAM-MH-12-0001001");
    else if (id === "mca") setQueryInput("U12345MH2020PTC100001");
    else if (id === "epfo") setQueryInput("MHPUN0012345000");
    else if (id === "esic") setQueryInput("31000123450001001");
    else if (id === "dpiit") setQueryInput("DPIIT-ST-2024-9876");
    else if (id === "nsic") setQueryInput("ABC Technologies Pvt. Ltd.");
    else if (id === "bis") setQueryInput("Kavach Safety & Shielding Solutions Pvt. Ltd.");
    else if (id === "blacklist") setQueryInput("DEMOB7890C");
    else setQueryInput("ABC Technologies Pvt. Ltd.");
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
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Extensible Adapter Bus
                </span>
                <PrototypeBadge />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                Government Authority Connectors
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Uniform connector adapters for statutory validation. Prototype runs on high-fidelity synthetic registries.
              </p>
            </div>
          </div>

          {/* Connectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectors.map((c) => {
              const isSelected = selectedConnector === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConnector(c.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/60 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 ring-2 ring-blue-500/20 shadow-xs"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {c.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {c.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {c.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>Adapter: {c.type}</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <span>Test Query</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Live Query Tester Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Live Connector Diagnostic Query Tester
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Active Adapter: <strong className="text-blue-600">{selectedConnector.toUpperCase()}</strong>
              </span>
            </div>

            <form onSubmit={handleTestQuery} className="flex gap-2 text-xs">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Enter query identifier (GSTIN, Udyam No, PAN, CIN, etc.)..."
                className="flex-1 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isLoading ? "Querying..." : "Execute Lookup"}</span>
              </button>
            </form>

            {/* Response Viewer */}
            {queryResponse && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Connector Standardized Response
                </span>
                <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
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

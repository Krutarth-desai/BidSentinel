"use client";

import React from "react";
import { X, ShieldCheck, AlertCircle, FileText, Database, Scale, Cpu } from "lucide-react";
import { RequirementResult } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RequirementResult | null;
  bidderName?: string;
}

export function EvidenceModal({ isOpen, onClose, result, bidderName }: EvidenceModalProps) {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-black/95 rounded-[22px] shadow-[0_12px_60px_rgba(0,0,0,0.9)] border border-white/[0.12] overflow-hidden flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.10] bg-white/[0.04]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="evidence-modal-title" className="text-base font-bold text-white">
                Compliance Verification Evidence Dossier
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {bidderName ? `Bidder: ${bidderName} • ` : ""}Requirement ID: {result.req_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] hover:-translate-y-0.5 transition-all cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Status Banner */}
          <div className="flex items-center justify-between p-4 bg-white/[0.06] rounded-xl border border-white/[0.10]">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">
                Requirement Criterion
              </span>
              <span className="text-sm font-bold text-white">{result.title}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                Status
              </span>
              <StatusBadge status={result.status} size="sm" />
            </div>
          </div>

          {/* 4-Step Verification Chain */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Verification Decision Chain
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Step 1: Document Evidence */}
              <div className="p-4 rounded-xl border border-white/[0.10] bg-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>1. Submitted Document Evidence</span>
                </div>
                <div className="text-xs text-slate-300 bg-white/[0.04] p-3 rounded-lg border border-white/[0.08] leading-relaxed">
                  {result.evidence_summary || "Document records examined"}
                </div>
              </div>

              {/* Step 2: Government Source */}
              <div className="p-4 rounded-xl border border-white/[0.10] bg-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>2. Authority Source Registry</span>
                </div>
                <div className="text-xs text-slate-300 bg-white/[0.04] p-3 rounded-lg border border-white/[0.08] leading-relaxed">
                  Authority: <strong className="text-white font-mono">{result.source}</strong> (Connector Registry)
                </div>
              </div>

              {/* Step 3: Rule Executed */}
              <div className="p-4 rounded-xl border border-white/[0.10] bg-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span>3. Applied Compliance Rule</span>
                </div>
                <div className="text-xs text-slate-300 bg-white/[0.04] p-3 rounded-lg border border-white/[0.08] leading-relaxed">
                  Rule Code: <code className="text-blue-400 font-mono font-bold">{result.rule_code || "RULE_STANDARD_CHECK"}</code>
                </div>
              </div>

              {/* Step 4: Verification Result */}
              <div className="p-4 rounded-xl border border-white/[0.10] bg-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-white font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>4. Engine Assessment &amp; Confidence</span>
                </div>
                <div className="text-xs text-slate-300 bg-white/[0.04] p-3 rounded-lg border border-white/[0.08] leading-relaxed">
                  Confidence Score: <strong className="text-emerald-400 font-bold">{(result.confidence * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict / Discrepancy Detail (if any) */}
          {result.field_discrepancy && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>Detected Data Discrepancy (Requires Officer Review)</span>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-amber-500/20 text-xs font-mono space-y-1.5">
                {Object.entries(result.field_discrepancy).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-400 capitalize">{k.replace("_", " ")}:</span>
                    <span className="font-semibold text-amber-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engine Explanation */}
          <div className="p-4 bg-white/[0.06] rounded-xl border border-white/[0.10] space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              Detailed Rule Explanation
            </span>
            <p className="text-xs leading-relaxed text-slate-300 font-normal">
              {result.reason}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 bg-white/[0.04] border-t border-white/[0.10] text-xs">
          <span className="text-slate-500 text-[11px]">
            Decision support evidence only • Final judgment rests with Officer
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] rounded-xl hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

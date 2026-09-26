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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="evidence-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="evidence-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Compliance Verification Evidence Dossier
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {bidderName ? `Bidder: ${bidderName} • ` : ""}Requirement ID: {result.req_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Status Banner */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Requirement Criterion</span>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{result.title}</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
              <StatusBadge status={result.status} />
            </div>
          </div>

          {/* 4-Step Verification Chain */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Verification Decision Chain
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Step 1: Document Evidence */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>1. Submitted Document Evidence</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  {result.evidence_summary || "Document records examined"}
                </div>
              </div>

              {/* Step 2: Government Source */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <Database className="w-4 h-4 text-emerald-500" />
                  <span>2. Authority Source Registry</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  Authority: <strong className="text-slate-800 dark:text-slate-200">{result.source}</strong> (Mock Connector)
                </div>
              </div>

              {/* Step 3: Rule Executed */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <Cpu className="w-4 h-4 text-purple-500" />
                  <span>3. Applied Compliance Rule</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  Rule Code: <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">{result.rule_code || "RULE_STANDARD_CHECK"}</code>
                </div>
              </div>

              {/* Step 4: Verification Result */}
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>4. Engine Assessment & Confidence</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded border border-slate-100 dark:border-slate-800">
                  Confidence Score: <strong className="text-slate-800 dark:text-slate-200">{(result.confidence * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict / Discrepancy Detail (if any) */}
          {result.field_discrepancy && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-amber-900 dark:text-amber-300 font-semibold text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Detected Data Discrepancy (Requires Officer Review)</span>
              </div>
              <div className="bg-white dark:bg-slate-900 p-3 rounded border border-amber-200 dark:border-amber-900/50 text-xs font-mono space-y-1">
                {Object.entries(result.field_discrepancy).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-slate-500 capitalize">{k.replace("_", " ")}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Engine Explanation */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Detailed Rule Explanation
            </span>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {result.reason}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-400">
            Decision support evidence only • Final judgment rests with Officer
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

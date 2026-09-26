"use client";

import React, { useState } from "react";
import { X, CheckCircle2, XCircle, HelpCircle, ShieldAlert } from "lucide-react";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (decision: string, comments: string) => Promise<void>;
  bidderName: string;
  tenderId: string;
  complianceScore: number;
  riskLevel: string;
}

export function DecisionModal({
  isOpen,
  onClose,
  onSubmit,
  bidderName,
  tenderId,
  complianceScore,
  riskLevel,
}: DecisionModalProps) {
  const [selectedDecision, setSelectedDecision] = useState<string>("APPROVED");
  const [comments, setComments] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comments || comments.trim().length < 5) {
      setError("Please provide descriptive comments for official audit compliance.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(selectedDecision, comments.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to record decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-600" />
            <h2 id="decision-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Procurement Officer Determination
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Bidder:</span>
              <strong className="text-slate-800 dark:text-slate-200">{bidderName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Tender:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">{tenderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AI Score / Risk:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{complianceScore}/100 • {riskLevel} RISK</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Select Official Determination
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedDecision("APPROVED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition-all ${
                  selectedDecision === "APPROVED"
                    ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-1 text-emerald-600" />
                APPROVE
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("CLARIFICATION_REQUESTED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition-all ${
                  selectedDecision === "CLARIFICATION_REQUESTED"
                    ? "bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <HelpCircle className="w-4 h-4 mb-1 text-amber-600" />
                CLARIFICATION
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("REJECTED")}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-bold transition-all ${
                  selectedDecision === "REJECTED"
                    ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20"
                    : "border-slate-200 hover:bg-slate-50 text-slate-600"
                }`}
              >
                <XCircle className="w-4 h-4 mb-1 text-rose-600" />
                REJECT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Officer Justification Comments <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="State official rationale for this decision (recorded in immutable audit trail)..."
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Official Determination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

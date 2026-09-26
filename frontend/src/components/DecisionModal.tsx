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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-black/95 rounded-[22px] shadow-[0_12px_60px_rgba(0,0,0,0.9)] border border-white/[0.12] overflow-hidden flex flex-col backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-modal-title"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.10] bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="decision-modal-title" className="text-base font-bold text-white">
                Procurement Officer Determination
              </h2>
              <p className="text-xs text-slate-400">Formal sign-off committed to immutable audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.08] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div className="p-4 bg-white/[0.06] border border-white/[0.10] rounded-xl text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Bidder:</span>
              <strong className="text-white">{bidderName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tender:</span>
              <span className="font-mono text-blue-400 font-bold">{tenderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">AI Score / Risk:</span>
              <span className="font-semibold text-white">{complianceScore}/100 • {riskLevel} RISK</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Select Official Determination
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDecision("APPROVED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "APPROVED"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-1.5 text-emerald-400" />
                APPROVE
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("CLARIFICATION_REQUESTED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "CLARIFICATION_REQUESTED"
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                <HelpCircle className="w-4 h-4 mb-1.5 text-amber-400" />
                CLARIFICATION
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("REJECTED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "REJECTED"
                    ? "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
                }`}
              >
                <XCircle className="w-4 h-4 mb-1.5 text-red-400" />
                REJECT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Officer Justification Comments <span className="text-red-400">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="State official rationale for this decision (recorded in immutable audit trail)..."
              rows={3}
              className="w-full text-xs p-3.5 rounded-xl border border-white/[0.10] bg-white/[0.06] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-medium">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.10]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] rounded-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Official Determination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

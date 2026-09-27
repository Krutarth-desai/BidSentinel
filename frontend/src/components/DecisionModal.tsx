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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-md">
      <div 
        className="w-full max-w-lg bg-[#E3DFD6] rounded-[22px] shadow-2xl border border-[#24221E]/15 overflow-hidden flex flex-col backdrop-blur-2xl text-[#24221E] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-modal-title"
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-[#24221E]/10 bg-[#D8D4CB]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#A4864E]/15 text-[#A4864E] border border-[#A4864E]/30 rounded-xl shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 id="decision-modal-title" className="text-base font-bold text-[#24221E]">
                Procurement Officer Determination
              </h2>
              <p className="text-xs text-[#625F57]">Formal sign-off committed to immutable audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#625F57] hover:text-[#24221E] rounded-xl hover:bg-[#C9C5BC] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          <div className="p-4 bg-[#D8D4CB] border border-[#24221E]/10 rounded-xl text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-[#625F57]">Bidder:</span>
              <strong className="text-[#24221E]">{bidderName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#625F57]">Tender:</span>
              <span className="font-mono text-[#A4864E] font-bold">{tenderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#625F57]">AI Score / Risk:</span>
              <span className="font-semibold text-[#24221E]">{complianceScore}/100 • {riskLevel} RISK</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#625F57] uppercase tracking-wider mb-2.5">
              Select Official Determination
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedDecision("APPROVED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "APPROVED"
                    ? "bg-[#188A5E]/15 border-[#188A5E]/40 text-[#188A5E] shadow-sm"
                    : "bg-[#D8D4CB] border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 mb-1.5 text-[#188A5E]" />
                APPROVE
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("CLARIFICATION_REQUESTED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "CLARIFICATION_REQUESTED"
                    ? "bg-[#D97706]/15 border-[#D97706]/40 text-[#D97706] shadow-sm"
                    : "bg-[#D8D4CB] border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                <HelpCircle className="w-4 h-4 mb-1.5 text-[#D97706]" />
                CLARIFICATION
              </button>

              <button
                type="button"
                onClick={() => setSelectedDecision("REJECTED")}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedDecision === "REJECTED"
                    ? "bg-[#D95757]/15 border-[#D95757]/40 text-[#D95757] shadow-sm"
                    : "bg-[#D8D4CB] border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                <XCircle className="w-4 h-4 mb-1.5 text-[#D95757]" />
                REJECT
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#625F57] uppercase tracking-wider mb-2">
              Officer Justification Comments <span className="text-[#D95757]">*</span>
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="State official rationale for this decision (recorded in immutable audit trail)..."
              rows={3}
              className="w-full text-xs p-3.5 rounded-xl border border-[#24221E]/15 bg-[#D8D4CB] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E] transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-[#D95757] font-medium">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#24221E]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#625F57] hover:text-[#24221E] bg-[#C9C5BC]/50 hover:bg-[#C9C5BC] border border-[#24221E]/10 rounded-xl hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-xl transition-all shadow-sm border border-[#24221E]/20 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Official Determination"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

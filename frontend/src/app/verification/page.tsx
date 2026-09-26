"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  FileCheck,
  Scale,
  Download,
  Printer,
  History,
  Info,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { EvidenceModal } from "@/components/EvidenceModal";
import { DecisionModal } from "@/components/DecisionModal";
import { VerificationStepper } from "@/components/VerificationStepper";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { api } from "@/lib/api";
import {
  Tender,
  Bidder,
  VerificationResult,
  RequirementResult,
  OfficerDecision,
} from "@/lib/types";

function VerificationContent() {
  const searchParams = useSearchParams();
  const initialTender = searchParams.get("tender") || "TND001";
  const initialBidder = searchParams.get("bidder") || "BID001";

  const [tenders, setTenders] = useState<Tender[]>([]);
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [selectedTenderId, setSelectedTenderId] = useState(initialTender);
  const [selectedBidderId, setSelectedBidderId] = useState(initialBidder);

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [officerDecision, setOfficerDecision] = useState<OfficerDecision | null>(null);

  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [evidenceResult, setEvidenceResult] = useState<RequirementResult | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  // Load initial dropdowns
  useEffect(() => {
    async function init() {
      try {
        const [tList, bList] = await Promise.all([api.getTenders(), api.getBidders()]);
        setTenders(tList);
        setBidders(bList);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Fetch or trigger verification for the selected pair
  const fetchResult = async (tenderId: string, bidderId: string) => {
    try {
      const res = await api.getVerificationResult(tenderId, bidderId);
      setVerificationResult(res);
      const dec = await api.getDecision(tenderId, bidderId);
      setOfficerDecision(dec.decision ? dec : null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedTenderId && selectedBidderId) {
      fetchResult(selectedTenderId, selectedBidderId);
    }
  }, [selectedTenderId, selectedBidderId]);

  // One-Click Demo run
  const handleRunVerification = () => {
    setIsVerifying(true);
  };

  const handleStepperComplete = async () => {
    try {
      const res = await api.runVerification(selectedTenderId, selectedBidderId);
      setVerificationResult(res);
      const dec = await api.getDecision(selectedTenderId, selectedBidderId);
      setOfficerDecision(dec.decision ? dec : null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDecisionSubmit = async (decision: string, comments: string) => {
    const res = await api.submitDecision(selectedTenderId, selectedBidderId, decision, comments);
    setOfficerDecision(res);
  };

  const currentBidder = bidders.find((b) => b.bidder_id === selectedBidderId);
  const currentTender = tenders.find((t) => t.tender_id === selectedTenderId);

  return (
    <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
      {/* Top Header Card */}
      <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                AI DECISION-SUPPORT SYSTEM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Integrated Bid Compliance Verification Console
            </h1>
            <p className="text-xs lg:text-sm text-slate-400 font-normal leading-relaxed">
              Select tender and bidder to execute multi-source statutory checks and AI risk evaluation.
            </p>
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(59,130,246,0.35)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center gap-2.5 transition-all duration-200 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
            <span>{isVerifying ? "Verifying..." : "RUN AI VERIFICATION"}</span>
          </button>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] text-xs">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Active GeM Tender:
            </label>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/[0.08] bg-black text-white font-medium focus:outline-none focus:border-blue-500/50"
            >
              {tenders.map((t) => (
                <option key={t.tender_id} value={t.tender_id}>
                  {t.tender_id} — {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Select Bidder to Verify:
            </label>
            <select
              value={selectedBidderId}
              onChange={(e) => setSelectedBidderId(e.target.value)}
              className="w-full p-3 rounded-xl border border-white/[0.08] bg-black text-white font-medium focus:outline-none focus:border-blue-500/50"
            >
              {bidders.map((b) => (
                <option key={b.bidder_id} value={b.bidder_id}>
                  {b.bidder_id}: {b.company_name} ({b.expected_score || 0}/100 • {b.expected_risk})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Demo Scenario Switcher Chips */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Quick SIH Evaluation Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSelectedBidderId("BID001")}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                selectedBidderId === "BID001"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)] font-semibold"
                  : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              Scenario A: TechVista Solutions (100 • Low Risk • Compliant MSME)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID004")}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                selectedBidderId === "BID004"
                  ? "bg-blue-500/15 text-blue-300 border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)] font-semibold"
                  : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              Scenario B: Pinnacle InfoTech (100 • Low Risk • DPIIT Startup)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID008")}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                selectedBidderId === "BID008"
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-semibold"
                  : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              Scenario C: Metro Construction (80 • High Risk • Tax Scrutiny Notice)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID016")}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                selectedBidderId === "BID016"
                  ? "bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)] font-semibold"
                  : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              Scenario D: Gupta Trading (48 • High Risk • Inactive PAN / Debarred)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID003")}
              className={`px-3 py-1.5 rounded-xl font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                selectedBidderId === "BID003"
                  ? "bg-red-500/15 text-red-300 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.2)] font-semibold"
                  : "bg-white/[0.06] border-white/[0.10] text-slate-400 hover:text-white hover:bg-white/[0.09]"
              }`}
            >
              Scenario E: Bharat Heavy (70 • High Risk • Local Content Shortfall)
            </button>
          </div>
        </div>
      </div>

      {/* Live 9-Step Verification Stepper */}
      <VerificationStepper
        isRunning={isVerifying}
        onComplete={handleStepperComplete}
      />

      {/* Verification Results Panel */}
      {verificationResult && (
        <div className="space-y-8">
          {/* Top Score & Risk Summary Card */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                  <span className="text-3xl font-extrabold text-blue-400 leading-none">
                    {verificationResult.compliance_score}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">/ 100</span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      {currentBidder?.company_name}
                    </h2>
                    <StatusBadge status={verificationResult.risk_level} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    PAN: {currentBidder?.pan} • GSTIN: {currentBidder?.gstin} • Verified on{" "}
                    {new Date(verificationResult.verified_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/reports/${encodeURIComponent(selectedTenderId)}/${encodeURIComponent(selectedBidderId)}`}
                  target="_blank"
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-400" />
                  <span>Print Dossier</span>
                </Link>

                <button
                  onClick={() => setIsDecisionOpen(true)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Scale className="w-4 h-4" />
                  <span>Record Officer Determination</span>
                </button>
              </div>
            </div>

            {/* Dimensional Score Breakdown */}
            {verificationResult.score_breakdown && (
              <ScoreBreakdown score={verificationResult.score_breakdown} />
            )}

            {/* Risk Drivers (if any) */}
            {verificationResult.risk_factors && verificationResult.risk_factors.length > 0 && (
              <div className="p-5 bg-red-500/[0.03] border border-red-500/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Risk Drivers ({verificationResult.risk_factors.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {verificationResult.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white/[0.06] hover:bg-white/[0.09] rounded-xl border border-red-500/25 flex items-start gap-3 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <StatusBadge status={rf.severity} size="sm" />
                      <div className="space-y-0.5">
                        <strong className="block text-white text-xs">
                          {rf.factor}
                        </strong>
                        <span className="text-[11px] text-slate-400 leading-relaxed block">{rf.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Executive Findings & Advisory Box */}
            <div className="p-5 bg-white/[0.06] border border-blue-500/30 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>AI Verification Advisory &amp; Executive Findings</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed">
                {verificationResult.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 shrink-0">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white/[0.04] rounded-xl border border-blue-500/25 text-xs space-y-1.5">
                <strong className="text-blue-300 uppercase text-[10px] tracking-wider block">
                  Recommended Officer Action:
                </strong>
                <p className="text-white leading-relaxed font-medium">
                  {verificationResult.ai_recommendation}
                </p>
                <div className="pt-2 text-[10px] text-slate-500 font-normal flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Decision Support Only • Final determination rests exclusively with Procurement Officer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Requirement Verification Matrix Table */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="pb-3 border-b border-white/[0.06]">
              <h3 className="text-base font-bold text-white tracking-tight">
                Requirement Verification Matrix
              </h3>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                Click &apos;View Evidence&apos; on any row to drill into document extractions and source cross-concordance
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Requirement</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Mandatory</th>
                    <th className="py-3 px-4">Source</th>
                    <th className="py-3 px-4">Evidence Summary</th>
                    <th className="py-3 px-4">Rule Engine Reason</th>
                    <th className="py-3 px-4 text-right">Evidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {verificationResult.requirement_results.map((req) => (
                    <tr key={req.req_id} className="hover:bg-white/[0.05] transition-colors duration-150">
                      <td className="py-4 px-4 font-semibold text-white">
                        {req.title}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.10] text-slate-300 font-medium text-[10px] uppercase">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{req.mandatory}</td>
                      <td className="py-4 px-4 font-mono font-medium text-blue-400">
                        {req.source}
                      </td>
                      <td className="py-4 px-4 text-slate-300 max-w-xs truncate">
                        {req.evidence_summary}
                      </td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setEvidenceResult(req);
                            setIsEvidenceOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 hover:border-blue-500/40 rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.1)] hover:-translate-y-0.5"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Determination Recorded State */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Procurement Officer Final Determination
                </h3>
              </div>
              <StatusBadge status={officerDecision ? officerDecision.decision : "PENDING_OFFICER"} />
            </div>

            {officerDecision ? (
              <div className="p-5 bg-white/[0.06] rounded-xl border border-white/[0.10] space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Official Determination:</span>
                  <span className="font-extrabold text-white text-sm">{officerDecision.decision}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider block mb-1.5">Officer Comments:</span>
                  <p className="p-3.5 bg-black/60 rounded-xl border border-white/[0.10] text-slate-200 font-normal leading-relaxed">
                    {officerDecision.comments}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Recorded by: <span className="text-slate-400 font-mono">{officerDecision.officer_email}</span> on {new Date(officerDecision.decided_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white/[0.06] rounded-xl border border-white/[0.10] text-xs">
                <span className="text-slate-400">
                  No final determination has been recorded yet for this bidder.
                </span>
                <button
                  onClick={() => setIsDecisionOpen(true)}
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 transition-all cursor-pointer shrink-0"
                >
                  Record Officer Decision
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        result={evidenceResult}
        bidderName={currentBidder?.company_name}
      />

      {/* Decision Modal */}
      <DecisionModal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        onSubmit={handleDecisionSubmit}
        bidderName={currentBidder?.company_name || ""}
        tenderId={selectedTenderId}
        complianceScore={verificationResult?.compliance_score || 0}
        riskLevel={verificationResult?.risk_level || "LOW"}
      />
    </main>
  );
}

export default function VerificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />
        <Suspense fallback={<div className="p-8 text-slate-400">Loading verification console...</div>}>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}

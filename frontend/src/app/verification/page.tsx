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
  const initialTender = searchParams.get("tender") || "GEM/2026/B/100001";
  const initialBidder = searchParams.get("bidder") || "BID-001";

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
    <main className="flex-1 p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              AI Decision-Support System
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              Integrated Bid Compliance Verification Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select tender and bidder to execute multi-source statutory checks and AI risk evaluation.
            </p>
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{isVerifying ? "Verifying..." : "RUN AI VERIFICATION"}</span>
          </button>
        </div>

        {/* Selection Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Active GeM Tender:
            </label>
            <select
              value={selectedTenderId}
              onChange={(e) => setSelectedTenderId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200"
            >
              {tenders.map((t) => (
                <option key={t.tender_id} value={t.tender_id}>
                  {t.tender_id} — {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
              Select Bidder to Verify:
            </label>
            <select
              value={selectedBidderId}
              onChange={(e) => setSelectedBidderId(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-slate-800 dark:text-slate-200"
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
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick SIH Evaluation Scenarios:
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSelectedBidderId("BID-001")}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedBidderId === "BID-001"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Scenario A: ABC Tech (96 • Low Risk • Compliant)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID-002")}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedBidderId === "BID-002"
                  ? "bg-amber-50 text-amber-900 border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 ring-2 ring-amber-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Scenario B: XYZ Engg (74 • Med Risk • Missing ITR)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID-003")}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedBidderId === "BID-003"
                  ? "bg-rose-50 text-rose-800 border-rose-400 dark:bg-rose-950/40 dark:text-rose-300 ring-2 ring-rose-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Scenario C: PQR Industrial (58 • High Risk • Mismatch/Expired)
            </button>

            <button
              onClick={() => setSelectedBidderId("BID-005")}
              className={`px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                selectedBidderId === "BID-005"
                  ? "bg-red-50 text-red-900 border-red-500 dark:bg-red-950/40 dark:text-red-300 ring-2 ring-red-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Scenario D: Bharat Heavy (42 • Watchlist Flag)
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
        <div className="space-y-6">
          {/* Top Score & Risk Summary Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950 flex flex-col items-center justify-center border border-blue-200 dark:border-blue-900">
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-300">
                    {verificationResult.compliance_score}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/100</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {currentBidder?.company_name}
                    </h2>
                    <StatusBadge status={verificationResult.risk_level} />
                  </div>
                  <p className="text-xs text-slate-500">
                    PAN: {currentBidder?.pan} • GSTIN: {currentBidder?.gstin} • Verified on{" "}
                    {new Date(verificationResult.verified_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/reports/${encodeURIComponent(selectedTenderId)}/${encodeURIComponent(selectedBidderId)}`}
                  target="_blank"
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </Link>

                <button
                  onClick={() => setIsDecisionOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
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
              <div className="mt-4 p-4 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Risk Drivers ({verificationResult.risk_factors.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {verificationResult.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-rose-100 dark:border-rose-900/30 flex items-start gap-2"
                    >
                      <StatusBadge status={rf.severity} size="sm" />
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100 text-[11px]">
                          {rf.factor}
                        </strong>
                        <span className="text-[11px] text-slate-500">{rf.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Executive Findings & Advisory Box */}
            <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI Verification Advisory & Executive Findings</span>
              </div>

              <div className="space-y-1 text-xs">
                {verificationResult.findings.map((f, i) => (
                  <div key={i} className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {f}
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-blue-200 dark:border-blue-900 text-xs">
                <strong className="text-blue-900 dark:text-blue-200 block mb-1">
                  Recommended Officer Action:
                </strong>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {verificationResult.ai_recommendation}
                </p>
                <div className="mt-2 text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Decision Support Only • Final determination rests exclusively with Procurement Officer</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Requirement Verification Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Requirement Verification Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Click &apos;View Evidence&apos; on any row to drill into document and source cross-concordance
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
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
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {verificationResult.requirement_results.map((req) => (
                    <tr key={req.req_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {req.title}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {req.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{req.mandatory}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {req.source}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {req.evidence_summary}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {req.reason}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setEvidenceResult(req);
                            setIsEvidenceOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded-md transition-colors inline-flex items-center gap-1 shadow-2xs"
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
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Procurement Officer Final Determination
                </h3>
              </div>
              <StatusBadge status={officerDecision ? officerDecision.decision : "PENDING_OFFICER"} />
            </div>

            {officerDecision ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-500">Official Decision:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{officerDecision.decision}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Officer Comments:</span>
                  <p className="p-2.5 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {officerDecision.comments}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 pt-1">
                  Recorded by: {officerDecision.officer_email} on {new Date(officerDecision.decided_at).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500">
                  No final determination has been recorded yet for this bidder.
                </span>
                <button
                  onClick={() => setIsDecisionOpen(true)}
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
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
    <div className="min-h-screen flex flex-col bg-slate-100/60 dark:bg-slate-950">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <Suspense fallback={<div className="p-6">Loading verification console...</div>}>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}

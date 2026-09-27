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
      {/* ========================================================
          TOP BENTO ROW: Header & Selection Controls (8-Col) + AI Verification Action Card (4-Col)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Header & Controls (Span 8) */}
        <div className="lg:col-span-8 bento-card p-8 space-y-5 flex flex-col justify-between relative overflow-hidden bg-[#D8D4CB] border border-[#24221E]/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#A4864E]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#24221E]/10 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-extrabold text-[#A4864E] uppercase tracking-widest px-3 py-1 rounded-full bg-[#A4864E]/15 border border-[#A4864E]/30">
                AI DECISION-SUPPORT SYSTEM
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24221E] tracking-tight">
              Integrated Bid Compliance Verification Console
            </h1>
            <p className="text-xs lg:text-sm text-[#625F57] font-normal leading-relaxed">
              Select tender and bidder to execute multi-source statutory checks and AI risk evaluation.
            </p>
          </div>

          {/* Selection Dropdowns */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#24221E]/10 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-[#625F57] uppercase tracking-widest">
                Active GeM Tender:
              </label>
              <select
                value={selectedTenderId}
                onChange={(e) => setSelectedTenderId(e.target.value)}
                className="w-full p-2.5 rounded-[10px] border border-[#24221E]/15 bg-[#D8D4CB] text-[#24221E] font-medium focus:outline-none focus:border-[#A4864E]"
              >
                {tenders.map((t) => (
                  <option key={t.tender_id} value={t.tender_id}>
                    {t.tender_id} — {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-extrabold text-[#625F57] uppercase tracking-widest">
                Select Bidder to Verify:
              </label>
              <select
                value={selectedBidderId}
                onChange={(e) => setSelectedBidderId(e.target.value)}
                className="w-full p-2.5 rounded-[10px] border border-[#24221E]/15 bg-[#D8D4CB] text-[#24221E] font-medium focus:outline-none focus:border-[#A4864E]"
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
          <div className="relative z-10 pt-2 border-t border-[#24221E]/10">
            <span className="text-[10px] font-extrabold text-[#625F57] uppercase tracking-widest block mb-2">
              Quick SIH Evaluation Scenarios:
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setSelectedBidderId("BID001")}
                className={`px-3 py-1 rounded-[10px] font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedBidderId === "BID001"
                    ? "bg-[#188A5E]/15 text-[#188A5E] border-[#188A5E]/40 font-semibold"
                    : "bg-[#C9C5BC]/60 border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                Scenario A: TechVista Solutions (100 • Low Risk • Compliant MSME)
              </button>

              <button
                onClick={() => setSelectedBidderId("BID004")}
                className={`px-3 py-1 rounded-[10px] font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedBidderId === "BID004"
                    ? "bg-[#A4864E]/15 text-[#A4864E] border-[#A4864E]/40 font-semibold"
                    : "bg-[#C9C5BC]/60 border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                Scenario B: Pinnacle InfoTech (100 • Low Risk • DPIIT Startup)
              </button>

              <button
                onClick={() => setSelectedBidderId("BID008")}
                className={`px-3 py-1 rounded-[10px] font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedBidderId === "BID008"
                    ? "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/40 font-semibold"
                    : "bg-[#C9C5BC]/60 border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                Scenario C: Metro Construction (80 • High Risk • Tax Scrutiny Notice)
              </button>

              <button
                onClick={() => setSelectedBidderId("BID016")}
                className={`px-3 py-1 rounded-[10px] font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedBidderId === "BID016"
                    ? "bg-[#D95757]/15 text-[#D95757] border-[#D95757]/40 font-semibold"
                    : "bg-[#C9C5BC]/60 border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                Scenario D: Gupta Trading (48 • High Risk • Inactive PAN / Debarred)
              </button>

              <button
                onClick={() => setSelectedBidderId("BID003")}
                className={`px-3 py-1 rounded-[10px] font-medium border transition-all cursor-pointer hover:-translate-y-0.5 ${
                  selectedBidderId === "BID003"
                    ? "bg-[#D95757]/15 text-[#D95757] border-[#D95757]/40 font-semibold"
                    : "bg-[#C9C5BC]/60 border-[#24221E]/10 text-[#625F57] hover:text-[#24221E] hover:bg-[#C9C5BC]"
                }`}
              >
                Scenario E: Bharat Heavy (70 • High Risk • Local Content Shortfall)
              </button>
            </div>
          </div>
        </div>

        {/* Featured AI Verification Hero Action Card (Span 4) */}
        <div className="lg:col-span-4 bento-card p-7 flex flex-col justify-between group relative overflow-hidden bg-[#D8D4CB] border border-[#24221E]/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] group-hover:text-[#24221E] transition-colors">
              Engine Execution Controls
            </span>
            <div className="w-10 h-10 rounded-[10px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 animate-pulse text-[#A4864E]" />
            </div>
          </div>

          <div className="my-4 space-y-2">
            <h3 className="font-extrabold text-[#24221E] text-base">
              {currentBidder?.company_name || "Selected Entity"}
            </h3>
            <p className="text-xs text-[#625F57] font-normal leading-relaxed">
              Execute real-time statutory rule evaluation against GSTN, CBDT, MCA21, EPFO, and CVC Watchlists.
            </p>
          </div>

          <button
            onClick={handleRunVerification}
            disabled={isVerifying}
            className="w-full py-4 rounded-[10px] bg-[#24221E] hover:bg-[#36332E] text-[#F5F2EB] font-extrabold text-xs uppercase tracking-wider shadow-sm border border-[#24221E]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#F5F2EB] animate-pulse" />
            <span>{isVerifying ? "Verifying Rules..." : "RUN AI VERIFICATION"}</span>
          </button>
        </div>
      </div>

      {/* Live 9-Step Verification Stepper */}
      <VerificationStepper
        isRunning={isVerifying}
        onComplete={handleStepperComplete}
      />

      {/* Verification Results Layout (Asymmetrical 8:4 Split) */}
      {verificationResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Analysis & Matrix Column (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Top Score & Risk Summary Card */}
            <div className="bento-card p-8 space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#24221E]/10">
                <div className="flex items-center gap-5">
                  <div className="w-18 h-18 rounded-[14px] bg-[#A4864E]/15 border border-[#A4864E]/30 flex flex-col items-center justify-center shadow-sm">
                    <span className="text-3xl font-extrabold text-[#A4864E] leading-none">
                      {verificationResult.compliance_score}
                    </span>
                    <span className="text-[10px] font-bold text-[#625F57] uppercase tracking-wider mt-1">/ 100</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-[#24221E] tracking-tight">
                        {currentBidder?.company_name}
                      </h2>
                      <StatusBadge status={verificationResult.risk_level} size="sm" />
                    </div>
                    <p className="text-xs text-[#625F57] mt-1 font-mono">
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
                    className="px-4 py-2.5 text-xs font-semibold text-[#625F57] hover:text-[#24221E] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 rounded-[10px] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#A4864E]" />
                    <span>Print Dossier</span>
                  </Link>

                  <button
                    onClick={() => setIsDecisionOpen(true)}
                    className="px-5 py-2.5 text-xs font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] shadow-sm flex items-center gap-2 transition-all cursor-pointer border border-[#24221E]/20"
                  >
                    <Scale className="w-4 h-4 text-[#F5F2EB]" />
                    <span>Sign Decision</span>
                  </button>
                </div>
              </div>

              {/* Dimensional Score Breakdown */}
              {verificationResult.score_breakdown && (
                <ScoreBreakdown score={verificationResult.score_breakdown} />
              )}
            </div>

            {/* Full Requirement Verification Matrix Table */}
            <div className="bento-card p-7 space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="pb-3 border-b border-[#24221E]/10">
                <h3 className="text-base font-bold text-[#24221E] tracking-tight">
                  Requirement Verification Matrix
                </h3>
                <p className="text-xs text-[#625F57] font-normal mt-0.5">
                  Click &apos;View Evidence&apos; on any row to drill into document extractions and source cross-concordance
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#24221E]/10 text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                      <th className="py-3 px-4">Requirement</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Mandatory</th>
                      <th className="py-3 px-4">Source</th>
                      <th className="py-3 px-4">Evidence Summary</th>
                      <th className="py-3 px-4 text-right">Evidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#24221E]/08">
                    {verificationResult.requirement_results.map((req) => (
                      <tr key={req.req_id} className="hover:bg-[#C9C5BC]/50 transition-colors duration-150">
                        <td className="py-4 px-4 font-semibold text-[#24221E]">
                          {req.title}
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={req.status} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] font-semibold text-[10px] uppercase tracking-wider">
                            {req.category}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[#625F57]">{req.mandatory}</td>
                        <td className="py-4 px-4 font-mono font-medium text-[#A4864E]">
                          {req.source}
                        </td>
                        <td className="py-4 px-4 text-[#625F57] max-w-xs truncate">
                          {req.evidence_summary}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              setEvidenceResult(req);
                              setIsEvidenceOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-[#24221E] bg-[#A4864E]/15 hover:bg-[#A4864E]/25 border border-[#A4864E]/30 rounded-[8px] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm hover:-translate-y-0.5"
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
          </div>

          {/* Right Officer & Risk Tower Column (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Procurement Officer Determination Card */}
            <div className="bento-card p-7 space-y-5 bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="flex items-center justify-between pb-3 border-b border-[#24221E]/10">
                <div className="flex items-center gap-3">
                  <Scale className="w-5 h-5 text-[#A4864E]" />
                  <h3 className="text-base font-bold text-[#24221E] tracking-tight">
                    Officer Sign-Off
                  </h3>
                </div>
                <StatusBadge status={officerDecision ? officerDecision.decision : "PENDING_OFFICER"} />
              </div>

              {officerDecision ? (
                <div className="p-4 bg-[#C9C5BC]/60 rounded-[12px] border border-[#24221E]/10 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#625F57] uppercase text-[10px] tracking-widest">Official Determination:</span>
                    <span className="font-extrabold text-[#24221E] text-sm">{officerDecision.decision}</span>
                  </div>
                  <div>
                    <span className="font-extrabold text-[#625F57] uppercase text-[10px] tracking-widest block mb-1.5">Officer Comments:</span>
                    <p className="p-3 bg-[#D8D4CB] rounded-[10px] border border-[#24221E]/15 text-[#24221E] font-normal leading-relaxed">
                      {officerDecision.comments}
                    </p>
                  </div>
                  <div className="text-[10px] text-[#817C72] pt-1">
                    Recorded by: <span className="text-[#625F57] font-mono">{officerDecision.officer_email}</span>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-[#C9C5BC]/60 rounded-[12px] border border-[#24221E]/10 text-xs space-y-3">
                  <span className="text-[#625F57] block">
                    No final determination has been recorded yet for this bidder.
                  </span>
                  <button
                    onClick={() => setIsDecisionOpen(true)}
                    className="w-full py-2.5 font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] shadow-sm hover:-translate-y-0.5 transition-all cursor-pointer border border-[#24221E]/20"
                  >
                    Record Officer Decision
                  </button>
                </div>
              )}
            </div>

            {/* Risk Drivers Card (if any) */}
            {verificationResult.risk_factors && verificationResult.risk_factors.length > 0 && (
              <div className="bento-card p-6 border-red-500/20 space-y-4 bg-[#D8D4CB] border border-[#24221E]/10">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#D95757] uppercase tracking-widest">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Identified Risk Drivers ({verificationResult.risk_factors.length})</span>
                </div>
                <div className="space-y-3 text-xs">
                  {verificationResult.risk_factors.map((rf, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] rounded-[10px] border border-red-500/25 space-y-1 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-[#24221E] text-xs">{rf.factor}</strong>
                        <StatusBadge status={rf.severity} size="sm" />
                      </div>
                      <span className="text-[11px] text-[#625F57] leading-relaxed block">{rf.impact}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Executive Findings & Advisory Box */}
            <div className="bento-card p-6 space-y-4 flex-1 flex flex-col justify-between bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#A4864E] uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 text-[#A4864E]" />
                  <span>AI Executive Advisory</span>
                </div>

                <div className="space-y-2 text-xs text-[#24221E] leading-relaxed">
                  {verificationResult.findings.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#A4864E] shrink-0">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#C9C5BC]/60 rounded-[10px] border border-[#A4864E]/30 text-xs space-y-1.5 mt-4">
                <strong className="text-[#A4864E] uppercase text-[10px] tracking-widest block">
                  Recommended Action:
                </strong>
                <p className="text-[#24221E] leading-relaxed font-medium">
                  {verificationResult.ai_recommendation}
                </p>
              </div>
            </div>
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
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />
      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />
        <Suspense fallback={<div className="p-8 text-[#625F57]">Loading verification console...</div>}>
          <VerificationContent />
        </Suspense>
      </div>
    </div>
  );
}

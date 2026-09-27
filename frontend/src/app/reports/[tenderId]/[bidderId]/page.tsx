"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, Shield, Scale, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";

export default function ReportPage() {
  const params = useParams();
  const rawTenderId = params.tenderId as string;
  const rawBidderId = params.bidderId as string;
  const tenderId = decodeURIComponent(rawTenderId);
  const bidderId = decodeURIComponent(rawBidderId);

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await api.getReportData(tenderId, bidderId);
        setReportData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [tenderId, bidderId]);

  if (isLoading || !reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#C9C5BC] text-[#24221E]">
        <p className="text-sm font-semibold">Generating AI Verification Dossier...</p>
      </div>
    );
  }

  const t = reportData.tender;
  const b = reportData.bidder;
  const v = reportData.verification;
  const d = reportData.officer_decision;

  return (
    <div className="min-h-screen bg-[#C9C5BC] text-[#24221E] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans print:bg-white print:p-0 print:text-black selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <div className="max-w-4xl mx-auto space-y-6 relative z-10">
        {/* Print / Navigation Toolbar (Hidden during print) */}
        <div className="no-print bento-card p-4 flex items-center justify-between bg-[#D8D4CB] border border-[#24221E]/10">
          <Link
            href={`/verification?tender=${encodeURIComponent(tenderId)}&bidder=${encodeURIComponent(bidderId)}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#625F57] hover:text-[#24221E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#A4864E]" />
            <span>Return to Verification Console</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-[#24221E] hover:bg-[#36332E] text-[#F5F2EB] font-black text-xs rounded-[10px] flex items-center gap-2 shadow-sm transition-all cursor-pointer border border-[#24221E]/20 hover:-translate-y-0.5"
          >
            <Printer className="w-4 h-4 text-[#F5F2EB]" />
            <span>Print / Save Dossier PDF</span>
          </button>
        </div>

        {/* Official Report Document */}
        <div className="bento-card bg-[#D8D4CB] p-8 sm:p-12 space-y-6 text-[#24221E] border border-[#24221E]/10 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b border-[#24221E]/10 print:border-slate-900 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 shrink-0 rounded-[8px] bg-[#1C1A17] border border-[#A4864E]/30 flex items-center justify-center overflow-hidden print:bg-slate-900">
                    <img
                      src="/bidsentinel-logo.png"
                      alt="BidSentinel Icon"
                      className="w-[125px] max-w-none h-auto mix-blend-screen shrink-0 -ml-1"
                    />
                  </div>
                  <div>
                    <div className="flex items-center leading-none">
                      <span className="text-base font-black tracking-tight text-[#24221E] print:text-slate-900">
                        Bid
                      </span>
                      <span className="text-base font-black tracking-tight bg-gradient-to-r from-[#A4864E] via-[#C2A96D] to-[#725C3A] bg-clip-text text-transparent print:text-amber-800">
                        Sentinel
                      </span>
                    </div>
                    <p className="text-[8px] font-bold tracking-[0.18em] text-[#625F57] print:text-slate-600 uppercase">
                      INTELLIGENT TENDER COMPLIANCE
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#A4864E] block print:text-slate-600">
                  Government e-Marketplace (GeM)
                </span>
                <h1 className="text-2xl font-black tracking-tight text-[#24221E] print:text-slate-900 mt-1">
                  AI-Assisted Bid Compliance Verification Report
                </h1>
                <p className="text-xs text-[#625F57] print:text-slate-600 mt-1">
                  Official Decision-Support Dossier • Generated on {reportData.generated_at}
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-[8px] bg-[#A4864E]/15 text-[#A4864E] border border-[#A4864E]/30 print:bg-amber-50 print:text-amber-800 print:border-amber-200 text-xs font-black uppercase tracking-wider">
                  CONFIDENTIAL
                </span>
              </div>
            </div>
          </div>

          {/* Tender & Bidder Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-[#C9C5BC]/60 print:bg-slate-50 rounded-[14px] border border-[#24221E]/10 print:border-slate-200 space-y-1.5">
              <h3 className="font-bold text-[#24221E] print:text-slate-900 text-sm border-b border-[#24221E]/10 print:border-slate-200 pb-1 mb-2">
                Tender Specifications
              </h3>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Tender ID:</strong> <span className="font-mono text-[#A4864E] print:text-slate-900">{t.tender_id}</span></p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Item Title:</strong> {t.title}</p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Procuring Entity:</strong> {t.department}</p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Estimated Value:</strong> INR {t.estimated_value_inr?.toLocaleString("en-IN")}</p>
            </div>

            <div className="p-4 bg-[#C9C5BC]/60 print:bg-slate-50 rounded-[14px] border border-[#24221E]/10 print:border-slate-200 space-y-1.5">
              <h3 className="font-bold text-[#24221E] print:text-slate-900 text-sm border-b border-[#24221E]/10 print:border-slate-200 pb-1 mb-2">
                Bidder Entity Profile
              </h3>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Company:</strong> {b.company_name}</p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">PAN:</strong> <span className="font-mono text-[#A4864E] print:text-slate-900">{b.pan}</span> | <strong className="text-[#625F57] print:text-slate-900">GSTIN:</strong> <span className="font-mono text-[#A4864E] print:text-slate-900">{b.gstin}</span></p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Udyam MSME:</strong> <span className="font-mono text-[#A4864E] print:text-slate-900">{b.udyam_number || "Not Claimed"}</span></p>
              <p className="text-[#24221E] print:text-slate-800"><strong className="text-[#625F57] print:text-slate-900">Domestic Local Content:</strong> {b.declared_local_content}%</p>
            </div>
          </div>

          {/* Evaluation Score Card */}
          <div className="p-5 bg-[#C9C5BC]/60 print:bg-slate-50 rounded-[14px] border border-[#24221E]/10 print:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-[#625F57] uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-3xl font-black text-[#24221E] print:text-slate-900">
                  {v.compliance_score}<span className="text-xs text-[#625F57] font-normal">/100</span>
                </span>
              </div>
              <div className="border-l border-[#24221E]/10 print:border-slate-200 pl-6">
                <span className="text-[10px] font-bold text-[#625F57] uppercase tracking-wider block">
                  Risk Evaluation
                </span>
                <span className={`text-base font-bold ${v.risk_level === 'LOW' ? 'text-[#188A5E] print:text-emerald-700' : (v.risk_level === 'MEDIUM' ? 'text-[#D97706] print:text-amber-700' : 'text-[#D95757] print:text-rose-700')}`}>
                  {v.risk_level} RISK
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5 text-[#625F57] print:text-slate-800">
              <div>Statutory: <strong className="text-[#24221E] print:text-slate-900">{v.score_breakdown?.statutory}/25</strong></div>
              <div>Tender Criteria: <strong className="text-[#24221E] print:text-slate-900">{v.score_breakdown?.tender_specific}/30</strong></div>
              <div>Documents: <strong className="text-[#24221E] print:text-slate-900">{v.score_breakdown?.document_verification}/25</strong></div>
              <div>Government Concordance: <strong className="text-[#24221E] print:text-slate-900">{v.score_breakdown?.govt_verification}/20</strong></div>
            </div>
          </div>

          {/* AI Advisory Summary */}
          <div className="p-4 bg-[#A4864E]/15 print:bg-amber-50 border border-[#A4864E]/30 print:border-amber-200 rounded-[14px] space-y-2 text-xs">
            <strong className="text-[#A4864E] print:text-amber-900 uppercase tracking-wider block font-bold">
              AI Decision-Support Finding &amp; Recommendation:
            </strong>
            <p className="text-[#24221E] print:text-slate-800 leading-relaxed font-medium">
              {v.ai_recommendation}
            </p>
          </div>

          {/* Verification Criteria Matrix */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#625F57] print:text-slate-600">
              Statutory &amp; Tender Criteria Verification Matrix
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-[#24221E]/10 print:border-slate-200 rounded-[12px] overflow-hidden">
                <thead className="bg-[#C9C5BC] print:bg-slate-100 text-[#625F57] print:text-slate-600 border-b border-[#24221E]/10 print:border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="p-3">Requirement</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Source</th>
                    <th className="p-3">Evidence Summary</th>
                    <th className="p-3">Rule Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24221E]/08 print:divide-slate-200">
                  {v.requirement_results?.map((r: any) => (
                    <tr key={r.req_id} className="hover:bg-[#C9C5BC]/50 print:hover:bg-transparent">
                      <td className="p-3 font-bold text-[#24221E] print:text-slate-900">{r.title}</td>
                      <td className="p-3">
                        <span className={`font-bold text-[11px] ${r.status === 'COMPLIANT' ? 'text-[#188A5E] print:text-emerald-700' : (r.status === 'REVIEW_REQUIRED' ? 'text-[#D97706] print:text-amber-700' : 'text-[#D95757] print:text-rose-700')}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#625F57] print:text-slate-600">{r.source}</td>
                      <td className="p-3 text-[#625F57] print:text-slate-700 text-[11px]">{r.evidence_summary}</td>
                      <td className="p-3 text-[#817C72] print:text-slate-500 text-[11px]">{r.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Procurement Officer Determination Block */}
          <div className="p-5 border-2 border-[#24221E]/20 print:border-slate-900 rounded-[14px] space-y-3 text-xs bg-[#C9C5BC]/60 print:bg-slate-50">
            <div className="flex items-center justify-between border-b border-[#24221E]/10 print:border-slate-200 pb-2">
              <h3 className="font-black text-sm text-[#24221E] print:text-slate-900 uppercase tracking-wide">
                Procurement Officer Determination &amp; Signature Block
              </h3>
              <span className="font-bold px-3 py-1 rounded-[8px] bg-[#188A5E]/15 text-[#188A5E] border border-[#188A5E]/30 print:bg-slate-200 print:text-slate-800 text-xs">
                {d.decision || "PENDING"}
              </span>
            </div>

            <p className="text-[#24221E] print:text-slate-900"><strong className="text-[#625F57] print:text-slate-900">Official Determination:</strong> {d.decision || "Pending Official Concurrence"}</p>
            <p className="text-[#24221E] print:text-slate-900"><strong className="text-[#625F57] print:text-slate-900">Officer Comments:</strong> {d.comments || "Evaluation pending officer final signature."}</p>
            <p className="text-[11px] text-[#625F57] print:text-slate-500">
              Evaluator: {d.officer_email || "Dr. Rajeshwar Sharma, IAS"} • Timestamp: {d.decided_at || reportData.generated_at}
            </p>
          </div>

          {/* Footer Legal Disclaimer */}
          <div className="text-[10px] text-[#817C72] print:text-slate-400 border-t border-[#24221E]/10 print:border-slate-200 pt-3 leading-relaxed">
            {reportData.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-800">
        <p className="text-sm font-semibold">Generating AI Verification Dossier...</p>
      </div>
    );
  }

  const t = reportData.tender;
  const b = reportData.bidder;
  const v = reportData.verification;
  const d = reportData.officer_decision;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 text-slate-900 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Print / Navigation Toolbar (Hidden during print) */}
        <div className="flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <Link
            href={`/verification?tender=${encodeURIComponent(tenderId)}&bidder=${encodeURIComponent(bidderId)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Verification Console</span>
          </Link>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Dossier PDF</span>
          </button>
        </div>

        {/* Official Report Document */}
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">
                  Government e-Marketplace (GeM)
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                  AI-Assisted Bid Compliance Verification Report
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Official Decision-Support Dossier • Generated on {reportData.generated_at}
                </p>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-black uppercase tracking-wider">
                  CONFIDENTIAL
                </span>
              </div>
            </div>
          </div>

          {/* Tender & Bidder Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-2">
                Tender Specifications
              </h3>
              <p><strong>Tender ID:</strong> <span className="font-mono">{t.tender_id}</span></p>
              <p><strong>Item Title:</strong> {t.title}</p>
              <p><strong>Procuring Entity:</strong> {t.department}</p>
              <p><strong>Estimated Value:</strong> INR {t.estimated_value_inr?.toLocaleString("en-IN")}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 mb-2">
                Bidder Entity Profile
              </h3>
              <p><strong>Company:</strong> {b.company_name}</p>
              <p><strong>PAN:</strong> <span className="font-mono">{b.pan}</span> | <strong>GSTIN:</strong> <span className="font-mono">{b.gstin}</span></p>
              <p><strong>Udyam MSME:</strong> <span className="font-mono">{b.udyam_number || "Not Claimed"}</span></p>
              <p><strong>Domestic Local Content:</strong> {b.declared_local_content}%</p>
            </div>
          </div>

          {/* Evaluation Score Card */}
          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Overall Score
                </span>
                <span className="text-3xl font-black text-slate-900">
                  {v.compliance_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                </span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Risk Evaluation
                </span>
                <span className={`text-base font-bold ${v.risk_level === 'LOW' ? 'text-emerald-700' : (v.risk_level === 'MEDIUM' ? 'text-amber-700' : 'text-rose-700')}`}>
                  {v.risk_level} RISK
                </span>
              </div>
            </div>

            <div className="text-right text-xs space-y-0.5">
              <div>Statutory: <strong>{v.score_breakdown?.statutory}/25</strong></div>
              <div>Tender Criteria: <strong>{v.score_breakdown?.tender_specific}/30</strong></div>
              <div>Documents: <strong>{v.score_breakdown?.document_verification}/25</strong></div>
              <div>Government Concordance: <strong>{v.score_breakdown?.govt_verification}/20</strong></div>
            </div>
          </div>

          {/* AI Advisory Summary */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs">
            <strong className="text-blue-900 uppercase tracking-wider block">
              AI Decision-Support Finding & Recommendation:
            </strong>
            <p className="text-slate-800 leading-relaxed font-medium">
              {v.ai_recommendation}
            </p>
          </div>

          {/* Verification Criteria Matrix */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600">
              Statutory & Tender Criteria Verification Matrix
            </h3>

            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Requirement</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Source</th>
                  <th className="p-2.5">Evidence Summary</th>
                  <th className="p-2.5">Rule Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {v.requirement_results?.map((r: any) => (
                  <tr key={r.req_id}>
                    <td className="p-2.5 font-bold text-slate-900">{r.title}</td>
                    <td className="p-2.5">
                      <span className={`font-bold ${r.status === 'COMPLIANT' ? 'text-emerald-700' : (r.status === 'REVIEW_REQUIRED' ? 'text-amber-700' : 'text-rose-700')}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-semibold text-slate-600">{r.source}</td>
                    <td className="p-2.5 text-slate-700 text-[11px]">{r.evidence_summary}</td>
                    <td className="p-2.5 text-slate-500 text-[11px]">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Procurement Officer Determination Block */}
          <div className="p-5 border-2 border-slate-900 rounded-xl space-y-3 text-xs bg-slate-50/50">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                Procurement Officer Determination & Signature Block
              </h3>
              <span className="font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {d.decision || "PENDING"}
              </span>
            </div>

            <p><strong>Official Determination:</strong> {d.decision || "Pending Official Concurrence"}</p>
            <p><strong>Officer Comments:</strong> {d.comments || "Evaluation pending officer final signature."}</p>
            <p className="text-[11px] text-slate-500">
              Evaluator: {d.officer_email || "Dr. Rajeshwar Sharma, IAS"} • Timestamp: {d.decided_at || reportData.generated_at}
            </p>
          </div>

          {/* Footer Legal Disclaimer */}
          <div className="text-[10px] text-slate-400 border-t border-slate-200 pt-3 leading-relaxed">
            {reportData.disclaimer}
          </div>
        </div>
      </div>
    </div>
  );
}

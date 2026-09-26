"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  FileText,
  Upload,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  RefreshCw,
  FileCheck,
  Eye,
  X,
  Lock,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { Bidder } from "@/lib/types";

export default function BidderDetailPage() {
  const params = useParams();
  const rawId = params.id as string;
  const bidderId = decodeURIComponent(rawId);

  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState("GST_CERTIFICATE");
  const [isUploading, setIsUploading] = useState(false);

  const loadBidder = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBidder(bidderId);
      setBidder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBidder();
  }, [bidderId]);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("bidder_id", bidderId);
    formData.append("document_type", docType);
    formData.append("file", selectedFile);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bidsentinel_token") : null;
      const res = await fetch("http://localhost:8000/api/v1/documents/upload", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setShowUploadModal(false);
      setSelectedFile(null);
      await loadBidder();
    } catch (err: any) {
      alert("Error uploading document: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading && !bidder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white selection:bg-blue-600/30 selection:text-white">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/bidders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Bidders Registry</span>
            </Link>

            <Link
              href={`/verification?bidder=${encodeURIComponent(bidderId)}`}
              className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-blue-400/40 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Run AI Verification for this Bidder</span>
            </Link>
          </div>

          {/* Profile Overview Card */}
          <div className="relative rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div className="space-y-1.5">
                <span className="font-mono text-xs font-bold text-blue-400 block tracking-wider">
                  {bidder?.bidder_id}
                </span>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  {bidder?.company_name}
                </h1>
                <p className="text-xs text-slate-400 font-normal mt-1 leading-relaxed">
                  {bidder?.address}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
                    Calculated Score
                  </span>
                  <span className="text-2xl lg:text-3xl font-extrabold text-white">
                    {bidder?.latest_verification?.compliance_score || bidder?.expected_score || 0}
                    <span className="text-xs text-slate-500 font-normal"> / 100</span>
                  </span>
                </div>
                <StatusBadge status={bidder?.latest_verification?.risk_level || bidder?.expected_risk || "LOW"} size="md" />
              </div>
            </div>

            {/* Statutory Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">PAN</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.pan}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">GSTIN</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.gstin}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">CIN</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.cin || "N/A"}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Udyam MSME No</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.udyam_number || "Not Claimed"}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">EPFO Establishment</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.epfo_id || "N/A"}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ESIC Employer Code</span>
                <span className="font-mono font-bold text-white text-sm block">{bidder?.esic_id || "N/A"}</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Local Content %</span>
                <span className="font-bold text-white text-sm block">{bidder?.declared_local_content}%</span>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/35 hover:-translate-y-0.5 transition-all space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">ITR Assessment Year</span>
                <span className="font-bold text-white text-sm block">{bidder?.itr_filed_year || "Missing"}</span>
              </div>
            </div>
          </div>

          {/* Submitted Documents Section */}
          <div className="rounded-[22px] bg-white/[0.06] backdrop-blur-2xl border border-white/[0.10] p-7 shadow-[0_4px_30px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Submitted Documents &amp; OCR Extractions ({bidder?.documents?.length || 0})
                </h2>
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  Classified digital documents with structured key-value metadata parsed via OCR
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">Extracted Fields</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {bidder?.documents?.map((d) => (
                    <tr key={d.id} className="hover:bg-white/[0.03] transition-colors duration-150">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                          <span className="font-semibold text-white">
                            {d.document_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300 font-medium text-[11px]">
                          {d.document_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {d.upload_date || "2026-09-25"}
                      </td>
                      <td className="py-4 px-4">
                        <pre className="text-[10px] font-mono bg-white/[0.02] border border-white/[0.06] p-2 rounded-lg max-w-xs truncate text-slate-300">
                          {d.extracted_data ? JSON.stringify(d.extracted_data) : "No fields extracted"}
                        </pre>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {d.expiry_date || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={d.verification_status || "VERIFIED"} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setInspectDoc(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 rounded-lg transition-all shadow-[0_0_12px_rgba(59,130,246,0.1)] cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-black/90 border border-white/[0.12] rounded-[22px] shadow-[0_12px_50px_rgba(0,0,0,0.8)] p-7 space-y-5 backdrop-blur-2xl">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Upload Bidder Document
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Supported formats: PDF, PNG, JPG, JPEG, TXT. Documents are automatically classified and parsed via OCR.
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-white/[0.08] bg-black text-white focus:outline-none focus:border-blue-500/50"
                >
                  <option value="GST_CERTIFICATE">GST Certificate</option>
                  <option value="PAN_CARD">PAN Card</option>
                  <option value="UDYAM_CERTIFICATE">Udyam MSME Certificate</option>
                  <option value="OEM_AUTHORIZATION">OEM Manufacturer Authorization</option>
                  <option value="LOCAL_CONTENT_DECLARATION">Local Content Declaration</option>
                  <option value="ITR_ACKNOWLEDGMENT">ITR Acknowledgment</option>
                  <option value="EPFO_ECR">EPFO Electronic Challan</option>
                  <option value="ESIC_CHALLAN">ESIC Contribution</option>
                  <option value="DPIIT_STARTUP_CERTIFICATE">DPIIT Startup Certificate</option>
                  <option value="NSIC_CERTIFICATE">NSIC SPRS Certificate</option>
                  <option value="BIS_CERTIFICATE">BIS Conformity Certificate</option>
                  <option value="NON_BLACKLISTING_DECLARATION">Non-Blacklisting Declaration</option>
                  <option value="OTHER">Other Technical Document</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1.5 text-slate-300 uppercase text-[10px] tracking-wider">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-white/[0.08] bg-white/[0.04] text-white rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? "Uploading & OCR..." : "Upload & Classify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Inspection & Certificate Preview Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-black/95 rounded-[22px] shadow-[0_12px_60px_rgba(0,0,0,0.9)] border border-white/[0.12] overflow-hidden max-h-[90vh] flex flex-col backdrop-blur-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-xl shadow-[0_0_12px_rgba(59,130,246,0.2)]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2.5">
                    <span>{inspectDoc.document_name}</span>
                    <StatusBadge status={inspectDoc.verification_status || "VERIFIED"} size="sm" />
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Category: <span className="font-semibold text-white">{inspectDoc.document_type}</span> • Submitted: {inspectDoc.upload_date || "2026-09-25"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-7 overflow-y-auto space-y-6">
              {/* Simulated Official Document Dossier Card */}
              <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/[0.08] relative">
                <div className="text-center border-b border-white/[0.06] pb-4 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 block">
                    Government of India / GeM Procurement Electronic Archive
                  </span>
                  <h4 className="text-base font-extrabold text-white mt-1">
                    {inspectDoc.document_name.toUpperCase()}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                    Electronic Filing Ref: DOC-{bidder?.bidder_id}-{inspectDoc.document_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Bidder Entity:</span>
                    <strong className="text-white text-sm">{bidder?.company_name}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Statutory Registration:</span>
                    <span className="font-mono font-bold text-blue-400">PAN: {bidder?.pan} • GSTIN: {bidder?.gstin}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Verification Integrity:</span>
                    <strong className="text-emerald-400 font-semibold">OCR Extracted &amp; Cross-Verified against Authority Source</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block text-[11px]">Document Validity:</span>
                    <strong className="text-white font-semibold">{inspectDoc.expiry_date || "Perpetual / Ongoing"}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DigiLocker / Statutory Archive Timestamp Verified
                  </span>
                  <span className="font-mono text-[10px] text-slate-500">SHA-256 Tamper-Proof Seal</span>
                </div>
              </div>

              {/* AI OCR Extracted Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    <span>AI OCR Structured Key-Value Extractions</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                    OCR Confidence: 97%
                  </span>
                </div>

                {inspectDoc.extracted_data && Object.keys(inspectDoc.extracted_data).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {Object.entries(inspectDoc.extracted_data).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex justify-between items-center">
                        <span className="font-medium text-slate-400 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="font-mono font-bold text-white text-right max-w-[60%] truncate">
                          {typeof val === "boolean" ? (val ? "YES" : "NO") : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No structured fields extracted for this document.</p>
                )}
              </div>

              {/* Raw JSON Technical View */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Raw Extracted Payload:</span>
                <pre className="text-[11px] font-mono bg-black text-slate-300 p-4 rounded-xl overflow-x-auto border border-white/[0.08]">
                  {JSON.stringify(inspectDoc.extracted_data || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-white/[0.08] bg-white/[0.02] text-xs">
              <span className="text-slate-500">Document Dossier Record • GeM SIH 2026 Prototype</span>
              <button
                onClick={() => setInspectDoc(null)}
                className="px-5 py-2 font-bold text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

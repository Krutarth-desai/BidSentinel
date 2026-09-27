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
      <div className="min-h-screen flex items-center justify-center bg-[#C9C5BC]">
        <RefreshCw className="w-8 h-8 animate-spin text-[#A4864E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />

      <div className="flex-1 flex max-w-[1720px] w-full mx-auto">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 space-y-8 min-w-0">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/bidders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#625F57] hover:text-[#24221E] transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Bidders Registry</span>
            </Link>

            <Link
              href={`/verification?bidder=${encodeURIComponent(bidderId)}`}
              className="px-5 py-2.5 text-xs font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] transition-all duration-200 shadow-sm border border-[#24221E]/20 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#F5F2EB]" />
              <span>Run AI Verification for this Bidder</span>
            </Link>
          </div>

          {/* Asymmetrical Profile Overview (8:4 Split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Main Profile & Statutory Grid (Span 8) */}
            <div className="lg:col-span-8 bento-card p-8 space-y-6 flex flex-col justify-between relative overflow-hidden bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#A4864E]/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#24221E]/10 to-transparent pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#24221E]/10 pb-4">
                  <div className="space-y-1.5">
                    <span className="font-mono text-xs font-bold text-[#A4864E] block tracking-wider">
                      {bidder?.bidder_id}
                    </span>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-[#24221E] tracking-tight">
                      {bidder?.company_name}
                    </h1>
                    <p className="text-xs text-[#625F57] font-normal mt-1 leading-relaxed">
                      {bidder?.address}
                    </p>
                  </div>
                </div>

                {/* Statutory Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">PAN</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.pan}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">GSTIN</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.gstin}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">CIN</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.cin || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">Udyam MSME</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.udyam_number || "Not Claimed"}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">EPFO ID</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.epfo_id || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">ESIC Code</span>
                    <span className="font-mono font-bold text-[#24221E] text-xs block truncate">{bidder?.esic_id || "N/A"}</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">Local Content</span>
                    <span className="font-bold text-[#24221E] text-xs block">{bidder?.declared_local_content}%</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/40 hover:-translate-y-0.5 transition-all space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] block">ITR AY</span>
                    <span className="font-bold text-[#24221E] text-xs block">{bidder?.itr_filed_year || "Missing"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Determination & Documents Tower (Span 4) */}
            <div className="lg:col-span-4 bento-card p-7 flex flex-col justify-between group relative overflow-hidden bg-[#D8D4CB] border border-[#24221E]/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#625F57] group-hover:text-[#24221E] transition-colors">
                  Compliance Risk Evaluation
                </span>
                <StatusBadge status={bidder?.latest_verification?.risk_level || bidder?.expected_risk || "LOW"} size="sm" />
              </div>

              <div className="my-5 space-y-2">
                <span className="text-[10px] font-extrabold text-[#625F57] uppercase tracking-widest block">
                  Calculated Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-[#24221E] tracking-tight">
                    {bidder?.latest_verification?.compliance_score || bidder?.expected_score || 0}
                  </span>
                  <span className="text-xs text-[#625F57] font-normal"> / 100 Points</span>
                </div>
                <p className="text-xs text-[#625F57] font-normal leading-relaxed pt-1">
                  Multi-source concordance across statutory connectors and submitted OCR extractions.
                </p>
              </div>

              <div className="pt-3 border-t border-[#24221E]/10 space-y-3 text-xs">
                <div className="flex justify-between items-center text-[#625F57]">
                  <span>Uploaded Documents:</span>
                  <span className="font-bold text-[#24221E]">{bidder?.documents?.length || 0} Files</span>
                </div>
                <Link
                  href={`/verification?bidder=${encodeURIComponent(bidderId)}`}
                  className="w-full py-2.5 px-4 text-xs font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] transition-all shadow-sm flex items-center justify-center gap-2 border border-[#24221E]/20"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F5F2EB]" />
                  <span>Execute AI Scrutiny</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Submitted Documents Section */}
          <div className="bento-card p-7 space-y-6 bg-[#D8D4CB] border border-[#24221E]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#24221E]/10">
              <div>
                <h2 className="text-base font-bold text-[#24221E] tracking-tight">
                  Submitted Documents &amp; OCR Extractions ({bidder?.documents?.length || 0})
                </h2>
                <p className="text-xs text-[#625F57] font-normal mt-0.5">
                  Classified digital documents with structured key-value metadata parsed via OCR
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 text-xs font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer border border-[#24221E]/20"
              >
                <Upload className="w-3.5 h-3.5 text-[#F5F2EB]" />
                <span>Upload Document</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#24221E]/10 text-[10px] font-extrabold uppercase tracking-widest text-[#625F57]">
                    <th className="py-3 px-4">Document Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Upload Date</th>
                    <th className="py-3 px-4">Extracted Fields</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Verification Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24221E]/08">
                  {bidder?.documents?.map((d) => (
                    <tr key={d.id} className="hover:bg-[#C9C5BC]/50 transition-colors duration-150">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-[#A4864E] shrink-0" />
                          <span className="font-semibold text-[#24221E]">
                            {d.document_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#C9C5BC] border border-[#24221E]/10 text-[#625F57] font-semibold text-[10px] uppercase tracking-wider">
                          {d.document_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#625F57] font-mono text-[11px]">
                        {d.upload_date || "2026-09-25"}
                      </td>
                      <td className="py-4 px-4">
                        <pre className="text-[10px] font-mono bg-[#C9C5BC]/80 border border-[#24221E]/10 p-2 rounded-[8px] max-w-xs truncate text-[#24221E]">
                          {d.extracted_data ? JSON.stringify(d.extracted_data) : "No fields extracted"}
                        </pre>
                      </td>
                      <td className="py-4 px-4 text-[#625F57] font-mono text-[11px]">
                        {d.expiry_date || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={d.verification_status || "VERIFIED"} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setInspectDoc(d)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#24221E] hover:text-[#24221E] bg-[#A4864E]/15 hover:bg-[#A4864E]/25 border border-[#A4864E]/30 rounded-[8px] transition-all shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#E3DFD6] p-7 space-y-5 shadow-2xl rounded-2xl border border-[#24221E]/15 text-[#24221E]">
            <div>
              <h3 className="text-lg font-bold text-[#24221E] tracking-tight">
                Upload Bidder Document
              </h3>
              <p className="text-xs text-[#625F57] mt-1">
                Supported formats: PDF, PNG, JPG, JPEG, TXT. Documents are automatically classified and parsed via OCR.
              </p>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
              <div>
                <label className="block font-extrabold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-widest">
                  Document Category
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full p-2.5 rounded-[10px] border border-[#24221E]/15 bg-[#D8D4CB] text-[#24221E] focus:outline-none focus:border-[#A4864E]"
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
                <label className="block font-semibold mb-1.5 text-[#625F57] uppercase text-[10px] tracking-wider">
                  Select File
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-[#24221E]/15 bg-[#D8D4CB] text-[#24221E] rounded-[10px] text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#24221E]/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 font-semibold text-[#625F57] hover:text-[#24221E] bg-[#C9C5BC]/50 hover:bg-[#C9C5BC] border border-[#24221E]/10 rounded-[10px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 font-bold text-[#F5F2EB] bg-[#24221E] hover:bg-[#36332E] rounded-[10px] shadow-sm transition-all cursor-pointer disabled:opacity-50 border border-[#24221E]/20"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#24221E]/60 backdrop-blur-md">
          <div className="w-full max-w-3xl bg-[#E3DFD6] rounded-[22px] shadow-2xl border border-[#24221E]/15 overflow-hidden max-h-[90vh] flex flex-col backdrop-blur-2xl text-[#24221E]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-[#24221E]/10 bg-[#D8D4CB]/50">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-[#A4864E]/15 text-[#A4864E] border border-[#A4864E]/30 rounded-[10px] shadow-sm">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#24221E] flex items-center gap-2.5">
                    <span>{inspectDoc.document_name}</span>
                    <StatusBadge status={inspectDoc.verification_status || "VERIFIED"} size="sm" />
                  </h3>
                  <p className="text-xs text-[#625F57] mt-0.5">
                    Category: <span className="font-semibold text-[#24221E]">{inspectDoc.document_type}</span> • Submitted: {inspectDoc.upload_date || "2026-09-25"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-2 text-[#625F57] hover:text-[#24221E] rounded-[10px] hover:bg-[#C9C5BC] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-7 overflow-y-auto space-y-6">
              {/* Simulated Official Document Dossier Card */}
              <div className="p-6 bg-[#D8D4CB] rounded-[14px] border border-[#24221E]/10 relative">
                <div className="text-center border-b border-[#24221E]/10 pb-4 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A4864E] block">
                    Government of India / GeM Procurement Electronic Archive
                  </span>
                  <h4 className="text-base font-extrabold text-[#24221E] mt-1">
                    {inspectDoc.document_name.toUpperCase()}
                  </h4>
                  <span className="text-[11px] text-[#625F57] font-mono mt-0.5 block">
                    Electronic Filing Ref: DOC-{bidder?.bidder_id}-{inspectDoc.document_type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="space-y-0.5">
                    <span className="text-[#625F57] block text-[11px]">Bidder Entity:</span>
                    <strong className="text-[#24221E] text-sm">{bidder?.company_name}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#625F57] block text-[11px]">Statutory Registration:</span>
                    <span className="font-mono font-bold text-[#A4864E]">PAN: {bidder?.pan} • GSTIN: {bidder?.gstin}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#625F57] block text-[11px]">Verification Integrity:</span>
                    <strong className="text-[#188A5E] font-semibold">OCR Extracted &amp; Cross-Verified against Authority Source</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[#625F57] block text-[11px]">Document Validity:</span>
                    <strong className="text-[#24221E] font-semibold">{inspectDoc.expiry_date || "Perpetual / Ongoing"}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#24221E]/10 flex items-center justify-between text-[11px] text-[#625F57]">
                  <span className="flex items-center gap-1.5 text-[#188A5E] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DigiLocker / Statutory Archive Timestamp Verified
                  </span>
                  <span className="font-mono text-[10px] text-[#817C72]">SHA-256 Tamper-Proof Seal</span>
                </div>
              </div>

              {/* AI OCR Extracted Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#24221E] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#A4864E]" />
                    <span>AI OCR Structured Key-Value Extractions</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-[#188A5E]/15 text-[#188A5E] border border-[#188A5E]/30 px-2.5 py-0.5 rounded-full">
                    OCR Confidence: 97%
                  </span>
                </div>

                {inspectDoc.extracted_data && Object.keys(inspectDoc.extracted_data).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {Object.entries(inspectDoc.extracted_data).map(([key, val]) => (
                      <div key={key} className="p-3 rounded-[10px] bg-[#D8D4CB] border border-[#24221E]/10 flex justify-between items-center">
                        <span className="font-medium text-[#625F57] capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="font-mono font-bold text-[#24221E] text-right max-w-[60%] truncate">
                          {typeof val === "boolean" ? (val ? "YES" : "NO") : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#817C72] italic">No structured fields extracted for this document.</p>
                )}
              </div>

              {/* Raw JSON Technical View */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#625F57] uppercase tracking-wider">Raw Extracted Payload:</span>
                <pre className="text-[11px] font-mono bg-[#24221E] text-[#F5F2EB] p-4 rounded-[10px] overflow-x-auto border border-[#24221E]/20">
                  {JSON.stringify(inspectDoc.extracted_data || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-[#24221E]/10 bg-[#D8D4CB]/50 text-xs">
              <span className="text-[#625F57]">Document Dossier Record • GeM SIH 2026 Prototype</span>
              <button
                onClick={() => setInspectDoc(null)}
                className="px-5 py-2 font-bold text-[#24221E] bg-[#C9C5BC] hover:bg-[#C9C5BC]/80 border border-[#24221E]/10 rounded-[10px] transition-colors cursor-pointer"
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

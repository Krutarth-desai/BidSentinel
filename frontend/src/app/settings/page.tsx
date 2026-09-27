"use client";

import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  ShieldCheck,
  Bell,
  HardDriveDownload,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Download,
  Save,
  Network
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("risk-ai");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 800);
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-[#24221E] relative overflow-x-clip font-sans selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      <Navbar />
      
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto relative z-10">
        <Sidebar />
        
        <main className="flex-1 px-6 lg:px-10 py-6 min-w-0 flex flex-col gap-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[#24221E] tracking-tight flex items-center gap-3">
                <SettingsIcon className="w-8 h-8 text-[#A4864E]" />
                Platform Settings
              </h1>
              <p className="text-sm text-[#625F57] mt-1">
                Configure AI engine parameters, risk thresholds, integrations, and preferences.
              </p>
            </div>
            
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-[10px] bg-[#24221E] hover:bg-[#36332E] text-[#F5F2EB] font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-2 w-fit"
            >
              {isSaving ? <span className="animate-pulse">Saving...</span> : <Save className="w-4 h-4" />}
              {isSaving ? "Applying" : "Save Changes"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full mt-2">
            
            {/* Left Navigation */}
            <div className="lg:col-span-3 space-y-2">
              {[
                { id: "risk-ai", label: "Risk Scoring & AI", icon: Sliders },
                { id: "connectors", label: "Prototype Connectors", icon: Network },
                { id: "profile", label: "Officer Profile & DSC", icon: User },
                { id: "audit", label: "Audit & Export", icon: HardDriveDownload },
                { id: "notifications", label: "Alerts & Display", icon: Bell },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all text-left ${
                      isActive 
                        ? "bg-[#D8D4CB] text-[#24221E] border border-black/[0.08] shadow-sm" 
                        : "text-[#625F57] hover:bg-[#E3DFD6] hover:text-[#24221E]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#A4864E]" : "text-[#817C72]"}`} />
                    <span className="truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Content Area */}
            <div className="lg:col-span-9">
              <div className="bento-card p-8 h-full bg-[#D8D4CB]">
                
                {/* 1. Risk Scoring Weights & AI */}
                {activeTab === "risk-ai" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b border-black/[0.08] pb-4">
                      <h2 className="text-xl font-bold tracking-tight">Risk Scoring & AI Thresholds</h2>
                      <p className="text-xs text-[#625F57] mt-1">Adjust policy priorities and AI confidence levels for automated decision support.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#A4864E]">Business & Policy Risk Weights</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#E3DFD6] rounded-xl border border-black/[0.05] space-y-3">
                            <div className="flex justify-between items-center text-sm font-semibold">
                              <span>Tax Defaulter (CBDT)</span>
                              <span className="text-[#D95757]">Critical</span>
                            </div>
                            <input type="range" className="w-full accent-[#D95757]" defaultValue="100" />
                            <p className="text-[10px] text-[#817C72]">Automatically flags bidder as high-risk if active tax demand exists.</p>
                          </div>
                          
                          <div className="p-4 bg-[#E3DFD6] rounded-xl border border-black/[0.05] space-y-3">
                            <div className="flex justify-between items-center text-sm font-semibold">
                              <span>MII Local Content &lt; 50%</span>
                              <span className="text-[#D97706]">High</span>
                            </div>
                            <input type="range" className="w-full accent-[#D97706]" defaultValue="75" />
                            <p className="text-[10px] text-[#817C72]">Impacts Class-I supplier eligibility.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-black/[0.05]">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#A4864E]">AI Confidence Thresholds</h3>
                        <div className="p-5 bg-[#C2BDB3]/30 rounded-xl border border-[#24221E]/10 space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold">Auto-Approval OCR Confidence</div>
                              <div className="text-[10px] text-[#625F57] mt-0.5">Minimum AI extraction confidence to mark a document "Verified" without human review.</div>
                            </div>
                            <div className="text-xl font-black text-[#188A5E]">85%</div>
                          </div>
                          <input type="range" className="w-full accent-[#188A5E]" defaultValue="85" />
                          <div className="flex justify-between text-[10px] font-bold text-[#817C72]">
                            <span>Strict (95%)</span>
                            <span>Lenient (70%)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Integrations & Connectors */}
                {activeTab === "connectors" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b border-black/[0.08] pb-4">
                      <h2 className="text-xl font-bold tracking-tight">Integration Hub</h2>
                      <p className="text-xs text-[#625F57] mt-1">Status of statutory API connections. <span className="font-semibold text-[#A4864E]">Prototype Mode — Using Synthetic Datasets.</span></p>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: "GSTN Database (Indirect Tax)", desc: "Statutory API", status: "Active (Mocked)", mock: true },
                        { name: "CBDT Portal (Direct Tax/PAN)", desc: "Statutory API", status: "Active (Mocked)", mock: true },
                        { name: "Udyam Registration (MSME)", desc: "Eligibility API", status: "Active (Mocked)", mock: true },
                        { name: "MCA21 Registry (Directors)", desc: "Corporate API", status: "Active (Mocked)", mock: true },
                        { name: "EPFO/ESIC Compliance", desc: "Labor API", status: "Active (Mocked)", mock: true },
                      ].map((conn, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-4 items-center p-4 bg-[#E3DFD6] rounded-xl border border-black/[0.05]">
                          <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#188A5E] shadow-[0_0_8px_#188A5E]" />
                            <div>
                              <div className="font-bold text-sm text-[#24221E]">{conn.name}</div>
                              <div className="text-[10px] text-[#817C72]">{conn.desc}</div>
                            </div>
                          </div>
                          
                          <div className="col-span-6 sm:col-span-4 flex items-center">
                            {conn.mock && (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#A4864E]/15 text-[#725C3A] uppercase tracking-wider">
                                  Synthetic Data
                                </span>
                                <span className="text-[10px] font-medium text-[#188A5E]">{conn.status}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="col-span-6 sm:col-span-3 flex justify-end">
                            <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-black/[0.08] bg-[#F5F2EB] hover:bg-white text-[#625F57] hover:text-[#24221E] transition-all shadow-sm">
                              Configure
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Officer Profile & DSC */}
                {activeTab === "profile" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b border-black/[0.08] pb-4">
                      <h2 className="text-xl font-bold tracking-tight">Officer Profile & DSC Setup</h2>
                      <p className="text-xs text-[#625F57] mt-1">Manage your procurement credentials and simulated Digital Signature.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-[#817C72] uppercase tracking-wider mb-1">Full Name</label>
                          <input type="text" defaultValue="Dr. Rajeshwar Sharma" className="w-full bg-[#E3DFD6] border border-black/[0.08] rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-[#A4864E]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#817C72] uppercase tracking-wider mb-1">Designation & Dept</label>
                          <input type="text" defaultValue="Senior Procurement Officer, IAS" className="w-full bg-[#E3DFD6] border border-black/[0.08] rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-[#A4864E]" />
                        </div>
                      </div>

                      <div className="p-5 bg-[#C2BDB3]/30 rounded-xl border border-black/[0.08] space-y-4">
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <ShieldCheck className="w-5 h-5 text-[#188A5E]" />
                          Digital Signature (DSC) Setup
                        </div>
                        <p className="text-[10px] text-[#625F57] leading-relaxed">
                          For this prototype, a mock "Sign & Submit" flow is enabled. In production, this integrates with eMudhra/USB tokens for PKI.
                        </p>
                        
                        <div className="p-3 bg-[#188A5E]/10 border border-[#188A5E]/20 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#188A5E]" />
                            <span className="text-xs font-semibold text-[#188A5E]">Mock DSC Enabled</span>
                          </div>
                          <button className="text-[10px] font-bold uppercase text-[#A4864E]">Re-map</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Audit & Export */}
                {activeTab === "audit" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b border-black/[0.08] pb-4">
                      <h2 className="text-xl font-bold tracking-tight">Audit Ledger & Exports</h2>
                      <p className="text-xs text-[#625F57] mt-1">Export verifiable verification records and set retention policies.</p>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-[#E3DFD6] rounded-xl border border-black/[0.05]">
                      <div>
                        <h4 className="font-bold text-sm">Download Monthly Compliance Ledger</h4>
                        <p className="text-xs text-[#817C72] mt-0.5">Exports all AI verifications and officer determinations for Sept 2026.</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white rounded-lg text-xs font-bold border border-black/[0.08] shadow-sm flex items-center gap-1.5 hover:bg-[#F5F2EB]">
                          <Download className="w-3.5 h-3.5" /> CSV
                        </button>
                        <button className="px-4 py-2 bg-white rounded-lg text-xs font-bold border border-black/[0.08] shadow-sm flex items-center gap-1.5 hover:bg-[#F5F2EB]">
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-[#817C72] uppercase tracking-wider mb-2">Log Retention Policy</label>
                      <select className="w-full max-w-xs bg-[#E3DFD6] border border-black/[0.08] rounded-lg p-2.5 text-sm font-semibold focus:outline-none focus:border-[#A4864E]">
                        <option>7 Years (Statutory Default)</option>
                        <option>10 Years</option>
                        <option>Indefinite (Requires Admin)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 5. Notifications & Display */}
                {activeTab === "notifications" && (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="border-b border-black/[0.08] pb-4">
                      <h2 className="text-xl font-bold tracking-tight">Alerts & Display Preferences</h2>
                      <p className="text-xs text-[#625F57] mt-1">Manage what notifications you receive and how data is presented.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-[#24221E]">Critical Alerts</h3>
                        
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#A4864E]" />
                          <div>
                            <div className="text-sm font-semibold">Mid-Evaluation Blacklisting Alert</div>
                            <div className="text-[10px] text-[#625F57]">Notify immediately if a bidder under evaluation is newly blacklisted on GeM.</div>
                          </div>
                        </label>
                        
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input type="checkbox" defaultChecked className="mt-1 accent-[#A4864E]" />
                          <div>
                            <div className="text-sm font-semibold">Tax Default Change</div>
                            <div className="text-[10px] text-[#625F57]">Notify if a bidder's CBDT status changes to Active Demand while a tender is open.</div>
                          </div>
                        </label>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-black/[0.05]">
                        <h3 className="text-sm font-bold text-[#24221E]">Display Preferences</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-[#817C72] uppercase tracking-wider mb-1">Default Date Format</label>
                            <select className="w-full bg-[#E3DFD6] border border-black/[0.08] rounded-lg p-2 text-sm">
                              <option>DD MMM YYYY (26 Sep 2026)</option>
                              <option>MM/DD/YYYY</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-[#817C72] uppercase tracking-wider mb-1">Currency Format</label>
                            <select className="w-full bg-[#E3DFD6] border border-black/[0.08] rounded-lg p-2 text-sm">
                              <option>INR (₹ Lakhs/Crores)</option>
                              <option>INR (₹ Thousands)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

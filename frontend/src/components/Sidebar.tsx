"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  History,
  Network,
  HelpCircle,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tenders", label: "Tender Management", icon: FileSpreadsheet },
    { href: "/bidders", label: "Bidder Registry", icon: Users },
    { href: "/verification", label: "AI Verification Console", icon: ShieldCheck },
    { href: "/audit", label: "Immutable Audit Trail", icon: History },
    { href: "/connectors", label: "Government Connectors", icon: Network },
  ];

  return (
    <aside className="sticky top-24 self-start w-68 shrink-0 flex flex-col justify-between p-4 my-6 ml-6 lg:ml-10 rounded-2xl bg-[#C2BDB3]/90 backdrop-blur-2xl border border-black/[0.08] shadow-[0_4px_20px_-2px_rgba(40,35,25,0.06)] max-h-[calc(100vh-7.5rem)] overflow-y-auto z-30 transition-all">
      <div className="space-y-4">
        {/* Sidebar Brand Logo Block */}
        <div className="pb-3.5 border-b border-black/[0.08]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#1C1A17] border border-[#A4864E]/30 flex items-center justify-center overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
              <img
                src="/bidsentinel-logo.png"
                alt="BidSentinel Icon"
                className="w-[140px] max-w-none h-auto mix-blend-screen shrink-0 -ml-1"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center leading-none">
                <span className="text-lg font-black tracking-tight text-[#24221E]">
                  Bid
                </span>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-[#A4864E] via-[#C2A96D] to-[#725C3A] bg-clip-text text-transparent">
                  Sentinel
                </span>
              </div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#625F57] uppercase truncate mt-1">
                INTELLIGENT TENDER COMPLIANCE
              </p>
            </div>
          </Link>
        </div>

        <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-widest text-[#817C72]">
          Core Navigation
        </div>
        <nav className="space-y-2">
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon className="w-4 h-4 nav-icon shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#A4864E] shadow-[0_0_6px_rgba(164,134,78,0.4)]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* GeM Prototype Notice Panel */}
      <div className="p-3.5 bg-[#D8D4CB] border border-black/[0.08] rounded-[10px] text-xs space-y-1.5 mt-6 shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#A4864E] text-[10px] uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SIH 2026 Prototype</span>
        </div>
        <p className="text-[11px] text-[#625F57] leading-relaxed font-normal">
          AI decision support framework. Final qualification remains with the Procurement Officer.
        </p>
      </div>
    </aside>
  );
}

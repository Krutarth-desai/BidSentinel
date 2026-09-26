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
    <aside className="w-68 shrink-0 flex flex-col justify-between p-4 my-6 ml-6 lg:ml-10 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/[0.10] shadow-[0_4px_30px_rgba(0,0,0,0.6)] min-h-[calc(100vh-8rem)]">
      <div className="space-y-3">
        <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* GeM Prototype Notice Panel */}
      <div className="p-3.5 bg-blue-500/[0.06] border border-blue-500/20 rounded-xl text-xs space-y-1.5 mt-6">
        <div className="flex items-center gap-1.5 font-bold text-blue-400 text-[10px] uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SIH 2026 Prototype</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
          AI decision support framework. Final qualification remains with the Procurement Officer.
        </p>
      </div>
    </aside>
  );
}

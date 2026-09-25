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
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {links.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 text-[11px] uppercase tracking-wide">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>SIH 2026 Prototype</span>
        </div>
        <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
          AI-assisted decision support system. Final qualification remains with the Procurement Officer.
        </p>
      </div>
    </aside>
  );
}

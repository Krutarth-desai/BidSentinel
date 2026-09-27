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
  Settings,
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
    <>
      <aside className="sticky top-24 self-start w-68 shrink-0 flex flex-col justify-between py-2 pr-6 my-6 ml-6 lg:ml-10 bg-transparent max-h-[calc(100vh-7.5rem)] overflow-y-auto custom-scrollbar z-30 transition-all border-r border-black/[0.08]">
      <div className="space-y-4">


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

      <div className="pt-4 border-t border-black/[0.08] mt-4">
        <Link
          href="/settings"
          className={`nav-item ${pathname === "/settings" ? "active" : ""}`}
        >
          <Settings className="w-4 h-4 nav-icon shrink-0" />
          <span className="truncate">Settings & Preferences</span>
        </Link>
      </div>
    </aside>

    </>
  );
}

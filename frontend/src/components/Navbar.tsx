"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Bell, Search, LogOut } from "lucide-react";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-black/70 backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between px-6 lg:px-10 h-20 max-w-[1720px] mx-auto">
        {/* Left: Brand & Badge */}
        <div className="flex items-center gap-5 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3.5 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/30 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-extrabold tracking-tight text-white">
                  BidSentinel
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 uppercase tracking-wider">
                  GEM SIH &apos;26
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                AI Bid Compliance Verification Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 items-center justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenders, bidders, or compliance criteria…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white/[0.06] border border-white/[0.10] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.09] focus:ring-1 focus:ring-blue-500/30 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Notifications & Officer Profile */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notification Button */}
          <button
            type="button"
            className="relative p-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(50,110,255,0.15)] text-slate-400 hover:text-white transition-all duration-200 cursor-pointer"
            title="Notifications (3 active alerts)"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-black animate-pulse" />
          </button>

          {/* Officer Profile Card */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/[0.06] border border-white/[0.10] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-xs tracking-wider">
              RS
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold block text-white leading-tight">
                Dr. Rajeshwar Sharma, IAS
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Senior Procurement Officer
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <Link
            href="/"
            className="p-2.5 text-slate-400 hover:text-red-400 bg-white/[0.06] hover:bg-red-500/15 border border-white/[0.10] hover:border-red-500/35 hover:-translate-y-0.5 rounded-xl transition-all duration-200"
            title="Sign Out / Switch Officer"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

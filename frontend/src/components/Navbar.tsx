"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Shield, Bell, Search, LogOut } from "lucide-react";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/[0.08] bg-[#C9C5BC]/90 backdrop-blur-2xl transition-all">
      <div className="flex items-center justify-between px-6 lg:px-10 h-20 max-w-[1720px] mx-auto">
        {/* Left: Brand & Badge */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#1C1A17] border border-[#A4864E]/30 flex items-center justify-center overflow-hidden shadow-xs group-hover:scale-105 transition-transform duration-200">
              <img
                src="/bidsentinel-logo.png"
                alt="BidSentinel Icon"
                className="w-[140px] max-w-none h-auto mix-blend-screen shrink-0 -ml-1"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="flex items-center leading-none">
                  <span className="text-lg font-black tracking-tight text-[#24221E]">
                    Bid
                  </span>
                  <span className="text-lg font-black tracking-tight bg-gradient-to-r from-[#A4864E] via-[#C2A96D] to-[#725C3A] bg-clip-text text-transparent">
                    Sentinel
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#A4864E]/12 text-[#725C3A] border border-[#A4864E]/25 uppercase tracking-wider shrink-0 hidden sm:inline-block">
                  GEM SIH &apos;26
                </span>
              </div>
              <p className="text-[9px] font-bold tracking-[0.18em] text-[#625F57] uppercase mt-0.5">
                INTELLIGENT TENDER COMPLIANCE
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8 items-center justify-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#817C72]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tenders, bidders, or compliance criteria…"
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-[10px] bg-[#C2BDB3]/60 border border-black/[0.10] text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60 focus:bg-[#D8D4CB] focus:ring-1 focus:ring-[#A4864E]/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Notifications & Officer Profile */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Notification Button */}
          <button
            type="button"
            className="relative p-2.5 rounded-[10px] bg-[#D8D4CB] hover:bg-[#E3DFD6] border border-black/[0.08] hover:border-[#A4864E]/40 hover:-translate-y-0.5 text-[#625F57] hover:text-[#24221E] transition-all duration-200 cursor-pointer shadow-xs"
            title="Notifications (3 active alerts)"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#D8D4CB] animate-pulse" />
          </button>

          {/* Officer Profile Card */}
          <div className="flex items-center gap-3 px-3.5 py-1.5 rounded-[10px] bg-[#D8D4CB] border border-black/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <div className="w-8 h-8 rounded-[8px] bg-[#A4864E]/15 border border-[#A4864E]/30 text-[#A4864E] flex items-center justify-center font-bold text-xs tracking-wider">
              RS
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-semibold block text-[#24221E] leading-tight">
                Dr. Rajeshwar Sharma, IAS
              </span>
              <span className="text-[10px] text-[#625F57] font-medium">
                Senior Procurement Officer
              </span>
            </div>
          </div>

          {/* Sign Out Button */}
          <Link
            href="/"
            className="p-2.5 text-[#625F57] hover:text-red-700 bg-[#D8D4CB] hover:bg-red-500/10 border border-black/[0.08] hover:border-red-500/35 hover:-translate-y-0.5 rounded-[10px] transition-all duration-200"
            title="Sign Out / Switch Officer"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

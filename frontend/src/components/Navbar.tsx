"use client";

import React from "react";
import Link from "next/link";
import { Shield, User, LogOut } from "lucide-react";
import { PrototypeBadge } from "./PrototypeBadge";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs">
      <div className="flex items-center justify-between px-6 h-16">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-700 text-white font-black shadow-xs">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  BidSentinel
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                  GeM SIH &apos;26
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                AI Bid Compliance Verification Platform
              </p>
            </div>
          </Link>

          <div className="hidden lg:block ml-4 pl-4 border-l border-slate-200 dark:border-slate-800">
            <PrototypeBadge />
          </div>
        </div>

        {/* Right Officer Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              RS
            </div>
            <div className="text-left text-xs">
              <span className="font-semibold block text-slate-900 dark:text-slate-100 leading-tight">
                Dr. Rajeshwar Sharma, IAS
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Senior Procurement Officer
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign Out / Switch Officer"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

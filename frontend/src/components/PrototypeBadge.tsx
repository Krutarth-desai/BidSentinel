import React from "react";
import { Sparkles } from "lucide-react";

export function PrototypeBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.08)] backdrop-blur-md">
      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      <span>PROTOTYPE MODE — Synthetic Government Connectors</span>
    </div>
  );
}

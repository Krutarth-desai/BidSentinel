import React from "react";
import { Sparkles } from "lucide-react";

export function PrototypeBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold tracking-wider uppercase bg-[#A4864E]/12 text-[#725C3A] border border-[#A4864E]/25 rounded-xl backdrop-blur-md">
      <Sparkles className="w-3.5 h-3.5 text-[#A4864E]" />
      <span>PROTOTYPE MODE — Synthetic Government Connectors</span>
    </div>
  );
}

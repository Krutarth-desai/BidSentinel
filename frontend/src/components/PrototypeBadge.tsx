import React from "react";
import { AlertCircle } from "lucide-react";

export function PrototypeBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-amber-500/10 text-amber-700 border border-amber-300 rounded-full dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
      <AlertCircle className="w-3.5 h-3.5" />
      <span>PROTOTYPE MODE — Synthetic Government Connectors</span>
    </div>
  );
}

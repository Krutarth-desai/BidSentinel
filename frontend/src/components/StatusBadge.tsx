import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, MinusCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let style = "bg-white/[0.06] text-slate-300 border-white/[0.10]";
  let Icon = HelpCircle;
  let label = status;

  if (
    norm === "COMPLIANT" ||
    norm === "VERIFIED" ||
    norm === "ACTIVE" ||
    norm === "APPROVED" ||
    norm === "LOW"
  ) {
    style =
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
    Icon = CheckCircle2;
    label = norm === "LOW" ? "LOW RISK" : norm;
  } else if (
    norm === "REVIEW_REQUIRED" ||
    norm === "FLAG_REVIEW" ||
    norm === "MEDIUM" ||
    norm === "CLARIFICATION_REQUESTED"
  ) {
    style =
      "bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.1)]";
    Icon = AlertTriangle;
    label = norm === "MEDIUM" ? "MEDIUM RISK" : "REVIEW REQUIRED";
  } else if (
    norm === "NON_COMPLIANT" ||
    norm === "EXPIRED" ||
    norm === "HIGH" ||
    norm === "REJECTED"
  ) {
    style =
      "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
    Icon = XCircle;
    label = norm === "HIGH" ? "HIGH RISK" : norm;
  } else if (norm === "MISSING") {
    style =
      "bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
    Icon = AlertTriangle;
    label = "MISSING";
  } else if (norm === "NOT_APPLICABLE") {
    style = "bg-white/[0.06] text-slate-400 border-white/[0.10]";
    Icon = MinusCircle;
    label = "NOT APPLICABLE";
  }

  const px = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-lg font-medium tracking-wide uppercase backdrop-blur-md ${px} ${style}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span>{label}</span>
    </span>
  );
}

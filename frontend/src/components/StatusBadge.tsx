import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, MinusCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let bg = "bg-slate-100 text-slate-700 border-slate-300";
  let Icon = HelpCircle;
  let label = status;

  if (norm === "COMPLIANT" || norm === "VERIFIED" || norm === "ACTIVE" || norm === "APPROVED" || norm === "LOW") {
    bg = "bg-emerald-50 text-emerald-800 border-emerald-300";
    Icon = CheckCircle2;
    label = norm === "LOW" ? "LOW RISK" : norm;
  } else if (norm === "REVIEW_REQUIRED" || norm === "FLAG_REVIEW" || norm === "MEDIUM" || norm === "CLARIFICATION_REQUESTED") {
    bg = "bg-amber-50 text-amber-850 border-amber-350 text-amber-900";
    Icon = AlertTriangle;
    label = norm === "MEDIUM" ? "MEDIUM RISK" : "REVIEW REQUIRED";
  } else if (norm === "NON_COMPLIANT" || norm === "EXPIRED" || norm === "HIGH" || norm === "REJECTED") {
    bg = "bg-rose-50 text-rose-800 border-rose-300";
    Icon = XCircle;
    label = norm === "HIGH" ? "HIGH RISK" : norm;
  } else if (norm === "MISSING") {
    bg = "bg-red-50 text-red-700 border-red-300";
    Icon = AlertTriangle;
    label = "MISSING";
  } else if (norm === "NOT_APPLICABLE") {
    bg = "bg-slate-100 text-slate-600 border-slate-300";
    Icon = MinusCircle;
    label = "NOT APPLICABLE";
  }

  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span className={`inline-flex items-center gap-1.5 border rounded-md font-medium tracking-wide ${px} ${bg}`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      <span>{label}</span>
    </span>
  );
}

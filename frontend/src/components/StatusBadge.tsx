import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, MinusCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let style = "bg-[#C9C5BC] text-[#625F57] border-[#24221E]/10";
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
      "bg-[#188A5E]/15 text-[#188A5E] border-[#188A5E]/30 shadow-sm";
    Icon = CheckCircle2;
    label = norm === "LOW" ? "LOW RISK" : norm;
  } else if (
    norm === "REVIEW_REQUIRED" ||
    norm === "FLAG_REVIEW" ||
    norm === "MEDIUM" ||
    norm === "CLARIFICATION_REQUESTED"
  ) {
    style =
      "bg-[#D97706]/15 text-[#D97706] border-[#D97706]/30 shadow-sm";
    Icon = AlertTriangle;
    label = norm === "MEDIUM" ? "MEDIUM RISK" : "REVIEW REQUIRED";
  } else if (
    norm === "NON_COMPLIANT" ||
    norm === "EXPIRED" ||
    norm === "HIGH" ||
    norm === "REJECTED"
  ) {
    style =
      "bg-[#D95757]/15 text-[#D95757] border-[#D95757]/30 shadow-sm";
    Icon = XCircle;
    label = norm === "HIGH" ? "HIGH RISK" : norm;
  } else if (norm === "MISSING") {
    style =
      "bg-[#D95757]/15 text-[#D95757] border-[#D95757]/30 shadow-sm";
    Icon = AlertTriangle;
    label = "MISSING";
  } else if (norm === "NOT_APPLICABLE") {
    style = "bg-[#C9C5BC] text-[#625F57] border-[#24221E]/10";
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

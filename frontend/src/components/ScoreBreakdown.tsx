import React from "react";
import { ScoreBreakdown as ScoreBreakdownType } from "@/lib/types";
import { Award, Shield, FileCheck, Landmark } from "lucide-react";

interface ScoreBreakdownProps {
  score: ScoreBreakdownType;
}

export function ScoreBreakdown({ score }: ScoreBreakdownProps) {
  const items = [
    {
      label: "Statutory Compliance",
      value: score.statutory,
      max: score.statutory_max,
      icon: Shield,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40",
      barColor: "bg-blue-600",
    },
    {
      label: "Tender-Specific Criteria",
      value: score.tender_specific,
      max: score.tender_specific_max,
      icon: Award,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40",
      barColor: "bg-purple-600",
    },
    {
      label: "Document Verification",
      value: score.document_verification,
      max: score.document_verification_max,
      icon: FileCheck,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
      barColor: "bg-emerald-600",
    },
    {
      label: "Government Data Match",
      value: score.govt_verification,
      max: score.govt_verification_max,
      icon: Landmark,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
      barColor: "bg-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = Math.round((item.value / item.max) * 100);

        return (
          <div
            key={item.label}
            className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-md ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {item.value}
                <span className="text-xs text-slate-400 font-normal"> / {item.max}</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">{pct}%</span>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(100, Math.max(5, pct))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

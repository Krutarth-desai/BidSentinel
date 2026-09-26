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
      color: "text-blue-400 bg-blue-500/10 border border-blue-500/20",
      barColor: "bg-blue-500 shadow-[0_0_8px_#3b82f6]",
    },
    {
      label: "Tender-Specific Criteria",
      value: score.tender_specific,
      max: score.tender_specific_max,
      icon: Award,
      color: "text-purple-400 bg-purple-500/10 border border-purple-500/20",
      barColor: "bg-purple-500 shadow-[0_0_8px_#a855f7]",
    },
    {
      label: "Document Verification",
      value: score.document_verification,
      max: score.document_verification_max,
      icon: FileCheck,
      color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20",
      barColor: "bg-emerald-500 shadow-[0_0_8px_#10b981]",
    },
    {
      label: "Government Data Match",
      value: score.govt_verification,
      max: score.govt_verification_max,
      icon: Landmark,
      color: "text-amber-400 bg-amber-500/10 border border-amber-500/20",
      barColor: "bg-amber-500 shadow-[0_0_8px_#f59e0b]",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-5">
      {items.map((item) => {
        const Icon = item.icon;
        const pct = Math.round((item.value / item.max) * 100);

        return (
          <div
            key={item.label}
            className="p-4 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.10] hover:border-blue-400/30 rounded-xl space-y-2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_15px_rgba(50,110,255,0.12)] transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-lg ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-white">
                {item.value}
                <span className="text-xs text-slate-500 font-normal"> / {item.max}</span>
              </span>
              <span className="text-xs font-bold text-slate-300">{pct}%</span>
            </div>

            <div className="w-full bg-white/[0.10] h-1.5 rounded-full overflow-hidden">
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

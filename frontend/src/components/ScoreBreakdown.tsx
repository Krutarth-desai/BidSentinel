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
      max: 25,
      icon: Shield,
      color: "text-[#A4864E] bg-[#A4864E]/15 border border-[#A4864E]/30",
      barColor: "bg-[#A4864E]",
    },
    {
      label: "Tender-Specific Criteria",
      value: score.tender_specific,
      max: 30,
      icon: Award,
      color: "text-[#A4864E] bg-[#A4864E]/15 border border-[#A4864E]/30",
      barColor: "bg-[#A4864E]",
    },
    {
      label: "Document Verification",
      value: score.document_verification,
      max: 25,
      icon: FileCheck,
      color: "text-[#188A5E] bg-[#188A5E]/15 border border-[#188A5E]/30",
      barColor: "bg-[#188A5E]",
    },
    {
      label: "Government Data Match",
      value: score.govt_verification,
      max: 20,
      icon: Landmark,
      color: "text-[#D97706] bg-[#D97706]/15 border border-[#D97706]/30",
      barColor: "bg-[#D97706]",
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
            className="p-4 bg-[#C9C5BC]/60 hover:bg-[#C9C5BC] border border-[#24221E]/10 hover:border-[#A4864E]/30 rounded-xl space-y-2 hover:-translate-y-0.5 shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#625F57] uppercase tracking-wider truncate">
                {item.label}
              </span>
              <div className={`p-1.5 rounded-lg ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#24221E] tracking-tight">
                {item.value}
                <span className="text-sm text-[#625F57] font-semibold tracking-normal"> / {item.max}</span>
              </span>
              <span className="text-xs font-bold text-[#24221E] bg-black/5 px-2 py-0.5 rounded-md">{pct}%</span>
            </div>

            <div className="w-full bg-[#C9C5BC] h-1.5 rounded-full overflow-hidden">
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

"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

interface VerificationStepperProps {
  isRunning: boolean;
  onComplete: () => void;
}

const STEPS = [
  "Analyzing tender specifications",
  "Extracting compliance requirements",
  "Classifying submitted documents",
  "Extracting structured fields via OCR",
  "Querying mock government connector registries",
  "Cross-validating entities & statutory bindings",
  "Applying deterministic procurement rules",
  "Computing dimensional compliance score & risk",
  "Synthesizing AI findings & officer advisory",
];

export function VerificationStepper({ isRunning, onComplete }: VerificationStepperProps) {
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    if (!isRunning) {
      setCurrentStep(0);
      return;
    }

    let step = 0;
    // Fast cadence: total ~2.2 seconds for live SIH demonstration
    const interval = setInterval(() => {
      step += 1;
      if (step < STEPS.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 240);

    return () => clearInterval(interval);
  }, [isRunning, onComplete]);

  if (!isRunning) return null;

  return (
    <div className="p-6 bg-white/[0.06] backdrop-blur-2xl border border-blue-500/35 rounded-[20px] my-6 shadow-[0_4px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(59,130,246,0.15)] animate-in fade-in duration-200">
      <div className="flex items-center gap-2.5 mb-4">
        <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">
          AI Multi-Stage Verification Pipeline Running...
        </h4>
      </div>

      <div className="space-y-2 text-xs font-mono">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={stepText}
              className={`flex items-center justify-between py-1 transition-colors ${
                isDone
                  ? "text-emerald-400 font-semibold"
                  : isCurrent
                  ? "text-blue-300 font-bold"
                  : "text-slate-500"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-white/[0.12] inline-block shrink-0" />
                )}
                <span>{stepText}</span>
              </div>
              <span className="text-[11px] font-bold">
                {isDone ? "✓" : isCurrent ? "..." : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

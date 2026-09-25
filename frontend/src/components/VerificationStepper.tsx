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
  "Synthesizing AI findings & officer advisory"
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
    <div className="p-5 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl my-4 animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-200">
          AI Multi-Stage Verification Pipeline Running...
        </h4>
      </div>

      <div className="space-y-1.5 text-xs font-mono">
        {STEPS.map((stepText, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={stepText}
              className={`flex items-center justify-between py-0.5 transition-colors ${
                isDone
                  ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                  : isCurrent
                  ? "text-blue-700 dark:text-blue-300 font-bold"
                  : "text-slate-400 dark:text-slate-600"
              }`}
            >
              <div className="flex items-center gap-2">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 inline-block shrink-0" />
                )}
                <span>{stepText}</span>
              </div>
              <span className="text-[11px]">
                {isDone ? "✓" : isCurrent ? "..." : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

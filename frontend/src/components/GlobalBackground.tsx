"use client";

import React from "react";
import { usePathname } from "next/navigation";

export function GlobalBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#C9C5BC]"
      aria-hidden="true"
    >
      {/* Base B2 Warm Greige Foundation (#C9C5BC) */}
      <div className="absolute inset-0 bg-[#C9C5BC] transition-colors duration-1000" />

      {/* Broad Soft Ambient Architectural Lighting */}
      <div className="ambient-light-primary absolute rounded-full pointer-events-none opacity-25 blur-[200px] transition-all duration-1000" />
      <div className="ambient-light-secondary absolute rounded-full pointer-events-none opacity-20 blur-[220px] transition-all duration-1000" />

      {/* Structural Surface Grid (Subtle Texture) */}
      <div className="absolute inset-0 opacity-[0.025] pointer-events-none">
        <svg className="w-full h-full" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="verification-network-grid"
              width="140"
              height="140"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 140 0 L 0 0 0 140"
                fill="none"
                stroke="rgba(36, 34, 30, 0.4)"
                strokeWidth="0.75"
                strokeDasharray="2, 8"
              />
              <circle cx="140" cy="0" r="2" fill="rgba(164, 134, 78, 0.4)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#verification-network-grid)" />
        </svg>
      </div>

      {/* Architectural Surface Depth Texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(rgba(36,34,30,0.30)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
    </div>
  );
}

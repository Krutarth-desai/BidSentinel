"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, User, ArrowRight, CheckCircle2, Sparkles, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { PrototypeBadge } from "@/components/PrototypeBadge";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("officer@gem-demo.gov.in");
  const [password, setPassword] = useState("demo123");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login(username, password);
      if (res.access_token) {
        localStorage.setItem("bidsentinel_token", res.access_token);
        localStorage.setItem("bidsentinel_user", JSON.stringify(res.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Use demo account.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = () => {
    setUsername("officer@gem-demo.gov.in");
    setPassword("demo123");
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-transparent text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E]">
      {/* Top Header */}
      <header className="border-b border-black/[0.08] bg-[#C9C5BC]/90 backdrop-blur-2xl px-6 lg:px-10 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 shrink-0 rounded-[10px] bg-[#1C1A17] border border-[#A4864E]/30 flex items-center justify-center overflow-hidden shadow-xs">
            <img
              src="/finalogo.png"
              alt="BidSentinel Icon"
              className="w-full h-full object-cover mix-blend-screen"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="flex items-center leading-none">
                <span className="text-lg font-black tracking-tight text-[#24221E]">
                  Bid
                </span>
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-[#A4864E] via-[#C2A96D] to-[#725C3A] bg-clip-text text-transparent">
                  Sentinel
                </span>
              </div>

            </div>
            <p className="text-[9px] font-bold tracking-[0.18em] text-[#625F57] uppercase mt-0.5">
              INTELLIGENT TENDER COMPLIANCE
            </p>
          </div>
        </Link>

        <PrototypeBadge />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="relative w-full max-w-md bento-card bento-glow-gold p-8 shadow-[0_8px_30px_rgba(40,35,25,0.10)]">
          <div className="text-center mb-7">
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-[14px] bg-[#1C1A17] border border-[#A4864E]/30 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src="/finalogo.png"
                  alt="BidSentinel Icon"
                  className="w-full h-full object-cover mix-blend-screen"
                />
              </div>
            </div>
            <div className="flex items-center justify-center leading-none mb-1">
              <span className="text-2xl font-black tracking-tight text-[#24221E]">
                Bid
              </span>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-[#A4864E] via-[#C2A96D] to-[#725C3A] bg-clip-text text-transparent">
                Sentinel
              </span>
            </div>
            <p className="text-[9px] font-bold tracking-[0.2em] text-[#625F57] uppercase mb-3">
              INTELLIGENT TENDER COMPLIANCE
            </p>
            <h1 className="text-xl font-extrabold text-[#24221E] tracking-tight">
              Procurement Officer Portal
            </h1>
            <p className="text-xs text-[#625F57] mt-0.5 font-normal leading-relaxed">
              AI-Powered Integrated Bid Compliance &amp; Statutory Verification
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-widest mb-1.5">
                Official GeM Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#817C72]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[10px] border border-black/[0.10] bg-[#C2BDB3]/60 text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60 focus:bg-[#D8D4CB] focus:ring-1 focus:ring-[#A4864E]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold text-[#625F57] uppercase tracking-widest mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#817C72]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-[10px] border border-black/[0.10] bg-[#C2BDB3]/60 text-[#24221E] placeholder-[#817C72] focus:outline-none focus:border-[#A4864E]/60 focus:bg-[#D8D4CB] focus:ring-1 focus:ring-[#A4864E]/20 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/25 text-red-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-[10px] bg-gradient-to-r from-[#A4864E] to-[#725C3A] hover:from-[#B8985C] hover:to-[#856C46] text-[#F1EEE6] font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_2px_12px_rgba(164,134,78,0.25)] border border-[#C2A96D]/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? "Authenticating..." : "Secure Officer Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2.5 px-3 rounded-[10px] border border-black/[0.10] hover:border-black/[0.18] bg-[#D8D4CB] hover:bg-[#E3DFD6] text-[#24221E] text-xs font-semibold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A4864E]" />
              <span>Auto-Fill Demo Credentials</span>
            </button>
          </form>

          {/* Demo Info Box */}
          <div className="mt-6 pt-5 border-t border-black/[0.08] text-xs text-[#625F57] space-y-1.5">
            <div className="font-semibold text-[#24221E] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>SIH 2026 Evaluation Credentials</span>
            </div>
            <p className="font-mono text-[11px] text-[#625F57]">
              Username: <code className="text-[#725C3A] bg-black/[0.04] px-1.5 py-0.5 rounded border border-black/[0.08]">officer@gem-demo.gov.in</code>
            </p>
            <p className="font-mono text-[11px] text-[#625F57]">
              Password: <code className="text-[#725C3A] bg-black/[0.04] px-1.5 py-0.5 rounded border border-black/[0.08]">demo123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/[0.08] px-6 py-4 text-center text-[11px] text-[#817C72] font-normal">
        AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement • SIH 2026 Prototype
      </footer>
    </div>
  );
}

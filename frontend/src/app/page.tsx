"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="min-h-screen flex flex-col justify-between bg-black text-white selection:bg-blue-600/30 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/[0.08] bg-black/70 backdrop-blur-xl px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">BidSentinel</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25 uppercase tracking-wider">
                GEM SIH &apos;26
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Government e-Marketplace Decision Support</p>
          </div>
        </div>

        <PrototypeBadge />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-white/[0.06] border border-white/[0.10] rounded-[22px] shadow-[0_8px_40px_rgba(0,0,0,0.7)] p-8 backdrop-blur-2xl">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-13 h-13 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-[0_0_20px_rgba(59,130,246,0.15)] mb-3.5">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Procurement Officer Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-normal leading-relaxed">
              AI-Powered Integrated Bid Compliance &amp; Statutory Verification
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Official GeM Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-white/[0.10] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-white/[0.10] bg-white/[0.04] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] border border-blue-400/40 hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>{isLoading ? "Authenticating..." : "Secure Officer Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2.5 px-3 rounded-xl border border-white/[0.08] hover:border-white/[0.15] bg-white/[0.03] hover:bg-white/[0.07] text-slate-400 hover:text-white text-xs font-semibold hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto-Fill Demo Credentials</span>
            </button>
          </form>

          {/* Demo Info Box */}
          <div className="mt-6 pt-5 border-t border-white/[0.08] text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SIH 2026 Evaluation Credentials</span>
            </div>
            <p className="font-mono text-[11px] text-slate-300">
              Username: <code className="text-blue-400 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">officer@gem-demo.gov.in</code>
            </p>
            <p className="font-mono text-[11px] text-slate-300">
              Password: <code className="text-blue-400 bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">demo123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] px-6 py-4 text-center text-[11px] text-slate-500 font-normal">
        AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement • SIH 2026 Prototype
      </footer>
    </div>
  );
}

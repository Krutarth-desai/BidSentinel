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
    <div className="min-h-screen flex flex-col justify-between bg-slate-900 text-slate-100">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-black shadow-xs">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">BidSentinel</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900 text-blue-200 uppercase">
                GeM SIH &apos;26
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Government e-Marketplace Decision Support</p>
          </div>
        </div>

        <PrototypeBadge />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-8 backdrop-blur-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Procurement Officer Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              AI-Powered Integrated Bid Compliance & Statutory Verification
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Official GeM Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-900/80 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-red-300 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? "Authenticating..." : "Secure Officer Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleAutofill}
              className="w-full py-2 px-3 rounded-lg border border-slate-700 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Auto-Fill Demo Credentials</span>
            </button>
          </form>

          {/* Demo Info Box */}
          <div className="mt-6 pt-5 border-t border-slate-700/60 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SIH 2026 Evaluation Credentials</span>
            </div>
            <p className="font-mono text-[11px] text-slate-300">
              Username: <code className="text-blue-400">officer@gem-demo.gov.in</code>
            </p>
            <p className="font-mono text-[11px] text-slate-300">
              Password: <code className="text-blue-400">demo123</code>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-3 text-center text-[11px] text-slate-500">
        AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement • SIH 2026 Prototype
      </footer>
    </div>
  );
}

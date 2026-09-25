import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BidSentinel — AI-Powered GeM Bid Compliance Verification Platform",
  description: "AI-assisted bid compliance, statutory verification, and risk evaluation platform for GeM Procurement Officers (SIH 2026).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}

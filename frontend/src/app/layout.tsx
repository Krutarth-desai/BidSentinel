import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalBackground } from "@/components/GlobalBackground";

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
    <html lang="en" className="h-full bg-[#B6B1A6]">
      <body className={`${inter.className} min-h-full bg-[#B6B1A6] text-[#24221E] selection:bg-[#A4864E]/20 selection:text-[#24221E] flex flex-col antialiased relative`}>
        <GlobalBackground />
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}

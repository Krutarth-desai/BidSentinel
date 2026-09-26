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
    <html lang="en" className="dark h-full bg-black">
      <body className={`${inter.className} min-h-full bg-black text-white selection:bg-blue-600/30 selection:text-white flex flex-col antialiased`}>
        {children}
      </body>
    </html>
  );
}

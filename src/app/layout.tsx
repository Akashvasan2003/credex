import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { readEnv } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const appUrl = readEnv("NEXT_PUBLIC_APP_URL") ?? "https://spendlens.ai";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "SpendLens - AI Spend Audit for Startups",
    template: "%s | SpendLens",
  },
  description:
    "Audit your AI tool spending in 3 minutes. Get specific, defensible recommendations with real savings numbers. Free forever.",
  keywords: ["AI spend", "AI tools audit", "startup costs", "Cursor", "GitHub Copilot", "Claude", "ChatGPT"],
  authors: [{ name: "Credex" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: "SpendLens",
    title: "SpendLens - AI Spend Audit for Startups",
    description: "Find out how much you're overpaying for AI tools. Free audit in 3 minutes.",
    images: [
      {
        url: `${appUrl}/og-default.png`,
        width: 1200,
        height: 630,
        alt: "SpendLens AI Spend Audit",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SpendLens - AI Spend Audit for Startups",
    description: "Find out how much you're overpaying for AI tools. Free audit in 3 minutes.",
    images: [`${appUrl}/og-default.png`],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#080808] text-white">{children}</body>
    </html>
  );
}

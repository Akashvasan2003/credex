"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Share2,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeadCaptureModal } from "@/features/results/LeadCaptureModal";
import { formatCurrency } from "@/utils/format";
import type { AuditResult, ToolRecommendation } from "@/types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

function ConfidenceBadge({ confidence }: { confidence: ToolRecommendation["confidence"] }) {
  const map = {
    high: { label: "High confidence", variant: "success" as const },
    medium: { label: "Medium confidence", variant: "warning" as const },
    low: { label: "Low confidence", variant: "default" as const },
  };
  const { label, variant } = map[confidence];
  return <Badge variant={variant}>{label}</Badge>;
}

function SavingsBar({ current, recommended, max }: { current: number; recommended: number; max: number }) {
  const currentPct = max > 0 ? (current / max) * 100 : 0;
  const recPct = max > 0 ? (recommended / max) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-white/40">
        <span>Current</span>
        <span>Recommended</span>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${currentPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute h-full bg-red-500/60 rounded-full"
        />
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${recPct}%` }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="absolute h-full bg-emerald-500/60 rounded-full"
        />
      </div>
    </div>
  );
}

function RecommendationCard({ rec, index, maxSpend }: { rec: ToolRecommendation; index: number; maxSpend: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      custom={index}
      variants={fadeUp}
      className={`rounded-2xl border p-6 transition-all duration-300 ${
        rec.isOptimized
          ? "border-white/5 bg-[#0d0d0d]"
          : "border-emerald-500/15 bg-emerald-950/10 hover:border-emerald-500/25"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white">{rec.toolName}</h3>
            {rec.isOptimized ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-white/40">
            <span>{rec.currentPlan}</span>
            {!rec.isOptimized && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-emerald-400">{rec.recommendedPlan}</span>
                {rec.recommendedVendor !== rec.toolName && (
                  <Badge variant="info">{rec.recommendedVendor}</Badge>
                )}
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          {rec.isOptimized ? (
            <Badge variant="success">Optimized</Badge>
          ) : (
            <div>
              <div className="text-lg font-bold text-emerald-400">
                {formatCurrency(rec.monthlySavings)}/mo
              </div>
              <div className="text-xs text-white/30">{formatCurrency(rec.annualSavings)}/yr</div>
            </div>
          )}
        </div>
      </div>

      {!rec.isOptimized && (
        <SavingsBar
          current={rec.currentSpend}
          recommended={rec.recommendedSpend}
          max={maxSpend}
        />
      )}

      <p className="text-sm text-white/50 leading-relaxed mt-4">{rec.reason}</p>

      <div className="mt-3">
        <ConfidenceBadge confidence={rec.confidence} />
      </div>
    </motion.div>
  );
}

interface ResultsPageProps {
  audit: AuditResult;
  isShared?: boolean;
}

export default function ResultsPage({ audit, isShared = false }: ResultsPageProps) {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const maxSpend = Math.max(...audit.recommendations.map((r) => r.currentSpend), 1);
  const hasSavings = audit.totalMonthlySavings > 0;
  const showCredex = audit.totalAnnualSavings >= 500;

  async function handleShare() {
    const url = `${window.location.origin}/share/${audit.shareSlug || audit.id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const optimizedCount = audit.recommendations.filter((r) => r.isOptimized).length;
  const savingsCount = audit.recommendations.filter((r) => !r.isOptimized).length;

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-4xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">SpendLens</span>
          </Link>
          <div className="flex items-center gap-2">
            {!isShared && (
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Share"}
              </Button>
            )}
            {!isShared && (
              <Button size="sm" onClick={() => setShowLeadModal(true)}>
                Get Report <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12 space-y-8">
        {/* Hero savings */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative rounded-3xl overflow-hidden border border-white/8"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/60 via-[#0d0d0d] to-violet-950/40" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-600/10 rounded-full blur-[80px]" />

          <div className="relative p-8 sm:p-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Audit Complete</span>
            </div>

            {hasSavings ? (
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2">
                  <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-2">
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                    >
                      {formatCurrency(audit.totalAnnualSavings)}
                    </motion.span>
                  </div>
                  <p className="text-white/50 text-lg">potential annual savings identified</p>
                  <p className="text-white/30 text-sm mt-1">
                    {formatCurrency(audit.totalMonthlySavings)}/month · from {savingsCount} optimization{savingsCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-white/5 p-4">
                    <div className="text-2xl font-bold text-white">{formatCurrency(audit.totalMonthlySpend)}</div>
                    <div className="text-xs text-white/40 mt-0.5">current monthly spend</div>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/15 p-4">
                    <div className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(audit.totalMonthlySpend - audit.totalMonthlySavings)}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">optimized monthly spend</div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div className="text-3xl font-bold text-white">You&apos;re spending well.</div>
                </div>
                <p className="text-white/40 text-lg">
                  Your AI stack of {formatCurrency(audit.totalMonthlySpend)}/mo is well-optimized.
                  No significant savings identified with current pricing.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Summary */}
        {audit.aiSummary && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="rounded-2xl border border-indigo-500/15 bg-indigo-950/10 p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">AI Analysis</span>
            </div>
            <p className="text-white/70 leading-relaxed">{audit.aiSummary}</p>
          </motion.div>
        )}

        {/* Summary stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Tools audited", value: audit.recommendations.length },
            { label: "Optimized", value: optimizedCount, color: "text-emerald-400" },
            { label: "Improvements found", value: savingsCount, color: savingsCount > 0 ? "text-amber-400" : "text-white" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/5 bg-[#0d0d0d] p-4 text-center">
              <div className={`text-2xl font-bold ${stat.color ?? "text-white"}`}>{stat.value}</div>
              <div className="text-xs text-white/30 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Recommendations</h2>
          {audit.recommendations.map((rec, i) => (
            <RecommendationCard key={rec.toolId} rec={rec} index={i} maxSpend={maxSpend} />
          ))}
        </div>

        {/* Credex CTA — shown when savings >= $500/yr */}
        {showCredex && !isShared && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={audit.recommendations.length + 1}
            variants={fadeUp}
            className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/50 to-violet-950/30 p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white text-lg mb-2">
                  Want help implementing these savings?
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-4">
                  You&apos;ve identified {formatCurrency(audit.totalAnnualSavings)}/year in savings.
                  Credex helps startups optimize their AI spend and negotiate better contracts.
                  Book a free 20-minute call.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="mailto:hello@credex.ai?subject=AI Spend Optimization"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-sm font-medium transition-colors"
                  >
                    Book Free Call <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <Button variant="outline" size="sm" onClick={() => setShowLeadModal(true)}>
                    Get Full Report
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Honest messaging for small savings */}
        {!hasSavings && !isShared && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="rounded-2xl border border-white/5 bg-[#0d0d0d] p-6 text-center"
          >
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-2">Your stack is well-optimized</h3>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              No significant savings found at current usage levels. Revisit this audit as your team grows &mdash; pricing tiers shift frequently.
            </p>
          </motion.div>
        )}

        {/* Share CTA */}
        {!isShared && audit.shareSlug && (
          <motion.div
            initial="hidden"
            animate="visible"
            custom={audit.recommendations.length + 2}
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0d0d0d] p-6"
          >
            <div>
              <h3 className="font-medium text-white mb-1">Share your audit</h3>
              <p className="text-sm text-white/40">Share a public link with your team or CFO. Email and company info is removed.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-3.5 h-3.5" />
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Link href={`/share/${audit.shareSlug}`} target="_blank">
                <Button variant="ghost" size="sm">
                  Preview <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {/* New audit */}
        <div className="text-center pt-4">
          <Link href="/audit">
            <Button variant="ghost" size="sm">
              ← Start a new audit
            </Button>
          </Link>
        </div>
      </div>

      {showLeadModal && (
        <LeadCaptureModal
          audit={audit}
          onClose={() => setShowLeadModal(false)}
        />
      )}
    </div>
  );
}

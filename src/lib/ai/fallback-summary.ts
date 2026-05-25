import type { AuditResult } from "@/types";
import { formatCurrency } from "@/utils/format";

export function buildFallbackSummary(audit: AuditResult): string {
  if (audit.totalMonthlySavings > 0) {
    const topSaving = [...audit.recommendations].sort((a, b) => b.monthlySavings - a.monthlySavings)[0];
    return `Your team is spending ${formatCurrency(audit.totalMonthlySpend)}/month on AI tools with ${formatCurrency(audit.totalMonthlySavings)}/month in identified savings and ${formatCurrency(audit.totalAnnualSavings)} annually. The biggest opportunity is optimizing your ${topSaving?.toolName ?? "current"} plan. Review the recommendations below and implement the highest-confidence changes first to capture savings without disrupting your workflow.`;
  }

  return `Your team is spending ${formatCurrency(audit.totalMonthlySpend)}/month on AI tools and your stack looks well-optimized. You're making smart choices with your current plans. As your team grows, revisit this audit because pricing tiers and alternatives shift frequently in the AI space.`;
}

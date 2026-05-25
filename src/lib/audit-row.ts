import type { AuditResult } from "@/types";

export interface AuditRow {
  id: string;
  share_slug: string;
  input: AuditResult["input"];
  recommendations: AuditResult["recommendations"];
  total_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  created_at: string;
}

export function mapAuditRowToResult(auditRow: AuditRow): AuditResult {
  return {
    id: auditRow.id,
    input: auditRow.input,
    recommendations: auditRow.recommendations,
    totalMonthlySpend: auditRow.total_monthly_spend,
    totalMonthlySavings: auditRow.total_monthly_savings,
    totalAnnualSavings: auditRow.total_annual_savings,
    aiSummary: auditRow.ai_summary ?? undefined,
    createdAt: auditRow.created_at,
    shareSlug: auditRow.share_slug,
  };
}

export function mapAuditResultToRow(audit: AuditResult): AuditRow {
  return {
    id: audit.id,
    share_slug: audit.shareSlug ?? audit.id,
    input: audit.input,
    recommendations: audit.recommendations,
    total_monthly_spend: audit.totalMonthlySpend,
    total_monthly_savings: audit.totalMonthlySavings,
    total_annual_savings: audit.totalAnnualSavings,
    ai_summary: audit.aiSummary ?? null,
    created_at: audit.createdAt,
  };
}

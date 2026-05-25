"use server";

import { z } from "zod";
import { generateAISummary } from "@/lib/ai/summary";
import { sendAuditEmail } from "@/lib/email/audit-email";
import {
  getAuditRowById,
  getAuditRowBySlug,
  hasSupabaseServerConfig,
  insertAuditRow,
  insertLeadRow,
  countRecentLeadsByEmail,
  type AuditRow,
} from "@/lib/supabase/server";
import { runAudit } from "@/features/audit/engine";
import type { AuditInput, AuditResult, LeadCapture } from "@/types";
import { nanoid } from "@/utils/nanoid";

const LeadSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  teamSize: z.number().int().min(1).max(100000),
  auditId: z.string().min(1),
  honeypot: z.string().max(0, "Bot detected"),
});

function mapAuditRowToResult(auditRow: AuditRow): AuditResult {
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

export async function submitAudit(input: AuditInput): Promise<AuditResult> {
  const result = runAudit(input);
  const shareSlug = nanoid(8);
  result.shareSlug = shareSlug;

  result.aiSummary = await generateAISummary(result);

  if (!hasSupabaseServerConfig()) {
    throw new Error("Supabase is not configured on the server.");
  }

  const { error } = await insertAuditRow({
    id: result.id,
    share_slug: shareSlug,
    input: result.input,
    recommendations: result.recommendations,
    total_monthly_spend: result.totalMonthlySpend,
    total_monthly_savings: result.totalMonthlySavings,
    total_annual_savings: result.totalAnnualSavings,
    ai_summary: result.aiSummary ?? null,
    created_at: result.createdAt,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error("We couldn't save your audit. Please try again.");
  }

  return result;
}

export async function captureLead(
  data: LeadCapture & { honeypot?: string }
): Promise<{ success: boolean; error?: string }> {
  const parsed = LeadSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { email, company, role, teamSize, auditId } = parsed.data;

  if (!hasSupabaseServerConfig()) {
    return { success: false, error: "Supabase is not configured on the server." };
  }

  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count, error: rateLimitError } = await countRecentLeadsByEmail(email, oneHourAgo);

  if (rateLimitError) {
    console.error("Lead rate limit check failed:", rateLimitError);
    return { success: false, error: "We couldn't verify your request. Please try again." };
  }

  if (count >= 3) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  const { error: insertLeadError } = await insertLeadRow({
    email,
    company,
    role,
    team_size: teamSize,
    audit_id: auditId,
    created_at: new Date().toISOString(),
  });

  if (insertLeadError) {
    console.error("Lead insert failed:", insertLeadError);
    return { success: false, error: "We couldn't save your details. Please try again." };
  }

  const { data: auditRow, error: auditFetchError } = await getAuditRowById(auditId);

  if (auditFetchError) {
    console.error("Audit fetch failed:", auditFetchError);
    return {
      success: false,
      error: "We couldn't load your audit details for the email. Please rerun the audit.",
    };
  }

  const auditForEmail = auditRow ? mapAuditRowToResult(auditRow) : null;

  if (!auditForEmail) {
    return {
      success: false,
      error: "We couldn't load your audit details for the email. Please rerun the audit.",
    };
  }

  return sendAuditEmail({ email, company, role, teamSize, auditId }, auditForEmail);
}

export async function getAuditBySlug(slug: string): Promise<AuditResult | null> {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  const { data, error } = await getAuditRowBySlug(slug);

  if (error) {
    console.error("Audit share lookup failed:", error);
  }

  if (!data) return null;

  return mapAuditRowToResult(data);
}

export async function getAuditById(id: string): Promise<AuditResult | null> {
  if (!hasSupabaseServerConfig()) {
    return null;
  }

  const { data, error } = await getAuditRowById(id);

  if (error) {
    console.error("Audit lookup failed:", error);
  }

  if (!data) return null;

  return mapAuditRowToResult(data);
}

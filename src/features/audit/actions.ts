"use server";

import { z } from "zod";
import { generateAISummary } from "@/lib/ai/summary";
import { sendAuditEmail } from "@/lib/email/audit-email";
import { supabaseAdmin } from "@/lib/supabase/server";
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

function mapAuditRowToResult(auditRow: {
  id: string;
  input: AuditResult["input"];
  recommendations: AuditResult["recommendations"];
  total_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  created_at: string;
  share_slug: string;
}): AuditResult {
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

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await supabaseAdmin.from("audits").insert({
      id: result.id,
      share_slug: shareSlug,
      input: result.input,
      recommendations: result.recommendations,
      total_monthly_spend: result.totalMonthlySpend,
      total_monthly_savings: result.totalMonthlySavings,
      total_annual_savings: result.totalAnnualSavings,
      ai_summary: result.aiSummary,
      created_at: result.createdAt,
    });

    if (error) {
      console.error("Supabase insert error:", error.message);
    }
  }

  return result;
}

export async function captureLead(
  data: LeadCapture & { honeypot?: string; auditSnapshot?: AuditResult }
): Promise<{ success: boolean; error?: string }> {
  const parsed = LeadSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message };
  }

  const { email, company, role, teamSize, auditId } = parsed.data;
  const auditSnapshot = data.auditSnapshot;
  const hasSupabase =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (hasSupabase) {
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count, error: rateLimitError } = await supabaseAdmin
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (rateLimitError) {
      console.error("Lead rate limit check failed:", rateLimitError.message);
      return { success: false, error: "We couldn't verify your request. Please try again." };
    }

    if ((count ?? 0) >= 3) {
      return { success: false, error: "Too many requests. Please try again later." };
    }

    const { error: insertLeadError } = await supabaseAdmin.from("leads").insert({
      email,
      company,
      role,
      team_size: teamSize,
      audit_id: auditId,
      created_at: new Date().toISOString(),
    });

    if (insertLeadError) {
      console.error("Lead insert failed:", insertLeadError.message);
      return { success: false, error: "We couldn't save your request. Please try again." };
    }
  }

  let auditForEmail: AuditResult | null = auditSnapshot ?? null;

  if (!auditForEmail && hasSupabase) {
    const { data: auditRow, error: auditFetchError } = await supabaseAdmin
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditFetchError) {
      console.error("Audit fetch failed:", auditFetchError.message);
    } else if (auditRow) {
      auditForEmail = mapAuditRowToResult(auditRow);
    }
  }

  if (!auditForEmail) {
    return {
      success: false,
      error: "We couldn't load your audit details for the email. Please rerun the audit.",
    };
  }

  return sendAuditEmail({ email, company, role, teamSize, auditId }, auditForEmail);
}

export async function getAuditBySlug(slug: string): Promise<AuditResult | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const { data } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("share_slug", slug)
    .single();

  if (!data) return null;

  return mapAuditRowToResult(data);
}

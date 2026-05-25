"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { generateAISummary } from "@/lib/ai/summary";
import { sendAuditEmail } from "@/lib/email/audit-email";
import { runAudit } from "@/features/audit/engine";
import { nanoid } from "@/utils/nanoid";
import type { AuditInput, AuditResult, LeadCapture } from "@/types";
import { z } from "zod";

const LeadSchema = z.object({
  email: z.string().email(),
  company: z.string().min(1).max(100),
  role: z.string().min(1).max(100),
  teamSize: z.number().int().min(1).max(100000),
  auditId: z.string().min(1),
  honeypot: z.string().max(0, "Bot detected"),
});

export async function submitAudit(input: AuditInput): Promise<AuditResult> {
  const result = runAudit(input);
  const shareSlug = nanoid(8);
  result.shareSlug = shareSlug;

  // Generate AI summary
  result.aiSummary = await generateAISummary(result);

  // Store in Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await supabaseAdmin.from("audits").insert({
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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { success: true }; // dev mode
  }

  // Check rate limit: max 3 leads per email per hour
  const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
  const { count } = await supabaseAdmin
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 3) {
    return { success: false, error: "Too many requests. Please try again later." };
  }

  await supabaseAdmin.from("leads").insert({
    email,
    company,
    role,
    team_size: teamSize,
    audit_id: auditId,
    created_at: new Date().toISOString(),
  });

  // Fetch audit for email
  const { data: auditRow } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("id", auditId)
    .single();

  if (auditRow) {
    const audit: AuditResult = {
      id: auditRow.id,
      input: auditRow.input,
      recommendations: auditRow.recommendations,
      totalMonthlySpend: auditRow.total_monthly_spend,
      totalMonthlySavings: auditRow.total_monthly_savings,
      totalAnnualSavings: auditRow.total_annual_savings,
      aiSummary: auditRow.ai_summary,
      createdAt: auditRow.created_at,
      shareSlug: auditRow.share_slug,
    };
    await sendAuditEmail({ email, company, role, teamSize, auditId }, audit);
  }

  return { success: true };
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

  return {
    id: data.id,
    input: data.input,
    recommendations: data.recommendations,
    totalMonthlySpend: data.total_monthly_spend,
    totalMonthlySavings: data.total_monthly_savings,
    totalAnnualSavings: data.total_annual_savings,
    aiSummary: data.ai_summary,
    createdAt: data.created_at,
    shareSlug: data.share_slug,
  };
}

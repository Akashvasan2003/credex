import { connection } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { readEnv } from "@/lib/env";
import { sendAuditEmail } from "@/lib/email/audit-email";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AuditResult, LeadCapture } from "@/types";

interface AuditRow {
  id: string;
  input: AuditResult["input"];
  recommendations: AuditResult["recommendations"];
  total_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  created_at: string;
  share_slug: string;
}

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

export async function POST(request: NextRequest) {
  await connection();

  const configuredSecret = readEnv("TEST_EMAIL_SECRET");
  const hasSupabaseUrl = !!readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const hasServiceRoleKey = !!readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!configuredSecret) {
    return NextResponse.json(
      {
        success: false,
        error: "TEST_EMAIL_SECRET is not configured.",
        diagnostics: {
          hasTestEmailSecret: !!configuredSecret,
          hasSupabaseUrl,
          hasServiceRoleKey,
        },
      },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (providedSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized test email request." },
      { status: 401 }
    );
  }

  const body = (await request.json()) as {
    auditId?: string;
    email?: string;
    company?: string;
    role?: string;
    teamSize?: number;
  };

  if (!body.auditId || !body.email) {
    return NextResponse.json(
      { success: false, error: "auditId and email are required." },
      { status: 400 }
    );
  }

  if (!hasSupabaseUrl || !hasServiceRoleKey) {
    return NextResponse.json(
      {
        success: false,
        error: "Supabase is not configured on the server.",
        diagnostics: {
          hasTestEmailSecret: !!configuredSecret,
          hasSupabaseUrl,
          hasServiceRoleKey,
        },
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("audits")
    .select("*")
    .eq("id", body.auditId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: "Audit not found for the provided auditId." },
      { status: 404 }
    );
  }

  const audit = mapAuditRowToResult(data as AuditRow);
  const lead: LeadCapture = {
    email: body.email,
    company: body.company || "Credex Test",
    role: body.role || "developer",
    teamSize: body.teamSize ?? audit.input.teamSize,
    auditId: body.auditId,
  };

  const result = await sendAuditEmail(lead, audit);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { sendAuditEmail } from "@/lib/email/audit-email";
import type { AuditResult, LeadCapture } from "@/types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    lead?: LeadCapture;
    audit?: AuditResult;
  };

  if (!body.lead || !body.audit) {
    return NextResponse.json(
      { success: false, error: "Lead and audit are required." },
      { status: 400 }
    );
  }

  const result = await sendAuditEmail(body.lead, body.audit);

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

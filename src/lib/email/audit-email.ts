import { Resend } from "resend";
import { readEnv } from "@/lib/env";
import type { AuditResult, LeadCapture } from "@/types";
import { formatCurrency } from "@/utils/format";
import { serializeAuditForShare } from "@/utils/share";

function getResend() {
  return new Resend(readEnv("RESEND_API_KEY"));
}

export async function sendAuditEmail(
  lead: LeadCapture,
  audit: AuditResult
): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = readEnv("RESEND_API_KEY");
  if (!resendApiKey) {
    return { success: false, error: "Email is not configured on the server." };
  }

  const from = readEnv("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  const appUrl = readEnv("NEXT_PUBLIC_APP_URL");
  const shareUrl = appUrl
    ? `${appUrl}/share/${audit.shareSlug || audit.id}?data=${encodeURIComponent(serializeAuditForShare(audit))}`
    : `/share/${audit.shareSlug || audit.id}`;
  const hasSavings = audit.totalAnnualSavings > 0;
  const toolsAudited = audit.recommendations.length;
  const topSaving = [...audit.recommendations]
    .filter((r) => !r.isOptimized)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your AI Spend Audit - SpendLens</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #222222;overflow:hidden;">

<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
<div style="font-size:28px;font-weight:700;color:#ffffff;">SpendLens</div>
<div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">AI Spend Audit</div>
</td></tr>

<tr><td style="padding:40px 40px 0;">
<p style="color:#e5e7eb;font-size:16px;margin:0 0 8px;">Hi there,</p>
<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0;">Your AI spend audit for <strong style="color:#e5e7eb;">${lead.company || "your team"}</strong> is ready.</p>
</td></tr>

<tr><td style="padding:32px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="48%" style="background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;border:1px solid #2d2d4e;">
<div style="font-size:32px;font-weight:700;color:#6366f1;">${formatCurrency(audit.totalMonthlySpend)}</div>
<div style="font-size:13px;color:#9ca3af;margin-top:4px;">Current Monthly Spend</div>
</td>
<td width="4%"></td>
<td width="48%" style="background:#1a2e1a;border-radius:12px;padding:24px;text-align:center;border:1px solid #2d4e2d;">
<div style="font-size:32px;font-weight:700;color:#22c55e;">${toolsAudited}</div>
<div style="font-size:13px;color:#9ca3af;margin-top:4px;">Tools Audited</div>
</td>
</tr>
</table>
</td></tr>

<tr><td style="padding:0 40px 32px;">
<div style="background:#1c1c1c;border-radius:12px;padding:24px;border:1px solid #2a2a2a;">
<div style="font-size:12px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Audit Summary</div>
<div style="color:#e5e7eb;font-size:15px;font-weight:600;">${hasSavings ? `${formatCurrency(audit.totalAnnualSavings)}/yr in savings identified` : "Your stack looks well-optimized"}</div>
<div style="color:#9ca3af;font-size:14px;margin-top:8px;line-height:1.5;">${hasSavings ? `We found ${formatCurrency(audit.totalMonthlySavings)}/mo in potential savings across ${toolsAudited} tool${toolsAudited === 1 ? "" : "s"}.` : `No significant savings were identified. Your current stack is spending ${formatCurrency(audit.totalMonthlySpend)}/month efficiently across ${toolsAudited} tool${toolsAudited === 1 ? "" : "s"}.`}</div>
</div>
</td></tr>

${topSaving ? `
<tr><td style="padding:0 40px 32px;">
<div style="background:#1c1c1c;border-radius:12px;padding:24px;border:1px solid #2a2a2a;">
<div style="font-size:12px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Top Recommendation</div>
<div style="color:#e5e7eb;font-size:15px;font-weight:600;">${topSaving.toolName}: ${topSaving.currentPlan} to ${topSaving.recommendedPlan}</div>
<div style="color:#9ca3af;font-size:14px;margin-top:8px;line-height:1.5;">${topSaving.reason}</div>
<div style="margin-top:16px;font-size:14px;color:#22c55e;font-weight:600;">Save ${formatCurrency(topSaving.monthlySavings)}/mo</div>
</div>
</td></tr>
` : ""}

<tr><td style="padding:0 40px 40px;text-align:center;">
<a href="${shareUrl}"
   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
  View Full Audit Report
</a>
</td></tr>

<tr><td style="padding:24px 40px;border-top:1px solid #1f1f1f;text-align:center;">
<p style="color:#4b5563;font-size:12px;margin:0;">SpendLens by Credex</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: lead.email,
      subject: `Your AI Spend Audit: ${formatCurrency(audit.totalAnnualSavings)}/yr in savings identified`,
      html,
    });

    if (error) {
      console.error("Resend error:", JSON.stringify(error));
      return {
        success: false,
        error:
          "We couldn't send the email from the configured sender. Check your Resend domain and from address.",
      };
    }

    if (!data?.id) {
      return {
        success: false,
        error: "Email provider did not confirm delivery.",
      };
    }

    console.log("Email sent successfully:", data.id);
    return { success: true };
  } catch (err) {
    console.error("Email send failed:", err);
    return {
      success: false,
      error: "Email delivery failed. Please try again in a moment.",
    };
  }
}

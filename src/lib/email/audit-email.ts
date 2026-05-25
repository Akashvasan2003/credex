import { Resend } from "resend";
import type { AuditResult, LeadCapture } from "@/types";
import { formatCurrency } from "@/utils/format";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendAuditEmail(lead: LeadCapture, audit: AuditResult): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return;
  }

  const topSaving = audit.recommendations
    .filter((r) => !r.isOptimized)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Your AI Spend Audit — SpendLens</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#111111;border-radius:16px;border:1px solid #222222;overflow:hidden;">

<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center;">
<div style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">SpendLens</div>
<div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">AI Spend Audit</div>
</td></tr>

<!-- Greeting -->
<tr><td style="padding:40px 40px 0;">
<p style="color:#e5e7eb;font-size:16px;margin:0 0 8px;">Hi ${lead.role ? lead.role : "there"},</p>
<p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0;">Your AI spend audit for <strong style="color:#e5e7eb;">${lead.company || "your team"}</strong> is ready. Here's what we found:</p>
</td></tr>

<!-- Stats -->
<tr><td style="padding:32px 40px;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td width="48%" style="background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;border:1px solid #2d2d4e;">
<div style="font-size:32px;font-weight:700;color:#6366f1;">${formatCurrency(audit.totalMonthlySavings)}</div>
<div style="font-size:13px;color:#9ca3af;margin-top:4px;">Monthly Savings</div>
</td>
<td width="4%"></td>
<td width="48%" style="background:#1a2e1a;border-radius:12px;padding:24px;text-align:center;border:1px solid #2d4e2d;">
<div style="font-size:32px;font-weight:700;color:#22c55e;">${formatCurrency(audit.totalAnnualSavings)}</div>
<div style="font-size:13px;color:#9ca3af;margin-top:4px;">Annual Savings</div>
</td>
</tr>
</table>
</td></tr>

${topSaving ? `
<!-- Top Recommendation -->
<tr><td style="padding:0 40px 32px;">
<div style="background:#1c1c1c;border-radius:12px;padding:24px;border:1px solid #2a2a2a;">
<div style="font-size:12px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Top Recommendation</div>
<div style="color:#e5e7eb;font-size:15px;font-weight:600;">${topSaving.toolName}: ${topSaving.currentPlan} → ${topSaving.recommendedPlan}</div>
<div style="color:#9ca3af;font-size:14px;margin-top:8px;line-height:1.5;">${topSaving.reason}</div>
<div style="margin-top:16px;font-size:14px;color:#22c55e;font-weight:600;">Save ${formatCurrency(topSaving.monthlySavings)}/mo · ${formatCurrency(topSaving.annualSavings)}/yr</div>
</div>
</td></tr>
` : ""}

<!-- AI Summary -->
${audit.aiSummary ? `
<tr><td style="padding:0 40px 32px;">
<div style="border-left:3px solid #6366f1;padding-left:16px;">
<p style="color:#9ca3af;font-size:14px;line-height:1.7;margin:0;">${audit.aiSummary}</p>
</div>
</td></tr>
` : ""}

<!-- CTA -->
<tr><td style="padding:0 40px 40px;text-align:center;">
<a href="${process.env.NEXT_PUBLIC_APP_URL}/audit/${audit.shareSlug || audit.id}" 
   style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
  View Full Audit Report →
</a>
<p style="color:#4b5563;font-size:13px;margin-top:24px;">
  Want help implementing these savings? <a href="mailto:hello@credex.ai" style="color:#6366f1;">Talk to a Credex advisor</a>
</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;border-top:1px solid #1f1f1f;text-align:center;">
<p style="color:#4b5563;font-size:12px;margin:0;">SpendLens by Credex · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color:#6366f1;">spendlens.ai</a></p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  await getResend().emails.send({
    from: "SpendLens <audit@spendlens.ai>",
    to: lead.email,
    subject: `Your AI Spend Audit: ${formatCurrency(audit.totalAnnualSavings)}/yr in savings identified`,
    html,
  });
}

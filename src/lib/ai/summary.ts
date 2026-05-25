import Anthropic from "@anthropic-ai/sdk";
import type { AuditResult } from "@/types";
import { formatCurrency } from "@/utils/format";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(audit: AuditResult): string {
  const toolSummary = audit.recommendations
    .map(
      (r) =>
        `- ${r.toolName} (${r.currentPlan}): $${r.currentSpend}/mo → ${r.isOptimized ? "optimized" : `save $${r.monthlySavings}/mo by switching to ${r.recommendedPlan}`}`
    )
    .join("\n");

  return `You are a helpful AI finance advisor for startups. Write a concise ~100-word audit summary.

Context:
- Team size: ${audit.input.teamSize}
- Primary use case: ${audit.input.useCase}
- Total monthly AI spend: ${formatCurrency(audit.totalMonthlySpend)}
- Potential monthly savings: ${formatCurrency(audit.totalMonthlySavings)}

Tool breakdown:
${toolSummary}

Write a helpful, smart, non-salesy summary. Be specific about the biggest savings opportunity. End with one actionable next step. Do not use bullet points. Plain prose only.`;
}

function fallbackSummary(audit: AuditResult): string {
  if (audit.totalMonthlySavings > 0) {
    return `Your team is spending ${formatCurrency(audit.totalMonthlySpend)}/month on AI tools with ${formatCurrency(audit.totalMonthlySavings)}/month in identified savings — ${formatCurrency(audit.totalAnnualSavings)} annually. The biggest opportunity is optimizing your ${audit.recommendations.sort((a, b) => b.monthlySavings - a.monthlySavings)[0]?.toolName} plan. Review the recommendations below and implement the highest-confidence changes first to capture savings without disrupting your workflow.`;
  }
  return `Your team is spending ${formatCurrency(audit.totalMonthlySpend)}/month on AI tools and your stack looks well-optimized. You're making smart choices with your current plans. As your team grows, revisit this audit — pricing tiers and alternatives shift frequently in the AI space.`;
}

export async function generateAISummary(audit: AuditResult): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return fallbackSummary(audit);
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const message = await client.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 200,
        messages: [{ role: "user", content: buildPrompt(audit) }],
      });

      const content = message.content[0];
      if (content.type === "text" && content.text.trim()) {
        return content.text.trim();
      }
    } catch (err) {
      if (attempt === 3) {
        console.error("AI summary failed after 3 attempts:", err);
        return fallbackSummary(audit);
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  return fallbackSummary(audit);
}

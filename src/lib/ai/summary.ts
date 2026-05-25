import Anthropic from "@anthropic-ai/sdk";
import { buildFallbackSummary } from "@/lib/ai/fallback-summary";
import type { AuditResult } from "@/types";
import { formatCurrency } from "@/utils/format";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildPrompt(audit: AuditResult): string {
  const toolSummary = audit.recommendations
    .map(
      (recommendation) =>
        `- ${recommendation.toolName} (${recommendation.currentPlan}): $${recommendation.currentSpend}/mo -> ${
          recommendation.isOptimized
            ? "optimized"
            : `save $${recommendation.monthlySavings}/mo by switching to ${recommendation.recommendedPlan}`
        }`
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

export async function generateAISummary(audit: AuditResult): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return buildFallbackSummary(audit);
  }

  for (let attempt = 1; attempt <= 3; attempt += 1) {
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
    } catch (error) {
      if (attempt === 3) {
        console.error("AI summary failed after 3 attempts:", error);
        return buildFallbackSummary(audit);
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }

  return buildFallbackSummary(audit);
}

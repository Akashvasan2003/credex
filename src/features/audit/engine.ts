import type {
  AuditInput,
  AuditResult,
  ToolEntry,
  ToolRecommendation,
  UseCase,
} from "@/types";
import { nanoid } from "@/utils/nanoid";

// Core audit engine — pure deterministic logic, no AI.

function auditCursor(entry: ToolEntry): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "Cursor",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  // Business users with <5 seats: Pro is cheaper
  if (plan === "business" && seats < 5) {
    const recommended = 20 * seats;
    const savings = monthlySpend - recommended;
    if (savings > 0) {
      return {
        ...base,
        recommendedPlan: "Pro",
        recommendedVendor: "Cursor",
        recommendedSpend: recommended,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `With ${seats} seat${seats > 1 ? "s" : ""}, Cursor Pro ($20/seat) saves $${savings}/mo vs Business ($40/seat). Business features are only worth it at scale.`,
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Hobby users paying more than $0 — flag overpayment
  if (plan === "hobby" && monthlySpend > 0) {
    return {
      ...base,
      recommendedPlan: "Hobby",
      recommendedVendor: "Cursor",
      recommendedSpend: 0,
      monthlySavings: monthlySpend,
      annualSavings: monthlySpend * 12,
      reason: "Cursor Hobby is free. You may be paying for something else or entered spend incorrectly.",
      confidence: "high",
      isOptimized: false,
    } as ToolRecommendation;
  }

  // Windsurf alternative for Pro users with large teams
  if (plan === "pro" && seats >= 10) {
    const windsurfCost = 15 * seats;
    const savings = monthlySpend - windsurfCost;
    if (savings > 5) {
      return {
        ...base,
        recommendedPlan: "Pro",
        recommendedVendor: "Windsurf",
        recommendedSpend: windsurfCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Windsurf Pro ($15/seat) offers comparable AI coding features at 25% less than Cursor Pro ($20/seat). For ${seats} seats, that's $${savings}/mo saved.`,
        confidence: "medium",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "Cursor",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your Cursor plan is well-matched to your team size and usage.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditGithubCopilot(entry: ToolEntry): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "GitHub Copilot",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  // Individual billed monthly vs annual
  if (plan === "individual" && seats === 1) {
    const annualMonthly = 100 / 12; // ~$8.33/mo
    const savings = monthlySpend - annualMonthly;
    if (monthlySpend >= 10 && savings > 1) {
      return {
        ...base,
        recommendedPlan: "Individual (Annual)",
        recommendedVendor: "GitHub Copilot",
        recommendedSpend: parseFloat(annualMonthly.toFixed(2)),
        monthlySavings: parseFloat(savings.toFixed(2)),
        annualSavings: parseFloat((savings * 12).toFixed(2)),
        reason: "Switching to annual billing saves $20/year ($100/yr vs $120/yr) — a 17% discount with no feature change.",
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Enterprise overkill for small teams
  if (plan === "enterprise" && seats <= 10) {
    const businessCost = 19 * seats;
    const savings = monthlySpend - businessCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedPlan: "Business",
        recommendedVendor: "GitHub Copilot",
        recommendedSpend: businessCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Enterprise ($39/seat) adds SAML SSO and audit logs — rarely needed under 10 seats. Business ($19/seat) covers all core features, saving $${savings}/mo.`,
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Cursor alternative for coding-focused teams
  if ((plan === "business" || plan === "individual") && seats >= 3) {
    const cursorCost = 20 * seats;
    const savings = monthlySpend - cursorCost;
    if (savings > 10) {
      return {
        ...base,
        recommendedPlan: "Pro",
        recommendedVendor: "Cursor",
        recommendedSpend: cursorCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Cursor Pro ($20/seat) includes a full AI-native IDE with deeper context awareness. For ${seats} coding seats, it often replaces both Copilot and a standalone editor.`,
        confidence: "medium",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "GitHub Copilot",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your GitHub Copilot plan is appropriately sized.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditClaude(entry: ToolEntry, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "Claude",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  // Max plan — very expensive, check if Pro suffices
  if (plan === "max" && seats >= 1) {
    const proCost = 20 * seats;
    const savings = monthlySpend - proCost;
    if (savings > 0 && useCase !== "data") {
      return {
        ...base,
        recommendedPlan: "Pro",
        recommendedVendor: "Claude",
        recommendedSpend: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Claude Max ($100/seat) is designed for power users hitting Pro limits daily. Unless you're running 100+ long-context tasks/day, Pro ($20/seat) covers most workflows, saving $${savings}/mo.`,
        confidence: "medium",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Team plan with <5 seats — minimum seat requirement means waste
  if (plan === "team" && seats < 5) {
    const actualCost = 30 * 5; // forced to pay for 5
    const proCost = 20 * seats;
    const savings = actualCost - proCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedPlan: "Pro (per seat)",
        recommendedVendor: "Claude",
        recommendedSpend: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Claude Team requires a 5-seat minimum ($150/mo floor). With ${seats} actual users, individual Pro plans ($20/seat = $${proCost}/mo) save $${savings}/mo.`,
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Pro users doing heavy API work — API might be cheaper
  if (plan === "pro" && useCase === "data" && seats >= 3) {
    const apiEstimate = monthlySpend * 0.6; // API typically 40% cheaper for data workloads
    const savings = monthlySpend - apiEstimate;
    return {
      ...base,
      recommendedPlan: "API (claude-3-5-sonnet)",
      recommendedVendor: "Anthropic API",
      recommendedSpend: parseFloat(apiEstimate.toFixed(2)),
      monthlySavings: parseFloat(savings.toFixed(2)),
      annualSavings: parseFloat((savings * 12).toFixed(2)),
      reason: `For data-heavy workloads with ${seats} users, Anthropic API (claude-3-5-sonnet-20241022) at $3/MTok input + $15/MTok output typically costs 30-50% less than Pro subscriptions at scale.`,
      confidence: "medium",
      isOptimized: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "Claude",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your Claude plan is well-matched to your use case.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditChatGPT(entry: ToolEntry, useCase: UseCase): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "ChatGPT",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  // Plus users who could use Claude Pro instead (better for writing/research)
  if (plan === "plus" && (useCase === "writing" || useCase === "research")) {
    return {
      ...base,
      recommendedPlan: "Pro",
      recommendedVendor: "Claude",
      recommendedSpend: 20 * seats,
      monthlySavings: 0,
      annualSavings: 0,
      reason: `For ${useCase} tasks, Claude Pro ($20/seat) consistently outperforms ChatGPT Plus on long-form quality and nuance. Same price, better output for your use case.`,
      confidence: "medium",
      isOptimized: false,
    } as ToolRecommendation;
  }

  // Team plan with small team — check if Plus is enough
  if (plan === "team" && seats <= 3) {
    const plusCost = 20 * seats;
    const savings = monthlySpend - plusCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedPlan: "Plus (per seat)",
        recommendedVendor: "ChatGPT",
        recommendedSpend: plusCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `ChatGPT Team ($30/seat) adds shared workspace and admin controls. For ${seats} seats without heavy collaboration needs, Plus ($20/seat) saves $${savings}/mo.`,
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  // Duplicate with Claude — flag redundancy
  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "ChatGPT",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your ChatGPT plan is appropriately sized for your team.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditAPISpend(entry: ToolEntry): ToolRecommendation {
  const { tool, monthlySpend } = entry;
  const isAnthropic = tool === "anthropic_api";
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: isAnthropic ? "Anthropic API" : "OpenAI API",
    currentPlan: "Pay As You Go",
    currentSpend: monthlySpend,
  };

  // High API spend — suggest committed use discounts
  if (monthlySpend > 500) {
    const savings = monthlySpend * 0.15;
    return {
      ...base,
      recommendedPlan: "Committed Use / Batch API",
      recommendedVendor: isAnthropic ? "Anthropic API" : "OpenAI API",
      recommendedSpend: monthlySpend - savings,
      monthlySavings: parseFloat(savings.toFixed(2)),
      annualSavings: parseFloat((savings * 12).toFixed(2)),
      reason: isAnthropic
        ? `At $${monthlySpend}/mo, contact Anthropic for volume pricing. Batch API (async) offers 50% discount for non-realtime workloads. Estimated 15% blended savings.`
        : `At $${monthlySpend}/mo, OpenAI's Batch API offers 50% off for async workloads. Shifting even 30% of calls to batch saves ~$${savings.toFixed(0)}/mo.`,
      confidence: "medium",
      isOptimized: false,
    } as ToolRecommendation;
  }

  // Moderate spend — suggest model optimization
  if (monthlySpend > 100) {
    const savings = monthlySpend * 0.25;
    return {
      ...base,
      recommendedPlan: "Optimized Model Mix",
      recommendedVendor: isAnthropic ? "Anthropic API" : "OpenAI API",
      recommendedSpend: monthlySpend - savings,
      monthlySavings: parseFloat(savings.toFixed(2)),
      annualSavings: parseFloat((savings * 12).toFixed(2)),
      reason: isAnthropic
        ? `Route simple tasks to claude-haiku-3-5 ($0.80/MTok) instead of claude-sonnet ($3/MTok). A 70/30 split (haiku/sonnet) typically cuts costs 25-40% with minimal quality loss.`
        : `Route simple tasks to gpt-4o-mini ($0.15/MTok) instead of gpt-4o ($2.50/MTok). A 70/30 split typically cuts costs 25-40% with minimal quality loss.`,
      confidence: "high",
      isOptimized: false,
    } as ToolRecommendation;
  }

  return {
    ...base,
    recommendedPlan: "Pay As You Go",
    recommendedVendor: isAnthropic ? "Anthropic API" : "OpenAI API",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your API spend is modest. Focus on prompt efficiency as you scale.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditGemini(entry: ToolEntry): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "Google Gemini",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  if (plan === "ultra" || plan === "advanced") {
    const claudeProCost = 20 * seats;
    if (claudeProCost < monthlySpend) {
      const savings = monthlySpend - claudeProCost;
      return {
        ...base,
        recommendedPlan: "Pro",
        recommendedVendor: "Claude",
        recommendedSpend: claudeProCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Claude Pro ($20/seat) offers stronger reasoning and writing quality vs Gemini Advanced ($19.99/seat) at comparable price. Worth testing for your workload.`,
        confidence: "low",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "Google Gemini",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your Gemini plan is reasonably priced.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function auditWindsurf(entry: ToolEntry): ToolRecommendation {
  const { plan, seats, monthlySpend } = entry;
  const base: Partial<ToolRecommendation> = {
    toolId: entry.id,
    toolName: "Windsurf",
    currentPlan: plan,
    currentSpend: monthlySpend,
  };

  if (plan === "teams" && seats < 5) {
    const proCost = 15 * seats;
    const savings = monthlySpend - proCost;
    if (savings > 0) {
      return {
        ...base,
        recommendedPlan: "Pro (per seat)",
        recommendedVendor: "Windsurf",
        recommendedSpend: proCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `Windsurf Teams ($35/seat) adds admin controls and SSO. For ${seats} seats without enterprise needs, Pro ($15/seat) saves $${savings}/mo.`,
        confidence: "high",
        isOptimized: false,
      } as ToolRecommendation;
    }
  }

  return {
    ...base,
    recommendedPlan: plan,
    recommendedVendor: "Windsurf",
    recommendedSpend: monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reason: "Your Windsurf plan is well-optimized.",
    confidence: "high",
    isOptimized: true,
  } as ToolRecommendation;
}

function detectRedundancy(tools: ToolEntry[]): string[] {
  const warnings: string[] = [];
  const hasCursor = tools.some((t) => t.tool === "cursor");
  const hasCopilot = tools.some((t) => t.tool === "github_copilot");
  const hasWindsurf = tools.some((t) => t.tool === "windsurf");
  const hasClaude = tools.some((t) => t.tool === "claude");
  const hasChatGPT = tools.some((t) => t.tool === "chatgpt");

  if (hasCursor && hasCopilot && hasWindsurf) {
    warnings.push("You're paying for 3 AI coding tools (Cursor + Copilot + Windsurf). Pick one primary IDE assistant.");
  } else if (hasCursor && hasCopilot) {
    warnings.push("Cursor and GitHub Copilot overlap significantly. Cursor Pro includes AI completions — Copilot may be redundant.");
  } else if (hasCursor && hasWindsurf) {
    warnings.push("Cursor and Windsurf serve the same purpose. Consolidating to one saves money and reduces context switching.");
  }

  if (hasClaude && hasChatGPT) {
    warnings.push("Running both Claude and ChatGPT subscriptions? Consider consolidating to one for most tasks and using the other's API for specific needs.");
  }

  return warnings;
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, useCase } = input;
  const recommendations: ToolRecommendation[] = [];

  for (const entry of tools) {
    let rec: ToolRecommendation;
    switch (entry.tool) {
      case "cursor":
        rec = auditCursor(entry);
        break;
      case "github_copilot":
        rec = auditGithubCopilot(entry);
        break;
      case "claude":
        rec = auditClaude(entry, useCase);
        break;
      case "chatgpt":
        rec = auditChatGPT(entry, useCase);
        break;
      case "anthropic_api":
      case "openai_api":
        rec = auditAPISpend(entry);
        break;
      case "gemini":
        rec = auditGemini(entry);
        break;
      case "windsurf":
        rec = auditWindsurf(entry);
        break;
      default:
        rec = {
          toolId: entry.id,
          toolName: entry.tool,
          currentPlan: entry.plan,
          currentSpend: entry.monthlySpend,
          recommendedPlan: entry.plan,
          recommendedVendor: entry.tool,
          recommendedSpend: entry.monthlySpend,
          monthlySavings: 0,
          annualSavings: 0,
          reason: "No optimization data available for this tool.",
          confidence: "low",
          isOptimized: true,
        };
    }
    recommendations.push(rec);
  }

  const totalMonthlySpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);

  return {
    id: nanoid(),
    input,
    recommendations,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12,
    createdAt: new Date().toISOString(),
  };
}

export { detectRedundancy };

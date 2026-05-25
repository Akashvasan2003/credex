import { describe, it, expect } from "vitest";
import { runAudit, detectRedundancy } from "@/features/audit/engine";
import { nanoid } from "@/utils/nanoid";
import type { AuditInput, ToolEntry } from "@/types";

function makeEntry(overrides: Partial<ToolEntry>): ToolEntry {
  return {
    id: nanoid(),
    tool: "cursor",
    plan: "pro",
    monthlySpend: 20,
    seats: 1,
    ...overrides,
  };
}

function makeInput(tools: ToolEntry[], overrides?: Partial<AuditInput>): AuditInput {
  return {
    tools,
    teamSize: 5,
    useCase: "coding",
    ...overrides,
  };
}

// ─── Test 1: Cursor Business → Pro downgrade ───────────────────────────────
describe("Cursor audit", () => {
  it("recommends Pro over Business for small teams (<5 seats)", () => {
    const entry = makeEntry({ tool: "cursor", plan: "business", monthlySpend: 120, seats: 3 });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.recommendedPlan).toBe("Pro");
    // Business = $40 * 3 = $120, Pro = $20 * 3 = $60, savings = $60
    expect(rec.monthlySavings).toBe(60);
    expect(rec.annualSavings).toBe(720);
  });

  it("marks Cursor Pro as optimized for a single user", () => {
    const entry = makeEntry({ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 });
    const result = runAudit(makeInput([entry]));
    expect(result.recommendations[0].isOptimized).toBe(true);
    expect(result.totalMonthlySavings).toBe(0);
  });
});

// ─── Test 2: GitHub Copilot annual billing savings ─────────────────────────
describe("GitHub Copilot audit", () => {
  it("recommends annual billing for individual plan", () => {
    const entry = makeEntry({
      tool: "github_copilot",
      plan: "individual",
      monthlySpend: 10,
      seats: 1,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    // Annual = $100/yr = ~$8.33/mo, savings ~$1.67/mo
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.recommendedPlan).toContain("Annual");
  });

  it("recommends Business over Enterprise for small teams", () => {
    const entry = makeEntry({
      tool: "github_copilot",
      plan: "enterprise",
      monthlySpend: 390,
      seats: 10,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    expect(rec.recommendedPlan).toBe("Business");
    // Enterprise $39 * 10 = $390, Business $19 * 10 = $190, savings = $200
    expect(rec.monthlySavings).toBe(200);
  });
});

// ─── Test 3: Claude Max → Pro downgrade ───────────────────────────────────
describe("Claude audit", () => {
  it("recommends Pro over Max for non-data use cases", () => {
    const entry = makeEntry({
      tool: "claude",
      plan: "max",
      monthlySpend: 300,
      seats: 3,
    });
    const result = runAudit(makeInput([entry], { useCase: "writing" }));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    expect(rec.recommendedPlan).toBe("Pro");
    // Max $100 * 3 = $300, Pro $20 * 3 = $60, savings = $240
    expect(rec.monthlySavings).toBe(240);
    expect(rec.annualSavings).toBe(2880);
  });

  it("flags Team plan waste when seats < 5 (minimum seat requirement)", () => {
    const entry = makeEntry({
      tool: "claude",
      plan: "team",
      monthlySpend: 150, // paying for 5 minimum
      seats: 2,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    // Team min 5 seats = $150, Pro for 2 = $40, savings = $110
    expect(rec.monthlySavings).toBe(110);
  });
});

// ─── Test 4: API spend optimization ───────────────────────────────────────
describe("API spend audit", () => {
  it("recommends model routing for moderate Anthropic API spend", () => {
    const entry = makeEntry({
      tool: "anthropic_api",
      plan: "pay_as_you_go",
      monthlySpend: 300,
      seats: 1,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reason).toContain("haiku");
  });

  it("recommends batch API for high OpenAI API spend", () => {
    const entry = makeEntry({
      tool: "openai_api",
      plan: "pay_as_you_go",
      monthlySpend: 800,
      seats: 1,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    expect(rec.monthlySavings).toBeGreaterThan(0);
    expect(rec.reason).toContain("Batch");
  });

  it("marks low API spend as optimized", () => {
    const entry = makeEntry({
      tool: "openai_api",
      plan: "pay_as_you_go",
      monthlySpend: 50,
      seats: 1,
    });
    const result = runAudit(makeInput([entry]));
    expect(result.recommendations[0].isOptimized).toBe(true);
  });
});

// ─── Test 5: Total savings calculation ────────────────────────────────────
describe("Total savings calculation", () => {
  it("correctly sums savings across multiple tools", () => {
    const tools = [
      makeEntry({ tool: "cursor", plan: "business", monthlySpend: 120, seats: 3 }), // saves $60
      makeEntry({ tool: "github_copilot", plan: "enterprise", monthlySpend: 390, seats: 10 }), // saves $200
    ];
    const result = runAudit(makeInput(tools));

    expect(result.totalMonthlySpend).toBe(510);
    expect(result.totalMonthlySavings).toBe(260);
    expect(result.totalAnnualSavings).toBe(3120);
  });

  it("returns zero savings for fully optimized stack", () => {
    const tools = [
      makeEntry({ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }),
      makeEntry({ tool: "windsurf", plan: "pro", monthlySpend: 15, seats: 1 }),
    ];
    const result = runAudit(makeInput(tools));

    expect(result.totalMonthlySavings).toBe(0);
    expect(result.totalAnnualSavings).toBe(0);
    expect(result.recommendations.every((r) => r.isOptimized)).toBe(true);
  });
});

// ─── Test 6: Redundancy detection ─────────────────────────────────────────
describe("Redundancy detection", () => {
  it("detects Cursor + Copilot overlap", () => {
    const tools = [
      makeEntry({ tool: "cursor" }),
      makeEntry({ tool: "github_copilot" }),
    ];
    const warnings = detectRedundancy(tools);
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("Cursor");
  });

  it("detects Claude + ChatGPT subscription overlap", () => {
    const tools = [
      makeEntry({ tool: "claude", plan: "pro" }),
      makeEntry({ tool: "chatgpt", plan: "plus" }),
    ];
    const warnings = detectRedundancy(tools);
    expect(warnings.some((w) => w.includes("Claude") && w.includes("ChatGPT"))).toBe(true);
  });

  it("returns no warnings for non-overlapping tools", () => {
    const tools = [
      makeEntry({ tool: "cursor" }),
      makeEntry({ tool: "anthropic_api" }),
    ];
    const warnings = detectRedundancy(tools);
    expect(warnings.length).toBe(0);
  });
});

// ─── Test 7: Windsurf audit ────────────────────────────────────────────────
describe("Windsurf audit", () => {
  it("recommends Pro over Teams for small teams", () => {
    const entry = makeEntry({
      tool: "windsurf",
      plan: "teams",
      monthlySpend: 105,
      seats: 3,
    });
    const result = runAudit(makeInput([entry]));
    const rec = result.recommendations[0];

    expect(rec.isOptimized).toBe(false);
    // Teams $35 * 3 = $105, Pro $15 * 3 = $45, savings = $60
    expect(rec.monthlySavings).toBe(60);
  });
});

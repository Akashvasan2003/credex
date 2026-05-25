import type { VendorPricing } from "@/types";

/**
 * Centralized pricing data — all figures verified from vendor pricing pages.
 * See PRICING_DATA.md for citations and verification dates.
 */
export const PRICING_DATA: Record<string, VendorPricing> = {
  cursor: {
    vendor: "cursor",
    displayName: "Cursor",
    sourceUrl: "https://cursor.com/pricing",
    verifiedDate: "2025-01-15",
    plans: {
      hobby: { name: "Hobby", monthlyPerSeat: 0 },
      pro: { name: "Pro", monthlyPerSeat: 20 },
      business: { name: "Business", monthlyPerSeat: 40 },
      enterprise: { name: "Enterprise", monthlyPerSeat: 40 }, // custom, use business as floor
    },
  },
  github_copilot: {
    vendor: "github_copilot",
    displayName: "GitHub Copilot",
    sourceUrl: "https://github.com/features/copilot#pricing",
    verifiedDate: "2025-01-15",
    plans: {
      individual: { name: "Individual", monthlyPerSeat: 10, annualPerSeat: 100 },
      business: { name: "Business", monthlyPerSeat: 19 },
      enterprise: { name: "Enterprise", monthlyPerSeat: 39 },
    },
  },
  claude: {
    vendor: "claude",
    displayName: "Claude (Anthropic)",
    sourceUrl: "https://claude.ai/upgrade",
    verifiedDate: "2025-01-15",
    plans: {
      free: { name: "Free", monthlyPerSeat: 0 },
      pro: { name: "Pro", monthlyPerSeat: 20 },
      max: { name: "Max", monthlyPerSeat: 100 },
      team: { name: "Team", monthlyPerSeat: 30, minSeats: 5 },
      enterprise: { name: "Enterprise", monthlyPerSeat: 30 }, // custom, floor estimate
      api: { name: "API", monthlyPerSeat: 0 }, // usage-based, user enters actual spend
    },
  },
  chatgpt: {
    vendor: "chatgpt",
    displayName: "ChatGPT (OpenAI)",
    sourceUrl: "https://openai.com/chatgpt/pricing",
    verifiedDate: "2025-01-15",
    plans: {
      plus: { name: "Plus", monthlyPerSeat: 20 },
      team: { name: "Team", monthlyPerSeat: 30, minSeats: 2 },
      enterprise: { name: "Enterprise", monthlyPerSeat: 30 }, // custom, floor estimate
      api: { name: "API", monthlyPerSeat: 0 }, // usage-based
    },
  },
  anthropic_api: {
    vendor: "anthropic_api",
    displayName: "Anthropic API",
    sourceUrl: "https://www.anthropic.com/pricing",
    verifiedDate: "2025-01-15",
    plans: {
      pay_as_you_go: { name: "Pay As You Go", monthlyPerSeat: 0 },
    },
  },
  openai_api: {
    vendor: "openai_api",
    displayName: "OpenAI API",
    sourceUrl: "https://openai.com/api/pricing",
    verifiedDate: "2025-01-15",
    plans: {
      pay_as_you_go: { name: "Pay As You Go", monthlyPerSeat: 0 },
    },
  },
  gemini: {
    vendor: "gemini",
    displayName: "Google Gemini",
    sourceUrl: "https://gemini.google.com/advanced",
    verifiedDate: "2025-01-15",
    plans: {
      free: { name: "Free", monthlyPerSeat: 0 },
      advanced: { name: "Advanced (Pro)", monthlyPerSeat: 19.99 },
      ultra: { name: "Ultra", monthlyPerSeat: 19.99 }, // bundled in Advanced
      api: { name: "API", monthlyPerSeat: 0 }, // usage-based
    },
  },
  windsurf: {
    vendor: "windsurf",
    displayName: "Windsurf (Codeium)",
    sourceUrl: "https://codeium.com/windsurf/pricing",
    verifiedDate: "2025-01-15",
    plans: {
      free: { name: "Free", monthlyPerSeat: 0 },
      pro: { name: "Pro", monthlyPerSeat: 15 },
      teams: { name: "Teams", monthlyPerSeat: 35 },
      enterprise: { name: "Enterprise", monthlyPerSeat: 35 },
    },
  },
};

export const TOOL_DISPLAY_NAMES: Record<string, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Google Gemini",
  windsurf: "Windsurf",
};

export const TOOL_PLANS: Record<string, { value: string; label: string }[]> = {
  cursor: [
    { value: "hobby", label: "Hobby (Free)" },
    { value: "pro", label: "Pro ($20/seat)" },
    { value: "business", label: "Business ($40/seat)" },
    { value: "enterprise", label: "Enterprise (Custom)" },
  ],
  github_copilot: [
    { value: "individual", label: "Individual ($10/seat)" },
    { value: "business", label: "Business ($19/seat)" },
    { value: "enterprise", label: "Enterprise ($39/seat)" },
  ],
  claude: [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro ($20/seat)" },
    { value: "max", label: "Max ($100/seat)" },
    { value: "team", label: "Team ($30/seat)" },
    { value: "enterprise", label: "Enterprise (Custom)" },
    { value: "api", label: "API (Usage-based)" },
  ],
  chatgpt: [
    { value: "plus", label: "Plus ($20/seat)" },
    { value: "team", label: "Team ($30/seat)" },
    { value: "enterprise", label: "Enterprise (Custom)" },
    { value: "api", label: "API (Usage-based)" },
  ],
  anthropic_api: [{ value: "pay_as_you_go", label: "Pay As You Go" }],
  openai_api: [{ value: "pay_as_you_go", label: "Pay As You Go" }],
  gemini: [
    { value: "free", label: "Free" },
    { value: "advanced", label: "Advanced ($19.99/seat)" },
    { value: "ultra", label: "Ultra (bundled in Advanced)" },
    { value: "api", label: "API (Usage-based)" },
  ],
  windsurf: [
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro ($15/seat)" },
    { value: "teams", label: "Teams ($35/seat)" },
    { value: "enterprise", label: "Enterprise (Custom)" },
  ],
};

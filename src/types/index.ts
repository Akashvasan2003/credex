export type ToolName =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export type UseCase = "coding" | "writing" | "research" | "data" | "mixed";

export interface ToolEntry {
  id: string;
  tool: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCase;
}

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedVendor: string;
  recommendedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  confidence: "high" | "medium" | "low";
  isOptimized: boolean;
}

export interface AuditResult {
  id: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
  createdAt: string;
  shareSlug?: string;
}

export interface LeadCapture {
  email: string;
  company: string;
  role: string;
  teamSize: number;
  auditId: string;
}

export interface PricingPlan {
  name: string;
  monthlyPerSeat: number;
  annualPerSeat?: number;
  minSeats?: number;
  features?: string[];
}

export interface VendorPricing {
  vendor: ToolName;
  displayName: string;
  plans: Record<string, PricingPlan>;
  sourceUrl: string;
  verifiedDate: string;
}

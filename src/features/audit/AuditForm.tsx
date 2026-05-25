"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { runAudit } from "@/features/audit/engine";
import { TOOL_PLANS, TOOL_DISPLAY_NAMES } from "@/lib/pricing";
import { buildFallbackSummary } from "@/lib/ai/fallback-summary";
import { mapAuditResultToRow } from "@/lib/audit-row";
import { supabase } from "@/lib/supabase/client";
import { nanoid } from "@/utils/nanoid";
import type { AuditInput, AuditResult, ToolEntry, UseCase } from "@/types";

const TOOL_OPTIONS = Object.entries(TOOL_DISPLAY_NAMES).map(([value, label]) => ({
  value,
  label,
}));

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "coding", label: "Coding & Development" },
  { value: "writing", label: "Writing & Content" },
  { value: "research", label: "Research & Analysis" },
  { value: "data", label: "Data & Analytics" },
  { value: "mixed", label: "Mixed / General" },
];

function createEntry(): ToolEntry {
  return {
    id: nanoid(),
    tool: "cursor",
    plan: "pro",
    monthlySpend: 20,
    seats: 1,
  };
}

const STORAGE_KEY = "spendlens_audit_draft";

export default function AuditForm() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolEntry[]>([createEntry()]);
  const [teamSize, setTeamSize] = useState(5);
  const [useCase, setUseCase] = useState<UseCase>("mixed");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as AuditInput;
        queueMicrotask(() => {
          setTools(parsed.tools);
          setTeamSize(parsed.teamSize);
          setUseCase(parsed.useCase);
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ tools, teamSize, useCase }));
    } catch {}
  }, [tools, teamSize, useCase]);

  const addTool = useCallback(() => {
    setTools((previous) => [...previous, createEntry()]);
  }, []);

  const removeTool = useCallback((id: string) => {
    setTools((previous) => previous.filter((tool) => tool.id !== id));
  }, []);

  const updateTool = useCallback((id: string, field: keyof ToolEntry, value: string | number) => {
    setTools((previous) =>
      previous.map((tool) => {
        if (tool.id !== id) return tool;
        if (field === "tool") {
          const firstPlan = TOOL_PLANS[value as string]?.[0]?.value ?? "pro";
          return { ...tool, tool: value as ToolEntry["tool"], plan: firstPlan };
        }
        return { ...tool, [field]: value };
      })
    );
  }, []);

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    if (tools.length === 0) nextErrors.tools = "Add at least one tool";
    tools.forEach((tool) => {
      if (tool.monthlySpend < 0) nextErrors[`${tool.id}_spend`] = "Must be >= 0";
      if (tool.seats < 1) nextErrors[`${tool.id}_seats`] = "Must be >= 1";
    });
    if (teamSize < 1) nextErrors.teamSize = "Must be >= 1";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const result: AuditResult = runAudit({ tools, teamSize, useCase });
      result.shareSlug = nanoid(8);
      result.aiSummary = buildFallbackSummary(result);

      const { error } = await supabase.from("audits").insert(mapAuditResultToRow(result));

      if (error) {
        throw new Error(error.message);
      }

      localStorage.removeItem(STORAGE_KEY);
      router.push(`/results/${result.id}`);
    } catch (error) {
      console.error(error);
      setErrors({
        submit: "We couldn't save your audit. Check Supabase URL, anon key, and RLS policies.",
      });
    } finally {
      setLoading(false);
    }
  }

  const totalSpend = tools.reduce((sum, tool) => sum + (tool.monthlySpend || 0), 0);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav className="border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-3xl px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">SpendLens</span>
          </div>
          {totalSpend > 0 && (
            <div className="text-sm text-white/40">
              Total: <span className="text-white font-medium">${totalSpend.toLocaleString()}/mo</span>
            </div>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Audit your AI stack</h1>
            <p className="text-white/40">Add each tool your team uses. We&apos;ll find savings in under a second.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="space-y-4">
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Team Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Team Size"
                  type="number"
                  min={1}
                  value={teamSize}
                  onChange={(event) => setTeamSize(parseInt(event.target.value, 10) || 1)}
                  error={errors.teamSize}
                />
                <Select
                  label="Primary Use Case"
                  options={USE_CASE_OPTIONS}
                  value={useCase}
                  onChange={(event) => setUseCase(event.target.value as UseCase)}
                />
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">AI Tools</h2>
                <span className="text-xs text-white/30">{tools.length} tool{tools.length !== 1 ? "s" : ""}</span>
              </div>

              {errors.tools && <p className="text-sm text-red-400">{errors.tools}</p>}

              <AnimatePresence mode="popLayout">
                {tools.map((tool, index) => (
                  <motion.div
                    key={tool.id}
                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-white/20">Tool {index + 1}</span>
                        {tools.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTool(tool.id)}
                            className="text-white/20 hover:text-red-400 transition-colors p-1 rounded"
                            aria-label="Remove tool"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Select
                          label="Tool"
                          options={TOOL_OPTIONS}
                          value={tool.tool}
                          onChange={(event) => updateTool(tool.id, "tool", event.target.value)}
                        />
                        <Select
                          label="Plan"
                          options={TOOL_PLANS[tool.tool] ?? [{ value: tool.plan, label: tool.plan }]}
                          value={tool.plan}
                          onChange={(event) => updateTool(tool.id, "plan", event.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Monthly Spend ($)"
                          type="number"
                          min={0}
                          step={0.01}
                          value={tool.monthlySpend}
                          onChange={(event) => updateTool(tool.id, "monthlySpend", parseFloat(event.target.value) || 0)}
                          error={errors[`${tool.id}_spend`]}
                        />
                        <Input
                          label="Seats / Users"
                          type="number"
                          min={1}
                          value={tool.seats}
                          onChange={(event) => updateTool(tool.id, "seats", parseInt(event.target.value, 10) || 1)}
                          error={errors[`${tool.id}_seats`]}
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                type="button"
                onClick={addTool}
                className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 py-4 text-sm text-white/30 hover:text-white/60 hover:border-white/20 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add another tool
              </button>
            </div>

            <div className="flex gap-3 rounded-xl border border-indigo-500/15 bg-indigo-500/5 p-4">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <p className="text-sm text-white/40 leading-relaxed">
                Enter your actual monthly spend from your billing dashboard. For API tools, enter last month&apos;s invoice total.
              </p>
            </div>

            {errors.submit && <p className="text-sm text-red-400 text-center">{errors.submit}</p>}

            <Button type="submit" size="lg" loading={loading} className="w-full">
              {loading ? "Saving your audit..." : "Run Audit"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>

            <p className="text-center text-xs text-white/20">
              Free forever &middot; No account needed &middot; Results in seconds
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Zap } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { captureLead } from "@/features/audit/actions";
import { formatCurrency } from "@/utils/format";
import type { AuditResult } from "@/types";

const schema = z.object({
  email: z.string().email("Valid email required"),
  company: z.string().min(1, "Company name required").max(100),
  role: z.string().min(1, "Role required").max(100),
  teamSize: z.number().int().min(1).max(100000),
  honeypot: z.string().max(0),
});

type FormData = z.infer<typeof schema>;

const ROLE_OPTIONS = [
  { value: "founder", label: "Founder / CEO" },
  { value: "cto", label: "CTO / VP Engineering" },
  { value: "cfo", label: "CFO / Finance" },
  { value: "engineering_manager", label: "Engineering Manager" },
  { value: "developer", label: "Developer" },
  { value: "other", label: "Other" },
];

interface LeadCaptureModalProps {
  audit: AuditResult;
  onClose: () => void;
}

export function LeadCaptureModal({ audit, onClose }: LeadCaptureModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { teamSize: audit.input.teamSize, honeypot: "" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    const result = await captureLead({
      email: data.email,
      company: data.company,
      role: data.role,
      teamSize: Number(data.teamSize),
      auditId: audit.id,
      honeypot: data.honeypot,
    });
    if (result.success) {
      setSubmitted(true);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#111] shadow-2xl overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors p-1 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h2 className="text-xl font-bold text-white mb-2">Report sent!</h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Check your inbox for your full audit report with all recommendations and savings breakdown.
              </p>
              <Button className="mt-6 w-full" onClick={onClose}>
                Done
              </Button>
            </div>
          ) : (
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white">Get your full report</h2>
                  <p className="text-xs text-white/40">
                    {formatCurrency(audit.totalAnnualSavings)}/yr in savings identified
                  </p>
                </div>
              </div>

              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                We&apos;ll email you a detailed audit report with all recommendations, savings breakdown, and implementation steps.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Honeypot — hidden from real users */}
                <input
                  {...register("honeypot")}
                  type="text"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none h-0 w-0"
                  autoComplete="off"
                />

                <Input
                  label="Work Email"
                  type="email"
                  placeholder="you@company.com"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Input
                  label="Company"
                  placeholder="Acme Inc."
                  error={errors.company?.message}
                  {...register("company")}
                />

                <Select
                  label="Your Role"
                  options={ROLE_OPTIONS}
                  error={errors.role?.message}
                  {...register("role")}
                />

                <Input
                  label="Team Size"
                  type="number"
                  min={1}
                  error={errors.teamSize?.message}
                  {...register("teamSize")}
                />

                <Button type="submit" loading={isSubmitting} className="w-full">
                  Send My Report
                </Button>

                <p className="text-center text-xs text-white/20">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

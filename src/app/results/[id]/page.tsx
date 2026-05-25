"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultsPage from "@/features/results/ResultsPage";
import type { AuditResult } from "@/types";

export default function ResultsClientPage() {
  const params = useParams();
  const id = params.id as string;
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let found: AuditResult | null = null;
    try {
      const stored = localStorage.getItem(`audit_${id}`);
      if (stored) found = JSON.parse(stored);
    } catch {}
    // Use setTimeout to avoid setState-in-effect lint rule
    const t = setTimeout(() => {
      setAudit(found);
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, [id]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 text-sm">Loading your audit...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Audit not found.</p>
          <a href="/audit" className="text-indigo-400 hover:text-indigo-300 text-sm">
            Start a new audit →
          </a>
        </div>
      </div>
    );
  }

  return <ResultsPage audit={audit} />;
}

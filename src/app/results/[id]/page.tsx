"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultsPage from "@/features/results/ResultsPage";
import { mapAuditRowToResult, type AuditRow } from "@/lib/audit-row";
import { supabase } from "@/lib/supabase/client";
import type { AuditResult } from "@/types";

export default function ResultsByIdPage() {
  const params = useParams<{ id: string }>();
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAudit() {
      const { data } = await supabase.from("audits").select("*").eq("id", params.id).single();

      if (!cancelled) {
        setAudit(data ? mapAuditRowToResult(data as AuditRow) : null);
        setReady(true);
      }
    }

    void loadAudit();

    return () => {
      cancelled = true;
    };
  }, [params.id]);

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
            Start a new audit &rarr;
          </a>
        </div>
      </div>
    );
  }

  return <ResultsPage audit={audit} />;
}

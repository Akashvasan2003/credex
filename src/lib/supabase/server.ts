import "server-only";

import { readEnv } from "@/lib/env";
import type { AuditResult } from "@/types";

export interface AuditRow {
  id: string;
  share_slug: string;
  input: AuditResult["input"];
  recommendations: AuditResult["recommendations"];
  total_monthly_spend: number;
  total_monthly_savings: number;
  total_annual_savings: number;
  ai_summary: string | null;
  created_at: string;
}

interface LeadRow {
  email: string;
  company: string;
  role: string;
  team_size: number;
  audit_id: string;
  created_at: string;
}

interface SupabaseResponse<T> {
  count?: number | null;
  data: T | null;
  error: string | null;
}

function getSupabaseServerConfig() {
  const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/+$/, ""),
    serviceRoleKey,
  };
}

export function hasSupabaseServerConfig(): boolean {
  return !!getSupabaseServerConfig();
}

function buildHeaders(extra?: HeadersInit): Headers {
  const config = getSupabaseServerConfig();
  if (!config) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  const headers = new Headers(extra);
  headers.set("apikey", config.serviceRoleKey);
  headers.set("Authorization", `Bearer ${config.serviceRoleKey}`);
  return headers;
}

async function parseSupabaseError(response: Response): Promise<string> {
  const body = await response.text();

  if (!body) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(body) as {
      message?: string;
      error?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [
      parsed.message || parsed.error,
      parsed.details,
      parsed.hint,
      parsed.code,
    ]
      .filter(Boolean)
      .join(" | ");
  } catch {
    return body;
  }
}

async function supabaseRequest<T>(
  path: string,
  init?: RequestInit & { countHeader?: boolean }
): Promise<SupabaseResponse<T>> {
  const config = getSupabaseServerConfig();

  if (!config) {
    return { data: null, error: "Supabase server environment variables are not configured." };
  }

  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
      ...init,
      cache: "no-store",
      headers: buildHeaders(init?.headers),
    });

    if (!response.ok) {
      return { data: null, error: await parseSupabaseError(response) };
    }

    const contentRange = response.headers.get("content-range");
    const count = init?.countHeader && contentRange ? Number(contentRange.split("/")[1]) : undefined;

    if (response.status === 204) {
      return { data: null, error: null, count };
    }

    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : null;
    return { data, error: null, count };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Supabase request failure.";
    return { data: null, error: message };
  }
}

export async function insertAuditRow(row: AuditRow): Promise<{ error: string | null }> {
  const result = await supabaseRequest<AuditRow[]>("audits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  return { error: result.error };
}

export async function countRecentLeadsByEmail(
  email: string,
  createdAfterIso: string
): Promise<{ count: number; error: string | null }> {
  const result = await supabaseRequest<null>(
    `leads?email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(createdAfterIso)}&select=id`,
    {
      method: "GET",
      headers: {
        Prefer: "count=exact",
      },
      countHeader: true,
    }
  );

  return {
    count: result.count ?? 0,
    error: result.error,
  };
}

export async function insertLeadRow(row: LeadRow): Promise<{ error: string | null }> {
  const result = await supabaseRequest<LeadRow[]>("leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  return { error: result.error };
}

export async function getAuditRowById(id: string): Promise<{ data: AuditRow | null; error: string | null }> {
  const result = await supabaseRequest<AuditRow[]>(
    `audits?id=eq.${encodeURIComponent(id)}&select=*`,
    { method: "GET" }
  );

  return {
    data: result.data?.[0] ?? null,
    error: result.error,
  };
}

export async function getAuditRowBySlug(
  slug: string
): Promise<{ data: AuditRow | null; error: string | null }> {
  const result = await supabaseRequest<AuditRow[]>(
    `audits?share_slug=eq.${encodeURIComponent(slug)}&select=*`,
    { method: "GET" }
  );

  return {
    data: result.data?.[0] ?? null,
    error: result.error,
  };
}

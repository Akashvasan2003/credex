import { createClient } from "@supabase/supabase-js";

function sanitizeClientEnv(value?: string): string {
  const trimmed = value?.trim() ?? "";

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

const supabaseUrl = sanitizeClientEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseAnonKey = sanitizeClientEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (!supabaseUrl) {
  throw new Error("supabaseUrl is required.");
}

if (!supabaseAnonKey) {
  throw new Error("supabaseKey is required.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

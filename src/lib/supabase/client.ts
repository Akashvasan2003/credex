import { createClient } from "@supabase/supabase-js";
import { readEnv } from "@/lib/env";

const supabaseUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL")!;
const supabaseAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

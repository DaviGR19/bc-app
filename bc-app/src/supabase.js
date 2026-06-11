import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

function getValidSupabaseUrl(url: string | undefined): string {
  if (!url) return "https://placeholder-project.supabase.co";
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.startsWith("YOUR_") || trimmed.startsWith("MY_")) {
    return "https://placeholder-project.supabase.co";
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
  } catch {
    // Ignore error and fall back
  }
  return "https://placeholder-project.supabase.co";
}

const supabaseUrl = getValidSupabaseUrl(rawUrl);
const supabaseAnonKey = (rawKey && rawKey.trim() !== "" && !rawKey.startsWith("YOUR_") && !rawKey.startsWith("MY_")) ? rawKey.trim() : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



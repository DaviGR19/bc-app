import { createClient } from "@supabase/supabase-js";

// Pegamos das variáveis de ambiente se estiverem configuradas corretamente,
// caso contrário, usamos as credenciais reais do seu projeto do Supabase!
const envUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const isRealUrl = (url?: string) => url && url.trim().startsWith("https://") && url.includes(".supabase.co");

const SUPABASE_URL = isRealUrl(envUrl) ? envUrl.trim() : "https://mgktcjbmzfespdpqqqin.supabase.co";
const SUPABASE_KEY = isRealUrl(envUrl) && envKey && envKey.trim() !== "" ? envKey.trim() : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBiYXNlIsInJlZiI6Im1na3RjamJtemZlc3BkcHFxcWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Mji2ODEsImV4cCI6MjA5NjE5ODY4MX0.9UAl3QTwVLawZ7fagwofnZ0PDBRiMoncnkS63qeUPgU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

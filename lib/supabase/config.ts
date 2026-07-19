export const SUPABASE_PROJECT_ID = "cxywdhdzmbjitprfgfyz";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  `https://${SUPABASE_PROJECT_ID}.supabase.co`;

export function isSupabasePublicConfigured() {
  return Boolean(
    SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function isSupabaseAdminConfigured() {
  return Boolean(
    isSupabasePublicConfigured() && process.env.SUPABASE_SECRET_KEY,
  );
}

export function isOpenAIConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

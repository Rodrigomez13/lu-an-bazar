import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  isSupabaseAdminConfigured,
  isSupabasePublicConfigured,
  SUPABASE_URL,
} from "@/lib/supabase/config";

const commonOptions = {
  auth: { autoRefreshToken: false, persistSession: false },
} as const;

export function createPublicSupabaseClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!isSupabasePublicConfigured() || !key) {
    throw new Error("Supabase público no está configurado.");
  }
  return createClient(SUPABASE_URL, key, commonOptions);
}

export function createAdminSupabaseClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!isSupabaseAdminConfigured() || !key) {
    throw new Error("Supabase administrativo no está configurado.");
  }
  return createClient(SUPABASE_URL, key, commonOptions);
}

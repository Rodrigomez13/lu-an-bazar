import "server-only";

import { cookies } from "next/headers";
import { adminSession, parseAdminSession, type AdminRole } from "@/lib/admin-session";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export async function getAdminActor() {
  const cookieStore = await cookies();
  const value = cookieStore.get(adminSession.cookieName)?.value;
  const session = await parseAdminSession(value);
  if (!session) return null;
  if (!session.userId) return { userId: null, role: "admin" as AdminRole };
  if (!isSupabaseAdminConfigured()) return null;
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from("profiles").select("id,role,active").eq("id", session.userId).maybeSingle();
  if (error || !data?.active) return null;
  return { userId: String(data.id), role: data.role as AdminRole };
}

export async function hasAdminAccess() {
  return Boolean(await getAdminActor());
}

export async function hasAdminRole(roles: AdminRole[]) {
  const actor = await getAdminActor();
  return Boolean(actor && roles.includes(actor.role));
}

export async function requireAdminAccess() {
  if (!(await hasAdminAccess())) {
    throw new Error("No autorizado");
  }
}

export async function requireAdminRole(roles: AdminRole[]) {
  const actor = await getAdminActor();
  if (!actor) throw new Error("No autorizado");
  if (!roles.includes(actor.role)) throw new Error("Permisos insuficientes");
  return actor;
}

export function apiError(error: unknown, fallback = "Ocurrió un error") {
  const message = error instanceof Error ? error.message : fallback;
  const status = message === "No autorizado" ? 401 : message === "Permisos insuficientes" ? 403 : 400;
  return Response.json({ ok: false, error: message }, { status });
}

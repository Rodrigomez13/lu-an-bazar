import "server-only";

import { cookies } from "next/headers";
import { adminSession, isValidAdminSession } from "@/lib/admin-session";

export async function hasAdminAccess() {
  const cookieStore = await cookies();
  const value = cookieStore.get(adminSession.cookieName)?.value;
  return isValidAdminSession(value);
}

export async function requireAdminAccess() {
  if (!(await hasAdminAccess())) {
    throw new Error("No autorizado");
  }
}

export function apiError(error: unknown, fallback = "Ocurrió un error") {
  const message = error instanceof Error ? error.message : fallback;
  const status = message === "No autorizado" ? 401 : 400;
  return Response.json({ ok: false, error: message }, { status });
}

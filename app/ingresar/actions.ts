"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSession, createAdminSessionValue } from "@/lib/admin-session";
import { createAdminSupabaseClient, createPublicSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import type { AdminRole } from "@/lib/admin-session";

export type LoginState = { error: string };

export async function loginAdmin(
  _: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expectedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!process.env.ADMIN_SESSION_SECRET) {
    return { error: "El acceso administrativo todavía no está configurado." };
  }

  let sessionValue = "";
  if (expectedEmail && expectedPassword && email === expectedEmail && password === expectedPassword) {
    sessionValue = await createAdminSessionValue();
  } else if (isSupabaseAdminConfigured()) {
    try {
      const authClient = createPublicSupabaseClient();
      const { data, error } = await authClient.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const supabase = createAdminSupabaseClient();
        const { data: profile } = await supabase.from("profiles").select("role,active").eq("id", data.user.id).maybeSingle();
        if (profile?.active) sessionValue = await createAdminSessionValue({ userId: data.user.id, role: profile.role as AdminRole });
      }
    } catch {
      sessionValue = "";
    }
  }
  if (!sessionValue) return { error: "Usuario o contraseña incorrectos." };

  const cookieStore = await cookies();
  cookieStore.set(adminSession.cookieName, sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSession.maxAge,
  });
  redirect("/admin");
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSession.cookieName);
  redirect("/ingresar");
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSession, createAdminSessionValue } from "@/lib/admin-session";

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

  if (
    !expectedEmail ||
    !expectedPassword ||
    !process.env.ADMIN_SESSION_SECRET
  ) {
    return { error: "El acceso administrativo todavía no está configurado." };
  }
  if (email !== expectedEmail || password !== expectedPassword) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSession.cookieName, await createAdminSessionValue(), {
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

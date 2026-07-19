import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export type AppRole = "admin" | "catalog_manager" | "seller" | "finance_manager" | "collections";
export type StaffUser = { id: string; fullName: string; email: string; role: AppRole; active: boolean; createdAt: string; lastSignInAt: string };
export type AuditEntry = { id: number; actorName: string; area: string; action: string; entityTable: string; entityId: string; createdAt: string };

export const defaultFinanceSettings = {
  defaultInterestRate: 30,
  defaultInstallments: 6,
  defaultFrequency: "monthly" as "weekly" | "biweekly" | "monthly",
  graceDays: 3,
  lateFeeRate: 0,
  reminderTemplate: "Hola {nombre}, te recordamos que la cuota #{cuota} del préstamo #{prestamo} tiene un saldo de {saldo} y venció el {vencimiento}. Por favor comunicate con nosotros para regularizarla.",
};

export type FinanceSettings = typeof defaultFinanceSettings;

export async function getStaffUsers() {
  if (!isSupabaseAdminConfigured()) return { users: [] as StaffUser[], issue: "Configurá Supabase para administrar usuarios." };
  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: authData, error: authError }, { data: profiles, error: profileError }] = await Promise.all([
      supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabase.from("profiles").select("*").order("created_at"),
    ]);
    if (authError || profileError) throw new Error(authError?.message ?? profileError?.message);
    const authById = new Map((authData.users ?? []).map((user) => [user.id, user]));
    const users = (profiles ?? []).map((profile) => {
      const auth = authById.get(String(profile.id));
      return {
        id: String(profile.id), fullName: String(profile.full_name || auth?.user_metadata?.full_name || "Sin nombre"),
        email: auth?.email ?? "Sin email", role: profile.role as AppRole, active: Boolean(profile.active),
        createdAt: String(profile.created_at), lastSignInAt: auth?.last_sign_in_at ?? "",
      };
    });
    return { users };
  } catch (error) {
    return { users: [] as StaffUser[], issue: error instanceof Error ? error.message : "No se pudieron leer los usuarios." };
  }
}

export async function getAuditEntries() {
  if (!isSupabaseAdminConfigured()) return { entries: [] as AuditEntry[], issue: "Configurá Supabase para consultar la auditoría." };
  try {
    const supabase = createAdminSupabaseClient();
    const [{ data: logs, error }, { data: profiles }] = await Promise.all([
      supabase.from("audit_log").select("id,actor_id,area,action,entity_table,entity_id,created_at").order("created_at", { ascending: false }).limit(500),
      supabase.from("profiles").select("id,full_name"),
    ]);
    if (error) throw new Error(error.message);
    const actors = new Map((profiles ?? []).map((profile) => [String(profile.id), String(profile.full_name)]));
    return { entries: (logs ?? []).map((row) => ({
      id: Number(row.id), actorName: row.actor_id ? actors.get(String(row.actor_id)) ?? "Usuario eliminado" : "Sistema",
      area: String(row.area), action: String(row.action), entityTable: String(row.entity_table),
      entityId: String(row.entity_id ?? ""), createdAt: String(row.created_at),
    })) };
  } catch (error) {
    return { entries: [] as AuditEntry[], issue: error instanceof Error ? error.message : "No se pudo leer la auditoría." };
  }
}

export async function getFinanceSettings() {
  if (!isSupabaseAdminConfigured()) return { settings: defaultFinanceSettings, issue: "Configurá Supabase y ejecutá 07_financial_panel.sql." };
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from("app_settings").select("value").eq("key", "finance").maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: { ...defaultFinanceSettings, ...((data?.value ?? {}) as Partial<FinanceSettings>) } };
  } catch (error) {
    return { settings: defaultFinanceSettings, issue: error instanceof Error ? error.message : "No se pudo leer la configuración." };
  }
}

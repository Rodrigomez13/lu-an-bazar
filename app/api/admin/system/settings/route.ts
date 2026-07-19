import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin"]);
    const body = await request.json() as Record<string, unknown>;
    const settings = {
      defaultInterestRate: Number(body.defaultInterestRate),
      defaultInstallments: Number(body.defaultInstallments),
      defaultFrequency: String(body.defaultFrequency),
      graceDays: Number(body.graceDays),
      lateFeeRate: Number(body.lateFeeRate),
      reminderTemplate: String(body.reminderTemplate ?? "").trim(),
    };
    if (!Number.isFinite(settings.defaultInterestRate) || settings.defaultInterestRate < 0 || settings.defaultInterestRate > 1000) throw new Error("La tasa predeterminada no es válida.");
    if (!Number.isInteger(settings.defaultInstallments) || settings.defaultInstallments < 1 || settings.defaultInstallments > 120) throw new Error("Las cuotas predeterminadas deben estar entre 1 y 120.");
    if (!["weekly", "biweekly", "monthly"].includes(settings.defaultFrequency)) throw new Error("La frecuencia no es válida.");
    if (!Number.isInteger(settings.graceDays) || settings.graceDays < 0 || settings.graceDays > 365) throw new Error("Los días de gracia no son válidos.");
    if (!Number.isFinite(settings.lateFeeRate) || settings.lateFeeRate < 0 || settings.lateFeeRate > 1000) throw new Error("La tasa de mora no es válida.");
    if (settings.reminderTemplate.length < 20) throw new Error("El mensaje recordatorio es demasiado corto.");
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase.from("app_settings").upsert({ key: "finance", value: settings, description: "Parámetros privados del módulo financiero", updated_by: actor.userId });
    if (error) throw new Error(error.message.includes("app_settings") ? "Ejecutá primero 07_financial_panel.sql en Supabase." : error.message);
    revalidatePath("/admin/sistema/configuracion");
    revalidatePath("/admin/prestamos/clientes");
    revalidatePath("/admin/prestamos/mora");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error, "No se pudo guardar la configuración."); }
}

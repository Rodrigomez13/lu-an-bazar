import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "finance_manager"]);
    const body = await request.json() as Record<string, unknown>;
    const customerId = String(body.customerId ?? "");
    const principal = Number(body.principal);
    const interestRate = Number(body.interestRate);
    const installmentCount = Number(body.installmentCount);
    const frequency = String(body.frequency ?? "");
    const firstDueDate = String(body.firstDueDate ?? "");
    if (!customerId) throw new Error("Seleccioná un cliente.");
    if (!Number.isFinite(principal) || principal <= 0) throw new Error("Ingresá un capital válido.");
    if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 1000) throw new Error("La tasa no es válida.");
    if (!Number.isInteger(installmentCount) || installmentCount < 1 || installmentCount > 120) throw new Error("La cantidad de cuotas debe estar entre 1 y 120.");
    if (!['weekly', 'biweekly', 'monthly'].includes(frequency)) throw new Error("La frecuencia no es válida.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(firstDueDate)) throw new Error("Ingresá el primer vencimiento.");

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.rpc("create_loan_with_installments", {
      p_customer_id: customerId,
      p_principal: principal,
      p_interest_rate: interestRate,
      p_installment_count: installmentCount,
      p_frequency: frequency,
      p_first_due_date: firstDueDate,
      p_notes: String(body.notes ?? "").trim() || null,
      p_actor_id: actor.userId,
    });
    if (error) throw new Error(error.message.includes("Could not find the function") ? "Ejecutá primero 07_financial_panel.sql en Supabase." : error.message);
    ["/admin/prestamos", "/admin/prestamos/clientes", "/admin/prestamos/cobros", "/admin/prestamos/mora"].forEach((path) => revalidatePath(path));
    return Response.json({ ok: true, loanId: data });
  } catch (error) { return apiError(error, "No se pudo crear el préstamo."); }
}

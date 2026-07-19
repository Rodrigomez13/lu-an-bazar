import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "finance_manager", "collections"]);
    const body = await request.json() as Record<string, unknown>;
    const installmentId = String(body.installmentId ?? "");
    const amount = Number(body.amount);
    const method = String(body.method ?? "");
    if (!installmentId) throw new Error("Seleccioná una cuota.");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Ingresá un importe válido.");
    if (!["cash", "transfer", "other"].includes(method)) throw new Error("Seleccioná un medio de pago.");
    const supabase = createAdminSupabaseClient();
    const { data: installment, error: installmentError } = await supabase.from("loan_installments").select("loan_id,amount,paid_amount").eq("id", installmentId).single();
    if (installmentError) throw new Error("La cuota seleccionada no existe.");
    const balance = Number(installment.amount) - Number(installment.paid_amount);
    if (amount > balance + 0.001) throw new Error("El importe supera el saldo de la cuota.");
    const { data, error } = await supabase.from("loan_payments").insert({
      loan_id: installment.loan_id,
      installment_id: installmentId,
      amount,
      method,
      reference: String(body.reference ?? "").trim() || null,
      notes: String(body.notes ?? "").trim() || null,
      received_by: actor.userId,
    }).select("*").single();
    if (error) throw new Error(error.message);
    ["/admin/prestamos", "/admin/prestamos/cobros", "/admin/prestamos/mora"].forEach((path) => revalidatePath(path));
    return Response.json({ ok: true, payment: data });
  } catch (error) { return apiError(error, "No se pudo registrar el cobro."); }
}

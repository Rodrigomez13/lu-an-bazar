import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

function value(data: Record<string, unknown>, key: string) { return String(data[key] ?? "").trim(); }

function customerPayload(data: Record<string, unknown>) {
  const fullName = value(data, "fullName");
  const documentNumber = value(data, "documentNumber").replace(/\D/g, "");
  const phone = value(data, "phone");
  const address = value(data, "address");
  if (fullName.length < 3) throw new Error("Completá el nombre del cliente.");
  if (documentNumber.length < 7) throw new Error("Ingresá un DNI válido.");
  if (phone.length < 8) throw new Error("Ingresá un teléfono válido.");
  if (address.length < 5) throw new Error("Completá el domicilio.");
  return {
    full_name: fullName,
    document_type: value(data, "documentType") || "DNI",
    document_number: documentNumber,
    tax_id: value(data, "taxId") || null,
    birth_date: value(data, "birthDate") || null,
    phone,
    email: value(data, "email").toLowerCase() || null,
    address,
    employment_notes: value(data, "employmentNotes") || null,
    private_notes: value(data, "privateNotes") || null,
    active: data.active !== false,
  };
}

function refresh() {
  revalidatePath("/admin/prestamos");
  revalidatePath("/admin/prestamos/clientes");
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "finance_manager", "collections"]);
    const body = await request.json() as Record<string, unknown>;
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from("loan_customers").insert({ ...customerPayload(body), created_by: actor.userId }).select("*").single();
    if (error) throw new Error(error.code === "23505" ? "Ya existe un cliente con ese DNI." : error.message);
    refresh();
    return Response.json({ ok: true, customer: data });
  } catch (error) { return apiError(error, "No se pudo crear el cliente privado."); }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "finance_manager", "collections"]);
    const body = await request.json() as Record<string, unknown>;
    const id = value(body, "id");
    if (!id) throw new Error("Falta identificar al cliente.");
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.from("loan_customers").update({ ...customerPayload(body), updated_by: actor.userId }).eq("id", id).is("archived_at", null).select("*").single();
    if (error) throw new Error(error.code === "23505" ? "Ya existe un cliente con ese DNI." : error.message);
    refresh();
    return Response.json({ ok: true, customer: data });
  } catch (error) { return apiError(error, "No se pudo actualizar el cliente privado."); }
}

export async function DELETE(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "finance_manager", "collections"]);
    const { id } = await request.json() as { id?: string };
    if (!id) throw new Error("Falta identificar al cliente.");
    const supabase = createAdminSupabaseClient();
    const { count, error: loanError } = await supabase.from("loans").select("id", { count: "exact", head: true }).eq("customer_id", id).in("status", ["draft", "active", "overdue"]);
    if (loanError) throw new Error(loanError.message);
    if (count) throw new Error("No se puede archivar: el cliente tiene préstamos abiertos.");
    const { error } = await supabase.from("loan_customers").update({ archived_at: new Date().toISOString(), active: false, updated_by: actor.userId }).eq("id", id);
    if (error) throw new Error(error.message);
    refresh();
    return Response.json({ ok: true });
  } catch (error) { return apiError(error, "No se pudo archivar al cliente privado."); }
}

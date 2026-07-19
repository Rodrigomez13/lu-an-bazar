import { NextRequest } from "next/server";
import { apiError, requireAdminAccess } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

function value(data: Record<string, unknown>, key: string) {
  return String(data[key] ?? "").trim();
}

function payload(data: Record<string, unknown>) {
  const fullName = value(data, "fullName");
  const phone = value(data, "phone");
  const email = value(data, "email").toLowerCase();
  const status = value(data, "status") || "active";
  if (fullName.length < 3) throw new Error("Completá el nombre del cliente.");
  if (!phone && !email) throw new Error("Agregá un teléfono o un email.");
  if (!["active", "inactive", "prospect"].includes(status)) {
    throw new Error("El estado no es válido.");
  }
  return {
    full_name: fullName,
    phone: phone || null,
    email: email || null,
    address: value(data, "address") || null,
    notes: value(data, "notes") || null,
    status,
  };
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAccess();
    const body = (await request.json()) as Record<string, unknown>;
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("bazar_customers")
      .insert(payload(body))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return Response.json({ ok: true, customer: data });
  } catch (error) {
    return apiError(error, "No se pudo crear el cliente.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminAccess();
    const body = (await request.json()) as Record<string, unknown>;
    const id = value(body, "id");
    if (!id) throw new Error("Falta identificar el cliente.");
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("bazar_customers")
      .update(payload(body))
      .eq("id", id)
      .is("archived_at", null)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return Response.json({ ok: true, customer: data });
  } catch (error) {
    return apiError(error, "No se pudo actualizar el cliente.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminAccess();
    const body = (await request.json()) as { id?: string };
    if (!body.id) throw new Error("Falta identificar el cliente.");
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("bazar_customers")
      .update({ archived_at: new Date().toISOString(), status: "inactive" })
      .eq("id", body.id);
    if (error) throw new Error(error.message);
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error, "No se pudo archivar el cliente.");
  }
}

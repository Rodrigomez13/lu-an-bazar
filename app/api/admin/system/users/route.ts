import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import type { AppRole } from "@/lib/system-admin";

const roles: AppRole[] = ["admin", "catalog_manager", "seller", "finance_manager", "collections"];
function roleValue(value: unknown) {
  const role = String(value ?? "") as AppRole;
  if (!roles.includes(role)) throw new Error("El rol no es válido.");
  return role;
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin"]);
    const body = await request.json() as Record<string, unknown>;
    const fullName = String(body.fullName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const role = roleValue(body.role);
    if (fullName.length < 3) throw new Error("Completá el nombre del usuario.");
    if (!email.includes("@")) throw new Error("Ingresá un email válido.");
    if (password.length < 8) throw new Error("La contraseña temporal debe tener al menos 8 caracteres.");
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: fullName },
      app_metadata: { role },
    });
    if (error || !data.user) throw new Error(error?.message ?? "No se pudo crear el usuario.");
    const { error: profileError } = await supabase.from("profiles").upsert({ id: data.user.id, full_name: fullName, role, active: true });
    if (profileError) {
      await supabase.auth.admin.deleteUser(data.user.id);
      throw new Error(profileError.message);
    }
    await supabase.from("audit_log").insert({ actor_id: actor.userId, area: "security", action: "insert", entity_table: "profiles", entity_id: data.user.id, new_data: { full_name: fullName, email, role, active: true } });
    revalidatePath("/admin/sistema/usuarios");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error, "No se pudo crear el usuario."); }
}

export async function PATCH(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin"]);
    const body = await request.json() as Record<string, unknown>;
    const id = String(body.id ?? "");
    const fullName = String(body.fullName ?? "").trim();
    const role = roleValue(body.role);
    const active = body.active !== false;
    if (!id) throw new Error("Falta identificar al usuario.");
    if (fullName.length < 3) throw new Error("Completá el nombre del usuario.");
    const supabase = createAdminSupabaseClient();
    const { error: profileError } = await supabase.from("profiles").update({ full_name: fullName, role, active }).eq("id", id);
    if (profileError) throw new Error(profileError.message);
    const { error: authError } = await supabase.auth.admin.updateUserById(id, { user_metadata: { full_name: fullName }, app_metadata: { role } });
    if (authError) throw new Error(authError.message);
    await supabase.from("audit_log").insert({ actor_id: actor.userId, area: "security", action: "update", entity_table: "profiles", entity_id: id, new_data: { full_name: fullName, role, active } });
    revalidatePath("/admin/sistema/usuarios");
    return Response.json({ ok: true });
  } catch (error) { return apiError(error, "No se pudo actualizar el usuario."); }
}

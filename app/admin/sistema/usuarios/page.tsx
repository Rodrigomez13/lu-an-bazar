import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { UserRoleManager } from "@/components/admin/user-role-manager";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getStaffUsers } from "@/lib/system-admin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const result = await getStaffUsers();
  return <AdminModuleShell activePath="/admin/sistema/usuarios" eyebrow="Sistema" title="Usuarios y roles" description="Cuentas internas de Supabase Auth y permisos separados para catálogo, ventas, finanzas y cobranzas.">
    <AdminSetupNotice message={result.issue} />
    <UserRoleManager users={result.users} enabled={isSupabaseAdminConfigured() && !result.issue} />
  </AdminModuleShell>;
}

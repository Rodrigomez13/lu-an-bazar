import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { LoanClientManager } from "@/components/admin/loan-client-manager";
import { getFinanceWorkspace } from "@/lib/finance";
import { getFinanceSettings } from "@/lib/system-admin";
import { getAdminActor } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function PrivateCustomersPage() {
  const [workspace, settingsResult, actor] = await Promise.all([getFinanceWorkspace(), getFinanceSettings(), getAdminActor()]);
  return <AdminModuleShell activePath="/admin/prestamos/clientes" eyebrow="Préstamos personales" title="Clientes privados" description="Legajos confidenciales, documentación de contacto y alta de préstamos con su plan de cuotas.">
    <AdminSetupNotice message={workspace.issue ?? settingsResult.issue} />
    <LoanClientManager customers={workspace.customers} settings={settingsResult.settings} enabled={workspace.configured && !workspace.issue} canCreateLoan={actor?.role === "admin" || actor?.role === "finance_manager"} />
  </AdminModuleShell>;
}

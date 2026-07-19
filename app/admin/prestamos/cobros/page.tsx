import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { CollectionsManager } from "@/components/admin/collections-manager";
import { getFinanceWorkspace } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const workspace = await getFinanceWorkspace();
  return <AdminModuleShell activePath="/admin/prestamos/cobros" eyebrow="Préstamos personales" title="Cuotas y cobros" description="Consulta el plan de pagos, registra cobros parciales o totales y conserva el historial de cada operación.">
    <AdminSetupNotice message={workspace.issue} />
    <CollectionsManager installments={workspace.installments} payments={workspace.payments} enabled={workspace.configured && !workspace.issue} />
  </AdminModuleShell>;
}

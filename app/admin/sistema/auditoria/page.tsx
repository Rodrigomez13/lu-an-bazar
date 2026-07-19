import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { AuditTable } from "@/components/admin/audit-table";
import { getAuditEntries } from "@/lib/system-admin";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const result = await getAuditEntries();
  return <AdminModuleShell activePath="/admin/sistema/auditoria" eyebrow="Sistema" title="Auditoría" description="Historial de altas, modificaciones y bajas sobre catálogo, clientes y operaciones financieras.">
    <AdminSetupNotice message={result.issue} />
    <AuditTable entries={result.entries} />
  </AdminModuleShell>;
}

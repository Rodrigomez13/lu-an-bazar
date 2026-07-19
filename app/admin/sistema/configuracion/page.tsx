import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { SettingsManager } from "@/components/admin/settings-manager";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getFinanceSettings } from "@/lib/system-admin";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await getFinanceSettings();
  return <AdminModuleShell activePath="/admin/sistema/configuracion" eyebrow="Sistema" title="Configuración" description="Parámetros privados para originación, vencimientos, mora y mensajes de seguimiento.">
    <AdminSetupNotice message={result.issue} />
    <SettingsManager initialSettings={result.settings} enabled={isSupabaseAdminConfigured() && !result.issue} />
  </AdminModuleShell>;
}

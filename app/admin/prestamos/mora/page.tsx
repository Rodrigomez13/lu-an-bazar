import { MessageCircle, PhoneCall } from "lucide-react";
import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinanceWorkspace } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/finance-shared";
import { getFinanceSettings } from "@/lib/system-admin";

export const dynamic = "force-dynamic";

function reminderUrl(phone: string, template: string, item: { customerName: string; installmentNumber: number; loanNumber: number; balance: number; dueDate: string }) {
  const message = template.replaceAll("{nombre}", item.customerName).replaceAll("{cuota}", String(item.installmentNumber)).replaceAll("{prestamo}", String(item.loanNumber)).replaceAll("{saldo}", formatMoney(item.balance)).replaceAll("{vencimiento}", formatDate(item.dueDate));
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export default async function OverduePage() {
  const [workspace, settingsResult] = await Promise.all([getFinanceWorkspace(), getFinanceSettings()]);
  const overdue = workspace.installments.filter((item) => item.status === "overdue" && item.balance > 0).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const total = overdue.reduce((sum, item) => sum + item.balance, 0);
  const now = new Date();
  return <AdminModuleShell activePath="/admin/prestamos/mora" eyebrow="Préstamos personales" title="Mora y recordatorios" description="Seguimiento manual de cuotas vencidas. Los recordatorios se abren en WhatsApp únicamente cuando un administrador lo decide.">
    <AdminSetupNotice message={workspace.issue ?? settingsResult.issue} />
    <div className="mb-6 grid gap-4 sm:grid-cols-3"><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Saldo vencido</p><p className="mt-2 font-serif text-3xl text-destructive">{formatMoney(total)}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Cuotas en mora</p><p className="mt-2 font-serif text-3xl">{overdue.length}</p></CardContent></Card><Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Clientes a contactar</p><p className="mt-2 font-serif text-3xl">{new Set(overdue.map((item) => item.customerId)).size}</p></CardContent></Card></div>
    <Card><CardHeader><CardTitle className="font-serif text-2xl">Seguimiento de vencidos</CardTitle></CardHeader><CardContent className="grid gap-3">{!overdue.length && <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No hay cuotas vencidas.</p>}{overdue.map((item) => { const days = Math.max(1, Math.floor((now.getTime() - new Date(`${item.dueDate}T00:00:00-03:00`).getTime()) / 86400000)); return <div key={item.id} className="rounded-xl border p-4"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{item.customerName}</p><Badge variant="destructive">{days} días de mora</Badge></div><p className="mt-1 text-sm text-muted-foreground">Préstamo #{item.loanNumber} · Cuota {item.installmentNumber} · venció {formatDate(item.dueDate)}</p><p className="mt-2 font-serif text-2xl">{formatMoney(item.balance)}</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><a href={`tel:${item.customerPhone}`}><PhoneCall /> Llamar</a></Button><Button asChild><a href={reminderUrl(item.customerPhone, settingsResult.settings.reminderTemplate, item)} target="_blank" rel="noreferrer"><MessageCircle /> Abrir recordatorio</a></Button></div></div></div>; })}</CardContent></Card>
  </AdminModuleShell>;
}

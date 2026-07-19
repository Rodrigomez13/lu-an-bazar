import Link from "next/link";
import { AlertTriangle, ArrowRight, Banknote, CalendarClock, CircleDollarSign, Users } from "lucide-react";
import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinanceWorkspace } from "@/lib/finance";
import { formatDate, formatMoney } from "@/lib/finance-shared";

export const dynamic = "force-dynamic";

export default async function FinancialDashboardPage() {
  const data = await getFinanceWorkspace();
  const activeLoanIds = new Set(data.loans.filter((loan) => ["active", "overdue"].includes(loan.status)).map((loan) => loan.id));
  const open = data.installments.filter((item) => activeLoanIds.has(item.loanId) && ["pending", "partial", "overdue"].includes(item.status));
  const overdue = open.filter((item) => item.status === "overdue");
  const monthKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
  const collectedThisMonth = data.payments.filter((payment) => payment.paidAt.slice(0, 7) === monthKey).reduce((sum, payment) => sum + payment.amount, 0);
  const outstanding = open.reduce((sum, item) => sum + item.balance, 0);
  const nextDues = open.filter((item) => item.status !== "overdue").slice(0, 8);

  const metrics = [
    { label: "Cartera pendiente", value: formatMoney(outstanding), note: `${activeLoanIds.size} préstamos abiertos`, icon: CircleDollarSign },
    { label: "Cobrado este mes", value: formatMoney(collectedThisMonth), note: `${data.payments.filter((payment) => payment.paidAt.slice(0, 7) === monthKey).length} pagos`, icon: Banknote },
    { label: "Cuotas vencidas", value: String(overdue.length), note: formatMoney(overdue.reduce((sum, item) => sum + item.balance, 0)), icon: AlertTriangle },
    { label: "Clientes privados", value: String(data.customers.filter((customer) => customer.active).length), note: "Legajos activos", icon: Users },
  ];

  return <AdminModuleShell activePath="/admin/prestamos" eyebrow="Préstamos personales" title="Panel financiero" description="Cartera privada e independiente del catálogo comercial. Todos los importes y legajos se mantienen dentro del área administrativa.">
    <AdminSetupNotice message={data.issue} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => { const Icon = metric.icon; return <Card key={metric.label}><CardContent className="pt-6"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{metric.label}</p><p className="mt-2 font-serif text-3xl">{metric.value}</p><p className="mt-2 text-xs text-accent">{metric.note}</p></div><span className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="size-5" /></span></div></CardContent></Card>; })}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <Card><CardHeader className="flex-row items-center justify-between"><div><CardTitle className="font-serif text-2xl">Próximos vencimientos</CardTitle><p className="mt-1 text-sm text-muted-foreground">Cuotas abiertas ordenadas por fecha.</p></div><Button asChild variant="outline" size="sm"><Link href="/admin/prestamos/cobros">Ver cobros <ArrowRight /></Link></Button></CardHeader><CardContent className="grid gap-3">{!nextDues.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay vencimientos pendientes.</p>}{nextDues.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">{item.customerName}</p><p className="text-sm text-muted-foreground">Préstamo #{item.loanNumber} · Cuota {item.installmentNumber}</p></div><div className="text-right"><p className="font-semibold">{formatMoney(item.balance)}</p><p className="text-sm text-muted-foreground">{formatDate(item.dueDate)}</p></div></div>)}</CardContent></Card>
      <div className="grid content-start gap-6">
        <Card><CardHeader><CardTitle className="font-serif text-2xl">Acciones rápidas</CardTitle></CardHeader><CardContent className="grid gap-3"><Button asChild className="justify-between"><Link href="/admin/prestamos/clientes"><span className="flex items-center gap-2"><Users /> Nuevo cliente o préstamo</span><ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/admin/prestamos/cobros"><span className="flex items-center gap-2"><Banknote /> Registrar cobro</span><ArrowRight /></Link></Button><Button asChild variant="outline" className="justify-between"><Link href="/admin/prestamos/mora"><span className="flex items-center gap-2"><AlertTriangle /> Gestionar mora</span><ArrowRight /></Link></Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><CalendarClock className="size-5" /> Estado de mora</CardTitle></CardHeader><CardContent>{overdue.length ? <><p className="font-serif text-3xl text-destructive">{formatMoney(overdue.reduce((sum, item) => sum + item.balance, 0))}</p><p className="mt-2 text-sm text-muted-foreground">Saldo vencido en {overdue.length} cuotas.</p><Badge variant="destructive" className="mt-4">Requiere seguimiento</Badge></> : <p className="text-sm text-muted-foreground">No hay cuotas vencidas registradas.</p>}</CardContent></Card>
      </div>
    </div>
  </AdminModuleShell>;
}

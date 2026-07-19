"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Banknote, LoaderCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney, type InstallmentRecord, type PaymentRecord } from "@/lib/finance-shared";

export function CollectionsManager({ installments, payments, enabled }: { installments: InstallmentRecord[]; payments: PaymentRecord[]; enabled: boolean }) {
  const openInstallments = installments.filter((item) => ["pending", "partial", "overdue"].includes(item.status) && item.balance > 0);
  const [selectedId, setSelectedId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [query, setQuery] = useState("");
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text ? openInstallments.filter((item) => `${item.customerName} ${item.loanNumber} ${item.installmentNumber}`.toLowerCase().includes(text)) : openInstallments;
  }, [openInstallments, query]);
  const selected = openInstallments.find((item) => item.id === selectedId);

  const selectInstallment = (item: InstallmentRecord) => { setSelectedId(item.id); setAmount(String(item.balance)); };
  const save = () => startTransition(async () => {
    const response = await fetch("/api/admin/finance/payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ installmentId: selectedId, amount, method, reference, notes }) });
    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as { error?: string };
      toast.error(data.error ?? "No se pudo registrar el cobro.");
      return;
    }
    toast.success("Cobro registrado y cuota actualizada.");
    setSelectedId(""); setAmount(""); setReference(""); setNotes("");
    router.refresh();
  });

  return <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
    <div className="grid gap-6">
      <Card><CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="font-serif text-2xl">Cuotas pendientes</CardTitle><p className="mt-1 text-sm text-muted-foreground">{openInstallments.length} cuotas con saldo</p></div><label className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cliente o préstamo" /></label></CardHeader><CardContent className="grid gap-3">{!filtered.length && <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No hay cuotas pendientes.</div>}{filtered.map((item) => <button key={item.id} type="button" onClick={() => selectInstallment(item)} className={`rounded-xl border p-4 text-left transition-colors hover:bg-secondary/60 ${selectedId === item.id ? "border-primary bg-primary/5" : ""}`}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold">{item.customerName}</p><p className="mt-1 text-sm text-muted-foreground">Préstamo #{item.loanNumber} · Cuota {item.installmentNumber} · vence {formatDate(item.dueDate)}</p></div><div className="text-right"><p className="font-semibold">{formatMoney(item.balance)}</p><Badge variant={item.status === "overdue" ? "destructive" : "secondary"}>{item.status === "overdue" ? "Vencida" : item.status === "partial" ? "Parcial" : "Pendiente"}</Badge></div></div></button>)}</CardContent></Card>
      <Card><CardHeader><CardTitle className="font-serif text-2xl">Últimos cobros</CardTitle></CardHeader><CardContent className="grid gap-3">{!payments.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Todavía no se registraron cobros.</p>}{payments.slice(0, 20).map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><p className="font-semibold">{payment.customerName}</p><p className="text-sm text-muted-foreground">Préstamo #{payment.loanNumber} · {new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(payment.paidAt))}</p></div><div className="text-right"><p className="font-semibold text-accent">{formatMoney(payment.amount)}</p><p className="text-xs text-muted-foreground">{payment.method === "cash" ? "Efectivo" : payment.method === "transfer" ? "Transferencia" : "Otro"}</p></div></div>)}</CardContent></Card>
    </div>
    <Card className="h-fit xl:sticky xl:top-6"><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><Banknote className="size-5" /> Registrar cobro</CardTitle></CardHeader><CardContent className="grid gap-4">{selected ? <div className="rounded-xl bg-secondary p-4 text-sm"><p className="font-semibold">{selected.customerName}</p><p>Préstamo #{selected.loanNumber} · Cuota {selected.installmentNumber}</p><p className="mt-1 text-muted-foreground">Saldo {formatMoney(selected.balance)}</p></div> : <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">Seleccioná una cuota de la lista.</p>}<Field label="Importe"><Input type="number" min="0.01" step="0.01" max={selected?.balance} value={amount} onChange={(event) => setAmount(event.target.value)} /></Field><Field label="Medio de pago"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={method} onChange={(event) => setMethod(event.target.value)}><option value="cash">Efectivo</option><option value="transfer">Transferencia</option><option value="other">Otro</option></select></Field><Field label="Referencia"><Input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Comprobante opcional" /></Field><Field label="Notas"><Textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></Field><Button onClick={save} disabled={busy || !enabled || !selectedId}>{busy && <LoaderCircle className="animate-spin" />}Confirmar cobro</Button></CardContent></Card>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <Label className="grid gap-2">{label}{children}</Label>; }

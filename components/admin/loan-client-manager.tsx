"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, LoaderCircle, Pencil, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { LoanCustomer } from "@/lib/finance-shared";
import type { FinanceSettings } from "@/lib/system-admin";

type CustomerDraft = Omit<LoanCustomer, "fileNumber" | "createdAt">;
const emptyCustomer: CustomerDraft = { id: "", fullName: "", documentType: "DNI", documentNumber: "", taxId: "", birthDate: "", phone: "", email: "", address: "", employmentNotes: "", privateNotes: "", active: true };

async function responseError(response: Response) {
  try { return ((await response.json()) as { error?: string }).error ?? "No se pudo completar la operación."; }
  catch { return "No se pudo completar la operación."; }
}

export function LoanClientManager({ customers, settings, enabled, canCreateLoan }: { customers: LoanCustomer[]; settings: FinanceSettings; enabled: boolean; canCreateLoan: boolean }) {
  const [draft, setDraft] = useState<CustomerDraft>(emptyCustomer);
  const [query, setQuery] = useState("");
  const [loanDraft, setLoanDraft] = useState({ customerId: "", principal: "", interestRate: String(settings.defaultInterestRate), installmentCount: String(settings.defaultInstallments), frequency: settings.defaultFrequency, firstDueDate: "", notes: "" });
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    return text ? customers.filter((customer) => `${customer.fullName} ${customer.documentNumber} ${customer.phone}`.toLowerCase().includes(text)) : customers;
  }, [customers, query]);
  const update = <K extends keyof CustomerDraft>(key: K, value: CustomerDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const saveCustomer = () => startTransition(async () => {
    const response = await fetch("/api/admin/finance/customers", { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    if (!response.ok) { toast.error(await responseError(response)); return; }
    toast.success(draft.id ? "Cliente actualizado." : "Cliente privado creado.");
    setDraft(emptyCustomer);
    router.refresh();
  });

  const archive = (customer: LoanCustomer) => {
    if (!window.confirm(`¿Archivar el legajo de ${customer.fullName}?`)) return;
    startTransition(async () => {
      const response = await fetch("/api/admin/finance/customers", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: customer.id }) });
      if (!response.ok) { toast.error(await responseError(response)); return; }
      toast.success("Cliente archivado.");
      router.refresh();
    });
  };

  const createLoan = () => startTransition(async () => {
    const response = await fetch("/api/admin/finance/loans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(loanDraft) });
    if (!response.ok) { toast.error(await responseError(response)); return; }
    toast.success("Préstamo y plan de cuotas creados.");
    setLoanDraft((current) => ({ ...current, customerId: "", principal: "", firstDueDate: "", notes: "" }));
    router.refresh();
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <div className="grid h-fit gap-6 xl:sticky xl:top-6">
        <Card>
          <CardHeader><CardTitle className="font-serif text-2xl">{draft.id ? "Editar legajo" : "Nuevo cliente privado"}</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Nombre completo"><Input value={draft.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field>
            <div className="grid grid-cols-[95px_1fr] gap-3"><Field label="Tipo"><Input value={draft.documentType} onChange={(event) => update("documentType", event.target.value)} /></Field><Field label="Documento"><Input inputMode="numeric" value={draft.documentNumber} onChange={(event) => update("documentNumber", event.target.value)} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Teléfono"><Input type="tel" value={draft.phone} onChange={(event) => update("phone", event.target.value)} /></Field><Field label="Nacimiento"><Input type="date" value={draft.birthDate} onChange={(event) => update("birthDate", event.target.value)} /></Field></div>
            <Field label="Email"><Input type="email" value={draft.email} onChange={(event) => update("email", event.target.value)} /></Field>
            <Field label="Domicilio"><Input value={draft.address} onChange={(event) => update("address", event.target.value)} /></Field>
            <Field label="Datos laborales"><Textarea rows={2} value={draft.employmentNotes} onChange={(event) => update("employmentNotes", event.target.value)} /></Field>
            <Field label="Notas privadas"><Textarea rows={3} value={draft.privateNotes} onChange={(event) => update("privateNotes", event.target.value)} /></Field>
            <div className="flex gap-2"><Button className="flex-1" onClick={saveCustomer} disabled={busy || !enabled}>{busy && <LoaderCircle className="animate-spin" />}{draft.id ? "Guardar" : "Crear legajo"}</Button>{draft.id && <Button variant="ghost" onClick={() => setDraft(emptyCustomer)}>Cancelar</Button>}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><CreditCard className="size-5" /> Nuevo préstamo</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Cliente"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={loanDraft.customerId} onChange={(event) => setLoanDraft((current) => ({ ...current, customerId: event.target.value }))}><option value="">Seleccionar…</option>{customers.filter((customer) => customer.active).map((customer) => <option key={customer.id} value={customer.id}>#{customer.fileNumber} · {customer.fullName}</option>)}</select></Field>
            <div className="grid grid-cols-2 gap-3"><Field label="Capital"><Input type="number" min="1" value={loanDraft.principal} onChange={(event) => setLoanDraft((current) => ({ ...current, principal: event.target.value }))} /></Field><Field label="Interés total %"><Input type="number" min="0" step="0.01" value={loanDraft.interestRate} onChange={(event) => setLoanDraft((current) => ({ ...current, interestRate: event.target.value }))} /></Field></div>
            <div className="grid grid-cols-2 gap-3"><Field label="Cuotas"><Input type="number" min="1" max="120" value={loanDraft.installmentCount} onChange={(event) => setLoanDraft((current) => ({ ...current, installmentCount: event.target.value }))} /></Field><Field label="Frecuencia"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={loanDraft.frequency} onChange={(event) => setLoanDraft((current) => ({ ...current, frequency: event.target.value as FinanceSettings["defaultFrequency"] }))}><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option></select></Field></div>
            <Field label="Primer vencimiento"><Input type="date" value={loanDraft.firstDueDate} onChange={(event) => setLoanDraft((current) => ({ ...current, firstDueDate: event.target.value }))} /></Field>
            <Field label="Observaciones"><Textarea rows={2} value={loanDraft.notes} onChange={(event) => setLoanDraft((current) => ({ ...current, notes: event.target.value }))} /></Field>
            <Button onClick={createLoan} disabled={busy || !enabled || !customers.length || !canCreateLoan}>{busy && <LoaderCircle className="animate-spin" />}{canCreateLoan ? "Crear préstamo y cuotas" : "Requiere rol Finanzas"}</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="font-serif text-2xl">Legajos privados</CardTitle><p className="mt-1 text-sm text-muted-foreground">{customers.length} clientes registrados</p></div><label className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nombre, DNI o teléfono" /></label></CardHeader>
        <CardContent className="grid gap-3">
          {!filtered.length && <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"><UserRound className="mx-auto mb-3 size-8" />Todavía no hay legajos privados.</div>}
          {filtered.map((customer) => <div key={customer.id} className="rounded-xl border p-4"><div className="flex flex-col gap-4 sm:flex-row sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">#{customer.fileNumber} · {customer.fullName}</p><Badge variant={customer.active ? "secondary" : "outline"}>{customer.active ? "Activo" : "Inactivo"}</Badge></div><div className="mt-2 grid gap-1 text-sm text-muted-foreground"><p>{customer.documentType} {customer.documentNumber}</p><p>{customer.phone} · {customer.email || "Sin email"}</p><p>{customer.address}</p></div>{customer.privateNotes && <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{customer.privateNotes}</p>}</div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setDraft({ id: customer.id, fullName: customer.fullName, documentType: customer.documentType, documentNumber: customer.documentNumber, taxId: customer.taxId, birthDate: customer.birthDate, phone: customer.phone, email: customer.email, address: customer.address, employmentNotes: customer.employmentNotes, privateNotes: customer.privateNotes, active: customer.active })}><Pencil /> Editar</Button><Button size="icon-sm" variant="ghost" aria-label={`Archivar ${customer.fullName}`} onClick={() => archive(customer)} disabled={busy}><Trash2 /></Button></div></div></div>)}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <Label className="grid gap-2">{label}{children}</Label>; }

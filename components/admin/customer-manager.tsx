"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowLeft,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BazarCustomer } from "@/lib/customers";

type CustomerDraft = Omit<BazarCustomer, "createdAt" | "updatedAt">;
const emptyDraft: CustomerDraft = {
  id: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  notes: "",
  status: "active",
};

async function errorMessage(response: Response) {
  try {
    return ((await response.json()) as { error?: string }).error ?? "No se pudo completar la operación.";
  } catch {
    return "No se pudo completar la operación.";
  }
}

export function CustomerManager({
  initialCustomers,
  databaseConfigured,
}: {
  initialCustomers: BazarCustomer[];
  databaseConfigured: boolean;
}) {
  const [draft, setDraft] = useState<CustomerDraft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [busy, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    if (!text) return initialCustomers;
    return initialCustomers.filter((customer) =>
      `${customer.fullName} ${customer.phone} ${customer.email} ${customer.address}`
        .toLowerCase()
        .includes(text),
    );
  }, [initialCustomers, query]);

  const update = <K extends keyof CustomerDraft>(key: K, value: CustomerDraft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const save = () => {
    if (!databaseConfigured) return toast.error("Primero configurá Supabase y ejecutá los SQL.");
    startTransition(async () => {
      const response = await fetch("/api/admin/customers", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        toast.error(await errorMessage(response));
        return;
      }
      toast.success(draft.id ? "Cliente actualizado." : "Cliente creado.");
      setDraft(emptyDraft);
      router.refresh();
    });
  };

  const archive = (customer: BazarCustomer) => {
    if (!window.confirm(`¿Archivar a “${customer.fullName}”?`)) return;
    startTransition(async () => {
      const response = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id }),
      });
      if (!response.ok) {
        toast.error(await errorMessage(response));
        return;
      }
      toast.success("Cliente archivado.");
      router.refresh();
    });
  };

  return (
    <main className="min-h-screen bg-secondary/35">
      <header className="border-b bg-brand-navy text-brand-cream">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline" className="border-brand-cream/25 bg-transparent text-brand-cream"><Link href="/admin"><ArrowLeft /> Panel</Link></Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-primary">Relaciones comerciales</p><h1 className="mt-2 font-serif text-4xl">Clientes del bazar</h1><p className="mt-2 text-sm text-muted-foreground">Agenda comercial independiente de los clientes de préstamos.</p></div>
          <Button onClick={() => setDraft(emptyDraft)}><Plus /> Nuevo cliente</Button>
        </div>
        {!databaseConfigured && <div className="mt-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm">Ejecutá los SQL y completá las claves de Supabase para habilitar esta agenda.</div>}

        <div className="mt-7 grid gap-6 lg:grid-cols-[380px_1fr]">
          <Card className="h-fit lg:sticky lg:top-6">
            <CardHeader><CardTitle className="font-serif text-2xl">{draft.id ? "Editar cliente" : "Nuevo cliente"}</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <CustomerField label="Nombre completo"><Input value={draft.fullName} onChange={(e) => update("fullName", e.target.value)} /></CustomerField>
              <CustomerField label="WhatsApp / teléfono"><Input type="tel" value={draft.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+54 9..." /></CustomerField>
              <CustomerField label="Email"><Input type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} /></CustomerField>
              <CustomerField label="Dirección"><Input value={draft.address} onChange={(e) => update("address", e.target.value)} /></CustomerField>
              <CustomerField label="Estado">
                <select value={draft.status} onChange={(e) => update("status", e.target.value as CustomerDraft["status"])} className="h-9 rounded-lg border bg-transparent px-3 text-sm"><option value="active">Activo</option><option value="prospect">Potencial</option><option value="inactive">Inactivo</option></select>
              </CustomerField>
              <CustomerField label="Notas"><Textarea rows={4} value={draft.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Preferencias, consultas o seguimiento comercial" /></CustomerField>
              <div className="flex gap-2"><Button className="flex-1" onClick={save} disabled={busy || !databaseConfigured}>{busy && <LoaderCircle className="animate-spin" />}{draft.id ? "Guardar" : "Crear cliente"}</Button>{draft.id && <Button variant="ghost" onClick={() => setDraft(emptyDraft)}>Cancelar</Button>}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><CardTitle className="font-serif text-2xl">Agenda</CardTitle><p className="mt-1 text-sm text-muted-foreground">{initialCustomers.length} clientes registrados</p></div>
              <label className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Buscar..." /></label>
            </CardHeader>
            <CardContent className="grid gap-3">
              {!filtered.length && <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"><UserRound className="mx-auto mb-3 size-8" />Todavía no hay clientes para mostrar.</div>}
              {filtered.map((customer) => (
                <div key={customer.id} className="rounded-xl border p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{customer.fullName}</p><StatusBadge status={customer.status} /></div><div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">{customer.phone && <a href={`tel:${customer.phone}`} className="flex items-center gap-2 hover:text-foreground"><Phone className="size-4" />{customer.phone}</a>}{customer.email && <a href={`mailto:${customer.email}`} className="flex items-center gap-2 hover:text-foreground"><Mail className="size-4" />{customer.email}</a>}{customer.address && <p className="flex items-center gap-2"><MapPin className="size-4" />{customer.address}</p>}</div>{customer.notes && <p className="mt-3 rounded-lg bg-secondary p-3 text-sm">{customer.notes}</p>}</div>
                    <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setDraft({ id: customer.id, fullName: customer.fullName, phone: customer.phone, email: customer.email, address: customer.address, notes: customer.notes, status: customer.status })}><Pencil /> Editar</Button><Button size="icon-sm" variant="ghost" onClick={() => archive(customer)} disabled={busy} aria-label={`Archivar ${customer.fullName}`}><Trash2 /></Button></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function CustomerField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}</div>;
}

function StatusBadge({ status }: { status: BazarCustomer["status"] }) {
  if (status === "active") return <Badge>Activo</Badge>;
  if (status === "prospect") return <Badge variant="secondary">Potencial</Badge>;
  return <Badge variant="outline">Inactivo</Badge>;
}

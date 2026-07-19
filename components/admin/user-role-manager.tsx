"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Pencil, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AppRole, StaffUser } from "@/lib/system-admin";

const roleLabels: Record<AppRole, string> = { admin: "Administrador", catalog_manager: "Catálogo", seller: "Ventas", finance_manager: "Finanzas", collections: "Cobranzas" };
const emptyDraft = { id: "", fullName: "", email: "", password: "", role: "seller" as AppRole, active: true };

export function UserRoleManager({ users, enabled }: { users: StaffUser[]; enabled: boolean }) {
  const [draft, setDraft] = useState(emptyDraft);
  const [query, setQuery] = useState("");
  const [busy, startTransition] = useTransition();
  const router = useRouter();
  const filtered = useMemo(() => { const text = query.trim().toLowerCase(); return text ? users.filter((user) => `${user.fullName} ${user.email} ${roleLabels[user.role]}`.toLowerCase().includes(text)) : users; }, [query, users]);
  const save = () => startTransition(async () => {
    const response = await fetch("/api/admin/system/users", { method: draft.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { toast.error(data.error ?? "No se pudo guardar el usuario."); return; }
    toast.success(draft.id ? "Permisos actualizados." : "Usuario creado en Supabase Auth.");
    setDraft(emptyDraft);
    router.refresh();
  });
  return <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
    <Card className="h-fit lg:sticky lg:top-6"><CardHeader><CardTitle className="font-serif text-2xl">{draft.id ? "Editar permisos" : "Nuevo usuario"}</CardTitle></CardHeader><CardContent className="grid gap-4"><Field label="Nombre completo"><Input value={draft.fullName} onChange={(event) => setDraft((current) => ({ ...current, fullName: event.target.value }))} /></Field><Field label="Email"><Input type="email" disabled={Boolean(draft.id)} value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} /></Field>{!draft.id && <Field label="Contraseña temporal"><Input type="password" minLength={8} value={draft.password} onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))} /></Field>}<Field label="Rol"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as AppRole }))}>{Object.entries(roleLabels).map(([role, label]) => <option key={role} value={role}>{label}</option>)}</select></Field>{draft.id && <label className="flex items-center gap-2 text-sm"><Checkbox checked={draft.active} onCheckedChange={(checked) => setDraft((current) => ({ ...current, active: checked === true }))} /> Usuario activo</label>}<div className="rounded-xl bg-secondary p-3 text-xs text-muted-foreground">Finanzas accede a préstamos y configuración financiera. Cobranzas accede a cuotas, cobros y mora. Catálogo y Ventas no pueden leer datos de préstamos.</div><div className="flex gap-2"><Button className="flex-1" onClick={save} disabled={busy || !enabled}>{busy && <LoaderCircle className="animate-spin" />}{draft.id ? "Guardar permisos" : "Crear usuario"}</Button>{draft.id && <Button variant="ghost" onClick={() => setDraft(emptyDraft)}>Cancelar</Button>}</div></CardContent></Card>
    <Card><CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="font-serif text-2xl">Equipo y roles</CardTitle><p className="mt-1 text-sm text-muted-foreground">{users.length} cuentas registradas</p></div><label className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar usuario" /></label></CardHeader><CardContent className="grid gap-3">{!filtered.length && <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"><ShieldCheck className="mx-auto mb-3 size-8" />No hay usuarios para mostrar.</div>}{filtered.map((user) => <div key={user.id} className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{user.fullName}</p><Badge variant={user.active ? "secondary" : "outline"}>{user.active ? "Activo" : "Inactivo"}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{user.email}</p><p className="mt-2 text-xs">Rol: <strong>{roleLabels[user.role]}</strong>{user.lastSignInAt ? ` · Último acceso ${new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" }).format(new Date(user.lastSignInAt))}` : " · Sin accesos"}</p></div><Button size="sm" variant="outline" onClick={() => setDraft({ id: user.id, fullName: user.fullName, email: user.email, password: "", role: user.role, active: user.active })}><Pencil /> Editar</Button></div>)}</CardContent></Card>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <Label className="grid gap-2">{label}{children}</Label>; }

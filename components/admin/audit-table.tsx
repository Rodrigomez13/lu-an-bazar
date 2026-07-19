"use client";

import { useMemo, useState } from "react";
import { FileClock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditEntry } from "@/lib/system-admin";

const areaLabel: Record<string, string> = { catalog: "Catálogo", customers: "Clientes", loans: "Préstamos", security: "Seguridad" };
const actionLabel: Record<string, string> = { insert: "Alta", update: "Edición", delete: "Baja" };

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const filtered = useMemo(() => { const text = query.trim().toLowerCase(); return entries.filter((entry) => (area === "all" || entry.area === area) && (!text || `${entry.actorName} ${entry.action} ${entry.entityTable} ${entry.entityId}`.toLowerCase().includes(text))); }, [area, entries, query]);
  return <Card><CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between"><div><CardTitle className="font-serif text-2xl">Registro de actividad</CardTitle><p className="mt-1 text-sm text-muted-foreground">Últimos {entries.length} eventos conservados</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Usuario, tabla o ID" /></label><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={area} onChange={(event) => setArea(event.target.value)}><option value="all">Todas las áreas</option><option value="catalog">Catálogo</option><option value="customers">Clientes</option><option value="loans">Préstamos</option><option value="security">Seguridad</option></select></div></CardHeader><CardContent>{!filtered.length ? <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground"><FileClock className="mx-auto mb-3 size-8" />No hay eventos que coincidan.</div> : <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Fecha</TableHead><TableHead>Actor</TableHead><TableHead>Área</TableHead><TableHead>Acción</TableHead><TableHead>Entidad</TableHead><TableHead>ID</TableHead></TableRow></TableHeader><TableBody>{filtered.map((entry) => <TableRow key={entry.id}><TableCell className="whitespace-nowrap font-mono text-xs">{new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(entry.createdAt))}</TableCell><TableCell>{entry.actorName}</TableCell><TableCell><Badge variant="outline">{areaLabel[entry.area] ?? entry.area}</Badge></TableCell><TableCell>{actionLabel[entry.action] ?? entry.action}</TableCell><TableCell className="font-mono text-xs">{entry.entityTable}</TableCell><TableCell className="max-w-48 truncate font-mono text-xs">{entry.entityId || "—"}</TableCell></TableRow>)}</TableBody></Table></div>}</CardContent></Card>;
}

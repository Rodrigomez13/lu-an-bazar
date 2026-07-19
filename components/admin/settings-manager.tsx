"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Save, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FinanceSettings } from "@/lib/system-admin";

export function SettingsManager({ initialSettings, enabled }: { initialSettings: FinanceSettings; enabled: boolean }) {
  const [settings, setSettings] = useState(initialSettings);
  const [busy, startTransition] = useTransition();
  const updateNumber = (key: keyof FinanceSettings, value: string) => setSettings((current) => ({ ...current, [key]: Number(value) }));
  const save = () => startTransition(async () => {
    const response = await fetch("/api/admin/system/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    const data = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { toast.error(data.error ?? "No se pudo guardar la configuración."); return; }
    toast.success("Configuración financiera guardada.");
  });
  return <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
    <Card><CardHeader><CardTitle className="flex items-center gap-2 font-serif text-2xl"><Settings className="size-5" /> Parámetros de préstamos</CardTitle><p className="text-sm text-muted-foreground">Valores sugeridos al crear un préstamo. Pueden cambiarse en cada operación.</p></CardHeader><CardContent className="grid gap-5"><div className="grid gap-4 sm:grid-cols-2"><Field label="Interés total predeterminado (%)"><Input type="number" min="0" step="0.01" value={settings.defaultInterestRate} onChange={(event) => updateNumber("defaultInterestRate", event.target.value)} /></Field><Field label="Cantidad de cuotas"><Input type="number" min="1" max="120" value={settings.defaultInstallments} onChange={(event) => updateNumber("defaultInstallments", event.target.value)} /></Field><Field label="Frecuencia"><select className="h-9 rounded-lg border bg-background px-3 text-sm" value={settings.defaultFrequency} onChange={(event) => setSettings((current) => ({ ...current, defaultFrequency: event.target.value as FinanceSettings["defaultFrequency"] }))}><option value="weekly">Semanal</option><option value="biweekly">Quincenal</option><option value="monthly">Mensual</option></select></Field><Field label="Días de gracia"><Input type="number" min="0" max="365" value={settings.graceDays} onChange={(event) => updateNumber("graceDays", event.target.value)} /></Field><Field label="Tasa de mora informativa (%)"><Input type="number" min="0" step="0.01" value={settings.lateFeeRate} onChange={(event) => updateNumber("lateFeeRate", event.target.value)} /></Field></div><Field label="Plantilla de recordatorio por WhatsApp"><Textarea rows={7} value={settings.reminderTemplate} onChange={(event) => setSettings((current) => ({ ...current, reminderTemplate: event.target.value }))} /></Field><p className="text-xs text-muted-foreground">Variables disponibles: {'{nombre}'}, {'{cuota}'}, {'{prestamo}'}, {'{saldo}'} y {'{vencimiento}'}.</p><Button className="w-fit" onClick={save} disabled={busy || !enabled}>{busy ? <LoaderCircle className="animate-spin" /> : <Save />} Guardar configuración</Button></CardContent></Card>
    <Card className="h-fit"><CardHeader><CardTitle className="font-serif text-2xl">Criterios del sistema</CardTitle></CardHeader><CardContent className="grid gap-3 text-sm text-muted-foreground"><p>La tasa cargada representa interés total sobre el capital, no una tasa efectiva anual.</p><p>La mora se detecta por fecha de vencimiento y saldo pendiente.</p><p>El cargo por mora queda sólo como parámetro informativo: no se capitaliza automáticamente para evitar modificar deuda sin una decisión explícita.</p><p>Los recordatorios nunca se envían solos; el administrador revisa el mensaje antes de abrir WhatsApp.</p></CardContent></Card>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <Label className="grid gap-2">{label}{children}</Label>; }

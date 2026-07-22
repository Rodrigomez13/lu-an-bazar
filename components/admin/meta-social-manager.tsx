"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ArrowUpRight,
  BadgeCheck,
  CircleAlert,
  Clipboard,
  ExternalLink,
  FileDown,
  LoaderCircle,
  Megaphone,
  PackagePlus,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { AdminProduct } from "@/lib/catalog";
import type { MetaPostRow } from "@/lib/meta-social";
import { categories, formatARS } from "@/lib/data";

async function api(body: Record<string, unknown>) {
  const response = await fetch("/api/admin/meta/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string; found?: number };
  if (!response.ok) throw new Error(result.error || "La operación no pudo completarse.");
  return result;
}

export function MetaSocialManager({
  products,
  posts,
  requestedProduct,
  databaseReady,
  pageReady,
  webhookReady,
  conversionsReady,
  pixelReady,
  facebookUrl,
  feedUrl,
  webhookUrl,
}: {
  products: AdminProduct[];
  posts: MetaPostRow[];
  requestedProduct: string;
  databaseReady: boolean;
  pageReady: boolean;
  webhookReady: boolean;
  conversionsReady: boolean;
  pixelReady: boolean;
  facebookUrl: string;
  feedUrl: string;
  webhookUrl: string;
}) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [productId, setProductId] = useState(
    products.some((product) => product.databaseId === requestedProduct)
      ? requestedProduct
      : products.find((product) => product.databaseId)?.databaseId ?? "",
  );
  const outbound = posts.filter((post) => post.direction === "outbound");
  const inbound = posts.filter((post) => post.direction === "inbound");

  const run = (task: () => Promise<void>) => startTransition(async () => {
    try {
      await task();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar la operación.");
    }
  });

  return (
    <Tabs defaultValue="publicar" className="gap-5">
      <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 sm:w-fit">
        <TabsTrigger value="publicar" className="px-3 py-2"><Megaphone /> Publicar</TabsTrigger>
        <TabsTrigger value="importar" className="px-3 py-2"><FileDown /> Importar</TabsTrigger>
        <TabsTrigger value="conexion" className="px-3 py-2"><ShieldCheck /> Conexión</TabsTrigger>
      </TabsList>

      <TabsContent value="publicar" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Crear desde un producto</CardTitle>
            <p className="text-sm text-muted-foreground">Genera texto, enlace medible e imagen desde la ficha actual. Podés editar todo antes de publicar.</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="meta-product">Producto</Label>
              <select id="meta-product" value={productId} onChange={(event) => setProductId(event.target.value)} className="h-10 rounded-lg border bg-background px-3 text-sm">
                {products.filter((product) => product.databaseId).map((product) => (
                  <option key={product.databaseId} value={product.databaseId}>{product.name} {product.price ? `· ${formatARS(product.price)}` : ""}</option>
                ))}
              </select>
            </div>
            <Button disabled={busy || !databaseReady || !productId} onClick={() => run(async () => {
              await api({ action: "create_draft", productId });
              toast.success("Borrador creado. Revisalo antes de publicarlo.");
            })}>{busy ? <LoaderCircle className="animate-spin" /> : <Megaphone />} Crear borrador</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {outbound.length ? outbound.map((post) => (
            <OutboundPost key={post.id} post={post} busy={busy} pageReady={pageReady} facebookUrl={facebookUrl} run={run} />
          )) : <EmptyState text="Todavía no hay borradores sociales." />}
        </div>
      </TabsContent>

      <TabsContent value="importar" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Publicaciones de la fan page</CardTitle>
            <p className="text-sm text-muted-foreground">Traé las últimas publicaciones para revisarlas. Las aprobadas se crean como productos en borrador, nunca como artículos públicos automáticos.</p>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3">
            <Button disabled={busy || !databaseReady || !pageReady} onClick={() => run(async () => {
              const result = await api({ action: "sync_imports" });
              toast.success(`Sincronización terminada: ${result.found ?? 0} publicaciones revisadas.`);
            })}>{busy ? <LoaderCircle className="animate-spin" /> : <RefreshCw />} Sincronizar fan page</Button>
            {!pageReady && <p className="text-xs text-amber-600">Disponible cuando cargues el ID y token de Página.</p>}
          </CardContent>
        </Card>
        <div className="grid gap-4 xl:grid-cols-2">
          {inbound.length ? inbound.map((post) => (
            <InboundPost key={post.id} post={post} busy={busy} run={run} />
          )) : <EmptyState text="No hay publicaciones pendientes de revisión." />}
        </div>
      </TabsContent>

      <TabsContent value="conexion">
        <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
          <Card>
            <CardHeader><CardTitle className="font-serif text-2xl">Estado técnico</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Check label="Pixel del navegador" ready={pixelReady} detail="Mide visitas y acciones con consentimiento." />
              <Check label="Conversions API" ready={conversionsReady} detail="Complementa eventos desde el servidor." />
              <Check label="Publicación e importación" ready={pageReady} detail="Requiere ID y token de acceso de la Página." />
              <Check label="Webhook firmado" ready={webhookReady} detail="Recibe cambios nuevos de la fan page." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="font-serif text-2xl">Direcciones para Meta</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-sm">
              <CopyRow label="Feed del catálogo" value={feedUrl} />
              <CopyRow label="Callback del webhook" value={webhookUrl} />
              <Button asChild variant="outline"><Link href="/admin/sistema/meta/guia">Ver guía completa <ArrowUpRight /></Link></Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function OutboundPost({ post, busy, pageReady, facebookUrl, run }: { post: MetaPostRow; busy: boolean; pageReady: boolean; facebookUrl: string; run: (task: () => Promise<void>) => void }) {
  const [message, setMessage] = useState(post.message);
  const save = () => api({ action: "update", id: post.id, message });
  const manual = async () => {
    await navigator.clipboard.writeText(`${message}\n\n${post.link_url ?? ""}`.trim());
    toast.success("Texto y enlace copiados. Pegalos en la publicación de Facebook.");
    if (facebookUrl) window.open(facebookUrl, "_blank", "noopener,noreferrer");
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-4 p-4 md:grid-cols-[120px_1fr]">
        <div className="min-h-28 rounded-xl bg-secondary bg-contain bg-center bg-no-repeat" style={post.image_url ? { backgroundImage: `url(${JSON.stringify(post.image_url).slice(1, -1)})` } : undefined} />
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2"><Badge variant={post.status === "published" ? "default" : post.status === "failed" ? "destructive" : "secondary"}>{statusLabel(post.status)}</Badge><span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleString("es-AR")}</span></div>
          <Textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={7} disabled={post.status === "published"} />
          {post.last_error && <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">{post.last_error}</p>}
          <div className="flex flex-wrap gap-2">
            {post.status !== "published" && <Button size="sm" variant="outline" disabled={busy} onClick={() => run(async () => { await save(); toast.success("Borrador guardado."); })}><Save /> Guardar</Button>}
            {post.status !== "published" && <Button size="sm" disabled={busy || !pageReady} onClick={() => run(async () => { await save(); await api({ action: "publish", id: post.id }); toast.success("Publicación enviada a Facebook."); })}><Send /> Publicar</Button>}
            {post.status !== "published" && <Button size="sm" variant="secondary" onClick={manual}><Clipboard /> Copiar y abrir Facebook</Button>}
            {post.link_url && <Button asChild size="sm" variant="ghost"><a href={post.link_url} target="_blank" rel="noreferrer">Ver producto <ExternalLink /></a></Button>}
            {post.permalink_url && <Button asChild size="sm" variant="ghost"><a href={post.permalink_url} target="_blank" rel="noreferrer">Ver publicación <ArrowUpRight /></a></Button>}
          </div>
          {!pageReady && post.status !== "published" && <p className="text-xs text-muted-foreground">La publicación automática está en pausa; el botón de copiar funciona sin token.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function InboundPost({ post, busy, run }: { post: MetaPostRow; busy: boolean; run: (task: () => Promise<void>) => void }) {
  const [title, setTitle] = useState(post.draft_title ?? "");
  const [description, setDescription] = useState(post.draft_description ?? post.message);
  const [price, setPrice] = useState(post.draft_price?.toString() ?? "");
  const [category, setCategory] = useState(post.draft_category ?? "Hogar");
  const terminal = post.status === "approved" || post.status === "rejected";
  const payload = { id: post.id, title, description, price, category };
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[16/8] bg-secondary bg-contain bg-center bg-no-repeat" style={post.image_url ? { backgroundImage: `url(${JSON.stringify(post.image_url).slice(1, -1)})` } : undefined} />
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-2"><Badge variant={post.status === "approved" ? "default" : "secondary"}>{statusLabel(post.status)}</Badge>{post.permalink_url && <a href={post.permalink_url} target="_blank" rel="noreferrer" className="text-xs text-primary">Ver original <ExternalLink className="inline size-3" /></a>}</div>
        <div className="grid gap-2"><Label>Título detectado</Label><Input value={title} onChange={(event) => setTitle(event.target.value)} disabled={terminal} /></div>
        <div className="grid gap-2"><Label>Descripción</Label><Textarea rows={5} value={description} onChange={(event) => setDescription(event.target.value)} disabled={terminal} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2"><Label>Precio</Label><Input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} disabled={terminal} /></div>
          <div className="grid gap-2"><Label>Categoría</Label><select value={category} onChange={(event) => setCategory(event.target.value)} disabled={terminal} className="h-9 rounded-lg border bg-background px-3 text-sm">{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
        </div>
        {!terminal && <div className="flex flex-wrap gap-2"><Button size="sm" disabled={busy || !post.image_url} onClick={() => run(async () => { await api({ action: "approve_import", ...payload }); toast.success("Producto creado como borrador. Revisalo antes de publicarlo."); })}><PackagePlus /> Crear producto borrador</Button><Button size="sm" variant="ghost" disabled={busy} onClick={() => run(async () => { await api({ action: "reject_import", id: post.id }); toast.success("Publicación descartada."); })}>Descartar</Button></div>}
        {post.status === "approved" && post.product_id && <Button asChild size="sm" variant="outline"><Link href={`/admin/productos`}>Revisar producto <ArrowUpRight /></Link></Button>}
        {!post.image_url && !terminal && <p className="text-xs text-amber-600">Necesita una imagen para convertirse en producto.</p>}
      </CardContent>
    </Card>
  );
}

function Check({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return <div className="flex gap-3 rounded-xl border p-4">{ready ? <BadgeCheck className="size-5 shrink-0 text-emerald-500" /> : <CircleAlert className="size-5 shrink-0 text-amber-500" />}<div><p className="font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div></div>;
}

function CopyRow({ label, value }: { label: string; value: string }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="flex gap-2"><Input readOnly value={value} className="font-mono text-xs" /><Button size="icon" variant="outline" aria-label={`Copiar ${label}`} onClick={async () => { await navigator.clipboard.writeText(value); toast.success("Dirección copiada."); }}><Clipboard /></Button></div></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="col-span-full rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">{text}</div>;
}

function statusLabel(status: MetaPostRow["status"]) {
  return ({ draft: "Borrador", pending_review: "Revisar", publishing: "Publicando", published: "Publicado", failed: "Con error", approved: "Convertido", rejected: "Descartado", archived: "Archivado" } as const)[status];
}

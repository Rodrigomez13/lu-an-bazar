"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  BadgePercent,
  ImagePlus,
  LoaderCircle,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Star,
  Trash2,
  WandSparkles,
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
import { categories, formatARS } from "@/lib/data";
import type { AdminProduct } from "@/lib/catalog";

type Draft = {
  databaseId: string;
  code: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: string;
  previousPrice: string;
  stock: string;
  color: string;
  material: string;
  dimensions: string;
  features: string;
  keywords: string;
  featured: boolean;
  offer: boolean;
  isNew: boolean;
  published: boolean;
  image: string;
};

const emptyDraft: Draft = {
  databaseId: "",
  code: "",
  name: "",
  description: "",
  category: "Hogar",
  brand: "",
  price: "",
  previousPrice: "",
  stock: "",
  color: "",
  material: "",
  dimensions: "",
  features: "",
  keywords: "",
  featured: false,
  offer: false,
  isNew: true,
  published: true,
  image: "",
};

function draftFromProduct(product: AdminProduct): Draft {
  return {
    databaseId: product.databaseId ?? "",
    code: product.code,
    name: product.name,
    description: product.description,
    category: product.category,
    brand: product.brand,
    price: product.price?.toString() ?? "",
    previousPrice: product.previousPrice?.toString() ?? "",
    stock: product.stock?.toString() ?? "",
    color: product.color,
    material: product.material,
    dimensions: product.dimensions,
    features: product.features.join("\n"),
    keywords: product.keywords.join(", "),
    featured: Boolean(product.featured),
    offer: Boolean(product.offer ?? product.previousPrice),
    isNew: Boolean(product.isNew),
    published: product.published,
    image: product.image,
  };
}

async function responseError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error ?? "La operación no pudo completarse.";
  } catch {
    return "La operación no pudo completarse.";
  }
}

export function ProductManager({
  initialProducts,
  databaseConfigured,
  aiConfigured,
}: {
  initialProducts: AdminProduct[];
  databaseConfigured: boolean;
  aiConfigured: boolean;
}) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [query, setQuery] = useState("");
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<Blob | null>(null);
  const [preview, setPreview] = useState("");
  const [busy, startTransition] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const setPreviewFromBlob = (blob: Blob) => {
    const next = URL.createObjectURL(blob);
    setPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return initialProducts;
    return initialProducts.filter((product) =>
      `${product.name} ${product.code} ${product.category} ${product.brand}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [initialProducts, query]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const reset = () => {
    setDraft(emptyDraft);
    setOriginalImage(null);
    setEnhancedImage(null);
    setPreview((current) => {
      if (current.startsWith("blob:")) URL.revokeObjectURL(current);
      return "";
    });
  };

  const edit = (product: AdminProduct) => {
    if (!product.databaseId) {
      toast.info("Ejecutá los SQL y cargá las claves para editar este producto local.");
      return;
    }
    setDraft(draftFromProduct(product));
    setOriginalImage(null);
    setEnhancedImage(null);
    setPreview(product.image);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const analyze = () => {
    if (!originalImage) return toast.error("Seleccioná una imagen primero.");
    startTransition(async () => {
      const body = new FormData();
      body.set("image", originalImage);
      body.set("price", draft.price);
      const response = await fetch("/api/admin/products/analyze", {
        method: "POST",
        body,
      });
      if (!response.ok) {
        toast.error(await responseError(response));
        return;
      }
      const result = (await response.json()) as {
        data: Partial<Draft> & { features?: string[]; keywords?: string[] };
      };
      setDraft((current) => ({
        ...current,
        ...result.data,
        price: current.price,
        features: result.data.features?.join("\n") ?? current.features,
        keywords: result.data.keywords?.join(", ") ?? current.keywords,
      }));
      toast.success("Ficha generada. Revisala antes de guardar.");
    });
  };

  const enhance = () => {
    if (!originalImage) return toast.error("Seleccioná una imagen primero.");
    startTransition(async () => {
      const body = new FormData();
      body.set("image", originalImage);
      body.set("name", draft.name || "producto");
      const response = await fetch("/api/admin/products/enhance", {
        method: "POST",
        body,
      });
      if (!response.ok) {
        toast.error(await responseError(response));
        return;
      }
      const image = await response.blob();
      setEnhancedImage(image);
      setPreviewFromBlob(image);
      toast.success("Foto profesional generada. Comparala con el original.");
    });
  };

  const save = () => {
    if (!databaseConfigured) {
      return toast.error("Primero configurá Supabase y ejecutá los SQL.");
    }
    if (!draft.databaseId && !originalImage) {
      return toast.error("Seleccioná una imagen para el producto.");
    }
    startTransition(async () => {
      const body = new FormData();
      Object.entries(draft).forEach(([key, value]) => {
        if (typeof value === "boolean") body.set(key, String(value));
        else if (key !== "image") body.set(key, value);
      });
      if (originalImage) body.set("originalImage", originalImage);
      if (enhancedImage) {
        body.set("catalogImage", new File([enhancedImage], "producto.webp", { type: "image/webp" }));
      }
      const response = await fetch("/api/admin/products", {
        method: draft.databaseId ? "PATCH" : "POST",
        body,
      });
      if (!response.ok) {
        toast.error(await responseError(response));
        return;
      }
      toast.success(draft.databaseId ? "Producto actualizado." : "Producto creado.");
      reset();
      router.refresh();
    });
  };

  const archive = (product: AdminProduct) => {
    if (!product.databaseId) return;
    if (!window.confirm(`¿Archivar “${product.name}”? Dejará de verse en el catálogo.`)) return;
    startTransition(async () => {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.databaseId }),
      });
      if (!response.ok) {
        toast.error(await responseError(response));
        return;
      }
      toast.success("Producto archivado.");
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
            <Button asChild variant="outline" className="border-brand-cream/25 bg-transparent text-brand-cream">
              <Link href="/admin"><ArrowLeft /> Panel</Link>
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.24em] text-primary">Catálogo</p>
            <h1 className="mt-2 font-serif text-4xl">Productos</h1>
            <p className="mt-2 text-sm text-muted-foreground">Cargá una foto y el precio; la IA propone el resto de la ficha.</p>
          </div>
          <Button onClick={reset}><Plus /> Nuevo producto</Button>
        </div>

        {!databaseConfigured && (
          <div className="mt-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm">
            Vista de preparación: los productos locales se muestran como referencia. Ejecutá los SQL y completá las variables de Supabase para habilitar guardado y edición.
          </div>
        )}
        {!aiConfigured && (
          <div className="mt-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm">
            La carga manual funciona con Supabase. Para generar textos y fotos, agregá <code>OPENAI_API_KEY</code> en <code>.env.local</code>.
          </div>
        )}

        <div ref={formRef} className="mt-7 grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <Card className="overflow-hidden">
            <CardHeader><CardTitle className="font-serif text-2xl">1. Imagen y precio</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <label className="relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed bg-secondary/50">
                {preview ? (
                  <Image src={preview} alt="Vista previa del producto" fill unoptimized={preview.startsWith("blob:")} className="object-contain p-3" sizes="(max-width:1280px) 100vw, 38vw" />
                ) : (
                  <span className="flex flex-col items-center gap-2 text-sm text-muted-foreground"><ImagePlus className="size-8" />Seleccionar imagen</span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setOriginalImage(file);
                    setEnhancedImage(null);
                    if (file) setPreviewFromBlob(file);
                  }}
                />
              </label>
              <div className="grid gap-2">
                <Label htmlFor="price">Precio actual</Label>
                <Input id="price" type="number" min="0" step="0.01" value={draft.price} onChange={(event) => update("price", event.target.value)} placeholder="Ej. 18500" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" onClick={analyze} disabled={busy || !aiConfigured || !originalImage}>
                  {busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />} Generar ficha
                </Button>
                <Button variant="outline" onClick={enhance} disabled={busy || !aiConfigured || !originalImage}>
                  {busy ? <LoaderCircle className="animate-spin" /> : <WandSparkles />} Foto profesional
                </Button>
              </div>
              {enhancedImage && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs text-muted-foreground">
                  Se usará la versión profesional. El archivo original también se guardará para poder comparar o volver atrás.
                  <Button size="sm" variant="ghost" className="mt-2 w-full" onClick={() => { setEnhancedImage(null); if (originalImage) setPreviewFromBlob(originalImage); }}>Usar foto original</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-serif text-2xl">2. Revisar ficha</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Código" hint="Se genera solo si queda vacío"><Input value={draft.code} onChange={(e) => update("code", e.target.value)} placeholder="Automático" /></Field>
              <Field label="Categoría">
                <select value={draft.category} onChange={(e) => update("category", e.target.value)} className="h-9 w-full rounded-lg border bg-transparent px-3 text-sm">
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </Field>
              <Field label="Título" wide><Input value={draft.name} onChange={(e) => update("name", e.target.value)} /></Field>
              <Field label="Descripción" wide><Textarea rows={4} value={draft.description} onChange={(e) => update("description", e.target.value)} /></Field>
              <Field label="Marca"><Input value={draft.brand} onChange={(e) => update("brand", e.target.value)} /></Field>
              <Field label="Stock"><Input type="number" min="0" value={draft.stock} onChange={(e) => update("stock", e.target.value)} /></Field>
              <Field label="Precio anterior"><Input type="number" min="0" value={draft.previousPrice} onChange={(e) => update("previousPrice", e.target.value)} placeholder="Sólo si hay descuento" /></Field>
              <Field label="Color"><Input value={draft.color} onChange={(e) => update("color", e.target.value)} /></Field>
              <Field label="Material"><Input value={draft.material} onChange={(e) => update("material", e.target.value)} /></Field>
              <Field label="Presentación / medidas"><Input value={draft.dimensions} onChange={(e) => update("dimensions", e.target.value)} /></Field>
              <Field label="Características" hint="Una por línea" wide><Textarea rows={4} value={draft.features} onChange={(e) => update("features", e.target.value)} /></Field>
              <Field label="Palabras clave" hint="Separadas por coma" wide><Input value={draft.keywords} onChange={(e) => update("keywords", e.target.value)} /></Field>
              <div className="col-span-full grid gap-2 sm:grid-cols-4">
                <Toggle checked={draft.published} onChange={(v) => update("published", v)} label="Publicado" />
                <Toggle checked={draft.featured} onChange={(v) => update("featured", v)} label="Destacado" icon={<Star />} />
                <Toggle checked={draft.offer} onChange={(v) => update("offer", v)} label="Oferta" icon={<BadgePercent />} />
                <Toggle checked={draft.isNew} onChange={(v) => update("isNew", v)} label="Novedad" icon={<Sparkles />} />
              </div>
              <div className="col-span-full flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {draft.databaseId && <Button variant="ghost" onClick={reset}>Cancelar edición</Button>}
                <Button onClick={save} disabled={busy || !databaseConfigured}>
                  {busy && <LoaderCircle className="animate-spin" />}{draft.databaseId ? "Guardar cambios" : "Crear producto"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-7">
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="font-serif text-2xl">Productos cargados</CardTitle><p className="mt-1 text-sm text-muted-foreground">{initialProducts.length} artículos</p></div>
            <label className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" placeholder="Buscar producto..." /></label>
          </CardHeader>
          <CardContent className="grid gap-3">
            {filtered.map((product) => (
              <div key={`${product.databaseId ?? "local"}-${product.id}`} className="grid gap-4 rounded-xl border p-3 sm:grid-cols-[72px_1fr_auto] sm:items-center">
                <div className="relative size-[72px] overflow-hidden rounded-lg bg-secondary"><Image src={product.image} alt="" fill className="object-contain p-1" sizes="72px" /></div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{product.name}</p>{product.featured && <Badge><Star className="size-3" /> Destacado</Badge>}{(product.offer || product.previousPrice) && <Badge variant="secondary">Oferta</Badge>}{!product.published && <Badge variant="outline">Borrador</Badge>}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{product.code} · {product.category} · {product.price ? formatARS(product.price) : "Sin precio"}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {product.databaseId && <Button asChild size="sm" variant="outline"><Link href={`/admin/publicaciones?product=${product.databaseId}`}><Megaphone /> Publicar</Link></Button>}
                  <Button size="sm" variant="outline" onClick={() => edit(product)}><Pencil /> Editar</Button>
                  <Button size="icon-sm" variant="ghost" disabled={!product.databaseId || busy} onClick={() => archive(product)} aria-label={`Archivar ${product.name}`}><Trash2 /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Field({ label, hint, wide = false, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return <div className={`grid gap-2 ${wide ? "sm:col-span-2" : ""}`}><div><Label>{label}</Label>{hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}</div>{children}</div>;
}

function Toggle({ checked, onChange, label, icon }: { checked: boolean; onChange: (value: boolean) => void; label: string; icon?: React.ReactNode }) {
  return <label className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${checked ? "border-primary bg-primary/10" : ""}`}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--primary)]" />{icon && <span className="[&_svg]:size-4">{icon}</span>}{label}</label>;
}

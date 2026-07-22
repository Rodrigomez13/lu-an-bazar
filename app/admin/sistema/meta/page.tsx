import Link from "next/link";
import {
  BadgeCheck,
  BookOpen,
  CircleAlert,
  ExternalLink,
  Share2,
  RadioTower,
  ShoppingBag,
} from "lucide-react";
import { AdminModuleShell } from "@/components/admin/admin-module-shell";
import { CopyConfigValue } from "@/components/admin/copy-config-value";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { business } from "@/lib/business";
import { getPublishedProducts } from "@/lib/catalog";

const isSet = (value?: string) => Boolean(value?.trim());

export default async function MetaIntegrationPage() {
  const products = await getPublishedProducts();
  const eligibleProducts = products.filter(
    (product) => typeof product.price === "number" && product.price > 0,
  );
  const feedUrl = `${business.siteUrl}/api/meta/catalog`;
  const checks = [
    {
      label: "Página de Facebook",
      ready: isSet(business.facebookUrl),
      detail: "Enlace público del negocio",
    },
    {
      label: "Cuenta profesional de Instagram",
      ready: isSet(business.instagramUrl),
      detail: "Vinculada a la página de Facebook",
    },
    {
      label: "Meta Pixel / Dataset",
      ready: isSet(process.env.NEXT_PUBLIC_META_PIXEL_ID),
      detail: "Medición en el navegador con consentimiento",
    },
    {
      label: "Conversions API",
      ready: isSet(process.env.META_CONVERSIONS_API_TOKEN),
      detail: "Token secreto disponible solo en el servidor",
    },
    {
      label: "Versión de Graph API",
      ready: isSet(process.env.META_GRAPH_API_VERSION),
      detail: "La versión vigente indicada por Events Manager",
    },
    {
      label: "Catálogo de Meta",
      ready: isSet(process.env.META_CATALOG_ID),
      detail: "Identificador de Commerce Manager",
    },
    {
      label: "Fan page autorizada",
      ready: isSet(process.env.META_PAGE_ID) && isSet(process.env.META_PAGE_ACCESS_TOKEN),
      detail: "Token de Página disponible sólo en el servidor",
    },
    {
      label: "Webhook de Página",
      ready: isSet(process.env.META_WEBHOOK_VERIFY_TOKEN) && isSet(process.env.META_WEBHOOK_APP_SECRET),
      detail: "Importación firmada de publicaciones nuevas",
    },
  ];
  const readyCount = checks.filter((check) => check.ready).length;

  return (
    <AdminModuleShell
      activePath="/admin/sistema/meta"
      eyebrow="Sistema · Canales comerciales"
      title="Meta y catálogo interactivo"
      description="Centro de conexión del catálogo público con Facebook, Instagram, Meta Pixel y Conversions API. No accede a datos financieros."
    >
      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-serif text-2xl">Estado de la conexión</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {readyCount} de {checks.length} datos configurados
                  </p>
                </div>
                <Badge variant={readyCount === checks.length ? "default" : "secondary"}>
                  {readyCount === checks.length ? "Lista para probar" : "Pendiente"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {checks.map((check) => (
                <div key={check.label} className="flex gap-3 rounded-xl border p-4">
                  {check.ready ? (
                    <BadgeCheck className="size-5 shrink-0 text-emerald-500" />
                  ) : (
                    <CircleAlert className="size-5 shrink-0 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{check.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {check.detail}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <ShoppingBag className="size-5 text-primary" /> Feed automático
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Pegá esta URL en Commerce Manager como origen programado. Se
                actualiza desde los productos publicados y nunca incluye clientes,
                usuarios ni préstamos.
              </p>
              <CopyConfigValue value={feedUrl} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Publicados" value={products.length} />
                <Metric label="Listos para Meta" value={eligibleProducts.length} />
                <Metric label="Sin precio" value={products.length - eligibleProducts.length} />
              </div>
              <p className="text-xs text-muted-foreground">
                Meta exige un precio válido. Los artículos sin precio permanecen en
                la web, pero se omiten del feed hasta completarlos.
              </p>
              <Button asChild variant="outline">
                <a href={feedUrl} target="_blank" rel="noreferrer">
                  Ver feed CSV <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <Share2 className="size-5 text-primary" /> Qué falta de tu parte
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4 text-sm">
                {[
                  "URL exacta de la página de Facebook y del Instagram profesional.",
                  "Acceso con control total al portafolio comercial de Meta.",
                  "ID del Pixel o Dataset creado en Events Manager.",
                  "ID del catálogo creado en Commerce Manager.",
                  "Token de Conversions API cargado directamente en Vercel.",
                  "Dominio propio y acceso DNS para verificarlo, si querés dejar el dominio de Vercel.",
                ].map((item, index) => (
                  <li key={item} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed">
                No necesito tu contraseña de Facebook. Los tokens secretos deben
                cargarse en Vercel y nunca enviarse por chat ni quedar en el navegador.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-serif text-2xl">
                <RadioTower className="size-5 text-primary" /> Flujo preparado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Panel de productos → Supabase → web pública → feed de Meta.</p>
              <p>Anuncio o publicación → ficha exacta → lista de consulta → WhatsApp.</p>
              <p>Consentimiento → Pixel + Conversions API → Events Manager.</p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/admin/sistema/meta/guia">
                  <BookOpen data-icon="inline-start" /> Guía de activación
                </Link>
              </Button>
              <Button asChild className="mt-2 ml-2">
                <Link href="/admin/publicaciones">
                  <Share2 data-icon="inline-start" /> Gestionar publicaciones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminModuleShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <p className="font-serif text-2xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

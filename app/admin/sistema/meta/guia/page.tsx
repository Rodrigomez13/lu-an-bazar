import Link from "next/link";
import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import { AdminModuleShell } from "@/components/admin/admin-module-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    title: "Ordenar los activos del negocio",
    text: "En Meta Business Suite confirmá que la página de Facebook, la cuenta profesional de Instagram y la cuenta publicitaria pertenezcan al mismo portafolio comercial.",
  },
  {
    title: "Conectar Facebook e Instagram",
    text: "Vinculá la cuenta profesional de Instagram con la página de Facebook y agregá WhatsApp Business como opción de contacto.",
  },
  {
    title: "Crear el catálogo",
    text: "En Commerce Manager creá un catálogo de comercio electrónico. Elegí un origen por feed programado y usá la URL que aparece en el panel Meta de esta aplicación.",
  },
  {
    title: "Programar la actualización",
    text: "Configurá una actualización diaria. La web seguirá siendo la fuente principal: los cambios de precio, stock, oferta o imagen se administran aquí y luego llegan a Meta.",
  },
  {
    title: "Crear Pixel o Dataset",
    text: "En Events Manager creá o elegí el Dataset web. Copiá su identificador público en NEXT_PUBLIC_META_PIXEL_ID y META_PIXEL_ID.",
  },
  {
    title: "Activar Conversions API",
    text: "Generá el token desde Events Manager y cargalo como META_CONVERSIONS_API_TOKEN en Vercel. Indicá también la versión de Graph API vigente.",
  },
  {
    title: "Autorizar la fan page",
    text: "En una app de Meta para empresas obtené un token de Página con pages_show_list, pages_read_engagement y pages_manage_posts. Guardá META_PAGE_ID y META_PAGE_ACCESS_TOKEN sólo en Vercel.",
  },
  {
    title: "Conectar el webhook",
    text: "Configurá el callback /api/meta/webhooks/page, un token de verificación aleatorio y el secreto de la app. Suscribí el campo feed para recibir publicaciones nuevas en la cola de revisión.",
  },
  {
    title: "Verificar y probar",
    text: "Usá Probar eventos en Events Manager, aceptá la medición en la web, visitá una ficha y enviá una consulta. Deben verse PageView, ViewContent, AddToCart y Contact sin duplicados.",
  },
  {
    title: "Publicar campañas",
    text: "Creá anuncios que dirijan a la ficha individual o a WhatsApp. Conservá los parámetros UTM del feed para distinguir el tráfico procedente de Meta.",
  },
] as const;

export default function MetaGuidePage() {
  return (
    <AdminModuleShell
      activePath="/admin/sistema/meta"
      eyebrow="Sistema · Meta"
      title="Guía de activación"
      description="Pasos operativos para completar la conexión sin compartir contraseñas ni exponer tokens secretos."
    >
      <Button asChild variant="ghost" className="mb-5">
        <Link href="/admin/sistema/meta">
          <ArrowLeft data-icon="inline-start" /> Volver al estado
        </Link>
      </Button>
      <Button asChild className="mb-5 ml-2">
        <Link href="/admin/publicaciones">Abrir publicaciones Meta</Link>
      </Button>

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Configuración paso a paso</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-6">
              {steps.map((step, index) => (
                <li key={step.title} className="grid gap-3 sm:grid-cols-[42px_1fr]">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-semibold">{step.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Situación en Argentina</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Meta no incluye actualmente a Argentina entre los países con la
                experiencia completa de Shops. Por eso esta implementación prioriza
                catálogo, anuncios, fichas web y consultas por WhatsApp.
              </p>
              <p>
                La disponibilidad final de cada función la determina Meta según la
                ubicación y elegibilidad de tu cuenta comercial.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-xl">Ayuda oficial</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <OfficialLink href="https://www.facebook.com/business/help/AboutConversionsAPI">
                Conversions API
              </OfficialLink>
              <OfficialLink href="https://www.facebook.com/help/instagram/1627591223954487">
                Elegibilidad comercial
              </OfficialLink>
              <OfficialLink href="https://www.facebook.com/help/instagram/321000045119159?locale=es_LA">
                Países admitidos para Shops
              </OfficialLink>
            </CardContent>
          </Card>
          <div className="flex gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed">
            <Info className="size-5 shrink-0 text-primary" />
            El catálogo público es independiente del sistema privado de préstamos.
            Ningún evento ni feed de Meta consulta esas tablas.
          </div>
        </div>
      </div>
    </AdminModuleShell>
  );
}

function OfficialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline" className="justify-between">
      <a href={href} target="_blank" rel="noreferrer">
        {children} <ExternalLink data-icon="inline-end" />
      </a>
    </Button>
  );
}

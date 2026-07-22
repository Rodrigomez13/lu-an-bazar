import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { MetaPrivacyControls } from "@/components/meta-privacy-controls";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Preferencias de privacidad y medición del catálogo de Lu An Bazar.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-14 lg:px-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="size-7 text-primary" />
          <p className="text-xs font-semibold uppercase tracking-[.22em] text-primary">
            Privacidad
          </p>
        </div>
        <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
          Tus preferencias de medición
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
          El catálogo funciona aunque rechaces la medición opcional. Podés cambiar
          tu elección cuando quieras desde esta página.
        </p>

        <div className="mt-8 grid gap-5">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Qué medimos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Si das permiso, Meta Pixel y Conversions API pueden registrar visitas
                a fichas públicas, productos agregados a la lista y clics de consulta.
                Esto ayuda a evaluar campañas de Facebook e Instagram.
              </p>
              <p>
                Los eventos no incluyen contraseñas, documentación de clientes ni
                información del sistema privado de préstamos personales.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Cambiar preferencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                La elección se guarda en este navegador. Si eliminás los datos del
                navegador, volveremos a consultarte.
              </p>
              <MetaPrivacyControls />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

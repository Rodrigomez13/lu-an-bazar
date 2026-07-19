import { LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Brand } from "@/components/brand";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  return (
    <main className="grid min-h-screen bg-brand-navy md:grid-cols-2">
      <section className="hidden flex-col justify-between p-12 text-brand-cream md:flex">
        <Brand />
        <div>
          <p className="text-xs uppercase tracking-[.3em] text-primary">
            Acceso restringido
          </p>
          <h1 className="mt-4 max-w-xl font-serif text-6xl">
            Administración Lu An
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-brand-cream/60">
            Gestión interna del bazar y de actividades privadas, separadas por
            permisos y roles.
          </p>
        </div>
        <p className="text-xs text-brand-cream/40">Formosa · Argentina</p>
      </section>
      <section className="flex items-center justify-center bg-background px-5 py-12">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader>
            <div className="mb-5 md:hidden">
              <Brand />
            </div>
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-secondary">
              <LockKeyhole className="size-5 text-primary" />
            </div>
            <CardTitle className="font-serif text-4xl">
              Acceso administrativo
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Ingresá con las credenciales asignadas por el administrador.
            </p>
          </CardHeader>
          <CardContent>
            <AdminLoginForm />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

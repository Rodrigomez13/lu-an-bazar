import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-navy px-5 text-center text-brand-cream">
      <Brand />
      <p className="mt-12 text-xs font-semibold uppercase tracking-[.3em] text-primary">
        Error 404
      </p>
      <h1 className="mt-3 font-serif text-5xl">No encontramos esta página</h1>
      <p className="mt-4 max-w-md text-brand-cream/65">
        El enlace puede haber cambiado. Volvé al catálogo para seguir buscando
        productos.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/productos">
            <Search data-icon="inline-start" />
            Ver productos
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-brand-cream/25 bg-transparent text-brand-cream"
        >
          <Link href="/">
            <ArrowLeft data-icon="inline-start" />
            Volver al inicio
          </Link>
        </Button>
      </div>
    </main>
  );
}

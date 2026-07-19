import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Gift,
  HeartHandshake,
  MapPin,
  MessageCircle,
  PackageCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { LotusMark } from "@/components/brand";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { business, mapsUrl, whatsappUrl } from "@/lib/business";
import { categories, products } from "@/lib/data";

const categoryCopy: Record<string, string> = {
  "Cocina y bebidas": "Termos, jarras y artículos para compartir",
  Electrodomésticos: "Soluciones prácticas para todos los días",
  "Cuidado personal": "Accesorios para cuidarte en casa",
  "Salud y bienestar": "Equipos de control para uso doméstico",
  Tecnología: "Productos inteligentes y seguridad",
  Hogar: "Utilidad para tu casa o negocio",
};

export default function Home() {
  const featured = products.filter((product) => product.featured).slice(0, 6);
  const news = products.filter((product) => product.isNew).slice(0, 6);
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: business.name,
    url: business.siteUrl,
    telephone: business.phoneDisplay,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Maradona 1444",
      addressLocality: "Formosa",
      addressCountry: "AR",
    },
  };
  return (
    <>
      <SiteHeader />
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />
        <section className="surface-glow relative overflow-hidden bg-brand-navy text-brand-cream">
          <div className="mx-auto grid min-h-[610px] max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-[1.05fr_.95fr] lg:px-8">
            <div className="flex flex-col items-start gap-7">
              <p className="text-xs font-semibold uppercase tracking-[.32em] text-primary">
                Bazar · Tecnología · Hogar
              </p>
              <h1 className="max-w-3xl text-balance font-serif text-5xl leading-[1.04] md:text-7xl">
                Todo lo que buscás,{" "}
                <em className="font-normal text-primary">en un solo lugar.</em>
              </h1>
              <p className="max-w-xl text-pretty text-lg leading-relaxed text-brand-cream/70">
                Bazar, electrodomésticos, cuidado personal, tecnología y
                productos útiles para todos los días.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/productos">
                    Ver productos <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-brand-cream/30 bg-transparent text-brand-cream hover:bg-brand-cream hover:text-brand-navy"
                >
                  <a
                    href={whatsappUrl(
                      "Hola, quiero consultar por los productos de Lu An Bazar.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle data-icon="inline-start" />
                    Consultar por WhatsApp
                  </a>
                </Button>
              </div>
              <form
                action="/productos"
                className="flex w-full max-w-xl gap-2 rounded-xl border border-brand-cream/15 bg-brand-cream/10 p-2"
              >
                <label className="relative flex-1">
                  <span className="sr-only">Buscar en el catálogo</span>
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-brand-cream/50" />
                  <Input
                    name="q"
                    placeholder="¿Qué producto estás buscando?"
                    className="border-0 bg-transparent pl-9 text-brand-cream placeholder:text-brand-cream/45"
                  />
                </label>
                <Button type="submit">Buscar</Button>
              </form>
            </div>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-t-[12rem] border border-primary/30 bg-brand-cream/5">
              <Image
                src="/images/products/set-vasos-jarra.jpg"
                alt="Set de jarra y vasos disponible en Lu An Bazar"
                fill
                priority
                className="object-cover"
                sizes="(max-width:768px) 90vw, 40vw"
              />
              <div className="absolute inset-x-5 bottom-5 rounded-xl border border-brand-cream/20 bg-brand-navy/90 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[.18em]">
                    Novedades reales
                  </p>
                </div>
                <p className="mt-1 font-serif text-xl">
                  Productos recién incorporados
                </p>
                <p className="text-xs text-brand-cream/60">
                  Consultá colores y disponibilidad por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="categorias"
          className="mx-auto max-w-7xl px-5 py-16 lg:px-8"
        >
          <div className="text-center">
            <LotusMark className="mx-auto" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[.28em] text-primary">
              Explorá por categoría
            </p>
            <h2 className="mt-2 text-balance font-serif text-4xl">
              Encontrá lo que necesitás
            </h2>
          </div>
          <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const count = products.filter(
                (product) => product.category === category,
              ).length;
              return (
                <Link
                  key={category}
                  href={`/productos?categoria=${encodeURIComponent(category)}`}
                  className="group rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif text-3xl text-primary">
                      0{index + 1}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                      {count} {count === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                  <h3 className="mt-7 font-serif text-2xl">{category}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {categoryCopy[category]}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="bg-secondary/45 py-16">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">
                  Selección Lu An
                </p>
                <h2 className="mt-2 font-serif text-4xl">
                  Productos destacados
                </h2>
              </div>
              <Button asChild variant="outline">
                <Link href="/productos">Ver todo</Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
        <section id="ofertas" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="grid items-center gap-8 p-7 md:grid-cols-[1fr_auto] md:p-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">
                  Promociones
                </p>
                <h2 className="mt-2 font-serif text-4xl">
                  Consultá las ofertas del día
                </h2>
                <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                  Los precios y el stock pueden cambiar. Escribinos y te
                  confirmamos disponibilidad, colores y promociones vigentes.
                </p>
              </div>
              <Button asChild size="lg">
                <a
                  href={whatsappUrl(
                    "Hola, quiero conocer las ofertas disponibles de Lu An Bazar.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle data-icon="inline-start" />
                  Ver ofertas
                </a>
              </Button>
            </div>
          </div>
        </section>
        <section
          id="novedades"
          className="bg-brand-navy py-16 text-brand-cream"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">
              Recién llegados
            </p>
            <h2 className="mt-2 font-serif text-4xl">Novedades del bazar</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {news.map((product) => (
                <Link
                  href={`/productos/${product.id}`}
                  key={product.id}
                  className="flex items-center gap-4 rounded-xl border border-brand-cream/15 p-4 transition-colors hover:border-primary"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-brand-cream/10">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="96px"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-primary">{product.category}</p>
                    <h3 className="font-serif text-xl">{product.name}</h3>
                    <p className="text-xs text-brand-cream/55">Ver producto</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-7xl gap-5 px-5 py-16 md:grid-cols-3 lg:px-8">
          {[
            [
              PackageCheck,
              "Disponibilidad confirmada",
              "Consultamos stock y colores antes de reservar.",
            ],
            [
              HeartHandshake,
              "Atención cercana",
              "Te ayudamos a elegir por WhatsApp.",
            ],
            [
              Gift,
              "Variedad para regalar",
              "Opciones útiles para tu casa, cuidado y tecnología.",
            ],
          ].map(([Icon, title, text]) => {
            const ItemIcon = Icon as typeof Gift;
            return (
              <div
                key={title as string}
                className="flex gap-4 rounded-xl border bg-card p-5"
              >
                <ItemIcon className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="font-serif text-xl">{title as string}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {text as string}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
        <section className="border-y bg-secondary/45">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 md:grid-cols-[1fr_auto] md:items-center lg:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">
                Visitanos
              </p>
              <h2 className="mt-2 font-serif text-3xl">{business.address}</h2>
              <p className="mt-2 text-muted-foreground">
                También podés coordinar tu consulta o reserva al{" "}
                {business.phoneDisplay}.
              </p>
            </div>
            <Button asChild variant="outline" size="lg">
              <a href={mapsUrl} target="_blank" rel="noreferrer">
                <MapPin data-icon="inline-start" />
                Abrir ubicación
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  MessageCircle,
  PackageCheck,
  Truck,
} from "lucide-react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ProductCard } from "@/components/product-card";
import { ShareProductButton } from "@/components/share-product-button";
import { AddToConsultationButton } from "@/components/consultation-list";
import { ProductViewTracker } from "@/components/product-view-tracker";
import { TrackedWhatsAppLink } from "@/components/tracked-whatsapp-link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { business, whatsappUrl } from "@/lib/business";
import { formatARS } from "@/lib/data";
import { getPublishedProducts } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const products = await getPublishedProducts();
  return products.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const products = await getPublishedProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/productos/${product.id}` },
    openGraph: {
      title: `${product.name} | Lu An Bazar`,
      description: product.description,
      images: [{ url: product.image }],
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { id } = await params;
  const products = await getPublishedProducts();
  const product = products.find((item) => item.id === id);
  if (!product) notFound();
  const related = products
    .filter((item) => item.category === product.category && item.id !== id)
    .slice(0, 3);
  const path = `/productos/${product.id}`;
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: `${business.siteUrl}${product.image}`,
    description: product.description,
    sku: product.code,
    brand: { "@type": "Brand", name: product.brand },
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "ARS",
            price: product.price,
            availability:
              product.stock === 0
                ? "https://schema.org/OutOfStock"
                : "https://schema.org/InStock",
            url: `${business.siteUrl}${path}`,
          },
        }
      : {}),
  };
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <ProductViewTracker
          id={product.id}
          name={product.name}
          category={product.category}
          value={product.price}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <Button asChild variant="ghost">
          <Link href="/productos">
            <ArrowLeft data-icon="inline-start" />
            Volver al catálogo
          </Link>
        </Button>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-secondary/45">
            <Image
              src={product.image}
              alt={product.name}
              fill
              priority
              className="object-contain p-3"
              sizes="(max-width:768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col items-start gap-5 py-4">
            <div className="flex gap-2">
              <Badge>{product.category}</Badge>
              {product.isNew && <Badge variant="secondary">Novedad</Badge>}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[.2em] text-muted-foreground">
                {product.brand} · {product.code}
              </p>
              <h1 className="mt-2 text-balance font-serif text-4xl leading-tight sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
            <Separator />
            <div>
              <p className="font-serif text-4xl">
                {product.price ? formatARS(product.price) : "Consultar precio"}
              </p>
              {product.previousPrice && (
                <p className="mt-1 text-sm text-muted-foreground line-through">
                  Antes {formatARS(product.previousPrice)}
                </p>
              )}
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="flex-1">
                <TrackedWhatsAppLink
                  href={whatsappUrl(
                    `Hola, quiero consultar por el producto ${product.name}, código ${product.code}.`,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  tracking={{
                    contentId: product.id,
                    contentName: product.name,
                    category: product.category,
                    value: product.price,
                    currency: product.price ? "ARS" : undefined,
                    source: "product_detail",
                  }}
                >
                  <MessageCircle data-icon="inline-start" />
                  Consultar por WhatsApp
                </TrackedWhatsAppLink>
              </Button>
              <ShareProductButton name={product.name} path={path} showLabel />
            </div>
            <AddToConsultationButton
              showLabel
              className="w-full"
              product={{
                id: product.id,
                code: product.code,
                name: product.name,
                image: product.image,
                category: product.category,
                price: product.price,
              }}
            />
            <div className="flex flex-col gap-3 text-sm">
              <p className="flex items-center gap-3">
                <PackageCheck className="size-4 text-accent" />
                {typeof product.stock === "number"
                  ? `Stock: ${product.stock} unidades`
                  : "Disponibilidad a confirmar"}
              </p>
              <p className="flex items-center gap-3">
                <Truck className="size-4 text-accent" />
                Retiro o entrega a coordinar en Formosa
              </p>
            </div>
            <div className="w-full rounded-xl bg-secondary p-5">
              <h2 className="font-serif text-xl">Detalles</h2>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Color</dt>
                  <dd>{product.color}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Material</dt>
                  <dd>{product.material}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Presentación</dt>
                  <dd>{product.dimensions}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Marca</dt>
                  <dd>{product.brand}</dd>
                </div>
              </dl>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            {product.category === "Salud y bienestar" && (
              <p className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-xs text-muted-foreground">
                Producto de uso doméstico. Consultá a un profesional de salud
                para interpretar mediciones o ante cualquier duda.
              </p>
            )}
          </div>
        </div>
        {related.length > 0 && (
          <section className="py-16">
            <p className="text-xs font-semibold uppercase tracking-[.25em] text-primary">
              También te puede gustar
            </p>
            <h2 className="mt-2 font-serif text-4xl">Productos relacionados</h2>
            <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

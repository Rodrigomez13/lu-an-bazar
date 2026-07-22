import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductsCatalog } from "@/components/products-catalog";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublishedProducts } from "@/lib/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Catálogo de productos",
  description:
    "Explorá el catálogo actualizado de Lu An Bazar y consultá disponibilidad por WhatsApp.",
  alternates: { canonical: "/productos" },
  openGraph: {
    title: "Catálogo de productos | Lu An Bazar",
    description:
      "Bazar, tecnología, electrodomésticos y productos para el hogar en Formosa.",
    url: "/productos",
  },
};

export default async function ProductsPage() {
  const products = await getPublishedProducts();
  return (
    <Suspense fallback={<CatalogLoading />}>
      <ProductsCatalog products={products} />
    </Suspense>
  );
}

function CatalogLoading() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="h-12 w-72 animate-pulse rounded-lg bg-secondary" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="aspect-[4/3] animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

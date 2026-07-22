import { getPublishedProducts } from "@/lib/catalog";
import { business } from "@/lib/business";

export const revalidate = 300;

const columns = [
  "id",
  "title",
  "description",
  "availability",
  "condition",
  "price",
  "sale_price",
  "link",
  "image_link",
  "brand",
  "product_type",
] as const;

function escapeCsv(value: string | number) {
  const text = String(value).replace(/\r?\n/g, " ").trim();
  return /[",]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function absoluteUrl(value: string) {
  return new URL(value, business.siteUrl).toString();
}

export async function GET() {
  const products = (await getPublishedProducts()).filter(
    (product) => typeof product.price === "number" && product.price > 0,
  );

  const rows = products.map((product) => {
    const link = new URL(`/productos/${product.id}`, business.siteUrl);
    link.searchParams.set("utm_source", "facebook");
    link.searchParams.set("utm_medium", "catalog");
    link.searchParams.set("utm_campaign", "meta_catalog");

    const regularPrice = product.previousPrice ?? product.price!;
    return {
      id: product.code || product.id,
      title: product.name,
      description: product.description,
      availability: product.stock === 0 ? "out of stock" : "in stock",
      condition: "new",
      price: `${regularPrice.toFixed(2)} ARS`,
      sale_price: product.previousPrice
        ? `${product.price!.toFixed(2)} ARS`
        : "",
      link: link.toString(),
      image_link: absoluteUrl(product.image),
      brand: product.brand || business.name,
      product_type: product.category,
    };
  });

  const csv = [
    columns.join(","),
    ...rows.map((row) => columns.map((column) => escapeCsv(row[column])).join(",")),
  ].join("\r\n");

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'inline; filename="lu-an-bazar-meta-catalog.csv"',
      "cache-control": "public, s-maxage=300, stale-while-revalidate=3600",
      "x-content-type-options": "nosniff",
    },
  });
}

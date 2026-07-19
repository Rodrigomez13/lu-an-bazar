import type { MetadataRoute } from "next";
import { business } from "@/lib/business";
import { getPublishedProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getPublishedProducts();
  const updated = new Date();
  return [
    {
      url: business.siteUrl,
      lastModified: updated,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${business.siteUrl}/productos`,
      lastModified: updated,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...products.map((product) => ({
      url: `${business.siteUrl}/productos/${product.id}`,
      lastModified: updated,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}

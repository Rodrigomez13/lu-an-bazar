import "server-only";

import { cache } from "react";
import { createAdminSupabaseClient, createPublicSupabaseClient } from "@/lib/supabase/clients";
import {
  isSupabaseAdminConfigured,
  isSupabasePublicConfigured,
} from "@/lib/supabase/config";
import { products as fallbackProducts, type Product } from "@/lib/data";

export type ProductRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number | string | null;
  previous_price: number | string | null;
  image_url: string;
  image_path: string | null;
  original_image_path: string | null;
  description: string;
  stock: number | null;
  featured: boolean;
  offer: boolean;
  is_new: boolean;
  published: boolean;
  color: string;
  material: string;
  dimensions: string;
  features: string[] | null;
  keywords: string[] | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminProduct = Product & {
  databaseId?: string;
  published: boolean;
  imagePath?: string;
  originalImagePath?: string;
  createdAt?: string;
  updatedAt?: string;
};

function nullableNumber(value: number | string | null) {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function productFromRow(row: ProductRow): AdminProduct {
  return {
    databaseId: row.id,
    id: row.slug,
    code: row.code,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: nullableNumber(row.price),
    previousPrice: nullableNumber(row.previous_price),
    image: row.image_url,
    description: row.description,
    stock: row.stock ?? undefined,
    featured: row.featured,
    offer: row.offer,
    isNew: row.is_new,
    published: row.published,
    color: row.color,
    material: row.material,
    dimensions: row.dimensions,
    features: row.features ?? [],
    keywords: row.keywords ?? [],
    imagePath: row.image_path ?? undefined,
    originalImagePath: row.original_image_path ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function fallbackAdminProducts(): AdminProduct[] {
  return fallbackProducts.map((product) => ({
    ...product,
    offer: product.offer ?? Boolean(product.previousPrice),
    published: true,
  }));
}

export const getPublishedProducts = cache(async (): Promise<Product[]> => {
  if (!isSupabasePublicConfigured()) return fallbackProducts;
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("published", true)
      .is("archived_at", null)
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as ProductRow[] | null)?.map(productFromRow) ?? [];
  } catch (error) {
    console.error("No se pudo leer el catálogo de Supabase:", error);
    return fallbackProducts;
  }
});

export async function getAdminProducts(): Promise<AdminProduct[]> {
  if (!isSupabaseAdminConfigured()) return fallbackAdminProducts();
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ProductRow[]).map(productFromRow);
}

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export const runtime = "nodejs";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 10 * 1024 * 1024;

function revalidateCatalog() {
  revalidatePath("/");
  revalidatePath("/productos", "layout");
  revalidatePath("/sitemap.xml");
}

function stringValue(formData: FormData, key: string, fallback = "") {
  return String(formData.get(key) ?? fallback).trim();
}

function optionalNumber(formData: FormData, key: string) {
  const value = stringValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} debe ser un número válido.`);
  }
  return parsed;
}

function listValue(formData: FormData, key: string) {
  return stringValue(formData, key)
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function boolValue(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

function validateImage(file: File) {
  if (!imageTypes.has(file.type)) {
    throw new Error("La imagen debe ser JPG, PNG o WebP.");
  }
  if (file.size > maxImageSize) {
    throw new Error("La imagen no puede superar los 10 MB.");
  }
}

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadImage(file: File, folder: string) {
  validateImage(file);
  const supabase = createAdminSupabaseClient();
  const path = `${folder}/${crypto.randomUUID()}.${extensionFor(file)}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, await file.arrayBuffer(), {
      contentType: file.type,
      cacheControl: "31536000",
      upsert: false,
    });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

function productPayload(formData: FormData) {
  const name = stringValue(formData, "name");
  const category = stringValue(formData, "category");
  if (name.length < 3) throw new Error("Completá el título del producto.");
  if (category.length < 2) throw new Error("Elegí una categoría.");

  const price = optionalNumber(formData, "price");
  const previousPrice = optionalNumber(formData, "previousPrice");
  if (price !== null && previousPrice !== null && previousPrice <= price) {
    throw new Error("El precio anterior debe ser mayor que el precio actual.");
  }

  return {
    code: stringValue(formData, "code") || null,
    name,
    category,
    brand: stringValue(formData, "brand", "Genérica") || "Genérica",
    price,
    previous_price: previousPrice,
    description: stringValue(formData, "description"),
    stock: optionalNumber(formData, "stock"),
    featured: boolValue(formData, "featured"),
    offer: boolValue(formData, "offer"),
    is_new: boolValue(formData, "isNew"),
    published: boolValue(formData, "published"),
    color: stringValue(formData, "color", "A confirmar") || "A confirmar",
    material:
      stringValue(formData, "material", "A confirmar") || "A confirmar",
    dimensions:
      stringValue(formData, "dimensions", "A confirmar") || "A confirmar",
    features: listValue(formData, "features"),
    keywords: listValue(formData, "keywords"),
  };
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminRole(["admin", "catalog_manager"]);
    const formData = await request.formData();
    const rawImage = formData.get("originalImage");
    const catalogImage = formData.get("catalogImage");
    if (!(rawImage instanceof File) || rawImage.size === 0) {
      throw new Error("Seleccioná una imagen para el producto.");
    }

    const original = await uploadImage(rawImage, "originals");
    const finalImage =
      catalogImage instanceof File && catalogImage.size > 0
        ? await uploadImage(catalogImage, "catalog")
        : original;
    const supabase = createAdminSupabaseClient();
    const payload = {
      ...productPayload(formData),
      image_url: finalImage.url,
      image_path: finalImage.path,
      original_image_path: original.path,
    };
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    revalidateCatalog();
    return Response.json({ ok: true, product: data });
  } catch (error) {
    return apiError(error, "No se pudo crear el producto.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdminRole(["admin", "catalog_manager"]);
    const formData = await request.formData();
    const id = stringValue(formData, "databaseId");
    if (!id) throw new Error("Falta identificar el producto.");

    const payload: Record<string, unknown> = productPayload(formData);
    const rawImage = formData.get("originalImage");
    const catalogImage = formData.get("catalogImage");
    if (rawImage instanceof File && rawImage.size > 0) {
      const original = await uploadImage(rawImage, "originals");
      const finalImage =
        catalogImage instanceof File && catalogImage.size > 0
          ? await uploadImage(catalogImage, "catalog")
          : original;
      payload.image_url = finalImage.url;
      payload.image_path = finalImage.path;
      payload.original_image_path = original.path;
    }

    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .is("archived_at", null)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    revalidateCatalog();
    return Response.json({ ok: true, product: data });
  } catch (error) {
    return apiError(error, "No se pudo actualizar el producto.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminRole(["admin", "catalog_manager"]);
    const { id } = (await request.json()) as { id?: string };
    if (!id) throw new Error("Falta identificar el producto.");
    const supabase = createAdminSupabaseClient();
    const { error } = await supabase
      .from("products")
      .update({ archived_at: new Date().toISOString(), published: false })
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateCatalog();
    return Response.json({ ok: true });
  } catch (error) {
    return apiError(error, "No se pudo archivar el producto.");
  }
}

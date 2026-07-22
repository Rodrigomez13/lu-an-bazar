import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";
import { apiError, requireAdminRole } from "@/lib/admin-api";
import { productFromRow, type ProductRow } from "@/lib/catalog";
import {
  createProductPostDraft,
  fetchFacebookPagePosts,
  graphPostImage,
  inferProductDraft,
  publishFacebookPost,
  type MetaPostRow,
} from "@/lib/meta-social";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export const runtime = "nodejs";

type ActionBody = {
  action?: "create_draft" | "update" | "publish" | "sync_imports" | "approve_import" | "reject_import";
  id?: string;
  productId?: string;
  message?: string;
  title?: string;
  description?: string;
  category?: string;
  price?: number | string | null;
};

function required(value: unknown, label: string) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`Falta ${label}.`);
  return text;
}

function optionalPrice(value: ActionBody["price"]) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error("El precio no es válido.");
  return parsed;
}

async function storeRemoteImage(url: string) {
  const parsedUrl = new URL(url);
  const allowedHost = ["fbcdn.net", "facebook.com", "fbsbx.com"].some(
    (domain) => parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`),
  );
  if (parsedUrl.protocol !== "https:" || !allowedHost) {
    throw new Error("La imagen no proviene de un dominio permitido de Meta.");
  }
  const response = await fetch(parsedUrl, { cache: "no-store", redirect: "error" });
  if (!response.ok) throw new Error("No se pudo descargar la imagen de la publicación.");
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  const extension = extensions[contentType];
  if (!extension) throw new Error("La imagen remota no es JPG, PNG o WebP.");
  const bytes = await response.arrayBuffer();
  if (bytes.byteLength > 10 * 1024 * 1024) throw new Error("La imagen remota supera los 10 MB.");
  const path = `social-imports/${crypto.randomUUID()}.${extension}`;
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.storage.from("product-images").upload(path, bytes, {
    contentType,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`No se pudo guardar la imagen: ${error.message}`);
  return { path, url: supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl };
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireAdminRole(["admin", "catalog_manager"]);
    const body = (await request.json()) as ActionBody;
    const action = required(body.action, "la acción") as NonNullable<ActionBody["action"]>;
    const supabase = createAdminSupabaseClient();

    if (action === "create_draft") {
      const productId = required(body.productId, "el producto");
      const { data: row, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .is("archived_at", null)
        .single();
      if (productError) throw new Error(productError.message);
      const product = productFromRow(row as ProductRow);
      const draft = createProductPostDraft(product);
      const { data, error } = await supabase.from("meta_posts").insert({
        direction: "outbound",
        platform: "facebook",
        source: "product",
        status: "draft",
        product_id: productId,
        message: body.message?.trim() || draft.message,
        image_url: draft.imageUrl,
        link_url: draft.linkUrl,
        created_by: actor.userId,
        updated_by: actor.userId,
      }).select("*").single();
      if (error) throw new Error(error.message);
      revalidatePath("/admin/publicaciones");
      return Response.json({ ok: true, post: data });
    }

    if (action === "update") {
      const id = required(body.id, "el borrador");
      const message = required(body.message, "el texto de la publicación");
      const { data, error } = await supabase.from("meta_posts").update({
        message: message.slice(0, 5000),
        draft_title: body.title?.trim().slice(0, 120) || null,
        draft_description: body.description?.trim().slice(0, 2000) || null,
        draft_category: body.category?.trim().slice(0, 80) || null,
        draft_price: optionalPrice(body.price),
        updated_by: actor.userId,
        last_error: null,
      }).eq("id", id).in("status", ["draft", "pending_review", "failed"]).select("*").single();
      if (error) throw new Error(error.message);
      revalidatePath("/admin/publicaciones");
      return Response.json({ ok: true, post: data });
    }

    if (action === "publish") {
      const id = required(body.id, "el borrador");
      const { data: post, error: readError } = await supabase.from("meta_posts").select("*").eq("id", id).single();
      if (readError) throw new Error(readError.message);
      const row = post as MetaPostRow;
      if (row.direction !== "outbound") throw new Error("Sólo se pueden publicar borradores salientes.");
      if (row.status === "published" || row.status === "publishing") throw new Error("La publicación ya fue enviada o está en proceso.");
      await supabase.from("meta_posts").update({ status: "publishing", last_error: null, updated_by: actor.userId }).eq("id", id);
      try {
        const result = await publishFacebookPost(required(row.message, "el texto"), row.link_url);
        const { data, error } = await supabase.from("meta_posts").update({
          status: "published",
          external_post_id: result.id,
          permalink_url: `https://www.facebook.com/${result.id}`,
          published_at: new Date().toISOString(),
          updated_by: actor.userId,
        }).eq("id", id).select("*").single();
        if (error) throw new Error(error.message);
        revalidatePath("/admin/publicaciones");
        return Response.json({ ok: true, post: data });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Meta rechazó la publicación.";
        await supabase.from("meta_posts").update({ status: "failed", last_error: message, updated_by: actor.userId }).eq("id", id);
        throw error;
      }
    }

    if (action === "sync_imports") {
      const posts = await fetchFacebookPagePosts();
      const rows = posts.map((post) => {
        const draft = inferProductDraft(post.message);
        return {
          direction: "inbound",
          platform: "facebook",
          source: "facebook_post",
          status: "pending_review",
          external_post_id: post.id,
          message: post.message ?? "",
          draft_title: draft.title,
          draft_description: draft.description,
          draft_price: draft.price,
          draft_category: draft.category,
          image_url: graphPostImage(post),
          permalink_url: post.permalink_url ?? null,
          published_at: post.created_time ?? null,
          raw_payload: post,
          created_by: actor.userId,
          updated_by: actor.userId,
        };
      });
      if (rows.length) {
        const { error } = await supabase.from("meta_posts").upsert(rows, {
          onConflict: "external_post_id",
          ignoreDuplicates: true,
        });
        if (error) throw new Error(error.message);
      }
      revalidatePath("/admin/publicaciones");
      return Response.json({ ok: true, found: rows.length });
    }

    if (action === "reject_import") {
      const id = required(body.id, "la publicación");
      const { error } = await supabase.from("meta_posts").update({ status: "rejected", updated_by: actor.userId }).eq("id", id).eq("direction", "inbound");
      if (error) throw new Error(error.message);
      revalidatePath("/admin/publicaciones");
      return Response.json({ ok: true });
    }

    if (action === "approve_import") {
      const id = required(body.id, "la publicación");
      const { data: post, error: readError } = await supabase.from("meta_posts").select("*").eq("id", id).eq("direction", "inbound").single();
      if (readError) throw new Error(readError.message);
      const row = post as MetaPostRow;
      if (row.product_id) throw new Error("Esta publicación ya fue convertida en producto.");
      if (row.status !== "pending_review") throw new Error("Esta publicación ya fue revisada.");
      if (!row.image_url) throw new Error("La publicación no tiene una imagen importable.");
      const title = required(body.title || row.draft_title, "el título");
      const category = required(body.category || row.draft_category || "Hogar", "la categoría");
      const image = await storeRemoteImage(row.image_url);
      const { data: product, error: productError } = await supabase.from("products").insert({
        code: null,
        slug: null,
        name: title.slice(0, 120),
        category: category.slice(0, 80),
        brand: "A confirmar",
        price: optionalPrice(body.price ?? row.draft_price),
        description: String(body.description ?? row.draft_description ?? row.message).trim().slice(0, 2000),
        published: false,
        is_new: true,
        image_url: image.url,
        image_path: image.path,
        original_image_path: image.path,
        created_by: actor.userId,
        updated_by: actor.userId,
      }).select("*").single();
      if (productError) throw new Error(productError.message);
      const { error: updateError } = await supabase.from("meta_posts").update({
        status: "approved",
        product_id: product.id,
        draft_title: title,
        draft_category: category,
        draft_description: body.description ?? row.draft_description,
        draft_price: optionalPrice(body.price ?? row.draft_price),
        updated_by: actor.userId,
      }).eq("id", id);
      if (updateError) throw new Error(updateError.message);
      revalidatePath("/admin/publicaciones");
      revalidatePath("/admin/productos");
      return Response.json({ ok: true, product });
    }

    throw new Error("Acción no reconocida.");
  } catch (error) {
    return apiError(error, "No se pudo completar la operación con Meta.");
  }
}

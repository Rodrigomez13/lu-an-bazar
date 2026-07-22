import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { business } from "@/lib/business";
import type { AdminProduct } from "@/lib/catalog";

export type MetaPostRow = {
  id: string;
  direction: "outbound" | "inbound";
  platform: "facebook" | "instagram";
  source: "manual" | "product" | "facebook_post" | "instagram_post";
  status: "draft" | "pending_review" | "publishing" | "published" | "failed" | "approved" | "rejected" | "archived";
  product_id: string | null;
  external_post_id: string | null;
  message: string;
  draft_title: string | null;
  draft_description: string | null;
  draft_price: number | string | null;
  draft_category: string | null;
  image_url: string | null;
  link_url: string | null;
  permalink_url: string | null;
  scheduled_for: string | null;
  published_at: string | null;
  last_error: string | null;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export function getMetaSocialConfig() {
  const pageId = process.env.META_PAGE_ID?.trim() ?? "";
  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN?.trim() ?? "";
  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v25.0";
  return {
    pageId,
    pageAccessToken,
    version: version.startsWith("v") ? version : `v${version}`,
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() ?? "",
    webhookAppSecret: process.env.META_WEBHOOK_APP_SECRET?.trim() ?? "",
    pageReady: Boolean(pageId && pageAccessToken),
    webhookReady: Boolean(process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() && process.env.META_WEBHOOK_APP_SECRET?.trim()),
  };
}

function productLink(product: AdminProduct) {
  const url = new URL(`/productos/${product.id}`, business.siteUrl);
  url.searchParams.set("utm_source", "facebook");
  url.searchParams.set("utm_medium", "social");
  url.searchParams.set("utm_campaign", "catalogo_organico");
  url.searchParams.set("utm_content", product.code);
  return url.toString();
}

export function createProductPostDraft(product: AdminProduct) {
  const price = product.price
    ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(product.price)
    : "Consultanos el precio";
  const labels = [product.offer ? "OFERTA" : "", product.isNew ? "NOVEDAD" : ""].filter(Boolean);
  const heading = labels.length ? `✨ ${labels.join(" · ")} ✨\n` : "";
  const description = product.description.trim() || "Un producto práctico para sumar a tu día a día.";
  return {
    message: `${heading}${product.name}\n\n${description}\n\n💛 ${price}\n📍 ${business.address}\n📲 Consultas por WhatsApp: ${business.phoneDisplay}\n\n#LuAnBazar #BazarFormosa`,
    linkUrl: productLink(product),
    imageUrl: product.image,
  };
}

type GraphPost = {
  id: string;
  message?: string;
  permalink_url?: string;
  created_time?: string;
  full_picture?: string;
  attachments?: { data?: Array<{ media?: { image?: { src?: string } }; url?: string }> };
};

async function graphRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = getMetaSocialConfig();
  if (!config.pageReady) {
    throw new Error("Faltan META_PAGE_ID y META_PAGE_ACCESS_TOKEN en el servidor.");
  }
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${config.pageAccessToken}`);
  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${path}`,
    { ...init, headers, cache: "no-store" },
  );
  const body = (await response.json()) as T & { error?: { message?: string; code?: number } };
  if (!response.ok || body.error) {
    throw new Error(body.error?.message || `Meta respondió con HTTP ${response.status}.`);
  }
  return body;
}

export async function publishFacebookPost(message: string, linkUrl?: string | null) {
  const { pageId } = getMetaSocialConfig();
  const body = new URLSearchParams({ message });
  if (linkUrl) body.set("link", linkUrl);
  return graphRequest<{ id: string }>(`${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export async function fetchFacebookPagePosts() {
  const { pageId } = getMetaSocialConfig();
  const fields = "id,message,permalink_url,created_time,full_picture,attachments{media,url}";
  const result = await graphRequest<{ data?: GraphPost[] }>(`${pageId}/posts?fields=${encodeURIComponent(fields)}&limit=25`);
  return result.data ?? [];
}

export function inferProductDraft(message = "") {
  const lines = message.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const rawTitle = lines.find((line) => !/^[$€]|^(oferta|precio|consult)/i.test(line)) || "Producto importado";
  const title = rawTitle.replace(/^[^\p{L}\p{N}]+/u, "").slice(0, 100) || "Producto importado";
  const priceMatch = message.match(/\$\s*([\d.]+(?:,\d{1,2})?)/);
  const price = priceMatch ? Number(priceMatch[1].replace(/\./g, "").replace(",", ".")) : null;
  return {
    title,
    description: message.slice(0, 1500),
    price: Number.isFinite(price) ? price : null,
    category: "Hogar",
  };
}

export function graphPostImage(post: GraphPost) {
  return post.full_picture || post.attachments?.data?.[0]?.media?.image?.src || null;
}

export function verifyMetaWebhookSignature(rawBody: string, signature: string | null) {
  const secret = getMetaSocialConfig().webhookAppSecret;
  if (!secret || !signature?.startsWith("sha256=")) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature.slice(7), "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

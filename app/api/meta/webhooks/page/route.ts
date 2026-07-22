import { NextRequest } from "next/server";
import { getMetaSocialConfig, inferProductDraft, verifyMetaWebhookSignature } from "@/lib/meta-social";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  const mode = query.get("hub.mode");
  const token = query.get("hub.verify_token");
  const challenge = query.get("hub.challenge");
  const expected = getMetaSocialConfig().webhookVerifyToken;
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return Response.json({ ok: false, error: "Verificación inválida." }, { status: 403 });
}

type WebhookPayload = {
  object?: string;
  entry?: Array<{
    changes?: Array<{
      field?: string;
      value?: {
        post_id?: string;
        message?: string;
        created_time?: number;
        permalink_url?: string;
      };
    }>;
  }>;
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (!verifyMetaWebhookSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return Response.json({ ok: false, error: "Firma inválida." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as WebhookPayload;
    if (payload.object !== "page") return Response.json({ ok: true, ignored: true });
    const rows = payload.entry?.flatMap((entry) =>
      (entry.changes ?? [])
        .filter((change) => change.field === "feed" && change.value?.post_id)
        .map((change) => {
          const value = change.value!;
          const draft = inferProductDraft(value.message);
          return {
            direction: "inbound",
            platform: "facebook",
            source: "facebook_post",
            status: "pending_review",
            external_post_id: value.post_id!,
            message: value.message ?? "",
            draft_title: draft.title,
            draft_description: draft.description,
            draft_price: draft.price,
            draft_category: draft.category,
            permalink_url: value.permalink_url ?? null,
            published_at: value.created_time ? new Date(value.created_time * 1000).toISOString() : null,
            raw_payload: change,
          };
        }),
    ) ?? [];
    if (rows.length) {
      const supabase = createAdminSupabaseClient();
      const { error } = await supabase.from("meta_posts").upsert(rows, {
        onConflict: "external_post_id",
        ignoreDuplicates: true,
      });
      if (error) throw error;
    }
    return Response.json({ ok: true, received: rows.length });
  } catch (error) {
    console.error("No se pudo procesar el webhook de Meta:", error);
    return Response.json({ ok: false }, { status: 500 });
  }
}

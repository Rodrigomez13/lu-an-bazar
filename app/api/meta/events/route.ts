import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const allowedEvents = [
  "ViewContent",
  "AddToCart",
  "Search",
  "Contact",
  "Lead",
] as const;

const eventSchema = z.object({
  eventName: z.enum(allowedEvents),
  eventId: z.string().uuid(),
  eventSourceUrl: z.string().url(),
  contentIds: z.array(z.string().min(1).max(160)).max(50).default([]),
  contentName: z.string().max(300).optional(),
  category: z.string().max(160).optional(),
  value: z.number().nonnegative().finite().optional(),
  currency: z.string().length(3).optional(),
  quantity: z.number().int().positive().max(999).optional(),
});

export async function POST(request: NextRequest) {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin || requestOrigin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const parsed = eventSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const pixelId =
    process.env.META_PIXEL_ID ?? process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  const graphVersion = process.env.META_GRAPH_API_VERSION;
  if (
    !pixelId ||
    !accessToken ||
    !graphVersion ||
    !/^v\d+\.\d+$/.test(graphVersion)
  ) {
    return NextResponse.json({ ok: false, configured: false });
  }

  const sourceUrl = new URL(parsed.data.eventSourceUrl);
  if (sourceUrl.origin !== request.nextUrl.origin) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const customData = {
    content_ids: parsed.data.contentIds.length
      ? parsed.data.contentIds
      : undefined,
    content_name: parsed.data.contentName,
    content_category: parsed.data.category,
    content_type: parsed.data.contentIds.length ? "product" : undefined,
    value: parsed.data.value,
    currency: parsed.data.currency?.toUpperCase(),
    num_items: parsed.data.quantity,
  };
  const payload = {
    data: [
      {
        event_name: parsed.data.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: parsed.data.eventId,
        event_source_url: sourceUrl.toString(),
        action_source: "website",
        user_data: {
          client_ip_address: clientIp,
          client_user_agent: request.headers.get("user-agent") ?? undefined,
          fbp: request.cookies.get("_fbp")?.value,
          fbc: request.cookies.get("_fbc")?.value,
        },
        custom_data: customData,
      },
    ],
    test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pixelId)}/events`,
      {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { ok: false, configured: true },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, configured: true });
  } catch {
    return NextResponse.json(
      { ok: false, configured: true },
      { status: 502 },
    );
  }
}

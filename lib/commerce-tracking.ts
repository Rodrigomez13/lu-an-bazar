"use client";

import { track } from "@vercel/analytics";

export type CommerceEventName =
  | "ViewContent"
  | "AddToCart"
  | "Search"
  | "Contact"
  | "Lead";

type Primitive = string | number | boolean | null | undefined;

export type CommerceEventData = {
  contentId?: string;
  contentName?: string;
  category?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  itemCount?: number;
  source?: string;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const consentKey = "luan_meta_consent";

function hasMetaConsent() {
  return window.localStorage.getItem(consentKey) === "accepted";
}

function flatProperties(data: CommerceEventData): Record<string, Primitive> {
  return {
    content_id: data.contentId,
    content_name: data.contentName,
    category: data.category,
    value: data.value,
    currency: data.currency,
    quantity: data.quantity,
    item_count: data.itemCount,
    source: data.source,
  };
}

export function trackCommerceEvent(
  eventName: CommerceEventName,
  data: CommerceEventData = {},
) {
  if (typeof window === "undefined") return;

  track(eventName, flatProperties(data));
  if (!hasMetaConsent()) return;

  const eventId = crypto.randomUUID();
  const metaData = {
    content_ids: data.contentId ? [data.contentId] : undefined,
    content_name: data.contentName,
    content_category: data.category,
    content_type: data.contentId ? "product" : undefined,
    value: data.value,
    currency: data.currency,
    num_items: data.itemCount ?? data.quantity,
  };

  window.fbq?.("track", eventName, metaData, { eventID: eventId });

  void fetch("/api/meta/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      eventName,
      eventId,
      eventSourceUrl: window.location.href,
      contentIds: data.contentId ? [data.contentId] : [],
      contentName: data.contentName,
      category: data.category,
      value: data.value,
      currency: data.currency,
      quantity: data.itemCount ?? data.quantity,
    }),
  }).catch(() => undefined);
}

export const metaConsent = {
  key: consentKey,
  event: "luan-meta-consent-change",
} as const;

export function setMetaConsentPreference(value: "accepted" | "declined") {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(metaConsent.key, value);
  window.dispatchEvent(new Event(metaConsent.event));
}

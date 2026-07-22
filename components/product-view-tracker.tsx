"use client";

import { useEffect } from "react";
import { trackCommerceEvent } from "@/lib/commerce-tracking";

export function ProductViewTracker({
  id,
  name,
  category,
  value,
}: {
  id: string;
  name: string;
  category: string;
  value?: number;
}) {
  useEffect(() => {
    trackCommerceEvent("ViewContent", {
      contentId: id,
      contentName: name,
      category,
      value,
      currency: value ? "ARS" : undefined,
      source: "product_detail",
    });
  }, [category, id, name, value]);

  return null;
}

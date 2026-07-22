"use client";

import type { ComponentProps } from "react";
import { trackCommerceEvent, type CommerceEventData } from "@/lib/commerce-tracking";

type Props = ComponentProps<"a"> & {
  tracking: CommerceEventData;
};

export function TrackedWhatsAppLink({ tracking, onClick, ...props }: Props) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackCommerceEvent("Contact", tracking);
        onClick?.(event);
      }}
    />
  );
}

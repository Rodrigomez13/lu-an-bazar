"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  metaConsent,
  setMetaConsentPreference,
} from "@/lib/commerce-tracking";

type ConsentValue = "accepted" | "declined" | "unknown";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __luanMetaPixelInitialized?: boolean;
    __luanMetaLastPath?: string;
  }
}

function getConsentSnapshot(): ConsentValue {
  const value = window.localStorage.getItem(metaConsent.key);
  return value === "accepted" || value === "declined" ? value : "unknown";
}

function getConsentServerSnapshot(): ConsentValue {
  return "unknown";
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(metaConsent.event, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(metaConsent.event, handleChange);
  };
}

function initializePixel(pixelId: string) {
  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      fbq.queue.push(args);
    } as ((...args: unknown[]) => void) & {
      queue: unknown[][];
      loaded?: boolean;
      version?: string;
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  if (!window.__luanMetaPixelInitialized) {
    window.fbq?.("init", pixelId);
    window.__luanMetaPixelInitialized = true;
  }
}

export function MetaConsent({ pixelId }: { pixelId?: string }) {
  const pathname = usePathname();
  const consent = useSyncExternalStore(
    subscribe,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  useEffect(() => {
    if (consent !== "accepted" || !pixelId) return;
    initializePixel(pixelId);
    const path = `${pathname}${window.location.search}`;
    if (window.__luanMetaLastPath !== path) {
      window.fbq?.("track", "PageView");
      window.__luanMetaLastPath = path;
    }
  }, [consent, pathname, pixelId]);

  if (!pixelId || consent !== "unknown") return null;

  return (
    <aside
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-xl rounded-2xl border bg-popover/95 p-4 text-popover-foreground shadow-2xl backdrop-blur-xl sm:left-5 sm:right-auto sm:mx-0"
      aria-label="Preferencias de medición"
    >
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">Ayudanos a mejorar el catálogo</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Con tu permiso, usamos Meta Pixel para medir visitas y consultas.
            No compartimos información del apartado privado de préstamos.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => setMetaConsentPreference("accepted")}
            >
              Permitir medición
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setMetaConsentPreference("declined")}
            >
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

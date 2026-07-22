"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setMetaConsentPreference } from "@/lib/commerce-tracking";

export function MetaPrivacyControls() {
  const save = (value: "accepted" | "declined") => {
    setMetaConsentPreference(value);
    toast.success(
      value === "accepted"
        ? "Medición opcional activada"
        : "Medición opcional desactivada",
    );
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="button" onClick={() => save("accepted")}>
        Permitir medición de Meta
      </Button>
      <Button type="button" variant="outline" onClick={() => save("declined")}>
        Desactivar medición de Meta
      </Button>
    </div>
  );
}

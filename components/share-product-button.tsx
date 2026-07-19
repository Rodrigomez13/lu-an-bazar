"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareProductButton({
  name,
  path,
  showLabel = false,
}: {
  name: string;
  path: string;
  showLabel?: boolean;
}) {
  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${name} | Lu An Bazar`,
          text: `Mirá ${name} en Lu An Bazar`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("No pudimos compartir el producto");
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? "lg" : "icon"}
      onClick={share}
      aria-label={`Compartir ${name}`}
    >
      <Share2 />
      {showLabel && "Compartir"}
    </Button>
  );
}

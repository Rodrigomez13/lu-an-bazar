"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        <AlertTriangle className="mx-auto size-10 text-destructive" />
        <h1 className="mt-5 font-serif text-3xl">
          No pudimos cargar esta sección
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Puede ser un problema momentáneo. Intentá nuevamente.
        </p>
        <Button className="mt-6" onClick={reset}>
          Reintentar
        </Button>
      </div>
    </main>
  );
}

"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CopyConfigValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex gap-2">
      <Input value={value} readOnly className="font-mono text-xs" />
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={async () => {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
        aria-label="Copiar valor"
      >
        {copied ? <Check /> : <Copy />}
      </Button>
    </div>
  );
}

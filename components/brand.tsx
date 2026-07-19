import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      aria-label="Lu An Bazar, inicio"
    >
      <div
        className={`relative overflow-hidden rounded-lg border border-primary/35 bg-brand-navy shadow-sm ${compact ? "size-11" : "size-14"}`}
      >
        <Image
          src="/images/brand/logotipo.png"
          alt=""
          fill
          priority
          className="object-contain"
          sizes={compact ? "44px" : "56px"}
        />
      </div>
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-tight">Lu An</span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-primary">
            Bazar
          </span>
        </div>
      )}
    </Link>
  );
}

export function LotusMark({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-3 text-primary ${className}`}
    >
      <span className="h-px w-10 bg-primary/50" />
      <span className="size-2 rotate-45 border border-primary" />
      <span className="h-px w-10 bg-primary/50" />
    </div>
  );
}

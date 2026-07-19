import Link from "next/link";
import { Camera, Clock, MapPin, MessageCircle } from "lucide-react";
import { Brand } from "@/components/brand";
export function SiteFooter() {
  return (
    <footer id="contacto" className="border-t bg-brand-navy text-brand-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-4">
          <Brand />
          <p className="max-w-sm text-sm leading-relaxed text-brand-cream/70">
            Bazar, hogar y regalos elegidos con cuidado. Consultá disponibilidad
            y reservá por WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-primary">Explorá</p>
          <Link href="/productos">Todos los productos</Link>
          <Link href="/#categorias">Categorías</Link>
          <Link href="/#ofertas">Ofertas</Link>
          <Link href="/#novedades">Novedades</Link>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-primary">Estamos cerca</p>
          <p className="flex items-center gap-2">
            <MapPin className="size-4" />
            Formosa, Argentina
          </p>
          <p className="flex items-center gap-2">
            <Clock className="size-4" />
            Lun a sáb · 9 a 20 h
          </p>
          <a
            className="flex items-center gap-2"
            href="https://wa.me/543704000000"
          >
            <MessageCircle className="size-4" />
            3704 000000
          </a>
          <p className="flex items-center gap-2">
            <Camera className="size-4" />
            @luanbazar
          </p>
        </div>
      </div>
      <div className="border-t border-brand-cream/10 px-5 py-5 text-center text-xs text-brand-cream/50">
        © 2026 Lu An Bazar ·{" "}
        <Link href="/ingresar" className="hover:text-brand-cream">
          Acceso administrativo
        </Link>
      </div>
      <a
        href="https://wa.me/543704000000"
        target="_blank"
        rel="noreferrer"
        aria-label="Consultar por WhatsApp"
        className="fixed right-5 bottom-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <MessageCircle className="size-7" />
      </a>
    </footer>
  );
}

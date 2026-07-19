import Link from "next/link";
import {
  Clock,
  ExternalLink,
  Camera,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { business, mapsUrl, whatsappUrl } from "@/lib/business";

export function SiteFooter() {
  return (
    <footer id="contacto" className="border-t bg-brand-navy text-brand-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 lg:px-8">
        <div className="flex flex-col gap-4">
          <Brand />
          <p className="max-w-sm text-sm leading-relaxed text-brand-cream/70">
            Bazar, tecnología, electrodomésticos y productos útiles para todos
            los días. Consultá y reservá por WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-primary">Explorá</p>
          <Link href="/productos">Todos los productos</Link>
          <Link href="/#categorias">Categorías</Link>
          <Link href="/#ofertas">Ofertas</Link>
          <Link href="/#novedades">Novedades</Link>
          {business.facebookUrl && (
            <a
              href={business.facebookUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2"
            >
              Facebook <ExternalLink className="size-3" />
            </a>
          )}
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <p className="font-semibold text-primary">Estamos cerca</p>
          <a
            className="flex items-center gap-2 hover:text-primary"
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin className="size-4" />
            {business.address}
          </a>
          <p className="flex items-center gap-2">
            <Clock className="size-4" />
            Lun a sáb · 9 a 20 h
          </p>
          <a
            className="flex items-center gap-2 hover:text-primary"
            href={whatsappUrl()}
            target="_blank"
            rel="noreferrer"
          >
            <Phone className="size-4" />
            {business.phoneDisplay}
          </a>
          {business.instagramUrl && (
            <a
              className="flex items-center gap-2 hover:text-primary"
              href={business.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              <Camera className="size-4" />
              {business.instagramHandle}
            </a>
          )}
        </div>
      </div>
      <div className="border-t border-brand-cream/10 px-5 py-5 text-center text-xs text-brand-cream/50">
        © 2026 Lu An Bazar ·{" "}
        <Link href="/ingresar" className="hover:text-brand-cream">
          Acceso administrativo
        </Link>
      </div>
      <a
        href={whatsappUrl(
          "Hola, quiero consultar por los productos de Lu An Bazar.",
        )}
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

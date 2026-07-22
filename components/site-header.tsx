"use client";

import Link from "next/link";
import { Menu, MessageCircle } from "lucide-react";
import { Brand } from "@/components/brand";
import { ConsultationListTrigger } from "@/components/consultation-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { whatsappUrl } from "@/lib/business";
import { TrackedWhatsAppLink } from "@/components/tracked-whatsapp-link";

const links = [
  ["Inicio", "/"],
  ["Productos", "/productos"],
  ["Categorías", "/#categorias"],
  ["Ofertas", "/#ofertas"],
  ["Novedades", "/#novedades"],
  ["Contacto", "/#contacto"],
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Brand />
        <nav
          className="hidden items-center gap-6 lg:flex"
          aria-label="Navegación principal"
        >
          {links.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ConsultationListTrigger />
          <Button asChild className="hidden sm:inline-flex">
            <TrackedWhatsAppLink
              href={whatsappUrl(
                "Hola, quiero consultar por los productos de Lu An Bazar.",
              )}
              target="_blank"
              rel="noreferrer"
              tracking={{ source: "site_header" }}
            >
              <MessageCircle data-icon="inline-start" />
              Consultar
            </TrackedWhatsAppLink>
          </Button>
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Abrir menú"
                >
                  <Menu />
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  <Brand />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 px-4">
                {links.map(([label, href]) => (
                  <Button
                    key={label}
                    asChild
                    variant="ghost"
                    className="justify-start"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}
                <Button asChild className="mt-3">
                  <TrackedWhatsAppLink
                    href={whatsappUrl(
                      "Hola, quiero consultar por los productos de Lu An Bazar.",
                    )}
                    target="_blank"
                    rel="noreferrer"
                    tracking={{ source: "mobile_menu" }}
                  >
                    WhatsApp
                  </TrackedWhatsAppLink>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

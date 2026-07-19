import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { type Product, formatARS } from "@/lib/data";
import { whatsappUrl } from "@/lib/business";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareProductButton } from "@/components/share-product-button";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const discount =
    product.price && product.previousPrice
      ? Math.round((1 - product.price / product.previousPrice) * 100)
      : 0;
  const path = `/productos/${product.id}`;
  return (
    <Card className="group overflow-hidden border-border/70 bg-card py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl dark:shadow-black/20">
      <Link
        href={path}
        className="relative aspect-[4/3] overflow-hidden bg-secondary/45"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          priority={priority}
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.isNew && <Badge>Novedad</Badge>}
          {discount > 0 && <Badge variant="secondary">-{discount}%</Badge>}
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 px-5 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">
          {product.category}
        </p>
        <h3 className="text-balance font-serif text-2xl leading-tight">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-end gap-2 pt-2">
          <p className="text-lg font-semibold">
            {product.price ? formatARS(product.price) : "Consultar precio"}
          </p>
          {product.previousPrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatARS(product.previousPrice)}
            </p>
          )}
        </div>
        <p className="text-xs font-medium text-accent">
          {typeof product.stock === "number"
            ? product.stock > 5
              ? "Disponible"
              : product.stock > 0
                ? "Últimas unidades"
                : "Sin stock"
            : "Consultá disponibilidad"}
        </p>
      </CardContent>
      <CardFooter className="flex gap-2 px-5 pb-5">
        <Button asChild variant="outline" className="flex-1">
          <Link href={path}>
            Ver producto <ArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button asChild size="icon">
          <a
            href={whatsappUrl(
              `Hola, quiero consultar por ${product.name}, código ${product.code}.`,
            )}
            target="_blank"
            rel="noreferrer"
            aria-label={`Consultar por ${product.name}`}
          >
            <MessageCircle />
          </a>
        </Button>
        <ShareProductButton name={product.name} path={path} />
      </CardFooter>
    </Card>
  );
}

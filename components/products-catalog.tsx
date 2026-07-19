"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  categories as defaultCategories,
  formatARS,
  type Product,
} from "@/lib/data";

const pageSize = 9;
const sortLabels: Record<string, string> = {
  featured: "Destacados",
  new: "Más recientes",
  low: "Menor precio",
  high: "Mayor precio",
  name: "Nombre A-Z",
  offers: "Ofertas",
};

export function ProductsCatalog({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const categories = useMemo(
    () => Array.from(new Set([...defaultCategories, ...products.map((product) => product.category)])),
    [products],
  );
  const highestPrice = Math.max(
    5000,
    ...products.map((product) => product.price ?? 0),
  );
  const requestedCategory = searchParams.get("categoria") ?? "Todos";
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState(() =>
    categories.includes(requestedCategory) ? requestedCategory : "Todos",
  );
  const [sort, setSort] = useState("featured");
  const [availability, setAvailability] = useState("all");
  const [onlyOffers, setOnlyOffers] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      products
        .filter((product) => {
          const haystack =
            `${product.name} ${product.category} ${product.brand} ${product.code} ${product.description} ${product.features.join(" ")} ${product.keywords.join(" ")}`.toLowerCase();
          return (
            (category === "Todos" || product.category === category) &&
            haystack.includes(query.trim().toLowerCase()) &&
            (availability === "all" ||
              (availability === "available" && product.stock !== 0) ||
              (availability === "out" && product.stock === 0)) &&
            (!onlyOffers || Boolean(product.offer || product.previousPrice)) &&
            (!onlyNew || Boolean(product.isNew)) &&
            (!product.price || product.price <= maxPrice)
          );
        })
        .sort((a, b) => {
          if (sort === "low")
            return (
              (a.price ?? Number.POSITIVE_INFINITY) -
              (b.price ?? Number.POSITIVE_INFINITY)
            );
          if (sort === "high")
            return (
              (b.price ?? Number.NEGATIVE_INFINITY) -
              (a.price ?? Number.NEGATIVE_INFINITY)
            );
          if (sort === "name") return a.name.localeCompare(b.name, "es");
          if (sort === "new")
            return Number(Boolean(b.isNew)) - Number(Boolean(a.isNew));
          if (sort === "offers")
            return (
              Number(Boolean(b.offer || b.previousPrice)) -
              Number(Boolean(a.offer || a.previousPrice))
            );
          return (
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            a.name.localeCompare(b.name, "es")
          );
        }),
    [products, query, category, sort, availability, onlyOffers, onlyNew, maxPrice],
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasFilters = Boolean(
    query ||
      category !== "Todos" ||
      availability !== "all" ||
      onlyOffers ||
      onlyNew ||
      maxPrice < highestPrice,
  );
  const clear = () => {
    setQuery("");
    setCategory("Todos");
    setAvailability("all");
    setOnlyOffers(false);
    setOnlyNew(false);
    setMaxPrice(highestPrice);
    setPage(1);
  };
  const change = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setPage(1);
  };
  const filterProps = {
    category,
    setCategory: (value: string) => change(setCategory, value),
    availability,
    setAvailability: (value: string) => change(setAvailability, value),
    onlyOffers,
    setOnlyOffers: (value: boolean) => change(setOnlyOffers, value),
    onlyNew,
    setOnlyNew: (value: boolean) => change(setOnlyNew, value),
    maxPrice,
    setMaxPrice: (value: number) => change(setMaxPrice, value),
    categories,
    highestPrice,
  };

  return (
    <>
      <SiteHeader />
      <main>
        <section className="surface-glow bg-brand-navy px-5 py-14 text-center text-brand-cream">
          <p className="text-xs font-semibold uppercase tracking-[.3em] text-primary">
            Catálogo Lu An
          </p>
          <h1 className="mt-3 text-balance font-serif text-4xl sm:text-5xl">
            Todo lo que buscás, en un solo lugar
          </h1>
          <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-brand-cream/70">
            Electrodomésticos, bazar, tecnología, cuidado personal y productos
            útiles para todos los días.
          </p>
        </section>
        <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
          <div className="flex flex-col gap-3 border-b pb-6 md:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Buscar productos</span>
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => change(setQuery, event.target.value)}
                placeholder="¿Qué producto estás buscando?"
                className="h-11 pl-9"
              />
            </label>
            <div className="flex gap-2">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" className="flex-1 md:hidden">
                      <SlidersHorizontal data-icon="inline-start" />
                      Filtros
                    </Button>
                  }
                />
                <SheetContent side="left" className="overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtrar productos</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-8">
                    <FilterControls {...filterProps} />
                    {hasFilters && (
                      <Button
                        variant="outline"
                        className="mt-6 w-full"
                        onClick={clear}
                      >
                        <X data-icon="inline-start" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <Select
                value={sort}
                onValueChange={(value) => value && change(setSort, value)}
              >
                <SelectTrigger className="h-11 w-full min-w-44 md:w-56">
                  <SelectValue>{sortLabels[sort]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="featured">Destacados</SelectItem>
                    <SelectItem value="new">Más recientes</SelectItem>
                    <SelectItem value="low">Menor precio</SelectItem>
                    <SelectItem value="high">Mayor precio</SelectItem>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                    <SelectItem value="offers">Ofertas</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-7 grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-xl border bg-card p-5">
                <FilterControls {...filterProps} />
                {hasFilters && (
                  <Button
                    variant="ghost"
                    className="mt-5 w-full"
                    onClick={clear}
                  >
                    <X data-icon="inline-start" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </aside>
            <div>
              <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  <SlidersHorizontal className="mr-2 inline size-4" />
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "producto" : "productos"}
                </p>
                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:inline-flex lg:hidden"
                    onClick={clear}
                  >
                    <X data-icon="inline-start" />
                    Limpiar
                  </Button>
                )}
              </div>
              {visible.length ? (
                <>
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {visible.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        priority={index < 3}
                      />
                    ))}
                  </div>
                  {pageCount > 1 && (
                    <nav
                      className="mt-10 flex items-center justify-center gap-2"
                      aria-label="Paginación del catálogo"
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === 1}
                        onClick={() =>
                          setPage((value) => Math.max(1, value - 1))
                        }
                        aria-label="Página anterior"
                      >
                        <ChevronLeft />
                      </Button>
                      {Array.from(
                        { length: pageCount },
                        (_, index) => index + 1,
                      ).map((number) => (
                        <Button
                          key={number}
                          variant={
                            currentPage === number ? "default" : "outline"
                          }
                          size="icon"
                          onClick={() => setPage(number)}
                          aria-label={`Página ${number}`}
                          aria-current={
                            currentPage === number ? "page" : undefined
                          }
                        >
                          {number}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={currentPage === pageCount}
                        onClick={() =>
                          setPage((value) => Math.min(pageCount, value + 1))
                        }
                        aria-label="Página siguiente"
                      >
                        <ChevronRight />
                      </Button>
                    </nav>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed p-12 text-center">
                  <h2 className="font-serif text-2xl">
                    No encontramos resultados
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Probá con otra búsqueda o limpiá los filtros.
                  </p>
                  <Button className="mt-5" onClick={clear}>
                    Ver todo el catálogo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

type FilterProps = {
  category: string;
  setCategory: (value: string) => void;
  availability: string;
  setAvailability: (value: string) => void;
  onlyOffers: boolean;
  setOnlyOffers: (value: boolean) => void;
  onlyNew: boolean;
  setOnlyNew: (value: boolean) => void;
  maxPrice: number;
  setMaxPrice: (value: number) => void;
  categories: string[];
  highestPrice: number;
};

function FilterControls({
  category,
  setCategory,
  availability,
  setAvailability,
  onlyOffers,
  setOnlyOffers,
  onlyNew,
  setOnlyNew,
  maxPrice,
  setMaxPrice,
  categories,
  highestPrice,
}: FilterProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
          Categoría
        </p>
        <div className="flex flex-col gap-1">
          {["Todos", ...categories].map((item) => (
            <Button
              key={item}
              variant={category === item ? "secondary" : "ghost"}
              size="sm"
              className="justify-start"
              onClick={() => setCategory(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>Precio máximo</span>
          <span className="font-semibold">
            {maxPrice === highestPrice ? "Sin límite" : formatARS(maxPrice)}
          </span>
        </div>
        <input
          type="range"
          min="5000"
          max={highestPrice}
          step="500"
          value={maxPrice}
          onChange={(event) => setMaxPrice(Number(event.target.value))}
          className="w-full accent-[var(--primary)]"
          aria-label="Precio máximo"
        />
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">
          Disponibilidad
        </p>
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant={availability === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAvailability("all")}
          >
            Todos
          </Button>
          <Button
            variant={availability === "available" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAvailability("available")}
          >
            Con stock
          </Button>
          <Button
            variant={availability === "out" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAvailability("out")}
          >
            Agotados
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
          variant={onlyOffers ? "secondary" : "outline"}
          className="justify-start"
          onClick={() => setOnlyOffers(!onlyOffers)}
        >
          Sólo ofertas
        </Button>
        <Button
          variant={onlyNew ? "secondary" : "outline"}
          className="justify-start"
          onClick={() => setOnlyNew(!onlyNew)}
        >
          Sólo novedades
        </Button>
      </div>
    </div>
  );
}

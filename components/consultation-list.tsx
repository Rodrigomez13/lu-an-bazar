"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  ListPlus,
  MessageCircle,
  Minus,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { whatsappUrl } from "@/lib/business";
import { trackCommerceEvent } from "@/lib/commerce-tracking";
import { formatARS } from "@/lib/data";

export type ConsultationProduct = {
  id: string;
  code: string;
  name: string;
  image: string;
  category: string;
  price?: number;
};

type ConsultationItem = ConsultationProduct & { quantity: number };

type ConsultationContextValue = {
  items: ConsultationItem[];
  count: number;
  add: (product: ConsultationProduct) => void;
  open: () => void;
};

const storageKey = "luan_consultation_list_v1";
const storageEvent = "luan-consultation-change";
const emptyItems: ConsultationItem[] = [];
let cachedRaw = "";
let cachedItems = emptyItems;

function parseItems(raw: string | null): ConsultationItem[] {
  if (!raw) return emptyItems;
  if (raw === cachedRaw) return cachedItems;
  try {
    const parsed = JSON.parse(raw) as ConsultationItem[];
    cachedRaw = raw;
    cachedItems = Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
        )
      : emptyItems;
    return cachedItems;
  } catch {
    return emptyItems;
  }
}

function getSnapshot() {
  return parseItems(window.localStorage.getItem(storageKey));
}

function getServerSnapshot() {
  return emptyItems;
}

function subscribe(onStoreChange: () => void) {
  const handleChange = () => onStoreChange();
  window.addEventListener("storage", handleChange);
  window.addEventListener(storageEvent, handleChange);
  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(storageEvent, handleChange);
  };
}

function saveItems(items: ConsultationItem[]) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;
  window.localStorage.setItem(storageKey, raw);
  window.dispatchEvent(new Event(storageEvent));
}

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function ConsultationListProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const count = items.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo<ConsultationContextValue>(
    () => ({
      items,
      count,
      add: (product) => {
        const current = getSnapshot();
        const existing = current.find((item) => item.id === product.id);
        const next = existing
          ? current.map((item) =>
              item.id === product.id
                ? { ...item, quantity: Math.min(99, item.quantity + 1) }
                : item,
            )
          : [...current, { ...product, quantity: 1 }];
        saveItems(next);
        trackCommerceEvent("AddToCart", {
          contentId: product.id,
          contentName: product.name,
          category: product.category,
          value: product.price,
          currency: product.price ? "ARS" : undefined,
          quantity: 1,
          source: "consultation_list",
        });
        toast.success("Agregado a tu consulta", {
          description: product.name,
          action: { label: "Ver lista", onClick: () => setDrawerOpen(true) },
        });
      },
      open: () => setDrawerOpen(true),
    }),
    [count, items],
  );

  return (
    <ConsultationContext.Provider value={value}>
      {children}
      <ConsultationDrawer
        items={items}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </ConsultationContext.Provider>
  );
}

export function useConsultationList() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error("useConsultationList debe usarse dentro del proveedor");
  }
  return context;
}

export function ConsultationListTrigger() {
  const { count, open } = useConsultationList();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={open}
      aria-label={`Abrir lista de consulta${count ? `, ${count} productos` : ""}`}
      className="relative"
    >
      <ShoppingBasket />
      {count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}

export function AddToConsultationButton({
  product,
  showLabel = false,
  className,
}: {
  product: ConsultationProduct;
  showLabel?: boolean;
  className?: string;
}) {
  const { add } = useConsultationList();
  return (
    <Button
      type="button"
      variant={showLabel ? "outline" : "secondary"}
      size={showLabel ? "lg" : "icon"}
      className={className}
      onClick={() => add(product)}
      aria-label={`Agregar ${product.name} a la lista de consulta`}
    >
      <ListPlus data-icon={showLabel ? "inline-start" : undefined} />
      {showLabel && "Agregar a mi consulta"}
    </Button>
  );
}

function ConsultationDrawer({
  items,
  open,
  onOpenChange,
}: {
  items: ConsultationItem[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const total = items.reduce(
    (sum, item) => sum + (item.price ?? 0) * item.quantity,
    0,
  );
  const pricedCount = items.filter((item) => item.price).length;

  const changeQuantity = (id: string, delta: number) => {
    const next = items
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, Math.min(99, item.quantity + delta)) }
          : item,
      )
      .filter((item) => item.quantity > 0);
    saveItems(next);
  };

  const sendConsultation = () => {
    if (!items.length) return;
    const lines = items.map(
      (item, index) =>
        `${index + 1}. ${item.name} (${item.code}) · Cantidad: ${item.quantity}`,
    );
    const totalLine =
      pricedCount === items.length
        ? `\nTotal de referencia: ${formatARS(total)}`
        : "\nHay productos cuyo precio debe confirmarse.";
    const message = [
      "Hola, quiero consultar disponibilidad y precio final de estos productos:",
      "",
      ...lines,
      totalLine,
      "",
      "¿Podrían confirmarme el total y las opciones de entrega?",
    ].join("\n");

    trackCommerceEvent("Contact", {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      value: total || undefined,
      currency: total ? "ARS" : undefined,
      source: "consultation_list",
    });
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-hidden sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-serif text-2xl">Tu consulta</SheetTitle>
            {items.length > 0 && <Badge>{items.length}</Badge>}
          </div>
          <SheetDescription>
            Armá una lista y enviala completa por WhatsApp. No es una compra ni
            genera una reserva automática.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <ShoppingBasket className="size-10 text-muted-foreground" />
              <p className="mt-4 font-serif text-xl">Tu lista está vacía</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Agregá varios productos del catálogo para consultarlos juntos.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <article key={item.id} className="flex gap-3 py-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border bg-secondary/50">
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium leading-tight">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.code} · {item.price ? formatARS(item.price) : "Precio a consultar"}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Quitar una unidad de ${item.name}`}
                        >
                          <Minus />
                        </Button>
                        <span className="min-w-7 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Agregar una unidad de ${item.name}`}
                        >
                          <Plus />
                        </Button>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => saveItems(items.filter((entry) => entry.id !== item.id))}
                        aria-label={`Eliminar ${item.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-t bg-secondary/30">
            <div className="mb-2 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs text-muted-foreground">
                  {pricedCount === items.length
                    ? "Total de referencia"
                    : "Subtotal de referencia"}
                </p>
                <p className="font-serif text-2xl">{formatARS(total)}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => saveItems([])}>
                Vaciar
              </Button>
            </div>
            <Button type="button" size="lg" onClick={sendConsultation}>
              <MessageCircle data-icon="inline-start" />
              Consultar todo por WhatsApp
            </Button>
            <p className="text-center text-[10px] text-muted-foreground">
              Precios y stock sujetos a confirmación.
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}

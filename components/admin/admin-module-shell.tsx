import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  CircleDollarSign,
  FileClock,
  LayoutDashboard,
  LockKeyhole,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { logoutAdmin } from "@/app/ingresar/actions";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminActor } from "@/lib/admin-api";
import type { AdminRole } from "@/lib/admin-session";

type NavItem = { href: string; label: string; icon: LucideIcon; roles: AdminRole[] };
const allRoles: AdminRole[] = ["admin", "catalog_manager", "seller", "finance_manager", "collections"];

const groups: { title: string; items: NavItem[] }[] = [
  {
    title: "Bazar",
    items: [
      { href: "/admin", label: "Resumen comercial", icon: LayoutDashboard, roles: allRoles },
      { href: "/admin/productos", label: "Productos", icon: Boxes, roles: ["admin", "catalog_manager"] },
      { href: "/admin/productos", label: "Inventario", icon: PackageSearch, roles: ["admin", "catalog_manager"] },
      { href: "/admin/clientes", label: "Clientes del bazar", icon: Users, roles: ["admin", "catalog_manager", "seller"] },
    ],
  },
  {
    title: "Préstamos personales",
    items: [
      { href: "/admin/prestamos", label: "Panel financiero", icon: CircleDollarSign, roles: ["admin", "finance_manager", "collections"] },
      { href: "/admin/prestamos/clientes", label: "Clientes privados", icon: Users, roles: ["admin", "finance_manager", "collections"] },
      { href: "/admin/prestamos/cobros", label: "Cuotas y cobros", icon: ReceiptText, roles: ["admin", "finance_manager", "collections"] },
      { href: "/admin/prestamos/mora", label: "Mora y recordatorios", icon: AlertTriangle, roles: ["admin", "finance_manager", "collections"] },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/admin/sistema/usuarios", label: "Usuarios y roles", icon: ShieldCheck, roles: ["admin"] },
      { href: "/admin/sistema/auditoria", label: "Auditoría", icon: FileClock, roles: ["admin"] },
      { href: "/admin/sistema/configuracion", label: "Configuración", icon: Settings, roles: ["admin"] },
    ],
  },
];

export async function AdminModuleShell({
  activePath,
  eyebrow,
  title,
  description,
  children,
}: {
  activePath: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const privateArea = activePath.startsWith("/admin/prestamos");
  const actor = await getAdminActor();
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter((item) => actor && item.roles.includes(actor.role)) })).filter((group) => group.items.length);
  return (
    <main className="min-h-screen bg-secondary/35">
      <header className="border-b bg-brand-navy text-brand-cream">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center justify-between gap-3 px-5 py-3 lg:px-8">
          <Brand />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Badge variant="secondary" className="hidden sm:flex">
              <LockKeyhole className="mr-1 size-3" /> Área privada
            </Badge>
            <form action={logoutAdmin}>
              <Button type="submit" variant="outline" size="sm" className="border-brand-cream/20 bg-transparent text-brand-cream">Salir</Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        <aside className="hidden min-h-[calc(100vh-5rem)] w-72 shrink-0 border-r bg-brand-navy p-4 text-brand-cream lg:block">
          {visibleGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.22em] text-primary">{group.title}</p>
              <nav className="flex flex-col gap-1" aria-label={group.title}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activePath === item.href;
                  return (
                    <Button key={`${item.href}-${item.label}`} asChild variant="ghost" className={`justify-start ${active ? "bg-brand-cream/10 text-brand-cream" : "text-brand-cream/65 hover:bg-brand-cream/10 hover:text-brand-cream"}`}>
                      <Link href={item.href}><Icon />{item.label}</Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
          ))}
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            <Button asChild size="sm" variant="outline"><Link href="/admin"><ArrowLeft /> Panel</Link></Button>
            {visibleGroups.slice(1).flatMap((group) => group.items).map((item) => (
              <Button key={item.href} asChild size="sm" variant={activePath === item.href ? "default" : "outline"}>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>

          <div className="mb-7">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[.24em] text-primary">{eyebrow}</p>
              {privateArea && <Badge variant="destructive">Información confidencial</Badge>}
            </div>
            <h1 className="mt-2 font-serif text-4xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}

export function AdminSetupNotice({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm">
      <strong>Configuración pendiente.</strong> {message}
    </div>
  );
}

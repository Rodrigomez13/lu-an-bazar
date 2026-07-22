import { redirect } from "next/navigation";
import { AdminModuleShell, AdminSetupNotice } from "@/components/admin/admin-module-shell";
import { MetaSocialManager } from "@/components/admin/meta-social-manager";
import { hasAdminRole } from "@/lib/admin-api";
import { business } from "@/lib/business";
import { getAdminProducts } from "@/lib/catalog";
import { getMetaSocialConfig, type MetaPostRow } from "@/lib/meta-social";
import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function MetaPublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  if (!(await hasAdminRole(["admin", "catalog_manager"]))) redirect("/admin");
  const products = await getAdminProducts();
  const config = getMetaSocialConfig();
  const requestedProduct = (await searchParams).product ?? "";
  let posts: MetaPostRow[] = [];
  let databaseReady = isSupabaseAdminConfigured();
  let setupError = "";

  if (databaseReady) {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("meta_posts")
      .select("*")
      .neq("status", "archived")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      databaseReady = false;
      setupError = error.message.includes("meta_posts")
        ? "Ejecutá supabase/sql/09_meta_social_hub.sql para habilitar publicaciones e importaciones."
        : error.message;
    } else {
      posts = (data ?? []) as MetaPostRow[];
    }
  }

  return (
    <AdminModuleShell
      activePath="/admin/publicaciones"
      eyebrow="Bazar · Canales sociales"
      title="Publicaciones y catálogo Meta"
      description="Prepará publicaciones desde productos y revisá contenido de la fan page antes de incorporarlo al catálogo. La web mantiene precios y stock como fuente de verdad."
    >
      <AdminSetupNotice message={setupError} />
      <MetaSocialManager
        products={products}
        posts={posts}
        requestedProduct={requestedProduct}
        databaseReady={databaseReady}
        pageReady={config.pageReady}
        webhookReady={config.webhookReady}
        conversionsReady={Boolean(process.env.META_CONVERSIONS_API_TOKEN?.trim())}
        pixelReady={Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim())}
        facebookUrl={business.facebookUrl}
        feedUrl={`${business.siteUrl}/api/meta/catalog`}
        webhookUrl={`${business.siteUrl}/api/meta/webhooks/page`}
      />
    </AdminModuleShell>
  );
}

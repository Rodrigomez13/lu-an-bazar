import { ProductManager } from "@/components/admin/product-manager";
import { getAdminProducts } from "@/lib/catalog";
import {
  isOpenAIConfigured,
  isSupabaseAdminConfigured,
} from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAdminProducts();
  return (
    <ProductManager
      initialProducts={products}
      databaseConfigured={isSupabaseAdminConfigured()}
      aiConfigured={isOpenAIConfigured()}
    />
  );
}

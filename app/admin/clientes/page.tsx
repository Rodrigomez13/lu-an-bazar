import { CustomerManager } from "@/components/admin/customer-manager";
import { getBazarCustomers } from "@/lib/customers";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await getBazarCustomers();
  return (
    <CustomerManager
      initialCustomers={customers}
      databaseConfigured={isSupabaseAdminConfigured()}
    />
  );
}

import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

export type BazarCustomer = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: "active" | "inactive" | "prospect";
  createdAt: string;
  updatedAt: string;
};

type CustomerRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: BazarCustomer["status"];
  created_at: string;
  updated_at: string;
};

function customerFromRow(row: CustomerRow): BazarCustomer {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    notes: row.notes ?? "",
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getBazarCustomers(): Promise<BazarCustomer[]> {
  if (!isSupabaseAdminConfigured()) return [];
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("bazar_customers")
    .select("*")
    .is("archived_at", null)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as CustomerRow[]).map(customerFromRow);
}

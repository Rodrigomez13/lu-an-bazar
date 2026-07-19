import { redirect } from "next/navigation";
import { hasAdminRole } from "@/lib/admin-api";

export default async function CustomersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminRole(["admin", "catalog_manager", "seller"]))) redirect("/admin");
  return children;
}

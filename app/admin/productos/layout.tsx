import { redirect } from "next/navigation";
import { hasAdminRole } from "@/lib/admin-api";

export default async function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminRole(["admin", "catalog_manager"]))) redirect("/admin");
  return children;
}

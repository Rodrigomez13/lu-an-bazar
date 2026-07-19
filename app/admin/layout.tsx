import { redirect } from "next/navigation";
import { hasAdminAccess } from "@/lib/admin-api";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminAccess())) redirect("/ingresar");
  return children;
}

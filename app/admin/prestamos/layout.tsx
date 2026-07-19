import { redirect } from "next/navigation";
import { hasAdminRole } from "@/lib/admin-api";

export default async function FinanceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminRole(["admin", "finance_manager", "collections"]))) redirect("/admin");
  return children;
}

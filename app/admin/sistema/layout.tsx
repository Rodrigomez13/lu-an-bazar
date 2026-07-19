import { redirect } from "next/navigation";
import { hasAdminRole } from "@/lib/admin-api";

export default async function SystemLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasAdminRole(["admin"]))) redirect("/admin");
  return children;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminSession, isValidAdminSession } from "@/lib/admin-session";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminSession.cookieName)?.value;
  if (!(await isValidAdminSession(session))) redirect("/ingresar");
  return children;
}

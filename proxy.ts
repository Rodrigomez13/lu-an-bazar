import { NextResponse, type NextRequest } from "next/server";
import { adminSession, isValidAdminSession } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get(adminSession.cookieName)?.value;
  if (await isValidAdminSession(session)) return NextResponse.next();
  const loginUrl = new URL("/ingresar", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ["/admin/:path*"] };

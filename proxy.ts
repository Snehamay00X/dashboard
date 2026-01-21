import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/adminAuth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow admin login page & login API
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login"
  ) {
    return;
  }

  // 🔒 Protect ONLY admin pages (NOT APIs)
  if (!pathname.startsWith("/admin")) return;

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !verifySession(token)) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}
export const config = {
  matcher: ["/admin/:path*"],
};

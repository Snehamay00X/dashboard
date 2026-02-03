import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/adminAuth";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow auth routes
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login"
  ) {
    return NextResponse.next();
  }

  // 🔓 Allow public routes (like /products, /home, etc.)
  if (!pathname.startsWith("/admin") && !pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 🔐 Everything else is protected
  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token || !verifySession(token)) {
    // For API → return 401
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For pages → redirect to login
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*"
  ],
};

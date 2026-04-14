import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/catalog", "/checkout", "/orders", "/admin"];

export function middleware(request: NextRequest) {
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const session = request.cookies.get("sample_sale_session");

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/catalog/:path*", "/checkout/:path*", "/orders/:path*", "/admin/:path*"]
};

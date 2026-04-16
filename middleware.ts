import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedPrefixes = ["/catalog", "/checkout", "/orders", "/admin"];
const corsMethods = "GET, POST, PATCH, DELETE, OPTIONS";
const corsHeaders = "Content-Type, Authorization, X-Requested-With, X-Request-Id";

function createNonce() {
  return crypto.randomUUID().replace(/-/g, "");
}

function buildContentSecurityPolicy(nonce: string) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join("; ");
}

function getSecurityHeaders(nonce: string) {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(nonce),
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off"
  };
}

function applyHeaders(response: NextResponse, headers: Record<string, string>) {
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

function getAllowedOrigins() {
  return [
    process.env.APP_URL,
    ...(process.env.CORS_ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ];
}

function getCorsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins();

  if (!allowedOrigins.includes(origin)) {
    return null;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": corsMethods,
    "Access-Control-Allow-Headers": corsHeaders,
    Vary: "Origin"
  };
}

export function middleware(request: NextRequest) {
  const nonce = createNonce();
  const securityHeaders = getSecurityHeaders(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const cors = getCorsHeaders(request);

    if (request.method === "OPTIONS") {
      const response = cors
        ? new NextResponse(null, {
            status: 204,
            headers: cors
          })
        : new NextResponse(null, { status: 403 });
      applyHeaders(response, securityHeaders);
      return response;
    }

    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    applyHeaders(response, securityHeaders);

    if (cors) {
      applyHeaders(response, cors);
    }

    return response;
  }

  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));

  if (!isProtected) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
    applyHeaders(response, securityHeaders);
    return response;
  }

  const session = request.cookies.get("sample_sale_session");

  if (!session) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    applyHeaders(response, securityHeaders);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  applyHeaders(response, securityHeaders);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/catalog/:path*", "/checkout/:path*", "/orders/:path*", "/admin/:path*"]
};

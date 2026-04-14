import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/types";

const SESSION_COOKIE = "sample_sale_session";

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
    preferredLanguage: user.preferredLanguage ?? null
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10h")
    .sign(getSecret());

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

export async function clearSession() {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}

export async function readSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = typeof payload.email === "string" ? payload.email : null;
    const name = typeof payload.name === "string" ? payload.name : null;
    const sub = typeof payload.sub === "string" ? payload.sub : null;
    const allowedRoles = new Set<SessionUser["roles"][number]>([
      "STAFF",
      "FULL_ADMIN",
      "CATALOG_ADMIN",
      "FINANCE",
      "OPERATIONS"
    ]);
    const roles = Array.isArray(payload.roles)
      ? payload.roles.flatMap((role) => {
          if (role === "ADMIN") {
            return ["FULL_ADMIN" as SessionUser["roles"][number]];
          }

          return typeof role === "string" && allowedRoles.has(role as SessionUser["roles"][number])
            ? [role as SessionUser["roles"][number]]
            : [];
        })
      : [];
    const preferredLanguage = typeof payload.preferredLanguage === "string" ? payload.preferredLanguage : null;

    if (!email || !name || !sub) {
      return null;
    }

    return {
      id: sub,
      email,
      name,
      roles,
      preferredLanguage
    };
  } catch {
    return null;
  }
}

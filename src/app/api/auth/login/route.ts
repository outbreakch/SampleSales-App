import bcrypt from "bcryptjs";
import { RoleKey, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { consumeRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { validationErrorResponse } from "@/lib/validation/http";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  const requestLog = getRequestLogContext(request);

  try {
    const payload = loginSchema.safeParse(await request.json());

    if (!payload.success) {
      logger.warn("auth.login.invalid_payload", {
        ...requestLog,
        details: payload.error.flatten()
      });
      return validationErrorResponse(payload.error, "Invalid credentials payload.");
    }

    const email = payload.data.email.toLowerCase();
    const rateLimit = consumeRateLimit({
      key: `login:${getRequestIp(request)}:${email}`,
      limit: 10,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      logger.warn("auth.login.rate_limited", {
        ...requestLog,
        email
      });

      return NextResponse.json(
        { error: "Too many sign-in attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(payload.data.password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      preferredLanguage: user.preferredLanguage,
      roles: user.roles
        .map((entry) => entry.role.key)
        .filter(
          (
            role
          ): role is "STAFF" | "ADMIN" | "FULL_ADMIN" | "CATALOG_ADMIN" | "FINANCE" | "OPERATIONS" =>
            role === RoleKey.STAFF ||
            role === RoleKey.ADMIN ||
            role === RoleKey.FULL_ADMIN ||
            role === RoleKey.CATALOG_ADMIN ||
            role === RoleKey.FINANCE ||
            role === RoleKey.OPERATIONS
        )
        .map((role) => (role === RoleKey.ADMIN ? "FULL_ADMIN" : role))
    };

    await createSession(sessionUser);

    logger.info("auth.login.success", {
      ...requestLog,
      userId: user.id,
      email: user.email
    });

    return NextResponse.json({ ok: true, user: sessionUser });
  } catch (error) {
    return apiServerErrorResponse(request, "auth.login.unhandled", error);
  }
}

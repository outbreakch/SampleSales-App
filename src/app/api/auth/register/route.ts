import bcrypt from "bcryptjs";
import { AuditAction, RoleKey, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { consumeRateLimit, getRequestIp } from "@/lib/security/rate-limit";
import { sendRegistrationConfirmationEmail } from "@/lib/services/auth-mail";
import { registerSchema } from "@/lib/validation/auth";
import { validationErrorResponse } from "@/lib/validation/http";

export async function POST(request: Request) {
  const requestLog = getRequestLogContext(request);
  try {
    const payload = registerSchema.safeParse(await request.json());

    if (!payload.success) {
      return validationErrorResponse(payload.error, "Invalid registration payload.");
    }

    const email = payload.data.email.toLowerCase();
    const rateLimit = consumeRateLimit({
      key: `register:${getRequestIp(request)}:${email}`,
      limit: 5,
      windowMs: 30 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      logger.warn("auth.register.rate_limited", {
        ...requestLog,
        email
      });

      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account already exists for that email." }, { status: 409 });
    }

    const staffRole = await prisma.role.findUnique({
      where: { key: RoleKey.STAFF }
    });

    if (!staffRole) {
      return NextResponse.json({ error: "Staff role is not configured." }, { status: 500 });
    }

    const passwordHash = await bcrypt.hash(payload.data.password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          firstName: payload.data.firstName.trim(),
          lastName: payload.data.lastName.trim(),
          passwordHash,
          status: UserStatus.ACTIVE
        }
      });

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: staffRole.id
        }
      });

      await tx.auditLog.create({
        data: {
          actorUserId: createdUser.id,
          entityType: "User",
          entityId: createdUser.id,
          action: AuditAction.CREATE,
          details: {
            origin: "self_register",
            email,
            roles: [RoleKey.STAFF]
          }
        }
      });

      return createdUser;
    });

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      preferredLanguage: user.preferredLanguage,
      roles: ["STAFF"] as Array<"STAFF" | "FULL_ADMIN" | "CATALOG_ADMIN" | "FINANCE" | "OPERATIONS">
    };

    await createSession(sessionUser);

    const mailResult = await sendRegistrationConfirmationEmail({
      to: user.email,
      firstName: user.firstName,
      appUrl: process.env.APP_URL
    });

    logger.info("auth.email.registration", {
      ...requestLog,
      userId: user.id,
      email: user.email,
      queued: mailResult.queued,
      provider: mailResult.provider,
      note: "note" in mailResult ? mailResult.note : null
    });

    return NextResponse.json({ ok: true, user: sessionUser }, { status: 201 });
  } catch (error) {
    return apiServerErrorResponse(request, "auth.register.unhandled", error);
  }
}

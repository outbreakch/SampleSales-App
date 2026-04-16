import bcrypt from "bcryptjs";
import { AuditAction, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db/prisma";
import { apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { getRequestIp, consumeRateLimit } from "@/lib/security/rate-limit";
import { sendPasswordResetNotificationEmail } from "@/lib/services/auth-mail";
import { passwordResetSchema } from "@/lib/validation/auth";
import { validationErrorResponse } from "@/lib/validation/http";

export async function POST(request: Request) {
  const requestLog = getRequestLogContext(request);
  try {
    const ip = getRequestIp(request);
    const rateLimit = consumeRateLimit({
      key: `password-reset-complete:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      logger.warn("auth.password_reset_complete.rate_limited", {
        ...requestLog,
        ip
      });

      return NextResponse.json(
        { error: "Too many password reset attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds)
          }
        }
      );
    }

    const payload = passwordResetSchema.safeParse(await request.json());

    if (!payload.success) {
      return validationErrorResponse(payload.error);
    }

    const tokenHash = hashPasswordResetToken(payload.data.token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        tokenHash
      },
      include: {
        user: true
      }
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt < new Date() ||
      resetToken.user.status === UserStatus.DISABLED
    ) {
      return NextResponse.json({ error: "This password reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(payload.data.password, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId
        },
        data: {
          passwordHash,
          status: UserStatus.ACTIVE
        }
      }),
      prisma.passwordResetToken.update({
        where: {
          id: resetToken.id
        },
        data: {
          usedAt: new Date()
        }
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: {
            not: resetToken.id
          }
        }
      }),
      prisma.auditLog.create({
        data: {
          actorUserId: resetToken.userId,
          entityType: "User",
          entityId: resetToken.userId,
          action: AuditAction.UPDATE,
          details: {
            origin: "password_reset",
            email: resetToken.user.email
          }
        }
      })
    ]);

    const mailResult = await sendPasswordResetNotificationEmail({
      to: resetToken.user.email,
      firstName: resetToken.user.firstName,
      appUrl: process.env.APP_URL
    });

    logger.info("auth.email.password_reset_completed", {
      ...requestLog,
      userId: resetToken.userId,
      email: resetToken.user.email,
      queued: mailResult.queued,
      provider: mailResult.provider,
      note: "note" in mailResult ? mailResult.note : null
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiServerErrorResponse(request, "auth.password_reset_complete.unhandled", error);
  }
}

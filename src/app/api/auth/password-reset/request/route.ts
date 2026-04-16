import { UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPasswordResetToken, generatePasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db/prisma";
import { apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { getRequestIp, consumeRateLimit } from "@/lib/security/rate-limit";
import { sendPasswordResetLinkEmail } from "@/lib/services/auth-mail";
import { passwordResetRequestSchema } from "@/lib/validation/auth";
import { validationErrorResponse } from "@/lib/validation/http";

export async function POST(request: Request) {
  const requestLog = getRequestLogContext(request);
  try {
    const ip = getRequestIp(request);
    const rateLimit = consumeRateLimit({
      key: `password-reset-request:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000
    });

    if (!rateLimit.allowed) {
      logger.warn("auth.password_reset_request.rate_limited", {
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

    const payload = passwordResetRequestSchema.safeParse(await request.json());

    if (!payload.success) {
      return validationErrorResponse(payload.error, "Invalid password reset payload.");
    }

    const email = payload.data.email.toLowerCase();
    const genericResponse = NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent."
    });

    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user || user.status === UserStatus.DISABLED) {
      return genericResponse;
    }

    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + (user.status === UserStatus.INVITED ? 24 : 1) * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id
        }
      }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      })
    ]);

    const appUrl = process.env.APP_URL ?? "http://localhost:3000";
    const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
    const mailResult = await sendPasswordResetLinkEmail({
      to: user.email,
      firstName: user.firstName,
      appUrl,
      resetUrl,
      userId: user.id
    });

    logger.info("auth.email.password_reset_request", {
      ...requestLog,
      userId: user.id,
      email: user.email,
      queued: mailResult.queued,
      provider: mailResult.provider,
      note: "note" in mailResult ? mailResult.note : null
    });

    return genericResponse;
  } catch (error) {
    return apiServerErrorResponse(request, "auth.password_reset_request.unhandled", error);
  }
}

import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { AuditAction, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { USER_MANAGEMENT_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { generatePasswordResetToken, hashPasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db/prisma";
import { apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { sendAdminProvisionedAccountEmail, sendInvitationEmail } from "@/lib/services/auth-mail";
import { validationErrorResponse } from "@/lib/validation/http";
import { adminUserCreateSchema } from "@/lib/validation/user-admin";

export async function POST(request: Request) {
  const requestLog = getRequestLogContext(request);
  try {
    const session = await requireAnyRole(USER_MANAGEMENT_ROLES);
    const payload = adminUserCreateSchema.safeParse(await request.json());

    if (!payload.success) {
      return validationErrorResponse(payload.error, "Invalid user payload.");
    }

    const email = payload.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user already exists for that email." }, { status: 409 });
    }

    const roles = await prisma.role.findMany({
      where: {
        key: {
          in: payload.data.roles
        }
      }
    });

    if (roles.length !== payload.data.roles.length) {
      return NextResponse.json({ error: "One or more roles are invalid." }, { status: 400 });
    }

    const passwordSource = payload.data.password || crypto.randomBytes(24).toString("hex");
    const passwordHash = await bcrypt.hash(passwordSource, 12);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          firstName: payload.data.firstName.trim(),
          lastName: payload.data.lastName.trim(),
          passwordHash,
          status: payload.data.status
        }
      });

      await tx.userRole.createMany({
        data: roles.map((role) => ({
          userId: createdUser.id,
          roleId: role.id
        }))
      });

      await tx.auditLog.create({
        data: {
          actorUserId: session.id,
          entityType: "User",
          entityId: createdUser.id,
          action: AuditAction.CREATE,
          details: {
            email,
            roles: payload.data.roles,
            status: payload.data.status
          }
        }
      });

      return createdUser;
    });

    if (payload.data.status === UserStatus.INVITED) {
      const token = generatePasswordResetToken();
      const tokenHash = hashPasswordResetToken(token);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

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
      const mailResult = await sendInvitationEmail({
        to: user.email,
        firstName: user.firstName,
        appUrl,
        resetUrl,
        actorUserId: session.id,
        userId: user.id
      });

      logger.info("auth.email.invitation", {
        ...requestLog,
        actorUserId: session.id,
        userId: user.id,
        email: user.email,
        queued: mailResult.queued,
        provider: mailResult.provider,
        note: "note" in mailResult ? mailResult.note : null
      });
    } else {
      const mailResult = await sendAdminProvisionedAccountEmail({
        to: user.email,
        firstName: user.firstName,
        appUrl: process.env.APP_URL,
        actorUserId: session.id,
        userId: user.id
      });

      logger.info("auth.email.admin_provisioned", {
        ...requestLog,
        actorUserId: session.id,
        userId: user.id,
        email: user.email,
        queued: mailResult.queued,
        provider: mailResult.provider,
        note: "note" in mailResult ? mailResult.note : null
      });
    }

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id
      }
    }, { status: 201 });
  } catch (error) {
    return apiServerErrorResponse(request, "admin.users.create.unhandled", error);
  }
}

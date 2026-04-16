import bcrypt from "bcryptjs";
import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { USER_MANAGEMENT_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { sendPasswordResetNotificationEmail } from "@/lib/services/auth-mail";
import { validationErrorResponse } from "@/lib/validation/http";
import { resourceIdParamSchema } from "@/lib/validation/params";
import { adminUserUpdateSchema } from "@/lib/validation/user-admin";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const requestLog = getRequestLogContext(request);
  const session = await requireAnyRole(USER_MANAGEMENT_ROLES);
  const parsedParams = resourceIdParamSchema.safeParse((await context.params).userId);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error, "Invalid user id.");
  }

  const userId = parsedParams.data;
  const payload = adminUserUpdateSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error, "Invalid user payload.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const email = payload.data.email.toLowerCase();
  const duplicate = await prisma.user.findFirst({
    where: {
      email,
      id: {
        not: userId
      }
    }
  });

  if (duplicate) {
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

  const passwordHash = payload.data.password ? await bcrypt.hash(payload.data.password, 12) : null;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        email,
        firstName: payload.data.firstName.trim(),
        lastName: payload.data.lastName.trim(),
        status: payload.data.status,
        ...(passwordHash ? { passwordHash } : {})
      }
    });

    await tx.userRole.deleteMany({
      where: { userId }
    });

    await tx.userRole.createMany({
      data: roles.map((role) => ({
        userId,
        roleId: role.id
      }))
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "User",
        entityId: userId,
        action: AuditAction.UPDATE,
        details: {
          before: {
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            status: existingUser.status,
            roles: existingUser.roles.map((entry) => entry.role.key)
          },
          after: {
            email,
            firstName: payload.data.firstName.trim(),
            lastName: payload.data.lastName.trim(),
            status: payload.data.status,
            roles: payload.data.roles,
            passwordUpdated: Boolean(passwordHash)
          }
        }
      }
    });
  });

  if (passwordHash) {
    const mailResult = await sendPasswordResetNotificationEmail({
      to: email,
      firstName: payload.data.firstName.trim(),
      appUrl: process.env.APP_URL,
      actorUserId: session.id,
      userId
    });

    logger.info("auth.email.password_reset", {
      ...requestLog,
      actorUserId: session.id,
      userId,
      email,
      queued: mailResult.queued,
      provider: mailResult.provider,
      note: "note" in mailResult ? mailResult.note : null
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const requestLog = getRequestLogContext(request);
  const session = await requireAnyRole(USER_MANAGEMENT_ROLES);
  const parsedParams = resourceIdParamSchema.safeParse((await context.params).userId);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error, "Invalid user id.");
  }

  const userId = parsedParams.data;

  if (session.id === userId) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!existingUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.user.delete({
      where: {
        id: userId
      }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "User",
        entityId: userId,
        action: AuditAction.DELETE,
        details: {
          deletedUser: {
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName,
            status: existingUser.status,
            roles: existingUser.roles.map((entry) => entry.role.key)
          }
        }
      }
    })
  ]);

  logger.warn("auth.user.deleted", {
    ...requestLog,
    actorUserId: session.id,
    userId,
    email: existingUser.email
  });

  return NextResponse.json({ ok: true });
}

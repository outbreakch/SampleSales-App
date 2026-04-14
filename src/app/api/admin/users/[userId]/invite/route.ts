import { AuditAction, UserStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { USER_MANAGEMENT_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { generatePasswordResetToken, hashPasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db/prisma";
import { sendInvitationEmail } from "@/lib/services/auth-mail";

export async function POST(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  const session = await requireAnyRole(USER_MANAGEMENT_ROLES);
  const { userId } = await context.params;

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  if (user.status === UserStatus.DISABLED) {
    return NextResponse.json({ error: "Disabled users cannot receive invites." }, { status: 400 });
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: userId
      },
      data: {
        status: UserStatus.INVITED
      }
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId
      }
    }),
    prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt
      }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "User",
        entityId: userId,
        action: AuditAction.UPDATE,
        details: {
          origin: "resend_invite",
          email: user.email
        }
      }
    })
  ]);

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const resetUrl = `${appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const mailResult = await sendInvitationEmail({
    to: user.email,
    firstName: user.firstName,
    appUrl,
    resetUrl
  });

  console.info("auth.email.invitation_resent", {
    actorUserId: session.id,
    userId,
    email: user.email,
    queued: mailResult.queued,
    provider: mailResult.provider,
    note: "note" in mailResult ? mailResult.note : null
  });

  return NextResponse.json({ ok: true });
}

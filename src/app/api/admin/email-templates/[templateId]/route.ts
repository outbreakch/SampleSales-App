import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { receiptHtmlToTextTemplate } from "@/lib/email-template";
import { emailTemplateUpdateSchema } from "@/lib/validation/email-template";
import { validationErrorResponse } from "@/lib/validation/http";
import { resourceIdParamSchema } from "@/lib/validation/params";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const session = await requireAnyRole(SETTINGS_ROLES);

  const payload = emailTemplateUpdateSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error);
  }

  const parsedParams = resourceIdParamSchema.safeParse((await params).templateId);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error, "Invalid email template id.");
  }

  const templateId = parsedParams.data;
  const existingTemplate = await prisma.emailTemplate.findUnique({
    where: {
      id: templateId
    }
  });

  if (!existingTemplate) {
    return NextResponse.json({ error: "Email template not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.emailTemplate.update({
      where: {
        id: templateId
      },
      data: {
        name: payload.data.name,
        subject: payload.data.subject,
        htmlBody: payload.data.htmlBody,
        textBody: receiptHtmlToTextTemplate(payload.data.htmlBody),
        isActive: payload.data.isActive
      }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "EmailTemplate",
        entityId: templateId,
        action: AuditAction.UPDATE,
        details: {
          before: {
            name: existingTemplate.name,
            subject: existingTemplate.subject,
            htmlBody: existingTemplate.htmlBody,
            textBody: existingTemplate.textBody,
            isActive: existingTemplate.isActive
          },
          after: payload.data
        }
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}

import { TemplateType } from "@prisma/client";
import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { receiptHtmlToTextTemplate } from "@/lib/email-template";
import { emailTemplateCreateSchema } from "@/lib/validation/email-template";
import { validationErrorResponse } from "@/lib/validation/http";

export async function GET() {
  await requireAnyRole(SETTINGS_ROLES);

  const templates = await prisma.emailTemplate.findMany({
    orderBy: [
      {
        country: {
          code: "asc"
        }
      },
      {
        languageCode: "asc"
      }
    ],
    include: {
      country: true
    }
  });

  return NextResponse.json({
    templates: templates.map((template) => ({
      id: template.id,
      name: template.name,
      countryCode: template.country.code,
      languageCode: template.languageCode,
      subject: template.subject,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
      isActive: template.isActive
    }))
  });
}

export async function POST(request: Request) {
  await requireAnyRole(SETTINGS_ROLES);

  const payload = emailTemplateCreateSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error);
  }

  const country = await prisma.country.findUnique({
    where: {
      code: payload.data.countryCode
    }
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  const duplicate = await prisma.emailTemplate.findFirst({
    where: {
      countryId: country.id,
      type: TemplateType.RECEIPT,
      languageCode: payload.data.languageCode
    },
    select: {
      id: true
    }
  });

  if (duplicate) {
    return NextResponse.json({ error: "A receipt template already exists for that country and language." }, { status: 409 });
  }

  const template = await prisma.emailTemplate.create({
    data: {
      countryId: country.id,
      type: TemplateType.RECEIPT,
      languageCode: payload.data.languageCode,
      name: payload.data.name,
      subject: payload.data.subject,
      htmlBody: payload.data.htmlBody,
      textBody: receiptHtmlToTextTemplate(payload.data.htmlBody),
      isActive: payload.data.isActive
    }
  });

  return NextResponse.json({ ok: true, template }, { status: 201 });
}

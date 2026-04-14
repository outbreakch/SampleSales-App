import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { countryUpdateSchema } from "@/lib/validation/country";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ countryCode: string }> }
) {
  const session = await requireAnyRole(SETTINGS_ROLES);

  const payload = countryUpdateSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const { countryCode } = await params;
  const existingCountry = await prisma.country.findUnique({
    where: {
      code: countryCode
    }
  });

  if (!existingCountry) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.country.update({
      where: {
        code: countryCode
      },
      data: {
        name: payload.data.name,
        companyName: payload.data.companyName,
        currencyCode: payload.data.currencyCode,
        defaultLocale: payload.data.defaultLocale,
        defaultLanguage: payload.data.defaultLanguage,
        priceIncludesTax: payload.data.priceIncludesTax,
        receiptFooter: payload.data.receiptFooter || null,
        legalLabel: payload.data.legalLabel || null,
        isActive: payload.data.isActive
      }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "Country",
        entityId: existingCountry.id,
        action: AuditAction.UPDATE,
        details: {
          before: {
            name: existingCountry.name,
            companyName: existingCountry.companyName,
            currencyCode: existingCountry.currencyCode,
            defaultLocale: existingCountry.defaultLocale,
            defaultLanguage: existingCountry.defaultLanguage,
            priceIncludesTax: existingCountry.priceIncludesTax,
            receiptFooter: existingCountry.receiptFooter,
            legalLabel: existingCountry.legalLabel,
            isActive: existingCountry.isActive
          },
          after: payload.data
        }
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}

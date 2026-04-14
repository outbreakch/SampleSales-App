import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { taxRuleSchema } from "@/lib/validation/tax-rule";

async function authorize() {
  return requireAnyRole(SETTINGS_ROLES);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ ruleId: string }> }) {
  const session = await authorize();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = taxRuleSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const { ruleId } = await params;
  const existingRule = await prisma.taxRule.findUnique({
    where: { id: ruleId },
    include: { country: true }
  });

  if (!existingRule) {
    return NextResponse.json({ error: "Tax rule not found." }, { status: 404 });
  }

  const country = await prisma.country.findUnique({
    where: { code: payload.data.countryCode }
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.taxRule.update({
      where: { id: ruleId },
      data: {
        countryId: country.id,
        name: payload.data.name,
        code: payload.data.code,
        category: payload.data.category,
        regionCode: payload.data.regionCode || null,
        ratePercent: payload.data.ratePercent.toString(),
        effectiveFrom: new Date(payload.data.effectiveFrom),
        effectiveTo: payload.data.effectiveTo ? new Date(payload.data.effectiveTo) : null,
        priority: payload.data.priority,
        isCompound: payload.data.isCompound,
        isActive: payload.data.isActive
      }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "TaxRule",
        entityId: ruleId,
        action: AuditAction.UPDATE,
        details: {
          before: {
            countryCode: existingRule.country.code,
            name: existingRule.name,
            code: existingRule.code,
            category: existingRule.category,
            regionCode: existingRule.regionCode,
            ratePercent: Number(existingRule.ratePercent),
            effectiveFrom: existingRule.effectiveFrom.toISOString(),
            effectiveTo: existingRule.effectiveTo?.toISOString() ?? null,
            priority: existingRule.priority,
            isCompound: existingRule.isCompound,
            isActive: existingRule.isActive
          },
          after: payload.data
        }
      }
    })
  ]);

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const session = await authorize();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = taxRuleSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const country = await prisma.country.findUnique({
    where: { code: payload.data.countryCode }
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  const taxRule = await prisma.taxRule.create({
    data: {
      countryId: country.id,
      name: payload.data.name,
      code: payload.data.code,
      category: payload.data.category,
      regionCode: payload.data.regionCode || null,
      ratePercent: payload.data.ratePercent.toString(),
      effectiveFrom: new Date(payload.data.effectiveFrom),
      effectiveTo: payload.data.effectiveTo ? new Date(payload.data.effectiveTo) : null,
      priority: payload.data.priority,
      isCompound: payload.data.isCompound,
      isActive: payload.data.isActive
    }
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: session.id,
      entityType: "TaxRule",
      entityId: taxRule.id,
      action: AuditAction.CREATE,
      details: payload.data
    }
  });

  return NextResponse.json({ ok: true, taxRule }, { status: 201 });
}

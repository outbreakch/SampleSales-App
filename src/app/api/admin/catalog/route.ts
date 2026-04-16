import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { CATALOG_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { catalogItemSchema } from "@/lib/validation/catalog";
import { validationErrorResponse } from "@/lib/validation/http";

export async function GET() {
  await requireAnyRole(CATALOG_ROLES);

  const items = await prisma.catalogItem.findMany({
    orderBy: {
      name: "asc"
    },
    include: {
      countries: {
        include: {
          country: true
        },
        orderBy: {
          country: {
            code: "asc"
          }
        }
      }
    }
  });

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      sku: item.sku,
      name: item.name,
      description: item.description,
      basePrice: Number(item.basePrice),
      taxCategory: item.taxCategory,
      isArchived: item.isArchived,
      countries: item.countries.map((entry) => ({
        countryCode: entry.country.code,
        currencyCode: entry.country.currencyCode,
        isAvailable: entry.isAvailable,
        overridePrice: entry.overridePrice ? Number(entry.overridePrice) : null
      }))
    }))
  });
}

export async function POST(request: Request) {
  const session = await requireAnyRole(CATALOG_ROLES);
  const payload = catalogItemSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error);
  }

  const duplicateSku = await prisma.catalogItem.findUnique({
    where: {
      sku: payload.data.sku
    },
    select: {
      id: true
    }
  });

  if (duplicateSku) {
    return NextResponse.json({ error: "SKU already exists." }, { status: 409 });
  }

  const countries = await prisma.country.findMany({
    where: {
      code: {
        in: payload.data.countryCodes
      }
    }
  });

  if (countries.length !== payload.data.countryCodes.length) {
    return NextResponse.json({ error: "One or more countries were not found." }, { status: 400 });
  }

  const createdItem = await prisma.$transaction(async (tx) => {
    const item = await tx.catalogItem.create({
      data: {
        sku: payload.data.sku.trim(),
        name: payload.data.name.trim(),
        description: payload.data.description?.trim() || null,
        basePrice: payload.data.basePrice.toFixed(2),
        taxCategory: payload.data.taxCategory.trim(),
        isArchived: false
      }
    });

    await tx.catalogItemCountry.createMany({
      data: countries.map((country) => ({
        catalogItemId: item.id,
        countryId: country.id,
        isAvailable: true
      }))
    });

    await tx.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "CatalogItem",
        entityId: item.id,
        action: AuditAction.CREATE,
        details: payload.data
      }
    });

    return item;
  });

  return NextResponse.json({ ok: true, item: { id: createdItem.id } }, { status: 201 });
}

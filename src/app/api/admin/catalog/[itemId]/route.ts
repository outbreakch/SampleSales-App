import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { CATALOG_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { catalogItemUpdateSchema } from "@/lib/validation/catalog";
import { validationErrorResponse } from "@/lib/validation/http";
import { resourceIdParamSchema } from "@/lib/validation/params";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const session = await requireAnyRole(CATALOG_ROLES);

  const payload = catalogItemUpdateSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error);
  }

  const parsedParams = resourceIdParamSchema.safeParse((await params).itemId);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error, "Invalid catalog item id.");
  }

  const itemId = parsedParams.data;
  const existingItem = await prisma.catalogItem.findUnique({
    where: {
      id: itemId
    },
    include: {
      countries: {
        include: {
          country: true
        }
      }
    }
  });

  if (!existingItem) {
    return NextResponse.json({ error: "Catalog item not found." }, { status: 404 });
  }

  const duplicateSku = await prisma.catalogItem.findFirst({
    where: {
      sku: payload.data.sku,
      id: {
        not: itemId
      }
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
        in: payload.data.countries.map((entry) => entry.countryCode)
      }
    }
  });

  if (countries.length !== payload.data.countries.length) {
    return NextResponse.json({ error: "One or more countries were not found." }, { status: 400 });
  }

  const countryIdByCode = new Map(countries.map((country) => [country.code, country.id]));

  await prisma.$transaction(async (tx) => {
    await tx.catalogItem.update({
      where: {
        id: itemId
      },
      data: {
        sku: payload.data.sku,
        name: payload.data.name,
        description: payload.data.description || null,
        basePrice: payload.data.basePrice.toFixed(2),
        taxCategory: payload.data.taxCategory,
        isArchived: payload.data.isArchived
      }
    });

    for (const country of payload.data.countries) {
      const countryId = countryIdByCode.get(country.countryCode);

      if (!countryId) {
        continue;
      }

      await tx.catalogItemCountry.upsert({
        where: {
          catalogItemId_countryId: {
            catalogItemId: itemId,
            countryId
          }
        },
        create: {
          catalogItemId: itemId,
          countryId,
          isAvailable: country.isAvailable,
          overridePrice: country.overridePrice?.toFixed(2) ?? null
        },
        update: {
          isAvailable: country.isAvailable,
          overridePrice: country.overridePrice?.toFixed(2) ?? null
        }
      });
    }

    await tx.auditLog.create({
      data: {
        actorUserId: session.id,
        entityType: "CatalogItem",
        entityId: itemId,
        action: AuditAction.UPDATE,
        details: {
          before: {
            sku: existingItem.sku,
            name: existingItem.name,
            description: existingItem.description,
            basePrice: Number(existingItem.basePrice),
            taxCategory: existingItem.taxCategory,
            isArchived: existingItem.isArchived,
            countries: existingItem.countries.map((entry) => ({
              countryCode: entry.country.code,
              isAvailable: entry.isAvailable,
              overridePrice: entry.overridePrice ? Number(entry.overridePrice) : null
            }))
          },
          after: payload.data
        }
      }
    });
  });

  return NextResponse.json({ ok: true });
}

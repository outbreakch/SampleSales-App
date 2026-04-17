import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const items = await prisma.catalogItem.findMany({
    where: {
      isArchived: false,
      countries: {
        some: {
          isAvailable: true
        }
      }
    },
    include: {
      countries: {
        where: {
          isAvailable: true
        },
        include: {
          country: true
        }
      }
    },
    orderBy: {
      name: "asc"
    }
  });

  return NextResponse.json({
    items: items.map((item) => {
      const localizedName = session.preferredLanguage?.startsWith("fr") && item.nameFr ? item.nameFr : item.name;

      return {
        id: item.id,
        sku: item.sku,
        name: localizedName,
        nameEn: item.name,
        nameFr: item.nameFr ?? undefined,
        description: item.description ?? undefined,
        price: Number(item.countries[0]?.overridePrice ?? item.basePrice),
        taxCategory: item.taxCategory,
        countries: item.countries.map((entry) => entry.country.code)
      };
    })
  });
}

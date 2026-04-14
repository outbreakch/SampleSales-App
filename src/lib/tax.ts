import { prisma } from "@/lib/db/prisma";
import type { CartLine, CountryConfig, OrderSummary } from "@/lib/types";

const baseTaxRates: Record<string, number> = {
  US: 0,
  CA: 0.14975,
  AU: 0.1
};

export function resolveTaxRate(countryCode: string) {
  return baseTaxRates[countryCode] ?? 0;
}

export async function resolveActiveTaxRate(countryCode: string, category = "STANDARD") {
  const country = await prisma.country.findUnique({
    where: {
      code: countryCode
    },
    select: {
      id: true
    }
  });

  if (!country) {
    return 0;
  }

  const now = new Date();
  const rules = await prisma.taxRule.findMany({
    where: {
      countryId: country.id,
      category,
      isActive: true,
      effectiveFrom: {
        lte: now
      },
      AND: [
        {
          OR: [
            { effectiveTo: null },
            {
              effectiveTo: {
                gte: now
              }
            }
          ]
        }
      ]
    },
    orderBy: [
      {
        priority: "desc"
      },
      {
        effectiveFrom: "desc"
      }
    ]
  });

  if (rules.length === 0) {
    return 0;
  }

  return rules.reduce((total, rule) => total + Number(rule.ratePercent) / 100, 0);
}

export function buildOrderSummary(lines: CartLine[], country: CountryConfig): OrderSummary {
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const taxRate = resolveTaxRate(country.code);

  if (country.priceIncludesTax) {
    const tax = Number((subtotal - subtotal / (1 + taxRate)).toFixed(2));
    return {
      subtotal: Number((subtotal - tax).toFixed(2)),
      tax,
      total: Number(subtotal.toFixed(2))
    };
  }

  const tax = Number((subtotal * taxRate).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax,
    total: Number((subtotal + tax).toFixed(2))
  };
}

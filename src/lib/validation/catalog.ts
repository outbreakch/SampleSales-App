import { z } from "zod";
import { countryCodeSchema, optionalTextSchema, skuSchema, taxCategorySchema, titleSchema } from "@/lib/validation/primitives";

export const catalogItemSchema = z.object({
  sku: skuSchema,
  name: titleSchema,
  nameFr: optionalTextSchema(120),
  description: optionalTextSchema(500),
  basePrice: z.number().nonnegative(),
  taxCategory: taxCategorySchema,
  countryCodes: z.array(countryCodeSchema).min(1)
});

export const catalogItemUpdateSchema = z.object({
  sku: skuSchema,
  name: titleSchema,
  nameFr: optionalTextSchema(120),
  description: optionalTextSchema(500),
  basePrice: z.number().nonnegative(),
  taxCategory: taxCategorySchema,
  isArchived: z.boolean(),
  countries: z.array(
    z.object({
      countryCode: countryCodeSchema,
      isAvailable: z.boolean(),
      overridePrice: z.number().nonnegative().nullable()
    })
  ).min(1)
});

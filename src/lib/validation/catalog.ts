import { z } from "zod";

export const catalogItemSchema = z.object({
  sku: z.string().min(3).max(50),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional(),
  basePrice: z.number().nonnegative(),
  taxCategory: z.string().min(2).max(50),
  countryCodes: z.array(z.enum(["US", "CA", "AU"])).min(1)
});

export const catalogItemUpdateSchema = z.object({
  sku: z.string().trim().min(3).max(50),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  basePrice: z.number().nonnegative(),
  taxCategory: z.string().trim().min(2).max(50),
  isArchived: z.boolean(),
  countries: z.array(
    z.object({
      countryCode: z.enum(["US", "CA", "AU"]),
      isAvailable: z.boolean(),
      overridePrice: z.number().nonnegative().nullable()
    })
  ).min(1)
});

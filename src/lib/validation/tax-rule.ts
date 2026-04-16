import { z } from "zod";
import { countryCodeSchema, taxCategorySchema, titleSchema } from "@/lib/validation/primitives";

export const taxRuleSchema = z.object({
  name: titleSchema,
  code: z.string().trim().min(2).max(50).regex(/^[A-Z0-9_-]+$/).transform((value) => value.toUpperCase()),
  category: taxCategorySchema,
  countryCode: countryCodeSchema,
  regionCode: z.string().trim().max(20).optional().or(z.literal("")),
  ratePercent: z.number().min(0).max(100),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional().or(z.literal("")),
  priority: z.number().int().min(0).max(999),
  isCompound: z.boolean(),
  isActive: z.boolean()
});

import { z } from "zod";

export const taxRuleSchema = z.object({
  name: z.string().trim().min(2).max(120),
  code: z.string().trim().min(2).max(50),
  category: z.string().trim().min(2).max(50),
  countryCode: z.enum(["US", "CA", "AU"]),
  regionCode: z.string().trim().max(20).optional().or(z.literal("")),
  ratePercent: z.number().min(0).max(100),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional().or(z.literal("")),
  priority: z.number().int().min(0).max(999),
  isCompound: z.boolean(),
  isActive: z.boolean()
});

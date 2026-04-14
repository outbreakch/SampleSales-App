import { z } from "zod";

export const countryUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  companyName: z.string().trim().min(2).max(160),
  currencyCode: z.string().trim().min(3).max(3),
  defaultLocale: z.string().trim().min(2).max(20),
  defaultLanguage: z.string().trim().min(2).max(10),
  priceIncludesTax: z.boolean(),
  receiptFooter: z.string().trim().max(1000).optional().or(z.literal("")),
  legalLabel: z.string().trim().max(1000).optional().or(z.literal("")),
  isActive: z.boolean()
});

import { z } from "zod";
import {
  currencyCodeSchema,
  localeCodeSchema,
  longTextSchema,
  optionalTextSchema,
  staffLocaleSchema
} from "@/lib/validation/primitives";

export const countryUpdateSchema = z.object({
  name: longTextSchema(100).min(2, "Country name is required."),
  companyName: longTextSchema(160).min(2, "Company name is required."),
  currencyCode: currencyCodeSchema,
  defaultLocale: localeCodeSchema,
  defaultLanguage: staffLocaleSchema,
  priceIncludesTax: z.boolean(),
  receiptFooter: optionalTextSchema(1000),
  legalLabel: optionalTextSchema(1000),
  isActive: z.boolean()
});

import { z } from "zod";
import { countryCodeSchema, staffLocaleSchema, titleSchema } from "@/lib/validation/primitives";

export const emailTemplateUpdateSchema = z.object({
  name: titleSchema,
  subject: z.string().trim().min(2).max(200),
  htmlBody: z.string().trim().min(10),
  isActive: z.boolean()
});

export const emailTemplateCreateSchema = emailTemplateUpdateSchema.extend({
  countryCode: countryCodeSchema,
  languageCode: staffLocaleSchema
});

import { z } from "zod";

export const emailTemplateUpdateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  subject: z.string().trim().min(2).max(200),
  htmlBody: z.string().trim().min(10),
  isActive: z.boolean()
});

export const emailTemplateCreateSchema = emailTemplateUpdateSchema.extend({
  countryCode: z.enum(["US", "CA", "AU"]),
  languageCode: z.string().trim().min(2).max(10)
});

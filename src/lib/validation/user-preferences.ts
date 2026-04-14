import { z } from "zod";

export const userPreferencesSchema = z.object({
  countryCode: z.enum(["US", "CA", "AU"]),
  preferredLanguage: z.string().trim().min(2).max(10)
});

import { z } from "zod";
import { countryCodeSchema, staffLocaleSchema } from "@/lib/validation/primitives";

export const userPreferencesSchema = z.object({
  countryCode: countryCodeSchema,
  preferredLanguage: staffLocaleSchema
});

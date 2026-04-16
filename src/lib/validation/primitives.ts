import { z } from "zod";

export const supportedCountryCodes = ["US", "CA", "AU"] as const;
export const supportedStaffLocales = ["en", "fr-CA"] as const;

export const resourceIdSchema = z
  .string()
  .trim()
  .min(1, "Identifier is required.")
  .max(128, "Identifier is too long.")
  .regex(/^[A-Za-z0-9_-]+$/, "Identifier contains invalid characters.");

export const emailAddressSchema = z
  .string()
  .trim()
  .max(254, "Email must be 254 characters or less.")
  .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const personNameSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .max(80, "This field must be 80 characters or less.");

export const titleSchema = z
  .string()
  .trim()
  .min(2, "This field is required.")
  .max(120, "This field must be 120 characters or less.");

export const longTextSchema = (max: number) =>
  z.string().trim().max(max, `This field must be ${max} characters or less.`);

export const optionalTextSchema = (max: number) => longTextSchema(max).optional().or(z.literal(""));

export const countryCodeSchema = z.enum(supportedCountryCodes);

export const staffLocaleSchema = z.enum(supportedStaffLocales);

export const localeCodeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, "Locale must be in the format ll or ll-CC.");

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Currency code must be a 3-letter ISO code.");

export const skuSchema = z
  .string()
  .trim()
  .min(3, "SKU is required.")
  .max(50, "SKU must be 50 characters or less.")
  .regex(/^[A-Za-z0-9-]+$/, "SKU may only contain letters, numbers, and hyphens.")
  .transform((value) => value.toUpperCase());

export const taxCategorySchema = z
  .string()
  .trim()
  .min(2, "Tax category is required.")
  .max(50, "Tax category must be 50 characters or less.")
  .regex(/^[A-Za-z0-9_-]+$/, "Tax category may only contain letters, numbers, underscores, and hyphens.")
  .transform((value) => value.toUpperCase());

export const paymentMethodNoteSchema = z
  .string()
  .trim()
  .min(2, "Payment note is required.")
  .max(120, "Payment note must be 120 characters or less.");

import { z } from "zod";
import { emailAddressSchema, personNameSchema, resourceIdSchema } from "@/lib/validation/primitives";

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be 128 characters or less.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/\d/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol.");

export const loginSchema = z.object({
  email: emailAddressSchema,
  password: z.string().min(8).max(128)
});

export const registerSchema = z
  .object({
    firstName: personNameSchema,
    lastName: personNameSchema,
    email: emailAddressSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const passwordResetRequestSchema = z.object({
  email: emailAddressSchema
});

export const passwordResetSchema = z
  .object({
    token: resourceIdSchema.min(32).max(256),
    password: passwordSchema,
    confirmPassword: passwordSchema
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

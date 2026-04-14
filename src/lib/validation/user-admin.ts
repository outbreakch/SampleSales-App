import { RoleKey, UserStatus } from "@prisma/client";
import { z } from "zod";
import { passwordSchema } from "@/lib/validation/auth";

export const adminUserCreateSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email(),
    password: passwordSchema.optional().or(z.literal("")),
    status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
    roles: z.array(z.nativeEnum(RoleKey)).min(1)
  })
  .superRefine((value, context) => {
    if (value.status !== UserStatus.INVITED && !value.password) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message: "Password is required unless the user is being invited."
      });
    }

    if (value.roles.includes(RoleKey.ADMIN)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roles"],
        message: "Legacy ADMIN role is no longer assignable."
      });
    }
  });

export const adminUserUpdateSchema = z
  .object({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    email: z.string().trim().email(),
    password: passwordSchema.optional().or(z.literal("")),
    status: z.nativeEnum(UserStatus),
    roles: z.array(z.nativeEnum(RoleKey)).min(1)
  })
  .superRefine((value, context) => {
    if (value.roles.includes(RoleKey.ADMIN)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["roles"],
        message: "Legacy ADMIN role is no longer assignable."
      });
    }
  });

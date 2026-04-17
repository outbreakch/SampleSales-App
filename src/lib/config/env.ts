import { z } from "zod";

const mailProviderSchema = z.enum(["console", "mailjet"]).default("console");

const runtimeEnvSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
    APP_URL: z.string().url("APP_URL must be a valid URL."),
    APP_ENV: z.string().min(1).default("production"),
    SESSION_SECRET: z.string().min(24, "SESSION_SECRET must be at least 24 characters."),
    MAIL_PROVIDER: mailProviderSchema,
    MAILJET_API_KEY: z.string().optional(),
    MAILJET_API_SECRET: z.string().optional(),
    MAIL_FROM: z.string().email("MAIL_FROM must be a valid email address."),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    APP_LOG_SERVICE: z.string().min(1).default("sample-sales-app")
  })
  .superRefine((env, ctx) => {
    if (env.MAIL_PROVIDER === "mailjet") {
      if (!env.MAILJET_API_KEY) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["MAILJET_API_KEY"],
          message: "MAILJET_API_KEY is required when MAIL_PROVIDER=mailjet."
        });
      }

      if (!env.MAILJET_API_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["MAILJET_API_SECRET"],
          message: "MAILJET_API_SECRET is required when MAIL_PROVIDER=mailjet."
        });
      }
    }
  });

export type RuntimeEnv = z.infer<typeof runtimeEnvSchema>;

export function getRuntimeEnvValidation() {
  return runtimeEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    APP_URL: process.env.APP_URL,
    APP_ENV: process.env.APP_ENV,
    SESSION_SECRET: process.env.SESSION_SECRET,
    MAIL_PROVIDER: process.env.MAIL_PROVIDER,
    MAILJET_API_KEY: process.env.MAILJET_API_KEY,
    MAILJET_API_SECRET: process.env.MAILJET_API_SECRET,
    MAIL_FROM: process.env.MAIL_FROM,
    LOG_LEVEL: process.env.LOG_LEVEL,
    APP_LOG_SERVICE: process.env.APP_LOG_SERVICE
  });
}

export function getRuntimeEnvIssues() {
  const validation = getRuntimeEnvValidation();

  if (validation.success) {
    return [];
  }

  return validation.error.issues.map((issue) => ({
    field: issue.path.join(".") || "env",
    message: issue.message
  }));
}

export function requireRuntimeEnv() {
  const validation = getRuntimeEnvValidation();

  if (!validation.success) {
    const details = validation.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Runtime environment validation failed. ${details}`);
  }

  return validation.data;
}

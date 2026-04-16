import crypto from "node:crypto";

type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

const runtimeLogLevel = ((process.env.LOG_LEVEL ?? "info").toLowerCase() as LogLevel);
const minimumLevel = levelPriority[runtimeLogLevel] ?? levelPriority.info;
const serviceName = process.env.APP_LOG_SERVICE ?? "sample-sales-app";
const environmentName = process.env.NODE_ENV ?? "development";
const sensitiveKeyPattern = /(password|secret|token|authorization|cookie|session|apikey|api_key|clientsecret)/i;

function shouldLog(level: LogLevel) {
  return levelPriority[level] >= minimumLevel;
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }

  return {
    name: error.name,
    message: error.message,
    stack: environmentName === "production" ? undefined : error.stack
  };
}

function sanitizeValue(value: unknown, depth = 0): unknown {
  if (value == null || depth > 4) {
    return value;
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry, depth + 1));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entryValue]) => {
        if (sensitiveKeyPattern.test(key)) {
          return [key, "[REDACTED]"];
        }

        return [key, sanitizeValue(entryValue, depth + 1)];
      })
    );
  }

  if (typeof value === "string" && value.length > 4000) {
    return `${value.slice(0, 4000)}…[truncated]`;
  }

  return value;
}

function emit(level: LogLevel, event: string, context?: LogContext) {
  if (!shouldLog(level)) {
    return;
  }

  const sanitizedContext = sanitizeValue(context ?? {});

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    service: serviceName,
    environment: environmentName,
    ...(typeof sanitizedContext === "object" && sanitizedContext !== null ? sanitizedContext : {})
  };

  const message = JSON.stringify(entry);

  if (level === "error") {
    console.error(message);
    return;
  }

  if (level === "warn") {
    console.warn(message);
    return;
  }

  console.log(message);
}

export const logger = {
  debug(event: string, context?: LogContext) {
    emit("debug", event, context);
  },
  info(event: string, context?: LogContext) {
    emit("info", event, context);
  },
  warn(event: string, context?: LogContext) {
    emit("warn", event, context);
  },
  error(event: string, context?: LogContext) {
    emit("error", event, context);
  }
};

export function getRequestLogContext(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  return {
    requestId,
    method: request.method,
    path: new URL(request.url).pathname
  };
}

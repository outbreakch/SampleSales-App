import { NextResponse } from "next/server";
import { getRequestLogContext, logger } from "@/lib/observability/logger";

type ErrorDetails = Record<string, unknown> | null | undefined;

export function apiErrorResponse(message: string, status: number, details?: ErrorDetails) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status }
  );
}

export function apiServerErrorResponse(request: Request, event: string, error: unknown, details?: ErrorDetails) {
  logger.error(event, {
    ...getRequestLogContext(request),
    error,
    details: details ?? null
  });

  return NextResponse.json(
    {
      error: "An unexpected server error occurred."
    },
    { status: 500 }
  );
}

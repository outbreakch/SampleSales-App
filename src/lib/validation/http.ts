import { NextResponse } from "next/server";
import type { z } from "zod";

export function validationErrorResponse(error: z.ZodError, message = "Validation failed.") {
  return NextResponse.json(
    {
      error: message,
      details: error.flatten()
    },
    { status: 400 }
  );
}

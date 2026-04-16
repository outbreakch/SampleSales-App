import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getRuntimeEnvIssues } from "@/lib/config/env";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const envIssues = getRuntimeEnvIssues();
  let databaseOk = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch (error) {
    logger.error("health.database_failed", { error });
  }

  const ok = envIssues.length === 0 && databaseOk;
  const status = ok ? 200 : 503;

  return NextResponse.json(
    {
      ok,
      service: process.env.APP_LOG_SERVICE ?? "sample-sales-app",
      environment: process.env.NODE_ENV ?? "development",
      checks: {
        env: envIssues.length === 0 ? "ok" : "failed",
        database: databaseOk ? "ok" : "failed"
      },
      issues: envIssues,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}

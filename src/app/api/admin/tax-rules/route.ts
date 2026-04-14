import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  await requireAnyRole(SETTINGS_ROLES);

  const taxRules = await prisma.taxRule.findMany({
    include: {
      country: true
    },
    orderBy: [
      {
        country: {
          code: "asc"
        }
      },
      {
        priority: "desc"
      },
      {
        effectiveFrom: "desc"
      }
    ]
  });

  return NextResponse.json({ taxRules });
}

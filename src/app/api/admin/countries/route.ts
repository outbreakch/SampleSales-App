import { NextResponse } from "next/server";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  await requireAnyRole(SETTINGS_ROLES);

  const countries = await prisma.country.findMany({
    orderBy: {
      code: "asc"
    }
  });

  return NextResponse.json({ countries });
}

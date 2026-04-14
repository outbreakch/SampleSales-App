import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { userPreferencesSchema } from "@/lib/validation/user-preferences";

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      defaultCountry: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    preferences: {
      countryCode: user.defaultCountry?.code ?? null,
      companyName: user.defaultCountry?.companyName ?? null,
      preferredLanguage: user.preferredLanguage ?? null,
      completed: Boolean(user.preferencesCompletedAt)
    }
  });
}

export async function PATCH(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = userPreferencesSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const country = await prisma.country.findUnique({
    where: { code: payload.data.countryCode }
  });

  if (!country) {
    return NextResponse.json({ error: "Country not found." }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.id },
    data: {
      defaultCountryId: country.id,
      defaultRegionCode: null,
      preferredLanguage: payload.data.preferredLanguage,
      preferencesCompletedAt: new Date()
    }
  });

  return NextResponse.json({ ok: true });
}

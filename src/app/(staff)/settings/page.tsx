import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { UserPreferencesForm } from "@/components/pos/user-preferences-form";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function SettingsPage() {
  const user = await requireUser();
  const [countries, currentUser] = await Promise.all([
    prisma.country.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" }
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      include: {
        defaultCountry: true
      }
    })
  ]);
  const copy = getStaffCopy(currentUser?.preferredLanguage);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.settings}
          title={copy.settingsTitle}
          description={copy.settingsDescription}
        />
        <UserPreferencesForm
          countries={countries.map((country) => ({
            code: country.code as "US" | "CA" | "AU",
            name: country.name,
            companyName: country.companyName,
            currencyCode: country.currencyCode,
            locale: country.defaultLocale,
            defaultLanguage: country.defaultLanguage,
            priceIncludesTax: country.priceIncludesTax,
            receiptFooter: country.receiptFooter ?? "",
            legalLabel: country.legalLabel ?? ""
          }))}
          initialValues={{
            countryCode: (currentUser?.defaultCountry?.code as "US" | "CA" | "AU" | null) ?? null,
            preferredLanguage: currentUser?.preferredLanguage ?? null
          }}
        />
      </div>
    </AppShell>
  );
}

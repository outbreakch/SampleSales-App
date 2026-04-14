import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { CountrySettingsManager } from "@/components/admin/country-settings-manager";
import { TaxRuleManager } from "@/components/admin/tax-rule-manager";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function SettingsPage() {
  const session = await requireAnyRole(SETTINGS_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);
  const countries = await prisma.country.findMany({
    orderBy: {
      code: "asc"
    }
  });
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

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.configurationEyebrow}
          title={copy.configurationTitle}
          description={copy.configurationDescription}
        />
        <CountrySettingsManager
          language={session.preferredLanguage}
          countries={countries.map((country) => ({
            code: country.code as "US" | "CA" | "AU",
            name: country.name,
            companyName: country.companyName,
            currencyCode: country.currencyCode,
            defaultLocale: country.defaultLocale,
            defaultLanguage: country.defaultLanguage,
            priceIncludesTax: country.priceIncludesTax,
            receiptFooter: country.receiptFooter,
            legalLabel: country.legalLabel,
            isActive: country.isActive
          }))}
        />
        <TaxRuleManager
          language={session.preferredLanguage}
          taxRules={taxRules.map((rule) => ({
            id: rule.id,
            countryCode: rule.country.code as "US" | "CA" | "AU",
            name: rule.name,
            code: rule.code,
            category: rule.category,
            ratePercent: Number(rule.ratePercent),
            effectiveFrom: rule.effectiveFrom.toISOString(),
            effectiveTo: rule.effectiveTo?.toISOString() ?? null,
            priority: rule.priority,
            isCompound: rule.isCompound,
            isActive: rule.isActive
          }))}
        />
      </div>
    </AppShell>
  );
}

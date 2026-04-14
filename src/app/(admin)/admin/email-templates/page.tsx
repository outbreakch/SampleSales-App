import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { EmailTemplateManager } from "@/components/admin/email-template-manager";
import { SETTINGS_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function EmailTemplatesPage() {
  const session = await requireAnyRole(SETTINGS_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);
  const [templates, countries] = await Promise.all([
    prisma.emailTemplate.findMany({
      orderBy: [
        {
          country: {
            code: "asc"
          }
        },
        {
          languageCode: "asc"
        }
      ],
      include: {
        country: true
      }
    }),
    prisma.country.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        code: "asc"
      }
    })
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.emailTemplatesEyebrow}
          title={copy.localizedReceiptContent}
          description={copy.localizedReceiptContentDescription}
        />
        <EmailTemplateManager
          language={session.preferredLanguage}
          countries={countries.map((country) => ({
            code: country.code as "US" | "CA" | "AU",
            name: country.name,
            currencyCode: country.currencyCode,
            defaultLocale: country.defaultLocale,
            receiptFooter: country.receiptFooter,
            legalLabel: country.legalLabel
          }))}
          templates={templates.map((template) => ({
            id: template.id,
            name: template.name,
            countryCode: template.country.code,
            languageCode: template.languageCode,
            subject: template.subject,
            htmlBody: template.htmlBody,
            textBody: template.textBody,
            isActive: template.isActive
          }))}
        />
      </div>
    </AppShell>
  );
}

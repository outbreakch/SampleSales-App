import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogManager } from "@/components/admin/catalog-manager";
import { CATALOG_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function AdminCatalogPage() {
  const session = await requireAnyRole(CATALOG_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);
  const items = await prisma.catalogItem.findMany({
    orderBy: {
      name: "asc"
    },
    include: {
      countries: {
        include: {
          country: true
        },
        orderBy: {
          country: {
            code: "asc"
          }
        }
      }
    }
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.catalogEyebrow}
          title={copy.manageSellableInventory}
          description={copy.manageSellableInventoryDescription}
        />
        <CatalogManager
          language={session.preferredLanguage}
          items={items.map((item) => ({
            id: item.id,
            sku: item.sku,
            name: item.name,
            nameFr: item.nameFr,
            description: item.description,
            basePrice: Number(item.basePrice),
            taxCategory: item.taxCategory,
            isArchived: item.isArchived,
            countries: item.countries.map((entry) => ({
              countryCode: entry.country.code as "US" | "CA" | "AU",
              currencyCode: entry.country.currencyCode,
              isAvailable: entry.isAvailable,
              overridePrice: entry.overridePrice ? Number(entry.overridePrice) : null
            }))
          }))}
        />
      </div>
    </AppShell>
  );
}

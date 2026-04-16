import type { Route } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { AdminMetrics } from "@/components/admin/admin-metrics";
import { Card } from "@/components/ui/card";
import {
  ADMIN_SECTION_ROLES,
  CATALOG_ROLES,
  ORDER_VIEW_ROLES,
  SETTINGS_ROLES,
  USER_MANAGEMENT_ROLES,
  hasAnyRole,
  requireAnyRole
} from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function AdminDashboardPage() {
  const session = await requireAnyRole(ADMIN_SECTION_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);
  const links = [
    hasAnyRole(session, CATALOG_ROLES)
      ? { href: "/admin/catalog", label: copy.catalogManagement, detail: copy.catalogManagementDetail }
      : null,
    hasAnyRole(session, ORDER_VIEW_ROLES)
      ? { href: "/admin/orders", label: copy.orderHistory, detail: copy.orderHistoryDetail }
      : null,
    hasAnyRole(session, ORDER_VIEW_ROLES)
      ? {
          href: "/admin/email-deliveries",
          label: "Email delivery history",
          detail: "Inspect queued, failed, and provider-accepted receipt and authentication emails."
        }
      : null,
    hasAnyRole(session, SETTINGS_ROLES)
      ? { href: "/admin/email-templates", label: copy.emailTemplatesTitle, detail: copy.emailTemplatesDetail }
      : null,
    hasAnyRole(session, SETTINGS_ROLES)
      ? { href: "/admin/settings", label: copy.countrySettingsTitle, detail: copy.countrySettingsDetail }
      : null,
    hasAnyRole(session, USER_MANAGEMENT_ROLES)
      ? { href: "/admin/users", label: "User management", detail: "Create users, assign roles, disable access, and update passwords" }
      : null
  ].filter(Boolean) as Array<{ href: Route; label: string; detail: string }>;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [ordersToday, receiptsSentToday, activeProducts, countries] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: startOfToday
        }
      }
    }),
    prisma.order.count({
      where: {
        OR: [
          {
            receiptSentAt: {
              gte: startOfToday
            }
          },
          {
            receiptResentAt: {
              gte: startOfToday
            }
          }
        ]
      }
    }),
    prisma.catalogItem.count({
      where: {
        isArchived: false
      }
    }),
    prisma.country.count({
      where: {
        isActive: true
      }
    })
  ]);

  const receiptSuccess =
    ordersToday === 0 ? "0%" : `${Math.round((receiptsSentToday / ordersToday) * 1000) / 10}%`;

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.adminEyebrow}
          title={copy.adminTitle}
          description={copy.adminDescription}
        />
        <AdminMetrics
          metrics={[
            { label: copy.ordersToday, value: ordersToday.toString() },
            { label: copy.receiptSuccess, value: receiptSuccess },
            { label: copy.activeProducts, value: activeProducts.toString() },
            { label: copy.countriesLabel, value: countries.toString() }
          ]}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="h-full bg-white/95 transition hover:-translate-y-0.5">
                <h3 className="text-xl font-semibold text-ink">{link.label}</h3>
                <p className="mt-2 text-sm text-stone">{link.detail}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

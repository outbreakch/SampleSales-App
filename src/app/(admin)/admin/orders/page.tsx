import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { AdminOrderList } from "@/components/admin/admin-order-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ORDER_SUPPORT_ROLES, ORDER_VIEW_ROLES, hasAnyRole, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function AdminOrdersPage() {
  const session = await requireAnyRole(ORDER_VIEW_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);
  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 50,
    include: {
      country: true,
      cashier: true,
      lineItems: {
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.ordersEyebrow}
          title={copy.allOrdersTitle}
          description={copy.allOrdersDescription}
          actions={<Button variant="secondary">{copy.exportCsv}</Button>}
        />
        <Card className="bg-white/96">
          <h3 className="px-6 pt-6 text-lg font-semibold text-ink">{copy.recentOrderHistory}</h3>
          <div className="p-6">
            <AdminOrderList
              canManageOrderSupport={hasAnyRole(session, ORDER_SUPPORT_ROLES)}
              language={session.preferredLanguage}
              orders={orders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                subtotalAmount: Number(order.subtotalAmount),
                taxAmount: Number(order.taxAmount),
                totalAmount: Number(order.totalAmount),
                currencyCode: order.currencyCode,
                countryCode: order.country.code,
                locale: order.country.defaultLocale || "en-US",
                paymentStatus: order.paymentStatus,
                paymentMethodNote: order.paymentMethodNote,
                createdAt: order.createdAt.toISOString(),
                cashierName: `${order.cashier.firstName} ${order.cashier.lastName}`.trim(),
                receiptSentAt: order.receiptSentAt?.toISOString() ?? null,
                receiptResentAt: order.receiptResentAt?.toISOString() ?? null,
                lineItems: order.lineItems.map((line) => ({
                  id: line.id,
                  itemNameSnapshot: line.itemNameSnapshot,
                  skuSnapshot: line.skuSnapshot,
                  unitPrice: Number(line.unitPrice),
                  quantity: line.quantity,
                  taxAmount: Number(line.taxAmount),
                  lineTotal: Number(line.lineTotal)
                }))
              }))}
            />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

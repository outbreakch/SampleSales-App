import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { OrderList } from "@/components/pos/order-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

export default async function OrdersPage() {
  const user = await requireUser();
  const [orders, currentUser] = await Promise.all([
    prisma.order.findMany({
      where: {
        cashierUserId: user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 25,
      include: {
        country: true,
        cashier: true,
        lineItems: {
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    }),
    prisma.user.findUnique({
      where: {
        id: user.id
      },
      select: {
        preferredLanguage: true
      }
    })
  ]);
  const copy = getStaffCopy(currentUser?.preferredLanguage);

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow={copy.recentSales}
          title={copy.yourCompletedOrders}
          description={copy.yourCompletedOrdersDescription}
        />
        <Card className="overflow-hidden bg-white/96 p-0">
          <div className="hidden grid-cols-[1.1fr_1fr_120px_160px] gap-4 border-b border-black/5 px-6 py-4 text-xs uppercase tracking-[0.24em] text-stone xl:grid">
            <span>{copy.order}</span>
            <span>{copy.customer}</span>
            <span>{currentUser?.preferredLanguage?.startsWith("fr") ? "Pays" : "Country"}</span>
            <span>{copy.total}</span>
          </div>
          <OrderList
            language={currentUser?.preferredLanguage}
            orders={orders.map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber || order.id,
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
        </Card>
      </div>
    </AppShell>
  );
}

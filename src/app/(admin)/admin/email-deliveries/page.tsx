import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";
import { ORDER_VIEW_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function AdminEmailDeliveriesPage() {
  await requireAnyRole(ORDER_VIEW_ROLES);

  const deliveries = await prisma.emailDelivery.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 100,
    include: {
      actor: true,
      user: true,
      order: true,
      template: true
    }
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <PageIntro
          eyebrow="Email"
          title="Delivery history"
          description="Review the latest receipt and authentication emails sent by the app, including provider status, recipients, and any returned errors."
        />
        <Card className="bg-white/96">
          <div className="overflow-x-auto p-6">
            <table className="min-w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-[0.24em] text-stone">
                  <th className="pb-4 pr-4 font-medium">When</th>
                  <th className="pb-4 pr-4 font-medium">Type</th>
                  <th className="pb-4 pr-4 font-medium">Recipient</th>
                  <th className="pb-4 pr-4 font-medium">Status</th>
                  <th className="pb-4 pr-4 font-medium">Provider</th>
                  <th className="pb-4 pr-4 font-medium">Context</th>
                  <th className="pb-4 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((delivery) => (
                  <tr key={delivery.id} className="border-b border-black/5 align-top last:border-b-0">
                    <td className="py-4 pr-4 text-stone">{delivery.createdAt.toLocaleString("en-CA")}</td>
                    <td className="py-4 pr-4">{delivery.type.replaceAll("_", " ")}</td>
                    <td className="py-4 pr-4">
                      <div>{delivery.recipientEmail}</div>
                      <div className="mt-1 text-xs text-stone">{delivery.subject}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={delivery.queued ? "text-success" : "text-danger"}>
                        {delivery.queued ? "Queued" : "Failed"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div>{delivery.provider}</div>
                      {delivery.messageUuid ? <div className="mt-1 text-xs text-stone">{delivery.messageUuid}</div> : null}
                    </td>
                    <td className="py-4 pr-4 text-stone">
                      {delivery.order ? <div>Order {delivery.order.orderNumber}</div> : null}
                      {delivery.user ? (
                        <div>
                          User {delivery.user.firstName} {delivery.user.lastName}
                        </div>
                      ) : null}
                      {delivery.actor ? (
                        <div className="mt-1 text-xs">
                          By {delivery.actor.firstName} {delivery.actor.lastName}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 text-stone">
                      {delivery.note ? <div>{delivery.note}</div> : <div className="text-ink">No error reported</div>}
                      {delivery.messageId ? <div className="mt-1 text-xs">Message ID: {delivery.messageId}</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length === 0 ? <p className="text-sm text-stone">No email deliveries have been recorded yet.</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

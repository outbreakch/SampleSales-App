import { AppShell } from "@/components/layout/app-shell";
import { PageIntro } from "@/components/layout/page-intro";
import { Card } from "@/components/ui/card";
import { EmailDeliveryStatus } from "@prisma/client";
import { ORDER_VIEW_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffCopy } from "@/lib/i18n";

const statusTone: Record<EmailDeliveryStatus, string> = {
  QUEUED: "text-stone",
  DELIVERED: "text-success",
  OPENED: "text-success",
  CLICKED: "text-success",
  BOUNCED: "text-danger",
  BLOCKED: "text-danger",
  SPAM: "text-danger",
  UNSUBSCRIBED: "text-danger",
  TYPOFIX: "text-warning",
  FAILED: "text-danger"
};

export default async function AdminEmailDeliveriesPage() {
  const session = await requireAnyRole(ORDER_VIEW_ROLES);
  const copy = getStaffCopy(session.preferredLanguage);

  const statusLabel: Record<EmailDeliveryStatus, string> = {
    QUEUED: copy.emailDeliveryAccepted,
    DELIVERED: copy.emailDeliveryDelivered,
    OPENED: copy.emailDeliveryOpened,
    CLICKED: copy.emailDeliveryClicked,
    BOUNCED: copy.emailDeliveryBounced,
    BLOCKED: copy.emailDeliveryBlocked,
    SPAM: copy.emailDeliverySpam,
    UNSUBSCRIBED: copy.emailDeliveryUnsubscribed,
    TYPOFIX: copy.emailDeliveryTypoFix,
    FAILED: copy.emailDeliveryFailed
  };

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
          eyebrow={copy.emailDeliveryHistoryEyebrow}
          title={copy.emailDeliveryHistoryTitle}
          description={copy.emailDeliveryHistoryDescription}
        />
        <Card className="bg-white/96">
          <div className="overflow-x-auto p-6">
            <table className="min-w-full text-left text-sm text-ink">
              <thead>
                <tr className="border-b border-black/5 text-xs uppercase tracking-[0.24em] text-stone">
                  <th className="pb-4 pr-4 font-medium">{copy.emailDeliveryWhen}</th>
                  <th className="pb-4 pr-4 font-medium">{copy.emailDeliveryType}</th>
                  <th className="pb-4 pr-4 font-medium">{copy.emailDeliveryRecipient}</th>
                  <th className="pb-4 pr-4 font-medium">{copy.status}</th>
                  <th className="pb-4 pr-4 font-medium">{copy.emailDeliveryProvider}</th>
                  <th className="pb-4 pr-4 font-medium">{copy.emailDeliveryContext}</th>
                  <th className="pb-4 font-medium">{copy.emailDeliveryDetails}</th>
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
                      <span className={statusTone[delivery.status]}>
                        {statusLabel[delivery.status]}
                      </span>
                      {delivery.lastEventAt ? (
                        <div className="mt-1 text-xs text-stone">
                          {copy.emailDeliveryUpdatedPrefix} {delivery.lastEventAt.toLocaleString("en-CA")}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 pr-4">
                      <div>{delivery.provider}</div>
                      {delivery.messageUuid ? <div className="mt-1 text-xs text-stone">{delivery.messageUuid}</div> : null}
                    </td>
                    <td className="py-4 pr-4 text-stone">
                      {delivery.order ? <div>{copy.emailDeliveryOrderPrefix} {delivery.order.orderNumber}</div> : null}
                      {delivery.user ? (
                        <div>
                          {copy.emailDeliveryUserPrefix} {delivery.user.firstName} {delivery.user.lastName}
                        </div>
                      ) : null}
                      {delivery.actor ? (
                        <div className="mt-1 text-xs">
                          {copy.emailDeliveryByPrefix} {delivery.actor.firstName} {delivery.actor.lastName}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-4 text-stone">
                      {delivery.note ? (
                        <div>{delivery.note}</div>
                      ) : delivery.status === "QUEUED" ? (
                        <div className="text-ink">{copy.emailDeliveryProviderAcceptedNote}</div>
                      ) : (
                        <div className="text-ink">{copy.emailDeliveryNoProviderError}</div>
                      )}
                      {delivery.messageId ? <div className="mt-1 text-xs">{copy.emailDeliveryMessageIdLabel}: {delivery.messageId}</div> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {deliveries.length === 0 ? <p className="text-sm text-stone">{copy.emailDeliveryNoRecords}</p> : null}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

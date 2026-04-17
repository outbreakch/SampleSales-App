import crypto from "node:crypto";
import { EmailDeliveryStatus, EmailDeliveryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/observability/logger";

type DeliveryResult = {
  queued: boolean;
  provider: string;
  note?: string | null;
  messageId?: number | string | null;
  messageUuid?: string | null;
  trackingKey?: string | null;
};

type RecordEmailDeliveryInput = {
  type: EmailDeliveryType;
  recipientEmail: string;
  subject: string;
  result: DeliveryResult;
  actorUserId?: string | null;
  userId?: string | null;
  orderId?: string | null;
  templateId?: string | null;
  trackingKey?: string | null;
};

type UpdateEmailDeliveryStatusInput = {
  status: EmailDeliveryStatus;
  trackingKey?: string | null;
  messageId?: number | string | null;
  messageUuid?: string | null;
  recipientEmail?: string | null;
  occurredAt?: Date | null;
  note?: string | null;
};

const deliveryStatusPriority: Record<EmailDeliveryStatus, number> = {
  QUEUED: 0,
  DELIVERED: 10,
  OPENED: 20,
  CLICKED: 30,
  TYPOFIX: 35,
  UNSUBSCRIBED: 40,
  SPAM: 40,
  BLOCKED: 40,
  BOUNCED: 40,
  FAILED: 40
};

export function generateEmailTrackingKey() {
  return crypto.randomUUID();
}

export async function recordEmailDelivery({
  type,
  recipientEmail,
  subject,
  result,
  actorUserId,
  userId,
  orderId,
  templateId,
  trackingKey
}: RecordEmailDeliveryInput) {
  try {
    await prisma.emailDelivery.create({
      data: {
        type,
        actorUserId: actorUserId ?? null,
        userId: userId ?? null,
        orderId: orderId ?? null,
        templateId: templateId ?? null,
        recipientEmail,
        subject,
        status: result.queued ? EmailDeliveryStatus.QUEUED : EmailDeliveryStatus.FAILED,
        trackingKey: trackingKey ?? result.trackingKey ?? null,
        provider: result.provider,
        queued: result.queued,
        note: result.note ?? null,
        messageId: result.messageId != null ? String(result.messageId) : null,
        messageUuid: result.messageUuid ?? null
      }
    });
  } catch (error) {
    logger.error("email.delivery_log.persist_failed", {
      type,
      recipientEmail,
      subject,
      provider: result.provider,
      queued: result.queued,
      trackingKey: trackingKey ?? result.trackingKey ?? null,
      actorUserId: actorUserId ?? null,
      userId: userId ?? null,
      orderId: orderId ?? null,
      templateId: templateId ?? null,
      error
    });
  }
}

export async function updateEmailDeliveryStatus({
  status,
  trackingKey,
  messageId,
  messageUuid,
  recipientEmail,
  occurredAt,
  note
}: UpdateEmailDeliveryStatusInput) {
  const normalizedMessageId = messageId != null ? String(messageId) : null;
  const effectiveOccurredAt = occurredAt ?? new Date();
  const identifiers = [trackingKey, normalizedMessageId, messageUuid, recipientEmail].filter(Boolean);

  if (identifiers.length === 0) {
    logger.warn("email.delivery_log.event_missing_identifiers", {
      status,
      occurredAt: effectiveOccurredAt.toISOString()
    });
    return { matched: false as const };
  }

  try {
    const delivery = await prisma.emailDelivery.findFirst({
      where: {
        OR: [
          trackingKey ? { trackingKey } : undefined,
          normalizedMessageId ? { messageId: normalizedMessageId } : undefined,
          messageUuid ? { messageUuid } : undefined,
          recipientEmail ? { recipientEmail } : undefined
        ].filter((value): value is NonNullable<typeof value> => Boolean(value))
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!delivery) {
      logger.warn("email.delivery_log.event_unmatched", {
        status,
        trackingKey: trackingKey ?? null,
        messageId: normalizedMessageId,
        messageUuid: messageUuid ?? null,
        recipientEmail: recipientEmail ?? null,
        occurredAt: effectiveOccurredAt.toISOString()
      });
      return { matched: false as const };
    }

    const currentPriority = deliveryStatusPriority[delivery.status];
    const incomingPriority = deliveryStatusPriority[status];
    const nextStatus = incomingPriority >= currentPriority ? status : delivery.status;
    const nextOccurredAt =
      !delivery.lastEventAt || effectiveOccurredAt > delivery.lastEventAt
        ? effectiveOccurredAt
        : delivery.lastEventAt;

    await prisma.emailDelivery.update({
      where: {
        id: delivery.id
      },
      data: {
        status: nextStatus,
        queued: nextStatus === EmailDeliveryStatus.QUEUED,
        trackingKey: delivery.trackingKey ?? trackingKey ?? null,
        messageId: delivery.messageId ?? normalizedMessageId,
        messageUuid: delivery.messageUuid ?? messageUuid ?? null,
        lastEventAt: nextOccurredAt,
        note:
          note ??
          delivery.note ??
          (nextStatus === EmailDeliveryStatus.FAILED ? "Mail provider reported a failure." : null)
      }
    });

    return { matched: true as const, id: delivery.id, status: nextStatus };
  } catch (error) {
    logger.error("email.delivery_log.event_persist_failed", {
      status,
      trackingKey: trackingKey ?? null,
      messageId: normalizedMessageId,
      messageUuid: messageUuid ?? null,
      recipientEmail: recipientEmail ?? null,
      occurredAt: effectiveOccurredAt.toISOString(),
      note: note ?? null,
      error
    });
    return { matched: false as const };
  }
}

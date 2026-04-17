import { EmailDeliveryStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/observability/logger";
import { updateEmailDeliveryStatus } from "@/lib/services/email-delivery-log";

type MailjetMessageRecord = Record<string, unknown>;

const syncableStatuses: EmailDeliveryStatus[] = [
  EmailDeliveryStatus.QUEUED,
  EmailDeliveryStatus.DELIVERED,
  EmailDeliveryStatus.OPENED
];

function countMetric(record: MailjetMessageRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function readString(record: MailjetMessageRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function parseMailjetTimestamp(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function mapMailjetRecordStatus(record: MailjetMessageRecord) {
  const clickCount = countMetric(record, "ClickCount", "ClicksCount", "ClickedCount");
  const openCount = countMetric(record, "OpenCount", "OpenedCount", "CountOpen");
  const blockedCount = countMetric(record, "BlockedCount");
  const bounceCount = countMetric(record, "BounceCount", "BouncedCount");
  const spamCount = countMetric(record, "SpamCount");
  const unsubCount = countMetric(record, "UnsubCount", "UnsubscribedCount");

  if (clickCount > 0) {
    return EmailDeliveryStatus.CLICKED;
  }

  if (openCount > 0) {
    return EmailDeliveryStatus.OPENED;
  }

  if (spamCount > 0) {
    return EmailDeliveryStatus.SPAM;
  }

  if (unsubCount > 0) {
    return EmailDeliveryStatus.UNSUBSCRIBED;
  }

  if (blockedCount > 0) {
    return EmailDeliveryStatus.BLOCKED;
  }

  if (bounceCount > 0) {
    return EmailDeliveryStatus.BOUNCED;
  }

  const rawStatus = readString(record, "Status", "status", "State", "state", "MessageState", "messageState")
    ?.toLowerCase()
    .replaceAll(" ", "_");

  switch (rawStatus) {
    case "delivered":
      return EmailDeliveryStatus.DELIVERED;
    case "opened":
    case "open":
      return EmailDeliveryStatus.OPENED;
    case "clicked":
    case "click":
      return EmailDeliveryStatus.CLICKED;
    case "blocked":
    case "preblocked":
      return EmailDeliveryStatus.BLOCKED;
    case "bounce":
    case "bounced":
    case "soft_bounce":
    case "hard_bounce":
      return EmailDeliveryStatus.BOUNCED;
    case "spam":
      return EmailDeliveryStatus.SPAM;
    case "unsub":
    case "unsubscribed":
      return EmailDeliveryStatus.UNSUBSCRIBED;
    case "typofix":
      return EmailDeliveryStatus.TYPOFIX;
    case "queued":
    case "retrying":
    case "sent":
      return EmailDeliveryStatus.QUEUED;
    case "failed":
    case "error":
      return EmailDeliveryStatus.FAILED;
    default:
      return null;
  }
}

async function fetchMailjetMessage(messageId: string) {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  const baseUrl = process.env.MAILJET_API_BASE_URL ?? "https://api.mailjet.com";

  if (!apiKey || !apiSecret) {
    throw new Error("Mailjet API credentials are missing.");
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v3/REST/message/${encodeURIComponent(messageId)}`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });

  if (response.status === 404) {
    return null;
  }

  const body = (await response.json().catch(() => null)) as
    | {
        Data?: MailjetMessageRecord[];
        ErrorMessage?: string;
        StatusCode?: number;
      }
    | null;

  if (!response.ok) {
    throw new Error(body?.ErrorMessage ?? `Mailjet status lookup failed with status ${response.status}.`);
  }

  return body?.Data?.[0] ?? null;
}

export async function syncRecentEmailDeliveryStatuses() {
  if ((process.env.MAIL_PROVIDER ?? "console") !== "mailjet") {
    return {
      checked: 0,
      updated: 0,
      skipped: 0
    };
  }

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7);
  const deliveries = await prisma.emailDelivery.findMany({
    where: {
      provider: "mailjet",
      messageId: {
        not: null
      },
      createdAt: {
        gte: since
      },
      status: {
        in: syncableStatuses
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 25
  });

  let updated = 0;
  let skipped = 0;

  await Promise.all(
    deliveries.map(async (delivery) => {
      try {
        const message = await fetchMailjetMessage(delivery.messageId!);

        if (!message) {
          skipped += 1;
          return;
        }

        const nextStatus = mapMailjetRecordStatus(message);

        if (!nextStatus) {
          skipped += 1;
          logger.warn("mailjet.delivery_sync.unknown_status_shape", {
            messageId: delivery.messageId,
            deliveryId: delivery.id,
            rawStatus: readString(message, "Status", "status", "State", "state", "MessageState", "messageState")
          });
          return;
        }

        const result = await updateEmailDeliveryStatus({
          status: nextStatus,
          messageId: delivery.messageId,
          messageUuid: readString(message, "MessageUUID", "MessageUuid"),
          recipientEmail: readString(message, "Recipient", "Email", "ContactEmail"),
          occurredAt:
            parseMailjetTimestamp(message.LastActivityAt) ??
            parseMailjetTimestamp(message.ArrivedAt) ??
            parseMailjetTimestamp(message.CreatedAt),
          note:
            readString(message, "ErrorMessage", "Error", "ErrorRelatedTo") ??
            readString(message, "BlockedReason", "BounceReason")
        });

        if (result.matched && result.status !== delivery.status) {
          updated += 1;
        }
      } catch (error) {
        skipped += 1;
        logger.error("mailjet.delivery_sync.lookup_failed", {
          deliveryId: delivery.id,
          messageId: delivery.messageId,
          error
        });
      }
    })
  );

  return {
    checked: deliveries.length,
    updated,
    skipped
  };
}

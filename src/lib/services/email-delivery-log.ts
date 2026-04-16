import { EmailDeliveryType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type DeliveryResult = {
  queued: boolean;
  provider: string;
  note?: string | null;
  messageId?: number | string | null;
  messageUuid?: string | null;
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
};

export async function recordEmailDelivery({
  type,
  recipientEmail,
  subject,
  result,
  actorUserId,
  userId,
  orderId,
  templateId
}: RecordEmailDeliveryInput) {
  await prisma.emailDelivery.create({
    data: {
      type,
      actorUserId: actorUserId ?? null,
      userId: userId ?? null,
      orderId: orderId ?? null,
      templateId: templateId ?? null,
      recipientEmail,
      subject,
      provider: result.provider,
      queued: result.queued,
      note: result.note ?? null,
      messageId: result.messageId != null ? String(result.messageId) : null,
      messageUuid: result.messageUuid ?? null
    }
  });
}

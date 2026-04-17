import { EmailDeliveryStatus } from "@prisma/client";
import { z } from "zod";
import { apiErrorResponse, apiServerErrorResponse } from "@/lib/http/errors";
import { getRequestLogContext, logger } from "@/lib/observability/logger";
import { updateEmailDeliveryStatus } from "@/lib/services/email-delivery-log";

const mailjetEventSchema = z.object({
  event: z.string().min(1),
  time: z.coerce.number().int().nonnegative(),
  email: z.string().optional(),
  original_address: z.string().optional(),
  new_address: z.string().optional(),
  error: z.string().optional(),
  error_related_to: z.string().optional(),
  blocked: z.coerce.boolean().optional(),
  MessageID: z.union([z.string(), z.number()]).optional(),
  MessageUUID: z.string().optional(),
  CustomID: z.string().optional(),
  Payload: z.string().optional()
});

function isAuthorized(request: Request) {
  const expected = process.env.MAILJET_WEBHOOK_BASIC_AUTH?.trim();

  if (!expected) {
    return true;
  }

  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const encoded = authorization.slice("Basic ".length).trim();
  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  return decoded === expected;
}

function parsePayloadTrackingKey(payload: string | undefined) {
  if (!payload) {
    return null;
  }

  try {
    const parsed = JSON.parse(payload) as { trackingKey?: unknown };
    return typeof parsed.trackingKey === "string" && parsed.trackingKey.length > 0 ? parsed.trackingKey : null;
  } catch {
    return null;
  }
}

function mapMailjetEventToStatus(event: string, blocked?: boolean) {
  switch (event.toLowerCase()) {
    case "sent":
    case "delivered":
      return EmailDeliveryStatus.DELIVERED;
    case "open":
      return EmailDeliveryStatus.OPENED;
    case "click":
      return EmailDeliveryStatus.CLICKED;
    case "bounce":
      return blocked ? EmailDeliveryStatus.BLOCKED : EmailDeliveryStatus.BOUNCED;
    case "blocked":
      return EmailDeliveryStatus.BLOCKED;
    case "spam":
      return EmailDeliveryStatus.SPAM;
    case "unsub":
      return EmailDeliveryStatus.UNSUBSCRIBED;
    case "typofix":
      return EmailDeliveryStatus.TYPOFIX;
    default:
      return null;
  }
}

function buildEventNote(event: z.infer<typeof mailjetEventSchema>) {
  if (event.event.toLowerCase() === "typofix") {
    return event.original_address && event.new_address
      ? `Recipient corrected from ${event.original_address} to ${event.new_address}.`
      : "Mailjet reported an address correction.";
  }

  if (event.error_related_to || event.error) {
    return [event.error_related_to, event.error].filter(Boolean).join(": ");
  }

  return null;
}

export async function POST(request: Request) {
  const requestContext = getRequestLogContext(request);

  if (!isAuthorized(request)) {
    logger.warn("mailjet.webhook.unauthorized", requestContext);
    return apiErrorResponse("Unauthorized.", 401);
  }

  try {
    const rawBody = (await request.json().catch(() => null)) as unknown;
    const rawEvents = Array.isArray(rawBody) ? rawBody : [rawBody];
    const parsedEvents = z.array(mailjetEventSchema).safeParse(rawEvents);

    if (!parsedEvents.success) {
      logger.warn("mailjet.webhook.invalid_payload", {
        ...requestContext,
        issues: parsedEvents.error.flatten()
      });
      return apiErrorResponse("Invalid Mailjet webhook payload.", 400, parsedEvents.error.flatten());
    }

    let processed = 0;

    for (const event of parsedEvents.data) {
      const status = mapMailjetEventToStatus(event.event, event.blocked);

      if (!status) {
        logger.info("mailjet.webhook.ignored_event", {
          ...requestContext,
          event: event.event
        });
        continue;
      }

      const matchedEmail =
        status === EmailDeliveryStatus.TYPOFIX ? event.original_address ?? event.email ?? null : event.email ?? null;

      const result = await updateEmailDeliveryStatus({
        status,
        trackingKey: event.CustomID ?? parsePayloadTrackingKey(event.Payload),
        messageId: event.MessageID,
        messageUuid: event.MessageUUID,
        recipientEmail: matchedEmail,
        occurredAt: new Date(event.time * 1000),
        note: buildEventNote(event)
      });

      logger.info("mailjet.webhook.event_processed", {
        ...requestContext,
        event: event.event,
        status,
        matched: result.matched,
        trackingKey: event.CustomID ?? parsePayloadTrackingKey(event.Payload),
        messageId: event.MessageID != null ? String(event.MessageID) : null,
        messageUuid: event.MessageUUID ?? null,
        recipientEmail: matchedEmail
      });

      processed += 1;
    }

    return Response.json({ ok: true, processed });
  } catch (error) {
    return apiServerErrorResponse(request, "mailjet.webhook.failed", error);
  }
}

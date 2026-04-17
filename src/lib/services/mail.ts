import { logger } from "@/lib/observability/logger";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(payload: EmailPayload) {
  const provider = process.env.MAIL_PROVIDER ?? "console";

  if (provider === "console") {
    logger.info("mail.send", {
      provider,
      to: payload.to,
      subject: payload.subject
    });
    return { queued: true, provider };
  }

  if (provider === "mailjet") {
    const apiKey = process.env.MAILJET_API_KEY;
    const apiSecret = process.env.MAILJET_API_SECRET;
    const from = process.env.MAIL_FROM;
    const baseUrl = process.env.MAILJET_API_BASE_URL ?? "https://api.mailjet.com";

    if (!apiKey || !apiSecret || !from) {
      return {
        queued: false,
        provider,
        note: "Mailjet environment variables are missing."
      };
    }

    try {
      const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v3.1/send`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          Messages: [
            {
              From: {
                Email: from
              },
              To: [
                {
                  Email: payload.to
                }
              ],
              Subject: payload.subject,
              TextPart: payload.text,
              HTMLPart: payload.html
            }
          ]
        })
      });

      const body = (await response.json().catch(() => null)) as
        | {
            Messages?: Array<{
              Status?: string;
              To?: Array<{
                MessageUUID?: string;
                MessageID?: number;
              }>;
              Errors?: Array<{
                ErrorIdentifier?: string;
                ErrorMessage?: string;
              }>;
            }>;
          }
        | null;

      if (!response.ok) {
        logger.error("mailjet.send.error", {
          status: response.status,
          body
        });

        return {
          queued: false,
          provider,
          note:
            body?.Messages?.[0]?.Errors?.[0]?.ErrorMessage ??
            `Mailjet send failed with status ${response.status}.`
        };
      }

      const message = body?.Messages?.[0];

      return {
        queued: message?.Status === "success",
        provider,
        messageId: message?.To?.[0]?.MessageID ?? null,
        messageUuid: message?.To?.[0]?.MessageUUID ?? null
      };
    } catch (error) {
      logger.error("mailjet.send.exception", {
        error
      });

      return {
        queued: false,
        provider,
        note: error instanceof Error ? error.message : "Mailjet request failed."
      };
    }
  }

  logger.warn("mail.send.unsupported_provider", {
    provider
  });

  return {
    queued: false,
    provider,
    note: "Unsupported mail provider."
  };
}

export async function sendReceiptEmail(payload: EmailPayload) {
  return sendEmail(payload);
}

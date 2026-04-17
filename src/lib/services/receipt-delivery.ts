import { AuditAction, EmailDeliveryType, TemplateType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/observability/logger";
import { buildReceiptTemplateValues, renderTemplate } from "@/lib/receipt-template";
import { generateEmailTrackingKey, recordEmailDelivery } from "@/lib/services/email-delivery-log";
import { sendReceiptEmail } from "@/lib/services/mail";
import { getTaxDisplayLabels } from "@/lib/tax-display";

type DeliverOrderReceiptOptions = {
  orderId: string;
  actorUserId?: string;
  resend?: boolean;
};

export async function deliverOrderReceipt({
  orderId,
  actorUserId,
  resend = false
}: DeliverOrderReceiptOptions) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
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

  if (!order || !order.customerEmail) {
    return {
      ok: false as const,
      status: 404,
      error: "Order or customer email not found."
    };
  }

  const template =
    (await prisma.emailTemplate.findFirst({
      where: {
        countryId: order.countryId,
        type: TemplateType.RECEIPT,
        languageCode: order.cashier.preferredLanguage ?? order.country.defaultLanguage,
        isActive: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    })) ??
    (await prisma.emailTemplate.findFirst({
      where: {
        countryId: order.countryId,
        type: TemplateType.RECEIPT,
        isActive: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    })) ??
    null;

  if (!template) {
    return {
      ok: false as const,
      status: 404,
      error: "No active receipt template found."
    };
  }

  const locale = order.country.defaultLocale || "en-US";
  const labels = getTaxDisplayLabels(order.country.code, order.country.priceIncludesTax);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: order.currencyCode
    }).format(amount);

  const templateValues = buildReceiptTemplateValues({
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    orderNumber: order.orderNumber,
    orderDate: order.createdAt.toLocaleString(locale),
    orderSubtotal: formatCurrency(Number(order.subtotalAmount)),
    orderTax: formatCurrency(Number(order.taxAmount)),
    orderTotal: formatCurrency(Number(order.totalAmount)),
    orderSubtotalLabel: labels.subtotalLabel,
    orderTaxLabel: labels.taxLabel,
    lineTaxLabel: labels.lineTaxLabel,
    currencyCode: order.currencyCode,
    countryCode: order.country.code,
    countryName: order.country.name,
    paymentMethodNote: order.paymentMethodNote,
    receiptFooter: order.country.receiptFooter,
    legalLabel: order.country.legalLabel,
    lineItems: order.lineItems.map((line) => ({
      itemName: line.itemNameSnapshot,
      sku: line.skuSnapshot,
      quantity: line.quantity,
      unitPrice: formatCurrency(Number(line.unitPrice)),
      taxAmount: formatCurrency(Number(line.taxAmount)),
      lineTotal: formatCurrency(Number(line.lineTotal))
    }))
  });

  const html = renderTemplate(template.htmlBody, templateValues);
  const text = renderTemplate(template.textBody, templateValues);
  const trackingKey = generateEmailTrackingKey();

  logger.info("receipt.send.attempt", {
    orderId: order.id,
    orderNumber: order.orderNumber,
    to: order.customerEmail,
    provider: process.env.MAIL_PROVIDER ?? "console",
    resend
  });

  const result = await sendReceiptEmail({
    to: order.customerEmail,
    subject: template.subject,
    html,
    text,
    trackingKey
  });

  logger.info("receipt.send.result", {
    orderId: order.id,
    orderNumber: order.orderNumber,
    to: order.customerEmail,
    resend,
    queued: result.queued,
    provider: result.provider,
    note: "note" in result ? result.note : null,
    messageId: "messageId" in result ? result.messageId : null,
    messageUuid: "messageUuid" in result ? result.messageUuid : null
  });

  await recordEmailDelivery({
    type: EmailDeliveryType.RECEIPT,
    recipientEmail: order.customerEmail,
    subject: template.subject,
    result,
    trackingKey,
    actorUserId: actorUserId ?? order.cashierUserId,
    userId: order.cashierUserId,
    orderId: order.id,
    templateId: template.id
  });

  if (!result.queued) {
    return {
      ok: false as const,
      status: 502,
      error: "Receipt email failed to send.",
      result
    };
  }

  const timestamp = new Date();

  await prisma.$transaction([
    prisma.order.update({
      where: {
        id: order.id
      },
      data: resend
        ? {
            receiptResentAt: timestamp
          }
        : {
            receiptSentAt: timestamp
          }
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: actorUserId ?? order.cashierUserId,
        entityType: "Order",
        entityId: order.id,
        action: resend ? AuditAction.RESEND_RECEIPT : AuditAction.CHECKOUT,
        details: {
          to: order.customerEmail,
          provider: result.provider,
          resend
        }
      }
    })
  ]);

  return {
    ok: true as const,
    result
  };
}

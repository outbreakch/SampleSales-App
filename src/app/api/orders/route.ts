import { PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { deliverOrderReceipt } from "@/lib/services/receipt-delivery";
import { resolveActiveTaxRate } from "@/lib/tax";
import { checkoutSchema } from "@/lib/validation/order";

export async function GET() {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const orders = await prisma.order.findMany({
    where: {
      cashierUserId: session.id
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 25,
    include: {
      country: true
    }
  });

  return NextResponse.json({
    orders: orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      total: Number(order.totalAmount),
      currencyCode: order.currencyCode,
      countryCode: order.country.code,
      createdAt: order.createdAt.toISOString()
    }))
  });
}

export async function POST(request: Request) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      defaultCountry: true
    }
  });

  if (!user?.defaultCountry) {
    return NextResponse.json({ error: "User preferences are incomplete." }, { status: 400 });
  }

  const payload = checkoutSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const country = user.defaultCountry;

  if (!country) {
    return NextResponse.json({ error: "Unsupported country." }, { status: 400 });
  }

  const itemIds = payload.data.items.map((item) => item.itemId);
  const catalogItems = await prisma.catalogItem.findMany({
    where: {
      id: {
        in: itemIds
      },
      isArchived: false,
      countries: {
        some: {
          countryId: country.id,
          isAvailable: true
        }
      }
    },
    include: {
      countries: {
        where: {
          countryId: country.id
        }
      }
    }
  });

  if (catalogItems.length !== itemIds.length) {
    return NextResponse.json({ error: "One or more catalog items were not found." }, { status: 400 });
  }

  const taxRate = await resolveActiveTaxRate(country.code, "STANDARD");
  const catalogById = new Map(catalogItems.map((item) => [item.id, item]));

  if (payload.data.items.some((item) => !catalogById.has(item.itemId))) {
    return NextResponse.json({ error: "One or more catalog items are unavailable in the selected market." }, { status: 400 });
  }

  const lineItems = payload.data.items.map((item) => {
    const catalogItem = catalogById.get(item.itemId)!;

    const countryPricing = catalogItem.countries[0];
    const unitPrice = Number(countryPricing?.overridePrice ?? catalogItem.basePrice);
    const lineSubtotal = Number((unitPrice * item.quantity).toFixed(2));
    const lineTax = country.priceIncludesTax
      ? Number((lineSubtotal - lineSubtotal / (1 + taxRate)).toFixed(2))
      : Number((lineSubtotal * taxRate).toFixed(2));
    const lineTotal = country.priceIncludesTax ? lineSubtotal : Number((lineSubtotal + lineTax).toFixed(2));

    return {
      itemId: catalogItem.id,
      sku: catalogItem.sku,
      name: catalogItem.name,
      quantity: item.quantity,
      unitPrice,
      lineSubtotal,
      lineTax,
      lineTotal
    };
  });

  const subtotal = country.priceIncludesTax
    ? Number((lineItems.reduce((sum, item) => sum + (item.lineSubtotal - item.lineTax), 0)).toFixed(2))
    : Number((lineItems.reduce((sum, item) => sum + item.lineSubtotal, 0)).toFixed(2));
  const tax = Number((lineItems.reduce((sum, item) => sum + item.lineTax, 0)).toFixed(2));
  const total = Number((lineItems.reduce((sum, item) => sum + item.lineTotal, 0)).toFixed(2));
  const orderNumber = `SS-${Date.now()}`;

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        countryId: country.id,
        cashierUserId: session.id,
        customerName: payload.data.customerName || null,
        customerEmail: payload.data.customerEmail || null,
        customerPhone: payload.data.customerPhone || null,
        subtotalAmount: subtotal.toFixed(2),
        taxAmount: tax.toFixed(2),
        totalAmount: total.toFixed(2),
        currencyCode: country.currencyCode,
        paymentStatus: PaymentStatus.CONFIRMED,
        paymentMethodNote: payload.data.paymentMethodNote,
        paymentConfirmedAt: new Date()
      }
    });

    await tx.orderLineItem.createMany({
      data: lineItems.map((item) => ({
        orderId: createdOrder.id,
        catalogItemId: item.itemId,
        itemNameSnapshot: item.name,
        skuSnapshot: item.sku,
        unitPrice: item.unitPrice.toFixed(2),
        quantity: item.quantity,
        taxRateSnapshot: (taxRate * 100).toFixed(2),
        taxAmount: item.lineTax.toFixed(2),
        lineTotal: item.lineTotal.toFixed(2)
      }))
    });

    return createdOrder;
  });

  let receiptResult:
    | {
        queued: boolean;
        provider: string;
        note?: string;
        messageId?: number | null;
        messageUuid?: string | null;
      }
    | null = null;

  if (payload.data.customerEmail) {
    const delivery = await deliverOrderReceipt({
      orderId: order.id,
      actorUserId: session.id,
      resend: false
    });

    if (!delivery.ok) {
      receiptResult = "result" in delivery ? delivery.result : { queued: false, provider: "unknown", note: delivery.error };
      console.error("receipt.send.checkout_failed", {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error: delivery.error,
        result: receiptResult
      });
    } else {
      receiptResult = delivery.result;
    }
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      subtotal,
      tax,
      total,
      currency: country.currencyCode,
      paymentStatus: order.paymentStatus,
      receiptQueued: receiptResult?.queued ?? false,
      receiptResult
    }
  });
}

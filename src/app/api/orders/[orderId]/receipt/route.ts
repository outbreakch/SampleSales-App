import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { ORDER_SUPPORT_ROLES, hasAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { deliverOrderReceipt } from "@/lib/services/receipt-delivery";

export async function POST(_: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    },
    select: {
      cashierUserId: true
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  const isOwner = order.cashierUserId === session.id;
  const isAdmin = hasAnyRole(session, ORDER_SUPPORT_ROLES);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const delivery = await deliverOrderReceipt({
    orderId,
    actorUserId: session.id,
    resend: true
  });

  if (!delivery.ok) {
    return NextResponse.json(
      { error: delivery.error, result: "result" in delivery ? delivery.result : null },
      { status: delivery.status }
    );
  }

  return NextResponse.json({ ok: true, result: delivery.result });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/auth/session";
import { ORDER_SUPPORT_ROLES, hasAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

const updateOrderSchema = z.object({
  customerEmail: z.string().trim().email()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = updateOrderSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: payload.error.flatten() }, { status: 400 });
  }

  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: {
      id: orderId
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

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      customerEmail: payload.data.customerEmail
    }
  });

  return NextResponse.json({
    ok: true,
    order: {
      id: updatedOrder.id,
      customerEmail: updatedOrder.customerEmail
    }
  });
}

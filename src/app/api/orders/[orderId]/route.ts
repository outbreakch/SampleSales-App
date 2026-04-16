import { NextResponse } from "next/server";
import { z } from "zod";
import { readSession } from "@/lib/auth/session";
import { ORDER_SUPPORT_ROLES, hasAnyRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { emailAddressSchema } from "@/lib/validation/primitives";
import { validationErrorResponse } from "@/lib/validation/http";
import { resourceIdParamSchema } from "@/lib/validation/params";

const updateOrderSchema = z.object({
  customerEmail: emailAddressSchema
});

export async function PATCH(request: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const payload = updateOrderSchema.safeParse(await request.json());

  if (!payload.success) {
    return validationErrorResponse(payload.error);
  }

  const parsedParams = resourceIdParamSchema.safeParse((await params).orderId);

  if (!parsedParams.success) {
    return validationErrorResponse(parsedParams.error, "Invalid order id.");
  }

  const orderId = parsedParams.data;
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

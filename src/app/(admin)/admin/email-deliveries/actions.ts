"use server";

import { revalidatePath } from "next/cache";
import { ORDER_VIEW_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { syncRecentEmailDeliveryStatuses } from "@/lib/services/mailjet-delivery-sync";

export async function refreshEmailDeliveryStatusesAction() {
  await requireAnyRole(ORDER_VIEW_ROLES);
  await syncRecentEmailDeliveryStatuses();
  revalidatePath("/admin/email-deliveries");
}

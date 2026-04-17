"use server";

import { revalidatePath } from "next/cache";
import { ORDER_VIEW_ROLES, requireAnyRole } from "@/lib/auth/rbac";
import { logger } from "@/lib/observability/logger";
import { syncRecentEmailDeliveryStatuses } from "@/lib/services/mailjet-delivery-sync";

export async function refreshEmailDeliveryStatusesAction() {
  await requireAnyRole(ORDER_VIEW_ROLES);
  const result = await syncRecentEmailDeliveryStatuses();
  logger.info("email.deliveries.refresh_action.completed", result);
  revalidatePath("/admin/email-deliveries");
}

import { redirect } from "next/navigation";
import { readSession } from "@/lib/auth/session";
import type { Role, SessionUser } from "@/lib/types";

export const ADMIN_SECTION_ROLES: Role[] = ["FULL_ADMIN", "CATALOG_ADMIN", "FINANCE", "OPERATIONS"];
export const CATALOG_ROLES: Role[] = ["FULL_ADMIN", "CATALOG_ADMIN", "OPERATIONS"];
export const ORDER_VIEW_ROLES: Role[] = ["FULL_ADMIN", "FINANCE", "OPERATIONS"];
export const ORDER_SUPPORT_ROLES: Role[] = ["FULL_ADMIN", "OPERATIONS"];
export const SETTINGS_ROLES: Role[] = ["FULL_ADMIN", "OPERATIONS"];
export const USER_MANAGEMENT_ROLES: Role[] = ["FULL_ADMIN"];

export async function requireUser() {
  const session = await readSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export function hasAnyRole(user: Pick<SessionUser, "roles"> | null | undefined, roles: Role[]) {
  return Boolean(user?.roles.some((role) => roles.includes(role)));
}

export async function requireRole(role: Role) {
  const session = await requireUser();

  if (!session.roles.includes(role)) {
    redirect("/catalog");
  }

  return session;
}

export async function requireAnyRole(roles: Role[]) {
  const session = await requireUser();

  if (!hasAnyRole(session, roles)) {
    redirect("/catalog");
  }

  return session;
}

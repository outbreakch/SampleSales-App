import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/rbac";

export default async function CheckoutPage() {
  await requireUser();
  redirect("/catalog");
}

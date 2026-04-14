import { AppShell } from "@/components/layout/app-shell";
import { CheckoutPanel } from "@/components/pos/checkout-panel";
import { requireUser } from "@/lib/auth/rbac";

export default async function CheckoutPage() {
  await requireUser();

  return (
    <AppShell>
      <CheckoutPanel />
    </AppShell>
  );
}

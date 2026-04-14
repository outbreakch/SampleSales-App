import { AppShell } from "@/components/layout/app-shell";
import { PosWorkflow } from "@/components/pos/pos-workflow";
import { requireUser } from "@/lib/auth/rbac";

export default async function CatalogPage() {
  await requireUser();

  return (
    <AppShell>
      <PosWorkflow />
    </AppShell>
  );
}

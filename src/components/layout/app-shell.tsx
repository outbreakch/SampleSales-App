import type { Route } from "next";
import Link from "next/link";
import { readSession } from "@/lib/auth/session";
import { HeaderControls } from "@/components/layout/header-controls";
import { ADMIN_SECTION_ROLES, hasAnyRole } from "@/lib/auth/rbac";
import { getStaffCopy } from "@/lib/i18n";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const session = await readSession();
  const copy = getStaffCopy(session?.preferredLanguage);
  const isAdmin = hasAnyRole(session, ADMIN_SECTION_ROLES);
  const appEnvironment = (process.env.APP_ENV ?? "production").trim().toLowerCase();
  const showEnvironmentBadge = !["production", "prod", "live"].includes(appEnvironment);
  const environmentLabel = appEnvironment.toUpperCase();
  const baseNav: Array<{ href: Route; label: string }> = [
    { href: "/catalog", label: copy.navSell },
    { href: "/orders", label: copy.navOrders }
  ];
  const adminNav: Array<{ href: Route; label: string }> = isAdmin ? [{ href: "/admin", label: copy.navAdmin }] : [];
  const nav: Array<{ href: Route; label: string }> = [...baseNav, ...adminNav];

  return (
    <div className="min-h-screen bg-mist">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-black/5 bg-white/88 backdrop-blur">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/catalog" className="flex min-w-0 items-center gap-3">
            <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm sm:h-11 sm:w-11">
              <span className="brand-mark-letter font-serif text-[1.55rem] font-bold leading-none text-ink sm:text-[1.7rem]">
                B
              </span>
            </div>
            <div className="hidden min-w-0 items-center gap-3 sm:flex">
              <p className="truncate text-sm uppercase tracking-[0.28em] text-stone">{copy.appBrandLabel}</p>
              {showEnvironmentBadge ? (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-amber-900">
                  {environmentLabel}
                </span>
              ) : null}
            </div>
          </Link>
          <HeaderControls language={session?.preferredLanguage} nav={nav} user={session} />
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 pb-6 pt-24 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

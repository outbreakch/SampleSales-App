"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getStaffCopy } from "@/lib/i18n";
import type { SessionUser } from "@/lib/types";

type NavItem = {
  href: string;
  label: string;
};

export function HeaderControls({
  language,
  nav,
  user
}: {
  language?: string | null;
  nav: NavItem[];
  user: SessionUser | null;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = getStaffCopy(language);

  return (
    <>
      <div className="hidden items-center gap-3 lg:flex">
        <nav className="flex items-center gap-2">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink transition hover:bg-sand"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle compact language={language} />
        {user ? <UserMenu language={language} user={user} /> : <div className="text-right text-sm text-stone">{copy.guest}</div>}
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <ThemeToggle compact language={language} />
        {user ? (
          <div onClick={() => setMobileOpen(false)}>
            <UserMenu compact language={language} user={user} />
          </div>
        ) : null}
        <button
          aria-label={mobileOpen ? copy.closeNavigation : copy.openNavigation}
          className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-ink transition hover:bg-sand/40"
          onClick={() => setMobileOpen((current) => !current)}
          type="button"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="absolute inset-x-4 top-[calc(100%+0.75rem)] z-50 rounded-[28px] border border-black/10 bg-white p-3 shadow-panel lg:hidden">
          <nav className="flex flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-ink transition hover:bg-sand/40"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user ? (
              <Link
                href="/login"
                className="rounded-2xl px-4 py-3 text-sm font-medium text-ink transition hover:bg-sand/40"
                onClick={() => setMobileOpen(false)}
              >
                {copy.login}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </>
  );
}

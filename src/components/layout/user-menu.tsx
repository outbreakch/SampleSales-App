"use client";

import { ChevronDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getStaffCopy } from "@/lib/i18n";
import type { SessionUser } from "@/lib/types";

export function UserMenu({
  user,
  compact = false,
  language
}: {
  user: SessionUser;
  compact?: boolean;
  language?: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const copy = getStaffCopy(language ?? user.preferredLanguage);
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST"
    });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2 text-left transition hover:bg-sand/40"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
          {initials || "U"}
        </div>
        <div className={`min-w-0 ${compact ? "hidden" : "hidden sm:block"}`}>
          <p className="truncate text-sm font-medium text-ink">{user.name}</p>
          <p className="truncate text-xs text-stone">{user.email}</p>
        </div>
        {!compact ? <ChevronDown className="size-4 text-stone" /> : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-56 rounded-[24px] border border-black/10 bg-white p-2 shadow-panel">
          <Link
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-ink transition hover:bg-sand/40"
            href="/settings"
            onClick={() => setOpen(false)}
          >
            <Settings className="size-4" />
            <span>{copy.settings}</span>
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-danger transition hover:bg-danger/5"
            onClick={logout}
            type="button"
          >
            <LogOut className="size-4" />
            <span>{copy.logout}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

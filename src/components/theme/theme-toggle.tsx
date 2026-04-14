"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { getStaffCopy } from "@/lib/i18n";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "sample-sale-theme";

function applyTheme(nextTheme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("theme-dark", nextTheme === "dark");
  root.dataset.theme = nextTheme;
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

export function ThemeToggle({
  language,
  compact = false
}: {
  language?: string | null;
  compact?: boolean;
}) {
  const copy = getStaffCopy(language);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    setTheme(currentTheme);
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      aria-label={isDark ? copy.lightMode : copy.darkMode}
      className={`flex items-center gap-3 rounded-full border border-black/10 bg-white px-3 py-2 text-left transition hover:bg-sand/40 ${
        compact ? "size-11 justify-center p-0" : ""
      }`}
      onClick={() => {
        const nextTheme = isDark ? "light" : "dark";
        setTheme(nextTheme);
        applyTheme(nextTheme);
      }}
      type="button"
    >
      {isDark ? <Sun className="size-4 text-ink" /> : <Moon className="size-4 text-ink" />}
      {!compact ? (
        <span className="text-sm font-medium text-ink">{isDark ? copy.lightMode : copy.darkMode}</span>
      ) : null}
    </button>
  );
}

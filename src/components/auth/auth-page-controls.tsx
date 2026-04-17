"use client";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";

type AuthPageControlsProps = {
  language: StaffLocale;
  onLanguageChange: (language: StaffLocale) => void;
};

export function AuthPageControls({ language, onLanguageChange }: AuthPageControlsProps) {
  const copy = getStaffCopy(language);

  return (
    <div className="fixed right-4 top-4 z-30 flex items-center gap-3">
      <label className="sr-only" htmlFor="auth-language">
        {copy.languageLabel}
      </label>
      <select
        id="auth-language"
        className="min-w-[11.5rem] rounded-full border border-black/10 bg-white px-4 py-2.5 text-sm text-ink shadow-sm outline-none transition focus:border-black/20"
        value={language}
        onChange={(event) => onLanguageChange(normalizeStaffLocale(event.target.value))}
      >
        <option value="en">English</option>
        <option value="fr-CA">Francais (Canada)</option>
      </select>
      <ThemeToggle compact language={language} />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStaffCopy, normalizeStaffLocale, type StaffLocale } from "@/lib/i18n";
import type { CountryConfig } from "@/lib/types";

function getDefaultPreferences() {
  const preferredLanguage = normalizeStaffLocale(
    typeof window === "undefined" ? undefined : window.navigator.language
  );

  return {
    countryCode: "CA" as CountryConfig["code"],
    preferredLanguage
  };
}

export function PreferencesSetupModal({
  countries,
  onSaved
}: {
  countries: CountryConfig[];
  onSaved: (preferences: {
    countryCode: CountryConfig["code"];
    preferredLanguage: StaffLocale;
  }) => void;
}) {
  const router = useRouter();
  const defaults = getDefaultPreferences();
  const [countryCode, setCountryCode] = useState<CountryConfig["code"]>(defaults.countryCode);
  const [preferredLanguage, setPreferredLanguage] = useState(defaults.preferredLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const copy = getStaffCopy(preferredLanguage);

  async function savePreferences() {
    setIsSaving(true);
    setError("");

    const response = await fetch("/api/users/me/preferences", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        countryCode,
        preferredLanguage
      })
    });

    const payload = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(payload.error ?? copy.unableToSavePreferences);
      setIsSaving(false);
      return;
    }

    onSaved({
      countryCode,
      preferredLanguage
    });
    setIsSaving(false);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <Card className="w-full max-w-3xl overflow-hidden bg-white p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.95fr]">
          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.firstTimeSetup}</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{copy.setSellingPreferences}</h2>
            <p className="mt-3 text-sm text-stone">
              {copy.setupDescription}
            </p>
            <div className="mt-6 grid gap-4">
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">
                  {preferredLanguage === "fr-CA" ? "Pays" : "Country"}
                </label>
                <select
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                  value={countryCode}
                  onChange={(event) => setCountryCode(event.target.value as CountryConfig["code"])}
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.languageLabel}</label>
                <select
                  className="h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-ink outline-none focus:border-ink"
                  value={preferredLanguage}
                  onChange={(event) => setPreferredLanguage(event.target.value as StaffLocale)}
                >
                  <option value="en">English</option>
                  <option value="fr-CA">French (Canada)</option>
                </select>
              </div>
            </div>
            {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          </div>
          <div className="bg-ink p-6 text-white">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.appliedAutomatically}</p>
            <div className="mt-6 space-y-3 text-sm text-white/80">
              <p>{copy.appliedTaxes}</p>
              <p>{copy.appliedCurrency}</p>
              <p>{copy.appliedTemplates}</p>
              <p>{copy.appliedLanguage}</p>
            </div>
            <div className="mt-8">
              <Button className="w-full" disabled={isSaving} onClick={savePreferences} variant="success">
                {isSaving ? copy.saving : copy.savePreferences}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

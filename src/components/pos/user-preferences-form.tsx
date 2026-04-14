"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStaffCopy, normalizeStaffLocale } from "@/lib/i18n";
import type { CountryConfig } from "@/lib/types";

export function UserPreferencesForm({
  countries,
  initialValues
}: {
  countries: CountryConfig[];
  initialValues: {
    countryCode: CountryConfig["code"] | null;
    preferredLanguage: string | null;
  };
}) {
  const fallbackLanguage = normalizeStaffLocale(
    typeof window === "undefined" ? undefined : window.navigator.language
  );
  const [countryCode, setCountryCode] = useState<CountryConfig["code"]>(initialValues.countryCode ?? "CA");
  const [preferredLanguage, setPreferredLanguage] = useState(initialValues.preferredLanguage ?? fallbackLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const copy = getStaffCopy(preferredLanguage);

  async function save() {
    setIsSaving(true);
    setMessage("");
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

    setMessage(copy.preferencesSaved);
    setIsSaving(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <Card className="bg-white/96">
        <p className="text-xs uppercase tracking-[0.28em] text-stone">Profile context</p>
        <h3 className="mt-2 text-3xl font-semibold text-ink">{copy.defaultSellingContext}</h3>
        <p className="mt-3 text-sm leading-6 text-stone">
          {copy.defaultSellingContextDescription}
        </p>
        <div className="mt-6 space-y-3">
          {countries.map((country) => {
            const active = country.code === countryCode;

            return (
              <button
                key={country.code}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active ? "border-ink bg-sand/50" : "border-black/5 hover:bg-black/[0.02]"
                }`}
                onClick={() => setCountryCode(country.code)}
                type="button"
              >
                <p className="font-semibold text-ink">{country.name}</p>
                <p className="text-sm text-stone">
                  {country.code} · {country.currencyCode}
                </p>
              </button>
            );
          })}
        </div>
      </Card>
      <Card className="bg-white/96">
        <div className="grid gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-stone">Preferences</p>
            <h3 className="mt-2 text-3xl font-semibold text-ink">{countryCode} {copy.cashierSettings}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
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
                onChange={(event) => setPreferredLanguage(event.target.value)}
              >
                <option value="en">English</option>
                <option value="fr-CA">French (Canada)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isSaving} onClick={save} variant="success">
              {isSaving ? copy.saving : copy.saveSettings}
            </Button>
          </div>
          {message ? <p className="text-sm text-success">{message}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </Card>
    </div>
  );
}

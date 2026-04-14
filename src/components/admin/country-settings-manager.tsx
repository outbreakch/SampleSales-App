"use client";

import { Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy } from "@/lib/i18n";

type CountryItem = {
  code: "US" | "CA" | "AU";
  name: string;
  companyName: string | null;
  currencyCode: string;
  defaultLocale: string;
  defaultLanguage: string;
  priceIncludesTax: boolean;
  receiptFooter: string | null;
  legalLabel: string | null;
  isActive: boolean;
};

export function CountrySettingsManager({
  countries,
  language
}: {
  countries: CountryItem[];
  language?: string | null;
}) {
  const router = useRouter();
  const copy = getStaffCopy(language);
  const [selectedCode, setSelectedCode] = useState<CountryItem["code"]>(countries[0]?.code ?? "US");
  const [drafts, setDrafts] = useState<Record<string, CountryItem>>(
    Object.fromEntries(countries.map((country) => [country.code, { ...country }]))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedCountry = drafts[selectedCode] ?? drafts[countries[0]?.code ?? "US"];

  async function saveCountry() {
    if (!selectedCountry) {
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    const response = await fetch(`/api/admin/countries/${selectedCountry.code}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: selectedCountry.name,
        companyName: selectedCountry.companyName ?? "",
        currencyCode: selectedCountry.currencyCode,
        defaultLocale: selectedCountry.defaultLocale,
        defaultLanguage: selectedCountry.defaultLanguage,
        priceIncludesTax: selectedCountry.priceIncludesTax,
        receiptFooter: selectedCountry.receiptFooter ?? "",
        legalLabel: selectedCountry.legalLabel ?? "",
        isActive: selectedCountry.isActive
      })
    });

    const payload = (await response.json()) as { error?: string | { formErrors?: string[] } };

    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : copy.unableToSaveCountrySettings);
      setIsSaving(false);
      return;
    }

    setMessage(copy.countrySettingsSaved);
    setIsSaving(false);
    router.refresh();
  }

  if (!selectedCountry) {
    return <Card className="bg-white/96">{copy.noCountriesFound}</Card>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="bg-white/96">
        <p className="text-xs uppercase tracking-[0.28em] text-stone">{copy.countriesTitle}</p>
        <h2 className="mt-2 text-3xl font-semibold text-ink">{copy.countryConfiguration}</h2>
        <div className="mt-6 space-y-3">
          {countries.map((country) => {
            const active = country.code === selectedCode;

            return (
              <button
                key={country.code}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  active ? "border-ink bg-sand/50" : "border-black/5 hover:bg-black/[0.02]"
                }`}
                onClick={() => {
                  setSelectedCode(country.code);
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                <p className="font-semibold text-ink">{drafts[country.code]?.name ?? country.name}</p>
                <p className="text-sm text-stone">
                  {country.code} · {country.currencyCode}
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="bg-white/96">
        <div className="grid gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.selectedCountry}</p>
              <h3 className="mt-2 text-3xl font-semibold text-ink">{selectedCountry.code}</h3>
            </div>
            <div className="flex gap-2">
              <Button disabled={isSaving} onClick={saveCountry} variant="success">
                <Save className="mr-2 size-4" />
                {isSaving ? copy.saving : copy.saveChanges}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.countryName}</label>
              <Input
                value={selectedCountry.name}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      name: event.target.value
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.companyNameLabel}</label>
              <Input
                value={selectedCountry.companyName ?? ""}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      companyName: event.target.value
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.currency}</label>
              <Input
                value={selectedCountry.currencyCode}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      currencyCode: event.target.value.toUpperCase()
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.defaultLocaleLabel}</label>
              <Input
                value={selectedCountry.defaultLocale}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      defaultLocale: event.target.value
                    }
                  }))
                }
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.defaultLanguageLabel}</label>
              <Input
                value={selectedCountry.defaultLanguage}
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      defaultLanguage: event.target.value
                    }
                  }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 px-4 py-3 text-sm text-ink">
              <input
                checked={selectedCountry.priceIncludesTax}
                className="size-5 rounded"
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      priceIncludesTax: event.target.checked
                    }
                  }))
                }
                type="checkbox"
              />
              {copy.pricesIncludeTax}
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 px-4 py-3 text-sm text-ink">
              <input
                checked={selectedCountry.isActive}
                className="size-5 rounded"
                onChange={(event) =>
                  setDrafts((current) => ({
                    ...current,
                    [selectedCountry.code]: {
                      ...selectedCountry,
                      isActive: event.target.checked
                    }
                  }))
                }
                type="checkbox"
              />
              {copy.countryActive}
            </label>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.legalLabel}</label>
            <textarea
              className="min-h-28 w-full rounded-[24px] border border-black/10 px-4 py-4 text-sm outline-none focus:border-ink"
              value={selectedCountry.legalLabel ?? ""}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [selectedCountry.code]: {
                    ...selectedCountry,
                    legalLabel: event.target.value
                  }
                }))
              }
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.receiptFooter}</label>
            <textarea
              className="min-h-28 w-full rounded-[24px] border border-black/10 px-4 py-4 text-sm outline-none focus:border-ink"
              value={selectedCountry.receiptFooter ?? ""}
              onChange={(event) =>
                setDrafts((current) => ({
                  ...current,
                  [selectedCountry.code]: {
                    ...selectedCountry,
                    receiptFooter: event.target.value
                  }
                }))
              }
            />
          </div>

          {message ? <p className="text-sm text-success">{message}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>
      </Card>
    </div>
  );
}

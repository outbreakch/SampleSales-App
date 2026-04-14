"use client";

import { CheckCircle2, Circle, Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type CatalogCountry = {
  countryCode: "US" | "CA" | "AU";
  currencyCode: string;
  isAvailable: boolean;
  overridePrice: number | null;
};

const countryFlags: Record<CatalogCountry["countryCode"], string> = {
  US: "🇺🇸",
  CA: "🇨🇦",
  AU: "🇦🇺"
};

type CatalogItemRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  basePrice: number;
  taxCategory: string;
  isArchived: boolean;
  countries: CatalogCountry[];
};

type EditingItem = CatalogItemRow & {
  countries: CatalogCountry[];
};

export function CatalogManager({
  items,
  language
}: {
  items: CatalogItemRow[];
  language?: string | null;
}) {
  const router = useRouter();
  const copy = getStaffCopy(language);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function saveItem() {
    if (!editingItem) {
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await fetch(`/api/admin/catalog/${editingItem.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sku: editingItem.sku,
        name: editingItem.name,
        description: editingItem.description ?? "",
        basePrice: editingItem.basePrice,
        taxCategory: editingItem.taxCategory,
        isArchived: editingItem.isArchived,
        countries: editingItem.countries
      })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string | { formErrors?: string[] } };
      setError(typeof payload.error === "string" ? payload.error : copy.unableToSaveCatalogItem);
      setIsSaving(false);
      return;
    }

    setEditingItem(null);
    setIsSaving(false);
    router.refresh();
  }

  return (
    <>
      <Card className="overflow-hidden bg-white/96 p-0">
        <div className="hidden grid-cols-[120px_1.2fr_140px_180px_170px_120px_80px] gap-4 border-b border-black/5 px-6 py-4 text-xs uppercase tracking-[0.24em] text-stone xl:grid">
          <span>SKU</span>
          <span>{copy.nameLabel}</span>
          <span>{copy.basePriceLabel}</span>
          <span>{copy.taxCategoryLabel}</span>
          <span>{copy.marketsLabel}</span>
          <span>{copy.statusLabel}</span>
          <span></span>
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-8 text-sm text-stone">{copy.noCatalogItemsFound}</div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="border-t border-black/5 first:border-t-0 xl:border-t-0">
              <div className="space-y-4 px-5 py-5 xl:hidden">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{item.sku}</p>
                    <p className="mt-2 text-lg font-semibold text-ink">{item.name}</p>
                    {item.description ? <p className="mt-2 text-sm leading-6 text-stone">{item.description}</p> : null}
                  </div>
                  <button
                    className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
                    onClick={() => setEditingItem(structuredClone(item))}
                    type="button"
                  >
                    <Pencil className="size-4" />
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.basePriceLabel}</p>
                    <p className="mt-2 font-semibold text-ink">{formatCurrency(item.basePrice, "USD")}</p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.taxCategoryLabel}</p>
                    <p className="mt-2 font-semibold text-ink">{item.taxCategory}</p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.marketsLabel}</p>
                    <p className="mt-2 font-semibold text-ink">
                      {item.countries.filter((entry) => entry.isAvailable).map((entry) => entry.countryCode).join(", ") || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-black/5 bg-mist/70 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.statusLabel}</p>
                    <p className={`mt-2 font-semibold ${item.isArchived ? "text-stone" : "text-success"}`}>
                      {item.isArchived ? copy.archivedLabel : copy.activeLabel}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden grid-cols-[120px_1.2fr_140px_180px_170px_120px_80px] gap-4 px-6 py-5 text-sm xl:grid">
                <span className="font-medium text-ink">{item.sku}</span>
                <div>
                  <p className="text-ink">{item.name}</p>
                  {item.description ? <p className="mt-1 text-sm text-stone">{item.description}</p> : null}
                </div>
                <span className="text-ink">{formatCurrency(item.basePrice, "USD")}</span>
                <span className="text-stone">{item.taxCategory}</span>
                <span className="text-stone">
                  {item.countries.filter((entry) => entry.isAvailable).map((entry) => entry.countryCode).join(", ") || "—"}
                </span>
                <span className={item.isArchived ? "text-stone" : "text-success"}>
                  {item.isArchived ? copy.archivedLabel : copy.activeLabel}
                </span>
                <button
                  className="flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
                  onClick={() => setEditingItem(structuredClone(item))}
                  type="button"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </Card>

      {editingItem ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setEditingItem(null)}
        >
          <Card
            className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto bg-white p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label={copy.close}
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              onClick={() => setEditingItem(null)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <div className="grid gap-0 xl:grid-cols-[1fr_0.9fr]">
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.editCatalogItem}</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">{editingItem.name}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">SKU</label>
                    <Input
                      value={editingItem.sku}
                      onChange={(event) => setEditingItem({ ...editingItem, sku: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.nameLabel}</label>
                    <Input
                      value={editingItem.name}
                      onChange={(event) => setEditingItem({ ...editingItem, name: event.target.value })}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.descriptionLabel}</label>
                    <textarea
                      className="min-h-28 w-full rounded-[24px] border border-black/10 px-4 py-4 text-sm outline-none focus:border-ink"
                      value={editingItem.description ?? ""}
                      onChange={(event) => setEditingItem({ ...editingItem, description: event.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.basePriceLabel}</label>
                    <Input
                      min="0"
                      step="0.01"
                      type="number"
                      value={editingItem.basePrice}
                      onChange={(event) =>
                        setEditingItem({ ...editingItem, basePrice: Number(event.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-stone">{copy.taxCategoryLabel}</label>
                    <Input
                      value={editingItem.taxCategory}
                      onChange={(event) => setEditingItem({ ...editingItem, taxCategory: event.target.value })}
                    />
                  </div>
                </div>
                <label className="mt-6 flex items-center gap-3 rounded-2xl border border-black/10 bg-sand/40 p-4">
                  <input
                    checked={!editingItem.isArchived}
                    className="size-5 rounded"
                    onChange={(event) => setEditingItem({ ...editingItem, isArchived: !event.target.checked })}
                    type="checkbox"
                  />
                  <span className="text-sm text-ink">{copy.productActiveSellable}</span>
                </label>
                {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
              </div>
              <div className="bg-ink p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.marketsLabel}</p>
                <p className="mt-2 text-sm text-white/60">{copy.productAvailabilityDescription}</p>
                <div className="mt-6 space-y-4">
                  {editingItem.countries.map((country) => (
                    <div
                      key={country.countryCode}
                      className={`rounded-2xl border p-4 transition ${
                        country.isAvailable
                          ? "border-white/25 bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                          : "border-white/10 bg-white/[0.03] opacity-75"
                      }`}
                    >
                      <button
                        className={`flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left transition ${
                          country.isAvailable ? "text-white" : "text-white/65"
                        }`}
                        onClick={() =>
                          setEditingItem({
                            ...editingItem,
                            countries: editingItem.countries.map((entry) =>
                              entry.countryCode === country.countryCode
                                ? { ...entry, isAvailable: !entry.isAvailable }
                                : entry
                            )
                          })
                        }
                        type="button"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl leading-none">{countryFlags[country.countryCode]}</span>
                          <div>
                            <p className="font-medium">{country.countryCode}</p>
                            <p className="mt-1 text-sm text-white/55">
                              {country.isAvailable ? copy.activeInCatalog : copy.inactiveInCatalog}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex size-9 items-center justify-center rounded-full ${
                            country.isAvailable ? "bg-sand text-ink" : "bg-white/5 text-white/50"
                          }`}
                        >
                          {country.isAvailable ? <CheckCircle2 className="size-4" /> : <Circle className="size-4" />}
                        </div>
                      </button>
                      <div className="mt-4">
                        <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-white/60">
                          {copy.overridePriceLabel} ({country.currencyCode})
                        </label>
                        <Input
                          className={`bg-white text-ink ${!country.isAvailable ? "opacity-50" : ""}`}
                          disabled={!country.isAvailable}
                          min="0"
                          placeholder={`Use base price ${editingItem.basePrice.toFixed(2)}`}
                          step="0.01"
                          type="number"
                          value={country.overridePrice ?? ""}
                          onChange={(event) =>
                            setEditingItem({
                              ...editingItem,
                              countries: editingItem.countries.map((entry) =>
                                entry.countryCode === country.countryCode
                                  ? {
                                      ...entry,
                                      overridePrice: event.target.value === "" ? null : Number(event.target.value)
                                    }
                                  : entry
                              )
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 border-t border-white/10 pt-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{copy.actionsLabel}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button className="min-w-40" disabled={isSaving} onClick={saveItem} type="button" variant="success">
                    {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                    <Button onClick={() => setEditingItem(null)} type="button" variant="danger">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

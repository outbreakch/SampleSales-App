"use client";

import { ShoppingBag } from "lucide-react";
import { startTransition, useDeferredValue, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CountryFlag } from "@/components/ui/country-flag";
import { Input } from "@/components/ui/input";
import { CatalogGrid } from "@/components/pos/catalog-grid";
import { CartSummary } from "@/components/pos/cart-summary";
import { CheckoutPanel } from "@/components/pos/checkout-panel";
import { PreferencesSetupModal } from "@/components/pos/preferences-setup-modal";
import { countries } from "@/lib/db/mock-data";
import { getStaffCopy } from "@/lib/i18n";
import { buildOrderSummary, resolveTaxRate } from "@/lib/tax";
import type { CartLine, CatalogItemView, CountryConfig } from "@/lib/types";

type CheckoutResult = {
  orderNumber: string;
  total: number;
  currency: string;
};

export function PosWorkflow() {
  const [catalog, setCatalog] = useState<CatalogItemView[]>([]);
  const [userCountryCode, setUserCountryCode] = useState<CountryConfig["code"] | null>(null);
  const [userCompanyName, setUserCompanyName] = useState<string | null>(null);
  const [userPreferredLanguage, setUserPreferredLanguage] = useState<string | null>(null);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResult | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isActive = true;

    startTransition(() => {
      Promise.all([
        fetch("/api/catalog").then(async (response) => {
          if (!response.ok) {
            throw new Error("Unable to load catalog.");
          }

          return response.json() as Promise<{ items: CatalogItemView[] }>;
        }),
        fetch("/api/users/me/preferences").then(async (response) => {
          if (!response.ok) {
            throw new Error("Unable to load preferences.");
          }

          return response.json() as Promise<{
            preferences: {
              countryCode: CountryConfig["code"] | null;
              companyName: string | null;
              preferredLanguage: string | null;
              completed: boolean;
            };
          }>;
        })
      ])
        .then(([catalogPayload, preferencesPayload]) => {
          if (!isActive) {
            return;
          }

          setCatalog(catalogPayload.items);
          setUserCountryCode(preferencesPayload.preferences.countryCode);
          setUserCompanyName(preferencesPayload.preferences.companyName);
          setUserPreferredLanguage(preferencesPayload.preferences.preferredLanguage);
          setPreferencesReady(preferencesPayload.preferences.completed);
          setLoadError("");
        })
        .catch(() => {
          if (!isActive) {
            return;
          }

          setLoadError("Unable to load selling context.");
        })
        .finally(() => {
          if (isActive) {
            setIsLoading(false);
          }
        });
    });

    return () => {
      isActive = false;
    };
  }, []);

  const country = countries.find((entry) => entry.code === userCountryCode) ?? countries[0];
  const companyName = userCompanyName || country.companyName || country.name;
  const copy = getStaffCopy(userPreferredLanguage);
  const deferredSearch = useDeferredValue(search);
  const visibleItems = catalog.filter((item) => {
    const matchesCountry = item.countries.includes(country.code);
    const query = deferredSearch.trim().toLowerCase();
    const matchesSearch =
      query.length === 0 ||
      item.name.toLowerCase().includes(query) ||
      item.nameEn.toLowerCase().includes(query) ||
      (item.nameFr?.toLowerCase().includes(query) ?? false) ||
      item.sku.toLowerCase().includes(query);

    return matchesCountry && matchesSearch;
  });

  const summary = buildOrderSummary(cart, country);

  function addItem(item: CatalogItemView) {
    setCheckoutResult(null);
    setCart((current) => {
      const existing = current.find((line) => line.itemId === item.id);

      if (existing) {
        return current.map((line) =>
          line.itemId === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }

      return [
        ...current,
        {
          itemId: item.id,
          sku: item.sku,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          taxRate: resolveTaxRate(country.code)
        }
      ];
    });
  }

  function updateQuantity(itemId: string, nextQuantity: number) {
    setCheckoutResult(null);
    setCart((current) =>
      current
        .map((line) => (line.itemId === itemId ? { ...line, quantity: nextQuantity } : line))
        .filter((line) => line.quantity > 0)
    );
  }

  function clearCart() {
    setCheckoutResult(null);
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  }

  async function handleCheckout(form: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentConfirmed: boolean;
  }) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        countryCode: country.code,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        customerPhone: form.customerPhone,
        paymentConfirmed: form.paymentConfirmed,
        paymentMethodNote: "External pinpad",
        items: cart
      })
    });

    const payload = (await response.json()) as {
      error?: string;
      order?: {
        orderNumber: string;
        total: number;
        currency: string;
      };
    };

    if (!response.ok || !payload.order) {
      throw new Error(payload.error ?? "Unable to create order.");
    }

    setCheckoutResult(payload.order);
    setCart([]);
    setIsCartOpen(false);
    setIsCheckoutOpen(false);
  }

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="grid gap-6 lg:h-[calc(100svh-8.5rem)] lg:grid-cols-[1.15fr_0.85fr] lg:overflow-hidden xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
          <Card className="bg-white/88">
            <div className="flex items-center gap-4 rounded-[26px] border border-black/10 bg-white px-5 py-4">
              <CountryFlag countryCode={country.code} className="h-12 w-16 rounded-[14px]" />
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-stone">{country.name}</p>
                <p className="truncate text-sm font-semibold text-ink">{companyName}</p>
              </div>
            </div>
          </Card>
          <Input
            className="bg-white/92"
            placeholder={copy.searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {loadError ? <Card className="bg-white/96 text-danger">{loadError}</Card> : null}
          {isLoading ? (
            <Card className="bg-white/96 text-stone">{copy.loadCatalog}</Card>
          ) : (
            <CatalogGrid items={visibleItems} country={country} language={userPreferredLanguage} onAddItem={addItem} />
          )}
        </section>
        <aside className="hidden min-h-0 space-y-4 lg:block">
          <CartSummary
            lines={cart}
            summary={summary}
            country={country}
            language={userPreferredLanguage}
            onDecrement={updateQuantity}
            onIncrement={(itemId) => {
              const line = cart.find((entry) => entry.itemId === itemId);
              if (line) {
                updateQuantity(itemId, line.quantity + 1);
              }
            }}
            onProceed={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
          {checkoutResult ? (
            <Card className="bg-success text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/70">{copy.saleCompleted}</p>
              <p className="mt-2 text-2xl font-semibold">{checkoutResult.orderNumber}</p>
              <p className="mt-2 text-sm text-white/85">
                {copy.orderSavedReceiptQueued}
              </p>
            </Card>
          ) : null}
        </aside>
      </div>
      <div className="fixed inset-x-4 bottom-4 z-30 lg:hidden">
        <div className="rounded-[28px] border border-black/10 bg-white/96 p-3 shadow-panel backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              className="flex min-w-0 flex-1 items-center gap-3 rounded-[22px] bg-ink px-4 py-4 text-left text-white transition hover:bg-black"
              onClick={() => setIsCartOpen(true)}
              type="button"
            >
              <div className="flex size-11 items-center justify-center rounded-full bg-white/10">
                <ShoppingBag className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">{copy.currentCart}</p>
                <p className="truncate text-sm font-semibold">
                  {itemCount} {itemCount === 1 ? copy.itemSingular : copy.itemPlural} · {country.code}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">{copy.total}</p>
                <p className="text-base font-semibold">{new Intl.NumberFormat(country.locale, { style: "currency", currency: country.currencyCode }).format(summary.total)}</p>
              </div>
            </button>
            <Button
              className="min-w-28"
              disabled={cart.length === 0}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              variant="success"
            >
              {copy.checkout}
            </Button>
          </div>
        </div>
      </div>
      {isCartOpen ? (
        <div className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[32px] bg-mist p-4 shadow-panel">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-black/10" />
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.reviewCart}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{copy.readyToCheckout}</h2>
              </div>
              <button
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink"
                onClick={() => setIsCartOpen(false)}
                type="button"
              >
                {copy.close}
              </button>
            </div>
            <CartSummary
              lines={cart}
              summary={summary}
              country={country}
              language={userPreferredLanguage}
              onDecrement={updateQuantity}
              onIncrement={(itemId) => {
                const line = cart.find((entry) => entry.itemId === itemId);
                if (line) {
                  updateQuantity(itemId, line.quantity + 1);
                }
              }}
              onProceed={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}
      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto">
          <CheckoutPanel
            country={country}
            lines={cart}
            summary={summary}
            language={userPreferredLanguage}
            onCancel={() => setIsCheckoutOpen(false)}
            onClear={clearCart}
            onSubmit={handleCheckout}
            />
          </div>
        </div>
      ) : null}
      {!isLoading && !preferencesReady ? (
        <PreferencesSetupModal
          countries={countries}
          onSaved={(preferences) => {
            setUserCountryCode(preferences.countryCode);
            setUserPreferredLanguage(preferences.preferredLanguage);
            setPreferencesReady(true);
          }}
        />
      ) : null}
    </div>
  );
}

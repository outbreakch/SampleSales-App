import { Minus, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStaffCopy } from "@/lib/i18n";
import { getTaxDisplayLabels } from "@/lib/tax-display";
import { formatCurrency } from "@/lib/utils";
import type { CartLine, CountryConfig, OrderSummary } from "@/lib/types";

export function CartSummary({
  lines,
  summary,
  country,
  language,
  onDecrement,
  onIncrement,
  onProceed
}: {
  lines: CartLine[];
  summary: OrderSummary;
  country: CountryConfig;
  language?: string | null;
  onDecrement: (itemId: string, nextQuantity: number) => void;
  onIncrement: (itemId: string) => void;
  onProceed: () => void;
}) {
  const copy = getStaffCopy(language);
  const labels = getTaxDisplayLabels(country.code, country.priceIncludesTax);

  return (
    <Card className="sticky top-0 flex max-h-[calc(100svh-9.5rem)] flex-col gap-5 overflow-hidden bg-ink text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-white/60">{copy.currentSale}</p>
        <h2 className="mt-2 text-2xl font-semibold">{copy.cart}</h2>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <div className="rounded-2xl bg-white/5 px-4 py-5 text-sm text-white/70">
            {copy.addItemsToStartSale}
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.itemId} className="rounded-2xl bg-white/5 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="text-sm text-white/60">{line.sku}</p>
                </div>
                <p>{formatCurrency(line.unitPrice * line.quantity, country.currencyCode, country.locale)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                    onClick={() => onDecrement(line.itemId, line.quantity - 1)}
                    type="button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    className="flex size-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/15"
                    onClick={() => onIncrement(line.itemId)}
                    type="button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="text-sm text-white/60">
                  {formatCurrency(line.unitPrice, country.currencyCode, country.locale)} {copy.each}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
        <div className="flex justify-between">
          <span>{labels.subtotalLabel}</span>
          <span>{formatCurrency(summary.subtotal, country.currencyCode, country.locale)}</span>
        </div>
        <div className="flex justify-between">
          <span>{labels.taxLabel}</span>
          <span>{formatCurrency(summary.tax, country.currencyCode, country.locale)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(summary.total, country.currencyCode, country.locale)}</span>
        </div>
      </div>
      <Button className="w-full bg-white text-ink hover:bg-sand" disabled={lines.length === 0} onClick={onProceed}>
        {copy.proceedToCheckout}
      </Button>
    </Card>
  );
}

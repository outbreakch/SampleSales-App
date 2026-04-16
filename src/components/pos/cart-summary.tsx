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
    <Card className="cart-summary-shell sticky top-0 flex max-h-[calc(100svh-9.5rem)] flex-col gap-5 overflow-hidden">
      <div>
        <p className="cart-summary-eyebrow text-xs uppercase tracking-[0.28em]">{copy.currentSale}</p>
        <h2 className="mt-2 text-2xl font-semibold">{copy.cart}</h2>
      </div>
      <div className="space-y-3 overflow-y-auto pr-1">
        {lines.length === 0 ? (
          <div className="cart-summary-empty rounded-2xl px-4 py-5 text-sm">
            {copy.addItemsToStartSale}
          </div>
        ) : (
          lines.map((line) => (
            <div key={line.itemId} className="cart-summary-line rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="cart-summary-meta text-sm">{line.sku}</p>
                </div>
                <p>{formatCurrency(line.unitPrice * line.quantity, country.currencyCode, country.locale)}</p>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="cart-summary-stepper flex size-10 items-center justify-center rounded-full transition"
                    onClick={() => onDecrement(line.itemId, line.quantity - 1)}
                    type="button"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">{line.quantity}</span>
                  <button
                    className="cart-summary-stepper flex size-10 items-center justify-center rounded-full transition"
                    onClick={() => onIncrement(line.itemId)}
                    type="button"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <span className="cart-summary-meta text-sm">
                  {formatCurrency(line.unitPrice, country.currencyCode, country.locale)} {copy.each}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary-totals space-y-2 border-t pt-4 text-sm">
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
      <Button className="cart-proceed-button w-full" disabled={lines.length === 0} onClick={onProceed}>
        {copy.proceedToCheckout}
      </Button>
    </Card>
  );
}

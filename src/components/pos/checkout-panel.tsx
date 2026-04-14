"use client";

import { CheckCircle2, CreditCard, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStaffCopy } from "@/lib/i18n";
import { getTaxDisplayLabels } from "@/lib/tax-display";
import { formatCurrency } from "@/lib/utils";
import type { CartLine, CountryConfig, OrderSummary } from "@/lib/types";

export function CheckoutPanel({
  country,
  lines,
  summary,
  language,
  onCancel,
  onClear,
  onSubmit
}: {
  country: CountryConfig;
  lines: CartLine[];
  summary: OrderSummary;
  language?: string | null;
  onCancel: () => void;
  onClear: () => void;
  onSubmit: (form: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentConfirmed: boolean;
  }) => Promise<void>;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const copy = getStaffCopy(language);
  const labels = getTaxDisplayLabels(country.code, country.priceIncludesTax);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (lines.length === 0) {
      setError(copy.cartIsEmpty);
      return;
    }

    if (!customerName.trim() || !customerEmail.trim()) {
      setError(copy.customerNameEmailRequired);
      return;
    }

    if (!paymentConfirmed) {
      setError(copy.confirmPaymentFirst);
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await onSubmit({
        customerName,
        customerEmail,
        customerPhone,
        paymentConfirmed
      });
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : copy.unableToCompleteSale);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.customer}</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{copy.completeSale}</h2>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              placeholder={copy.customerNamePlaceholder}
              required
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
            />
            <Input
              placeholder={copy.emailAddressPlaceholder}
              type="email"
              required
              value={customerEmail}
              onChange={(event) => setCustomerEmail(event.target.value)}
            />
            <Input
              placeholder={copy.phoneOptionalPlaceholder}
              className="sm:col-span-2"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
            />
          </div>
          <div
            className={`rounded-2xl border p-4 transition ${
              paymentConfirmed ? "border-success/30 bg-success/10" : "border-black/10 bg-sand/50"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div
                  className={`mt-0.5 flex size-10 items-center justify-center rounded-full ${
                    paymentConfirmed ? "bg-success text-white" : "bg-white text-ink"
                  }`}
                >
                  {paymentConfirmed ? <CheckCircle2 className="size-5" /> : <CreditCard className="size-5" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {paymentConfirmed ? copy.paymentReceived : copy.awaitingPinpad}
                  </p>
                  <p className="mt-1 text-sm text-stone">
                    {copy.pinpadHint}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" onClick={() => setPaymentConfirmed(true)} variant={paymentConfirmed ? "success" : "primary"}>
                <CheckCircle2 className="mr-2 size-4" />
                {copy.markPaymentReceived}
              </Button>
              {paymentConfirmed ? (
                <Button type="button" variant="ghost" onClick={() => setPaymentConfirmed(false)}>
                  <RotateCcw className="mr-2 size-4" />
                  {copy.reset}
                </Button>
              ) : null}
            </div>
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !paymentConfirmed || !customerName.trim() || !customerEmail.trim()}
              variant="success"
            >
              {isSubmitting ? copy.submitting : copy.confirmCheckout}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              {copy.backToCart}
            </Button>
            <Button type="button" variant="ghost" onClick={onClear}>
              {copy.clearCart}
            </Button>
          </div>
        </form>
      </div>
      <div className="rounded-[24px] bg-ink p-6 text-white">
        <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.orderSummary}</p>
        <div className="mt-4 space-y-3">
          {lines.map((line) => (
            <div key={line.itemId} className="flex items-center justify-between text-sm text-white/85">
              <span>
                {line.name} x {line.quantity}
              </span>
              <span>{formatCurrency(line.unitPrice * line.quantity, country.currencyCode, country.locale)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
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
      </div>
    </Card>
  );
}

"use client";

import { CheckCircle2, Mail, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getStaffCopy } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type AdminOrder = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  currencyCode: string;
  countryCode: string;
  locale: string;
  paymentStatus: string;
  paymentMethodNote: string | null;
  createdAt: string;
  cashierName: string;
  receiptSentAt: string | null;
  receiptResentAt: string | null;
  lineItems: Array<{
    id: string;
    itemNameSnapshot: string;
    skuSnapshot: string;
    unitPrice: number;
    quantity: number;
    taxAmount: number;
    lineTotal: number;
  }>;
};

export function AdminOrderList({
  orders,
  language,
  canManageOrderSupport = false
}: {
  orders: AdminOrder[];
  language?: string | null;
  canManageOrderSupport?: boolean;
}) {
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const copy = getStaffCopy(language);

  async function resendReceipt() {
    if (!selectedOrder) {
      return;
    }

    setIsSending(true);
    setStatusMessage("");

    const response = await fetch(`/api/orders/${selectedOrder.id}/receipt`, {
      method: "POST"
    });

    const payload = (await response.json()) as { error?: string; ok?: boolean };

    if (!response.ok) {
      setStatusMessage(payload.error ?? copy.unableToResendReceipt);
      setIsSending(false);
      return;
    }

    setStatusMessage(`${copy.receiptResentTo} ${selectedOrder.customerEmail}.`);
    setSelectedOrder({
      ...selectedOrder,
      receiptResentAt: new Date().toISOString()
    });
    setIsSending(false);
  }

  if (orders.length === 0) {
    return <div className="px-6 py-8 text-sm text-stone">{copy.noOrdersFound}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <button
            key={order.id}
            className="w-full rounded-2xl border border-black/5 bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-panel"
            onClick={() => {
              setStatusMessage("");
              setSelectedOrder(order);
            }}
            type="button"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">{order.orderNumber}</p>
                <p className="mt-1 text-sm text-stone">{order.customerName || copy.walkInCustomer}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone">
                  {copy.cashier}: {order.cashierName}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-ink">
                  {formatCurrency(order.totalAmount, order.currencyCode, order.locale)}
                </p>
                <p className="mt-1 text-sm text-stone">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedOrder ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-white p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label={copy.close}
              className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              onClick={() => setSelectedOrder(null)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <div className="grid gap-0 xl:grid-cols-[1fr_0.9fr]">
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.orderSupport}</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">{selectedOrder.orderNumber}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.customer}</p>
                    <p className="mt-2 font-medium text-ink">{selectedOrder.customerName || copy.walkInCustomer}</p>
                    <p className="text-sm text-stone">{selectedOrder.customerEmail || copy.noEmailProvided}</p>
                    <p className="text-sm text-stone">{selectedOrder.customerPhone || copy.noPhoneProvided}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.saleInfo}</p>
                    <p className="mt-2 text-sm text-ink">{copy.cashier}: {selectedOrder.cashierName}</p>
                    <p className="text-sm text-ink">{copy.country}: {selectedOrder.countryCode}</p>
                    <p className="text-sm text-ink">{copy.payment}: {selectedOrder.paymentStatus}</p>
                    <p className="text-sm text-ink">{selectedOrder.paymentMethodNote || "External pinpad"}</p>
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.lineItems}</p>
                  <div className="mt-4 space-y-3">
                    {selectedOrder.lineItems.map((line) => (
                      <div key={line.id} className="rounded-2xl border border-black/5 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="font-medium text-ink">{line.itemNameSnapshot}</p>
                            <p className="text-sm text-stone">{line.skuSnapshot}</p>
                          </div>
                          <p className="font-medium text-ink">
                            {formatCurrency(line.lineTotal, selectedOrder.currencyCode, selectedOrder.locale)}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone">
                          <span>{copy.qty} {line.quantity}</span>
                          <span>
                            {copy.unit} {formatCurrency(line.unitPrice, selectedOrder.currencyCode, selectedOrder.locale)}
                          </span>
                          <span>
                            {copy.tax} {formatCurrency(line.taxAmount, selectedOrder.currencyCode, selectedOrder.locale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-ink p-6 text-white">
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.receipt}</p>
                <div className="mt-6 space-y-3 text-sm text-white/80">
                  <p>
                    {copy.sent}: {selectedOrder.receiptSentAt ? new Date(selectedOrder.receiptSentAt).toLocaleString() : copy.notYet}
                  </p>
                  <p>
                    {copy.resent}: {selectedOrder.receiptResentAt ? new Date(selectedOrder.receiptResentAt).toLocaleString() : copy.never}
                  </p>
                  <p>{copy.recipient}: {selectedOrder.customerEmail || copy.noCustomerEmailOnFile}</p>
                </div>
                <div className="mt-8 space-y-2 border-t border-white/10 pt-6">
                  <div className="flex justify-between">
                    <span>{copy.subtotal}</span>
                    <span>{formatCurrency(selectedOrder.subtotalAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{copy.tax}</span>
                    <span>{formatCurrency(selectedOrder.taxAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>{copy.total}</span>
                    <span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
                  </div>
                </div>
                {canManageOrderSupport ? (
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      className="bg-sand text-ink hover:bg-white"
                      disabled={isSending || !selectedOrder.customerEmail}
                      onClick={resendReceipt}
                      type="button"
                    >
                      <Mail className="mr-2 size-4" />
                      {isSending ? copy.sending : copy.resendReceipt}
                    </Button>
                  </div>
                ) : null}
                {statusMessage ? (
                  <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white">
                    <CheckCircle2 className="size-4" />
                    <span>{statusMessage}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}

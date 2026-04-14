"use client";

import { Mail, PencilLine, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStaffCopy } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";

type OrderListItem = {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  totalAmount: number;
  subtotalAmount: number;
  taxAmount: number;
  currencyCode: string;
  countryCode: string;
  locale: string;
  paymentStatus: string;
  paymentMethodNote: string | null;
  createdAt: string;
  cashierName: string;
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

export function OrderList({ orders, language }: { orders: OrderListItem[]; language?: string | null }) {
  const copy = getStaffCopy(language);
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null);
  const [emailDraft, setEmailDraft] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  function openOrder(order: OrderListItem) {
    setSelectedOrder(order);
    setEmailDraft(order.customerEmail ?? "");
    setIsEditingEmail(false);
    setIsSavingEmail(false);
    setIsSendingReceipt(false);
    setStatusMessage("");
  }

  async function saveCustomerEmail() {
    if (!selectedOrder) {
      return;
    }

    setIsSavingEmail(true);
    setStatusMessage("");

    const response = await fetch(`/api/orders/${selectedOrder.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerEmail: emailDraft
      })
    });

    const payload = (await response.json()) as { error?: string; order?: { customerEmail: string | null } };

    if (!response.ok) {
      setStatusMessage(payload.error ?? copy.unableToUpdateCustomerEmail);
      setIsSavingEmail(false);
      return;
    }

    setSelectedOrder({
      ...selectedOrder,
      customerEmail: payload.order?.customerEmail ?? emailDraft
    });
    setIsEditingEmail(false);
    setStatusMessage(copy.customerEmailUpdated);
    setIsSavingEmail(false);
  }

  async function resendReceipt() {
    if (!selectedOrder || !selectedOrder.customerEmail) {
      return;
    }

    setIsSendingReceipt(true);
    setStatusMessage("");

    const response = await fetch(`/api/orders/${selectedOrder.id}/receipt`, {
      method: "POST"
    });

    const payload = (await response.json()) as { error?: string; result?: { note?: string } };

    if (!response.ok) {
      setStatusMessage(payload.result?.note ?? payload.error ?? copy.unableToResendReceipt);
      setIsSendingReceipt(false);
      return;
    }

    setStatusMessage(`${copy.receiptResentTo} ${selectedOrder.customerEmail}.`);
    setIsSendingReceipt(false);
  }

  if (orders.length === 0) {
    return <div className="px-6 py-8 text-sm text-stone">{copy.noOrdersFound}</div>;
  }

  return (
    <>
      {orders.map((order) => (
        <div key={order.id} className="border-t border-black/5 first:border-t-0 xl:border-t-0">
          <button
            className="w-full px-5 py-5 text-left text-sm transition hover:bg-black/[0.03] xl:grid xl:grid-cols-[1.1fr_1fr_120px_160px] xl:gap-4 xl:px-6"
            onClick={() => openOrder(order)}
            type="button"
          >
            <div className="xl:hidden">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-stone">{new Date(order.createdAt).toLocaleString()}</p>
                  <p className="mt-3 font-medium text-ink">{order.customerName || copy.walkInCustomer}</p>
                  <p className="mt-1 break-all text-sm text-stone">{order.customerEmail || copy.noEmailProvided}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone">{order.countryCode}</p>
                  <p className="mt-2 font-semibold text-ink">
                    {formatCurrency(order.totalAmount, order.currencyCode, order.locale)}
                  </p>
                </div>
              </div>
            </div>
            <div className="hidden xl:block">
              <p className="font-semibold text-ink">{order.orderNumber}</p>
              <p className="text-stone">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="hidden xl:block">
              <p className="font-medium text-ink">{order.customerName || copy.walkInCustomer}</p>
              <p className="text-stone">{order.customerEmail || copy.noEmailProvided}</p>
            </div>
            <p className="hidden text-ink xl:block">{order.countryCode}</p>
            <p className="hidden font-semibold text-ink xl:block">
              {formatCurrency(order.totalAmount, order.currencyCode, order.locale)}
            </p>
          </button>
        </div>
      ))}

      {selectedOrder ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <Card
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white p-0"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close order details"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/5 transition hover:bg-black/10"
              onClick={() => setSelectedOrder(null)}
              type="button"
            >
              <X className="size-4" />
            </button>
            <div className="grid gap-0 xl:grid-cols-[1fr_0.9fr]">
              <div className="p-6 pt-20">
                <p className="text-xs uppercase tracking-[0.24em] text-stone">{copy.orderDetails}</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink">{selectedOrder.orderNumber}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.customer}</p>
                    <p className="mt-2 font-medium text-ink">{selectedOrder.customerName || copy.walkInCustomer}</p>
                    {isEditingEmail ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          autoFocus
                          type="email"
                          value={emailDraft}
                          onChange={(event) => setEmailDraft(event.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" disabled={isSavingEmail || !emailDraft.trim()} onClick={saveCustomerEmail} variant="success">
                            {isSavingEmail ? copy.saving : copy.saveEmail}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setIsEditingEmail(false)}>
                            {copy.cancel}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <p className="text-sm text-stone">{selectedOrder.customerEmail || copy.noEmailProvided}</p>
                        <button
                          className="inline-flex items-center gap-1 text-xs font-medium text-success transition hover:text-success/80"
                          onClick={() => {
                            setEmailDraft(selectedOrder.customerEmail ?? "");
                            setIsEditingEmail(true);
                            setStatusMessage("");
                          }}
                          type="button"
                        >
                          <PencilLine className="size-3.5" />
                          {copy.updateEmail}
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-stone">{selectedOrder.customerPhone || copy.noPhoneProvided}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-stone">{copy.saleInfo}</p>
                    <p className="mt-2 text-sm text-ink">Cashier: {selectedOrder.cashierName}</p>
                    <p className="text-sm text-ink">{copy.status}: {selectedOrder.paymentStatus}</p>
                    <p className="text-sm text-ink">{copy.paymentNote}: {selectedOrder.paymentMethodNote || "External pinpad"}</p>
                    <p className="text-sm text-stone">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
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
                <p className="text-xs uppercase tracking-[0.24em] text-white/60">{copy.receiptAndTotals}</p>
                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{copy.receipt}</p>
                  <p className="mt-2 text-sm text-white/80">
                    {copy.recipient}: {selectedOrder.customerEmail || copy.noCustomerEmailOnFile}
                  </p>
                  <Button
                    type="button"
                    className="mt-4 bg-sand text-ink hover:bg-white"
                    disabled={isSendingReceipt || !selectedOrder.customerEmail}
                    onClick={resendReceipt}
                  >
                    <Mail className="mr-2 size-4" />
                    {isSendingReceipt ? copy.sending : copy.resendReceipt}
                  </Button>
                </div>
                {statusMessage ? (
                  <div className="mt-4 rounded-[20px] bg-white/10 px-4 py-3 text-sm text-white">
                    {statusMessage}
                  </div>
                ) : null}
                <p className="mt-6 text-xs uppercase tracking-[0.24em] text-white/60">{copy.total}</p>
                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>{copy.subtotal}</span>
                    <span>{formatCurrency(selectedOrder.subtotalAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{copy.tax}</span>
                    <span>{formatCurrency(selectedOrder.taxAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode, selectedOrder.locale)}</span>
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

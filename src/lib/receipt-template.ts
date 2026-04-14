type MergePrimitive = string | number | null | undefined;
type MergeValues = Record<string, MergePrimitive>;

type ReceiptLineItem = {
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  taxAmount: string;
  lineTotal: string;
};

type ReceiptTemplateContext = {
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  orderNumber: string;
  orderDate: string;
  orderSubtotal: string;
  orderTax: string;
  orderTotal: string;
  orderSubtotalLabel: string;
  orderTaxLabel: string;
  lineTaxLabel: string;
  currencyCode: string;
  countryCode: string;
  countryName: string;
  paymentMethodNote?: string | null;
  receiptFooter?: string | null;
  legalLabel?: string | null;
  lineItems: ReceiptLineItem[];
};

type ReceiptPreviewCountry = {
  code: string;
  name: string;
  currencyCode: string;
  defaultLocale: string;
  receiptFooter?: string | null;
  legalLabel?: string | null;
};

export const receiptTemplateStarter = `
<section style="font-family:Arial,sans-serif;color:#151515;background:#f8f5f0;padding:28px 0;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e7dfd4;border-radius:28px;overflow:hidden;box-shadow:0 20px 40px rgba(21,21,21,0.08);">
    <div style="padding:30px 34px 18px;background:linear-gradient(180deg,#fcfaf6 0%,#ffffff 100%);">
      <div style="display:inline-block;margin:0 0 14px;padding:7px 12px;border-radius:999px;background:#efe7dc;font-size:12px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#1d6b42;">
        Bestseller Sample Sales
      </div>
      <h1 style="margin:0 0 16px;font-size:40px;line-height:1.05;font-weight:700;color:#151515;">
        Order {{orderNumber}}
      </h1>
      <p style="margin:0 0 10px;font-size:20px;line-height:1.55;color:#151515;">
        Thank you for shopping with us, {{customerName}}.
      </p>
      <p style="margin:0;font-size:18px;line-height:1.65;color:#5f554c;">
        Your receipt was issued on {{orderDate}}. A copy was sent to {{customerEmail}}. If you need help with this order, keep {{orderNumber}} for reference.
      </p>
    </div>

    <div style="padding:0 34px 24px;">
      <section style="margin:0 0 22px;border:1px solid #e7dfd4;border-radius:20px;padding:22px 24px;background:#ffffff;">
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#7f7468;">Order Details</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          {{orderDetailsRows}}
        </table>
        <p style="margin:18px 0 12px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#7f7468;">Customer</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          {{customerDetailsRows}}
        </table>
      </section>

      <section style="margin:0 0 22px;">
        <div style="padding:14px 18px;border-radius:16px 16px 0 0;background:#efe7dc;font-size:14px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#151515;">
          Items Ordered
        </div>
        <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #e7dfd4;border-top:none;background:#ffffff;">
          <thead>
            <tr style="background:#fcfaf6;color:#7f7468;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
              <th align="left" style="padding:14px 18px;">Item</th>
              <th align="right" style="padding:14px 18px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{orderItemsRows}}
          </tbody>
        </table>
        <p style="margin:12px 4px 0;font-size:14px;line-height:1.6;color:#7f7468;">
          {{orderItemCount}} line items · {{orderQuantity}} total units
        </p>
      </section>

      <section style="margin:0 0 22px;border-radius:20px;background:#1d6b42;padding:22px 24px;color:#ffffff;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
          <div>
            <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.72);">
              Order Summary
            </p>
            <p style="margin:0;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.72);">
              Currency: {{currencyCode}} · Market: {{countryName}}
            </p>
          </div>
        </div>
        <div style="margin-top:18px;">
          {{orderSummaryRows}}
        </div>
      </section>

      <section style="margin:0;border-top:1px solid #e7dfd4;padding-top:18px;">
        <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#5f554c;">
          {{receiptFooter}}
        </p>
        <p style="margin:0;font-size:13px;line-height:1.7;color:#7f7468;">
          {{legalLabel}}
        </p>
      </section>
    </div>
  </div>
</section>
`.trim();

export function renderTemplate(template: string, values: MergeValues) {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/\n/g, " ");
}

export function buildReceiptTemplateValues(context: ReceiptTemplateContext): MergeValues {
  const orderItemCount = context.lineItems.length;
  const orderQuantity = context.lineItems.reduce((sum, line) => sum + line.quantity, 0);
  const orderItemsRows = context.lineItems
    .map(
      (line) => `
        <tr style="border-top:1px solid #f1ebe2;">
          <td style="padding:16px 18px;color:#151515;">
            <div style="font-size:16px;font-weight:700;line-height:1.45;">${escapeHtml(line.itemName)}</div>
            <div style="margin-top:4px;font-size:13px;line-height:1.55;color:#7f7468;">SKU: ${escapeHtml(line.sku)}</div>
            <div style="font-size:13px;line-height:1.55;color:#7f7468;">Qty: ${line.quantity} · Unit: ${escapeHtml(line.unitPrice)}</div>
            <div style="font-size:13px;line-height:1.55;color:#7f7468;">${escapeHtml(context.lineTaxLabel)}: ${escapeHtml(line.taxAmount)}</div>
          </td>
          <td align="right" valign="top" style="padding:16px 18px;color:#151515;font-size:16px;font-weight:700;">${escapeHtml(line.lineTotal)}</td>
        </tr>
      `.trim()
    )
    .join("");

  const orderItemsList = context.lineItems
    .map((line) => `${line.itemName} (${line.sku}) x ${line.quantity} - ${line.lineTotal}`)
    .join("\n");

  const orderDetailsRows = [
    ["Order Number", context.orderNumber],
    ["Country", context.countryName],
    ["Payment Method", context.paymentMethodNote ?? "External pinpad"]
  ]
    .map(
      ([label, value]) => `
        <tr>
          <td valign="top" style="padding:4px 0;font-size:16px;line-height:1.6;font-weight:700;color:#151515;">${label}</td>
        </tr>
        <tr>
          <td valign="top" style="padding:0 0 8px;font-size:16px;line-height:1.6;color:#151515;">${escapeHtml(value)}</td>
        </tr>
      `.trim()
    )
    .join("");

  const customerDetailsRows = [
    ["Name", context.customerName ?? ""],
    ["Email", context.customerEmail ?? ""],
    ["Phone", context.customerPhone ?? ""]
  ]
    .filter(([, value]) => value)
    .map(
      ([label, value]) => `
        <tr>
          <td valign="top" style="padding:4px 0;font-size:16px;line-height:1.6;font-weight:700;color:#151515;">${label}</td>
        </tr>
        <tr>
          <td valign="top" style="padding:0 0 8px;font-size:16px;line-height:1.6;color:#151515;">
            ${
              label === "Email"
                ? `<a href="mailto:${escapeAttribute(value)}" style="color:#1b6fd1;text-decoration:underline;">${escapeHtml(value)}</a>`
                : escapeHtml(value)
            }
          </td>
        </tr>
      `.trim()
    )
    .join("");

  const orderSummaryRows = [
    [context.orderSubtotalLabel, context.orderSubtotal],
    [context.orderTaxLabel, context.orderTax],
    ["Total", context.orderTotal]
  ]
    .map(
      ([label, value], index) => `
        <div style="display:flex;justify-content:space-between;gap:12px;padding:${index === 2 ? "16px 0 0" : "0 0 12px"};${index === 2 ? "border-top:1px solid rgba(255,255,255,0.12);font-size:20px;font-weight:700;" : "font-size:16px;"}">
          <span>${label}</span>
          <span>${value}</span>
        </div>
      `.trim()
    )
    .join("");

  return {
    customerName: context.customerName ?? "",
    customerEmail: context.customerEmail ?? "",
    customerPhone: context.customerPhone ?? "",
    orderNumber: context.orderNumber,
    orderDate: context.orderDate,
    orderSubtotal: context.orderSubtotal,
    orderTax: context.orderTax,
    orderTotal: context.orderTotal,
    orderSubtotalLabel: context.orderSubtotalLabel,
    orderTaxLabel: context.orderTaxLabel,
    lineTaxLabel: context.lineTaxLabel,
    currencyCode: context.currencyCode,
    countryCode: context.countryCode,
    countryName: context.countryName,
    paymentMethodNote: context.paymentMethodNote ?? "External pinpad",
    receiptFooter: context.receiptFooter ?? "",
    legalLabel: context.legalLabel ?? "",
    orderDetailsRows,
    customerDetailsRows,
    orderItemsRows,
    orderItemsList,
    orderSummaryRows,
    orderItemCount,
    orderQuantity
  };
}

export function buildReceiptPreviewValues(country: ReceiptPreviewCountry): MergeValues {
  return buildReceiptTemplateValues({
    customerName: "Alex Martin",
    customerEmail: "alex.martin@example.com",
    customerPhone: "+1 514 555 0112",
    orderNumber: "SS-2026-0410-001",
    orderDate: new Date("2026-04-10T10:30:00Z").toLocaleString(country.defaultLocale || "en-US"),
    orderSubtotal: formatPreviewCurrency(52.25, country.currencyCode, country.defaultLocale),
    orderTax: formatPreviewCurrency(7.82, country.currencyCode, country.defaultLocale),
    orderTotal: formatPreviewCurrency(60.07, country.currencyCode, country.defaultLocale),
    orderSubtotalLabel: country.code === "AU" ? "Subtotal (ex GST)" : "Subtotal",
    orderTaxLabel: country.code === "AU" ? "Included GST" : "Tax",
    lineTaxLabel: country.code === "AU" ? "GST" : "Tax",
    currencyCode: country.currencyCode,
    countryCode: country.code,
    countryName: country.name,
    paymentMethodNote: "External pinpad",
    receiptFooter: country.receiptFooter ?? "Thank you for shopping the sample sale.",
    legalLabel: country.legalLabel ?? "All sample sale purchases are final.",
    lineItems: [
      {
        itemName: "Outerwear - Light",
        sku: "OW-020",
        quantity: 1,
        unitPrice: formatPreviewCurrency(20, country.currencyCode, country.defaultLocale),
        taxAmount: formatPreviewCurrency(1.65, country.currencyCode, country.defaultLocale),
        lineTotal: formatPreviewCurrency(21.65, country.currencyCode, country.defaultLocale)
      },
      {
        itemName: "Top - Short Sleeve",
        sku: "TP-005",
        quantity: 2,
        unitPrice: formatPreviewCurrency(5, country.currencyCode, country.defaultLocale),
        taxAmount: formatPreviewCurrency(0.83, country.currencyCode, country.defaultLocale),
        lineTotal: formatPreviewCurrency(10.83, country.currencyCode, country.defaultLocale)
      }
    ]
  });
}

function formatPreviewCurrency(amount: number, currencyCode: string, locale: string) {
  return new Intl.NumberFormat(locale || "en-US", {
    style: "currency",
    currency: currencyCode
  }).format(amount);
}

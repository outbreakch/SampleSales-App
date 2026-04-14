export function htmlToPlainText(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function receiptHtmlToTextTemplate(html: string) {
  return htmlToPlainText(
    html
      .replaceAll("{{orderItemsRows}}", "{{orderItemsList}}")
      .replaceAll("{{orderDetailsRows}}", "Order Number: {{orderNumber}}<br>Country: {{countryName}}<br>Payment Method: {{paymentMethodNote}}")
      .replaceAll("{{customerDetailsRows}}", "Name: {{customerName}}<br>Email: {{customerEmail}}<br>Phone: {{customerPhone}}")
      .replaceAll(
        "{{orderSummaryRows}}",
        "<p>Subtotal: {{orderSubtotal}}</p><p>Tax: {{orderTax}}</p><p>Total: {{orderTotal}}</p>"
      )
  );
}

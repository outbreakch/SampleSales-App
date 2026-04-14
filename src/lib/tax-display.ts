export function getTaxDisplayLabels(countryCode: string, priceIncludesTax: boolean) {
  if (countryCode === "AU") {
    return {
      subtotalLabel: "Subtotal (ex GST)",
      taxLabel: "Included GST",
      lineTaxLabel: "GST"
    };
  }

  if (priceIncludesTax) {
    return {
      subtotalLabel: "Subtotal (ex tax)",
      taxLabel: "Included Tax",
      lineTaxLabel: "Tax"
    };
  }

  return {
    subtotalLabel: "Subtotal",
    taxLabel: "Tax",
    lineTaxLabel: "Tax"
  };
}

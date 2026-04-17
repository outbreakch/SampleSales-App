import { addDays } from "date-fns";
import type { CatalogItemView, CountryConfig, SessionUser } from "@/lib/types";

export const countries: CountryConfig[] = [
  {
    code: "US",
    name: "United States",
    companyName: "Bestseller Wholesale US LLC",
    currencyCode: "USD",
    locale: "en-US",
    defaultLanguage: "en",
    priceIncludesTax: false,
    receiptFooter: "Thank you for shopping the sample sale.",
    legalLabel: "Sales tax calculated at checkout."
  },
  {
    code: "CA",
    name: "Canada",
    companyName: "Bestseller Wholesale Canada Inc",
    currencyCode: "CAD",
    locale: "en-CA",
    defaultLanguage: "en",
    priceIncludesTax: false,
    receiptFooter: "Merci et thank you for shopping with us.",
    legalLabel: "Provincial taxes apply. French labels available for Quebec."
  },
  {
    code: "AU",
    name: "Australia",
    companyName: "Bestseller Australia PTY LTD",
    currencyCode: "AUD",
    locale: "en-AU",
    defaultLanguage: "en",
    priceIncludesTax: true,
    receiptFooter: "Thank you for visiting the sample sale.",
    legalLabel: "GST included where applicable."
  }
];

export const catalog: CatalogItemView[] = [
  { id: "item-1", sku: "JN-001", name: "Jeans - Pants", nameEn: "Jeans - Pants", nameFr: "Jeans - Pantalons", price: 15, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] },
  { id: "item-2", sku: "SK-009", name: "Shorts - Skirts", nameEn: "Shorts - Skirts", nameFr: "Shorts - Jupes", price: 9, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] },
  { id: "item-3", sku: "TP-005", name: "Top - Short Sleeve", nameEn: "Top - Short Sleeve", nameFr: "Haut - Manches courtes", price: 5, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] },
  { id: "item-4", sku: "TP-010", name: "Top - Long Sleeve", nameEn: "Top - Long Sleeve", nameFr: "Haut - Manches longues", price: 10, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] },
  { id: "item-5", sku: "DR-010", name: "Dress", nameEn: "Dress", nameFr: "Jupe", price: 10, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] },
  { id: "item-6", sku: "OW-020", name: "Outerwear - Light", nameEn: "Outerwear - Light", nameFr: "Vetement d'exterieur - Leger", price: 20, taxCategory: "STANDARD", countries: ["US", "CA", "AU"] }
];

export const recentOrders = [
  {
    id: "ord-10001",
    customerName: "Jordan Lee",
    customerEmail: "jordan@example.com",
    total: 45.14,
    currencyCode: "USD",
    countryCode: "US",
    createdAt: addDays(new Date(), -1).toISOString()
  },
  {
    id: "ord-10002",
    customerName: "Camille Roy",
    customerEmail: "camille@example.ca",
    total: 22.99,
    currencyCode: "CAD",
    countryCode: "CA",
    createdAt: new Date().toISOString()
  }
];

export const demoUser: SessionUser = {
  id: "user-admin",
  email: "admin@samplesale.local",
  name: "Sample Admin",
  roles: ["STAFF", "FULL_ADMIN"]
};

export const emailTemplates = [
  {
    id: "tpl-us-receipt",
    countryCode: "US",
    languageCode: "en",
    name: "US Receipt",
    subject: "Your BESTSELLER sample sale receipt",
    htmlBody: "<p>Hi {{customerName}},</p><p>Thank you for your order {{orderNumber}}.</p>"
  },
  {
    id: "tpl-ca-receipt-fr",
    countryCode: "CA",
    languageCode: "fr-CA",
    name: "Canada Receipt FR",
    subject: "Votre recu BESTSELLER",
    htmlBody: "<p>Bonjour {{customerName}},</p><p>Merci pour votre commande {{orderNumber}}.</p>"
  }
];

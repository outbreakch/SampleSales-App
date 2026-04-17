export type Role = "STAFF" | "FULL_ADMIN" | "CATALOG_ADMIN" | "FINANCE" | "OPERATIONS";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  roles: Role[];
  preferredLanguage?: string | null;
};

export type CountryConfig = {
  code: "US" | "CA" | "AU";
  name: string;
  companyName?: string | null;
  currencyCode: string;
  locale: string;
  defaultLanguage: string;
  priceIncludesTax: boolean;
  receiptFooter: string;
  legalLabel: string;
};

export type CatalogItemView = {
  id: string;
  sku: string;
  name: string;
  nameEn: string;
  nameFr?: string;
  description?: string;
  price: number;
  taxCategory: string;
  countries: string[];
};

export type CartLine = {
  itemId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

export type OrderSummary = {
  subtotal: number;
  tax: number;
  total: number;
};

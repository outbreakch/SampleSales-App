import bcrypt from "bcryptjs";
import { PrismaClient, RoleKey, TemplateType } from "@prisma/client";
import { receiptHtmlToTextTemplate } from "../src/lib/email-template";
import { receiptTemplateStarter } from "../src/lib/receipt-template";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const [staffRole, fullAdminRole, catalogAdminRole, financeRole, operationsRole] = await Promise.all([
    prisma.role.upsert({
      where: { key: RoleKey.STAFF },
      update: {},
      create: { key: RoleKey.STAFF, name: "Staff" }
    }),
    prisma.role.upsert({
      where: { key: RoleKey.FULL_ADMIN },
      update: {},
      create: { key: RoleKey.FULL_ADMIN, name: "Full Admin" }
    }),
    prisma.role.upsert({
      where: { key: RoleKey.CATALOG_ADMIN },
      update: {},
      create: { key: RoleKey.CATALOG_ADMIN, name: "Catalog Admin" }
    }),
    prisma.role.upsert({
      where: { key: RoleKey.FINANCE },
      update: {},
      create: { key: RoleKey.FINANCE, name: "Finance" }
    }),
    prisma.role.upsert({
      where: { key: RoleKey.OPERATIONS },
      update: {},
      create: { key: RoleKey.OPERATIONS, name: "Operations" }
    })
  ]);

  const countries = await Promise.all([
    prisma.country.upsert({
      where: { code: "US" },
      update: {
        name: "United States",
        currencyCode: "USD",
        defaultLocale: "en-US",
        defaultLanguage: "en",
        priceIncludesTax: true,
        receiptFooter: "Thank you for shopping the sample sale.",
        legalLabel: "Taxes included for Los Angeles sample sale pricing."
      },
      create: {
        code: "US",
        name: "United States",
        companyName: "Bestseller Wholesale US LLC",
        currencyCode: "USD",
        defaultLocale: "en-US",
        defaultLanguage: "en",
        priceIncludesTax: true,
        receiptFooter: "Thank you for shopping the sample sale.",
        legalLabel: "Taxes included for Los Angeles sample sale pricing."
      }
    }),
    prisma.country.upsert({
      where: { code: "CA" },
      update: {
        name: "Canada",
        currencyCode: "CAD",
        defaultLocale: "en-CA",
        defaultLanguage: "en",
        receiptFooter: "Merci et thank you for shopping with us.",
        legalLabel: "GST and QST calculated for Quebec sample sales."
      },
      create: {
        code: "CA",
        name: "Canada",
        companyName: "Bestseller Wholesale Canada Inc",
        currencyCode: "CAD",
        defaultLocale: "en-CA",
        defaultLanguage: "en",
        receiptFooter: "Merci et thank you for shopping with us.",
        legalLabel: "GST and QST calculated for Quebec sample sales."
      }
    }),
    prisma.country.upsert({
      where: { code: "AU" },
      update: {
        name: "Australia",
        currencyCode: "AUD",
        defaultLocale: "en-AU",
        defaultLanguage: "en",
        priceIncludesTax: true,
        receiptFooter: "Thank you for visiting the sample sale.",
        legalLabel: "GST included where applicable."
      },
      create: {
        code: "AU",
        name: "Australia",
        companyName: "Bestseller Australia PTY LTD",
        currencyCode: "AUD",
        defaultLocale: "en-AU",
        defaultLanguage: "en",
        priceIncludesTax: true,
        receiptFooter: "Thank you for visiting the sample sale.",
        legalLabel: "GST included where applicable."
      }
    })
  ]);

  const [us, ca, au] = countries;

  await prisma.taxRule.deleteMany({
    where: {
      countryId: {
        in: [us.id, ca.id, au.id]
      }
    }
  });

  await prisma.taxRule.createMany({
    data: [
      {
        countryId: us.id,
        name: "United States Included Pricing",
        code: "US_STD",
        category: "STANDARD",
        regionCode: null,
        ratePercent: "0.00",
        effectiveFrom: new Date("2025-01-01")
      },
      {
        countryId: ca.id,
        name: "Canada GST",
        code: "CA_GST",
        category: "STANDARD",
        regionCode: null,
        ratePercent: "5.00",
        effectiveFrom: new Date("2025-01-01"),
        priority: 10
      },
      {
        countryId: ca.id,
        name: "Canada QST",
        code: "CA_QST",
        category: "STANDARD",
        regionCode: null,
        ratePercent: "9.975",
        effectiveFrom: new Date("2025-01-01"),
        priority: 9
      },
      {
        countryId: au.id,
        name: "Australia GST",
        code: "AU_GST",
        category: "STANDARD",
        ratePercent: "10.00",
        effectiveFrom: new Date("2025-01-01")
      }
    ],
    skipDuplicates: true
  });

  const items = [
    { sku: "JN-001", name: "Jeans - Pants", basePrice: "15.00" },
    { sku: "SK-009", name: "Shorts - Skirts", basePrice: "9.00" },
    { sku: "TP-005", name: "Top - Short Sleeve", basePrice: "5.00" },
    { sku: "DR-010", name: "Dress", basePrice: "10.00" },
    { sku: "OW-020", name: "Outerwear - Light", basePrice: "20.00" }
  ];

  for (const item of items) {
    const catalogItem = await prisma.catalogItem.upsert({
      where: { sku: item.sku },
      update: {},
      create: {
        sku: item.sku,
        name: item.name,
        taxCategory: "STANDARD",
        basePrice: item.basePrice
      }
    });

    await prisma.catalogItemCountry.createMany({
      data: countries.map((country) => ({
        catalogItemId: catalogItem.id,
        countryId: country.id,
        isAvailable: true
      })),
      skipDuplicates: true
    });
  }

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@samplesale.local" },
    update: {},
    create: {
      email: "admin@samplesale.local",
      firstName: "Sample",
      lastName: "Admin",
      passwordHash
    }
  });

  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: staffRole.id },
      { userId: adminUser.id, roleId: fullAdminRole.id }
    ],
    skipDuplicates: true
  });

  await prisma.emailTemplate.createMany({
    data: [
      {
        countryId: us.id,
        type: TemplateType.RECEIPT,
        languageCode: "en",
        name: "US Receipt",
        subject: "Your BESTSELLER sample sale receipt",
        htmlBody: receiptTemplateStarter,
        textBody: receiptHtmlToTextTemplate(receiptTemplateStarter)
      },
      {
        countryId: ca.id,
        type: TemplateType.RECEIPT,
        languageCode: "fr-CA",
        name: "Canada Receipt FR",
        subject: "Votre recu BESTSELLER",
        htmlBody: receiptTemplateStarter
          .replaceAll("Thank you for shopping with BESTSELLER Sample Sales, {{customerName}}.", "Merci pour votre achat chez BESTSELLER Sample Sales, {{customerName}}.")
          .replaceAll("Your receipt was issued on {{orderDate}}. A copy was sent to {{customerEmail}}.", "Votre recu a ete emis le {{orderDate}}. Une copie a ete envoyee a {{customerEmail}}.")
          .replaceAll("Order Details", "Details de la commande")
          .replaceAll("Items Ordered", "Articles achetes")
          .replaceAll("Totals", "Totaux"),
        textBody: receiptHtmlToTextTemplate(
          receiptTemplateStarter
            .replaceAll("Thank you for shopping with BESTSELLER Sample Sales, {{customerName}}.", "Merci pour votre achat chez BESTSELLER Sample Sales, {{customerName}}.")
            .replaceAll("Your receipt was issued on {{orderDate}}. A copy was sent to {{customerEmail}}.", "Votre recu a ete emis le {{orderDate}}. Une copie a ete envoyee a {{customerEmail}}.")
            .replaceAll("Order Details", "Details de la commande")
            .replaceAll("Items Ordered", "Articles achetes")
            .replaceAll("Totals", "Totaux")
        )
      },
      {
        countryId: au.id,
        type: TemplateType.RECEIPT,
        languageCode: "en",
        name: "AU Receipt",
        subject: "Your BESTSELLER sample sale receipt",
        htmlBody: receiptTemplateStarter,
        textBody: receiptHtmlToTextTemplate(receiptTemplateStarter)
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

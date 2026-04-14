import { z } from "zod";

export const checkoutSchema = z.object({
  countryCode: z.enum(["US", "CA", "AU"]),
  regionCode: z.string().optional(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().max(30).optional(),
  paymentConfirmed: z.literal(true),
  paymentMethodNote: z.string().max(120).default("External pinpad"),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().int().positive()
    })
  ).min(1)
});

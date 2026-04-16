import { z } from "zod";
import { emailAddressSchema, paymentMethodNoteSchema, personNameSchema, resourceIdSchema } from "@/lib/validation/primitives";

export const checkoutSchema = z.object({
  customerName: personNameSchema.max(120),
  customerEmail: emailAddressSchema,
  customerPhone: z.string().trim().max(30).optional().or(z.literal("")),
  paymentConfirmed: z.literal(true),
  paymentMethodNote: paymentMethodNoteSchema.default("External pinpad"),
  items: z.array(
    z.object({
      itemId: resourceIdSchema,
      quantity: z.number().int().positive()
    })
  ).min(1)
});

import { z } from "zod";

import { BaseEntityZ } from "./baseEntity.schema.js";

export const ContactZ = BaseEntityZ.extend({
  name: z.string().min(1),
  email: z.email().optional(),
  phones: z
    .array(
      z.object({
        number: z.e164(),
        country: z.string().length(2).optional(),
        national: z.string().optional(),
        label: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  address: z.string().optional(),
  note: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasEmail = !!data.email;
  const hasPhoneArray =
    Array.isArray((data as any).phones) && (data as any).phones.length > 0;
  const hasPhone = !!(data as any).phone || hasPhoneArray;
  const hasAddress = !!data.address;
  const hasNote = !!data.note;

  if (!hasEmail && !hasPhone && !hasAddress && !hasNote) {
    ctx.addIssue({
      code: "custom",
      message:
        "At least one of email, phone (or phones), address, or note must be provided",
    });
  }
});

export type Contact = z.infer<typeof ContactZ>;

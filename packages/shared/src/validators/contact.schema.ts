import { z } from "zod";

import { BaseEntityZ } from "./baseEntity.schema.js";

export const ContactZ = BaseEntityZ.extend({
  name: z.string().min(1),
  email: z.email().optional(),
  phone: z.e164().optional(),
  address: z.string().optional(),
  note: z.string().optional(),
}).superRefine((data, ctx) => {
  const hasEmail = !!data.email;
  const hasPhone = !!data.phone;
  const hasAddress = !!data.address;
  const hasNote = !!data.note;

  if (!hasEmail && !hasPhone && !hasAddress && !hasNote) {
    ctx.addIssue({
      code: "custom",
      message:
        "At least one of email, phone, address, or note must be provided",
    });
  }
});

export type Contact = z.infer<typeof ContactZ>;

import { z } from "zod";

const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;

export const ContactBaseSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phoneNumber: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[+\d().\-\s]+$/, "Invalid phone number")
    .optional(),
  email: z.string().email().optional(),
  address: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
});

export const ContactCreateSchema = ContactBaseSchema.extend({
  owner: z.string().regex(ObjectIdRegex, "Invalid owner id"),
  sharedWith: z.array(z.string().regex(ObjectIdRegex)).optional(),
});

export const ContactUpdateSchema = ContactBaseSchema.partial().extend({
  owner: z.string().regex(ObjectIdRegex, "Invalid owner id").optional(),
  sharedWith: z.array(z.string().regex(ObjectIdRegex)).optional(),
});

export const ContactResponseSchema = ContactBaseSchema.extend({
  id: z.string(),
  owner: z.string(),
  sharedWith: z.array(z.string()).optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const ContactShareSchema = z.object({
  contact: z.string().regex(ObjectIdRegex, "Invalid contact id"),
  user: z.string().regex(ObjectIdRegex, "Invalid user id"),
});

export type ContactCreate = z.infer<typeof ContactCreateSchema>;
export type ContactUpdate = z.infer<typeof ContactUpdateSchema>;
export type ContactResponse = z.infer<typeof ContactResponseSchema>;
export type ContactShare = z.infer<typeof ContactShareSchema>;

import mongoose, { Types } from "mongoose";

import createBaseSchema, { BaseDoc } from "./base.model.js";

export interface IContact extends BaseDoc {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  owner: Types.ObjectId;
}

const contactSchema = createBaseSchema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: false },
    email: { type: String, required: false },
    address: { type: String, required: false },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

contactSchema.index({ owner: 1, firstName: 1, lastName: 1 });

export const Contact = mongoose.model<IContact>("Contact", contactSchema);

export default Contact;

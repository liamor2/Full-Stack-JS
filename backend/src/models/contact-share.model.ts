import mongoose, { Types } from "mongoose";

import createBaseSchema, { BaseDoc } from "./base.model.js";

export interface IContactShare extends BaseDoc {
  contact: Types.ObjectId;
  user: Types.ObjectId;
  sharedBy?: Types.ObjectId;
}

const contactShareSchema = createBaseSchema(
  {
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true },
);

contactShareSchema.index({ contact: 1, user: 1 }, { unique: true });

export const ContactShare = mongoose.model<IContactShare>(
  "ContactShare",
  contactShareSchema,
);

export default ContactShare;

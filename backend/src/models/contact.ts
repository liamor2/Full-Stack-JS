import mongoose from "mongoose";

const def: Record<string, any> = {
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  note: { type: String },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: String, default: null },
  createdBy: { type: String },
  updatedBy: { type: String },
};

const contactSchema = new mongoose.Schema(def, { timestamps: true });

contactSchema.index({ email: 1 }, { unique: false });

export const ContactModel = mongoose.model("Contact", contactSchema);

export default ContactModel;

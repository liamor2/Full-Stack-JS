import { ContactZ } from "@full-stack-js/shared";
import mongoose from "mongoose";

import zodToMongoose from "../utils/zod-to-mongoose.js";

const def = zodToMongoose(ContactZ) as Record<string, any>;

delete def.createdAt;
delete def.updatedAt;

const contactSchema = new mongoose.Schema(def, { timestamps: true });

contactSchema.index({ email: 1 }, { unique: false });

export const ContactModel = mongoose.model("Contact", contactSchema);

export default ContactModel;

import mongoose from "mongoose";

export interface BaseDoc extends mongoose.Document {
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export function createBaseSchema(
  definition: mongoose.SchemaDefinition,
  options?: mongoose.SchemaOptions,
) {
  const baseDefinition: mongoose.SchemaDefinition = {
    isActive: { type: Boolean, default: true },
    createdBy: { type: String, required: false },
    updatedBy: { type: String, required: false },
    ...definition,
  };

  const schema = new mongoose.Schema(baseDefinition, {
    timestamps: true,
    ...(options || {}),
  });

  return schema;
}

export default createBaseSchema;

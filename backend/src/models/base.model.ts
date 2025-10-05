import mongoose from "mongoose";

/**
 * Common fields shared by application documents.
 *
 * Use `BaseDoc` as a base interface when defining model document types to
 * include application-level metadata (soft-delete, audit fields, timestamps).
 */
export interface BaseDoc extends mongoose.Document {
  isActive: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create a Mongoose Schema that includes base application fields.
 *
 * This helper merges the provided `definition` with common fields used by
 * many models (isActive, createdBy, updatedBy) and enables timestamps.
 *
 * @param definition - Mongoose schema definition for model-specific fields
 * @param options - optional mongoose.SchemaOptions to pass through
 * @returns a configured mongoose.Schema instance
 */
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

import type { Request } from "express";
import { Model, Document, Types } from "mongoose";
import { z } from "zod";

import { ForbiddenError, BadRequestError } from "../errors/http.error.js";

export type ID = string | Types.ObjectId;

export type CrudOptions<T> = {
  publicFields?: Array<keyof T>;
  createSchema?: z.ZodType;
  updateSchema?: z.ZodType;
  allow?: (
    action: "list" | "read" | "create" | "update" | "delete",
    ctx: { req?: Request; resource?: T | null },
  ) => boolean | Promise<boolean>;
};

/**
 * Generic CRUD service wrapper around a Mongoose Model.
 *
 * This class centralizes common CRUD operations (create, list, read, update,
 * delete) for a given Mongoose model. It supports:
 * - optional permission checks via the `allow` callback in CrudOptions
 * - optional Zod-based payload validation via `createSchema`/`updateSchema`
 * - sanitization of output fields using `publicFields`
 *
 * T should be a Mongoose Document type representing the model's document.
 */
export class CrudService<T extends Document> {
  protected options: CrudOptions<T> | undefined;

  constructor(
    protected model: Model<T>,
    options?: CrudOptions<T>,
  ) {
    this.options = options;
  }

  // `check` helper removed; permission checks are done inline per method using the provided `allow` option.

  /**
   * Sanitize a document using the configured `publicFields`.
   *
   * If `publicFields` is not configured the original document (or null) is
   * returned. When `publicFields` is provided the returned value is a plain
   * object containing only those keys.
   *
   * @param doc - Mongoose document or null
   * @returns null | T | Record<string, unknown>
   */
  protected sanitize(doc: T | null) {
    if (!doc) return null;
    if (!this.options?.publicFields) return doc;
    const maybeDoc = doc as unknown as { toObject?: () => Record<string, unknown> } & Record<string, unknown>;
    const obj = maybeDoc.toObject ? maybeDoc.toObject() : maybeDoc;
    const out: Record<string, unknown> = {};
    for (const f of this.options.publicFields as Array<string>) {
      if (f in obj) out[f as string] = obj[f as string];
    }
    return out;
  }

  /**
   * Create a new document.
   *
   * This method optionally checks permission via `allow('create')` and
   * validates the payload with `createSchema` if present. On validation
   * failure a BadRequestError is thrown. Returns the sanitized created
   * document.
   *
   * @param data - Partial data used to create the document
   * @param ctx  - Optional context (e.g. the Express Request)
   */
  async create(data: Partial<T>, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("create", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    // validate payload if schema provided
    if (this.options?.createSchema) {
      const res = await this.options.createSchema.safeParseAsync(data);
      if (!res.success) {
        throw new BadRequestError("Validation failed", res.error.format());
      }
      // use the parsed/validated data
      data = res.data as Partial<T>;
    }
    const doc = await this.model.create(data as unknown as T);
    return this.sanitize(doc as T);
  }

  /**
   * Find documents matching a filter.
   *
   * Permission is checked via `allow('list')` if configured. Returns an
   * array of sanitized results.
   *
   * @param filter - optional Mongo filter object
   * @param ctx    - optional context containing the Request
   */
  async findAll(filter = {}, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("list", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    const docs = await this.model.find(filter as unknown as Record<string, unknown>).exec();
    return (docs as T[]).map((d) => this.sanitize(d));
  }

  /**
   * Find a single document by id.
   *
   * Permission is checked via `allow('read')` if configured.
   *
   * @param id  - document id (string or ObjectId)
   * @param ctx - optional context containing the Request
   */
  async findById(id: ID, ctx: { req?: Request } = {}) {
    const doc = await this.model.findById(id as unknown as Types.ObjectId | string).exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("read", { req: ctx.req, resource: doc as unknown as T | null });
      if (!ok) throw new ForbiddenError();
    }
    return this.sanitize(doc as T | null);
  }

  /**
   * Update a document by id.
   *
   * Permission is checked via `allow('update')` if configured and payload is
   * validated via `updateSchema` if provided.
   *
   * @param id   - document id
   * @param data - partial update payload
   * @param ctx  - optional Request context
   */
  async update(id: ID, data: Partial<T>, ctx: { req?: Request } = {}) {
    const existing = await this.model.findById(id as unknown as Types.ObjectId | string).exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("update", { req: ctx.req, resource: existing as unknown as T | null });
      if (!ok) throw new ForbiddenError();
    }
    // validate payload if update schema provided
    if (this.options?.updateSchema) {
      const res = await this.options.updateSchema.safeParseAsync(data);
      if (!res.success) {
        throw new BadRequestError("Validation failed", res.error.format());
      }
      data = res.data as Partial<T>;
    }
    const updated = await this.model
      .findByIdAndUpdate(id as unknown as Types.ObjectId | string, data as unknown as Partial<T>, { new: true })
      .exec();
    return this.sanitize(updated as T | null);
  }

  /**
   * Delete a document by id.
   *
   * Permission is checked via `allow('delete')` if configured.
   *
   * @param id  - document id
   * @param ctx - optional Request context
   */
  async remove(id: ID, ctx: { req?: Request } = {}) {
    const existing = await this.model.findById(id as unknown as Types.ObjectId | string).exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("delete", { req: ctx.req, resource: existing as unknown as T | null });
      if (!ok) throw new ForbiddenError();
    }
    const deleted = await this.model.findByIdAndDelete(id as unknown as Types.ObjectId | string).exec();
    return this.sanitize(deleted as T | null);
  }
}

export default CrudService;

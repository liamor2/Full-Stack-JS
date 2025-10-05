import type { Request } from "express";
import { Model, Document, Types } from "mongoose";
import { z } from "zod";

import { ForbiddenError, BadRequestError } from "../errors/http.error.js";

export type ID = string | Types.ObjectId;

export type CrudOptions<T> = {
  publicFields?: Array<keyof T>;
  createSchema?: z.ZodTypeAny;
  updateSchema?: z.ZodTypeAny;
  allow?: (
    action: "list" | "read" | "create" | "update" | "delete",
    ctx: { req?: Request; resource?: Record<string, unknown> | null },
  ) => boolean | Promise<boolean>;
};

/**
 * Generic CRUD service around a Mongoose Model that returns plain objects
 * (lean DTOs) and centralizes permission checks and payload validation.
 *
 * Responsibilities:
 * - validate incoming payloads with optional Zod schemas
 * - enforce permission rules via the `allow` callback
 * - return sanitized plain objects (filtered by `publicFields`) instead of
 *   Mongoose Documents to simplify consumption by route handlers
 *
 * Notes on typing: Mongoose documents and lean results differ; this service
 * converts created documents to plain objects and always returns plain
 * objects (or null) to callers.
 */
export class CrudService<T extends Document> {
  protected options: CrudOptions<T> | undefined;

  constructor(protected model: Model<T>, options?: CrudOptions<T>) {
    this.options = options;
  }

  /**
   * Return the configured options. This is intentionally a getter so routers
   * can inspect schemas or other options without accessing protected fields.
   */
  getOptions() {
    return this.options;
  }

  /**
   * Convert a document or plain object to a sanitized plain object according
   * to `publicFields` configuration. If `publicFields` is not configured the
   * original plain object is returned.
   *
   * @param doc - a Mongoose Document or a plain object representing the doc
   */
  protected sanitize(doc: T | Record<string, unknown> | null) {
    if (!doc) return null;
    const obj = (doc as T & { toObject?: () => Record<string, unknown> }).toObject
      ? (doc as T & { toObject: () => Record<string, unknown> }).toObject()
      : (doc as Record<string, unknown>);
    if (!this.options?.publicFields) return obj;
    const out: Record<string, unknown> = {};
    for (const f of this.options.publicFields as Array<string>) {
      if (f in obj) out[f as string] = obj[f as string];
    }
    return out;
  }

  /**
   * Create a new document.
   *
   * Validates payload with `createSchema` when provided and enforces
   * permissions via `allow('create')` when configured. Returns a sanitized
   * plain object representing the created resource.
   *
   * @param data - partial data for creation
   * @param ctx  - optional context (e.g. Express Request)
   */
  async create(data: Partial<T>, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("create", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    if (this.options?.createSchema) {
      const res = await this.options.createSchema.safeParseAsync(data);
      if (!res.success) throw new BadRequestError("Validation failed", res.error.format());
      data = res.data as Partial<T>;
    }
    const doc = await this.model.create(data as unknown as T);
    return this.sanitize((doc as T & { toObject: () => Record<string, unknown> }).toObject());
  }

  /**
   * Find documents matching the provided filter and return sanitized plain
   * objects. Permission is checked with `allow('list')` when configured.
   *
   * @param filter - Mongo filter
   * @param ctx    - optional context
   */
  async findAll(filter = {}, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("list", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    const docs = await this.model.find(filter as unknown as Record<string, unknown>).lean().exec();
    return (docs as Array<Record<string, unknown>>).map((d) => this.sanitize(d));
  }

  /**
   * Find one document by id and return a sanitized plain object.
   * Permission is checked with `allow('read')` when configured.
   */
  async findById(id: ID, ctx: { req?: Request } = {}) {
    const doc = await this.model.findById(id as unknown as Types.ObjectId | string).lean().exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("read", { req: ctx.req, resource: doc as Record<string, unknown> | null });
      if (!ok) throw new ForbiddenError();
    }
    return this.sanitize(doc as Record<string, unknown> | null);
  }

  /**
   * Update a document by id. Validates payload with `updateSchema` when
   * provided and enforces `allow('update')` if configured. Returns the
   * sanitized plain object for the updated resource or null if not found.
   */
  async update(id: ID, data: Partial<T>, ctx: { req?: Request } = {}) {
    const existing = await this.model.findById(id as unknown as Types.ObjectId | string).lean().exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("update", { req: ctx.req, resource: existing as Record<string, unknown> | null });
      if (!ok) throw new ForbiddenError();
    }
    if (this.options?.updateSchema) {
      const res = await this.options.updateSchema.safeParseAsync(data);
      if (!res.success) throw new BadRequestError("Validation failed", res.error.format());
      data = res.data as Partial<T>;
    }
    const updated = await this.model.findOneAndUpdate({ _id: id as unknown as Types.ObjectId | string }, data as unknown as Partial<T>, { new: true }).lean().exec();
    return this.sanitize(updated as Record<string, unknown> | null);
  }

  /**
   * Delete a document by id after enforcing `allow('delete')` when
   * configured. Returns the sanitized deleted resource or null if not found.
   */
  async remove(id: ID, ctx: { req?: Request } = {}) {
    const existing = await this.model.findById(id as unknown as Types.ObjectId | string).lean().exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("delete", { req: ctx.req, resource: existing as Record<string, unknown> | null });
      if (!ok) throw new ForbiddenError();
    }
    const deleted = await this.model.findByIdAndDelete(id as unknown as Types.ObjectId | string).lean().exec();
    return this.sanitize(deleted as Record<string, unknown> | null);
  }
}

export default CrudService;

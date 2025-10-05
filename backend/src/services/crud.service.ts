import type { Request } from "express";
import { Model, Document, Types } from "mongoose";

import { ForbiddenError } from "../errors/http.error.js";

export type ID = string | Types.ObjectId;

export type CrudOptions<T> = {
  publicFields?: Array<keyof T>;
  allow?: (
    action: "list" | "read" | "create" | "update" | "delete",
    ctx: { req?: Request; resource?: T | null },
  ) => boolean | Promise<boolean>;
};

export class CrudService<T extends Document> {
  protected options: CrudOptions<T> | undefined;

  constructor(
    protected model: Model<T>,
    options?: CrudOptions<T>,
  ) {
    this.options = options;
  }

  // `check` helper removed; permission checks are done inline per method using the provided `allow` option.

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

  async create(data: Partial<T>, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("create", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    const doc = await this.model.create(data as unknown as T);
    return this.sanitize(doc as T);
  }

  async findAll(filter = {}, ctx: { req?: Request } = {}) {
    if (this.options?.allow) {
      const ok = await this.options.allow("list", { req: ctx.req, resource: null });
      if (!ok) throw new ForbiddenError();
    }
    const docs = await this.model.find(filter as unknown as Record<string, unknown>).exec();
    return (docs as T[]).map((d) => this.sanitize(d));
  }

  async findById(id: ID, ctx: { req?: Request } = {}) {
    const doc = await this.model.findById(id as unknown as Types.ObjectId | string).exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("read", { req: ctx.req, resource: doc as unknown as T | null });
      if (!ok) throw new ForbiddenError();
    }
    return this.sanitize(doc as T | null);
  }

  async update(id: ID, data: Partial<T>, ctx: { req?: Request } = {}) {
    const existing = await this.model.findById(id as unknown as Types.ObjectId | string).exec();
    if (this.options?.allow) {
      const ok = await this.options.allow("update", { req: ctx.req, resource: existing as unknown as T | null });
      if (!ok) throw new ForbiddenError();
    }
    const updated = await this.model
      .findByIdAndUpdate(id as unknown as Types.ObjectId | string, data as unknown as Partial<T>, { new: true })
      .exec();
    return this.sanitize(updated as T | null);
  }

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

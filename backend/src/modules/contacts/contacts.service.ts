import {
  ContactCreateSchema,
  ContactUpdateSchema,
  ContactResponseSchema,
} from "@full-stack-js/shared";
import type { Request } from "express";
import { Types } from "mongoose";

import { ForbiddenError, UnauthorizedError } from "../../errors/http.error.js";
import {
  ContactShare,
  IContactShare,
} from "../../models/contact-share.model.js";
import { Contact, IContact } from "../../models/contacts.model.js";
import CrudService from "../../services/crud.service.js";
import type { RequestWithUser } from "../../types/requests.js";

type ContactPayload = Partial<IContact> & { sharedWith?: string[] };

class ContactsService extends CrudService<IContact> {
  constructor() {
    super(Contact, {
      publicFields: [
        "_id",
        "id",
        "firstName",
        "lastName",
        "phoneNumber",
        "email",
        "address",
        "owner",
        "createdAt",
        "updatedAt",
        "isActive",
        "createdBy",
        "updatedBy",
      ] as Array<keyof IContact>,
      createSchema: ContactCreateSchema,
      updateSchema: ContactUpdateSchema,
      responseSchema: ContactResponseSchema,
      allow: async (action, { req, resource }) =>
        this.canPerform(action, req as RequestWithUser | undefined, resource),
    });
  }

  private ensureUser(req?: RequestWithUser) {
    const user = req?.user;
    if (!user?.id) throw new UnauthorizedError();
    return { id: user.id as string };
  }

  private async canPerform(
    action: "list" | "read" | "create" | "update" | "delete",
    req: RequestWithUser | undefined,
    resource?: Record<string, unknown> | null,
  ) {
    const user = req?.user;
    if (!user?.id) return false;

    if (!resource) {
      return action === "create" || action === "list";
    }

    const ownerId = this.extractOwnerId(resource);
    if (ownerId && ownerId === user.id) return true;

    if (action === "read") {
      return this.isSharedWith(resource, user.id as string);
    }

    return false;
  }

  private extractOwnerId(resource?: Record<string, unknown> | null) {
    if (!resource) return null;
    const owner = resource.owner as Types.ObjectId | string | undefined;
    if (!owner) return null;
    if (owner instanceof Types.ObjectId) return owner.toString();
    if (typeof owner === "object" && owner !== null && "toString" in owner) {
      return (owner as { toString: () => string }).toString();
    }
    if (typeof owner === "string") return owner;
    return null;
  }

  private async isSharedWith(
    resource: Record<string, unknown>,
    userId: string,
  ) {
    const contactId =
      (resource._id as Types.ObjectId | string | undefined) ??
      (resource.id as string | undefined);
    if (!contactId) return false;
    const filter = {
      contact: new Types.ObjectId(contactId),
      user: new Types.ObjectId(userId),
    } satisfies Partial<IContactShare>;
    const share = await ContactShare.findOne(filter).lean().exec();
    return Boolean(share);
  }

  private toStringId(value: unknown) {
    if (!value) return undefined;
    if (value instanceof Types.ObjectId) return value.toString();
    if (typeof value === "string") return value;
    if (
      typeof value === "object" &&
      value !== null &&
      "toString" in value &&
      typeof (value as { toString: () => unknown }).toString === "function"
    ) {
      return (value as { toString: () => string }).toString();
    }
    return undefined;
  }

  private async mapShares(contactIds: string[]) {
    if (!contactIds.length) return new Map<string, string[]>();
    const shares = await ContactShare.find({
      contact: { $in: contactIds.map((id) => new Types.ObjectId(id)) },
    })
      .lean()
      .exec();

    const map = new Map<string, string[]>();
    for (const share of shares) {
      const contactId = this.toStringId(share.contact);
      const userId = this.toStringId(share.user);
      if (!contactId || !userId) continue;
      const arr = map.get(contactId) ?? [];
      arr.push(userId);
      map.set(contactId, arr);
    }
    return map;
  }

  private formatContact(
    doc: IContact | Record<string, unknown> | null,
    shares?: Map<string, string[]>,
  ) {
    const sanitized = super.sanitize(doc) as Record<string, unknown> | null;
    if (!sanitized) return null;

    const rawId = this.toStringId(
      (doc as { _id?: Types.ObjectId })?._id ??
        (sanitized as { _id?: string })._id ??
        (sanitized as { id?: string }).id,
    );
    if (rawId) {
      sanitized.id = rawId;
      sanitized._id = rawId;
    }

    const ownerId = this.toStringId(
      (doc as { owner?: Types.ObjectId | string })?.owner ??
        (sanitized as { owner?: string }).owner,
    );
    if (ownerId) sanitized.owner = ownerId;

    const shared = rawId ? (shares?.get(rawId) ?? []) : [];
    (
      sanitized as Record<string, unknown> & { sharedWith?: string[] }
    ).sharedWith = shared;

    return sanitized;
  }

  async findAll(
    filter = {},
    ctx: { req?: Request } = {},
  ): Promise<Array<Record<string, unknown>>> {
    const reqWithUser = ctx.req as RequestWithUser | undefined;
    const user = this.ensureUser(reqWithUser);

    const allowed = await this.canPerform("list", reqWithUser, null);
    if (!allowed) throw new ForbiddenError();

    const ownerObjectId = new Types.ObjectId(user.id);

    const sharedContactIds = await ContactShare.find({ user: ownerObjectId })
      .distinct("contact")
      .exec();

    const baseFilter = { ...(filter as Record<string, unknown>) };

    const orConditions: Array<Record<string, unknown>> = [
      { owner: ownerObjectId },
    ];
    if (sharedContactIds.length) {
      orConditions.push({ _id: { $in: sharedContactIds } });
    }

    const docs = await Contact.find({
      ...baseFilter,
      $or: orConditions,
    })
      .lean()
      .exec();

    const contactIds = docs
      .map((doc) => this.toStringId(doc._id))
      .filter((id): id is string => Boolean(id));
    const shares = await this.mapShares(contactIds);

    return docs
      .map((doc) => this.formatContact(doc, shares))
      .filter((doc): doc is Record<string, unknown> => Boolean(doc));
  }

  async findById(id: string, ctx: { req?: Request } = {}) {
    const doc = await super.findById(id, ctx);
    if (!doc) return doc;
    const shares = await this.mapShares([id]);
    return this.formatContact(doc, shares);
  }

  async create(data: ContactPayload, ctx: { req?: Request } = {}) {
    const reqWithUser = ctx.req as RequestWithUser | undefined;
    const user = this.ensureUser(reqWithUser);

    const { sharedWith = [], ...contactData } = data;
    const ownerId = this.toStringId(contactData.owner) ?? user.id;

    const payload: Partial<IContact> = {
      ...contactData,
      owner: new Types.ObjectId(ownerId),
    };

    const created = await super.create(payload, ctx);

    if (!created?.id) return created;

    if (sharedWith.length) {
      await this.syncShares(created.id as string, sharedWith, ownerId, user.id);
    }

    return this.findById(created.id as string, ctx);
  }

  async update(id: string, data: ContactPayload, ctx: { req?: Request } = {}) {
    const { sharedWith, ...contactData } = data;

    const payload: Partial<IContact> = { ...contactData };
    if (payload.owner) {
      const ownerString = this.toStringId(payload.owner);
      if (ownerString) payload.owner = new Types.ObjectId(ownerString);
    }

    const updated = await super.update(id, payload, ctx);
    if (!updated) return updated;

    if (sharedWith) {
      const ownerId = this.toStringId(updated.owner) ?? undefined;
      const user = (ctx.req as RequestWithUser | undefined)?.user;
      await this.syncShares(
        id,
        sharedWith,
        ownerId,
        user?.id as string | undefined,
      );
    }

    return this.findById(id, ctx);
  }

  async remove(id: string, ctx: { req?: Request } = {}) {
    const deleted = await super.remove(id, ctx);
    if (!deleted) return deleted;

    await ContactShare.deleteMany({ contact: new Types.ObjectId(id) }).exec();

    return this.formatContact(deleted, new Map());
  }

  private async syncShares(
    contactId: string,
    sharedWith: string[],
    ownerId?: string,
    sharedBy?: string,
  ) {
    const contactObjectId = new Types.ObjectId(contactId);
    const sharedByObjectId = sharedBy
      ? new Types.ObjectId(sharedBy)
      : undefined;

    const normalized = [...new Set(sharedWith)]
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id))
      .filter((oid) => oid.toString() !== ownerId);

    const existing = await ContactShare.find({ contact: contactObjectId })
      .lean()
      .exec();

    const existingSet = new Set(existing.map((s) => s.user.toString()));
    const normalizedSet = new Set(normalized.map((oid) => oid.toString()));

    const toAdd = normalized.filter((oid) => !existingSet.has(oid.toString()));
    const toRemove = existing.filter(
      (share) => !normalizedSet.has(share.user.toString()),
    );

    if (toAdd.length) {
      await ContactShare.insertMany(
        toAdd.map((userId) => ({
          contact: contactObjectId,
          user: userId,
          sharedBy: sharedByObjectId,
        })),
      );
    }

    if (toRemove.length) {
      await ContactShare.deleteMany({
        contact: contactObjectId,
        user: { $in: toRemove.map((s) => s.user) },
      });
    }
  }
}

export const contactsService = new ContactsService();

export default contactsService;

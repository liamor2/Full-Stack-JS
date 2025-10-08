import { RequestHandler } from "express";
import type mongoose from "mongoose";

type ModelLike = mongoose.Model<any>;

export interface CreateCrudOptions {
  model: ModelLike;
  schema?: any;
  idParam?: string;
}

export interface CrudHandlers {
  list: RequestHandler;
  get: RequestHandler;
  create: RequestHandler;
  patch: RequestHandler;
  put: RequestHandler;
  remove: RequestHandler;
}

/**
 * Create a set of standard CRUD request handlers for an Express-like application
 * backed by a Mongoose-style model.
 *
 * The returned handlers perform basic validation (when a `schema` is provided),
 * common query/pagination handling and soft-delete support when documents have a
 * `deleted` flag.
 *
 * Behavior of the generated handlers:
 * - list:
 *   - Reads optional query parameters `limit` and `skip`.
 *   - `limit` defaults to 50 and is clamped to a maximum of 100.
 *   - `skip` defaults to 0 and is clamped to a minimum of 0.
 *   - Only documents where `deleted === false` are returned.
 *   - Responds with the found documents as JSON.
 * - get:
 *   - Reads the resource id from `req.params[idParam]` (default param name: "id").
 *   - Fetches the document by id and returns 404 if not found or if `deleted === true`.
 *   - Responds with the document as JSON when found.
 * - create:
 *   - Optionally validates `req.body` with the provided `schema` (if present).
 *   - Creates a new document and responds with HTTP 201 and the created document as JSON.
 * - patch:
 *   - Reads id from `req.params[idParam]`.
 *   - Optionally validates a partial update using `schema.partial()` if `schema` is provided.
 *   - Performs a findByIdAndUpdate returning the new document; responds 404 if no document found.
 *   - Responds with the updated document as JSON.
 * - put:
 *   - Reads id from `req.params[idParam]`.
 *   - Optionally validates `req.body` with the provided `schema`.
 *   - Replaces the document using findOneAndReplace; responds 404 if no document found.
 *   - Responds with the replaced document as JSON.
 * - remove:
 *   - Reads id from `req.params[idParam]`.
 *   - If the document does not exist, responds 404.
 *   - If the found document has a `deleted` property, performs a soft-delete by setting
 *     `deleted = true` and `deletedAt = <ISO timestamp>` and saves the document.
 *   - Otherwise, performs a hard delete using deleteOne.
 *   - Responds with `{ ok: true }` on success.
 *
 * Common notes:
 * - Any thrown errors are forwarded to Express error middleware via `next(err)`.
 * - Handlers assume the provided `model` implements typical Mongoose Model instance methods
 *   such as `find`, `findById`, `create`, `findByIdAndUpdate`, `findOneAndReplace`,
 *   `deleteOne` and that individual documents support `.save()` when mutated.
 *
 * @param options - Configuration for CRUD handler creation.
 * @param options.model - A Mongoose-like model used to query and mutate documents.
 * @param options.schema - Optional validation schema (e.g. a Zod schema). If provided,
 *                          `create` uses `schema.parse(req.body)`, `patch` uses
 *                          `schema.partial().parse(req.body)`, and `put` uses
 *                          `schema.parse(req.body)`.
 * @param options.idParam - Optional name of the URL parameter that contains the resource id.
 *                          Defaults to `"id"`.
 * @returns An object with Express-compatible request handlers:
 *          `{ list, get, create, patch, put, remove }`.
 */
export function createCrud(options: CreateCrudOptions): CrudHandlers {
  const { model, schema, idParam = "id" } = options;

  const list: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const q: any = { deleted: false };
      const limit = Math.min(Number(req.query.limit ?? 50), 100);
      const skip = Math.max(Number(req.query.skip ?? 0), 0);
      const docs = await model.find(q).skip(skip).limit(limit).lean();
      res.json(docs);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  const get: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const id = String(req.params[idParam]);
      const doc: any = await model.findById(id).lean();
      if (!doc || doc.deleted) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(doc);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  const create: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const data = schema ? schema.parse(req.body) : req.body;
      // Attach creator/updater if available from authentication middleware
      const anyReq = req as any;
      const userId = anyReq.userId as string | undefined;
      if (userId) {
        // ensure fields are set on the document
        const d: any = data;
        d.createdBy = d.createdBy ?? userId;
        d.updatedBy = userId;
      }
      const created = await model.create(data);
      res.status(201).json(created);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  const patch: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const id = String(req.params[idParam]);
      const partial = schema ? schema.partial().parse(req.body) : req.body;
      const anyReq = req as any;
      const userId = anyReq.userId as string | undefined;
      if (userId) {
        const p: any = partial;
        p.updatedBy = userId;
      }
      const doc: any = await model
        .findByIdAndUpdate(id, partial, { new: true })
        .lean();
      if (!doc) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(doc);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  const put: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const id = String(req.params[idParam]);
      const value = schema ? schema.parse(req.body) : req.body;
      const anyReq = req as any;
      const userId = anyReq.userId as string | undefined;
      if (userId) {
        const v: any = value;
        v.updatedBy = userId;
      }
      const doc: any = await model.findOneAndReplace({ _id: id }, value, {
        new: true,
      });
      if (!doc) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(doc);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  const remove: RequestHandler = (async (req, res, next): Promise<void> => {
    try {
      const id = String(req.params[idParam]);
      const doc: any = await model.findById(id);
      if (!doc) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      if ("deleted" in doc) {
        doc.deleted = true;
        doc.deletedAt = new Date().toISOString();
        await doc.save();
        res.json({ ok: true });
        return;
      }
      await model.deleteOne({ _id: id });
      res.json({ ok: true });
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;

  return { list, get, create, patch, put, remove };
}

export default createCrud;

/**
 * Creates an Express request handler that retrieves a single document from the provided model
 * based on a route parameter.
 *
 * The returned handler:
 *  - reads the route parameter `req.params[paramName]` (defaults to "key"),
 *  - coerces the parameter to a string,
 *  - determines the search field (`fieldName` if provided, otherwise `paramName`),
 *  - queries the model with `{ [field]: value, deleted: false }` using `findOne(...).lean()`,
 *  - responds with HTTP 404 and `{ error: "Not found" }` if no document is found,
 *  - responds with the found document as JSON if successful,
 *  - forwards any errors to `next(err)`.
 *
 * @param model - A model-like object exposing `findOne(query).lean()` for querying documents.
 * @param paramName - The name of the route parameter to read from `req.params`. Defaults to `"key"`.
 * @param fieldName - Optional override for the document field to match against. If omitted, `paramName` is used.
 * @returns An Express-compatible async RequestHandler that performs the described lookup and response behavior.
 */
export function getByParam(
  model: ModelLike,
  paramName = "key",
  fieldName?: string,
): RequestHandler {
  return (async (req, res, next): Promise<void> => {
    try {
      const raw = req.params[paramName];
      const value = String(raw);
      const field = fieldName ?? paramName;
      const q: any = { [field]: value, deleted: false };
      const doc: any = await model.findOne(q).lean();
      if (!doc) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      res.json(doc);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;
}

/**
 * Creates an Express request handler that looks up documents by a URL parameter and returns them as JSON.
 *
 * The generated handler:
 * - Reads a parameter from req.params (defaults to "key"),
 * - Coerces the parameter value to a string,
 * - Builds a query object of the form `{ [field]: value, deleted: false }`,
 * - Uses the provided model's `find` method with `.lean()` to fetch documents,
 * - Sends the resulting array of documents via `res.json(...)`,
 * - Forwards any thrown errors to `next`.
 *
 * @param model - A data model exposing a `find(query)` method that returns a Promise of documents (e.g. a Mongoose-like model). The model is expected to accept a plain object query and support `.lean()`.
 * @param paramName - The name of the URL parameter to read from `req.params`. Defaults to `"key"`.
 * @param fieldName - Optional. The document field to query against. If omitted, the `paramName` is used as the field name.
 *
 * @returns An Express-compatible async RequestHandler that performs the described lookup and responds with JSON.
 *
 * @remarks
 * - The handler always adds `deleted: false` to the query to filter out soft-deleted documents.
 * - The parameter value is converted with `String(...)` before being used in the query.
 * - The handler sends whatever the model returns (typically an array) without additional transformation.
 * - Input is not validated beyond the string coercion; callers should validate or sanitize parameters if necessary.
 *
 * @example
 * // Use with an Express router (assuming `ItemModel` is a ModelLike)
 * // router.get('/items/:key', findByParam(ItemModel));
 *
 * @throws Any error from `model.find(...)` is caught and passed to the next middleware via `next(err)`.
 */
export function findByParam(
  model: ModelLike,
  paramName = "key",
  fieldName?: string,
): RequestHandler {
  return (async (req, res, next): Promise<void> => {
    try {
      const raw = req.params[paramName];
      const value = String(raw);
      const field = fieldName ?? paramName;
      const q: any = { [field]: value, deleted: false };
      const docs = await model.find(q).lean();
      res.json(docs);
    } catch (err) {
      next(err as any);
    }
  }) as RequestHandler;
}

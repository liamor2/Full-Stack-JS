import { ContactZ } from "@full-stack-js/shared";
import { z } from "zod";
import { Router } from "express";

import createCrud from "../controllers/crud.js";
import validateBody from "../middleware/validate.js";
import { ContactModel } from "../models/contact.js";
import requireAuth from "../middleware/auth.js";

const FindCriteriaZ = ContactZ.partial()
  .extend({
    limit: z.number().int().positive().max(100).optional(),
    offset: z.number().int().min(0).optional(),
  })
  .refine(
    (v) => {
      const obj = v as Record<string, unknown>;
      const keys = Object.keys(obj).filter(
        (k) => k !== "limit" && k !== "offset",
      );
      const hasSearchKeys = keys.length > 0;
      const hasPagination =
        typeof obj.limit === "number" || typeof obj.offset === "number";
      return hasSearchKeys || hasPagination;
    },
    {
      message:
        "At least one search criterion or pagination parameter must be provided",
    },
  );

const router: Router = Router();

const handlers = createCrud({
  model: ContactModel,
  schema: ContactZ,
  idParam: "id",
});

/**
 * @openapi
 * /contacts:
 *   get:
 *     tags:
 *       - Contacts
 *     summary: List contacts
 *     responses:
 *       200:
 *         description: Array of contacts
 */
router.get("/", handlers.list);

/**
 * @openapi
 * /contacts:
 *   post:
 *     tags:
 *       - Contacts
 *     summary: Create a new contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       201:
 *         description: Created
 */
router.post("/", requireAuth, handlers.create);

/**
 * The normalized maximum number of items to return, derived from `criteria.limit`.
 *
 * If `criteria.limit` is a number, the value is clamped to the inclusive range [1, 100].
 * If `criteria.limit` is missing or not a number, the result is `undefined`, allowing
 * callers to apply a different default behavior.
 *
 * Type: number | undefined
 *
 * @remarks
 * - Protects against zero or negative limits and overly large requests.
 *
 * @example
 * // criteria.limit = 50  -> limit === 50
 * // criteria.limit = 500 -> limit === 100
 * // criteria.limit = 0   -> limit === 1
 * // criteria.limit = "10"-> limit === undefined
 */
router.post("/find", validateBody(FindCriteriaZ), async (req, res, next) => {
  console.log("POST /contacts/find", req.body);
  try {
    const criteria = req.body as Record<string, any>;
    const limit =
      typeof criteria.limit === "number"
        ? Math.min(100, Math.max(1, criteria.limit))
        : undefined;
    const offset =
      typeof criteria.offset === "number" ? Math.max(0, criteria.offset) : 0;

    const q: any = { deleted: false };
    const skipKeys = new Set(["limit", "offset", "createdAt", "updatedAt"]);
    for (const [k, v] of Object.entries(criteria)) {
      if (skipKeys.has(k)) continue;
      if (v == null) continue;

      const schemaPath = ContactModel.schema.path(k);
      const isStringField = !schemaPath || schemaPath.instance === "String";

      if (typeof v === "string" && isStringField) {
        q[k] = { $regex: v, $options: "i" };
      } else {
        q[k] = v;
      }
    }

    console.log("Search query:", q, { limit, offset });
    let query = ContactModel.find(q).lean();
    if (typeof offset === "number" && offset > 0) query = query.skip(offset);
    if (typeof limit === "number") query = query.limit(limit);

    const docs = await query.exec();
    console.log(`Found ${docs.length} contacts`);
    res.json(docs);
  } catch (err) {
    next(err as any);
  }
});

/**
 * Criteria extracted from the incoming request body.
 *
 * Treated as a generic key-value map (Record<string, any>) representing
 * search/filter/update criteria supplied by the client.
 *
 * Important notes:
 * - This is a shallow cast of req.body and does NOT perform validation or sanitization.
 *   Do not rely on this assertion for safety or correctness.
 * - Because this is a reference to req.body, mutating this object will mutate the original
 *   request body. Clone the object if you need an isolated copy.
 * - Validate and normalize all fields before using them (e.g., with Zod, Joi, express-validator,
 *   or manual checks) to prevent runtime errors and security issues (injection, prototype pollution).
 * - Prefer using a narrower, explicit type (or at least Record<string, unknown>) and narrow values
 *   after validation instead of Record<string, any>.
 *
 * @remarks
 * Replace this ad-hoc cast with a well-defined interface for allowed criteria once the shape
 * of the request body is known.
 *
 * @example
 * // Validate and pick allowed fields:
 * // const validated = criteriaSchema.parse(criteria);
 * // const filters: SearchFilters = pick(validated, ['name', 'email']);
 */
router.post("/findOne", validateBody(FindCriteriaZ), async (req, res, next) => {
  try {
    const criteria = req.body as Record<string, any>;
    const q: any = { ...criteria, deleted: false };
    const doc = await ContactModel.findOne(q).lean();
    if (!doc) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err as any);
  }
});

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     tags:
 *       - Contacts
 *     summary: Get contact by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact
 */
router.get("/:id", handlers.get);

/**
 * @openapi
 * /contacts/{id}:
 *   patch:
 *     tags:
 *       - Contacts
 *     summary: Patch contact by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: Updated
 */
router.patch("/:id", requireAuth, handlers.patch);

/**
 * @openapi
 * /contacts/{id}:
 *   put:
 *     tags:
 *       - Contacts
 *     summary: Replace contact by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Contact'
 *     responses:
 *       200:
 *         description: Replaced
 */
router.put("/:id", requireAuth, handlers.put);

/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     tags:
 *       - Contacts
 *     summary: Remove contact by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: No content
 */
router.delete("/:id", requireAuth, handlers.remove);

export default router;

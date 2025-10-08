import { ContactZ } from "@full-stack-js/shared";
import { Router } from "express";

import createCrud from "../controllers/crud.js";
import validateBody from "../middleware/validate.js";
import { ContactModel } from "../models/contact.js";
import requireAuth from "../middleware/auth.js";

const FindCriteriaZ = ContactZ.partial().refine(
  (v) => Object.keys(v as Record<string, unknown>).length > 0,
  { message: "At least one search criterion must be provided" },
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
 * Criteria object extracted from the incoming request body.
 *
 * This object is treated as a free-form map of filter and search parameters used
 * to query or filter contacts in the route handler. Typical keys may include
 * "name", "email", "phone", "tags", "page", "limit" and other consumer-defined
 * fields that drive query behavior.
 *
 * Important: the content is supplied by the client and must be validated and
 * sanitized before being used (e.g., in database queries or business logic).
 * - Validate expected keys and value types.
 * - Coerce/normalize values (e.g., convert paging params to numbers, trim strings).
 * - Use parameterized queries or ORM query builders to avoid injection attacks.
 *
 * @type {Record<string, any>} A plain object mapping criteria keys to values.
 */
router.post("/find", validateBody(FindCriteriaZ), async (req, res, next) => {
  try {
    const criteria = req.body as Record<string, any>;
    const q: any = { ...criteria, deleted: false };
    const docs = await ContactModel.find(q).lean();
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

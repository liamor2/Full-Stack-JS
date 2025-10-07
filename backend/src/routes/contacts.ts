import { ContactZ } from "@full-stack-js/shared";
import { Router } from "express";

import createCrud from "../controllers/crud.js";
import validateBody from "../middleware/validate.js";
import { ContactModel } from "../models/contact.js";

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
 *   tags:
 *     - Contacts
 *   get:
 *     summary: List contacts
 *     responses:
 *       200:
 *         description: Array of contacts
 */
router.get("/", handlers.list);

/**
 * @openapi
 * /contacts:
 *   tags:
 *     - Contacts
 *   post:
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
router.post("/", handlers.create);

// Search endpoints
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
 *   tags:
 *     - Contacts
 *   get:
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
 *   tags:
 *     - Contacts
 *   patch:
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
router.patch("/:id", handlers.patch);

/**
 * @openapi
 * /contacts/{id}:
 *   tags:
 *     - Contacts
 *   put:
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
router.put("/:id", handlers.put);

/**
 * @openapi
 * /contacts/{id}:
 *   tags:
 *     - Contacts
 *   delete:
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
router.delete("/:id", handlers.remove);

export default router;

import { Router } from "express";
import createCrud from "../controllers/crud.js";
import { ContactModel } from "../models/contact.js";
import { ContactZ } from "@full-stack-js/shared";
import validateBody from "../middleware/validate.js";

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

router.get("/", handlers.list);
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

router.get("/:id", handlers.get);
router.patch("/:id", handlers.patch);
router.put("/:id", handlers.put);
router.delete("/:id", handlers.remove);

export default router;

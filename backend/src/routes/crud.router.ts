import { Router, Request, Response, NextFunction } from "express";
import { CrudService } from "../services/crud.service.js";

type IdParam = { id: string };

export function createCrudRouter(service: CrudService<any>): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await service.findAll();
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  router.get("/:id", async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const item = await service.findById(req.params.id);
      if (!item) return res.status(404).json({ error: "Not found" });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  router.put("/:id", async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const updated = await service.update(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: "Not found" });
      res.json(updated);
    } catch (err) {
      next(err);
    }
  });

  router.delete("/:id", async (req: Request<IdParam>, res: Response, next: NextFunction) => {
    try {
      const deleted = await service.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: "Not found" });
      res.json(deleted);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

export default createCrudRouter;

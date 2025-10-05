import { Router, Request, Response, NextFunction } from "express";

import { NotFoundError } from "../errors/http.error.js";
import { CrudService } from "../services/crud.service.js";

type IdParam = { id: string };

export function createCrudRouter(service: CrudService<any>): Router {
  const router = Router();

  router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await service.create(req.body, { req });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  });

  router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await service.findAll({}, { req: _req });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  router.get(
    "/:id",
    async (req: Request<IdParam>, res: Response, next: NextFunction) => {
      try {
        const item = await service.findById(req.params.id, { req });
        if (!item) throw new NotFoundError();
        res.json(item);
      } catch (err) {
        next(err);
      }
    },
  );

  router.put(
    "/:id",
    async (req: Request<IdParam>, res: Response, next: NextFunction) => {
      try {
        const updated = await service.update(req.params.id, req.body, { req });
        if (!updated) throw new NotFoundError();
        res.json(updated);
      } catch (err) {
        next(err);
      }
    },
  );

  router.delete(
    "/:id",
    async (req: Request<IdParam>, res: Response, next: NextFunction) => {
      try {
        const deleted = await service.remove(req.params.id, { req });
        if (!deleted) throw new NotFoundError();
        res.json(deleted);
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
}

export default createCrudRouter;

import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import type { Document } from "mongoose";

import {
  registerCrudResource,
  registerZodSchema,
} from "../config/openapi-registry.js";
import { NotFoundError } from "../errors/http.error.js";
import { validateBody } from "../middleware/validate-body.js";
import { CrudService } from "../services/crud.service.js";

type IdParam = { id: string };

/**
 * Create an Express Router that exposes a standard set of CRUD endpoints
 * for the provided CrudService.
 *
 * Endpoints:
 * - POST   /       -> create
 * - GET    /       -> list
 * - GET    /:id    -> read
 * - PUT    /:id    -> update
 * - DELETE /:id    -> delete
 *
 * The service instance provided will be used directly; permission checks
 * and validation are performed by the service.
 */
export function createCrudRouter<T extends Document>(
  service: CrudService<T>,
  options?: {
    basePath?: string;
    tag?: string;
    schemas?: Record<string, unknown>;
  },
): Router {
  const router = Router();
  if (options?.basePath) {
    const createSchema = service.getOptions()?.createSchema;
    const updateSchema = service.getOptions()?.updateSchema;
    const responseSchema = service.getOptions()?.responseSchema;
    const partialSchema = service.getOptions()?.partialUpdateSchema;

    const schemas: Record<string, unknown> = { ...(options.schemas || {}) };
    const requestName = options.tag ? `${options.tag}Request` : "Request";
    const responseName = options.tag ? `${options.tag}Response` : "Response";
    const patchRequestName = options.tag
      ? `${options.tag}PatchRequest`
      : "PatchRequest";

    if (createSchema) {
      registerZodSchema(requestName, createSchema);
      schemas[requestName] = { $ref: `#/components/schemas/${requestName}` };
    }
    if (updateSchema) {
      registerZodSchema(requestName, updateSchema);
      schemas[requestName] = { $ref: `#/components/schemas/${requestName}` };
    }

    if (partialSchema) {
      registerZodSchema(patchRequestName, partialSchema);
      schemas[patchRequestName] = {
        $ref: `#/components/schemas/${patchRequestName}`,
      };
    }

    if (responseSchema) {
      registerZodSchema(responseName, responseSchema);
      schemas[responseName] = { $ref: `#/components/schemas/${responseName}` };
    } else if (!schemas[responseName]) {
      schemas[responseName] = { type: "object" };
    }

    registerCrudResource(options.basePath, {
      tag: options.tag,
      schemas,
      requestSchemaName: requestName,
      patchRequestSchemaName: patchRequestName,
      responseSchemaName: responseName,
    });
  }

  const createSchema = service.getOptions()?.createSchema;
  const createHandlers = [] as Array<RequestHandler>;
  if (createSchema) createHandlers.push(validateBody(createSchema));
  createHandlers.push(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await service.create(req.body, { req });
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },
  );
  router.post("/", ...createHandlers);

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

  const updateSchema = service.getOptions()?.updateSchema;
  const updateHandlers = [] as Array<RequestHandler<IdParam>>;
  if (updateSchema) updateHandlers.push(validateBody(updateSchema));
  updateHandlers.push(
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
  router.put("/:id", ...updateHandlers);

  const patchHandlers = [] as Array<RequestHandler<IdParam>>;
  if (updateSchema) patchHandlers.push(validateBody(updateSchema));
  patchHandlers.push(
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
  router.patch("/:id", ...patchHandlers);

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

import { Router, type IRouter } from "express";

import createCrudRouter from "../../routes/crud.router.js";
import type { RequestWithUser } from "../../types/requests.js";
import { requireAuth } from "../auth/auth.middleware.js";


import usersService from "./users.service.js";

const router: IRouter = Router();

/**
 * GET /me
 *
 * Return the currently authenticated user. The `requireAuth` middleware
 * attaches `req.user` when the request includes a valid JWT.
 */
router.get("/me", requireAuth, (req: RequestWithUser, res) => {
  const user = req.user;
  res.json({ user });
});

// Standard CRUD endpoints for users (create, list, read, update, delete).
// Validation for create/update is applied automatically when schemas are
// provided by the underlying service.
router.use("/", createCrudRouter(usersService));

export default router;

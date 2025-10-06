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

router.use(
  "/",
  createCrudRouter(usersService, { basePath: "/users", tag: "users" }),
);

export default router;

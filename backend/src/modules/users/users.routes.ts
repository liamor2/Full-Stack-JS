import { Router, type IRouter, type Request } from "express";

import createCrudRouter from "../../routes/crud.router.js";
import { requireAuth } from "../auth/auth.middleware.js";


import usersService from "./users.service.js";

const router: IRouter = Router();

/**
 * Return the currently authenticated user (attached by requireAuth middleware).
 */
router.get("/me", requireAuth, (req, res) => {
  const user = (req as unknown as Request & { user?: Record<string, unknown> }).user;
  res.json({ user });
});

router.use("/", createCrudRouter(usersService));

export default router;

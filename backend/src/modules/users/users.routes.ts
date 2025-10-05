import { Router, type IRouter } from "express";
import createCrudRouter from "../../routes/crud.router.js";
import usersService from "./users.service.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router: IRouter = Router();

// Public CRUD endpoints for users (in a real app you'd restrict some)
router.use("/", createCrudRouter(usersService));

// example protected endpoint
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

export default router;

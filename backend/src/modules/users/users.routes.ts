import { Router, type IRouter } from "express";
import createCrudRouter from "../../routes/crud.router.js";
import usersService from "./users.service.js";
import { requireAuth } from "../auth/auth.middleware.js";

const router: IRouter = Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: (req as any).user });
});

router.use("/", createCrudRouter(usersService));

export default router;

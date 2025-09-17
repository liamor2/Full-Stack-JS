import { Router, type IRouter } from "express";
import { registerHandler, loginHandler, meHandler } from "./auth.controller.js";
import { requireAuth } from "./auth.middleware.js";

const router: IRouter = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", requireAuth, meHandler);

export default router;

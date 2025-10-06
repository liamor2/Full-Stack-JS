import { Router } from "express";
import * as authCtrl from "../controllers/auth.js";
import requireAuth from "../middleware/auth.js";

const router: Router = Router();

// Public
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refresh);

// Protected
router.get("/me", requireAuth, authCtrl.me);

export default router;

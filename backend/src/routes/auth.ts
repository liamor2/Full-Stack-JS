import { LoginZ, RegisterZ } from "@full-stack-js/shared";
import { Router } from "express";

import * as authCtrl from "../controllers/auth.js";
import requireAuth from "../middleware/auth.js";
import validateBody from "../middleware/validate.js";

const router: Router = Router();

// Public
router.post("/register", validateBody(RegisterZ), authCtrl.register);
router.post("/login", validateBody(LoginZ), authCtrl.login);
router.post("/refresh", validateBody(LoginZ.pick({})), authCtrl.refresh);
router.post("/logout", validateBody(LoginZ.pick({})), authCtrl.logout);

// Protected
router.get("/me", requireAuth, authCtrl.me);

export default router;

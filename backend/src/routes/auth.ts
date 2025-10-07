import { LoginZ, RegisterZ } from "@full-stack-js/shared";
import { Router } from "express";

import * as authCtrl from "../controllers/auth.js";
import requireAuth from "../middleware/auth.js";
import validateBody from "../middleware/validate.js";

const router: Router = Router();

// Public
/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registered user info
 */
router.post("/register", validateBody(RegisterZ), authCtrl.register);
/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user and receive tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens
 */
router.post("/login", validateBody(LoginZ), authCtrl.login);
/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh auth tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: New tokens
 */
router.post("/refresh", validateBody(LoginZ.pick({})), authCtrl.refresh);
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post("/logout", validateBody(LoginZ.pick({})), authCtrl.logout);

// Protected
/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info
 */
router.get("/me", requireAuth, authCtrl.me);

export default router;

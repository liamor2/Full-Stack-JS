import { greet } from "@full-stack-js/shared";
import { Router } from "express";

const router: Router = Router();

/**
 * @openapi
 * /hello:
 *   get:
 *     summary: Greet someone
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: false
 *         description: Name to greet
 *     responses:
 *       200:
 *         description: Greeting message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/hello", (req, res) => {
  const rawName = req.query.name;
  const name = typeof rawName === "string" ? rawName : "world";
  const message = greet(name);
  res.json({ message });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service health
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 */
router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;

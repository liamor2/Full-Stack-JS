import { Router } from "express";
import { greet } from "@full-stack-js/shared";

const router: Router = Router();

router.get("/hello", (req, res) => {
  const rawName = req.query.name;
  const name = typeof rawName === "string" ? rawName : "world";
  const message = greet(name);
  res.json({ message });
});

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

export default router;

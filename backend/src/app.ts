import { greet, VERSION } from "@full-stack-js/shared";
import express, { type Express } from "express";

import authRoutes from "./modules/auth/auth.routes.js";

const app: Express = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: greet("World"), sharedVersion: VERSION });
});

app.use("/auth", authRoutes);

export default app;

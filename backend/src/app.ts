import { greet, VERSION } from "@full-stack-js/shared";
import express, { type Express } from "express";

import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middleware/error-handler.js";
import requestLogger from "./middleware/request-logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

const app: Express = express();
app.use(express.json());
app.use(requestLogger);

/**
 * Root health/info endpoint used by dev and health checks.
 * Returns a friendly greeting and the shared package version.
 */
app.get("/", (_req, res) => {
  res.json({ message: greet("World"), sharedVersion: VERSION });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

setupSwagger(app);

app.use(errorHandler);

export default app;

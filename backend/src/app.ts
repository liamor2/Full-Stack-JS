import { greet, VERSION } from "@full-stack-js/shared";
import cors from "cors";
import express, { type Express } from "express";

import { setupSwagger } from "./config/swagger.js";
import { errorHandler } from "./middleware/error-handler.js";
import requestLogger from "./middleware/request-logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import contactsRoutes from "./modules/contacts/contacts.routes.js";
import usersRoutes from "./modules/users/users.routes.js";

const app: Express = express();
app.use(express.json());
app.use(requestLogger);

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    exposedHeaders: ["Authorization"],
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.json({ message: greet("World"), sharedVersion: VERSION });
});

app.use("/auth", authRoutes);
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);

setupSwagger(app);

app.use(errorHandler);

export default app;

import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import contactsRoutes from "./routes/contacts.js";
import usersRoutes from "./routes/users.js";
import miscRoutes from "./routes/misc.js";
import createSwagger from "./utils/swagger.js";

dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());
app.use(cookieParser());

const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    exposedHeaders: ["Authorization"],
    origin: frontendOrigin,
    credentials: true,
  }),
);

app.use("/auth", authRoutes);
app.use("/", miscRoutes);
app.use("/contacts", contactsRoutes);
app.use("/users", usersRoutes);

createSwagger(app, port);

const mongoUri =
  process.env.MONGO_URI || "mongodb://localhost:27017/app?authSource=admin";

async function startServer(): Promise<void> {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB");

    if (process.env.NODE_ENV !== "test") {
      app.listen(port, () => {
        console.log(`Server listening on http://0.0.0.0:${port}`);
      });
    }
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

void startServer();

export default app;

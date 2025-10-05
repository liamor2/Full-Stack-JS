import mongoose from "mongoose";

import { rootLogger } from "../utils/logger.js";

import { CONFIG } from "./env.js";

mongoose.set("strictQuery", true);

/**
 * Connect to MongoDB using Mongoose and return the connection.
 *
 * The connection URI is read from CONFIG.mongoUri. On failure the error is
 * logged and re-thrown for the caller to handle.
 */
export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(CONFIG.mongoUri);
    rootLogger.info({ mongoUri: CONFIG.mongoUri }, "db.connected");
    return conn;
  } catch (err) {
    rootLogger.error({ err }, "db.connection_error");
    throw err;
  }
}

/**
 * Disconnect the Mongoose connection.
 */
export async function disconnectDB() {
  await mongoose.disconnect();
  rootLogger.info("db.disconnected");
}

// Graceful shutdown on SIGINT (Ctrl+C): disconnect and exit.
process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

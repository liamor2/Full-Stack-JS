import mongoose from "mongoose";

import { rootLogger } from "../utils/logger.js";

import { CONFIG } from "./env.js";

mongoose.set("strictQuery", true);

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

export async function disconnectDB() {
  await mongoose.disconnect();
  rootLogger.info("db.disconnected");
}

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

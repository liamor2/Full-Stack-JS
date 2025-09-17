import mongoose from "mongoose";

import { CONFIG } from "./env.js";

mongoose.set("strictQuery", true);

export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(CONFIG.mongoUri);
    console.log("[db] Connected to MongoDB");
    return conn;
  } catch (err) {
    console.error("[db] MongoDB connection error", err);
    throw err;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  console.log("[db] Disconnected");
}

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

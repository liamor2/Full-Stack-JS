import mongoose from "mongoose";
import { CONFIG } from "./env.js";

const uri = CONFIG.mongoUri;

mongoose.set("strictQuery", true);

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error", err);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("[db] Disconnected (SIGINT)");
  process.exit(0);
});
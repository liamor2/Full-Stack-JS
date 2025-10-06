import app from "./app.js";
import { connectDB } from "./config/db.js";
import { CONFIG } from "./config/env.js";
import { rootLogger } from "./utils/logger.js";

/**
 * Application bootstrap.
 *
 * Connects to the database and starts the Express server. Any error during
 * startup is logged and causes process termination with a non-zero exit code.
 */
async function bootstrap() {
  try {
    await connectDB();
    app.listen(CONFIG.port, () => {
      rootLogger.info({ port: CONFIG.port }, `Backend listening`);
    });
  } catch (err: unknown) {
    rootLogger.error({ err }, "bootstrap.failed");
    process.exit(1);
  }
}

bootstrap();

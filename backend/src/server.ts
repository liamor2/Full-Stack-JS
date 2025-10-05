import app from "./app.js";
import { connectDB } from "./config/db.js";
import { CONFIG } from "./config/env.js";
import { rootLogger } from "./utils/logger.js";

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

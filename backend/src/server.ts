import app from "./app.js";
import { connectDB } from "./config/db.js";
import { CONFIG } from "./config/env.js";

async function bootstrap() {
  try {
    await connectDB();
    app.listen(CONFIG.port, () => {
      console.log(`Backend listening on http://localhost:${CONFIG.port}`);
    });
  } catch {
    process.exit(1);
  }
}

bootstrap();

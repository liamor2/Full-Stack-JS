import { CONFIG } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";

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

import app from "./app.js";
import { CONFIG } from "./config/env.js";
import "./config/db.js"; // side-effect: connect to DB

app.listen(CONFIG.port, () => {
  console.log(`Backend listening on http://localhost:${CONFIG.port}`);
});

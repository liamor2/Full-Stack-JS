import express, { Express } from "express";
import authRoutes from "./routes/auth.js";
import miscRoutes from "./routes/misc.js";
import contactsRoutes from "./routes/contacts.js";

const app: Express = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/", miscRoutes);
app.use("/contacts", contactsRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

export default app;

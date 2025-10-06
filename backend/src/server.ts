import express, { Express, Request, Response } from "express";
import { greet } from "@full-stack-js/shared";

const app: Express = express();
const port = Number(process.env.PORT || 3000);

app.get("/hello", (req: Request, res: Response) => {
  const rawName = req.query.name;
  const name = typeof rawName === "string" ? rawName : "world";
  const message = greet(name);
  res.json({ message });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

export default app;

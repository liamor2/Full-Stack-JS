process.env.NODE_ENV = "test";

if (!process.env.FRONTEND_HOST) {
  process.env.FRONTEND_HOST = "http://localhost:5173";
}

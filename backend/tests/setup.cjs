process.env.NODE_ENV = "test";

if (!process.env.FRONTEND_ORIGIN) {
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
}

import { describe, expect, it } from "@jest/globals";
import request from "supertest";

import app from "../src/server.js";

describe("Misc routes", () => {
  it("returns service status from /health", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body).toEqual({ status: "ok" });
  });

  it("greets a default visitor on /hello without params", async () => {
    const res = await request(app).get("/hello").expect(200);

    expect(res.body).toEqual({
      message: "Hello, world! (from shared package)",
    });
  });

  it("greets the provided visitor name on /hello", async () => {
    const res = await request(app)
      .get("/hello")
      .query({ name: "Alice" })
      .expect(200);

    expect(res.body).toEqual({
      message: "Hello, Alice! (from shared package)",
    });
  });
});

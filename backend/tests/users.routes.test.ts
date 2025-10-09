import express, { type Express } from "express";
import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import request from "supertest";

let findByIdResult: Record<string, unknown> | null = null;

const findByIdMock = jest.fn((id: string) => ({
  lean: jest.fn(() => Promise.resolve(findByIdResult)),
}));

let app: Express;

beforeAll(async () => {
  jest.resetModules();

  await jest.unstable_mockModule("../src/models/user.js", () => ({
    __esModule: true,
    UserModel: {
      findById: (id: string) => findByIdMock(id),
    },
  }));

  const { default: usersRoutes } = await import("../src/routes/users.js");

  app = express();
  app.use(express.json());
  app.use("/users", usersRoutes);
});

beforeEach(() => {
  findByIdMock.mockClear();
});

describe("Users routes", () => {
  it("returns a user when found", async () => {
    findByIdResult = {
      _id: "u-1",
      name: "Jane",
      email: "jane@example.com",
      password: "hashed",
    };

    const res = await request(app).get("/users/u-1").expect(200);

    expect(findByIdMock).toHaveBeenCalledWith("u-1");
    expect(res.body).toEqual({
      _id: "u-1",
      name: "Jane",
      email: "jane@example.com",
    });
  });

  it("returns 404 when user is missing", async () => {
    findByIdResult = null;

    const res = await request(app).get("/users/u-404").expect(404);

    expect(findByIdMock).toHaveBeenCalledWith("u-404");
    expect(res.body).toEqual({ error: "Not found" });
  });
});

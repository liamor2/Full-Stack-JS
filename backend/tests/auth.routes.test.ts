import express, { type Express } from "express";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import request from "supertest";

const registerMock = jest.fn();
const loginMock = jest.fn();
const refreshMock = jest.fn();
const logoutMock = jest.fn();
const meMock = jest.fn();

const requireAuthMock = jest.fn(
  (req: any, _res: any, next: () => void): void => {
    req.userId = "user-123";
    next();
  },
);

const validateBodyMock = jest.fn(
  (_schema: unknown) =>
    (_req: any, _res: any, next: () => void): void => {
      next();
    },
);

let app: Express;

beforeAll(async () => {
  jest.resetModules();

  await jest.unstable_mockModule("../src/controllers/auth.js", () => ({
    __esModule: true,
    register: registerMock,
    login: loginMock,
    refresh: refreshMock,
    logout: logoutMock,
    me: meMock,
  }));

  await jest.unstable_mockModule("../src/middleware/auth.js", () => ({
    __esModule: true,
    default: requireAuthMock,
  }));

  await jest.unstable_mockModule("../src/middleware/validate.js", () => ({
    __esModule: true,
    default: (schema: unknown) => validateBodyMock(schema),
  }));

  const { default: authRoutes } = await import("../src/routes/auth.js");

  app = express();
  app.use(express.json());
  app.use("/auth", authRoutes);
});

beforeEach(() => {
  registerMock.mockImplementation((_req: any, res: any) =>
    res.status(201).json({ id: "user-id", email: "foo@example.com" }),
  );
  loginMock.mockImplementation((_req: any, res: any) =>
    res.status(200).json({ accessToken: "at", refreshToken: "rt" }),
  );
  refreshMock.mockImplementation((_req: any, res: any) =>
    res.status(200).json({ accessToken: "new-at", refreshToken: "new-rt" }),
  );
  logoutMock.mockImplementation((_req: any, res: any) =>
    res.status(200).json({ ok: true }),
  );
  meMock.mockImplementation((_req: any, res: any) =>
    res.status(200).json({ id: "me" }),
  );
  requireAuthMock.mockClear();
  validateBodyMock.mockClear();
});

afterEach(() => {
  registerMock.mockReset();
  loginMock.mockReset();
  refreshMock.mockReset();
  logoutMock.mockReset();
  meMock.mockReset();
});

describe("Auth routes", () => {
  it("registers a user", async () => {
    const payload = { email: "foo@example.com", password: "Secret12345!" };

    const res = await request(app)
      .post("/auth/register")
      .send(payload)
      .expect(201);

    expect(res.body).toEqual({ id: "user-id", email: "foo@example.com" });
    expect(registerMock).toHaveBeenCalledTimes(1);
    const [handledReq] = registerMock.mock.calls[0] as [any, any, any];
    expect(handledReq.body).toEqual(payload);
  });

  it("logs in a user", async () => {
    const payload = { email: "foo@example.com", password: "Secret12345!" };

    const res = await request(app)
      .post("/auth/login")
      .send(payload)
      .expect(200);

    expect(res.body).toEqual({ accessToken: "at", refreshToken: "rt" });
    expect(loginMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes tokens", async () => {
    const res = await request(app).post("/auth/refresh").send({}).expect(200);

    expect(res.body).toEqual({ accessToken: "new-at", refreshToken: "new-rt" });
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("logs out a user", async () => {
    const res = await request(app).post("/auth/logout").send({}).expect(200);

    expect(res.body).toEqual({ ok: true });
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it("returns current user on /auth/me", async () => {
    const res = await request(app).get("/auth/me").expect(200);

    expect(res.body).toEqual({ id: "me" });
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
    expect(meMock).toHaveBeenCalledTimes(1);
  });
});

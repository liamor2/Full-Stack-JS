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

type ContactDoc = {
  id: string;
  [key: string]: unknown;
};

const listHandler = jest.fn();
const getHandler = jest.fn();
const createHandler = jest.fn();
const patchHandler = jest.fn();
const putHandler = jest.fn();
const removeHandler = jest.fn();

const crudHandlers = {
  list: listHandler,
  get: getHandler,
  create: createHandler,
  patch: patchHandler,
  put: putHandler,
  remove: removeHandler,
};

const createCrudMock = jest.fn(() => crudHandlers);

const requireAuthMock = jest.fn(
  (req: any, _res: any, next: () => void): void => {
    req.userId = "user-456";
    next();
  },
);

const validateBodyMock = jest.fn(
  (_schema: unknown) =>
    (_req: any, _res: any, next: () => void): void => {
      next();
    },
);

let findResults: ContactDoc[] = [];
let findOneResult: ContactDoc | null = null;

const contactSchemaPathMock = jest.fn((field: string) => {
  if (field === "createdAt" || field === "updatedAt") {
    return { instance: "Date" };
  }
  return { instance: "String" };
});

const findMock = jest.fn((_: unknown) => undefined as any);
const findOneMock = jest.fn((_: unknown) => undefined as any);

let app: Express;

beforeAll(async () => {
  jest.resetModules();

  await jest.unstable_mockModule("../src/controllers/crud.js", () => ({
    __esModule: true,
    default: createCrudMock,
    createCrud: createCrudMock,
  }));

  await jest.unstable_mockModule("../src/middleware/auth.js", () => ({
    __esModule: true,
    default: requireAuthMock,
  }));

  await jest.unstable_mockModule("../src/middleware/validate.js", () => ({
    __esModule: true,
    default: (schema: unknown) => validateBodyMock(schema),
  }));

  await jest.unstable_mockModule("../src/models/contact.js", () => ({
    __esModule: true,
    ContactModel: {
      find: (query: unknown) => findMock(query),
      findOne: (query: unknown) => findOneMock(query),
      schema: {
        path: (field: string) => contactSchemaPathMock(field),
      },
    },
  }));

  const { default: contactsRoutes } = await import("../src/routes/contacts.js");

  app = express();
  app.use(express.json());
  app.use("/contacts", contactsRoutes);
});

beforeEach(() => {
  findResults = [
    { id: "c-1", firstName: "Alice" },
    { id: "c-2", firstName: "Bob" },
  ];
  findOneResult = { id: "c-42", firstName: "Charlie" };

  findMock.mockImplementation((_query: unknown) => {
    const chain: any = {
      skip: jest.fn(() => chain),
      limit: jest.fn(() => chain),
      lean: jest.fn(() => chain),
      exec: jest.fn(() => Promise.resolve(findResults)),
    };
    return chain;
  });

  findOneMock.mockImplementation((_query: unknown) => ({
    lean: jest.fn(() => Promise.resolve(findOneResult)),
  }));

  listHandler.mockImplementation((_req: any, res: any) =>
    res.json(findResults),
  );
  getHandler.mockImplementation((_req: any, res: any) =>
    res.json({ id: "c-get" }),
  );
  createHandler.mockImplementation((_req: any, res: any) =>
    res.status(201).json({ id: "c-new" }),
  );
  patchHandler.mockImplementation((_req: any, res: any) =>
    res.json({ id: "c-patch", updated: true }),
  );
  putHandler.mockImplementation((_req: any, res: any) =>
    res.json({ id: "c-put", updated: true }),
  );
  removeHandler.mockImplementation((_req: any, res: any) =>
    res.status(204).send(),
  );

  listHandler.mockClear();
  getHandler.mockClear();
  createHandler.mockClear();
  patchHandler.mockClear();
  putHandler.mockClear();
  removeHandler.mockClear();
  createCrudMock.mockClear();
  requireAuthMock.mockClear();
  validateBodyMock.mockClear();
  findMock.mockClear();
  findOneMock.mockClear();
  contactSchemaPathMock.mockClear();
});

afterEach(() => {
  listHandler.mockReset();
  getHandler.mockReset();
  createHandler.mockReset();
  patchHandler.mockReset();
  putHandler.mockReset();
  removeHandler.mockReset();
});

describe("Contacts routes", () => {
  it("lists contacts", async () => {
    const res = await request(app).get("/contacts").expect(200);

    expect(res.body).toEqual(findResults);
    expect(listHandler).toHaveBeenCalledTimes(1);
  });

  it("creates a contact", async () => {
    const payload = { firstName: "Alice", lastName: "Smith" };
    const res = await request(app).post("/contacts").send(payload).expect(201);

    expect(res.body).toEqual({ id: "c-new" });
    expect(createHandler).toHaveBeenCalledTimes(1);
    expect(requireAuthMock).toHaveBeenCalledTimes(1);
  });

  it("gets a contact by id", async () => {
    const res = await request(app).get("/contacts/123").expect(200);

    expect(res.body).toEqual({ id: "c-get" });
    expect(getHandler).toHaveBeenCalledTimes(1);
  });

  it("patches a contact", async () => {
    const res = await request(app)
      .patch("/contacts/123")
      .send({ notes: "Updated" })
      .expect(200);

    expect(res.body).toEqual({ id: "c-patch", updated: true });
    expect(patchHandler).toHaveBeenCalledTimes(1);
  });

  it("replaces a contact", async () => {
    const res = await request(app)
      .put("/contacts/123")
      .send({ firstName: "Bob" })
      .expect(200);

    expect(res.body).toEqual({ id: "c-put", updated: true });
    expect(putHandler).toHaveBeenCalledTimes(1);
  });

  it("removes a contact", async () => {
    await request(app).delete("/contacts/123").expect(204);

    expect(removeHandler).toHaveBeenCalledTimes(1);
  });

  it("finds contacts with criteria", async () => {
    const res = await request(app)
      .post("/contacts/find")
      .send({ firstName: "Ali", limit: 5, offset: 2 })
      .expect(200);

    expect(findMock).toHaveBeenCalledTimes(1);
    const findCallArgs = findMock.mock.calls[0] ?? [];
    const query = (findCallArgs[0] ?? {}) as Record<string, unknown>;
    expect(query).toMatchObject({
      deleted: false,
      firstName: { $regex: "Ali", $options: "i" },
    });
    expect(contactSchemaPathMock).toHaveBeenCalled();
    expect(res.body).toEqual(findResults);
  });

  it("finds one contact by criteria", async () => {
    const res = await request(app)
      .post("/contacts/findOne")
      .send({ email: "alice@example.com" })
      .expect(200);

    expect(findOneMock).toHaveBeenCalledTimes(1);
    const findOneCallArgs = findOneMock.mock.calls[0] ?? [];
    const query = (findOneCallArgs[0] ?? {}) as Record<string, unknown>;
    expect(query).toMatchObject({ deleted: false, email: "alice@example.com" });
    expect(res.body).toEqual(findOneResult);
  });
});

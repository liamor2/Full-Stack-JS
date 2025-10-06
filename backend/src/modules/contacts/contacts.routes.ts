import { Router, type IRouter } from "express";

import createCrudRouter from "../../routes/crud.router.js";
import { requireAuth } from "../auth/auth.middleware.js";

import contactsService from "./contacts.service.js";

const router: IRouter = Router();

router.use(requireAuth);

router.use(
  "/",
  createCrudRouter(contactsService, { basePath: "/contacts", tag: "contacts" }),
);

export default router;

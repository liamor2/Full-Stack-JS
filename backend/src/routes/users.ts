import { Router } from "express";

import { UserModel } from "../models/user.js";

const router: Router = Router();

/**
 * The user record retrieved from the database by the provided `id`.
 *
 * This value is obtained via `UserModel.findById(id).lean()` so it is returned
 * as a plain JavaScript object (POJO) rather than a Mongoose Document.
 * If no document matches the given `id`, this will be `null`.
 *
 * @remarks
 * - Ensure `id` is a valid ObjectId or a string that can be cast to one before calling.
 * - Because `.lean()` is used, the returned object has no Mongoose instance methods
 *   and changes to it will not be persisted unless explicitly saved via the model.
 *
 * @type {Record<string, unknown> | null}
 */
/**
 * GET /users/:id
 *
 * Retrieve a single user by its unique identifier.
 *
 * This asynchronous route handler looks up a user in the database using the
 * provided `id` route parameter. It uses Mongoose's `findById(id).lean()` to
 * return a plain JavaScript object (not a Mongoose Document), which is then
 * sent back to the client as JSON.
 *
 * @remarks
 * - If a user with the specified `id` is found, the handler should respond
 *   with HTTP 200 and the user object.
 * - If no user is found, the handler should respond with HTTP 404.
 * - Database or unexpected errors should be passed to `next` (or handled)
 *   producing an HTTP 500 response.
 *
 * @route GET /users/:id
 *
 * @param req - Express request object. Expects `req.params.id` to contain the user id (string).
 * @param res - Express response object used to send the JSON payload or error status.
 * @param next - Express next function for error handling.
 *
 * @returns A promise that resolves when the response has been sent. Typically:
 * - 200: { user: object } when the user is found
 * - 404: { message: string } when no user matches the given id
 * - 500: { error: string } for server/database errors
 *
 * @throws {Error} Throws or forwards database errors encountered during lookup.
 *
 * @example
 * // Request: GET /users/60f7c0be2b1e5c001234abcd
 * // Response: 200 { "user": { "_id": "60f7c0be2b1e5c001234abcd", "name": "Alice", ... } }
 */
router.get("/:id", async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const user = await UserModel.findById(id).lean();
    if (!user) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const { password: _pw, ...out } = user as any;
    res.json(out);
  } catch (err) {
    next(err as any);
  }
});

export default router;

import { UserCreateSchema, UserUpdateSchema, UserResponseSchema } from "@full-stack-js/shared";

import { User, IUser } from "../../models/users.model.js";
import CrudService from "../../services/crud.service.js";
import type { RequestWithUser } from "../../types/requests.js";

/**
 * UsersService configures the generic CrudService for user-specific needs.
 *
 * - `publicFields` lists the allowed fields to expose to API consumers.
 * - `allow` implements fine-grained access control based on the current
 *   authenticated user and the requested action.
 */
class UsersService extends CrudService<IUser> {
  constructor() {
    super(User, {
      publicFields: [
        "_id",
        "id",
        "username",
        "email",
        "role",
        "createdAt",
        "updatedAt",
        "isActive",
        "createdBy",
        "updatedBy",
      ] as Array<keyof IUser>,
  createSchema: UserCreateSchema,
  updateSchema: UserUpdateSchema,
  responseSchema: UserResponseSchema,
      allow: async (action, { req, resource }) => {
        const user = (req as RequestWithUser | undefined)?.user;
        if (!user) return action === "create";
        if (user.role === "admin") return true;
        if (action === "list") return false;
        if (action === "create") return true;
        if (resource) {
          const maybe = resource as unknown as {
            _id?: { toString: () => string };
            id?: string;
          };
          const resId = maybe._id ? maybe._id.toString() : maybe.id;
          return resId === user.id;
        }
        return false;
      },
    });
  }

  /**
   * Find a user by email. Returns a Mongoose Document; callers should be
   * aware this method returns the raw document (used internally by auth).
   *
   * @param email - user email to search for
   */
  async findByEmail(email: string) {
    return User.findOne({ email }).exec();
  }
}

export const usersService = new UsersService();

export default usersService;

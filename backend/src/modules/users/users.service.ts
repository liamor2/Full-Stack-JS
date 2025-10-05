import type { Request } from "express";

import { User, IUser } from "../../models/users.model.js";
import CrudService from "../../services/crud.service.js";

type ReqWithUser = Request & { user?: { id?: string; role?: string } };

/**
 * UsersService extends the generic CrudService to provide user-specific
 * configuration like publicFields and access control rules.
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
      /**
       * Access control callback used by the CrudService.
       *
       * Rules:
       * - anonymous users may only create (register)
       * - admins have full access
       * - listing is disallowed for non-admins
       * - reading/updating/deleting is allowed only for the same user
       */
      allow: async (action, { req, resource }) => {
        const user = (req as ReqWithUser | undefined)?.user;
        if (!user) {
          return action === "create";
        }
        if (user.role === "admin") return true;
        if (action === "list") return false;
        if (action === "create") return true;
        if (resource) {
          // resource may be a Mongoose document with _id or a plain object with id
          const maybe = resource as unknown as { _id?: { toString: () => string }; id?: string };
          const resId = maybe._id ? maybe._id.toString() : maybe.id;
          return resId === user.id;
        }
        return false;
      },
    });
  }

  async findByEmail(email: string) {
    return User.findOne({ email }).exec();
  }
}

export const usersService = new UsersService();

export default usersService;

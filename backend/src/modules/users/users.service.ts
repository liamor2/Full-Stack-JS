import { User, IUser } from "../../models/users.model.js";
import CrudService from "../../services/crud.service.js";
import type { Request } from "express";

class UsersService extends CrudService<IUser> {
  constructor() {
    super(User as any, {
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
      allow: async (action, { req, resource }) => {
        const user = (req as any)?.user as { id?: string; role?: string } | undefined;
        if (!user) {
          return action === "create";
        }
        if (user.role === "admin") return true;
        if (action === "list") return false;
        if (action === "create") return true;
        if (resource) {
          const resId = (resource as any)._id ? (resource as any)._id.toString() : (resource as any).id;
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

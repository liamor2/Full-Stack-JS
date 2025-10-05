import { User, IUser } from "../../models/users.model.js";
import CrudService from "../../services/crud.service.js";

class UsersService extends CrudService<IUser> {
  constructor() {
    super(User as any);
  }

  async findByEmail(email: string) {
    return User.findOne({ email }).exec();
  }
}

export const usersService = new UsersService();

export default usersService;

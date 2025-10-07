import argon2 from "argon2";
import mongoose from "mongoose";

export interface IUser {
  email: string;
  password: string;
  role: "admin" | "user";
  firstName?: string;
  lastName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends mongoose.Document, IUser {
  comparePassword(candidate: string): Promise<boolean>;
}

const def: Record<string, any> = {
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  firstName: { type: String },
  lastName: { type: String },
};

const userSchema = new mongoose.Schema<IUserDocument>(def, {
  timestamps: true,
});

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (this: IUserDocument) {
  const docAny = this as any;
  if (!docAny.isModified?.("password")) return;
  if (this.password) {
    this.password = await argon2.hash(this.password);
  }
});

userSchema.pre("findOneAndUpdate", async function (this: any) {
  const update = this.getUpdate?.();
  if (!update) return;

  const newPassword = update.password ?? update.$set?.password;
  if (!newPassword) return;

  const hashed = await argon2.hash(newPassword);
  if (update.password) update.password = hashed;
  if (update.$set) update.$set.password = hashed;
  this.setUpdate(update);
});

userSchema.methods.comparePassword = async function (
  this: IUserDocument,
  candidate: string,
): Promise<boolean> {
  return argon2.verify(this.password, candidate);
};

export const UserModel = mongoose.model<IUserDocument>("User", userSchema);

export default UserModel;

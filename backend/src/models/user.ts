import mongoose from "mongoose";
import argon2 from "argon2";
import { UserZ } from "@full-stack-js/shared";
import zodToMongoose from "../utils/zod-to-mongoose.js";

const def = zodToMongoose(UserZ) as Record<string, any>;

delete def.createdAt;
delete def.updatedAt;

const userSchema = new mongoose.Schema(def, { timestamps: true });

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function (this: any) {
  if (!this.isModified?.("password")) return;
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

userSchema.methods.comparePassword = async function (candidate: string) {
  return argon2.verify(this.password, candidate);
};

export const UserModel = mongoose.model("User", userSchema);

export default UserModel;

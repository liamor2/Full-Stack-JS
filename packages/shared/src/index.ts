export function greet(name: string): string {
  return `Hello, ${name}! (from shared package)`;
}

export const VERSION = "0.0.1";

export type { AuthTokens, JwtPayload } from "./types/auth.js";
export type {
  LoginResponse,
  RegisterResponse,
  MeResponse,
} from "./api/contracts.js";
export { ContactZ } from "./validators/contact.schema.js";
export type { Contact } from "./validators/contact.schema.js";
export { BaseEntityZ } from "./validators/baseEntity.schema.js";
export type { BaseEntity } from "./validators/baseEntity.schema.js";
export { UserZ } from "./validators/user.schema.js";
export type { User } from "./validators/user.schema.js";

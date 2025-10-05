import { randomUUID } from "crypto";

import type { User, AuthTokens, JwtPayload } from "@full-stack-js/shared";
import {
  RegisterRequestSchema,
  LoginRequestSchema,
} from "@full-stack-js/shared";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CONFIG } from "../../config/env.js";
import { ConflictError, UnauthorizedError } from "../../errors/http.error.js";

const users: (User & { passwordHash: string })[] = [];

const JWT_SECRET = CONFIG.jwtSecret;
const ACCESS_TTL_SECONDS = 60 * 60;

/**
 * Map an internal user + passwordHash record to the public User shape.
 *
 * This removes sensitive properties (passwordHash) and returns the subset
 * of fields that are safe to expose to clients.
 *
 * @param u - internal user object including passwordHash
 * @returns public user object
 */
function toPublic(u: User & { passwordHash: string }): User {
  const { id, email, username, role, createdAt, updatedAt } = u;
  return { id, email, username, role, createdAt, updatedAt };
}

/**
 * Issue authentication tokens for a user.
 *
 * Currently only issues an access token (JWT). The token payload contains the
 * user's id, email and role.
 *
 * @param user - public user object
 * @returns authentication tokens
 */
function issueTokens(user: User): AuthTokens {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TTL_SECONDS,
  });
  return { accessToken };
}

/**
 * Register a new user.
 *
 * Validates the incoming payload with shared Zod schemas, checks for
 * duplicates and stores a hashed password. Returns the created user (public
 * view) and issued tokens.
 *
 * @param raw - untrusted request payload
 */
export async function register(raw: unknown) {
  const parsed = RegisterRequestSchema.parse(raw);
  if (users.find((u) => u.email === parsed.email)) {
    throw new ConflictError("Email already registered");
  }
  const id = randomUUID();
  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const now = new Date().toISOString();
  const user: User & { passwordHash: string } = {
    id,
    email: parsed.email,
    username: parsed.username,
    role: parsed.role || "user",
    createdAt: now,
    updatedAt: now,
    passwordHash,
  };
  users.push(user);
  return {
    user: toPublic(user),
    tokens: issueTokens(user),
  };
}

/**
 * Authenticate a user and return tokens.
 *
 * Validates credentials and returns the public user and an access token.
 *
 * @param raw - untrusted request payload
 */
export async function login(raw: unknown) {
  const parsed = LoginRequestSchema.parse(raw);
  const user = users.find((u) => u.email === parsed.email);
  if (!user) throw new UnauthorizedError("Invalid credentials");
  const ok = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid credentials");
  return {
    user: toPublic(user),
    tokens: issueTokens(user),
  };
}

/**
 * Verify and decode a JWT access token.
 *
 * Throws when the token is invalid/expired.
 *
 * @param token - JWT string
 * @returns decoded JWT payload
 */
export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

/**
 * Return the in-memory user record by id (including passwordHash).
 *
 * Note: this example stores users in-memory; in a real application this
 * should query the database.
 *
 * @param id - user id
 */
export function getUserById(id: string) {
  return users.find((u) => u.id === id);
}

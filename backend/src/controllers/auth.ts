import type { JwtPayload } from "@full-stack-js/shared";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { UserModel } from "../models/user.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "dev_refresh_secret";

function signAccess(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" });
}

function signRefresh(payload: JwtPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export const register: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      const { email, password, role, firstName, lastName } = req.body;
      const created = await UserModel.create({
        email,
        password,
        role,
        firstName,
        lastName,
      });
      const { password: _p, ...out } = created.toObject() as Record<
        string,
        any
      >;
      res.status(201).json(out);
    } catch (err) {
      next(err as any);
    }
  })().catch(next);
};

export const login: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      const { email, password } = req.body;
      const user: any = await UserModel.findOne({ email }).exec();
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      const payload: JwtPayload = {
        sub: String(user._id),
        email: user.email,
        role: user.role,
      };

      const accessToken = signAccess(payload);
      const refreshToken = signRefresh(payload);

      const { password: _p, ...out } = user.toObject() as Record<string, any>;

      res.json({ user: out, tokens: { accessToken, refreshToken } });
    } catch (err) {
      next(err as any);
    }
  })().catch(next);
};

export const me: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      const anyReq = req as any;
      const userId = anyReq.userId as string | undefined;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const user = await UserModel.findById(userId).lean();
      if (!user) {
        res.status(404).json({ error: "Not found" });
        return;
      }
      const { password: _pw, ...out } = user as any;
      res.json({ user: out });
    } catch (err) {
      next(err as any);
    }
  })().catch(next);
};

export const refresh: RequestHandler = (req, res, next) => {
  (async () => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: "refreshToken required" });
        return;
      }
      let payload: any;
      try {
        payload = jwt.verify(refreshToken, REFRESH_SECRET) as JwtPayload;
      } catch (err) {
        console.error("Invalid refresh token verification:", err);
        res.status(401).json({ error: "Invalid refresh token" });
        return;
      }
      const accessToken = signAccess(payload as JwtPayload);
      res.json({ accessToken });
    } catch (err) {
      next(err as any);
    }
  })().catch(next);
};

const blacklistedRefresh = new Set<string>();

export const logout: RequestHandler = (req, res) => {
  const { refreshToken } = req.body ?? {};
  if (refreshToken && typeof refreshToken === "string") {
    blacklistedRefresh.add(refreshToken);
  }
  res.json({ ok: true });
};

export const isRefreshBlacklisted = (token: string) =>
  blacklistedRefresh.has(token);

const exported = { register, login, me, refresh, logout };
export default exported as {
  register: RequestHandler;
  login: RequestHandler;
  me: RequestHandler;
  refresh: RequestHandler;
  logout: RequestHandler;
};

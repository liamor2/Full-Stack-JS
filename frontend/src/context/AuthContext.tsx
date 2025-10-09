/* eslint-disable no-undef */
import type { Login, Register, User } from "@full-stack-js/shared";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchCurrentUser,
  login as apiLogin,
  register as apiRegister,
} from "../api/auth.js";
import apiClient from "../api/client.js";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: Login) => Promise<void>;
  register: (payload: Register) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "contact-app.token";
const STORAGE_REFRESH_KEY = "contact-app.refresh";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY),
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(token));

  const persistToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persistRefreshToken = useCallback((value: string | null) => {
    if (typeof window === "undefined") return;
    if (value) {
      localStorage.setItem(STORAGE_REFRESH_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_REFRESH_KEY);
    }
  }, []);

  const refreshTimerRef = React.useRef<number | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const scheduleRefresh = useCallback(
    (accessToken: string | null) => {
      clearRefreshTimer();
      if (!accessToken) return;
      try {
        const parts = accessToken.split(".");
        if (parts.length < 2) return;
        const payload = JSON.parse(atob(parts[1]));
        const exp = payload?.exp;
        if (!exp) return;
        const expiresAt = exp * 1000;
        const now = Date.now();
        const ms = Math.max(1000, expiresAt - now - 60_000);
        refreshTimerRef.current = window.setTimeout(async () => {
          try {
            const refreshToken = localStorage.getItem(STORAGE_REFRESH_KEY);
            if (!refreshToken) {
              setToken(null);
              persistToken(null);
              persistRefreshToken(null);
              setUser(null);
              return;
            }
            const data = await apiClient.post<
              { accessToken: string },
              { refreshToken: string }
            >("/auth/refresh", { refreshToken });
            const newAccess = data.accessToken;
            setToken(newAccess);
            persistToken(newAccess);
            try {
              const { user: profile } = await fetchCurrentUser(newAccess);
              setUser(profile);
            } catch {}

            scheduleRefresh(newAccess);
          } catch (err) {
            console.error(err);
            setToken(null);
            persistToken(null);
            persistRefreshToken(null);
            setUser(null);
          }
        }, ms) as unknown as number;
      } catch {
        /* ignore */
      }
    },
    [clearRefreshTimer, persistToken, persistRefreshToken],
  );

  const loadProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { user: profile } = await fetchCurrentUser(token);
      setUser(profile);
    } catch {
      setToken(null);
      persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token, persistToken]);

  useEffect(() => {
    if (token) {
      loadProfile();
      // ensure refresh timer is scheduled when token is present
      scheduleRefresh(token);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token, loadProfile]);

  const handleLogin = useCallback(
    async (credentials: Login) => {
      setLoading(true);
      try {
        const response = await apiLogin(credentials);
        setToken(response.tokens.accessToken);
        persistToken(response.tokens.accessToken);
        try {
          persistRefreshToken(response.tokens.refreshToken ?? null);
          scheduleRefresh(response.tokens.accessToken);
        } catch (e) {
           
          console.warn("Failed to schedule refresh after login", e);
        }
        setUser(response.user);
      } catch (error) {
        setUser(null);
        setToken(null);
        persistToken(null);
        persistRefreshToken(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistToken, persistRefreshToken, scheduleRefresh],
  );

  const handleRegister = useCallback(
    async (payload: Register) => {
      setLoading(true);
      try {
        const response = await apiRegister(payload);
        setToken(response.tokens.accessToken);
        persistToken(response.tokens.accessToken);
        try {
          persistRefreshToken(response.tokens.refreshToken ?? null);
          scheduleRefresh(response.tokens.accessToken);
        } catch (e) {
           
          console.warn("Failed to schedule refresh after register", e);
        }
        setUser(response.user);
      } catch (error) {
        setUser(null);
        setToken(null);
        persistToken(null);
        persistRefreshToken(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistToken, persistRefreshToken, scheduleRefresh],
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistToken(null);
    persistRefreshToken(null);
    clearRefreshTimer();
  }, [persistToken, persistRefreshToken, clearRefreshTimer]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refresh: loadProfile,
    }),
    [
      user,
      token,
      loading,
      handleLogin,
      handleRegister,
      handleLogout,
      loadProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

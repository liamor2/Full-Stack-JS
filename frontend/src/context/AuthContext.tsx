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
        setUser(response.user);
      } catch (error) {
        setUser(null);
        setToken(null);
        persistToken(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const handleRegister = useCallback(
    async (payload: Register) => {
      setLoading(true);
      try {
        const response = await apiRegister(payload);
        setToken(response.tokens.accessToken);
        persistToken(response.tokens.accessToken);
        setUser(response.user);
      } catch (error) {
        setUser(null);
        setToken(null);
        persistToken(null);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    persistToken(null);
  }, [persistToken]);

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

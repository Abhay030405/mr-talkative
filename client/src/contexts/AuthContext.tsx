'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  branch: string | null;
  semester: number | null;
  reg_number: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
}

const TOKEN_KEY = "mr_talkative_token";
const USER_KEY = "mr_talkative_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Deferred to a client-only effect so the first client render matches
  // the server-rendered (logged-out) HTML — reading localStorage during
  // the initial render causes a hydration mismatch for logged-in users.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) setUser(JSON.parse(stored) as AuthUser);
    } catch {
      // ignore malformed stored user
    }
    setToken(localStorage.getItem(TOKEN_KEY));
  }, []);

  const login = useCallback((userData: AuthUser, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    localStorage.setItem(TOKEN_KEY, accessToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  const value = useMemo(
    () => ({ user, token, login, logout }),
    [user, token, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

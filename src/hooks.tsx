import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "./types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("devpulse_token");
    const storedUser = localStorage.getItem("devpulse_user");
    if (stored && storedUser) {
      try {
        setToken(stored);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("devpulse_token");
        localStorage.removeItem("devpulse_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((t: string, u: User) => {
    localStorage.setItem("devpulse_token", t);
    localStorage.setItem("devpulse_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("devpulse_token");
    localStorage.removeItem("devpulse_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoggedIn: !!token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

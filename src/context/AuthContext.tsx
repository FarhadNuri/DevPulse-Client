import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { auth } from "../api";
import type { User, OrgSummary, AuthMeResponse } from "../types";

interface AuthState {
  user: User | null;
  organizations: OrgSummary[];
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithToken: (token: string) => Promise<AuthMeResponse>;
  logout: () => void;
  refreshMe: () => Promise<AuthMeResponse | null>;
  setOrganizations: React.Dispatch<React.SetStateAction<OrgSummary[]>>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organizations, setOrganizations] = useState<OrgSummary[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("devpulse_token");
      localStorage.removeItem("devpulse_user");
      localStorage.removeItem("devpulse_last_org");
    } catch {
      // Ignore storage errors
    }
    setToken(null);
    setUser(null);
    setOrganizations([]);
  }, []);

  const refreshMe = useCallback(async (): Promise<AuthMeResponse | null> => {
    try {
      const data = await auth.me();
      setUser(data.user);
      setOrganizations(data.organizations || []);
      try {
        localStorage.setItem("devpulse_user", JSON.stringify(data.user));
      } catch {
        // Ignore storage errors
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch user profile (/auth/me):", err);
      return null;
    }
  }, []);

  const loginWithToken = useCallback(
    async (t: string): Promise<AuthMeResponse> => {
      try {
        localStorage.setItem("devpulse_token", t);
      } catch {
        // Ignore storage errors
      }
      setToken(t);
      const data = await auth.me();
      setUser(data.user);
      setOrganizations(data.organizations || []);
      try {
        localStorage.setItem("devpulse_user", JSON.stringify(data.user));
      } catch {
        // Ignore storage errors
      }
      return data;
    },
    [],
  );

  useEffect(() => {
    let storedToken: string | null = null;
    try {
      storedToken = localStorage.getItem("devpulse_token");
    } catch {
      // Ignore storage errors
    }

    if (storedToken) {
      setToken(storedToken);
      auth
        .me()
        .then((data) => {
          setUser(data.user);
          setOrganizations(data.organizations || []);
          try {
            localStorage.setItem("devpulse_user", JSON.stringify(data.user));
          } catch {
            // Ignore storage errors
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        organizations,
        token,
        isLoggedIn: !!token,
        isLoading,
        loginWithToken,
        logout,
        refreshMe,
        setOrganizations,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { refreshToken } from "@/api/auth/auth";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  setTokenValue: (value: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "portfolio_auth_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(getStoredToken);

  const setTokenValue = useCallback((value: string | null) => {
    setToken(value);
    if (value) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, value);
      return;
    }
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const logout = useCallback(() => setTokenValue(null), [setTokenValue]);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    const handleExpired = () => logout();
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [logout]);

  useEffect(() => {
    const REFRESH_CHECK_MS = 60_000;
    const REFRESH_THRESHOLD_MS = 30 * 60_000;

    const checkAndRefresh = async () => {
      const current = tokenRef.current;
      if (!current) return;

      try {
        const [, payload] = current.split(".");
        const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
        const expiresAt = (decoded.exp ?? 0) * 1000;
        const remaining = expiresAt - Date.now();

        if (remaining > 0 && remaining < REFRESH_THRESHOLD_MS) {
          const result = await refreshToken(current);
          if (result.token) {
            setTokenValue(result.token);
          }
        } else if (remaining <= 0) {
          logout();
        }
      } catch {
        /* token decode failed — ignore until next check */
      }
    };

    const interval = setInterval(checkAndRefresh, REFRESH_CHECK_MS);
    return () => clearInterval(interval);
  }, [setTokenValue, logout]);

  const contextValue = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setTokenValue,
      logout,
    }),
    [token, setTokenValue, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}

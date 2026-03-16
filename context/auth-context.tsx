import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { refreshToken } from "@/api/auth/auth";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  setTokenValue: (value: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_STORAGE_KEY = "portfolio_auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const setTokenValue = useCallback((value: string | null) => {
    setToken(value);
    if (value) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, "true");
      return;
    }
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, []);

  const logout = useCallback(async () => {
    try {
      await import("@/api/auth/auth").then((m) => m.logoutUser());
    } catch {}
    setTokenValue(null);
  }, [setTokenValue]);

  // Recuperar sesión al cargar si hay indicio de estar logueado
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      const hasSession = window.localStorage.getItem(TOKEN_STORAGE_KEY) === "true";
      if (!hasSession) return;
      try {
        const result = await refreshToken("");
        if (mounted && result.token) {
          setTokenValue(result.token);
        }
      } catch {
        if (mounted) logout();
      }
    };
    initAuth();
    return () => { mounted = false; };
  }, [setTokenValue, logout]);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const handleExpired = () => {
      if (!isRefreshingRef.current) logout();
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, [logout]);

  useEffect(() => {
    const REFRESH_CHECK_MS = 60_000;
    const REFRESH_THRESHOLD_MS = 30 * 60_000;
    let cancelled = false;

    const checkAndRefresh = async () => {
      if (isRefreshingRef.current) return;
      const current = tokenRef.current;
      if (!current) return;

      try {
        const parts = current.split(".");
        if (parts.length !== 3) return;
        const decoded = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
        );
        if (typeof decoded.exp !== "number") return;
        const remaining = decoded.exp * 1000 - Date.now();

        if (remaining > 0 && remaining < REFRESH_THRESHOLD_MS) {
          isRefreshingRef.current = true;
          try {
            const result = await refreshToken(current);
            if (!cancelled && result.token) {
              setTokenValue(result.token);
            }
          } catch {
            if (!cancelled) logout();
          } finally {
            isRefreshingRef.current = false;
          }
        } else if (remaining <= 0) {
          logout();
        }
      } catch {
        /* token decode failed — skip until next check */
      }
    };

    const interval = setInterval(checkAndRefresh, REFRESH_CHECK_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setTokenValue, logout]);

  const contextValue = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      setTokenValue,
      logout,
    }),
    [token, setTokenValue, logout],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}

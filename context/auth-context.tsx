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
  isAuthReady: boolean;
  setTokenValue: (value: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_MARKER_KEY = "portfolio_auth_session";
const LEGACY_TOKEN_STORAGE_KEY = "portfolio_auth_token";
const COOKIE_SESSION_MARKER = "cookie-session";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const setTokenValue = useCallback((value: string | null) => {
    setToken(value);
    if (value) {
      // El JWT vive únicamente en la cookie HttpOnly; localStorage solo marca
      // que debemos intentar recuperar la sesión del servidor.
      window.localStorage.setItem(SESSION_MARKER_KEY, "true");
      window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      return;
    }
    window.localStorage.removeItem(SESSION_MARKER_KEY);
    window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  }, []);

  const logout = useCallback(async () => {
    try {
      await import("@/api/auth/auth").then((m) => m.logoutUser());
    } catch {}
    setTokenValue(null);
  }, [setTokenValue]);

  // Recuperar sesión desde la cookie HttpOnly al cargar la aplicación.
  useEffect(() => {
    let mounted = true;
    const initAuth = async () => {
      // Any previous marker (including the accidentally persisted JWT) only
      // triggers cookie recovery; its value is never read as a credential.
      const hasSession = Boolean(
        window.localStorage.getItem(SESSION_MARKER_KEY) ||
        window.localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY),
      );
      // Remove any legacy persisted JWT immediately; it is never used to auth.
      window.localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
      if (!hasSession) {
        if (mounted) setIsAuthReady(true);
        return;
      }
      try {
        const result = await refreshToken();
        if (mounted && result.authenticated) setTokenValue(COOKIE_SESSION_MARKER);
        else if (mounted) setTokenValue(null);
      } catch {
        // A transient refresh/network error must not call the server logout
        // endpoint and revoke a still-valid HttpOnly cookie. Keep the marker
        // so a later reload can retry cookie recovery.
      } finally {
        if (mounted) setIsAuthReady(true);
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
    const REFRESH_CHECK_MS = 12 * 60 * 60_000;
    let cancelled = false;

    const checkAndRefresh = async () => {
      if (isRefreshingRef.current) return;
      const current = tokenRef.current;
      if (!current) return;
      isRefreshingRef.current = true;
      try {
        const result = await refreshToken();
        if (!cancelled && result.authenticated) {
          setTokenValue(COOKIE_SESSION_MARKER);
        } else if (!cancelled) {
          logout();
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        isRefreshingRef.current = false;
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
      isAuthReady,
      setTokenValue,
      logout,
    }),
    [token, isAuthReady, setTokenValue, logout],
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

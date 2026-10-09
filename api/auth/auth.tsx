import { apiRequest, apiAuthRequest } from "@/api/http-client";
import { API_LOGIN, API_REGISTER, API_PRIVATE_REFRESH } from "@/api/endpoints";

type AuthPayload = {
  email: string;
  password: string;
};

type AuthServerResponse = {
  authenticated?: boolean;
  // Transitional compatibility with the currently deployed API. Never return
  // this legacy field to callers; the cookie is the only retained credential.
  token?: string;
  id?: number | string;
  name?: string;
  email?: string;
};

type AuthSuccess = Omit<AuthServerResponse, "token" | "authenticated"> & {
  authenticated: true;
};

async function requestAuth(path: string, payload: AuthPayload): Promise<AuthSuccess> {
  const data = await apiRequest<AuthServerResponse>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (data.authenticated !== true && !data.token) {
    throw new Error("No fue posible completar la autenticacion");
  }
  return { authenticated: true, id: data.id, name: data.name, email: data.email };
}

async function loginUser(credentials: AuthPayload): Promise<AuthSuccess> {
  return requestAuth(API_LOGIN, credentials);
}

async function registerUser(user: AuthPayload): Promise<AuthSuccess> {
  return requestAuth(API_REGISTER, user);
}

async function refreshToken(): Promise<AuthSuccess> {
  const data = await apiAuthRequest<AuthServerResponse>(API_PRIVATE_REFRESH, {
    method: "POST",
  });
  if (data.authenticated !== true && !data.token) {
    throw new Error("No fue posible renovar la sesion");
  }
  return { authenticated: true, id: data.id, name: data.name, email: data.email };
}

async function logoutUser(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/api/logout", {
    method: "POST",
  });
}

export { loginUser, registerUser, refreshToken, logoutUser };

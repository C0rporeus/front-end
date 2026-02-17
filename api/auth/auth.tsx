import { apiRequest, apiAuthRequest } from "@/api/http-client";
import { API_LOGIN, API_REGISTER, API_PRIVATE_REFRESH } from "@/api/endpoints";

type AuthPayload = {
  email: string;
  password: string;
};

type AuthSuccess = {
  token: string;
  id?: number | string;
  name?: string;
  email?: string;
};

async function requestAuth(path: string, payload: AuthPayload): Promise<AuthSuccess> {
  const data = await apiRequest<AuthSuccess>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!data.token) {
    throw new Error("No fue posible completar la autenticacion");
  }
  return data;
}

async function loginUser(credentials: AuthPayload): Promise<AuthSuccess> {
  return requestAuth(API_LOGIN, credentials);
}

async function registerUser(user: AuthPayload): Promise<AuthSuccess> {
  return requestAuth(API_REGISTER, user);
}

async function refreshToken(token: string): Promise<AuthSuccess> {
  return apiAuthRequest<AuthSuccess>(API_PRIVATE_REFRESH, token, {
    method: "POST",
  });
}

export { loginUser, registerUser, refreshToken };

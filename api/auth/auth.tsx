import { apiRequest } from "@/api/http-client";

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
  return requestAuth("/api/login", credentials);
}

async function registerUser(user: AuthPayload): Promise<AuthSuccess> {
  return requestAuth("/api/register", user);
}

export { loginUser, registerUser };

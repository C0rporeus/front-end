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

type ApiError = {
  code?: string;
  message?: string;
};

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

async function requestAuth(path: string, payload: AuthPayload): Promise<AuthSuccess> {
  const response = await fetch(`${baseURL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthSuccess & ApiError;
  if (!response.ok || !data.token) {
    throw new Error(data.message || "No fue posible completar la autenticacion");
  }

  return { token: data.token, id: data.id, name: data.name, email: data.email };
}

async function loginUser(credentials: AuthPayload): Promise<AuthSuccess> {
  return requestAuth("/api/login", credentials);
}

async function registerUser(user: AuthPayload): Promise<AuthSuccess> {
  return requestAuth("/api/register", user);
}

export { loginUser, registerUser };

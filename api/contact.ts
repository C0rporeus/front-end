import { apiRequest } from "./http-client";
import { API_CONTACT } from "./endpoints";

type ContactRequest = {
  name: string;
  email: string;
  message: string;
};

type ContactResponse = {
  sent: boolean;
};

export async function submitContact(data: ContactRequest): Promise<ContactResponse> {
  return apiRequest<ContactResponse>(API_CONTACT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

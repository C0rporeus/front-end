import { Experience, ExperiencePayload } from "@/interfaces/Experience";
import { apiRequest } from "@/api/http-client";

export async function listPublicExperiences(): Promise<Experience[]> {
  const data = await apiRequest<{ items: Experience[] }>("/api/experiences", {
    method: "GET",
  });
  return data.items;
}

export async function listPrivateExperiences(token: string): Promise<Experience[]> {
  const data = await apiRequest<{ items: Experience[] }>("/api/private/experiences", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data.items;
}

export function createExperience(token: string, payload: ExperiencePayload) {
  return apiRequest<Experience>("/api/private/experiences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function updateExperience(token: string, id: string, payload: ExperiencePayload) {
  return apiRequest<Experience>(`/api/private/experiences/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export function deleteExperience(token: string, id: string) {
  return apiRequest<{ deleted: boolean; id: string }>(`/api/private/experiences/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

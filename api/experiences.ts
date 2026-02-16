import { Experience, ExperiencePayload } from "@/interfaces/Experience";
import { apiRequest, apiAuthRequest } from "@/api/http-client";
import { getPublicCached, invalidatePublicCache } from "@/api/public-cache";
import { API_EXPERIENCES, API_PRIVATE_EXPERIENCES } from "@/api/endpoints";

const PUBLIC_EXPERIENCES_CACHE_KEY = "public-experiences";

function normalizeExperience(item: Experience): Experience {
  return {
    ...item,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
  };
}

export async function listPublicExperiences(): Promise<Experience[]> {
  const data = await getPublicCached<{ items: Experience[] }>(
    PUBLIC_EXPERIENCES_CACHE_KEY,
    () =>
      apiRequest<{ items: Experience[] }>(API_EXPERIENCES, {
        method: "GET",
      }),
    {
      ttlMs: 60_000,
    },
  );
  return data.items.map(normalizeExperience);
}

export function clearPublicExperiencesCache() {
  invalidatePublicCache([PUBLIC_EXPERIENCES_CACHE_KEY]);
}

export async function listPrivateExperiences(token: string): Promise<Experience[]> {
  const data = await apiAuthRequest<{ items: Experience[] }>(API_PRIVATE_EXPERIENCES, token, {
    method: "GET",
  });
  return data.items.map(normalizeExperience);
}

export async function createExperience(token: string, payload: ExperiencePayload) {
  const created = await apiAuthRequest<Experience>(API_PRIVATE_EXPERIENCES, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  clearPublicExperiencesCache();
  return normalizeExperience(created);
}

export async function updateExperience(token: string, id: string, payload: ExperiencePayload) {
  const updated = await apiAuthRequest<Experience>(`${API_PRIVATE_EXPERIENCES}/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  clearPublicExperiencesCache();
  return normalizeExperience(updated);
}

export async function deleteExperience(token: string, id: string) {
  const result = await apiAuthRequest<{ deleted: boolean; id: string }>(`${API_PRIVATE_EXPERIENCES}/${id}`, token, {
    method: "DELETE",
  });
  clearPublicExperiencesCache();
  return result;
}

import { Skill, SkillPayload } from "@/interfaces/Skill";
import { apiRequest, apiAuthRequest } from "@/api/http-client";
import { getPublicCached, invalidatePublicCache } from "@/api/public-cache";
import { API_SKILLS, API_PRIVATE_SKILLS } from "@/api/endpoints";

const PUBLIC_SKILLS_CACHE_KEY = "public-skills";

function normalizeSkill(item: Skill): Skill {
  return {
    ...item,
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
  };
}

export async function listPublicSkills(): Promise<Skill[]> {
  const data = await getPublicCached<{ items: Skill[] }>(
    PUBLIC_SKILLS_CACHE_KEY,
    () =>
      apiRequest<{ items: Skill[] }>(API_SKILLS, {
        method: "GET",
      }),
    {
      ttlMs: 60_000,
    },
  );
  return data.items.map(normalizeSkill);
}

export function clearPublicSkillsCache() {
  invalidatePublicCache([PUBLIC_SKILLS_CACHE_KEY]);
}

export async function listPrivateSkills(token: string): Promise<Skill[]> {
  const data = await apiAuthRequest<{ items: Skill[] }>(API_PRIVATE_SKILLS, token, {
    method: "GET",
  });
  return data.items.map(normalizeSkill);
}

export async function createSkill(token: string, payload: SkillPayload) {
  const created = await apiAuthRequest<Skill>(API_PRIVATE_SKILLS, token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  clearPublicSkillsCache();
  return normalizeSkill(created);
}

export async function updateSkill(token: string, id: string, payload: SkillPayload) {
  const updated = await apiAuthRequest<Skill>(`${API_PRIVATE_SKILLS}/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  clearPublicSkillsCache();
  return normalizeSkill(updated);
}

export async function deleteSkill(token: string, id: string) {
  const result = await apiAuthRequest<{ deleted: boolean; id: string }>(`${API_PRIVATE_SKILLS}/${id}`, token, {
    method: "DELETE",
  });
  clearPublicSkillsCache();
  return result;
}

import { filterAdminContent } from "@/utils/admin-content";
import type { Experience } from "@/interfaces/Experience";

const makeItem = (id: string, tags: string[]): Experience => ({
  id,
  title: id,
  summary: "",
  body: "",
  imageUrls: [],
  tags,
  visibility: "public",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
});

describe("filterAdminContent", () => {
  const article = makeItem("article", ["blog", "observabilidad"]);
  const experience = makeItem("experience", ["infraestructura"]);
  const skill = makeItem("skill", ["skill", "go"]);
  const portfolio = makeItem("portfolio", ["portfolio", "backend"]);
  const items = [article, experience, skill, portfolio];

  test("keeps blog articles out of the experiences view", () => {
    expect(filterAdminContent(items, "experiences")).toEqual([experience]);
  });

  test("keeps each content type in its own view", () => {
    expect(filterAdminContent(items, "blog")).toEqual([article]);
    expect(filterAdminContent(items, "skills")).toEqual([skill]);
    expect(filterAdminContent(items, "portfolio")).toEqual([portfolio]);
  });
});

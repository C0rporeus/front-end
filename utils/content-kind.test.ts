import { filterByKind, resolveContentKind, visibleTags } from "@/utils/content-kind";

describe("resolveContentKind", () => {
  test.each([
    [["blog", "observabilidad"], "blog"],
    [["Skill", "go"], "skill"],
    [["capacidad"], "skill"],
    [["portafolio"], "portfolio"],
    [["infraestructura"], "experience"],
    [[], "experience"],
    [["skill", "blog"], "blog"],
  ])("tags %j -> %s", (tags, expected) => {
    expect(resolveContentKind({ tags })).toBe(expected);
  });

  test("does not classify by substring (arquitectura is not an article)", () => {
    expect(resolveContentKind({ tags: ["arquitectura", "blogger-tools"] })).toBe("experience");
  });
});

describe("filterByKind", () => {
  test("keeps only requested kinds", () => {
    const items = [{ tags: ["blog"] }, { tags: ["skill"] }, { tags: ["portfolio"] }, { tags: [] }];
    expect(filterByKind(items, "portfolio", "experience")).toEqual([items[2], items[3]]);
  });
});

describe("visibleTags", () => {
  test("drops classification tags", () => {
    expect(visibleTags({ tags: ["software", "skill", "distribuido"] })).toEqual(["software", "distribuido"]);
  });
});

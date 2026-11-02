import { articleIdFromPath } from "./blog-route";

describe("articleIdFromPath", () => {
  it("extracts the id with and without trailing slash", () => {
    expect(articleIdFromPath("/blog/05b9c713-58e5-40b3-9837-3f2504db5d2e")).toBe(
      "05b9c713-58e5-40b3-9837-3f2504db5d2e",
    );
    expect(articleIdFromPath("/blog/abc/")).toBe("abc");
  });

  it("returns empty for the blog index, the shell route and other paths", () => {
    expect(articleIdFromPath("/blog")).toBe("");
    expect(articleIdFromPath("/blog/")).toBe("");
    expect(articleIdFromPath("/blog/articulo/")).toBe("");
    expect(articleIdFromPath("/blog/a/b")).toBe("");
    expect(articleIdFromPath("/portfolio/abc")).toBe("");
  });

  it("decodes encoded ids", () => {
    expect(articleIdFromPath("/blog/a%20b")).toBe("a b");
  });
});

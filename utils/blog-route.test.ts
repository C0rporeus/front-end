import { articleIdFromLocation, blogArticleHref } from "./blog-route";

describe("articleIdFromLocation", () => {
  it("extracts the id with and without trailing slash", () => {
    expect(articleIdFromLocation("/blog/05b9c713-58e5-40b3-9837-3f2504db5d2e")).toBe(
      "05b9c713-58e5-40b3-9837-3f2504db5d2e",
    );
    expect(articleIdFromLocation("/blog/abc/")).toBe("abc");
  });

  it("reads ?id= on the shell route (next dev)", () => {
    expect(articleIdFromLocation("/blog/articulo/", "?id=abc")).toBe("abc");
    expect(articleIdFromLocation("/blog/articulo", "")).toBe("");
  });

  it("returns empty for the blog index and other paths", () => {
    expect(articleIdFromLocation("/blog")).toBe("");
    expect(articleIdFromLocation("/blog/")).toBe("");
    expect(articleIdFromLocation("/blog/a/b")).toBe("");
    expect(articleIdFromLocation("/portfolio/abc")).toBe("");
  });

  it("decodes encoded ids", () => {
    expect(articleIdFromLocation("/blog/a%20b")).toBe("a b");
  });
});

describe("blogArticleHref", () => {
  it("links to the server-rendered page in production", () => {
    expect(blogArticleHref("abc", false)).toBe("/blog/abc/");
  });

  it("links to the shell with ?id= in development", () => {
    expect(blogArticleHref("a b", true)).toBe("/blog/articulo/?id=a%20b");
  });
});

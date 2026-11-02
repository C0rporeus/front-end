import { readEmbeddedArticle, selectRelated } from "./BlogArticleView";
import { Experience } from "@/interfaces/Experience";

const article = (id: string, tags: string[], createdAt = "2026-11-02T00:00:00Z"): Experience => ({
  id,
  title: `t-${id}`,
  summary: "",
  body: "",
  imageUrls: [],
  tags,
  visibility: "public",
  createdAt,
  updatedAt: createdAt,
});

const embed = (json: string) => {
  document.body.innerHTML = `<script id="__BLOG_ARTICLE__" type="application/json">${json}</script>`;
};

describe("readEmbeddedArticle", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("returns the article embedded by the server for the requested id", () => {
    embed(JSON.stringify({ ...article("abc", ["blog"]), body: "<p>hola</p>" }));
    expect(readEmbeddedArticle("abc")?.body).toBe("<p>hola</p>");
  });

  it("ignores data for another id, missing data and invalid JSON", () => {
    embed(JSON.stringify(article("other", ["blog"])));
    expect(readEmbeddedArticle("abc")).toBeNull();
    embed("{not json");
    expect(readEmbeddedArticle("abc")).toBeNull();
    document.body.innerHTML = "";
    expect(readEmbeddedArticle("abc")).toBeNull();
  });

  it("normalizes missing arrays", () => {
    embed(JSON.stringify({ id: "abc", title: "t" }));
    expect(readEmbeddedArticle("abc")).toMatchObject({ tags: [], imageUrls: [] });
  });
});

describe("selectRelated", () => {
  it("ranks by shared tags and excludes the current article", () => {
    const current = article("a", ["blog", "kubernetes", "go"]);
    const one = article("b", ["blog", "kubernetes"]);
    const two = article("c", ["blog", "kubernetes", "go"]);
    const none = article("d", ["recetas"]);
    expect(selectRelated(current, [current, one, two, none]).map((i) => i.id)).toEqual(["c", "b"]);
  });

  it("falls back to the latest articles when nothing is shared", () => {
    const current = article("a", ["x"]);
    expect(selectRelated(current, [current, article("b", ["y"])]).map((i) => i.id)).toEqual(["b"]);
  });
});

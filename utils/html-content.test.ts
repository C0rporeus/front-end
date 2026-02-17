import { isHtmlContent, sanitizeHtml, stripHtml } from "./html-content";

describe("html-content", () => {
  describe("isHtmlContent", () => {
    it("returns true for strings with HTML tags", () => {
      expect(isHtmlContent("<p>hello</p>")).toBe(true);
      expect(isHtmlContent("<strong>bold</strong>")).toBe(true);
    });

    it("returns false for plain text", () => {
      expect(isHtmlContent("hello world")).toBe(false);
      expect(isHtmlContent("no tags here")).toBe(false);
    });
  });

  describe("sanitizeHtml", () => {
    it("keeps allowed tags", () => {
      const result = sanitizeHtml("<p>hello</p><strong>bold</strong>");
      expect(result).toContain("<p>");
      expect(result).toContain("<strong>");
    });

    it("removes disallowed tags", () => {
      const result = sanitizeHtml('<script>alert("xss")</script><p>safe</p>');
      expect(result).not.toContain("<script>");
      expect(result).toContain("<p>safe</p>");
    });
  });

  describe("stripHtml", () => {
    it("returns empty string for empty input", () => {
      expect(stripHtml("")).toBe("");
    });

    it("returns plain text unchanged", () => {
      expect(stripHtml("hello world")).toBe("hello world");
    });

    it("strips HTML tags and returns text content", () => {
      expect(stripHtml("<p>hello <strong>world</strong></p>")).toBe("hello world");
    });
  });
});

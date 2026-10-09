import { buildMetaDescription, toShareableImageURL } from "@/utils/seo";

describe("toShareableImageURL", () => {
  const object = "63a96a8f-df27-40b7-930e-78a2b94e4242.jpeg";

  test("maps signed GCS uploads to the stable media endpoint", () => {
    const signed = `https://storage.googleapis.com/bucket/portfolio-images/${object}?X-Goog-Signature=abc`;
    expect(toShareableImageURL(signed)).toMatch(new RegExp(`/api/media/${object}\\?variant=og$`));
  });

  test("keeps external http(s) images and drops anything else", () => {
    expect(toShareableImageURL("https://images.unsplash.com/a.jpg")).toBe("https://images.unsplash.com/a.jpg");
    expect(toShareableImageURL("data:image/png;base64,xx")).toBe("");
  });
});

describe("buildMetaDescription", () => {
  test("prefers summary", () => {
    expect(buildMetaDescription("Resumen corto", "<p>Cuerpo</p>")).toBe("Resumen corto");
  });

  test("falls back to body text and truncates on a word boundary", () => {
    const body = `<p>${"palabra ".repeat(40)}</p>`;
    const result = buildMetaDescription("", body, 50);
    expect(result.length).toBeLessThanOrEqual(50);
    expect(result.endsWith("palabra…")).toBe(true);
  });
});

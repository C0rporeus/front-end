import { uploadImage, uploadImageWithPreview, MAX_IMAGE_UPLOAD_BYTES } from "./upload";

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe("upload api", () => {
  it("uploads file and returns URL when backend returns 200", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://storage.googleapis.com/bucket/path.jpg" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const url = await uploadImage(file);

    expect(url).toBe("https://storage.googleapis.com/bucket/path.jpg");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/private/upload-image"),
      expect.objectContaining({
        method: "POST",
        credentials: "include",
      }),
    );
    const formData = (fetchMock.mock.calls[0][1] as RequestInit).body as FormData;
    expect(formData.get("file")).toBe(file);
  });

  it("returns signed previewUrl alongside canonical url", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        url: "https://storage.googleapis.com/bucket/path.jpg",
        previewUrl: "https://storage.googleapis.com/bucket/path.jpg?X-Goog-Signature=abc",
      }),
    }) as unknown as typeof fetch;

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await expect(uploadImageWithPreview(file)).resolves.toEqual({
      url: "https://storage.googleapis.com/bucket/path.jpg",
      previewUrl: "https://storage.googleapis.com/bucket/path.jpg?X-Goog-Signature=abc",
    });
  });

  it("falls back to url as previewUrl when backend omits it", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ url: "https://example.com/a.jpg" }),
    }) as unknown as typeof fetch;

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    await expect(uploadImageWithPreview(file)).resolves.toEqual({
      url: "https://example.com/a.jpg",
      previewUrl: "https://example.com/a.jpg",
    });
  });

  it("throws when response is not ok", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: "file_too_large", code: "file_too_large" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    await expect(uploadImage(file)).rejects.toThrow("file_too_large");
  });

  it("throws when response has no url", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    await expect(uploadImage(file)).rejects.toThrow("no incluyó la URL");
  });

  it("throws when file exceeds max size", async () => {
    const file = new File([new ArrayBuffer(MAX_IMAGE_UPLOAD_BYTES + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    await expect(uploadImage(file)).rejects.toThrow("límite");
  });

  it("throws when file type is not allowed", async () => {
    const file = new File(["x"], "doc.pdf", { type: "application/pdf" });
    await expect(uploadImage(file)).rejects.toThrow("Tipo de archivo no permitido");
  });
});

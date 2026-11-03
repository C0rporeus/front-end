import { downloadBlob } from "./download";

describe("downloadBlob", () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;

  afterEach(() => {
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  });

  test("downloads through a temporary Blob URL that is revoked right away", () => {
    const create = jest.fn(() => "blob:fake");
    const revoke = jest.fn();
    URL.createObjectURL = create;
    URL.revokeObjectURL = revoke;
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    downloadBlob("cert.pem", "contenido", "application/x-pem-file");

    expect(create).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revoke).toHaveBeenCalledWith("blob:fake");
    expect(document.querySelector("a[download]")).toBeNull(); // no deja el enlace en el DOM
    click.mockRestore();
  });

  test("revokes the URL even if the click fails", () => {
    const revoke = jest.fn();
    URL.createObjectURL = jest.fn(() => "blob:fake");
    URL.revokeObjectURL = revoke;
    const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {
      throw new Error("blocked");
    });

    expect(() => downloadBlob("a.txt", "x", "text/plain")).toThrow("blocked");
    expect(revoke).toHaveBeenCalledWith("blob:fake");
    click.mockRestore();
  });
});

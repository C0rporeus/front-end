import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CertsTool from "./CertsTool";
import { generateSelfSignedCertificate } from "@/utils/self-signed-cert";
import { downloadBlob } from "@/utils/download";

jest.mock("@/utils/self-signed-cert", () => ({
  ...jest.requireActual("@/utils/self-signed-cert"),
  generateSelfSignedCertificate: jest.fn(),
}));
jest.mock("@/utils/download");

const mockGenerate = jest.mocked(generateSelfSignedCertificate);
const mockDownload = jest.mocked(downloadBlob);

const fakeResult = {
  certPem: "-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----\n",
  keyPem: "-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----\n",
  pfx: new Uint8Array([1, 2, 3]),
  altNames: ["localhost", "127.0.0.1"],
  notBefore: new Date("2026-01-01T00:00:00Z"),
  notAfter: new Date("2027-01-01T00:00:00Z"),
};

describe("CertsTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("states clearly that everything stays in the browser and nothing is stored", () => {
    render(<CertsTool />);
    const note = screen.getByRole("note", { name: "Privacidad" });
    expect(note).toHaveTextContent(/Nada sale de tu equipo/);
    expect(note).toHaveTextContent(/no se envía al servidor/);
    expect(note).toHaveTextContent(/ni localStorage, ni cookies/);
  });

  test("generates with parsed SAN names and shows certificate, key and validity", async () => {
    mockGenerate.mockResolvedValue(fakeResult);
    render(<CertsTool />);

    fireEvent.change(screen.getByLabelText(/Common Name/), { target: { value: "dev.local" } });
    fireEvent.change(screen.getByLabelText(/Nombres alternativos/), { target: { value: "Dev.local, 10.0.0.5" } });
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));

    await waitFor(() => {
      expect(mockGenerate).toHaveBeenCalledWith(
        expect.objectContaining({ commonName: "dev.local", altNames: ["dev.local", "10.0.0.5"], pfxPassword: undefined }),
      );
      expect(screen.getByText(/MOCK_CERT/)).toBeInTheDocument();
      expect(screen.getByText(/MOCK_KEY/)).toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("2026-01-01 al 2027-01-01");
    });
  });

  test("never touches the network, storage or cookies", async () => {
    mockGenerate.mockResolvedValue(fakeResult);
    const fetchSpy = jest.fn();
    const originalFetch = global.fetch;
    global.fetch = fetchSpy as unknown as typeof fetch;
    const setItem = jest.spyOn(Storage.prototype, "setItem");
    const cookieBefore = document.cookie;

    render(<CertsTool />);
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));
    await screen.findByText(/MOCK_KEY/);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe(cookieBefore);

    setItem.mockRestore();
    global.fetch = originalFetch;
  });

  test("«Limpiar» removes the key, the certificate and the password from the screen", async () => {
    mockGenerate.mockResolvedValue(fakeResult);
    render(<CertsTool />);
    fireEvent.click(screen.getByLabelText(/Generar también un archivo .pfx/));
    fireEvent.change(screen.getByLabelText("Contraseña del .pfx"), { target: { value: "s3cret" } });
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));
    await screen.findByText(/MOCK_KEY/);

    fireEvent.click(screen.getByRole("button", { name: "Limpiar" }));

    expect(screen.queryByText(/MOCK_KEY/)).not.toBeInTheDocument();
    expect(screen.queryByText(/MOCK_CERT/)).not.toBeInTheDocument();
    expect((screen.getByLabelText("Contraseña del .pfx") as HTMLInputElement).value).toBe("");
  });

  test("the .pfx needs a password before generating", () => {
    render(<CertsTool />);
    fireEvent.click(screen.getByLabelText(/Generar también un archivo .pfx/));
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/contraseña/);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  test("downloads are created locally through downloadBlob", async () => {
    mockGenerate.mockResolvedValue(fakeResult);
    render(<CertsTool />);
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));
    await screen.findByText(/MOCK_KEY/);

    fireEvent.click(screen.getByRole("button", { name: "Descargar .crt" }));
    fireEvent.click(screen.getByRole("button", { name: "Descargar .key" }));
    fireEvent.click(screen.getByRole("button", { name: "Descargar .pfx" }));

    expect(mockDownload).toHaveBeenCalledWith("certificate.crt", fakeResult.certPem, "application/x-pem-file");
    expect(mockDownload).toHaveBeenCalledWith("private.key", fakeResult.keyPem, "application/x-pem-file");
    expect(mockDownload).toHaveBeenCalledWith("certificate.pfx", fakeResult.pfx, "application/x-pkcs12");
  });

  test("shows validation errors from the generator", async () => {
    mockGenerate.mockRejectedValue(new Error('"no valido" no es un nombre DNS ni una IPv4 válidos'));
    render(<CertsTool />);
    fireEvent.click(screen.getByRole("button", { name: "Generar certificado" }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/no es un nombre DNS/);
    });
  });
});

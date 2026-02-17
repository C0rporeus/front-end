import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RsaKeysTool from "./RsaKeysTool";

const mockPublicKey = new ArrayBuffer(8);
const mockPrivateKey = new ArrayBuffer(8);

const mockCryptoKeyPair = {
  publicKey: {} as CryptoKey,
  privateKey: {} as CryptoKey,
};

const originalCrypto = window.crypto;

beforeEach(() => {
  Object.defineProperty(window, "crypto", {
    value: {
      subtle: {
        generateKey: jest.fn().mockResolvedValue(mockCryptoKeyPair),
        exportKey: jest.fn().mockImplementation((_format: string, key: CryptoKey) => {
          return key === mockCryptoKeyPair.publicKey
            ? Promise.resolve(mockPublicKey)
            : Promise.resolve(mockPrivateKey);
        }),
      },
    },
    writable: true,
  });
});

afterEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, "crypto", {
    value: originalCrypto,
    writable: true,
  });
});

describe("RsaKeysTool", () => {
  test("renders key size select and generate button", () => {
    render(<RsaKeysTool />);
    expect(screen.getByText("2048 bits")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generar Par RSA/i })).toBeInTheDocument();
  });

  test("generate: click button, verify public and private key sections appear", async () => {
    render(<RsaKeysTool />);
    fireEvent.click(screen.getByRole("button", { name: /Generar Par RSA/i }));

    await waitFor(() => {
      expect(screen.getByText(/Clave Publica/i)).toBeInTheDocument();
      expect(screen.getByText(/Clave Privada/i)).toBeInTheDocument();
      expect(screen.getByText(/BEGIN PUBLIC KEY/)).toBeInTheDocument();
      expect(screen.getByText(/BEGIN PRIVATE KEY/)).toBeInTheDocument();
    });
  });

  test("key size select: can change to 4096", () => {
    render(<RsaKeysTool />);
    const select = screen.getByRole("combobox");
    expect(select).toHaveValue("2048");
    fireEvent.change(select, { target: { value: "4096" } });
    expect(select).toHaveValue("4096");
  });

  test("error: shows ErrorAlert on crypto failure", async () => {
    (window.crypto.subtle.generateKey as jest.Mock).mockRejectedValue(new Error("Unsupported"));

    render(<RsaKeysTool />);
    fireEvent.click(screen.getByRole("button", { name: /Generar Par RSA/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Error generando las claves RSA/i)).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CertsTool from "./CertsTool";
import { generateSelfSignedCert } from "@/api/tools";

jest.mock("@/api/tools");

const mockGenerateSelfSignedCert = jest.mocked(generateSelfSignedCert);

describe("CertsTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders all 4 inputs and button", () => {
    render(<CertsTool />);
    expect(screen.getByPlaceholderText("Common Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Organization")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Dias de validez")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password PFX")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Generar Certificado/i })).toBeInTheDocument();
  });

  test("submit: fill inputs, click button, verify cert output appears", async () => {
    const mockResult = {
      certPem: "-----BEGIN CERTIFICATE-----\nMOCK_CERT\n-----END CERTIFICATE-----",
      keyPem: "-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----",
      certBase64: "MOCK_CERT_BASE64",
      pfxBase64: "MOCK_PFX_BASE64",
      password: "testpass",
    };
    mockGenerateSelfSignedCert.mockResolvedValue(mockResult);

    render(<CertsTool />);
    const commonNameInput = screen.getByPlaceholderText("Common Name");
    const organizationInput = screen.getByPlaceholderText("Organization");
    const validDaysInput = screen.getByPlaceholderText("Dias de validez");
    const passwordInput = screen.getByPlaceholderText("Password PFX");
    const generateButton = screen.getByRole("button", { name: /Generar Certificado/i });

    fireEvent.change(commonNameInput, { target: { value: "test.example.com" } });
    fireEvent.change(organizationInput, { target: { value: "Test Org" } });
    fireEvent.change(validDaysInput, { target: { value: "730" } });
    fireEvent.change(passwordInput, { target: { value: "newpassword" } });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateSelfSignedCert).toHaveBeenCalledWith({
        commonName: "test.example.com",
        organization: "Test Org",
        validDays: 730,
        password: "newpassword",
      });
      expect(screen.getByText(/=== CERT \(PEM\) ===/i)).toBeInTheDocument();
      expect(screen.getByText(/=== KEY \(PEM\) ===/i)).toBeInTheDocument();
      expect(screen.getByText(/=== PFX \(BASE64\) ===/i)).toBeInTheDocument();
    });
  });

  test("uses defaults: click without changing inputs, verify API called with default values", async () => {
    const mockResult = {
      certPem: "MOCK_CERT",
      keyPem: "MOCK_KEY",
      certBase64: "MOCK_CERT_BASE64",
      pfxBase64: "MOCK_PFX_BASE64",
      password: "changeit",
    };
    mockGenerateSelfSignedCert.mockResolvedValue(mockResult);

    render(<CertsTool />);
    const generateButton = screen.getByRole("button", { name: /Generar Certificado/i });

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateSelfSignedCert).toHaveBeenCalledWith({
        commonName: "localhost",
        organization: "PortfolioTools",
        validDays: 365,
        password: "changeit",
      });
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockGenerateSelfSignedCert.mockRejectedValue(mockError);

    render(<CertsTool />);
    const generateButton = screen.getByRole("button", { name: /Generar Certificado/i });

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error procesando la solicitud/i)).toBeInTheDocument();
    });
  });
});

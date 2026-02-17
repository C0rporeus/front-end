import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import MailRecordsTool from "./MailRecordsTool";
import { getMailRecords } from "@/api/tools";

jest.mock("@/api/tools");

const mockGetMailRecords = jest.mocked(getMailRecords);

describe("MailRecordsTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and button", () => {
    render(<MailRecordsTool />);
    expect(screen.getByPlaceholderText("ejemplo.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Consultar/i })).toBeInTheDocument();
  });

  test("submit: type domain, click Consultar, verify MX records section appears with data", async () => {
    const mockResult = {
      domain: "example.com",
      mx: ["10 mail.example.com", "20 mail2.example.com"],
      spf: ['v=spf1 include:_spf.example.com ~all'],
      dkim: ['v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC'],
      dmarc: ['v=DMARC1; p=none; rua=mailto:dmarc@example.com'],
    };
    mockGetMailRecords.mockResolvedValue(mockResult);

    render(<MailRecordsTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(mockGetMailRecords).toHaveBeenCalledWith("example.com");
      expect(screen.getByText("MX (Mail Exchange)")).toBeInTheDocument();
      expect(screen.getByText("10 mail.example.com")).toBeInTheDocument();
      expect(screen.getByText("20 mail2.example.com")).toBeInTheDocument();
      expect(screen.getByText("SPF (Sender Policy Framework)")).toBeInTheDocument();
      expect(screen.getByText("DKIM (DomainKeys)")).toBeInTheDocument();
      expect(screen.getByText("DMARC (Domain-based Auth)")).toBeInTheDocument();
    });
  });

  test("no records: mock with all empty arrays, verify Sin registros messages", async () => {
    const mockResult = {
      domain: "example.com",
      mx: [],
      spf: [],
      dkim: [],
      dmarc: [],
    };
    mockGetMailRecords.mockResolvedValue(mockResult);

    render(<MailRecordsTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(mockGetMailRecords).toHaveBeenCalledWith("example.com");
      expect(screen.getByText("MX (Mail Exchange)")).toBeInTheDocument();
      expect(screen.getByText("SPF (Sender Policy Framework)")).toBeInTheDocument();
      expect(screen.getByText("DKIM (DomainKeys)")).toBeInTheDocument();
      expect(screen.getByText("DMARC (Domain-based Auth)")).toBeInTheDocument();
      expect(screen.getAllByText("No se encontraron registros.").length).toBeGreaterThanOrEqual(4);
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockGetMailRecords.mockRejectedValue(mockError);

    render(<MailRecordsTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Error al consultar los registros de correo/i)).toBeInTheDocument();
    });
  });
});

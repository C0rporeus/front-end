import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DnsPropagationTool from "./DnsPropagationTool";
import { checkDnsPropagation } from "@/api/tools";

jest.mock("@/api/tools");

const mockCheckDnsPropagation = jest.mocked(checkDnsPropagation);

describe("DnsPropagationTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input, select, and button", () => {
    render(<DnsPropagationTool />);
    expect(screen.getByPlaceholderText("ejemplo.com")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Consultar/i })).toBeInTheDocument();
  });

  test("submit: type domain, select type, click Consultar, verify records shown in list", async () => {
    const mockResult = {
      domain: "example.com",
      recordType: "A",
      records: ["93.184.216.34", "93.184.216.35"],
      timestamp: "2024-01-01T00:00:00Z",
    };
    mockCheckDnsPropagation.mockResolvedValue(mockResult);

    render(<DnsPropagationTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const select = screen.getByRole("combobox");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.change(select, { target: { value: "A" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(mockCheckDnsPropagation).toHaveBeenCalledWith("example.com", "A");
      expect(screen.getByText("93.184.216.34")).toBeInTheDocument();
      expect(screen.getByText("93.184.216.35")).toBeInTheDocument();
      expect(screen.getByText(/Tipo:/i)).toBeInTheDocument();
      expect(screen.getByText(/Registros:/i)).toBeInTheDocument();
    });
  });

  test("changing record type select sends correct type to API", async () => {
    mockCheckDnsPropagation.mockResolvedValue({
      domain: "example.com",
      recordType: "MX",
      records: ["10 mail.example.com"],
      timestamp: "2024-01-01T00:00:00Z",
    });

    render(<DnsPropagationTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const select = screen.getByRole("combobox");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.change(select, { target: { value: "MX" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(mockCheckDnsPropagation).toHaveBeenCalledWith("example.com", "MX");
      expect(screen.getByText("10 mail.example.com")).toBeInTheDocument();
    });
  });

  test("empty records: mock with empty records array, verify No se encontraron message", async () => {
    const mockResult = {
      domain: "example.com",
      recordType: "MX",
      records: [],
      timestamp: "2024-01-01T00:00:00Z",
    };
    mockCheckDnsPropagation.mockResolvedValue(mockResult);

    render(<DnsPropagationTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const select = screen.getByRole("combobox");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.change(select, { target: { value: "MX" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(mockCheckDnsPropagation).toHaveBeenCalledWith("example.com", "MX");
      expect(screen.getByText(/No se encontraron registros MX para este dominio/i)).toBeInTheDocument();
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockCheckDnsPropagation.mockRejectedValue(mockError);

    render(<DnsPropagationTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const consultButton = screen.getByRole("button", { name: /Consultar/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText(/Error al consultar la propagacion DNS/i)).toBeInTheDocument();
    });
  });
});

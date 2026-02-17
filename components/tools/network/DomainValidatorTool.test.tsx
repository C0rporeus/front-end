import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DomainValidatorTool from "./DomainValidatorTool";
import { resolveDomain } from "@/api/tools";

jest.mock("@/api/tools");

const mockResolveDomain = jest.mocked(resolveDomain);

describe("DomainValidatorTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and button", () => {
    render(<DomainValidatorTool />);
    expect(screen.getByPlaceholderText("ejemplo.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Resolver/i })).toBeInTheDocument();
  });

  test("submit: type domain, click Resolver, verify IPv4 addresses shown", async () => {
    const mockResult = {
      domain: "example.com",
      ipv4: ["93.184.216.34", "93.184.216.35"],
      ipv6: ["2606:2800:220:1:248:1893:25c8:1946"],
      resolved: true,
    };
    mockResolveDomain.mockResolvedValue(mockResult);

    render(<DomainValidatorTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const resolveButton = screen.getByRole("button", { name: /Resolver/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(resolveButton);

    await waitFor(() => {
      expect(mockResolveDomain).toHaveBeenCalledWith("example.com");
      expect(screen.getByText(/Dominio resuelto correctamente/i)).toBeInTheDocument();
      expect(screen.getByText("93.184.216.34")).toBeInTheDocument();
      expect(screen.getByText("93.184.216.35")).toBeInTheDocument();
    });
  });

  test("unresolvable domain: mock with resolved=false, verify status text", async () => {
    const mockResult = {
      domain: "nonexistent.example",
      ipv4: [],
      ipv6: [],
      resolved: false,
    };
    mockResolveDomain.mockResolvedValue(mockResult);

    render(<DomainValidatorTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const resolveButton = screen.getByRole("button", { name: /Resolver/i });

    fireEvent.change(domainInput, { target: { value: "nonexistent.example" } });
    fireEvent.click(resolveButton);

    await waitFor(() => {
      expect(mockResolveDomain).toHaveBeenCalledWith("nonexistent.example");
      expect(screen.getByText(/No se pudo resolver el dominio/i)).toBeInTheDocument();
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockResolveDomain.mockRejectedValue(mockError);

    render(<DomainValidatorTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");
    const resolveButton = screen.getByRole("button", { name: /Resolver/i });

    fireEvent.change(domainInput, { target: { value: "example.com" } });
    fireEvent.click(resolveButton);

    await waitFor(() => {
      expect(screen.getByText(/Error al resolver el dominio/i)).toBeInTheDocument();
    });
  });
});

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

  test("submit via Enter key triggers resolve", async () => {
    mockResolveDomain.mockResolvedValue({
      domain: "enter.com",
      ipv4: ["1.2.3.4"],
      ipv6: [],
      resolved: true,
    });

    render(<DomainValidatorTool />);
    const domainInput = screen.getByPlaceholderText("ejemplo.com");

    fireEvent.change(domainInput, { target: { value: "enter.com" } });
    fireEvent.keyDown(domainInput, { key: "Enter" });

    await waitFor(() => {
      expect(mockResolveDomain).toHaveBeenCalledWith("enter.com");
      expect(screen.getByText("1.2.3.4")).toBeInTheDocument();
    });
  });

  test("button shows loading text while resolving", async () => {
    type ResolveResult = { domain: string; ipv4: string[]; ipv6: string[]; resolved: boolean };
    let resolvePromise: (value: ResolveResult) => void;
    mockResolveDomain.mockReturnValue(
      new Promise<ResolveResult>((resolve) => { resolvePromise = resolve; })
    );

    render(<DomainValidatorTool />);
    fireEvent.change(screen.getByPlaceholderText("ejemplo.com"), { target: { value: "slow.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Resolver/i }));

    expect(screen.getByRole("button", { name: /Consultando/i })).toBeDisabled();

    resolvePromise!({ domain: "slow.com", ipv4: [], ipv6: [], resolved: false });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Resolver/i })).not.toBeDisabled();
    });
  });

  test("empty domain does not trigger API call", async () => {
    render(<DomainValidatorTool />);
    fireEvent.click(screen.getByRole("button", { name: /Resolver/i }));
    expect(mockResolveDomain).not.toHaveBeenCalled();
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

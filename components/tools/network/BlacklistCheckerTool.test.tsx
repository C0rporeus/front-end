import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import BlacklistCheckerTool from "./BlacklistCheckerTool";
import { checkBlacklist, resolveDomain } from "@/api/tools";

jest.mock("@/api/tools");

const mockCheckBlacklist = jest.mocked(checkBlacklist);
const mockResolveDomain = jest.mocked(resolveDomain);

describe("BlacklistCheckerTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and button", () => {
    render(<BlacklistCheckerTool />);
    expect(screen.getByPlaceholderText("8.8.8.8 o ejemplo.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verificar/i })).toBeInTheDocument();
  });

  test("direct IP: type 8.8.8.8, click Verificar, verify checkBlacklist called (not resolveDomain), verify results table", async () => {
    const mockResult = {
      ip: "8.8.8.8",
      results: [
        { provider: "zen.spamhaus.org", listed: false },
        { provider: "bl.spamcop.net", listed: false },
        { provider: "dnsbl.sorbs.net", listed: true },
      ],
    };
    mockCheckBlacklist.mockResolvedValue(mockResult);

    render(<BlacklistCheckerTool />);
    const input = screen.getByPlaceholderText("8.8.8.8 o ejemplo.com");
    const verifyButton = screen.getByRole("button", { name: /Verificar/i });

    fireEvent.change(input, { target: { value: "8.8.8.8" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockCheckBlacklist).toHaveBeenCalledWith("8.8.8.8");
      expect(mockResolveDomain).not.toHaveBeenCalled();
      expect(screen.getByText("zen.spamhaus.org")).toBeInTheDocument();
      expect(screen.getByText("bl.spamcop.net")).toBeInTheDocument();
      expect(screen.getByText("dnsbl.sorbs.net")).toBeInTheDocument();
    });
  });

  test("domain input: type example.com, click Verificar, verify resolveDomain called first, then checkBlacklist with resolved IP", async () => {
    const mockResolveResult = {
      domain: "example.com",
      ipv4: ["93.184.216.34"],
      ipv6: ["2606:2800:220:1:248:1893:25c8:1946"],
      resolved: true,
    };
    const mockBlacklistResult = {
      ip: "93.184.216.34",
      results: [
        { provider: "zen.spamhaus.org", listed: false },
        { provider: "bl.spamcop.net", listed: false },
      ],
    };
    mockResolveDomain.mockResolvedValue(mockResolveResult);
    mockCheckBlacklist.mockResolvedValue(mockBlacklistResult);

    render(<BlacklistCheckerTool />);
    const input = screen.getByPlaceholderText("8.8.8.8 o ejemplo.com");
    const verifyButton = screen.getByRole("button", { name: /Verificar/i });

    fireEvent.change(input, { target: { value: "example.com" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockResolveDomain).toHaveBeenCalledWith("example.com");
      expect(mockCheckBlacklist).toHaveBeenCalledWith("93.184.216.34");
      expect(screen.getByText(/Dominio resuelto a/i)).toBeInTheDocument();
      expect(screen.getByText("93.184.216.34")).toBeInTheDocument();
      expect(screen.getByText("zen.spamhaus.org")).toBeInTheDocument();
    });
  });

  test("all clean: mock results with all listed=false, verify Limpia badges", async () => {
    const mockResult = {
      ip: "8.8.8.8",
      results: [
        { provider: "zen.spamhaus.org", listed: false },
        { provider: "bl.spamcop.net", listed: false },
        { provider: "dnsbl.sorbs.net", listed: false },
      ],
    };
    mockCheckBlacklist.mockResolvedValue(mockResult);

    render(<BlacklistCheckerTool />);
    const input = screen.getByPlaceholderText("8.8.8.8 o ejemplo.com");
    const verifyButton = screen.getByRole("button", { name: /Verificar/i });

    fireEvent.change(input, { target: { value: "8.8.8.8" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockCheckBlacklist).toHaveBeenCalledWith("8.8.8.8");
      const limpiaBadges = screen.getAllByText("Limpia");
      expect(limpiaBadges).toHaveLength(3);
      expect(screen.getByText(/IP limpia — no aparece en ninguna lista/i)).toBeInTheDocument();
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockCheckBlacklist.mockRejectedValue(mockError);

    render(<BlacklistCheckerTool />);
    const input = screen.getByPlaceholderText("8.8.8.8 o ejemplo.com");
    const verifyButton = screen.getByRole("button", { name: /Verificar/i });

    fireEvent.change(input, { target: { value: "8.8.8.8" } });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});

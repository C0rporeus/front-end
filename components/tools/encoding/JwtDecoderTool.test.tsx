import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import JwtDecoderTool from "./JwtDecoderTool";

const VALID_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const EXPIRED_TOKEN = (() => {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const payload = btoa(JSON.stringify({ sub: "1", exp: 1000000000 })).replace(/=/g, "");
  return `${header}.${payload}.fakesig`;
})();

describe("JwtDecoderTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders token textarea and decode button", () => {
    render(<JwtDecoderTool />);
    expect(screen.getByPlaceholderText(/eyJhbGci/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decodificar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pegar desde portapapeles/i })).toBeInTheDocument();
  });

  test("valid JWT: decode shows header, payload, and signature sections", () => {
    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: VALID_TOKEN } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText(/Claims registrados/i)).toBeInTheDocument();
    expect(screen.getByText("Signature")).toBeInTheDocument();
    expect(screen.getByText("HS256")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
  });

  test("expired token: shows expiry warning", () => {
    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: EXPIRED_TOKEN } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByText(/Expirado hace/)).toBeInTheDocument();
  });

  test("invalid token: shows error message", () => {
    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: "not.a.valid-jwt" } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  test("empty input: no output rendered, no crash", () => {
    render(<JwtDecoderTool />);
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.queryByText("Header")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("token with wrong segment count shows specific error", () => {
    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: "only.two" } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByText(/3 segmentos/)).toBeInTheDocument();
  });

  test("Ctrl+Enter triggers decode", async () => {
    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: VALID_TOKEN } });
    fireEvent.keyDown(textarea, { key: "Enter", ctrlKey: true });

    await waitFor(() => {
      expect(screen.getByText("Header")).toBeInTheDocument();
    });
  });

  test("paste from clipboard decodes valid token", async () => {
    Object.assign(navigator, {
      clipboard: {
        readText: jest.fn().mockResolvedValue(VALID_TOKEN),
      },
    });

    render(<JwtDecoderTool />);
    fireEvent.click(screen.getByRole("button", { name: /Pegar desde portapapeles/i }));

    await screen.findByText("Header");
    expect(screen.getByText("HS256")).toBeInTheDocument();
  });

  test("paste from clipboard shows error for invalid token", async () => {
    Object.assign(navigator, {
      clipboard: {
        readText: jest.fn().mockResolvedValue("bad-token"),
      },
    });

    render(<JwtDecoderTool />);
    fireEvent.click(screen.getByRole("button", { name: /Pegar desde portapapeles/i }));

    await screen.findByText(/no es un JWT valido/i);
  });

  test("paste failure shows clipboard access error", async () => {
    Object.assign(navigator, {
      clipboard: {
        readText: jest.fn().mockRejectedValue(new Error("denied")),
      },
    });

    render(<JwtDecoderTool />);
    fireEvent.click(screen.getByRole("button", { name: /Pegar desde portapapeles/i }));

    await screen.findByText(/portapapeles/i);
  });

  test("future-expiry token shows Expira en label", () => {
    const futureExp = Math.floor(Date.now() / 1000) + 600;
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
    const payload = btoa(JSON.stringify({ sub: "1", exp: futureExp })).replace(/=/g, "");
    const futureToken = `${header}.${payload}.fakesig`;

    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: futureToken } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByText(/Expira en/)).toBeInTheDocument();
  });

  test("shows custom claims section for non-standard claims", () => {
    const header = btoa(JSON.stringify({ alg: "HS256" })).replace(/=/g, "");
    const payload = btoa(JSON.stringify({ sub: "1", role: "admin", permissions: ["read"] })).replace(/=/g, "");
    const customToken = `${header}.${payload}.sig`;

    render(<JwtDecoderTool />);
    const textarea = screen.getByPlaceholderText(/eyJhbGci/);
    fireEvent.change(textarea, { target: { value: customToken } });
    fireEvent.click(screen.getByRole("button", { name: "Decodificar" }));

    expect(screen.getByText(/Claims personalizados/i)).toBeInTheDocument();
    expect(screen.getByText("role")).toBeInTheDocument();
  });
});

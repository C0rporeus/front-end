import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
});

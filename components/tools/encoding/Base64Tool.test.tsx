import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Base64Tool from "./Base64Tool";
import { encodeBase64, decodeBase64 } from "@/api/tools";

jest.mock("@/api/tools");

const mockEncodeBase64 = jest.mocked(encodeBase64);
const mockDecodeBase64 = jest.mocked(decodeBase64);

describe("Base64Tool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders input and both buttons", () => {
    render(<Base64Tool />);
    expect(screen.getByPlaceholderText("Texto o base64")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Codificar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decodificar" })).toBeInTheDocument();
  });

  test("encode: type text, click Codificar, verify output shows encoded value", async () => {
    const mockEncoded = "SGVsbG8gV29ybGQ=";
    mockEncodeBase64.mockResolvedValue({ encoded: mockEncoded, input: "Hello World" });

    render(<Base64Tool />);
    const input = screen.getByPlaceholderText("Texto o base64");
    const encodeButton = screen.getByRole("button", { name: "Codificar" });

    fireEvent.change(input, { target: { value: "Hello World" } });
    fireEvent.click(encodeButton);

    await waitFor(() => {
      expect(mockEncodeBase64).toHaveBeenCalledWith("Hello World", "std");
      expect(screen.getByText(mockEncoded)).toBeInTheDocument();
    });
  });

  test("decode: type base64, click Decodificar, verify output shows decoded value", async () => {
    const mockDecoded = "Hello World";
    mockDecodeBase64.mockResolvedValue({ decoded: mockDecoded, input: "SGVsbG8gV29ybGQ=" });

    render(<Base64Tool />);
    const input = screen.getByPlaceholderText("Texto o base64");
    const decodeButton = screen.getByRole("button", { name: /Decodificar/i });

    fireEvent.change(input, { target: { value: "SGVsbG8gV29ybGQ=" } });
    fireEvent.click(decodeButton);

    await waitFor(() => {
      expect(mockDecodeBase64).toHaveBeenCalledWith("SGVsbG8gV29ybGQ=", "std");
      expect(screen.getByText(mockDecoded)).toBeInTheDocument();
    });
  });

  test("error: mock rejection, click button, verify ErrorAlert appears", async () => {
    const mockError = new Error("API Error");
    mockEncodeBase64.mockRejectedValue(mockError);

    render(<Base64Tool />);
    const input = screen.getByPlaceholderText("Texto o base64");
    const encodeButton = screen.getByRole("button", { name: "Codificar" });

    fireEvent.change(input, { target: { value: "test" } });
    fireEvent.click(encodeButton);

    await waitFor(() => {
      expect(screen.getByText(/Error procesando la solicitud/i)).toBeInTheDocument();
    });
  });

  test("variant url is sent to the API", async () => {
    mockEncodeBase64.mockResolvedValue({ encoded: "Pz8_Pj4-", input: "???>>>" });
    render(<Base64Tool />);
    fireEvent.change(screen.getByPlaceholderText("Texto o base64"), { target: { value: "???>>>" } });
    fireEvent.change(screen.getByLabelText("Variante"), { target: { value: "url" } });
    fireEvent.click(screen.getByRole("button", { name: "Codificar" }));
    await waitFor(() => {
      expect(mockEncodeBase64).toHaveBeenCalledWith("???>>>", "url");
      expect(screen.getByText("Pz8_Pj4-")).toBeInTheDocument();
    });
  });

  test("hex conversion happens locally without calling the API", () => {
    render(<Base64Tool />);
    fireEvent.change(screen.getByPlaceholderText("Texto o base64"), { target: { value: "Zm9v" } });
    fireEvent.click(screen.getByRole("button", { name: "Base64 → Hex" }));
    expect(screen.getByText("666f6f")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Texto o base64"), { target: { value: "666f6f" } });
    fireEvent.click(screen.getByRole("button", { name: "Hex → Base64" }));
    expect(screen.getByText("Zm9v")).toBeInTheDocument();
    expect(mockEncodeBase64).not.toHaveBeenCalled();
    expect(mockDecodeBase64).not.toHaveBeenCalled();
  });

  test("invalid hex shows an error instead of output", () => {
    render(<Base64Tool />);
    fireEvent.change(screen.getByPlaceholderText("Texto o base64"), { target: { value: "xyz" } });
    fireEvent.click(screen.getByRole("button", { name: "Hex → Base64" }));
    expect(screen.getByRole("alert")).toHaveTextContent(/hexadecimal/);
  });
});

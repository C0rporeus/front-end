import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import UuidTool from "./UuidTool";
import { generateUUIDv4 } from "@/api/tools";

jest.mock("@/api/tools");

const mockGenerateUUIDv4 = jest.mocked(generateUUIDv4);

describe("UuidTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders generate button", () => {
    render(<UuidTool />);
    expect(screen.getByRole("button", { name: /Generar UUIDv4/i })).toBeInTheDocument();
  });

  test("click generate: mock returns UUID, verify output", async () => {
    const mockUuid = "550e8400-e29b-41d4-a716-446655440000";
    mockGenerateUUIDv4.mockResolvedValue({ uuid: mockUuid });

    render(<UuidTool />);
    const generateButton = screen.getByRole("button", { name: /Generar UUIDv4/i });

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateUUIDv4).toHaveBeenCalledTimes(1);
      expect(screen.getByText(mockUuid)).toBeInTheDocument();
    });
  });

  test("error: mock rejection, verify ErrorAlert", async () => {
    const mockError = new Error("API Error");
    mockGenerateUUIDv4.mockRejectedValue(mockError);

    render(<UuidTool />);
    const generateButton = screen.getByRole("button", { name: /Generar UUIDv4/i });

    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/Error procesando la solicitud/i)).toBeInTheDocument();
    });
  });
});

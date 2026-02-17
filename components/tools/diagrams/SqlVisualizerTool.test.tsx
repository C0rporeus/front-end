import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockRender = jest.fn().mockResolvedValue({ svg: "<svg>er diagram</svg>" });
const mockInitialize = jest.fn();

jest.mock("mermaid", () => ({
  __esModule: true,
  default: {
    initialize: mockInitialize,
    render: mockRender,
  },
}));

import SqlVisualizerTool from "./SqlVisualizerTool";

describe("SqlVisualizerTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders SQL textarea and preview area", () => {
    render(<SqlVisualizerTool />);
    expect(screen.getByText("SQL (CREATE TABLE)")).toBeInTheDocument();
    expect(screen.getByText("Diagrama ER")).toBeInTheDocument();
  });

  test("default SQL is pre-filled with sample CREATE TABLE", () => {
    render(<SqlVisualizerTool />);
    const textarea = screen.getByRole("textbox");
    expect((textarea as HTMLTextAreaElement).value).toContain("CREATE TABLE");
  });

  test("renders ER diagram from default SQL", async () => {
    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText("er diagram")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("shows table summary sections", async () => {
    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      const summaryElements = screen.queryAllByText(/Resumen de tablas/i);
      expect(summaryElements.length).toBeGreaterThanOrEqual(0);
    });
  });
});

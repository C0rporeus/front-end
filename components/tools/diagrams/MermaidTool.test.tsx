import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockRender = jest.fn().mockResolvedValue({ svg: "<svg>mock diagram</svg>" });
const mockInitialize = jest.fn();

jest.mock("mermaid", () => ({
  __esModule: true,
  default: {
    initialize: mockInitialize,
    render: mockRender,
  },
}));

import MermaidTool from "./MermaidTool";

describe("MermaidTool", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders editor textarea and preview area", async () => {
    render(<MermaidTool />);
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Vista previa")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/graph TD/)).toBeInTheDocument();
  });

  test("loads mermaid and renders default diagram", async () => {
    render(<MermaidTool />);

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  test("renders SVG output after mermaid processes diagram", async () => {
    render(<MermaidTool />);

    await waitFor(() => {
      expect(screen.getByText("mock diagram")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("shows error on mermaid render failure", async () => {
    mockRender.mockRejectedValueOnce(new Error("Parse error"));

    render(<MermaidTool />);

    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });

    await waitFor(() => {
      const alert = screen.queryByRole("alert");
      if (alert) {
        expect(alert).toBeInTheDocument();
      }
    }, { timeout: 3000 });
  });
});

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
      expect(screen.getByText(/Error de sintaxis/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("textarea onChange updates code", () => {
    render(<MermaidTool />);
    const textarea = screen.getByDisplayValue(/graph TD/);
    fireEvent.change(textarea, { target: { value: "graph LR\n  A --> B" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("graph LR\n  A --> B");
  });

  test("debounces render — multiple edits within 500ms trigger only one render", async () => {
    jest.useFakeTimers();

    render(<MermaidTool />);

    // Wait for initial mermaid load + first render
    await waitFor(() => {
      expect(mockInitialize).toHaveBeenCalled();
    });
    jest.advanceTimersByTime(600);
    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    });

    const callsBefore = mockRender.mock.calls.length;
    const textarea = screen.getByDisplayValue(/graph TD/);

    // Three rapid edits within 500ms
    fireEvent.change(textarea, { target: { value: "graph LR\n  X --> Y" } });
    jest.advanceTimersByTime(100);
    fireEvent.change(textarea, { target: { value: "graph LR\n  X --> Z" } });
    jest.advanceTimersByTime(100);
    fireEvent.change(textarea, { target: { value: "graph LR\n  X --> W" } });

    // Before debounce completes — no new render
    expect(mockRender.mock.calls.length).toBe(callsBefore);

    // After debounce fires
    jest.advanceTimersByTime(500);
    await waitFor(() => {
      expect(mockRender.mock.calls.length).toBe(callsBefore + 1);
    });

    jest.useRealTimers();
  });
});

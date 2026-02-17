import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@excalidraw/excalidraw", () => ({
  Excalidraw: (props: Record<string, unknown>) => (
    <div data-testid="excalidraw-mock" data-theme={props.theme} />
  ),
}));

import ExcalidrawTool from "./ExcalidrawTool";

describe("ExcalidrawTool", () => {
  test("renders without crashing", () => {
    render(<ExcalidrawTool />);
    expect(screen.getByText("Excalidraw")).toBeInTheDocument();
    expect(screen.getByText(/Editor de diagramas/i)).toBeInTheDocument();
  });

  test("mounts Excalidraw component with dark theme", () => {
    render(<ExcalidrawTool />);
    const excalidraw = screen.getByTestId("excalidraw-mock");
    expect(excalidraw).toBeInTheDocument();
    expect(excalidraw).toHaveAttribute("data-theme", "dark");
  });
});

import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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

  test("shows table summary with table names after render", async () => {
    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    await waitFor(() => {
      expect(screen.getByText(/Resumen/)).toBeInTheDocument();
      expect(screen.getByText("users")).toBeInTheDocument();
      expect(screen.getByText("posts")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("shows error when SQL has no CREATE TABLE", async () => {
    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "SELECT * FROM users;" } });

    await waitFor(() => {
      expect(screen.getByText(/No se encontraron sentencias CREATE TABLE/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("shows error on mermaid render failure", async () => {
    mockRender.mockRejectedValueOnce(new Error("render failed"));

    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(screen.getByText(/Error al generar el diagrama/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("parses table-level FOREIGN KEY constraints", async () => {
    mockRender.mockResolvedValue({ svg: "<svg>fk diagram</svg>" });

    const sqlWithTableFk = `CREATE TABLE orders (
      id INT PRIMARY KEY,
      user_id INT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE users (
      id INT PRIMARY KEY,
      name VARCHAR(100)
    );`;

    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: sqlWithTableFk } });

    await waitFor(() => {
      expect(screen.getByText("orders")).toBeInTheDocument();
      expect(screen.getByText("users")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("parses composite PRIMARY KEY correctly", async () => {
    mockRender.mockResolvedValue({ svg: "<svg>composite pk</svg>" });

    const sqlWithCompositePk = `CREATE TABLE post_tags (
      post_id INT REFERENCES posts(id),
      tag_id INT REFERENCES tags(id),
      PRIMARY KEY (post_id, tag_id)
    );
    CREATE TABLE posts (
      id INT PRIMARY KEY,
      title VARCHAR(255)
    );
    CREATE TABLE tags (
      id INT PRIMARY KEY,
      name VARCHAR(50)
    );`;

    render(<SqlVisualizerTool />);

    await waitFor(() => {
      expect(mockRender).toHaveBeenCalled();
    }, { timeout: 3000 });

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: sqlWithCompositePk } });

    await waitFor(() => {
      expect(screen.getByText("post_tags")).toBeInTheDocument();
      expect(screen.getByText("posts")).toBeInTheDocument();
      expect(screen.getByText("tags")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test("textarea onChange updates sql", () => {
    render(<SqlVisualizerTool />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "CREATE TABLE t (id INT);" } });
    expect((textarea as HTMLTextAreaElement).value).toBe("CREATE TABLE t (id INT);");
  });
});

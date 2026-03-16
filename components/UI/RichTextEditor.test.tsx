import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

const mockSetImage = jest.fn();
const mockChain = {
  focus: () => mockChain,
  setImage: (opts: { src: string }) => {
    mockSetImage(opts.src);
    return mockChain;
  },
  run: jest.fn(),
};
const mockEditor = {
  isActive: jest.fn(() => false),
  chain: () => mockChain,
  commands: { setContent: jest.fn() },
  getHTML: jest.fn(() => ""),
};

jest.mock("@tiptap/react", () => ({
  useEditor: jest.fn(() => mockEditor),
  EditorContent: ({ editor }: { editor: unknown }) =>
    editor ? <div data-testid="editor-content" /> : null,
}));

jest.mock("@tiptap/starter-kit", () => ({ __esModule: true, default: { configure: jest.fn(() => "starter-kit") } }));
jest.mock("@tiptap/extension-image", () => ({ __esModule: true, default: { configure: jest.fn(() => "image-ext") } }));
jest.mock("@tiptap/extension-text-align", () => ({ __esModule: true, default: { configure: jest.fn(() => "text-align") } }));
jest.mock("@tiptap/extension-placeholder", () => ({ __esModule: true, default: { configure: jest.fn(() => "placeholder") } }));

import RichTextEditor from "./RichTextEditor";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("RichTextEditor — barra de herramientas", () => {
  it("renderiza el editor y el contenido", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    expect(screen.getByTestId("editor-content")).toBeInTheDocument();
  });

  it("muestra el botón Imagen en la toolbar", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    expect(screen.getByTestId("toolbar-image-button")).toBeInTheDocument();
  });

  it("abre el popover al hacer click en Imagen", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    expect(screen.getByTestId("image-url-input")).toBeInTheDocument();
  });
});

describe("RichTextEditor — inserción de imagen por URL", () => {
  it("inserta una imagen en el editor al escribir URL y confirmar", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));

    fireEvent.change(screen.getByTestId("image-url-input"), {
      target: { value: "https://ejemplo.com/img.png" },
    });
    fireEvent.click(screen.getByRole("button", { name: /insertar/i }));

    expect(mockSetImage).toHaveBeenCalledWith("https://ejemplo.com/img.png");
  });

  it("inserta imagen al presionar Enter en el input de URL", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));

    fireEvent.change(screen.getByTestId("image-url-input"), {
      target: { value: "https://ejemplo.com/foto.jpg" },
    });
    fireEvent.keyDown(screen.getByTestId("image-url-input"), { key: "Enter" });

    expect(mockSetImage).toHaveBeenCalledWith("https://ejemplo.com/foto.jpg");
  });

  it("no inserta nada si la URL está vacía", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    fireEvent.click(screen.getByRole("button", { name: /insertar/i }));
    expect(mockSetImage).not.toHaveBeenCalled();
  });
});

describe("RichTextEditor — subida de archivo", () => {
  it("NO muestra la pestaña 'Subir archivo' si no se pasa onUploadImage", () => {
    render(<RichTextEditor value="" onChange={jest.fn()} />);
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    expect(screen.queryByRole("button", { name: /subir archivo/i })).not.toBeInTheDocument();
  });

  it("muestra las pestañas URL y Subir archivo cuando se pasa onUploadImage", () => {
    render(
      <RichTextEditor
        value=""
        onChange={jest.fn()}
        onUploadImage={jest.fn()}
      />,
    );
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    expect(screen.getByRole("button", { name: /por url/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /subir archivo/i })).toBeInTheDocument();
  });

  it("cambia a la pestaña de archivo y muestra el file input", () => {
    render(
      <RichTextEditor
        value=""
        onChange={jest.fn()}
        onUploadImage={jest.fn()}
      />,
    );
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    fireEvent.click(screen.getByRole("button", { name: /subir archivo/i }));
    expect(screen.getByTestId("image-file-input")).toBeInTheDocument();
  });

  it("llama a onUploadImage con el archivo seleccionado e inserta la URL devuelta", async () => {
    const fakeUrl = "https://storage.googleapis.com/bucket/img.jpg?signed=1";
    const onUploadImage = jest.fn().mockResolvedValue(fakeUrl);
    const onChange = jest.fn();

    render(
      <RichTextEditor value="" onChange={onChange} onUploadImage={onUploadImage} />,
    );
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    fireEvent.click(screen.getByRole("button", { name: /subir archivo/i }));

    const file = new File(["img"], "foto.jpg", { type: "image/jpeg" });
    await act(async () => {
      fireEvent.change(screen.getByTestId("image-file-input"), {
        target: { files: [file] },
      });
    });

    await waitFor(() => expect(onUploadImage).toHaveBeenCalledWith(file));
    expect(mockSetImage).toHaveBeenCalledWith(fakeUrl);
  });

  it("muestra el mensaje de error si onUploadImage falla", async () => {
    const onUploadImage = jest.fn().mockRejectedValue(new Error("Archivo muy grande"));

    render(
      <RichTextEditor value="" onChange={jest.fn()} onUploadImage={onUploadImage} />,
    );
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    fireEvent.click(screen.getByRole("button", { name: /subir archivo/i }));

    const file = new File(["img"], "foto.jpg", { type: "image/jpeg" });
    await act(async () => {
      fireEvent.change(screen.getByTestId("image-file-input"), {
        target: { files: [file] },
      });
    });

    await waitFor(() =>
      expect(screen.getByText("Archivo muy grande")).toBeInTheDocument(),
    );
    expect(mockSetImage).not.toHaveBeenCalled();
  });

  it("no llama a onUploadImage si no hay archivo seleccionado", async () => {
    const onUploadImage = jest.fn();

    render(
      <RichTextEditor value="" onChange={jest.fn()} onUploadImage={onUploadImage} />,
    );
    fireEvent.mouseDown(screen.getByTestId("toolbar-image-button"));
    fireEvent.click(screen.getByRole("button", { name: /subir archivo/i }));

    fireEvent.change(screen.getByTestId("image-file-input"), {
      target: { files: [] },
    });

    expect(onUploadImage).not.toHaveBeenCalled();
  });
});

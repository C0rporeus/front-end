import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
};

const ToolbarButton = ({ label, active, onClick }: ToolbarButtonProps) => (
  <button
    type="button"
    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-brand-600/35 text-text-primary"
        : "text-text-secondary hover:bg-slate-700/60 hover:text-text-primary"
    }`}
    onMouseDown={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    {label}
  </button>
);

const ImagePopover = ({
  anchorRef,
  onInsert,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onInsert: (url: string) => void;
  onClose: () => void;
}) => {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 4, left: rect.left });
    }
  }, [anchorRef]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const stableClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        anchorRef.current && !anchorRef.current.contains(target)
      ) {
        stableClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") stableClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [stableClose, anchorRef]);

  const handleSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) {
      onInsert(trimmed);
    }
    onClose();
  };

  return createPortal(
    <div
      ref={popoverRef}
      className="fixed z-50 w-80 rounded-lg border border-slate-600 bg-surface-800/95 p-3 shadow-xl backdrop-blur-sm"
      style={{ top: position.top, left: position.left }}
    >
      <p className="mb-2 text-xs font-medium text-text-secondary">URL de la imagen</p>
      <input
        ref={inputRef}
        type="url"
        className="mb-3 w-full rounded border border-slate-600 bg-surface-900/85 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-400/70 focus:outline-none"
        placeholder="https://ejemplo.com/imagen.png"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="rounded px-3 py-1.5 text-xs text-text-secondary hover:bg-slate-700/60 hover:text-text-primary"
          onClick={onClose}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="rounded bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
          onClick={handleSubmit}
        >
          Insertar
        </button>
      </div>
    </div>,
    document.body,
  );
};

const Toolbar = ({ editor }: { editor: Editor }) => {
  const [showImagePopover, setShowImagePopover] = useState(false);
  const imageButtonRef = useRef<HTMLButtonElement>(null);

  const insertImage = (url: string) => {
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-600 bg-surface-900/95 px-2 py-1.5">
      <ToolbarButton
        label="B"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <ToolbarButton
        label="I"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <ToolbarButton
        label="U"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      />
      <ToolbarButton
        label="S"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <span className="mx-1 border-l border-slate-600/60" />

      <ToolbarButton
        label="H2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      />
      <ToolbarButton
        label="H3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      />

      <span className="mx-1 border-l border-slate-600/60" />

      <ToolbarButton
        label="Lista"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />
      <ToolbarButton
        label="Num"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <ToolbarButton
        label="Cita"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <span className="mx-1 border-l border-slate-600/60" />

      <ToolbarButton
        label="Izq"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      />
      <ToolbarButton
        label="Centro"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      />
      <ToolbarButton
        label="Der"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      />

      <span className="mx-1 border-l border-slate-600/60" />

      <button
        ref={imageButtonRef}
        type="button"
        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
          showImagePopover
            ? "bg-brand-600/35 text-text-primary"
            : "text-text-secondary hover:bg-slate-700/60 hover:text-text-primary"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          setShowImagePopover((prev) => !prev);
        }}
      >
        Imagen
      </button>
      {showImagePopover && (
        <ImagePopover
          anchorRef={imageButtonRef}
          onInsert={insertImage}
          onClose={() => setShowImagePopover(false)}
        />
      )}

      <span className="mx-1 border-l border-slate-600/60" />

      <ToolbarButton
        label="Deshacer"
        onClick={() => editor.chain().focus().undo().run()}
      />
      <ToolbarButton
        label="Rehacer"
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      ImageExtension.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: placeholder ?? "Escribe el contenido...",
      }),
    ],
    immediatelyRender: false,
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-dark min-h-[160px] p-3 outline-none text-text-primary",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded border border-slate-600 bg-surface-900/85">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

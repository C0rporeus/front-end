import { useState, useEffect, useRef, useCallback } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import { ToolTextarea } from "@/components/UI/ToolInput";

const DEFAULT_DIAGRAM = `graph TD
    A[Inicio] --> B{Es valido?}
    B -->|Si| C[Procesar]
    B -->|No| D[Rechazar]
    C --> E[Fin]
    D --> E`;

const MermaidTool = () => {
  const [code, setCode] = useState(DEFAULT_DIAGRAM);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const mermaidRef = useRef<typeof import("mermaid") | null>(null);

  useEffect(() => {
    import("mermaid")
      .then((mod) => {
        const mermaid = mod.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            darkMode: true,
            background: "#111b2e",
            primaryColor: "#263b5f",
            primaryTextColor: "#e6edf7",
            primaryBorderColor: "#324764",
            lineColor: "#6f9fdf",
            secondaryColor: "#1d2f4d",
            tertiaryColor: "#17243a",
          },
        });
        mermaidRef.current = mod;
        setMermaidLoaded(true);
      })
      .catch(() => {
        setError("No se pudo cargar la libreria mermaid.");
      });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!mermaidRef.current) return;
    setError("");
    try {
      const { svg: rendered } = await mermaidRef.current.default.render(
        `mermaid-preview-${Date.now()}`,
        code
      );
      setSvg(rendered);
    } catch {
      setError("Error de sintaxis en el diagrama. Revisa la notacion Mermaid.");
      setSvg("");
    }
  }, [code]);

  useEffect(() => {
    if (!mermaidLoaded) return;
    const timer = setTimeout(renderDiagram, 500);
    return () => clearTimeout(timer);
  }, [code, mermaidLoaded, renderDiagram]);

  return (
    <section>
      <h1 className="public-title mb-2">Mermaid</h1>
      <p className="public-lead mb-6">Generar diagramas desde texto con sintaxis Mermaid.</p>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="public-card">
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">Editor</h2>
          <ToolTextarea
            className="w-full font-mono text-sm"
            rows={16}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Escribe tu diagrama Mermaid aqui..."
            spellCheck={false}
          />
        </div>

        <div className="public-card">
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">Vista previa</h2>
          {!mermaidLoaded ? (
            <p className="py-8 text-center text-text-muted">Cargando motor Mermaid...</p>
          ) : svg ? (
            <div
              className="flex min-h-[200px] items-center justify-center overflow-auto rounded-lg border border-slate-600/80 bg-surface-900/80 p-4"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-600/80 bg-surface-900/80 p-4">
              <p className="text-text-muted">Escribe un diagrama para ver la vista previa</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MermaidTool;

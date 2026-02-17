import { useState, useEffect, useRef, useCallback } from "react";
import ErrorAlert from "@/components/UI/ErrorAlert";
import ToolOutput from "@/components/UI/ToolOutput";
import { ToolTextarea } from "@/components/UI/ToolInput";

const SAMPLE_SQL = `CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE posts (
  id INT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  author_id INT REFERENCES users(id),
  created_at TIMESTAMP
);

CREATE TABLE comments (
  id INT PRIMARY KEY,
  content TEXT NOT NULL,
  post_id INT REFERENCES posts(id),
  user_id INT REFERENCES users(id),
  created_at TIMESTAMP
);

CREATE TABLE tags (
  id INT PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE post_tags (
  post_id INT REFERENCES posts(id),
  tag_id INT REFERENCES tags(id),
  PRIMARY KEY (post_id, tag_id)
);`;

type Column = {
  name: string;
  type: string;
  pk: boolean;
  fk: { table: string; column: string } | null;
};

type Table = {
  name: string;
  columns: Column[];
};

function parseSql(sql: string): Table[] {
  const tables: Table[] = [];
  const fkConstraints: Array<{ table: string; column: string; refTable: string; refColumn: string }> = [];

  const createRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?(\w+)["`]?\s*\(([\s\S]*?)\)\s*;/gi;
  let match: RegExpExecArray | null;

  while ((match = createRegex.exec(sql)) !== null) {
    const tableName = match[1];
    const body = match[2];
    const columns: Column[] = [];
    const compositePks: string[] = [];

    const lines = body.split(",").reduce<string[]>((acc, part) => {
      const last = acc[acc.length - 1];
      if (last && (last.split("(").length - last.split(")").length) > 0) {
        acc[acc.length - 1] = last + "," + part;
      } else {
        acc.push(part);
      }
      return acc;
    }, []);

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      // Table-level PRIMARY KEY
      const compositePkMatch = line.match(/^\s*PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (compositePkMatch) {
        compositePkMatch[1].split(",").forEach((col) => {
          compositePks.push(col.trim().replace(/["`]/g, ""));
        });
        continue;
      }

      // Table-level FOREIGN KEY
      const tableFkMatch = line.match(
        /^\s*(?:CONSTRAINT\s+\w+\s+)?FOREIGN\s+KEY\s*\(["`]?(\w+)["`]?\)\s*REFERENCES\s+["`]?(\w+)["`]?\s*\(["`]?(\w+)["`]?\)/i
      );
      if (tableFkMatch) {
        fkConstraints.push({
          table: tableName,
          column: tableFkMatch[1],
          refTable: tableFkMatch[2],
          refColumn: tableFkMatch[3],
        });
        continue;
      }

      // Skip other constraints (UNIQUE, INDEX, CHECK)
      if (/^\s*(UNIQUE|INDEX|KEY|CHECK|CONSTRAINT)\s/i.test(line)) continue;

      // Column definition
      const colMatch = line.match(/^["`]?(\w+)["`]?\s+(\w[\w(),.]*)/);
      if (!colMatch) continue;

      const colName = colMatch[1];
      const colType = colMatch[2].toUpperCase();
      const isPk = /PRIMARY\s+KEY/i.test(line);

      // Inline REFERENCES
      let fk: Column["fk"] = null;
      const inlineRef = line.match(/REFERENCES\s+["`]?(\w+)["`]?\s*\(["`]?(\w+)["`]?\)/i);
      if (inlineRef) {
        fk = { table: inlineRef[1], column: inlineRef[2] };
      }

      columns.push({ name: colName, type: colType, pk: isPk, fk });
    }

    // Apply composite PKs
    for (const pkCol of compositePks) {
      const col = columns.find((c) => c.name === pkCol);
      if (col) col.pk = true;
    }

    tables.push({ name: tableName, columns });
  }

  // Apply table-level FK constraints
  for (const fk of fkConstraints) {
    const table = tables.find((t) => t.name === fk.table);
    const col = table?.columns.find((c) => c.name === fk.column);
    if (col && !col.fk) {
      col.fk = { table: fk.refTable, column: fk.refColumn };
    }
  }

  return tables;
}

function toMermaidER(tables: Table[]): string {
  const lines: string[] = ["erDiagram"];

  const relationships = new Set<string>();

  for (const table of tables) {
    for (const col of table.columns) {
      if (col.fk) {
        const refTable = col.fk.table;
        const key = [table.name, refTable].sort().join("-");
        if (!relationships.has(key)) {
          relationships.add(key);
          lines.push(`    ${refTable} ||--o{ ${table.name} : ""`);
        }
      }
    }
  }

  for (const table of tables) {
    lines.push(`    ${table.name} {`);
    for (const col of table.columns) {
      const markers: string[] = [];
      if (col.pk) markers.push("PK");
      if (col.fk) markers.push("FK");
      const marker = markers.length > 0 ? ` "${markers.join(",")}"` : "";
      lines.push(`        ${col.type} ${col.name}${marker}`);
    }
    lines.push("    }");
  }

  return lines.join("\n");
}

const SqlVisualizerTool = () => {
  const [sql, setSql] = useState(SAMPLE_SQL);
  const [svg, setSvg] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [error, setError] = useState("");
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const mermaidRef = useRef<typeof import("mermaid") | null>(null);

  useEffect(() => {
    import("mermaid")
      .then((mod) => {
        mod.default.initialize({
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
        setError("No se pudo cargar la libreria de diagramas.");
      });
  }, []);

  const renderDiagram = useCallback(async () => {
    if (!mermaidRef.current) return;
    setError("");

    const parsed = parseSql(sql);
    setTables(parsed);

    if (parsed.length === 0) {
      setSvg("");
      setError("No se encontraron sentencias CREATE TABLE validas.");
      return;
    }

    const mermaidCode = toMermaidER(parsed);

    try {
      const { svg: rendered } = await mermaidRef.current.default.render(
        `sql-er-${Date.now()}`,
        mermaidCode
      );
      setSvg(rendered);
    } catch {
      setError("Error al generar el diagrama. Revisa la estructura SQL.");
      setSvg("");
    }
  }, [sql]);

  useEffect(() => {
    if (!mermaidLoaded) return;
    const timer = setTimeout(renderDiagram, 600);
    return () => clearTimeout(timer);
  }, [sql, mermaidLoaded, renderDiagram]);

  return (
    <section>
      <h1 className="public-title mb-2">Visualizador SQL</h1>
      <p className="public-lead mb-6">
        Pega sentencias CREATE TABLE para visualizar tablas y relaciones.
      </p>

      {error && <ErrorAlert message={error} />}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="public-card">
          <h2 className="mb-2 text-sm font-semibold text-text-secondary">SQL (CREATE TABLE)</h2>
          <ToolTextarea
            className="w-full font-mono text-sm"
            rows={20}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="CREATE TABLE users ( ... );"
            spellCheck={false}
          />
        </div>

        <div className="space-y-4">
          <div className="public-card">
            <h2 className="mb-2 text-sm font-semibold text-text-secondary">Diagrama ER</h2>
            {!mermaidLoaded ? (
              <p className="py-8 text-center text-text-muted">Cargando motor de diagramas...</p>
            ) : svg ? (
              <ToolOutput
                as="div"
                className="flex min-h-[300px] items-center justify-center overflow-auto p-4"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : (
              <ToolOutput as="div" className="flex min-h-[300px] items-center justify-center p-4">
                <p className="text-text-muted">Pega sentencias CREATE TABLE para generar el diagrama</p>
              </ToolOutput>
            )}
          </div>

          {tables.length > 0 && (
            <div className="public-card">
              <h2 className="mb-2 text-sm font-semibold text-text-secondary">
                Resumen ({tables.length} {tables.length === 1 ? "tabla" : "tablas"})
              </h2>
              <div className="max-h-60 space-y-2 overflow-auto">
                {tables.map((table) => (
                  <details key={table.name} className="rounded-lg border border-slate-700/50 bg-surface-900/60">
                    <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-800/45">
                      {table.name}
                      <span className="ml-2 text-xs text-text-muted">({table.columns.length} columnas)</span>
                    </summary>
                    <div className="border-t border-slate-700/30 px-3 py-2">
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-slate-700/20">
                          {table.columns.map((col) => (
                            <tr key={col.name}>
                              <td className="py-1 pr-2 font-mono text-text-primary">{col.name}</td>
                              <td className="py-1 pr-2 text-text-muted">{col.type}</td>
                              <td className="py-1">
                                {col.pk && (
                                  <span className="mr-1 rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-medium text-amber-300">
                                    PK
                                  </span>
                                )}
                                {col.fk && (
                                  <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[10px] font-medium text-blue-300">
                                    FK → {col.fk.table}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SqlVisualizerTool;

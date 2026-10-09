import { useEffect, useState } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import go from "highlight.js/lib/languages/go";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import yaml from "highlight.js/lib/languages/yaml";

import { sanitizeHtml, isHtmlContent } from "@/utils/html-content";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("go", go);
hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("yaml", yaml);

/**
 * Procesa el HTML sanitizado y aplica syntax highlighting a todos los <pre><code>
 * generando un nuevo string HTML con los spans de hljs incrustados.
 * Debe llamarse solo en el cliente (requiere document).
 */
function applyHighlighting(sanitizedHtml: string): string {
  const container = document.createElement("div");
  container.innerHTML = sanitizedHtml;

  container.querySelectorAll<HTMLElement>("pre code").forEach((block) => {
    const lang = [...block.classList]
      .find((c) => c.startsWith("language-"))
      ?.slice(9);
    const code = block.textContent ?? "";
    if (!code.trim()) return;

    try {
      if (lang && hljs.getLanguage(lang)) {
        const result = hljs.highlight(code, { language: lang });
        block.innerHTML = result.value;
        block.className = `hljs language-${lang}`;
      } else {
        const result = hljs.highlightAuto(code);
        block.innerHTML = result.value;
        block.className = `hljs${result.language ? ` language-${result.language}` : ""}`;
      }
    } catch {
      // Si no se puede resaltar, se deja el texto sin cambios
    }
  });

  return container.innerHTML;
}

type RichTextViewerProps = {
  content: string;
  className?: string;
};

const RichTextViewer = ({ content, className }: RichTextViewerProps) => {
  const [renderedHtml, setRenderedHtml] = useState<string>("");

  useEffect(() => {
    if (!content?.trim() || !isHtmlContent(content)) {
      setRenderedHtml("");
      return;
    }
    const sanitized = sanitizeHtml(content);
    setRenderedHtml(applyHighlighting(sanitized));
  }, [content]);

  if (!content?.trim()) return null;

  if (!isHtmlContent(content)) {
    return (
      <div className={`whitespace-pre-line ${className ?? ""}`}>
        {content}
      </div>
    );
  }

  return (
    <div
      className={`prose-dark ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml || sanitizeHtml(content) }}
    />
  );
};

export default RichTextViewer;

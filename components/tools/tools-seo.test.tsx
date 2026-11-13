import { render } from "@testing-library/react";
import type { ReactNode } from "react";

import ToolPage from "./ToolPage";
import { allTools } from "./tools-config";
import { TOOLS_SEO } from "./tools-seo";

// next/head no escribe en el documento durante las pruebas: se pinta en línea.
jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <div data-testid="head">{children}</div>,
}));
jest.mock("./ToolsLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

describe("tools SEO content", () => {
  it("covers every registered tool and nothing else", () => {
    expect(Object.keys(TOOLS_SEO).sort()).toEqual(allTools().map((tool) => tool.slug).sort());
  });

  it("keeps titles and descriptions unique and within search result limits", () => {
    const entries = Object.values(TOOLS_SEO);
    expect(new Set(entries.map((entry) => entry.title)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.description)).size).toBe(entries.length);
    for (const entry of entries) {
      expect(entry.title.length).toBeLessThanOrEqual(70);
      expect(entry.description.length).toBeGreaterThanOrEqual(110);
      expect(entry.description.length).toBeLessThanOrEqual(160);
      expect(entry.intro.length).toBeGreaterThan(0);
      expect(entry.uses.length).toBeGreaterThanOrEqual(3);
      expect(entry.faq.length).toBeGreaterThan(0);
    }
  });
});

describe("ToolPage", () => {
  it("prints metadata, structured data and the guide around the tool", () => {
    const { getByText } = render(
      <ToolPage slug="base64">
        <p>herramienta</p>
      </ToolPage>,
    );
    // React 19 sube <title>, <meta> y <link> al <head> del documento.
    const container = document;
    expect(getByText("herramienta")).toBeTruthy();
    expect(container.querySelector("title")?.textContent).toBe(
      "Codificar y decodificar Base64 y Base64URL online | Yonathan Gutierrez",
    );
    expect(container.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://www.yonathangutierrez.dev/tools/base64/",
    );
    expect(container.querySelector('meta[property="og:url"]')?.getAttribute("content")).toBe(
      "https://www.yonathangutierrez.dev/tools/base64/",
    );
    const types = [...container.querySelectorAll('script[type="application/ld+json"]')].map(
      (script) => (JSON.parse(script.textContent ?? "{}") as { "@type": string })["@type"],
    );
    expect(types).toEqual(["WebApplication", "BreadcrumbList", "FAQPage"]);
    expect(container.querySelector(".tool-guide h2")?.textContent).toContain("Base64");
    expect(container.querySelectorAll(".tool-guide dt").length).toBe(TOOLS_SEO.base64.faq.length);
  });

  it("fails loudly for a tool without SEO content", () => {
    const silence = jest.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<ToolPage slug="no-existe">x</ToolPage>)).toThrow("Herramienta sin configuración SEO");
    silence.mockRestore();
  });
});

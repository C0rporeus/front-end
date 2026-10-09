export type ToolDefinition = {
  slug: string;
  label: string;
  description: string;
  status: "stable" | "beta" | "coming-soon";
};

export type ToolCategory = {
  id: string;
  label: string;
  icon: string;
  tools: ToolDefinition[];
};

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: "encoding-crypto",
    label: "Codificación y criptografía",
    icon: "🔐",
    tools: [
      {
        slug: "base64",
        label: "Base64",
        description: "Codificar y decodificar texto en Base64",
        status: "stable",
      },
      {
        slug: "uuid",
        label: "UUID v4",
        description: "Generar identificadores únicos universales",
        status: "stable",
      },
      {
        slug: "certs",
        label: "Certificados Autofirmados",
        description: "Generar certificados .cert/.pfx autofirmados",
        status: "stable",
      },
      {
        slug: "rsa-keys",
        label: "Generador RSA",
        description: "Generar pares de claves RSA pública/privada",
        status: "beta",
      },
      {
        slug: "jwt-decoder",
        label: "JWT Decoder",
        description: "Decodificar y analizar tokens JWT (header, payload, claims)",
        status: "beta",
      },
    ],
  },
  {
    id: "network-dns",
    label: "Red y DNS",
    icon: "🌐",
    tools: [
      {
        slug: "domain-validator",
        label: "Validador de Dominio",
        description: "Verificar la resolución DNS de un dominio",
        status: "beta",
      },
      {
        slug: "dns-propagation",
        label: "Propagación DNS",
        description: "Consultar registros DNS desde el servidor",
        status: "beta",
      },
      {
        slug: "mail-records",
        label: "Registros de Correo",
        description: "Consultar MX, SPF, DKIM y DMARC de un dominio",
        status: "beta",
      },
      {
        slug: "blacklist",
        label: "Blacklist Checker",
        description: "Verificar si un dominio o IP está en listas negras DNSBL",
        status: "beta",
      },
      {
        slug: "cidr",
        label: "Calculadora CIDR",
        description: "Calcular rangos de red, subredes y segmentos IP",
        status: "beta",
      },
    ],
  },
  {
    id: "diagrams",
    label: "Diagramas",
    icon: "📊",
    tools: [
      {
        slug: "excalidraw",
        label: "Excalidraw",
        description: "Editor de diagramas estilo pizarra",
        status: "beta",
      },
      {
        slug: "mermaid",
        label: "Mermaid",
        description: "Generar diagramas desde texto con sintaxis Mermaid",
        status: "beta",
      },
      {
        slug: "sql-visualizer",
        label: "Visualizador SQL",
        description: "Visualizar tablas y relaciones desde CREATE TABLE",
        status: "beta",
      },
    ],
  },
];

export function findToolBySlug(slug: string): ToolDefinition | undefined {
  for (const category of TOOL_CATEGORIES) {
    const found = category.tools.find((tool) => tool.slug === slug);
    if (found) return found;
  }
  return undefined;
}

export function allTools(): ToolDefinition[] {
  return TOOL_CATEGORIES.flatMap((category) => category.tools);
}

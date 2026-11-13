import type { BoardPoint, BoardRouteShape } from "@/utils/board-geometry";

/**
 * Tablero mímico de la home: fuente única para la escena 3D, el respaldo SVG y la
 * lista accesible de bloques. Las coordenadas están en teselas (x → derecha, y → abajo).
 *
 * Todo lo que aquí se afirma lo confirmó el autor (ver PRODUCT.md, "Evidence on Hand").
 */

export type BoardStation = {
  id: string;
  label: string;
  /** Lectura que aparece al enfocar el bloque. */
  detail: string;
  at: BoardPoint;
};

export type BoardTap = {
  id: string;
  label: string;
  at: BoardPoint;
  /** Lado del que cuelga el rótulo respecto a la lámpara. */
  side: "left" | "above" | "below";
};

export const BOARD_SIZE = { cols: 32, rows: 20 } as const;

export const BOARD_STATIONS: readonly BoardStation[] = [
  {
    id: "code",
    label: "Código",
    detail: "Go cuando puedo elegir; también C#, JavaScript y Python.",
    at: [6, 14],
  },
  {
    id: "distributed",
    label: "Sistemas distribuidos",
    detail: "Arquitecturas con concurrencia y coordinación entre servicios, incluidos escenarios poco habituales.",
    at: [12, 14],
  },
  {
    id: "platform",
    label: "Plataforma",
    detail: "Kubernetes, operadores e infraestructura como código: el terreno de mis laboratorios actuales.",
    at: [18, 14],
  },
  {
    id: "security",
    label: "Red y seguridad",
    detail: "DNS, correo, certificados y criptografía aplicada; de ahí salen las herramientas de este sitio.",
    at: [23, 11],
  },
  {
    id: "operations",
    label: "Operación",
    detail: "Observabilidad, resiliencia y lo que ocurre después del despliegue.",
    at: [23, 17],
  },
  {
    id: "governance",
    label: "Gobierno de IA",
    detail: "En curso: un sistema federado de gobierno de IA con RBAC segmentado.",
    at: [29, 14],
  },
  {
    id: "sectors",
    label: "Industrias",
    detail: "Loyalty, salud, hidrocarburos, banca, belleza y legal.",
    at: [17, 5],
  },
];

/** Lámparas sin interacción: lenguajes que alimentan el bus e industrias de la barra superior. */
export const BOARD_TAPS: readonly BoardTap[] = [
  { id: "go", label: "Go", at: [1, 11], side: "left" },
  { id: "csharp", label: "C#", at: [1, 13], side: "left" },
  { id: "javascript", label: "JavaScript", at: [1, 15], side: "left" },
  { id: "python", label: "Python", at: [1, 17], side: "left" },
  // Los rótulos alternan arriba y abajo para no pisarse en pantallas estrechas.
  { id: "loyalty", label: "Loyalty", at: [19.5, 5], side: "above" },
  { id: "health", label: "Salud", at: [21.8, 5], side: "below" },
  { id: "hydrocarbons", label: "Hidrocarburos", at: [24.1, 5], side: "above" },
  { id: "banking", label: "Banca", at: [26.4, 5], side: "below" },
  { id: "beauty", label: "Belleza", at: [28.7, 5], side: "above" },
  { id: "legal", label: "Legal", at: [31, 5], side: "below" },
];

export const BOARD_ROUTES: readonly BoardRouteShape[] = [
  { id: "feed-go", from: null, to: "code", points: [[1, 11], [3, 11], [6, 14]] },
  { id: "feed-csharp", from: null, to: "code", points: [[1, 13], [4, 13], [5, 14], [6, 14]] },
  { id: "feed-javascript", from: null, to: "code", points: [[1, 15], [4, 15], [5, 14], [6, 14]] },
  { id: "feed-python", from: null, to: "code", points: [[1, 17], [3, 17], [6, 14]] },
  { id: "code-distributed", from: "code", to: "distributed", points: [[6, 14], [12, 14]] },
  { id: "distributed-platform", from: "distributed", to: "platform", points: [[12, 14], [18, 14]] },
  { id: "platform-security", from: "platform", to: "security", points: [[18, 14], [19, 14], [22, 11], [23, 11]] },
  { id: "platform-operations", from: "platform", to: "operations", points: [[18, 14], [19, 14], [22, 17], [23, 17]] },
  { id: "security-governance", from: "security", to: "governance", points: [[23, 11], [25, 11], [28, 14], [29, 14]] },
  { id: "operations-governance", from: "operations", to: "governance", points: [[23, 17], [25, 17], [28, 14], [29, 14]] },
  { id: "distributed-sectors", from: "distributed", to: "sectors", points: [[14.5, 14], [14.5, 7.5], [17, 5], [31, 5]] },
];

export const DEFAULT_READOUT = "Cada bloque es una parte del oficio. Enfoca uno para ver su ruta.";

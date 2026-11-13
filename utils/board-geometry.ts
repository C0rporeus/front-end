/**
 * Geometría pura del tablero mímico: la comparten la escena 3D, el respaldo SVG
 * y la lista accesible, de modo que las tres dibujan exactamente las mismas rutas.
 */

export type BoardPoint = readonly [x: number, y: number];

export type BoardRouteShape = {
  id: string;
  /** Bloque del que sale la ruta; `null` cuando es una alimentación externa. */
  from: string | null;
  /** Bloque al que llega. */
  to: string;
  points: readonly BoardPoint[];
};

export type Ribbon = {
  /** Pares (x, y) de cada vértice: dos por punto de la polilínea. */
  positions: number[];
  /** Distancia recorrida desde el inicio de la ruta, por vértice. */
  along: number[];
  indices: number[];
  length: number;
};

const segmentLength = (a: BoardPoint, b: BoardPoint) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export function polylineLength(points: readonly BoardPoint[]): number {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += segmentLength(points[index - 1], points[index]);
  }
  return total;
}

/** Trayecto SVG (`M x y L x y …`) de una polilínea. */
export function toSvgPath(points: readonly BoardPoint[]): string {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ");
}

/**
 * Rutas que alimentan un bloque: la suya y todas las anteriores hasta las
 * alimentaciones externas. Es lo que se ilumina al enfocar ese bloque.
 */
export function upstreamRouteIds(routes: readonly BoardRouteShape[], stationId: string): Set<string> {
  const lit = new Set<string>();
  const pending = [stationId];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop() as string;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const route of routes) {
      if (route.to !== current) continue;
      lit.add(route.id);
      if (route.from) pending.push(route.from);
    }
  }
  return lit;
}

const normalize = (x: number, y: number): [number, number] => {
  const size = Math.hypot(x, y);
  return size === 0 ? [0, 0] : [x / size, y / size];
};

/**
 * Convierte una polilínea en una cinta de ancho constante con uniones a inglete,
 * lista para un `BufferGeometry`. Los puntos repetidos se descartan.
 */
export function buildRibbon(points: readonly BoardPoint[], width: number): Ribbon {
  const path = points.filter((point, index) => index === 0 || segmentLength(points[index - 1], point) > 0);
  const ribbon: Ribbon = { positions: [], along: [], indices: [], length: polylineLength(path) };
  if (path.length < 2) return ribbon;

  const half = width / 2;
  let travelled = 0;
  for (let index = 0; index < path.length; index += 1) {
    const [x, y] = path[index];
    const previous = path[index - 1];
    const next = path[index + 1];
    if (previous) travelled += segmentLength(previous, path[index]);

    const incoming = previous ? normalize(x - previous[0], y - previous[1]) : null;
    const outgoing = next ? normalize(next[0] - x, next[1] - y) : null;
    const [dirX, dirY] = normalize(
      (incoming?.[0] ?? 0) + (outgoing?.[0] ?? 0),
      (incoming?.[1] ?? 0) + (outgoing?.[1] ?? 0),
    );
    const reference = incoming ?? (outgoing as [number, number]);
    // El inglete alarga la normal para conservar el ancho en los quiebres.
    const cosHalfAngle = dirX * reference[0] + dirY * reference[1];
    const reach = half / Math.max(cosHalfAngle, 0.5);
    const normalX = -dirY * reach;
    const normalY = dirX * reach;

    ribbon.positions.push(x + normalX, y + normalY, x - normalX, y - normalY);
    ribbon.along.push(travelled, travelled);
    if (index > 0) {
      const base = (index - 1) * 2;
      ribbon.indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  return ribbon;
}

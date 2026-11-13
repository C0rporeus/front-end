import { buildRibbon, polylineLength, toSvgPath, upstreamRouteIds, type BoardRouteShape } from "./board-geometry";

const routes: BoardRouteShape[] = [
  { id: "feed", from: null, to: "a", points: [[0, 0], [2, 0]] },
  { id: "a-b", from: "a", to: "b", points: [[2, 0], [5, 0]] },
  { id: "b-c", from: "b", to: "c", points: [[5, 0], [8, 0]] },
  { id: "b-d", from: "b", to: "d", points: [[5, 0], [5, 4]] },
  { id: "d-c", from: "d", to: "c", points: [[5, 4], [8, 0]] },
  { id: "c-a", from: "c", to: "a", points: [[8, 0], [2, 0]] },
];

describe("board-geometry", () => {
  it("mide una polilínea con tramos rectos y diagonales", () => {
    expect(polylineLength([[0, 0], [3, 0], [3, 4]])).toBe(7);
    expect(polylineLength([[0, 0], [3, 4]])).toBe(5);
    expect(polylineLength([[1, 1]])).toBe(0);
  });

  it("genera el trayecto SVG", () => {
    expect(toSvgPath([[0, 0], [3, 0], [5, 2]])).toBe("M0 0 L3 0 L5 2");
  });

  it("ilumina la ruta de un bloque y todas las que la alimentan", () => {
    expect([...upstreamRouteIds(routes.slice(0, 5), "b")].sort()).toEqual(["a-b", "feed"]);
    expect([...upstreamRouteIds(routes.slice(0, 5), "c")].sort()).toEqual(["a-b", "b-c", "b-d", "d-c", "feed"]);
    expect(upstreamRouteIds(routes, "sin-rutas").size).toBe(0);
  });

  it("no entra en bucle cuando las rutas forman un ciclo", () => {
    expect(upstreamRouteIds(routes, "a").size).toBe(routes.length);
  });

  it("construye una cinta recta con el ancho pedido", () => {
    const ribbon = buildRibbon([[0, 0], [4, 0]], 0.5);
    expect(ribbon.positions).toEqual([0, 0.25, 0, -0.25, 4, 0.25, 4, -0.25]);
    expect(ribbon.along).toEqual([0, 0, 4, 4]);
    expect(ribbon.indices).toEqual([0, 1, 2, 1, 3, 2]);
    expect(ribbon.length).toBe(4);
  });

  it("conserva el ancho en un quiebre con unión a inglete", () => {
    const ribbon = buildRibbon([[0, 0], [2, 0], [2, 2]], 1);
    // En el vértice del quiebre a 90° el inglete mide medio ancho por √2.
    const [x, y] = [ribbon.positions[4] - 2, ribbon.positions[5]];
    expect(Math.hypot(x, y)).toBeCloseTo(Math.SQRT1_2, 5);
    expect(ribbon.indices).toHaveLength(12);
    expect(ribbon.along[ribbon.along.length - 1]).toBe(4);
  });

  it("descarta puntos repetidos y polilíneas degeneradas", () => {
    expect(buildRibbon([[1, 1], [1, 1], [3, 1]], 1).positions).toHaveLength(8);
    expect(buildRibbon([[1, 1]], 1).indices).toHaveLength(0);
    expect(buildRibbon([[1, 1], [1, 1]], 1).positions).toHaveLength(0);
  });

  it("limita el inglete en giros cerrados", () => {
    const ribbon = buildRibbon([[0, 0], [2, 0], [0, 0.2]], 1);
    const reach = Math.hypot(ribbon.positions[4] - 2, ribbon.positions[5]);
    expect(reach).toBeLessThanOrEqual(1);
  });
});

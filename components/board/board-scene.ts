import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

import { BOARD_ROUTES, BOARD_SIZE, BOARD_STATIONS, BOARD_TAPS } from "@/components/board/board-config";
import { buildRibbon, upstreamRouteIds, type BoardPoint } from "@/utils/board-geometry";

/** Convierte una coordenada del tablero (en teselas) a píxeles dentro del canvas. */
export type BoardProjector = (point: BoardPoint) => { x: number; y: number };

export type BoardSceneOptions = {
  /** Se llama cuando cambia el encuadre (tamaño o scroll) para recolocar los rótulos del DOM. */
  onLayout: (project: BoardProjector) => void;
  /** El contexto WebGL se perdió: el contenedor debe volver al respaldo SVG. */
  onContextLost: () => void;
};

export type BoardSceneHandle = {
  setActiveStation: (stationId: string | null) => void;
  dispose: () => void;
};

// Colores de DESIGN.md.
const GRAPHITE = 0x0d1a22;
const TILE = 0x152833;
const TILE_LIT = 0x2f5560;
const PLATE = 0x203945;
const LAMP_REST = 0xecd9b5;
const LAMP_TAP = 0x9fb0b3;
const SIGNAL = 0x33c8c0;

const CENTER_X = BOARD_SIZE.cols / 2;
const CENTER_Z = BOARD_SIZE.rows / 2;
const FIELD = { minX: -40, maxX: BOARD_SIZE.cols + 14, minZ: -24, maxZ: BOARD_SIZE.rows + 12 };
const PRESS_RADIUS = 3.2;
const PRESS_DEPTH = 0.16;
const ROUTE_WIDTH = 0.28;
/** Ancho del tablero que debe caber en pantalla, con margen. */
const FIT_WIDTH = BOARD_SIZE.cols + 6;
/** Desde este ancho el tablero ocupa todo el hero y los rótulos del DOM se proyectan sobre él. */
export const PROJECTED_MIN_WIDTH = 1100;
/** En pantalla ancha el diagrama ocupa esta fracción del ancho, a la derecha del texto. */
const WIDE_SPAN = 0.63;
const WIDE_CENTER = 0.67;

const ROUTE_VERTEX = /* glsl */ `
  attribute float along;
  varying float vAlong;
  varying float vDepth;
  void main() {
    vAlong = along;
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vDepth = -viewPosition.z;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ROUTE_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  uniform float uActive;
  uniform float uDim;
  uniform vec3 uRest;
  uniform vec3 uSignal;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying float vAlong;
  varying float vDepth;
  void main() {
    // Un pulso corto viaja en el sentido de la ruta; uOffset lo encadena entre tramos.
    float phase = fract((vAlong + uOffset) * 0.055 - uTime * 0.085);
    float pulse = smoothstep(0.0, 0.015, phase) * (1.0 - smoothstep(0.015, 0.16, phase));
    float level = mix(0.86, 1.0, uActive) * (1.0 - 0.6 * uDim);
    vec3 color = mix(uRest, uSignal, uActive) * level;
    color += mix(uRest, uSignal, max(uActive, 0.35)) * pulse * (0.55 + 0.45 * uActive) * (1.0 - 0.85 * uDim);
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(color, uFogColor, fog), 1.0);
  }
`;

type RouteEntry = { id: string; material: ShaderMaterial; active: number; dim: number };
type LampEntry = { stationId: string | null; material: MeshBasicMaterial; rest: Color; level: number };

const toWorld = ([x, y]: BoardPoint, height: number) => new Vector3(x - CENTER_X, height, y - CENTER_Z);

/** Distancia acumulada desde las alimentaciones hasta el inicio de cada ruta. */
function routeOffsets(): Map<string, number> {
  const lengths = new Map(BOARD_ROUTES.map((route) => [route.id, buildRibbon(route.points, ROUTE_WIDTH).length]));
  const offsets = new Map<string, number>();
  const resolve = (routeId: string, depth: number): number => {
    const known = offsets.get(routeId);
    if (known !== undefined) return known;
    const route = BOARD_ROUTES.find((candidate) => candidate.id === routeId);
    const feeder = route?.from && depth < BOARD_ROUTES.length
      ? BOARD_ROUTES.find((candidate) => candidate.to === route.from)
      : undefined;
    const offset = feeder ? resolve(feeder.id, depth + 1) + (lengths.get(feeder.id) ?? 0) : 0;
    offsets.set(routeId, offset);
    return offset;
  };
  BOARD_ROUTES.forEach((route) => resolve(route.id, 0));
  return offsets;
}

export function createBoardScene(canvas: HTMLCanvasElement, options: BoardSceneOptions): BoardSceneHandle {
  const renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(GRAPHITE);

  const scene = new Scene();
  const fog = new Fog(GRAPHITE, 30, 90);
  scene.fog = fog;
  const camera = new PerspectiveCamera(30, 1, 1, 400);

  scene.add(new HemisphereLight(0xeaf2f2, 0x050c11, 1.5));
  const keyLight = new DirectionalLight(0xf3f8f7, 1.5);
  keyLight.position.set(-14, 22, 10);
  scene.add(keyLight);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(resource: T): T => {
    disposables.push(resource);
    return resource;
  };

  // Fondo entre teselas: la junta.
  const floor = new Mesh(
    track(new PlaneGeometry(400, 400)),
    track(new MeshBasicMaterial({ color: 0x0a161d })),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.34;
  scene.add(floor);

  // Teselas: una sola malla instanciada.
  const columns = FIELD.maxX - FIELD.minX + 1;
  const rows = FIELD.maxZ - FIELD.minZ + 1;
  const tileCount = columns * rows;
  const tiles = new InstancedMesh(
    track(new BoxGeometry(0.955, 0.3, 0.955)),
    track(new MeshStandardMaterial({ color: 0xffffff, roughness: 0.94, metalness: 0 })),
    tileCount,
  );
  const tileX = new Float32Array(tileCount);
  const tileZ = new Float32Array(tileCount);
  const tileShade = new Float32Array(tileCount);
  const press = new Float32Array(tileCount);
  const matrix = new Matrix4();
  const tileBase = new Color(TILE);
  const tileLit = new Color(TILE_LIT);
  const tint = new Color();
  for (let index = 0; index < tileCount; index += 1) {
    const column = index % columns;
    const row = Math.floor(index / columns);
    tileX[index] = FIELD.minX + column - CENTER_X;
    tileZ[index] = FIELD.minZ + row - CENTER_Z;
    // Variación fija por tesela, como un mosaico real: ninguna es idéntica a su vecina.
    const noise = Math.sin(column * 12.9898 + row * 78.233) * 43758.5453;
    tileShade[index] = 0.97 + (noise - Math.floor(noise)) * 0.06;
    matrix.makeTranslation(tileX[index], -0.15, tileZ[index]);
    tiles.setMatrixAt(index, matrix);
    tiles.setColorAt(index, tint.copy(tileBase).multiplyScalar(tileShade[index]));
  }
  scene.add(tiles);

  // Rutas.
  const offsets = routeOffsets();
  const routes: RouteEntry[] = BOARD_ROUTES.map((route) => {
    const ribbon = buildRibbon(route.points, ROUTE_WIDTH);
    const geometry = track(new BufferGeometry());
    const positions = new Float32Array((ribbon.positions.length / 2) * 3);
    for (let vertex = 0; vertex < ribbon.positions.length / 2; vertex += 1) {
      positions[vertex * 3] = ribbon.positions[vertex * 2] - CENTER_X;
      positions[vertex * 3 + 1] = 0.02;
      positions[vertex * 3 + 2] = ribbon.positions[vertex * 2 + 1] - CENTER_Z;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("along", new BufferAttribute(new Float32Array(ribbon.along), 1));
    geometry.setIndex(ribbon.indices);
    const material = track(
      new ShaderMaterial({
        vertexShader: ROUTE_VERTEX,
        fragmentShader: ROUTE_FRAGMENT,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uOffset: { value: offsets.get(route.id) ?? 0 },
          uActive: { value: 0 },
          uDim: { value: 0 },
          uRest: { value: new Color(0xdfe6e4) },
          uSignal: { value: new Color(SIGNAL) },
          uFogColor: { value: new Color(GRAPHITE) },
          uFogNear: { value: fog.near },
          uFogFar: { value: fog.far },
        },
      }),
    );
    scene.add(new Mesh(geometry, material));
    return { id: route.id, material, active: 0, dim: 0 };
  });

  // Bloques (placa + lámpara) y lámparas sueltas.
  const plateGeometry = track(new BoxGeometry(1.8, 0.14, 1.8));
  const plateMaterial = track(new MeshStandardMaterial({ color: PLATE, roughness: 0.85, metalness: 0 }));
  const lampGeometry = track(new CylinderGeometry(0.34, 0.34, 0.1, 28));
  const tapGeometry = track(new CylinderGeometry(0.22, 0.22, 0.08, 20));
  const signal = new Color(SIGNAL);
  const lamps: LampEntry[] = [];
  const addLamp = (point: BoardPoint, geometry: CylinderGeometry, rest: number, height: number, stationId: string | null) => {
    const material = track(new MeshBasicMaterial({ color: rest }));
    const lamp = new Mesh(geometry, material);
    lamp.position.copy(toWorld(point, height));
    scene.add(lamp);
    lamps.push({ stationId, material, rest: new Color(rest), level: 0 });
  };
  BOARD_STATIONS.forEach((station) => {
    const plate = new Mesh(plateGeometry, plateMaterial);
    plate.position.copy(toWorld(station.at, 0.07));
    scene.add(plate);
    addLamp(station.at, lampGeometry, LAMP_REST, 0.19, station.id);
  });
  BOARD_TAPS.forEach((tap) => addLamp(tap.at, tapGeometry, LAMP_TAP, 0.05, null));

  // Encuadre.
  const lookAt = new Vector3();
  let width = 1;
  let height = 1;
  let scrollProgress = 0;
  let layoutDirty = true;

  const project: BoardProjector = (point) => {
    const projected = toWorld(point, 0.2).project(camera);
    return { x: (projected.x * 0.5 + 0.5) * width, y: (-projected.y * 0.5 + 0.5) * height };
  };

  const frameCamera = () => {
    const aspect = width / height;
    camera.aspect = aspect;
    const halfFov = (camera.fov * Math.PI) / 360;
    // En pantalla ancha el diagrama se ajusta a la franja derecha; al hacer scroll la cámara avanza y se inclina.
    const wide = width >= PROJECTED_MIN_WIDTH;
    const visibleWidth = wide ? FIT_WIDTH / WIDE_SPAN : FIT_WIDTH;
    const fitDistance = visibleWidth / 2 / (Math.tan(halfFov) * aspect);
    const elevation = ((wide ? 61 : 54) - scrollProgress * 20) * (Math.PI / 180);
    const distance = fitDistance * (1 - scrollProgress * 0.2);
    lookAt.set(wide ? -(WIDE_CENTER - 0.5) * visibleWidth : 0, 0, (wide ? -0.9 : 1) - scrollProgress * 5);
    camera.position.set(lookAt.x, Math.sin(elevation) * distance, lookAt.z + Math.cos(elevation) * distance);
    camera.lookAt(lookAt);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    fog.near = distance * 1.08;
    fog.far = distance * 2.1;
    routes.forEach(({ material }) => {
      material.uniforms.uFogNear.value = fog.near;
      material.uniforms.uFogFar.value = fog.far;
    });
    options.onLayout(project);
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;
    width = bounds.width;
    height = bounds.height;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    layoutDirty = true;
  };

  const onScroll = () => {
    const bounds = canvas.getBoundingClientRect();
    const next = Math.min(1, Math.max(0, -bounds.top / Math.max(bounds.height, 1)));
    if (next !== scrollProgress) {
      scrollProgress = next;
      layoutDirty = true;
    }
  };

  // Cursor sobre el plano del tablero.
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const boardPlane = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  let pointerActive = false;

  const onPointerMove = (event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();
    const inside =
      event.clientX >= bounds.left && event.clientX <= bounds.right &&
      event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (!inside) {
      pointerActive = false;
      return;
    }
    pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    pointerActive = raycaster.ray.intersectPlane(boardPlane, hit) !== null;
  };
  const onPointerLeave = () => {
    pointerActive = false;
  };
  // Al levantar el dedo las teselas vuelven a su sitio; con ratón el cursor sigue encima.
  const onPointerUp = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") pointerActive = false;
  };

  // Estado de enfoque.
  let lit = new Set<string>();
  let activeStation: string | null = null;

  const updateTiles = () => {
    let changed = false;
    for (let index = 0; index < tileCount; index += 1) {
      let target = 0;
      if (pointerActive) {
        const distance = Math.hypot(tileX[index] - hit.x, tileZ[index] - hit.z);
        if (distance < PRESS_RADIUS) {
          const falloff = 1 - distance / PRESS_RADIUS;
          target = falloff * falloff;
        }
      }
      const current = press[index];
      if (current === target) continue;
      const next = Math.abs(target - current) < 0.002 ? target : current + (target - current) * 0.16;
      press[index] = next;
      matrix.makeTranslation(tileX[index], -0.15 - next * PRESS_DEPTH, tileZ[index]);
      tiles.setMatrixAt(index, matrix);
      tiles.setColorAt(index, tint.copy(tileBase).lerp(tileLit, next).multiplyScalar(tileShade[index]));
      changed = true;
    }
    if (changed) {
      tiles.instanceMatrix.needsUpdate = true;
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    }
  };

  const updateFocus = () => {
    routes.forEach((route) => {
      const isLit = lit.has(route.id);
      route.active += ((isLit ? 1 : 0) - route.active) * 0.14;
      route.dim += ((activeStation && !isLit ? 1 : 0) - route.dim) * 0.14;
      route.material.uniforms.uActive.value = route.active;
      route.material.uniforms.uDim.value = route.dim;
    });
    lamps.forEach((lamp) => {
      const target = lamp.stationId !== null && lamp.stationId === activeStation ? 1 : 0;
      lamp.level += (target - lamp.level) * 0.16;
      lamp.material.color.copy(lamp.rest).lerp(signal, lamp.level);
    });
  };

  let frame = 0;
  let running = false;
  const startedAt = performance.now();
  const render = () => {
    frame = requestAnimationFrame(render);
    if (layoutDirty) {
      frameCamera();
      layoutDirty = false;
    }
    const seconds = (performance.now() - startedAt) / 1000;
    routes.forEach(({ material }) => {
      material.uniforms.uTime.value = seconds;
    });
    updateTiles();
    updateFocus();
    renderer.render(scene, camera);
  };
  const start = () => {
    if (running) return;
    running = true;
    frame = requestAnimationFrame(render);
  };
  const stop = () => {
    running = false;
    cancelAnimationFrame(frame);
  };

  // Solo se dibuja cuando el tablero está en pantalla y la pestaña visible.
  let onScreen = true;
  const sync = () => (onScreen && !document.hidden ? start() : stop());
  const visibility = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  visibility.observe(canvas);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    options.onContextLost();
  };

  document.addEventListener("visibilitychange", sync);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerup", onPointerUp, { passive: true });
  document.documentElement.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("webglcontextlost", onContextLost);

  resize();
  onScroll();
  sync();

  return {
    setActiveStation(stationId) {
      activeStation = stationId;
      lit = stationId ? upstreamRouteIds(BOARD_ROUTES, stationId) : new Set<string>();
    },
    dispose() {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      disposables.forEach((resource) => resource.dispose());
      tiles.dispose();
      renderer.dispose();
    },
  };
}

# Frontend — Portfolio Personal

Aplicación web con Next.js 16 (Pages Router) + React 19 + TailwindCSS para sitio personal con landing, autenticación, admin, blog y toolkit técnico.

## Stack

- **Next.js 16** (Pages Router) + **React 19** + **TypeScript**
- **TailwindCSS** con tokens custom (dark soft theme)
- **Jest** + React Testing Library (20 test files)
- Dependencias clave: `@excalidraw/excalidraw`, `mermaid`, TipTap

## Variables de entorno

```bash
NEXT_PUBLIC_API_URL=http://localhost:3100
```

## Iniciar

```bash
npm run dev       # Dev server (puerto 3000)
npm run build     # Build de producción
npm run lint      # ESLint
npm run test      # Jest tests
npm run test:coverage  # Jest con coverage gates
```

### Build y rutas del blog

El sitio usa `output: "export"` (export estático). Las páginas `/blog/[id]` se pregeneran en tiempo de build: `getStaticPaths` llama a `GET /api/experiences` (usando `NEXT_PUBLIC_API_URL`) y genera un HTML por cada artículo con tag de blog. **Para que un artículo nuevo sea accesible por URL hay que volver a hacer build y desplegar.** Durante el build la API debe ser accesible (por ejemplo con `NEXT_PUBLIC_API_URL` apuntando a tu API en producción o a un backend local).

### Imágenes (admin / editor)

La subida de imágenes se hace **desde el frontend al backend** (POST con el archivo); el backend es el único que accede al bucket de GCP/Firebase Storage y devuelve la URL. No se exponen credenciales de GCP en el frontend. Configuración del bucket y reglas en el backend; ver [.cursor/plans/carga-imagenes-firebase-storage.plan.md](../.cursor/plans/carga-imagenes-firebase-storage.plan.md).

## Secciones disponibles

### Públicas

- `/` — Landing principal
- `/about` — Sobre mí
- `/portfolio` — Portafolio de proyectos
- `/blog` — Blog con listado y vista de detalle
- `/tools` — Toolkit técnico (14 herramientas)

### Autenticación

- `/auth/login` — Login
- `/auth/register` — Registro

### Admin (requiere JWT)

- `/admin` — Panel de administración (CRUD experiencias, skills, observabilidad)

## Herramientas (14 en 3 categorías)

### Codificación y Criptografía (5)

| Herramienta | Fuente | Ruta |
|-------------|--------|------|
| Base64 Encoder/Decoder | Backend API | `/tools/base64` |
| UUID v4 Generator | Backend API | `/tools/uuid` |
| Certificados Autofirmados | Backend API | `/tools/certs` |
| Generador RSA | Web Crypto API (client) | `/tools/rsa-keys` |
| JWT Decoder | atob() (client) | `/tools/jwt-decoder` |

### Red y DNS (5)

| Herramienta | Fuente | Ruta |
|-------------|--------|------|
| Validador de Dominio | Backend API | `/tools/domain-validator` |
| Propagación DNS | Backend API | `/tools/dns-propagation` |
| Registros de Correo | Backend API | `/tools/mail-records` |
| Blacklist Checker | Backend API | `/tools/blacklist` |
| Calculadora CIDR | Lógica pura (client) | `/tools/cidr` |

### Diagramas (3)

| Herramienta | Fuente | Ruta |
|-------------|--------|------|
| Excalidraw | @excalidraw/excalidraw | `/tools/excalidraw` |
| Mermaid | mermaid.js | `/tools/mermaid` |
| SQL Visualizer | Client-side | `/tools/sql-visualizer` |

## Testing

```bash
npm run test           # Ejecutar tests
npm run test:coverage  # Con coverage gates (85% lines, 90% functions, 70% branches)
```

## Arquitectura

- `pages/` — Rutas (24 archivos)
- `components/` — Componentes organizados por dominio (layout, common, tools, UI)
- `api/` — Módulos de consumo API con tipos y endpoints centralizados
- `context/` — AuthProvider con refresh proactivo e interceptor 401
- `utils/` — Utilidades (format-api-error, input-validation, html-content)

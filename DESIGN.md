---
name: Yonathan Gutierrez — Panel Mímico
description: Sitio personal presentado como el tablero mímico de una sala de control.
colors:
  ink-base: "#0d1a22"
  ink-deep: "#08131a"
  tile-face: "#12232d"
  tile-raised: "#182d38"
  tile-soft: "#203945"
  joint: "#284452"
  joint-strong: "#3a5a69"
  cream: "#f6f3e8"
  label-secondary: "#b8c6c8"
  label-muted: "#8498a0"
  signal-teal: "#33c8c0"
  signal-teal-hover: "#5ad6cf"
  signal-teal-edge: "#7fe0da"
  lamp-tap: "#9fb0b3"
  sand: "#ecd9b5"
  signal-teal-deep: "#0f6f73"
  state-ok: "#62c08d"
  state-fault: "#f0705f"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 5.6vw, 5rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 88"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    fontVariation: "'wdth' 92"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 112"
  data:
    fontFamily: "B612 Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  tile: "4px"
  plate: "6px"
  lamp: "9999px"
spacing:
  tile: "32px"
  gutter: "16px"
  section: "clamp(4.5rem, 10vw, 8rem)"
components:
  pushbutton:
    backgroundColor: "{colors.tile-raised}"
    textColor: "{colors.cream}"
    rounded: "{rounded.tile}"
    padding: "12px 18px"
  pushbutton-primary:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.tile}"
    padding: "12px 18px"
  tile-card:
    backgroundColor: "{colors.tile-face}"
    textColor: "{colors.cream}"
    rounded: "{rounded.plate}"
---

## Overview

El sitio es un tablero mímico: el esquema de un sistema completo visto por quien lo opera. No representa una tecnología; representa un recorrido (código, sistemas distribuidos, plataforma, red y seguridad, operación, gobierno de IA) y los sectores donde se ha aplicado. Nada decora: cada lámpara, trazo y tesela indica algo. El tono es reservado y contemporáneo, no una réplica de un tablero antiguo.

Se usa de noche y de día por pares técnicos frente a un monitor; el fondo de tinta mate evita el deslumbramiento de un fondo claro y deja que las lámparas sean la única fuente de luz.

## Colors

La paleta sale del logo del autor (`public/logo.png`): tinta azul verdosa, turquesa, crema y arena. Estrategia contenida: neutros de tinta y **un solo color de señal**, el turquesa.

- `ink-base` e `ink-deep` son el muro del tablero, derivados de la tinta del logo.
- `tile-face`, `tile-raised`, `tile-soft` son las caras de las teselas, de más hundida a más elevada.
- `joint` es la junta entre teselas: todos los bordes y la retícula de fondo.
- `cream` es el texto principal, el crema del fondo del logo.
- `signal-teal` marca lo activo: ruta enfocada, enlace, lámpara encendida, acción principal. No se usa como relleno de grandes superficies.
- `sand` es la nota cálida del logo (su punto central): lámparas en reposo y poco más. Nunca compite con el turquesa.
- El amarillo mostaza no es color de marca: solo aparece como aviso semántico en herramientas (`amber-*`), nunca como acento.
- `state-ok` y `state-fault` solo para estado real (mensaje enviado, error). Nunca como decoración.

## Typography

Archivo variable para todo el texto: su eje de anchura da la rotulación grabada (títulos algo condensados, etiquetas algo expandidas en mayúsculas) sin cambiar de familia. B612 Mono, diseñada para pantallas de cabina, se reserva para datos: fechas, lecturas, códigos y stack. No se usa monoespaciada para párrafos ni titulares.

Los titulares van en caja normal, con `text-wrap: balance`. Las etiquetas en mayúsculas se limitan a rótulos de pieza (lámparas, sectores, regleta), no a cada sección.

## Layout

- Retícula de teselas de 32 px apenas perceptible (juntas al 15 % de opacidad); las conexiones del diagrama, en crema claro, son lo que debe contrastar; los bloques se alinean a ella.
- Una **línea principal** recorre el margen izquierdo de la home y conecta las secciones; cada sección cuelga de ella con una lámpara que se enciende al entrar en pantalla.
- Cada tipo de contenido tiene forma propia: artículos como registro con fecha, capacidades como bloques derivados de un bus, proyectos como teselas grandes con imagen. No se repite el mismo carrusel.
- Contenedor máximo de 80rem; cuerpo de texto de 65 a 75 caracteres.
- En móvil el tablero 3D pasa a ser una franja y los bloques se leen como lista.

## Elevation & Depth

La profundidad es física y corta: una tesela sobresale 2 a 4 px. Sombra con desplazamiento vertical y desenfoque corto, más un filo claro de 1 px arriba. Al pulsar, la pieza baja y la sombra se acorta. No hay halos de color ni desenfoques de cristal.

## Shapes

Teselas cuadradas con radio de 4 px; placas de 6 px. Las lámparas son los únicos círculos. Los trazos son ortogonales con chaflán a 45°, de 2 px.

## Components

- **Pulsador (botón):** tesela elevada con lámpara a la izquierda; al pasar el cursor la lámpara pasa a turquesa, al pulsar baja 1 px. El principal es turquesa con texto tinta.
- **Regleta (header):** franja fija con el isotipo en versión para fondo oscuro (`public/brand/isotipo-dark.png`: transparente, tinta en crema, turquesa intacto) y el nombre del autor y enlaces; el enlace activo lleva lámpara turquesa.
- **Tesela (tarjeta):** cara `tile-face`, junta de 1 px, lámpara en la esquina que se enciende con hover o foco.
- **Lámpara:** círculo de 8 px; estados apagada (`joint-strong`), reposo (`sand`), activa (`signal-teal`), correcto, fallo.
- **Etiqueta grabada:** stack y sectores en B612 Mono sobre placa hundida.
- **Lectura:** panel que cuelga del bloque enfocado con una guía turquesa (debajo, o encima si no cabe); sin enfoque solo queda una indicación al pie del tablero. En lista es una caja fija bajo los bloques.
- **Tablero 3D:** desde 1100 px el texto va a la izquierda y el diagrama ocupa el 63 % derecho con rótulos del DOM proyectados; por debajo, el tablero es una franja y los bloques una lista. Teselas instanciadas que ceden bajo el cursor, rutas con pulsos; el enfoque de un bloque ilumina su ruta y atenúa las demás. Tiene respaldo SVG.

## Do's and Don'ts

- Sí: que cada animación corresponda a un cambio de estado (enfocar, entrar en pantalla, pulsar, enviar).
- Sí: mantener la escena 3D decorativa para lectores de pantalla y dar la misma información en la lista de bloques.
- Sí: respetar `prefers-reduced-motion`; el contenido es visible sin animación.
- No: gradientes en texto, halos de neón, cristal esmerilado.
- No: usar el turquesa como relleno de fondo o en más de un elemento principal por vista.
- No: afirmar clientes, cifras o despliegues que el autor no haya confirmado.

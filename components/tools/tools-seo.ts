/**
 * Contenido editorial de cada herramienta: lo que sale en buscadores (título y
 * descripción) y la guía que se imprime bajo la herramienta en el HTML estático.
 * Describe solo lo que la herramienta hace hoy; al cambiar una, actualizar aquí.
 */
export type ToolFaq = { question: string; answer: string };

export type ToolSeo = {
  /** Título de búsqueda, sin el nombre del sitio. */
  title: string;
  /** Meta descripción (140-160 caracteres). */
  description: string;
  /** Qué es y para qué sirve, en uno o dos párrafos. */
  intro: string[];
  /** Casos de uso concretos. */
  uses: string[];
  faq: ToolFaq[];
};

export const TOOLS_SEO: Record<string, ToolSeo> = {
  base64: {
    title: "Codificar y decodificar Base64 y Base64URL online",
    description:
      "Convierte texto a Base64 estándar o Base64URL y de vuelta, y pasa entre Base64 y hexadecimal. Útil para tokens, cabeceras HTTP y datos binarios.",
    intro: [
      "Base64 representa datos binarios usando solo 64 caracteres imprimibles, lo que permite llevarlos por canales pensados para texto: cabeceras HTTP, JSON, correo o variables de entorno. No es cifrado: cualquiera puede decodificarlo.",
      "Este conversor trabaja con las dos variantes habituales, la estándar (con + y /) y la segura para URL (con - y _, sin relleno), y convierte además entre Base64 y hexadecimal.",
    ],
    uses: [
      "Leer el contenido de una cabecera Authorization: Basic o de un secreto de Kubernetes.",
      "Preparar un valor binario para incluirlo en JSON o en una variable de entorno.",
      "Pasar un hash o una clave de hexadecimal a Base64 y viceversa.",
    ],
    faq: [
      {
        question: "¿Qué diferencia hay entre Base64 y Base64URL?",
        answer:
          "Base64URL sustituye + por - y / por _, y suele omitir el relleno con =, para que el resultado pueda ir en una URL o en un nombre de archivo sin escaparlo. Es la variante que usan los JWT.",
      },
      {
        question: "¿Base64 protege la información?",
        answer:
          "No. Es una codificación reversible sin clave. Para proteger datos hace falta cifrado; Base64 solo cambia la representación.",
      },
    ],
  },
  uuid: {
    title: "Generador de UUID v4 online",
    description:
      "Genera identificadores únicos universales (UUID versión 4) aleatorios, listos para usar como claves en bases de datos, trazas o pruebas.",
    intro: [
      "Un UUID v4 es un identificador de 128 bits generado al azar y escrito como 36 caracteres (8-4-4-4-12). La probabilidad de que dos coincidan es despreciable, por eso se usa como clave cuando varios sistemas crean registros sin coordinarse.",
    ],
    uses: [
      "Crear claves primarias o identificadores de recursos en sistemas distribuidos.",
      "Generar identificadores de correlación para trazas y registros.",
      "Obtener valores de prueba para fixtures y peticiones de ejemplo.",
    ],
    faq: [
      {
        question: "¿Puede repetirse un UUID v4?",
        answer:
          "En teoría sí, en la práctica no: tiene 122 bits aleatorios, así que harían falta miles de millones de identificadores para que una colisión fuera probable.",
      },
      {
        question: "¿Cuándo conviene otra versión de UUID?",
        answer:
          "Si necesitas que los identificadores queden ordenados por fecha de creación (por ejemplo, para índices de base de datos), la versión 7 es mejor opción que la 4.",
      },
    ],
  },
  certs: {
    title: "Generar certificados autofirmados con SAN en el navegador",
    description:
      "Crea certificados TLS autofirmados con nombres alternativos (SAN) para desarrollo y laboratorios. La clave privada se genera en tu navegador y no se envía.",
    intro: [
      "Un certificado autofirmado sirve para cifrar con TLS en entornos donde no hace falta una autoridad certificadora pública: desarrollo local, laboratorios y servicios internos de prueba.",
      "El certificado y su clave privada se generan por completo en tu navegador; nada se envía al servidor ni se guarda. Puedes indicar varios nombres alternativos (SAN), que es lo que los navegadores validan hoy en lugar del nombre común.",
    ],
    uses: [
      "Servir HTTPS en localhost o en un dominio interno de pruebas.",
      "Probar la configuración TLS de un proxy inverso o de un ingress antes de pedir un certificado real.",
      "Preparar material de laboratorio para ejercicios de TLS y mTLS.",
    ],
    faq: [
      {
        question: "¿Por qué el navegador marca el certificado como no seguro?",
        answer:
          "Porque no lo firma una autoridad en la que el sistema confíe. En desarrollo se resuelve añadiéndolo al almacén de confianza del equipo; en producción debe usarse un certificado emitido por una autoridad reconocida.",
      },
      {
        question: "¿Es seguro generar aquí la clave privada?",
        answer:
          "La clave se crea en tu navegador y no sale de él. Aun así, un certificado autofirmado es para pruebas: no lo uses para servicios públicos.",
      },
    ],
  },
  "rsa-keys": {
    title: "Generador de claves RSA de 2048 y 4096 bits",
    description:
      "Genera un par de claves RSA pública y privada de 2048 o 4096 bits en formato PEM. Las claves se crean en tu navegador con Web Crypto.",
    intro: [
      "RSA es un algoritmo de clave pública: lo que se cifra con una clave solo se descifra con la otra, y lo firmado con la privada se verifica con la pública.",
      "El par se genera en tu navegador con la API Web Crypto y se entrega en PEM: la clave pública en SPKI y la privada en PKCS#8.",
    ],
    uses: [
      "Crear claves para firmar y verificar JWT con RS256 en un entorno de pruebas.",
      "Obtener un par de claves para ejercicios de cifrado y firma.",
      "Probar integraciones que esperan claves en PEM.",
    ],
    faq: [
      {
        question: "¿2048 o 4096 bits?",
        answer:
          "2048 bits es el mínimo aceptado hoy y basta para la mayoría de usos. 4096 da más margen a costa de operaciones más lentas y claves más grandes.",
      },
      {
        question: "¿Puedo usar estas claves en producción?",
        answer:
          "Para producción conviene generar las claves en el entorno donde se van a usar, con un gestor de secretos o un HSM, de modo que la clave privada nunca pase por un navegador ni por el portapapeles.",
      },
    ],
  },
  "jwt-decoder": {
    title: "Decodificador de JWT: header, payload y claims",
    description:
      "Decodifica un JSON Web Token y revisa su cabecera, sus claims y las fechas de emisión y expiración en formato legible.",
    intro: [
      "Un JWT son tres partes en Base64URL separadas por puntos: cabecera, carga útil y firma. Las dos primeras son JSON legible por cualquiera; solo la firma garantiza que nadie las alteró.",
      "El decodificador separa el token, muestra el algoritmo declarado, distingue los claims registrados (iss, sub, aud, exp, iat…) de los propios y traduce las fechas.",
    ],
    uses: [
      "Comprobar por qué una API rechaza un token: expiración, audiencia o emisor incorrectos.",
      "Revisar qué claims emite un proveedor de identidad.",
      "Confirmar el algoritmo de firma declarado en la cabecera.",
    ],
    faq: [
      {
        question: "¿Decodificar un JWT es lo mismo que validarlo?",
        answer:
          "No. Decodificar solo lee el contenido. Validar exige comprobar la firma con la clave correcta y revisar expiración, emisor y audiencia; eso debe hacerlo el servicio que recibe el token.",
      },
      {
        question: "¿El contenido de un JWT es secreto?",
        answer:
          "No. La carga útil va codificada, no cifrada. No incluyas en ella datos sensibles salvo que uses un token cifrado (JWE).",
      },
    ],
  },
  "domain-validator": {
    title: "Validador de dominio: comprobar resolución DNS",
    description:
      "Comprueba si un dominio resuelve en DNS y a qué direcciones apunta. Un fallo de consulta se muestra como error, no como dominio inexistente.",
    intro: [
      "Antes de depurar una aplicación conviene confirmar lo básico: que el nombre existe en DNS y apunta a donde debe. Esta herramienta consulta el dominio y muestra el resultado.",
      "Distingue entre un dominio que no existe y una consulta que falló (tiempo agotado o error del servidor DNS), porque no significan lo mismo ni se corrigen igual.",
    ],
    uses: [
      "Verificar un dominio recién registrado o un subdominio recién creado.",
      "Descartar DNS como causa cuando un servicio no responde.",
      "Confirmar a qué IP apunta un nombre antes de un cambio.",
    ],
    faq: [
      {
        question: "¿Por qué mi dominio resuelve aquí y no en mi equipo?",
        answer:
          "Cada resolver guarda las respuestas el tiempo que indica el TTL del registro. Tu equipo o tu proveedor pueden tener todavía una respuesta antigua en caché.",
      },
    ],
  },
  "dns-propagation": {
    title: "Consultar registros DNS por tipo (A, AAAA, MX, TXT, CNAME, NS)",
    description:
      "Consulta los registros DNS de un dominio por tipo y revisa qué responde hoy el servidor. Indica con claridad cuándo una consulta falla.",
    intro: [
      "Permite pedir un tipo de registro concreto para un dominio y ver la respuesta actual: direcciones, servidores de correo, registros de texto, alias o servidores de nombres.",
      "La consulta se hace desde el resolver del servidor de este sitio. No compara varios resolvers del mundo: sirve para saber qué hay publicado, no para medir la propagación geográfica.",
    ],
    uses: [
      "Revisar que un registro TXT de verificación quedó publicado.",
      "Confirmar los MX de un dominio tras migrar el correo.",
      "Comprobar un CNAME antes de emitir un certificado.",
    ],
    faq: [
      {
        question: "¿Cuánto tarda en verse un cambio de DNS?",
        answer:
          "Depende del TTL del registro anterior: hasta que venza, los resolvers pueden seguir entregando el valor antiguo. Bajar el TTL antes de un cambio planificado acorta esa ventana.",
      },
    ],
  },
  "mail-records": {
    title: "Auditor de SPF, DKIM, DMARC, MX, MTA-STS y TLS-RPT",
    description:
      "Audita la autenticación de correo de un dominio: SPF, DKIM, DMARC, MX, MTA-STS y TLS-RPT, con hallazgos explicados y cómo corregir cada uno.",
    intro: [
      "Que un correo llegue a la bandeja de entrada depende de que el dominio demuestre quién puede enviar en su nombre. Esta auditoría revisa los registros que lo sostienen: SPF, DKIM y DMARC para la autenticación, MX para la recepción, y MTA-STS y TLS-RPT para el cifrado en tránsito.",
      "Cada registro se analiza contra las reglas de su especificación y el resultado explica qué se encontró y cómo corregirlo. Si un registro no se pudo consultar se indica como no disponible; nunca se da por correcto ni por ausente.",
    ],
    uses: [
      "Diagnosticar por qué los correos de un dominio caen en spam.",
      "Revisar la configuración antes de endurecer la política DMARC a quarantine o reject.",
      "Detectar un SPF que supera el límite de 10 consultas DNS.",
    ],
    faq: [
      {
        question: "¿Qué diferencia hay entre SPF, DKIM y DMARC?",
        answer:
          "SPF declara qué servidores pueden enviar por el dominio. DKIM firma cada mensaje para probar que no se alteró. DMARC indica al receptor qué hacer cuando SPF y DKIM fallan y a dónde enviar los informes.",
      },
      {
        question: "¿Por qué hay que indicar un selector DKIM?",
        answer:
          "Porque la clave DKIM se publica bajo un nombre que elige quien envía (el selector) y no existe una forma estándar de listarlos. Aparece en la cabecera DKIM-Signature de cualquier mensaje enviado, en el campo s=.",
      },
    ],
  },
  blacklist: {
    title: "Comprobar si una IP está en listas negras DNSBL",
    description:
      "Verifica si una IPv4, o la IP de un dominio, aparece en listas negras DNSBL de correo. Las listas que no responden se muestran aparte.",
    intro: [
      "Las DNSBL son listas públicas de direcciones IP asociadas a spam u otros abusos. Muchos servidores de correo las consultan y rechazan los mensajes que vienen de una IP listada.",
      "La herramienta consulta varias listas y separa tres resultados: listada, no listada y sin respuesta. Una lista que no responde no cuenta como limpia.",
    ],
    uses: [
      "Investigar rebotes de correo con mensajes de bloqueo por reputación.",
      "Revisar la IP de un servidor nuevo antes de usarlo para enviar correo.",
      "Comprobar una IP compartida cuya reputación no controlas.",
    ],
    faq: [
      {
        question: "Mi IP aparece listada, ¿qué hago?",
        answer:
          "Primero corrige la causa (equipo comprometido, relé abierto, envíos no solicitados). Después solicita la baja en el sitio de cada lista: todas publican su procedimiento.",
      },
    ],
  },
  cidr: {
    title: "Calculadora CIDR: rangos, máscaras y subredes IP",
    description:
      "Calcula la red, la máscara, el rango de hosts y el broadcast de un bloque CIDR, y divídelo en subredes para planificar direccionamiento.",
    intro: [
      "La notación CIDR, como 10.0.0.0/16, indica cuántos bits de una dirección identifican la red. De ahí salen la máscara, la primera y la última dirección utilizable y el número de hosts.",
      "La calculadora obtiene esos valores para un bloque y permite dividirlo en subredes más pequeñas.",
    ],
    uses: [
      "Diseñar el direccionamiento de una VPC y sus subredes por zona.",
      "Comprobar si dos rangos se solapan antes de conectar redes.",
      "Dimensionar el rango de pods y servicios de un clúster de Kubernetes.",
    ],
    faq: [
      {
        question: "¿Cuántas direcciones tiene un /24?",
        answer:
          "256 en total y 254 utilizables en una red tradicional, porque la primera identifica la red y la última es el broadcast. Los proveedores de nube suelen reservar algunas más por subred.",
      },
    ],
  },
  excalidraw: {
    title: "Pizarra de diagramas online con Excalidraw",
    description:
      "Dibuja diagramas de arquitectura, flujos y bocetos con aspecto de pizarra usando Excalidraw, directamente en el navegador.",
    intro: [
      "Excalidraw es un editor de diagramas de código abierto con trazo de dibujo a mano. Va bien para explicar una idea rápido: una arquitectura, un flujo o el estado de un sistema durante una reunión.",
    ],
    uses: [
      "Bocetar una arquitectura antes de formalizarla.",
      "Explicar un flujo o un incidente en una llamada.",
      "Preparar una ilustración para documentación o un artículo.",
    ],
    faq: [
      {
        question: "¿Dónde se guarda lo que dibujo?",
        answer:
          "El dibujo vive en tu navegador. Para conservarlo o compartirlo, expórtalo desde el menú del editor.",
      },
    ],
  },
  mermaid: {
    title: "Editor de diagramas Mermaid con vista previa",
    description:
      "Escribe diagramas con sintaxis Mermaid y míralos al instante: flujos, secuencias, clases, estados y entidad-relación.",
    intro: [
      "Mermaid genera diagramas a partir de texto. Al ser texto, el diagrama se versiona junto al código, se revisa en un pull request y se mantiene sin herramientas de dibujo.",
      "El editor muestra la vista previa mientras escribes.",
    ],
    uses: [
      "Documentar un flujo o una secuencia de llamadas en un README.",
      "Probar la sintaxis antes de pegar el diagrama en una wiki o en Markdown.",
      "Convertir una explicación en texto en un diagrama revisable.",
    ],
    faq: [
      {
        question: "¿Dónde puedo usar después el diagrama?",
        answer:
          "GitHub y GitLab renderizan Mermaid de forma nativa en Markdown: basta pegar el texto en un bloque de código marcado como mermaid.",
      },
    ],
  },
  "sql-visualizer": {
    title: "Visualizar un esquema SQL como diagrama entidad-relación",
    description:
      "Pega sentencias CREATE TABLE y obtén el diagrama entidad-relación con tablas, columnas, claves primarias y relaciones por claves foráneas.",
    intro: [
      "Leer un esquema como una lista de CREATE TABLE no deja ver cómo se relacionan las tablas. El visualizador interpreta esas sentencias y dibuja el diagrama entidad-relación.",
    ],
    uses: [
      "Entender un esquema heredado a partir de su DDL.",
      "Revisar las relaciones de una migración antes de aplicarla.",
      "Generar un diagrama para la documentación de un servicio.",
    ],
    faq: [
      {
        question: "¿Qué necesita el SQL para que aparezcan las relaciones?",
        answer:
          "Que las claves foráneas estén declaradas en las sentencias CREATE TABLE. Las relaciones que solo existen por convención de nombres no se pueden deducir.",
      },
    ],
  },
};

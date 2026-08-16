export default {
  id: 3,
  title: 'Imágenes',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Entender qué es una imagen Docker, cómo está construida internamente y cómo gestionar el ciclo de vida de imágenes.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Una imagen Docker no es un archivo único ni un ZIP. Tiene una estructura interna sofisticada que hace posible la reutilización, el versionado y la distribución eficiente.

Si no entendés esa estructura, no podés optimizar tamaños, ni entender por qué un pull tarda lo que tarda, ni debuggear problemas de filesystem, ni saber si tu imagen de 2 GB es evitable.

Las imágenes son inmutables. Eso es una feature, no un bug. Significa que la imagen que testeaste es exactamente la misma que va a producción.`,
    },
    {
      type: 'analogy',
      title: 'La analogía de las capas',
      body: `Una imagen es como una pila de acetatos transparentes. Cada acetato agrega algo encima del anterior. Para ver el resultado final, mirás a través de todos los acetatos apilados.

El acetato de abajo es la imagen base (Ubuntu, Alpine, etc.). Encima hay uno con las librerías del sistema. Encima otro con las dependencias de tu app. Y arriba de todo, el código de tu aplicación.

Cuando hacés un cambio en el código, solo reemplazás el acetato de arriba. Los de abajo se reutilizan. Eso es por qué un segundo build es tan rápido y un segundo pull solo descarga las capas que cambiaron.`,
    },
    {
      type: 'diagram',
      title: 'Estructura interna de una imagen OCI',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 700 420" role="img" aria-label="manifest.json referencia el config y cada capa por su hash sha256, y esos hashes son las claves de los archivos layer.tar en layers/">
      <defs>
        <marker id="arrow-03a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="350" y="16" text-anchor="middle" font-size="12">imagen: python:3.12-slim</text>
      <line x1="350" y1="24" x2="350" y2="40" stroke="currentColor"/>
      <line x1="180" y1="40" x2="520" y2="40" stroke="currentColor"/>
      <line x1="180" y1="40" x2="180" y2="58" stroke="currentColor" marker-end="url(#arrow-03a)"/>
      <line x1="520" y1="40" x2="520" y2="58" stroke="currentColor" marker-end="url(#arrow-03a)"/>

      <rect x="30" y="60" width="300" height="160" rx="6" stroke="currentColor" fill="none"/>
      <text x="180" y="80" text-anchor="middle" font-size="12">manifest.json (índice)</text>
      <text x="180" y="96" text-anchor="middle" font-size="9">config digest: sha256:abc…</text>

      <rect x="40" y="106" width="260" height="26" rx="3" stroke="currentColor" fill="none"/>
      <text x="170" y="123" text-anchor="middle" font-size="9">layer 0 → sha256:111…</text>
      <rect x="40" y="138" width="260" height="26" rx="3" stroke="currentColor" fill="none"/>
      <text x="170" y="155" text-anchor="middle" font-size="9">layer 1 → sha256:222…</text>
      <rect x="40" y="170" width="260" height="26" rx="3" stroke="currentColor" fill="none"/>
      <text x="170" y="187" text-anchor="middle" font-size="9">layer 2 → sha256:333…</text>

      <line x1="330" y1="90" x2="370" y2="90" stroke="currentColor" marker-end="url(#arrow-03a)"/>

      <rect x="370" y="60" width="300" height="160" rx="6" stroke="currentColor" fill="none"/>
      <text x="520" y="80" text-anchor="middle" font-size="12">config (sha256:abc…)</text>
      <text x="520" y="98" text-anchor="middle" font-size="9">architecture: amd64 · os: linux</text>
      <text x="520" y="114" text-anchor="middle" font-size="9">env: PYTHON_VERSION=3.12.0…</text>
      <text x="520" y="130" text-anchor="middle" font-size="9">cmd: ["python3"]</text>
      <text x="520" y="146" text-anchor="middle" font-size="9">workdir: ""</text>
      <text x="520" y="162" text-anchor="middle" font-size="9">history: comandos por capa</text>

      <line class="dg-accent" x1="300" y1="123" x2="140" y2="296" stroke="currentColor" marker-end="url(#arrow-03a)"/>
      <line x1="300" y1="155" x2="340" y2="296" stroke="currentColor" marker-end="url(#arrow-03a)"/>
      <line x1="300" y1="187" x2="540" y2="296" stroke="currentColor" marker-end="url(#arrow-03a)"/>

      <rect x="30" y="260" width="640" height="140" rx="6" stroke="currentColor" fill="none"/>
      <text x="350" y="280" text-anchor="middle" font-size="12">layers/</text>

      <rect class="dg-accent" x="50" y="296" width="180" height="84" rx="4" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="140" y="316" text-anchor="middle" font-size="10" fill="currentColor">sha256:111…/layer.tar</text>
      <text x="140" y="334" text-anchor="middle" font-size="9">fs completo de</text>
      <text x="140" y="348" text-anchor="middle" font-size="9">debian base</text>

      <rect x="250" y="296" width="180" height="84" rx="4" stroke="currentColor" fill="none"/>
      <text x="340" y="316" text-anchor="middle" font-size="10">sha256:222…/layer.tar</text>
      <text x="340" y="334" text-anchor="middle" font-size="9">solo archivos</text>
      <text x="340" y="348" text-anchor="middle" font-size="9">que agregó apt</text>

      <rect x="450" y="296" width="180" height="84" rx="4" stroke="currentColor" fill="none"/>
      <text x="540" y="316" text-anchor="middle" font-size="10">sha256:333…/layer.tar</text>
      <text x="540" y="334" text-anchor="middle" font-size="9">solo archivos de</text>
      <text x="540" y="348" text-anchor="middle" font-size="9">python/pip</text>
    </svg>
    <figcaption>manifest.json referencia el config y cada capa por su hash sha256; esos mismos hashes son las claves de los archivos layer.tar reales dentro de layers/ — el mecanismo de direccionamiento por contenido de OCI.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'Operaciones fundamentales con imágenes',
      items: [
        '`docker pull ubuntu:22.04` — Descarga desde el registry. Solo baja las capas que no tenés localmente.',
        '`docker images` — Lista imágenes locales: nombre, tag, ID, fecha de creación y tamaño.',
        '`docker image inspect ubuntu:22.04` — JSON completo: layers, config, env, entrypoint, labels, historial.',
        '`docker image history ubuntu:22.04` — Cada capa con su tamaño, el comando que la creó y la fecha.',
        '`docker image rm ubuntu:22.04` — Borra la imagen. Falla si hay contenedores (activos o detenidos) que la usan.',
        "`docker image prune` — Elimina imágenes 'dangling' (sin tag, huérfanas de builds). `prune -a` borra todas las no usadas.",
        '`docker tag mi-imagen:latest mi-imagen:v1.2.3` — Crea un alias. No copia la imagen, solo apunta al mismo manifest.',
        '`docker save -o imagen.tar mi-imagen:v1` — Exporta imagen completa a archivo tar (útil para transferir sin registry).',
        '`docker load -i imagen.tar` — Importa imagen desde archivo tar.',
        "`docker image ls --format '{{.Repository}}:{{.Tag}} {{.Size}}'` — Output formateado con Go templates.",
      ],
    },
    {
      type: 'concepts',
      title: 'Digest vs Tag — la diferencia crítica',
      items: [
        'Un **tag** es un alias mutable: `nginx:latest` hoy puede apuntar a una imagen distinta que la de mañana.',
        'Un **digest** es inmutable: `nginx@sha256:e4f0474a5...` siempre es exactamente la misma imagen.',
        'En producción usá digests para reproducibilidad garantizada — especialmente en Kubernetes.',
        '`docker pull nginx@sha256:e4f0474a5...` — Pull por digest, 100% determinista.',
        '`docker images --digests` — Muestra el digest de cada imagen local.',
        'Estrategia profesional: en CI/CD, fijar el digest de la imagen base en el Dockerfile para builds reproducibles.',
      ],
    },
    {
      type: 'concepts',
      title: 'Imágenes multi-arquitectura',
      items: [
        'Una imagen puede tener variantes para diferentes arquitecturas: `linux/amd64`, `linux/arm64`, `linux/arm/v7`.',
        'Un manifest list (o image index) apunta a manifests específicos por arquitectura.',
        'Cuando hacés `docker pull nginx`, Docker elige automáticamente la variante correcta para tu arquitectura.',
        '`docker buildx build --platform linux/amd64,linux/arm64 -t mi-imagen .` — Build multi-arch con BuildKit.',
        'Crítico si desarrollás en Mac M1/M2 (arm64) y desplegás en servidores x86_64 (amd64).',
      ],
    },
    {
      type: 'concepts',
      title: 'Imágenes base — cuál elegir',
      items: [
        '**`ubuntu:22.04`** — Base completa con apt. Familiar pero pesada (~77MB comprimida).',
        '**`debian:bookworm-slim`** — Debian sin paquetes opcionales. Buen balance (~30MB).',
        '**`alpine:3.19`** — Basada en musl libc y BusyBox. Ultra mínima (~5MB). Cuidado con compatibilidad.',
        '**`python:3.12-slim`** — Debian slim + Python. ~50MB. Recomendada para Python.',
        '**`python:3.12-alpine`** — Alpine + Python. ~20MB. Requiere más trabajo de compilación.',
        '**`distroless`** — Solo el runtime, sin shell ni package manager. Máxima seguridad.',
        '**`scratch`** — Imagen vacía. Para binarios estáticos (Go, Rust compilado con musl).',
      ],
    },
    {
      type: 'comparison',
      title: 'Imágenes base — tamaño vs superficie de ataque',
      headers: ['Imagen base', 'Tamaño aprox.', 'Superficie de ataque'],
      rows: [
        { feature: 'ubuntu:22.04', a: '~77 MB', b: 'Alta — shell completa, apt, cientos de binarios' },
        { feature: 'debian:bookworm-slim', a: '~30 MB', b: 'Media — shell, sin paquetes opcionales' },
        {
          feature: 'alpine:3.19',
          a: '~5 MB',
          b: 'Baja — BusyBox mínimo, pero musl libc puede romper binarios glibc',
        },
        { feature: 'python:3.12-slim', a: '~50 MB', b: 'Media — runtime completo + shell' },
        {
          feature: 'gcr.io/distroless/python3',
          a: '~50 MB (sin shell)',
          b: 'Muy baja — sin shell, sin package manager, sin herramientas de debug',
        },
        {
          feature: 'scratch',
          a: '0 MB (base vacía)',
          b: 'Mínima posible — solo tu binario estático, ideal para Go/Rust',
        },
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Anatomía completa de una imagen',
      steps: [
        {
          cmd: 'docker pull python:3.12-slim',
          desc: 'Descarga la imagen. Observá cuántas capas se descargan y sus tamaños individuales.',
        },
        {
          cmd: 'docker image history python:3.12-slim --no-trunc',
          desc: 'Ve qué comando generó cada capa y su tamaño. Las capas con tamaño 0 son metadata.',
        },
        {
          cmd: 'docker image inspect python:3.12-slim | python3 -m json.tool | head -100',
          desc: 'JSON completo: RootFS.Layers (hashes de capas), Config (env, cmd, entrypoint).',
        },
        {
          cmd: "docker images python:3.12-slim --format 'Size: {{.Size}}'",
          desc: 'Tamaño total de la imagen. Nota: este es el tamaño virtual — las capas compartidas no se cuentan.',
        },
        {
          cmd: 'ls /var/lib/docker/overlay2/ | wc -l',
          desc: 'Número total de capas almacenadas en el host. Más imágenes = más capas, pero muchas son compartidas.',
        },
        {
          cmd: '# Extraer la imagen manualmente para inspeccionarla\nmkdir -p /tmp/python-img\ndocker save python:3.12-slim | tar -xC /tmp/python-img\nls /tmp/python-img\ncat /tmp/python-img/manifest.json | python3 -m json.tool',
          desc: 'Expone la estructura interna: manifest.json, config y carpetas de capas.',
        },
        {
          cmd: '# Ver qué hay dentro de una capa específica\nls /tmp/python-img/\n# Tomar el primer directorio de capa y ver su contenido:\ntar -tzf /tmp/python-img/$(ls /tmp/python-img | head -1)/layer.tar | head -30',
          desc: 'Cada capa es un tar con los archivos que esa instrucción agregó al filesystem.',
        },
        {
          cmd: "# Comparar tamaño de dos imágenes base\ndocker pull alpine:3.19\ndocker images --format '{{.Repository}}:{{.Tag}}\\t{{.Size}}' | grep -E '(python|alpine)'",
          desc: 'La diferencia de tamaño entre alpine y python-slim es significativa.',
        },
        {
          cmd: "docker images --digests python:3.12-slim --format '{{.Repository}} {{.Digest}}'",
          desc: "Verificación de reproducibilidad: este es el digest inmutable que deberías fijar en un Dockerfile o manifiesto de Kubernetes en lugar de confiar en el tag 'slim', que puede apuntar a otra imagen el mes que viene.",
        },
        {
          cmd: 'rm -rf /tmp/python-img\ndocker rmi python:3.12-slim alpine:3.19\ndocker images',
          desc: 'Limpieza final: borra los archivos extraídos en /tmp y ambas imágenes descargadas durante el laboratorio.',
        },
      ],
    },
  ],
};

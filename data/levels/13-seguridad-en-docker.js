export default {
  id: 13,
  title: 'Seguridad en Docker',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Entender los vectores de ataque más comunes en Docker y cómo mitigarlos: usuarios no-root, capabilities, seccomp, AppArmor y scanning de vulnerabilidades.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Docker no es seguro por defecto. Un contenedor mal configurado puede ser la puerta de entrada a todo el host. Root dentro del contenedor puede ser root en el host bajo ciertas condiciones. Un socket de Docker mal expuesto es equivalente a dar acceso root al servidor.

Esto no significa que Docker sea inseguro — significa que la seguridad requiere decisiones conscientes. El container escapar (container breakout) es real y ocurre cuando se acumula configuración insegura.

Entender los vectores de ataque es el primer paso para defenderlos.`,
    },
    {
      type: 'diagram',
      title: 'Superficie de ataque en Docker',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 800 640" role="img" aria-label="Seis vectores de ataque convergen sobre el host y el daemon de Docker; el socket de Docker expuesto es el más peligroso porque equivale a dar root en el host">
    <defs>
      <marker id="arrow-13a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="315" y="278" width="170" height="84" fill="none" stroke="currentColor" rx="6"/>
    <text x="400" y="316" font-size="12" text-anchor="middle">Host + dockerd</text>
    <text x="400" y="334" font-size="10" text-anchor="middle">control total si se compromete</text>

    <rect x="315" y="28" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="400" y="56" font-size="11" text-anchor="middle">Imagen comprometida</text>
    <text x="400" y="72" font-size="10" text-anchor="middle">malware / CVEs / backdoor</text>

    <rect x="575" y="138" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="660" y="166" font-size="11" text-anchor="middle">Privilegios excesivos</text>
    <text x="660" y="182" font-size="10" text-anchor="middle">--privileged / SYS_ADMIN</text>

    <rect x="575" y="438" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="660" y="466" font-size="11" text-anchor="middle">Bind mounts peligrosos</text>
    <text x="660" y="482" font-size="10" text-anchor="middle">-v /:/host</text>

    <rect x="315" y="548" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="400" y="576" font-size="11" text-anchor="middle">Secretos en la imagen</text>
    <text x="400" y="592" font-size="10" text-anchor="middle">ENV / ARG en capas</text>

    <rect x="55" y="438" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="140" y="466" font-size="11" text-anchor="middle">Red sin aislar</text>
    <text x="140" y="482" font-size="10" text-anchor="middle">todos en la bridge default</text>

    <rect class="dg-accent" x="55" y="138" width="170" height="64" fill="none" stroke="currentColor" rx="4"/>
    <text x="140" y="166" font-size="11" text-anchor="middle">Socket Docker expuesto</text>
    <text x="140" y="182" font-size="10" text-anchor="middle">= root en el host</text>

    <line x1="400" y1="92" x2="400" y2="276" stroke="currentColor" marker-end="url(#arrow-13a)"/>
    <line x1="595" y1="202" x2="470" y2="292" stroke="currentColor" marker-end="url(#arrow-13a)"/>
    <line x1="595" y1="438" x2="475" y2="352" stroke="currentColor" marker-end="url(#arrow-13a)"/>
    <line x1="400" y1="548" x2="400" y2="364" stroke="currentColor" marker-end="url(#arrow-13a)"/>
    <line x1="205" y1="438" x2="325" y2="352" stroke="currentColor" marker-end="url(#arrow-13a)"/>
    <line class="dg-accent" x1="205" y1="202" x2="325" y2="292" stroke="currentColor" marker-end="url(#arrow-13a)"/>
  </svg>
  <figcaption>Seis vectores distintos terminan en el mismo punto — el host y su daemon — y montar el socket de Docker (en cian) es el más directo: equivale a darle root.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Principio 1: Nunca corras como root',
      items: [
        'El proceso dentro del contenedor por defecto corre como root (UID 0). Si hay un container breakout, tenés root en el host.',
        'Agregá un usuario no-root al Dockerfile con `RUN adduser --system --uid 1001 appuser` y `USER appuser`.',
        '`docker run --user 1001:1001 imagen` — Sobreescribe el usuario en runtime sin modificar la imagen.',
        "Verificar: `docker exec contenedor whoami` — No debe devolver 'root'.",
        'User namespaces: mapean UID 0 del contenedor a un UID alto del host. Más aislamiento pero requiere configuración.',
        '`/etc/docker/daemon.json` con `"userns-remap": "default"` activa user namespaces globalmente.',
        'Las imágenes oficiales modernas (nginx, postgres, etc.) ya incluyen usuarios no-root — revisá su documentación.',
      ],
    },
    {
      type: 'comparison',
      title: 'Contenedor default vs contenedor hardened',
      headers: ['Aspecto', 'Default (docker run imagen)', 'Hardened'],
      rows: [
        {
          feature: 'Usuario',
          a: 'root (UID 0) salvo que la imagen lo cambie',
          b: '`--user 1001:1001`, nunca root',
        },
        {
          feature: 'Capabilities',
          a: 'Set default de Docker (~14, incluye algunas riesgosas)',
          b: '`--cap-drop=ALL --cap-add=<solo lo necesario>`',
        },
        {
          feature: 'Filesystem',
          a: 'Escribible completo',
          b: '`--read-only` + `--tmpfs` puntual para lo que sí necesita escribir',
        },
        {
          feature: 'Privilege escalation',
          a: 'Permitida por defecto (setuid binarios funcionan)',
          b: '`--security-opt no-new-privileges` la bloquea',
        },
        {
          feature: 'Recursos',
          a: 'Sin límite — puede consumir toda la RAM/CPU del host',
          b: '`--memory`, `--cpus`, `--pids-limit` acotados',
        },
        {
          feature: 'Socket de Docker',
          a: 'A veces montado "por si acaso" en CI/CD',
          b: 'Nunca montado; si se necesita, vía Docker Socket Proxy',
        },
        {
          feature: 'Superficie de syscalls',
          a: 'Perfil seccomp default (ya filtra ~44)',
          b: 'Perfil seccomp custom más restrictivo, o AppArmor/gVisor',
        },
      ],
    },
    {
      type: 'concepts',
      title: 'Principio 2: Capabilities — menor privilegio',
      body: `root en Linux no es un estado binario. Está dividido en capabilities. Los contenedores heredan un subconjunto por defecto. Podés reducirlo.`,
      items: [
        'Docker dropea todas las capabilities excepto un set mínimo por defecto. Aun así, incluye algunas peligrosas.',
        '`--cap-drop=ALL --cap-add=NET_BIND_SERVICE` — Dropa todo y agrega solo lo necesario.',
        'Capabilities peligrosas: `SYS_ADMIN` (casi root), `NET_ADMIN` (modificar red del host), `SYS_PTRACE` (debuggear procesos del host).',
        '**Nunca uses `--privileged`** en producción. Da acceso completo al host. Solo para herramientas de diagnóstico en contenedores de mantenimiento.',
        "`docker inspect contenedor --format '{{.HostConfig.CapAdd}}'` — Ve las capabilities agregadas.",
        'Capabilities mínimas necesarias: `CHOWN`, `SETUID`, `SETGID` para la mayoría de apps web. Muchas no necesitan ninguna.',
      ],
    },
    {
      type: 'code',
      title: 'Contenedor hardened — configuración completa',
      code: `# docker run con todas las opciones de seguridad
docker run \\
  --name api-segura \\
  # Usuario no-root
  --user 1001:1001 \\
  # Sin capabilities extra — solo las mínimas
  --cap-drop=ALL \\
  --cap-add=NET_BIND_SERVICE \\
  # Sin privilegios especiales
  --no-new-privileges \\
  # Filesystem de solo lectura — excepto paths específicos
  --read-only \\
  --tmpfs /tmp:size=64m,mode=1777 \\
  --tmpfs /var/run:size=10m \\
  # Sin acceso al PID namespace del host
  --pid=container:api-segura \\
  # Límites de recursos
  --memory=256m \\
  --cpus=0.5 \\
  --pids-limit=100 \\
  # Seccomp — perfil por defecto bloquea ~44 syscalls peligrosas
  --security-opt seccomp=/etc/docker/seccomp-default.json \\
  # Sin acceso al socket de Docker
  # (no montar /var/run/docker.sock)
  mi-api:latest

# ─────────────────────────────────────────────────────────

# En compose.yaml:
services:
  api:
    image: mi-api:latest
    user: "1001:1001"
    read_only: true
    tmpfs:
      - /tmp:size=64m,mode=1777
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.5'
          pids: 100`,
    },
    {
      type: 'concepts',
      title: 'Seccomp y AppArmor — filtros de syscalls',
      items: [
        '**Seccomp** (Secure Computing Mode) — Filtra qué syscalls puede hacer un proceso. Docker aplica un perfil por defecto que bloquea ~44 syscalls peligrosas.',
        'El perfil por defecto bloquea: `ptrace`, `mount`, `reboot`, `swapon`, acceso a módulos del kernel, etc.',
        '`--security-opt seccomp=unconfined` — Desactiva seccomp completamente. **No hacer en producción.**',
        'Podés crear perfiles custom en JSON basados en el perfil default de Docker (disponible en GitHub).',
        '**AppArmor** — Mandatory Access Control a nivel de proceso en el kernel. Docker aplica un perfil por defecto en distros que lo soportan (Ubuntu, Debian).',
        "`docker inspect contenedor --format '{{.HostConfig.SecurityOpt}}'` — Ver opciones de seguridad aplicadas.",
        '**gVisor** (runsc) y **Kata Containers** son alternativas que proveen mayor aislamiento a costa de performance.',
      ],
    },
    {
      type: 'concepts',
      title: 'Scanning de vulnerabilidades — no deployar a ciegas',
      items: [
        'Las imágenes base contienen paquetes con CVEs. Escanear antes de producción es obligatorio en ambientes serios.',
        '**Docker Scout** — Integrado en Docker Desktop y CLI. `docker scout cves mi-imagen:latest` lista CVEs con severidad.',
        '**Trivy** (Aqua Security) — Open source, rápido, escanea imágenes, filesystems y repos. `trivy image mi-imagen:latest`.',
        '**Snyk** — Integrable en CI/CD. `snyk container test mi-imagen:latest`.',
        '**Grype** (Anchore) — Alternativa open source rápida y precisa.',
        'Automatizá el escaneo en CI: `trivy image --exit-code 1 --severity CRITICAL mi-imagen:$TAG` falla el build si hay CVEs críticos.',
        'Reconstruí imágenes regularmente incluso sin cambios de código — las actualizaciones de seguridad de la imagen base llegan vía pull.',
        'Usá `FROM python:3.12-slim@sha256:...` (digest fijo) para builds reproducibles, pero actualizá el digest regularmente.',
      ],
    },
    {
      type: 'concepts',
      title: 'El socket de Docker — el error más peligroso',
      body: `Montar el socket de Docker en un contenedor es equivalente a darle root en el host. Es la misconfiguration más común y más peligrosa.`,
      items: [
        '**El problema**: `-v /var/run/docker.sock:/var/run/docker.sock` permite que el contenedor hable con el daemon.',
        'Desde ese contenedor: `docker run --privileged -v /:/host ubuntu chroot /host` — acceso completo al host.',
        '**Usos legítimos**: Portainer, Watchtower, CI/CD que necesitan construir imágenes (DinD). Siempre con riesgo calculado.',
        '**Alternativa para CI**: Docker-in-Docker (DinD) con `--privileged` en un contenedor aislado, o usar BuildKit en modo rootless.',
        '**Alternativa a Portainer**: UI de gestión que usen TCP con TLS mutual authentication en lugar del socket Unix.',
        'Si necesitás el socket, usá **Docker Socket Proxy** (Tecnativa) — expone solo los endpoints que necesitás con una capa de autorización.',
        'Auditá todos los compose.yaml y manifiestos buscando `/var/run/docker.sock`.',
      ],
    },
    {
      type: 'concepts',
      title: 'Secrets — nunca en la imagen',
      items: [
        '**ENV en Dockerfile**: `ENV DB_PASS=secreto` — visible en `docker inspect`, en `docker history`, en el registry.',
        '**ARG en Dockerfile**: `ARG DB_PASS` — no persiste en la imagen final, pero visible en `docker history --no-trunc` y en las capas de build.',
        'Con BuildKit: `RUN --mount=type=secret,id=db_pass cat /run/secrets/db_pass` — el secreto nunca queda en ninguna capa.',
        'En runtime: variables de entorno son visibles en `/proc/PID/environ` dentro del contenedor. Mejor que en capas, pero no ideal.',
        'Lo más seguro en runtime: leer secretos de archivos montados (Docker secrets, Kubernetes secrets como volúmenes).',
        'Escáneres de secretos en git: `truffleHog`, `gitleaks`, `detect-secrets` — integrá en pre-commit hooks.',
        'Si un secret termina en una imagen publicada: rotalo inmediatamente, no alcanza con borrar la imagen del registry (puede estar cacheada).',
      ],
    },
    {
      type: 'history',
      title: 'Incidentes reales que cambiaron cómo se piensa la seguridad en contenedores',
      items: [
        '**CVE-2019-5736 (runc)**: un contenedor malicioso podía sobrescribir el binario `runc` del host y ejecutar código como root fuera del contenedor — el container breakout más citado de la industria. Corregido, pero mostró que el runtime mismo es superficie de ataque.',
        '**Campañas de cripto-minería vía Docker API expuesta (TeamTNT y similares, desde 2019)**: escaneaban internet buscando puertos 2375/2376 (API de Docker sin TLS) abiertos y desplegaban mineros — el mismo riesgo conceptual que montar el socket sin control.',
        '**Docker Hub — imágenes públicas maliciosas**: investigaciones repetidas (2020-2021) encontraron miles de imágenes en Docker Hub con malware o mineros ocultos, muchas con nombres que imitaban proyectos populares — origen de la recomendación de usar solo imágenes oficiales o verificadas (*Docker Official Images*, *Verified Publisher*).',
        '**Adopción de cgroups v2** (kernel 4.5+, default en distros desde ~2022): mejoró el aislamiento de recursos y cerró varias formas de que un contenedor "viera" métricas o afectara a otros cgroups del host.',
        '**Rootless Docker** (estable desde Docker 20.10, 2020): el propio daemon corre como usuario sin privilegios, no solo el proceso dentro del contenedor — reduce drásticamente el impacto de un breakout, aunque con limitaciones de red y de algunos drivers de storage.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Auditando y hardening de contenedores',
      steps: [
        {
          cmd: '# Verificar usuario por defecto de una imagen\ndocker run --rm nginx:alpine whoami\ndocker run --rm postgres:16-alpine whoami',
          desc: "nginx corre como root por defecto. postgres corre como 'postgres' (no root) — buena práctica incorporada.",
        },
        {
          cmd: "# Ver capabilities de un contenedor\ndocker run --rm --name caps-test -d nginx:alpine sleep 60\ndocker inspect caps-test --format '{{.HostConfig.CapAdd}}'\ndocker inspect caps-test --format '{{.HostConfig.CapDrop}}'\ndocker rm -f caps-test",
          desc: 'Muestra las capabilities agregadas y dropeadas. Por defecto, Docker ya dropea algunas.',
        },
        {
          cmd: '# Correr nginx como non-root con cap-drop\ndocker run --rm -d \\\n  --name nginx-secure \\\n  --user 101:101 \\\n  --cap-drop=ALL \\\n  --cap-add=NET_BIND_SERVICE \\\n  --read-only \\\n  --tmpfs /var/cache/nginx:uid=101,gid=101 \\\n  --tmpfs /var/run:uid=101,gid=101 \\\n  -p 8080:8080 \\\n  nginx:alpine\ndocker exec nginx-secure whoami',
          desc: 'nginx corriendo como usuario 101 (www-data), filesystem de solo lectura, capabilities mínimas.',
        },
        {
          cmd: "# Instalar trivy y escanear\nif command -v trivy &>/dev/null; then\n  trivy image --severity HIGH,CRITICAL nginx:alpine\nelse\n  echo 'Trivy no instalado. Usando docker scout:'\n  docker scout cves nginx:alpine 2>/dev/null || echo 'Instala trivy: https://trivy.dev'\nfi",
          desc: 'Escaneo de CVEs en la imagen nginx:alpine. Alpine tiene muy pocos — por eso es popular.',
        },
        {
          cmd: "# Demostrar el peligro del socket\n# (en un entorno seguro de prueba)\ndocker run --rm \\\n  -v /var/run/docker.sock:/var/run/docker.sock \\\n  alpine sh -c 'apk add --quiet curl && curl -s --unix-socket /var/run/docker.sock http://localhost/version | head -c 200'",
          desc: 'Un contenedor con el socket puede hablar con el daemon. Desde aquí podría crear contenedores con --privileged.',
        },
        {
          cmd: "# Comparar imagen con y sin secreto en ENV\ndocker build -t con-secreto - << 'EOF'\nFROM alpine\nENV API_KEY=secreto_expuesto_en_imagen\nCMD echo hola\nEOF\ndocker history con-secreto --no-trunc | grep API_KEY",
          desc: 'El secreto es visible en el historial de la imagen — cualquiera que acceda a la imagen lo ve.',
        },
        {
          cmd: "docker rm -f nginx-secure 2>/dev/null; docker rmi con-secreto 2>/dev/null; echo 'Limpieza lista'",
          desc: 'Limpieza de los artefactos del lab.',
        },
      ],
    },
  ],
};

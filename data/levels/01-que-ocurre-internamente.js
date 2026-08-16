export default {
  id: 1,
  title: '¿Qué ocurre internamente?',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Comprender las tecnologías del kernel Linux que hacen posibles los contenedores: namespaces, cgroups y overlayfs.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Antes de tocar un solo comando, necesitás entender algo fundamental: **Docker no es magia**. No inventó nada nuevo en el kernel. Lo que hizo fue tomar tecnologías que ya existían en Linux, encapsularlas y agregarles una interfaz cómoda.

Si no entendés qué hay debajo, vas a usar Docker como una caja negra. Y cuando algo falle en producción — y va a fallar — no vas a saber por dónde empezar.

¿Por qué un contenedor puede ver solo sus propios procesos? ¿Por qué si corrés 10 contenedores no se quedan sin memoria entre sí? ¿Por qué dos contenedores basados en la misma imagen no duplican el espacio en disco? La respuesta a todo eso está en el kernel.`,
    },
    {
      type: 'diagram',
      title: 'La pila completa — de tu app al hardware',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 640 420" role="img" aria-label="La app corre sobre namespaces, cgroups y OverlayFS del contenedor, que a su vez comparten el mismo kernel y hardware del host">
      <defs>
        <marker id="arrow-01a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <rect x="120" y="16" width="400" height="44" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="43" text-anchor="middle" font-size="12">Tu aplicación (Python, Go, Node, Java…)</text>

      <line x1="320" y1="60" x2="320" y2="90" stroke="currentColor" marker-end="url(#arrow-01a)"/>

      <rect x="120" y="96" width="400" height="44" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="123" text-anchor="middle" font-size="12">Librerías del sistema (glibc, musl…)</text>

      <line x1="320" y1="140" x2="320" y2="170" stroke="currentColor" marker-end="url(#arrow-01a)"/>

      <rect class="dg-accent" x="90" y="176" width="460" height="130" rx="6" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="320" y="196" text-anchor="middle" font-size="13" fill="currentColor">Contenedor Docker</text>

      <rect x="110" y="206" width="205" height="50" rx="4" stroke="currentColor" fill="none"/>
      <text x="212" y="228" text-anchor="middle" font-size="11">Namespaces</text>
      <text x="212" y="244" text-anchor="middle" font-size="9">(aislamiento)</text>

      <rect x="325" y="206" width="205" height="50" rx="4" stroke="currentColor" fill="none"/>
      <text x="427" y="228" text-anchor="middle" font-size="11">cgroups</text>
      <text x="427" y="244" text-anchor="middle" font-size="9">(límites de recursos)</text>

      <rect x="110" y="266" width="420" height="30" rx="4" stroke="currentColor" fill="none"/>
      <text x="320" y="286" text-anchor="middle" font-size="11">OverlayFS (filesystem en capas)</text>

      <line x1="320" y1="306" x2="320" y2="336" stroke="currentColor" marker-end="url(#arrow-01a)"/>

      <rect x="120" y="342" width="400" height="38" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="366" text-anchor="middle" font-size="12">Kernel Linux (compartido con el host)</text>

      <line x1="320" y1="380" x2="320" y2="398" stroke="currentColor" marker-end="url(#arrow-01a)"/>
      <text x="320" y="415" text-anchor="middle" font-size="12">Hardware</text>
    </svg>
    <figcaption>La app y sus librerías corren dentro de un contenedor aislado por namespaces, limitado por cgroups y con su filesystem en capas vía OverlayFS — pero todo eso se ejecuta sobre el mismo kernel y hardware del host.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'Namespaces — aislamiento total',
      body: `Un namespace le da a un proceso su propia vista aislada del sistema. Los contenedores usan 7 tipos de namespaces simultáneamente:`,
      items: [
        '**PID namespace** — El contenedor tiene su propio árbol de procesos. El primer proceso del contenedor tiene PID 1 dentro del contenedor, aunque tenga PID 12345 en el host. No puede ver los procesos del host.',
        '**NET namespace** — Interfaz de red, IP, puertos, tablas de ruteo y iptables propias. El contenedor no ve las interfaces del host (eth0, lo del host). Tiene su propia eth0 virtual.',
        '**MNT namespace** — Sistema de archivos propio. El contenedor no puede ver el filesystem del host salvo que explícitamente se monte un volumen. Su raíz (/) es el filesystem de la imagen.',
        "**UTS namespace** — Hostname y domainname propios. Podés llamar 'webserver' a tu contenedor sin afectar el hostname del host.",
        '**IPC namespace** — Memoria compartida (SHM) y semáforos aislados. Un proceso del contenedor no puede comunicarse con procesos del host vía IPC.',
        '**USER namespace** — Mapeo de UIDs. root (UID 0) dentro del contenedor puede ser un usuario sin privilegios (UID 1000) en el host. Mejora la seguridad significativamente.',
        '**CGROUP namespace** — Vista aislada del árbol de cgroups. El contenedor ve solo sus propios cgroups.',
        '**TIME namespace** (Linux 5.6+) — Permite a un contenedor tener un offset de tiempo diferente al host.',
      ],
    },
    {
      type: 'concepts',
      title: 'cgroups — control de recursos',
      body: `Control Groups (cgroups) limitan, miden y aíslan el uso de recursos de un grupo de procesos. Sin cgroups, un contenedor podría consumir toda la CPU o RAM del host.`,
      items: [
        '**CPU** — `--cpus=0.5` limita a medio core equivalente. `--cpu-shares=512` asigna peso relativo cuando hay contención.',
        '**Memoria** — `--memory=256m` impide que el contenedor supere 256 MB. Si lo intenta, el kernel mata el proceso con OOM Kill (Out of Memory).',
        '**Memory swap** — `--memory-swap=512m` define el total de memoria + swap disponible.',
        '**I/O de disco** — `--device-read-bps` y `--device-write-bps` limitan el throughput de lectura/escritura.',
        '**PIDs** — `--pids-limit=100` limita el número máximo de procesos que puede crear el contenedor. Previene fork bombs.',
        '**Red** — Traffic shaping usando tc (traffic control) del kernel junto con cgroups.',
        'cgroups v2 (Linux 4.5+, activo por defecto en distribuciones modernas) unifica la jerarquía y mejora el soporte para contenedores sin root.',
      ],
    },
    {
      type: 'comparison',
      title: 'cgroups v1 vs cgroups v2',
      headers: ['Aspecto', 'cgroups v1', 'cgroups v2'],
      rows: [
        {
          feature: 'Jerarquía',
          a: 'Múltiple — un árbol por controlador (cpu, memory, blkio…)',
          b: 'Unificada — un solo árbol para todos los controladores',
        },
        {
          feature: 'Ruta típica',
          a: '/sys/fs/cgroup/memory/, /sys/fs/cgroup/cpu/',
          b: '/sys/fs/cgroup/ (unified hierarchy)',
        },
        {
          feature: 'Rootless containers',
          a: 'Soporte limitado',
          b: 'Soporte nativo, requerido por Podman rootless',
        },
        {
          feature: 'Presión de memoria (PSI)',
          a: 'No disponible',
          b: 'Disponible — métricas de presión, no solo uso',
        },
        {
          feature: 'Default en distros',
          a: 'Distros anteriores a 2021 (CentOS 7, Ubuntu 18.04)',
          b: 'Fedora 31+, Ubuntu 22.04+, Debian 11+, RHEL 9',
        },
        { feature: 'Verificación', a: '-', b: 'cat /sys/fs/cgroup/cgroup.controllers' },
      ],
    },
    {
      type: 'diagram',
      title: 'OverlayFS — filesystem en capas',
      body: `Las imágenes Docker son inmutables y están formadas por capas de solo lectura. Cuando arranca un contenedor, se agrega una capa de escritura (thin layer) encima. Esta es la clave de la eficiencia.`,
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 640 400" role="img" aria-label="Las capas de imagen de solo lectura se comparten en disco entre varios contenedores, y cada contenedor solo agrega su propia capa de escritura fina">
      <defs>
        <marker id="arrow-01b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="150" y="24" text-anchor="middle" font-size="12">Un contenedor</text>
      <rect class="dg-accent" x="30" y="34" width="240" height="40" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="150" y="54" text-anchor="middle" font-size="11" fill="currentColor">Container Layer (Read/Write)</text>
      <text x="150" y="68" text-anchor="middle" font-size="9">tus cambios en runtime</text>

      <rect x="30" y="74" width="240" height="40" stroke="currentColor" fill="none"/>
      <text x="150" y="98" text-anchor="middle" font-size="11">Image Layer 3 — COPY app /app</text>

      <rect x="30" y="114" width="240" height="40" stroke="currentColor" fill="none"/>
      <text x="150" y="138" text-anchor="middle" font-size="11">Image Layer 2 — RUN pip install</text>

      <rect x="30" y="154" width="240" height="40" stroke="currentColor" fill="none"/>
      <text x="150" y="178" text-anchor="middle" font-size="11">Image Layer 1 — RUN apt-get update</text>

      <rect x="30" y="194" width="240" height="40" stroke="currentColor" fill="none"/>
      <text x="150" y="218" text-anchor="middle" font-size="11">Image Layer 0 — FROM python:3.12-slim</text>

      <text x="480" y="24" text-anchor="middle" font-size="12">10 contenedores nginx</text>

      <rect x="330" y="40" width="60" height="34" stroke="currentColor" fill="none"/>
      <text x="360" y="61" text-anchor="middle" font-size="9">R/W A</text>
      <rect x="450" y="40" width="60" height="34" stroke="currentColor" fill="none"/>
      <text x="480" y="61" text-anchor="middle" font-size="9">R/W B</text>
      <rect x="570" y="40" width="60" height="34" stroke="currentColor" fill="none"/>
      <text x="600" y="61" text-anchor="middle" font-size="9">R/W … J</text>

      <line x1="360" y1="74" x2="360" y2="104" stroke="currentColor" marker-end="url(#arrow-01b)"/>
      <line x1="480" y1="74" x2="480" y2="104" stroke="currentColor" marker-end="url(#arrow-01b)"/>
      <line x1="600" y1="74" x2="600" y2="104" stroke="currentColor" marker-end="url(#arrow-01b)"/>

      <rect x="330" y="110" width="300" height="120" rx="6" stroke="currentColor" fill="none"/>
      <text x="480" y="132" text-anchor="middle" font-size="11">Capas de imagen (read-only)</text>
      <text x="480" y="150" text-anchor="middle" font-size="10">existen UNA sola vez en disco</text>
      <text x="480" y="168" text-anchor="middle" font-size="10">compartidas por los 10 contenedores</text>

      <rect x="330" y="180" width="300" height="34" fill="#0a0d16"/>
      <text x="480" y="202" text-anchor="middle" font-size="11">≈ 200MB total (no 10 × 200MB)</text>
    </svg>
    <figcaption>Las capas de imagen de solo lectura existen una única vez en disco y se comparten entre contenedores; cada contenedor solo agrega su propia capa de escritura fina encima.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'OverlayFS — mecanismo interno',
      items: [
        '**LowerDir** — Capas de solo lectura de la imagen. Pueden ser múltiples, apiladas.',
        '**UpperDir** — Capa de escritura del contenedor. Aquí van todos los cambios.',
        '**WorkDir** — Directorio temporal que OverlayFS usa internamente para operaciones atómicas.',
        '**MergedDir** — Vista unificada que ve el proceso del contenedor. Combina LowerDir + UpperDir.',
        'Copy-on-Write (CoW): cuando un contenedor modifica un archivo de la imagen, OverlayFS copia el archivo al UpperDir antes de modificarlo. El LowerDir nunca se toca.',
        'Al parar un contenedor, el UpperDir (y todos sus cambios) desaparece. Por eso los datos deben guardarse en volúmenes.',
        'OverlayFS es el driver por defecto desde Docker 1.12. Requiere soporte del kernel (mainline desde 3.18).',
      ],
    },
    {
      type: 'concepts',
      title: '¿Por qué importa entender esto?',
      items: [
        'Las capas de solo lectura se **comparten** entre contenedores — eficiencia de disco automática.',
        'Cuando parás un contenedor, su capa de escritura desaparece — los datos van en volúmenes.',
        'Entender capas explica por qué `docker pull` descarga solo las capas que no tenés.',
        'El orden de instrucciones en un Dockerfile importa para el tamaño de la imagen.',
        'Un `RUN apt-get clean` en una capa diferente al `RUN apt-get install` no reduce el tamaño — el cache ya está en la capa anterior.',
        'Troubleshooting: `docker inspect` te da los paths reales de LowerDir, UpperDir y MergedDir en el host.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Explorando internals del kernel',
      steps: [
        { cmd: 'docker run -d --name demo nginx:alpine', desc: 'Inicia un contenedor nginx en background.' },
        {
          cmd: "docker inspect demo --format '{{.State.Pid}}'",
          desc: 'Obtiene el PID del proceso principal del contenedor en el espacio de PIDs del host.',
        },
        {
          cmd: '# Con el PID obtenido (reemplazá 12345):\nls -la /proc/12345/ns/',
          desc: 'Lista todos los namespaces del contenedor. Verás: cgroup, ipc, mnt, net, pid, user, uts.',
        },
        {
          cmd: '# Ver que el namespace de red es diferente al del host:\nls -la /proc/1/ns/net\nls -la /proc/12345/ns/net',
          desc: 'Los inodes son diferentes — son namespaces separados.',
        },
        {
          cmd: 'cat /proc/12345/cgroup',
          desc: 'Muestra en qué cgroups está el proceso. Verás la ruta que Docker creó para este contenedor.',
        },
        {
          cmd: "docker image inspect nginx:alpine --format '{{json .RootFS.Layers}}' | python3 -m json.tool",
          desc: 'Lista los hashes SHA256 de cada capa de la imagen nginx.',
        },
        {
          cmd: "docker inspect demo --format '{{json .GraphDriver.Data}}' | python3 -m json.tool",
          desc: 'Muestra LowerDir, UpperDir, WorkDir y MergedDir del OverlayFS de este contenedor.',
        },
        {
          cmd: "# Ver el contenido de la capa de escritura (vacía antes de hacer cambios):\nls $(docker inspect demo --format '{{.GraphDriver.Data.UpperDir}}')",
          desc: 'La capa de escritura del contenedor en el filesystem del host.',
        },
        {
          cmd: "docker exec demo touch /tmp/archivo-de-prueba\nls $(docker inspect demo --format '{{.GraphDriver.Data.UpperDir}}')/tmp/",
          desc: 'Ahora el archivo aparece en UpperDir — CoW en acción.',
        },
        {
          cmd: 'docker run -d --name limite-mem --memory=50m --memory-swap=50m polinux/stress stress --vm 1 --vm-bytes 200M --vm-hang 0',
          desc: 'Lanza un contenedor con un límite de cgroup de 50 MB y un proceso que intenta reservar 200 MB — para ver el OOM Kill del kernel en acción.',
        },
        {
          cmd: "sleep 3 && docker inspect limite-mem --format 'OOMKilled={{.State.OOMKilled}} ExitCode={{.State.ExitCode}}'",
          desc: 'Verificación: OOMKilled=true confirma que cgroups detectó el exceso y el kernel mató el proceso — el límite de memoria funcionó de verdad, no es solo un número decorativo.',
        },
        {
          cmd: 'docker stop demo limite-mem 2>/dev/null; docker rm demo limite-mem',
          desc: 'Limpieza final. Las UpperDir de ambos contenedores desaparecen junto con ellos.',
        },
      ],
    },
  ],
};

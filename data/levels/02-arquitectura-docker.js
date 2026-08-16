export default {
  id: 2,
  title: 'Arquitectura Docker',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo: 'Comprender cada componente de la arquitectura Docker y cómo se comunican entre sí.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Cuando ejecutás \`docker run nginx\`, ¿qué pasa exactamente? ¿Quién recibe el comando? ¿Quién descarga la imagen? ¿Quién crea el contenedor? ¿Quién lo monitorea?

Conocer la arquitectura te permite diagnosticar dónde falla algo. Si el daemon se cayó, si el socket tiene permisos incorrectos, si containerd está trabado — sin entender la cadena, vas a reiniciar el servidor y rezar.

La arquitectura de Docker evolucionó significativamente. Docker Inc. fue desacoplando componentes para que fueran reutilizables por el ecosistema más amplio (Kubernetes, en particular).`,
    },
    {
      type: 'diagram',
      title: 'La cadena completa — cada componente y su rol',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 640 730" role="img" aria-label="El comando del usuario atraviesa CLI, daemon y containerd hasta que runc configura namespaces y cgroups y ejecuta syscalls en el kernel">
      <defs>
        <marker id="arrow-02a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="320" y="20" text-anchor="middle" font-size="12">USUARIO: docker run -d -p 8080:80 nginx</text>
      <line x1="320" y1="30" x2="320" y2="66" stroke="currentColor" marker-end="url(#arrow-02a)"/>

      <rect x="120" y="70" width="400" height="60" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="94" text-anchor="middle" font-size="13">Docker CLI (cliente)</text>
      <text x="320" y="110" text-anchor="middle" font-size="10">Parsea el comando → request HTTP REST</text>
      <text x="320" y="124" text-anchor="middle" font-size="10">POST /v1.43/containers/create + /start</text>

      <line x1="320" y1="130" x2="320" y2="172" stroke="currentColor" marker-end="url(#arrow-02a)"/>
      <rect x="128" y="142" width="384" height="16" fill="#0a0d16"/>
      <text x="320" y="154" text-anchor="middle" font-size="9">HTTP sobre unix socket · /var/run/docker.sock</text>

      <rect x="120" y="176" width="400" height="140" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="196" text-anchor="middle" font-size="13">Docker Daemon (dockerd)</text>
      <text x="320" y="212" text-anchor="middle" font-size="10">Valida request, gestiona estado, orquesta</text>

      <rect x="136" y="222" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="225" y="243" text-anchor="middle" font-size="10">Image Manager</text>
      <rect x="325" y="222" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="414" y="243" text-anchor="middle" font-size="10">Container Manager</text>
      <rect x="136" y="262" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="225" y="283" text-anchor="middle" font-size="10">Network Manager</text>
      <rect x="325" y="262" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="414" y="283" text-anchor="middle" font-size="10">Volume Manager</text>

      <line x1="320" y1="316" x2="320" y2="358" stroke="currentColor" marker-end="url(#arrow-02a)"/>
      <rect x="292" y="328" width="56" height="16" fill="#0a0d16"/>
      <text x="320" y="340" text-anchor="middle" font-size="9">gRPC</text>

      <rect x="120" y="362" width="400" height="140" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="382" text-anchor="middle" font-size="13">containerd</text>
      <text x="320" y="398" text-anchor="middle" font-size="10">Runtime de alto nivel (proyecto CNCF)</text>

      <rect x="136" y="408" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="225" y="429" text-anchor="middle" font-size="10">Snapshotter (overlay)</text>
      <rect x="325" y="408" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="414" y="429" text-anchor="middle" font-size="10">Content Store</text>
      <rect x="136" y="448" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="225" y="469" text-anchor="middle" font-size="10">Metadata (bbolt)</text>
      <rect x="325" y="448" width="179" height="34" rx="4" stroke="currentColor" fill="none"/>
      <text x="414" y="469" text-anchor="middle" font-size="10">Task Service</text>

      <line x1="320" y1="502" x2="320" y2="544" stroke="currentColor" marker-end="url(#arrow-02a)"/>
      <rect x="284" y="514" width="72" height="16" fill="#0a0d16"/>
      <text x="320" y="526" text-anchor="middle" font-size="9">execve</text>

      <rect class="dg-accent" x="120" y="548" width="400" height="70" rx="6" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="320" y="570" text-anchor="middle" font-size="13" fill="currentColor">runc (runtime de bajo nivel OCI)</text>
      <text x="320" y="586" text-anchor="middle" font-size="10">clone() con flags de namespaces + cgroups + monta OverlayFS</text>
      <text x="320" y="600" text-anchor="middle" font-size="10">ejecuta init del contenedor y termina — el contenedor sigue solo</text>

      <line x1="320" y1="618" x2="320" y2="658" stroke="currentColor" marker-end="url(#arrow-02a)"/>
      <rect x="278" y="630" width="84" height="16" fill="#0a0d16"/>
      <text x="320" y="642" text-anchor="middle" font-size="9">syscalls</text>

      <rect x="120" y="664" width="400" height="44" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="690" text-anchor="middle" font-size="13">Kernel Linux</text>
    </svg>
    <figcaption>El daemon delega la creación real del contenedor a containerd vía gRPC, containerd se lo pasa a runc, y runc configura namespaces, cgroups y OverlayFS antes de invocar clone() en el kernel — y luego termina, dejando al contenedor corriendo solo.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'Docker CLI — el cliente',
      items: [
        'El cliente que usás en la terminal. Traduce tus comandos a llamadas REST al daemon.',
        'Se comunica con el daemon vía socket Unix (`/var/run/docker.sock`) o TCP (entornos remotos).',
        'No hace nada por sí mismo — solo envía instrucciones y muestra respuestas.',
        'Podés apuntar el CLI a un daemon remoto: `DOCKER_HOST=tcp://servidor:2376 docker ps`',
        'El contexto de Docker (`docker context`) permite cambiar fácilmente entre daemons locales y remotos.',
        'El CLI puede coexistir con el daemon en distintas máquinas — diseño cliente-servidor explícito.',
      ],
    },
    {
      type: 'concepts',
      title: 'Docker Daemon (dockerd) — el corazón',
      items: [
        'Corre como servicio del sistema (systemd). PID 1 del proceso docker en el host.',
        'Gestiona el ciclo de vida completo de imágenes, contenedores, redes y volúmenes.',
        'Expone la API REST que consume el CLI. También puede exponerse vía TCP con TLS.',
        'Delega la creación real de contenedores a containerd vía gRPC.',
        'Configuración: `/etc/docker/daemon.json` — permite cambiar storage driver, registry mirrors, logging drivers.',
        'Logs del daemon: `sudo journalctl -u docker -f`',
        'Si el daemon se cae, los contenedores existentes siguen corriendo (gestionados por containerd/shim).',
      ],
    },
    {
      type: 'concepts',
      title: 'containerd — el runtime de alto nivel',
      items: [
        'Runtime de contenedores de alto nivel. Proyecto independiente bajo la CNCF (no solo de Docker).',
        'Gestiona el ciclo de vida completo: pull de imagen, snapshot de filesystem, creación, ejecución, parada y eliminación.',
        'Se comunica con dockerd vía gRPC sobre socket Unix (`/run/containerd/containerd.sock`).',
        'Kubernetes lo usa directamente (Container Runtime Interface — CRI) sin pasar por Docker.',
        'Tiene su propio CLI: `ctr` (low-level) y `nerdctl` (Docker-compatible).',
        'Cada contenedor tiene un proceso `containerd-shim` que persiste aunque dockerd se reinicie.',
      ],
    },
    {
      type: 'concepts',
      title: 'runc y el estándar OCI',
      items: [
        'runc es el runtime de bajo nivel que implementa la especificación OCI Runtime Spec.',
        'OCI (Open Container Initiative) define dos estándares: image spec (formato de imagen) y runtime spec (cómo correr un contenedor).',
        'runc recibe una especificación en JSON (config.json) y un rootfs, y llama a `clone()` del kernel.',
        'runc existe solo durante el setup del contenedor. Una vez que el proceso arranca, runc termina.',
        'Alternativas a runc: **crun** (más rápido, menos memoria, escrito en C), **gVisor** (sandbox de Google, emula syscalls), **kata-containers** (VM ligera por contenedor, mayor aislamiento).',
      ],
    },
    {
      type: 'concepts',
      title: 'El socket de Docker — punto de control crítico',
      body: `El socket Unix \`/var/run/docker.sock\` es el punto de comunicación entre el CLI y el daemon.`,
      items: [
        '**Seguridad crítica**: acceso al socket = acceso root efectivo al host. Cualquiera que pueda hablar con el socket puede montar el filesystem del host, crear contenedores privilegiados, etc.',
        'El grupo `docker` tiene permisos sobre el socket. Por eso `sudo usermod -aG docker $USER` te evita el sudo.',
        'Nunca montes `/var/run/docker.sock` en contenedores de producción sin control estricto.',
        'Podés hacer llamadas REST directamente: `curl --unix-socket /var/run/docker.sock http://localhost/v1.43/version`',
        'Docker Desktop (Mac/Windows) usa una VM Linux interna — el socket es un proxy al socket dentro de la VM.',
      ],
    },
    {
      type: 'diagram',
      title: 'Flujo de docker pull — paso a paso',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 700 480" role="img" aria-label="docker pull pasa por dockerd al registry para el manifest, y luego containerd descarga y aplica cada capa en paralelo en el snapshotter">
      <defs>
        <marker id="arrow-02b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="350" y="14" text-anchor="middle" font-size="12">docker pull python:3.12-slim</text>

      <rect x="25" y="20" width="110" height="28" rx="4" stroke="currentColor" fill="none"/>
      <text x="80" y="39" text-anchor="middle" font-size="11">CLI</text>
      <rect x="225" y="20" width="110" height="28" rx="4" stroke="currentColor" fill="none"/>
      <text x="280" y="39" text-anchor="middle" font-size="11">dockerd</text>
      <rect x="405" y="20" width="110" height="28" rx="4" stroke="currentColor" fill="none"/>
      <text x="460" y="39" text-anchor="middle" font-size="11">containerd</text>
      <rect x="585" y="20" width="110" height="28" rx="4" stroke="currentColor" fill="none"/>
      <text x="640" y="39" text-anchor="middle" font-size="11">Registry</text>

      <line x1="80" y1="50" x2="80" y2="380" stroke="currentColor" stroke-dasharray="3 4"/>
      <line x1="280" y1="50" x2="280" y2="380" stroke="currentColor" stroke-dasharray="3 4"/>
      <line x1="460" y1="50" x2="460" y2="380" stroke="currentColor" stroke-dasharray="3 4"/>
      <line x1="640" y1="50" x2="640" y2="380" stroke="currentColor" stroke-dasharray="3 4"/>

      <text x="180" y="72" text-anchor="middle" font-size="9">GET /images/create?fromImage=python</text>
      <line x1="80" y1="82" x2="280" y2="82" stroke="currentColor" marker-end="url(#arrow-02b)"/>

      <text x="460" y="127" text-anchor="middle" font-size="9">GET /v2/library/python/manifests/3.12-slim</text>
      <line x1="280" y1="137" x2="640" y2="137" stroke="currentColor" marker-end="url(#arrow-02b)"/>

      <text x="460" y="182" text-anchor="middle" font-size="9">manifest: lista de capas + hashes</text>
      <line x1="640" y1="192" x2="280" y2="192" stroke="currentColor" stroke-dasharray="3 4" marker-end="url(#arrow-02b)"/>

      <text x="370" y="237" text-anchor="middle" font-size="9">descargá estas capas</text>
      <line x1="280" y1="247" x2="460" y2="247" stroke="currentColor" marker-end="url(#arrow-02b)"/>

      <text x="550" y="292" text-anchor="middle" font-size="9">GET /v2/.../blobs/sha256:xxxx</text>
      <line x1="460" y1="302" x2="640" y2="302" stroke="currentColor" marker-end="url(#arrow-02b)"/>

      <path class="dg-accent" d="M 460,325 C 540,325 540,360 462,360" stroke="currentColor" fill="none" marker-end="url(#arrow-02b)"/>
      <text class="dg-accent" x="560" y="345" text-anchor="middle" font-size="9" fill="currentColor">descarga en paralelo</text>
      <text x="560" y="359" text-anchor="middle" font-size="9">y aplica en snapshotter</text>

      <rect x="30" y="390" width="640" height="70" rx="6" stroke="currentColor" fill="none"/>
      <text x="350" y="410" text-anchor="middle" font-size="12">Imagen disponible localmente</text>
      <text x="350" y="428" text-anchor="middle" font-size="10">/var/lib/docker/overlay2/ ← capas individuales</text>
      <text x="350" y="444" text-anchor="middle" font-size="10">/var/lib/docker/image/ ← metadata e índice</text>
    </svg>
    <figcaption>dockerd pide el manifest al registry, delega la descarga a containerd, y containerd baja en paralelo solo las capas que faltan y las aplica en el snapshotter overlayfs.</figcaption>
  </figure>`,
    },
    {
      type: 'comparison',
      title: 'Docker vs Podman vs containerd standalone',
      headers: ['Aspecto', 'Docker', 'Podman'],
      rows: [
        {
          feature: 'Arquitectura',
          a: 'Cliente-servidor con daemon central (dockerd)',
          b: 'Sin daemon — cada comando es un proceso fork/exec directo',
        },
        {
          feature: 'Punto único de falla',
          a: 'Sí — si dockerd muere, el CLI no responde (los contenedores siguen vivos vía shim)',
          b: 'No — no hay proceso central que pueda caerse',
        },
        {
          feature: 'Rootless por defecto',
          a: 'Posible pero no es el modo por defecto',
          b: 'Sí, diseñado rootless desde el día uno',
        },
        {
          feature: 'Compatibilidad CLI',
          a: 'Referencia del ecosistema',
          b: "Alias 'docker' compatible casi 1:1 (mismos flags)",
        },
        {
          feature: 'Pods nativos',
          a: 'No — concepto exclusivo de Kubernetes',
          b: "Sí — 'podman pod' agrupa contenedores como en K8s",
        },
        {
          feature: 'Compose',
          a: 'docker compose (plugin oficial, usa Compose Spec)',
          b: 'podman-compose (traduce a comandos podman) o compose nativo desde Podman 4+',
        },
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Explorando la arquitectura en profundidad',
      steps: [
        {
          cmd: 'systemctl status docker\nsystemctl status containerd',
          desc: 'Verifica que ambos servicios están corriendo y su estado de salud.',
        },
        {
          cmd: 'curl --unix-socket /var/run/docker.sock http://localhost/version | python3 -m json.tool',
          desc: 'Llama a la API REST directamente sin el CLI. El daemon responde JSON con versión, OS, arquitectura.',
        },
        {
          cmd: 'curl --unix-socket /var/run/docker.sock http://localhost/containers/json | python3 -m json.tool',
          desc: "Lista contenedores corriendo directamente via REST. Equivale a 'docker ps'.",
        },
        {
          cmd: 'ls -la /run/containerd/containerd.sock',
          desc: 'El socket de containerd, separado del de dockerd. Kubernetes accede directamente a este.',
        },
        {
          cmd: 'sudo ctr version\nsudo ctr containers list\nsudo ctr images list',
          desc: 'CLI nativo de containerd. Muestra versión, contenedores e imágenes desde la perspectiva de containerd.',
        },
        {
          cmd: "cat /etc/docker/daemon.json 2>/dev/null || echo 'No existe — usando valores por defecto'",
          desc: 'Archivo de configuración principal. Aquí se configura storage driver, log driver, registry mirrors.',
        },
        {
          cmd: 'sudo journalctl -u docker --no-pager -n 30',
          desc: 'Últimas 30 líneas de logs del daemon. Útil para diagnóstico de problemas de arranque.',
        },
        {
          cmd: '# Ver el proceso shim de un contenedor:\ndocker run -d --name test nginx:alpine\nps aux | grep shim',
          desc: 'Cada contenedor tiene un proceso containerd-shim que persiste aunque dockerd se reinicie.',
        },
        {
          cmd: 'sudo systemctl restart docker\ndocker ps --filter name=test',
          desc: "Verificación clave: reiniciás dockerd y el contenedor 'test' sigue corriendo (Up) — containerd + shim lo mantuvieron vivo, dockerd solo se reconectó al reiniciar.",
        },
        {
          cmd: 'docker stop test && docker rm test',
          desc: 'Limpieza. Elimina el contenedor de prueba usado para verificar el proceso shim.',
        },
      ],
    },
  ],
};

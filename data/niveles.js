export const niveles = [
  {
    id: 0,
    title: "Introducción",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender qué es Docker, qué problema resuelve y cómo se posiciona frente a otras tecnologías.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Imaginá que terminaste de desarrollar tu aplicación. Funciona perfectamente en tu máquina. La desplegás en el servidor de producción… y no arranca. El error dice que falta una librería. O que la versión de Python es distinta. O que una variable de entorno no existe.

Este problema tiene nombre: *"works on my machine"*. Y destruyó releases, atrasó proyectos y quemó a miles de equipos durante décadas.

El problema no es solo el deploy inicial. Es cada vez que un developer nuevo clona el repo, cada vez que migrás a un servidor nuevo, cada vez que actualizás una dependencia sin querer romper otra. El entorno de ejecución es tan parte de la aplicación como el código mismo.`
      },
      {
        type: "analogy",
        title: "La analogía del contenedor de barco",
        body: `Antes de los contenedores estandarizados, cada mercancía se cargaba de forma diferente: bolsas, cajones, fardos. Los puertos necesitaban trabajadores especializados para cada tipo. Era lento, caro e impredecible.

Con los contenedores estandarizados, da igual si adentro hay bananas, electrónica o ropa. El barco, el camión y la grúa saben exactamente cómo manejarlo. El contenedor es la interfaz estándar.

Docker hace lo mismo con el software: empaqueta tu aplicación + sus dependencias + su configuración + su entorno de ejecución en una unidad estándar que corre igual en cualquier máquina que tenga Docker instalado. Tu laptop, el servidor de CI, el servidor de staging, producción — todos ven exactamente el mismo contenedor.`
      },
      {
        type: "concepts",
        title: "¿Qué es Docker?",
        items: [
          "Docker es una plataforma de contenedores que empaqueta aplicaciones con todo lo que necesitan para correr.",
          "Un contenedor es un proceso aislado que comparte el kernel del sistema operativo anfitrión pero tiene su propio filesystem, red y espacio de procesos.",
          "A diferencia de una VM, no virtualiza hardware. No tiene su propio kernel. Es más liviano, arranca en milisegundos y usa menos RAM.",
          "Docker estandarizó los contenedores Linux y creó el ecosistema: CLI, registry, compose, swarm y más.",
          "Detrás de escena usa tecnologías del kernel Linux que ya existían: namespaces, cgroups y union filesystems.",
          "Docker Inc. fue fundada en 2013. La tecnología fue open-sourceada desde el primer día.",
          "Hoy el runtime subyacente (containerd) es independiente de Docker y lo usa Kubernetes directamente.",
          "El formato de imagen OCI (Open Container Initiative) es un estándar abierto — no estás atado a Docker."
        ]
      },
      {
        type: "comparison",
        title: "Docker vs VMs vs bare metal",
        rows: [
          { feature: "Arranque", vm: "Minutos (boot de OS)", docker: "Milisegundos (proceso)" },
          { feature: "Tamaño", vm: "GB (OS completo)", docker: "MB (solo diferencias)" },
          { feature: "Aislamiento", vm: "Completo (hardware virtualizado)", docker: "Proceso (kernel compartido)" },
          { feature: "Portabilidad", vm: "Media (depende del hypervisor)", docker: "Alta (cualquier host Linux/Mac/Win)" },
          { feature: "Overhead de RAM", vm: "Alto (OS por VM)", docker: "Mínimo (solo el proceso)" },
          { feature: "Ecosistema", vm: "VMware, VirtualBox, KVM", docker: "Docker Hub, Compose, K8s, GHCR" },
          { feature: "Seguridad", vm: "Mayor aislamiento", docker: "Menor (kernel compartido)" },
          { feature: "Reproducibilidad", vm: "Media", docker: "Alta (imagen inmutable)" }
        ]
      },
      {
        type: "history",
        title: "Historia y evolución",
        items: [
          "**2006** — Google introduce cgroups en el kernel Linux 2.6.24 para limitar recursos de procesos.",
          "**2008** — Linux Containers (LXC) aparece: primer sistema completo de contenedores en Linux usando namespaces + cgroups.",
          "**2013** — Solomon Hykes presenta Docker en PyCon. Open source desde el primer día. Usa LXC inicialmente.",
          "**2014** — Docker 1.0. Adopción masiva en la industria. Docker reemplaza LXC con su propio runtime (libcontainer).",
          "**2015** — Open Container Initiative (OCI): Google, Docker, CoreOS y otros crean estándares abiertos para runtimes e imágenes.",
          "**2016** — Docker Inc. separa containerd como proyecto independiente donado a la CNCF.",
          "**2017** — Kubernetes adopta containerd como runtime. Docker Swarm pierde la guerra de orquestadores.",
          "**2019** — Docker Desktop para Mac y Windows se vuelve el estándar para desarrollo local.",
          "**2020** — Docker Hub introduce límites de pull rate para usuarios gratuitos. Surge GHCR como alternativa.",
          "**2022** — Docker Desktop requiere suscripción para empresas grandes. Alternativas como Podman ganan tracción.",
          "**2024** — El ecosistema incluye Podman, containerd, nerdctl, Lima como alternativas compatibles con OCI."
        ]
      },
      {
        type: "diagram",
        title: "Arquitectura general — la cadena completa",
        diagram: `Tu comando: docker run nginx
         │
         ▼
  Docker CLI (cliente)
         │  REST API sobre Unix socket
         │  /var/run/docker.sock
         ▼
  Docker Daemon (dockerd)
         │  gestiona: imágenes, contenedores, redes, volúmenes
         │  gRPC
         ▼
    containerd
         │  runtime de alto nivel
         ├── snapshotter (overlayfs) ── gestiona capas de filesystem
         ├── content store ──────────── almacena imágenes
         └── task service
               │
               ▼
            runc
               │  runtime de bajo nivel (OCI)
               │  llama a clone() del kernel
               ▼
         Kernel Linux
         ├── namespaces (aislamiento)
         ├── cgroups (límites de recursos)
         └── OverlayFS (filesystem en capas)`
      },
      {
        type: "concepts",
        title: "Conceptos clave antes de empezar",
        items: [
          "**Imagen** — Snapshot inmutable de un filesystem + configuración. Como un template.",
          "**Contenedor** — Instancia en ejecución de una imagen. Como un proceso con su propio entorno.",
          "**Dockerfile** — Receta para construir una imagen. Serie de instrucciones en texto plano.",
          "**Registry** — Servidor que almacena y distribuye imágenes. Docker Hub es el público por defecto.",
          "**Layer** — Cada instrucción del Dockerfile crea una capa inmutable. Las capas se comparten entre imágenes.",
          "**Volume** — Almacenamiento persistente externo al contenedor. Los datos sobreviven al ciclo de vida del contenedor.",
          "**Network** — Red virtual que conecta contenedores entre sí y con el exterior.",
          "**Compose** — Herramienta para definir y correr aplicaciones multi-contenedor con un archivo YAML."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Instalación y primer contenedor",
        steps: [
          { cmd: "uname -r", desc: "Verifica la versión del kernel. Docker requiere 3.10+ en Linux. Kernels modernos (5.x, 6.x) tienen todas las features." },
          { cmd: "sudo dnf -y install dnf-plugins-core\nsudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo\nsudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin", desc: "Instala Docker Engine en Fedora/RHEL. Para Ubuntu usar apt y el repo de Ubuntu." },
          { cmd: "sudo systemctl enable --now docker", desc: "Habilita Docker como servicio del sistema e inicia inmediatamente." },
          { cmd: "sudo usermod -aG docker $USER", desc: "Agrega tu usuario al grupo 'docker' para no necesitar sudo en cada comando. Requiere cerrar y volver a abrir sesión." },
          { cmd: "docker version", desc: "Muestra versiones del cliente y del servidor (daemon). Verifica que la comunicación funciona." },
          { cmd: "docker info", desc: "Información detallada del daemon: storage driver, runtimes, número de contenedores e imágenes, configuración de red." },
          { cmd: "docker run hello-world", desc: "El contenedor oficial de prueba. Descarga la imagen, crea el contenedor, corre el proceso y muestra un mensaje. Si ves el mensaje de éxito, Docker funciona correctamente." },
          { cmd: "docker run -it ubuntu:22.04 bash", desc: "Corre Ubuntu interactivo. -i mantiene stdin abierto, -t asigna un pseudo-TTY. Escribí 'exit' para salir. El contenedor se detiene cuando el proceso bash termina." }
        ]
      }
    ]
  },
  {
    id: 1,
    title: "¿Qué ocurre internamente?",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Comprender las tecnologías del kernel Linux que hacen posibles los contenedores: namespaces, cgroups y overlayfs.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Antes de tocar un solo comando, necesitás entender algo fundamental: **Docker no es magia**. No inventó nada nuevo en el kernel. Lo que hizo fue tomar tecnologías que ya existían en Linux, encapsularlas y agregarles una interfaz cómoda.

Si no entendés qué hay debajo, vas a usar Docker como una caja negra. Y cuando algo falle en producción — y va a fallar — no vas a saber por dónde empezar.

¿Por qué un contenedor puede ver solo sus propios procesos? ¿Por qué si corrés 10 contenedores no se quedan sin memoria entre sí? ¿Por qué dos contenedores basados en la misma imagen no duplican el espacio en disco? La respuesta a todo eso está en el kernel.`
      },
      {
        type: "diagram",
        title: "La pila completa — de tu app al hardware",
        diagram: `Tu aplicación (Python, Go, Node, Java…)
        │
        ▼
   Librerías del sistema (glibc, musl, etc.)
        │
        ▼
   Contenedor Docker
   ┌────────────────────────────────────────┐
   │  Namespaces    │  cgroups              │
   │  (aislamiento) │  (límites recursos)   │
   │                │                       │
   │  OverlayFS (filesystem en capas)       │
   └────────────────────────────────────────┘
        │
        ▼
   Kernel Linux (compartido con el host)
        │
        ▼
      Hardware`
      },
      {
        type: "concepts",
        title: "Namespaces — aislamiento total",
        body: `Un namespace le da a un proceso su propia vista aislada del sistema. Los contenedores usan 7 tipos de namespaces simultáneamente:`,
        items: [
          "**PID namespace** — El contenedor tiene su propio árbol de procesos. El primer proceso del contenedor tiene PID 1 dentro del contenedor, aunque tenga PID 12345 en el host. No puede ver los procesos del host.",
          "**NET namespace** — Interfaz de red, IP, puertos, tablas de ruteo y iptables propias. El contenedor no ve las interfaces del host (eth0, lo del host). Tiene su propia eth0 virtual.",
          "**MNT namespace** — Sistema de archivos propio. El contenedor no puede ver el filesystem del host salvo que explícitamente se monte un volumen. Su raíz (/) es el filesystem de la imagen.",
          "**UTS namespace** — Hostname y domainname propios. Podés llamar 'webserver' a tu contenedor sin afectar el hostname del host.",
          "**IPC namespace** — Memoria compartida (SHM) y semáforos aislados. Un proceso del contenedor no puede comunicarse con procesos del host vía IPC.",
          "**USER namespace** — Mapeo de UIDs. root (UID 0) dentro del contenedor puede ser un usuario sin privilegios (UID 1000) en el host. Mejora la seguridad significativamente.",
          "**CGROUP namespace** — Vista aislada del árbol de cgroups. El contenedor ve solo sus propios cgroups.",
          "**TIME namespace** (Linux 5.6+) — Permite a un contenedor tener un offset de tiempo diferente al host."
        ]
      },
      {
        type: "concepts",
        title: "cgroups — control de recursos",
        body: `Control Groups (cgroups) limitan, miden y aíslan el uso de recursos de un grupo de procesos. Sin cgroups, un contenedor podría consumir toda la CPU o RAM del host.`,
        items: [
          "**CPU** — `--cpus=0.5` limita a medio core equivalente. `--cpu-shares=512` asigna peso relativo cuando hay contención.",
          "**Memoria** — `--memory=256m` impide que el contenedor supere 256 MB. Si lo intenta, el kernel mata el proceso con OOM Kill (Out of Memory).",
          "**Memory swap** — `--memory-swap=512m` define el total de memoria + swap disponible.",
          "**I/O de disco** — `--device-read-bps` y `--device-write-bps` limitan el throughput de lectura/escritura.",
          "**PIDs** — `--pids-limit=100` limita el número máximo de procesos que puede crear el contenedor. Previene fork bombs.",
          "**Red** — Traffic shaping usando tc (traffic control) del kernel junto con cgroups.",
          "cgroups v2 (Linux 4.5+, activo por defecto en distribuciones modernas) unifica la jerarquía y mejora el soporte para contenedores sin root."
        ]
      },
      {
        type: "diagram",
        title: "OverlayFS — filesystem en capas",
        body: `Las imágenes Docker son inmutables y están formadas por capas de solo lectura. Cuando arranca un contenedor, se agrega una capa de escritura (thin layer) encima. Esta es la clave de la eficiencia.`,
        diagram: `┌─────────────────────────────────────────┐
│   Container Layer (Read/Write)          │  ← tus cambios en runtime
│   /var/lib/docker/overlay2/xxx/diff/    │
├─────────────────────────────────────────┤
│   Image Layer 3: COPY app /app          │  ← solo lectura, compartida
├─────────────────────────────────────────┤
│   Image Layer 2: RUN pip install -r ... │  ← solo lectura, compartida
├─────────────────────────────────────────┤
│   Image Layer 1: RUN apt-get update ... │  ← solo lectura, compartida
├─────────────────────────────────────────┤
│   Image Layer 0: FROM python:3.12-slim  │  ← solo lectura, compartida
└─────────────────────────────────────────┘

Si 10 contenedores usan la misma imagen base:
- Las capas de solo lectura existen UNA sola vez en disco
- Cada contenedor tiene SU PROPIA capa de escritura (thin)
- Ahorro de espacio: 10 contenedores nginx = ~200MB (no 10x200MB)`
      },
      {
        type: "concepts",
        title: "OverlayFS — mecanismo interno",
        items: [
          "**LowerDir** — Capas de solo lectura de la imagen. Pueden ser múltiples, apiladas.",
          "**UpperDir** — Capa de escritura del contenedor. Aquí van todos los cambios.",
          "**WorkDir** — Directorio temporal que OverlayFS usa internamente para operaciones atómicas.",
          "**MergedDir** — Vista unificada que ve el proceso del contenedor. Combina LowerDir + UpperDir.",
          "Copy-on-Write (CoW): cuando un contenedor modifica un archivo de la imagen, OverlayFS copia el archivo al UpperDir antes de modificarlo. El LowerDir nunca se toca.",
          "Al parar un contenedor, el UpperDir (y todos sus cambios) desaparece. Por eso los datos deben guardarse en volúmenes.",
          "OverlayFS es el driver por defecto desde Docker 1.12. Requiere soporte del kernel (mainline desde 3.18)."
        ]
      },
      {
        type: "concepts",
        title: "¿Por qué importa entender esto?",
        items: [
          "Las capas de solo lectura se **comparten** entre contenedores — eficiencia de disco automática.",
          "Cuando parás un contenedor, su capa de escritura desaparece — los datos van en volúmenes.",
          "Entender capas explica por qué `docker pull` descarga solo las capas que no tenés.",
          "El orden de instrucciones en un Dockerfile importa para el tamaño de la imagen.",
          "Un `RUN apt-get clean` en una capa diferente al `RUN apt-get install` no reduce el tamaño — el cache ya está en la capa anterior.",
          "Troubleshooting: `docker inspect` te da los paths reales de LowerDir, UpperDir y MergedDir en el host."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Explorando internals del kernel",
        steps: [
          { cmd: "docker run -d --name demo nginx:alpine", desc: "Inicia un contenedor nginx en background." },
          { cmd: "docker inspect demo --format '{{.State.Pid}}'", desc: "Obtiene el PID del proceso principal del contenedor en el espacio de PIDs del host." },
          { cmd: "# Con el PID obtenido (reemplazá 12345):\nls -la /proc/12345/ns/", desc: "Lista todos los namespaces del contenedor. Verás: cgroup, ipc, mnt, net, pid, user, uts." },
          { cmd: "# Ver que el namespace de red es diferente al del host:\nls -la /proc/1/ns/net\nls -la /proc/12345/ns/net", desc: "Los inodes son diferentes — son namespaces separados." },
          { cmd: "cat /proc/12345/cgroup", desc: "Muestra en qué cgroups está el proceso. Verás la ruta que Docker creó para este contenedor." },
          { cmd: "docker image inspect nginx:alpine --format '{{json .RootFS.Layers}}' | python3 -m json.tool", desc: "Lista los hashes SHA256 de cada capa de la imagen nginx." },
          { cmd: "docker inspect demo --format '{{json .GraphDriver.Data}}' | python3 -m json.tool", desc: "Muestra LowerDir, UpperDir, WorkDir y MergedDir del OverlayFS de este contenedor." },
          { cmd: "# Ver el contenido de la capa de escritura (vacía antes de hacer cambios):\nls $(docker inspect demo --format '{{.GraphDriver.Data.UpperDir}}')", desc: "La capa de escritura del contenedor en el filesystem del host." },
          { cmd: "docker exec demo touch /tmp/archivo-de-prueba\nls $(docker inspect demo --format '{{.GraphDriver.Data.UpperDir}}')/tmp/", desc: "Ahora el archivo aparece en UpperDir — CoW en acción." },
          { cmd: "docker stop demo && docker rm demo", desc: "Limpieza. La UpperDir desaparece junto con el contenedor." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Arquitectura Docker",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Comprender cada componente de la arquitectura Docker y cómo se comunican entre sí.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Cuando ejecutás \`docker run nginx\`, ¿qué pasa exactamente? ¿Quién recibe el comando? ¿Quién descarga la imagen? ¿Quién crea el contenedor? ¿Quién lo monitorea?

Conocer la arquitectura te permite diagnosticar dónde falla algo. Si el daemon se cayó, si el socket tiene permisos incorrectos, si containerd está trabado — sin entender la cadena, vas a reiniciar el servidor y rezar.

La arquitectura de Docker evolucionó significativamente. Docker Inc. fue desacoplando componentes para que fueran reutilizables por el ecosistema más amplio (Kubernetes, en particular).`
      },
      {
        type: "diagram",
        title: "La cadena completa — cada componente y su rol",
        diagram: `╔══════════════════════════════════════════════════════╗
║  USUARIO                                             ║
║  docker run -d -p 8080:80 nginx                      ║
╚══════════════════════╤═══════════════════════════════╝
                       │
                       ▼
╔══════════════════════════════════════════════════════╗
║  DOCKER CLI (cliente)                                ║
║  Parsea el comando → construye request HTTP REST     ║
║  POST /v1.43/containers/create + /start              ║
╚══════════════════════╤═══════════════════════════════╝
                       │ HTTP sobre Unix socket
                       │ /var/run/docker.sock
                       ▼
╔══════════════════════════════════════════════════════╗
║  DOCKER DAEMON (dockerd)                             ║
║  Valida request, gestiona estado, orquesta           ║
║  ├── Image Manager (pull/push/build)                 ║
║  ├── Container Manager (lifecycle)                   ║
║  ├── Network Manager (bridge/overlay)                ║
║  └── Volume Manager (named/bind/tmpfs)               ║
╚══════════════════════╤═══════════════════════════════╝
                       │ gRPC
                       ▼
╔══════════════════════════════════════════════════════╗
║  CONTAINERD                                          ║
║  Runtime de alto nivel (CNCF project)                ║
║  ├── Snapshotter (OverlayFS)                         ║
║  ├── Content Store (layers en disco)                 ║
║  ├── Metadata Store (bbolt DB)                       ║
║  └── Task Service (lifecycle de contenedores)        ║
╚══════════════════════╤═══════════════════════════════╝
                       │ execve
                       ▼
╔══════════════════════════════════════════════════════╗
║  RUNC (OCI runtime)                                  ║
║  Llama a clone() con flags de namespaces             ║
║  Configura cgroups, monta OverlayFS                  ║
║  Ejecuta el proceso de init del contenedor           ║
║  (runc termina después — el contenedor sigue solo)   ║
╚══════════════════════╤═══════════════════════════════╝
                       │ syscalls
                       ▼
              Kernel Linux`
      },
      {
        type: "concepts",
        title: "Docker CLI — el cliente",
        items: [
          "El cliente que usás en la terminal. Traduce tus comandos a llamadas REST al daemon.",
          "Se comunica con el daemon vía socket Unix (`/var/run/docker.sock`) o TCP (entornos remotos).",
          "No hace nada por sí mismo — solo envía instrucciones y muestra respuestas.",
          "Podés apuntar el CLI a un daemon remoto: `DOCKER_HOST=tcp://servidor:2376 docker ps`",
          "El contexto de Docker (`docker context`) permite cambiar fácilmente entre daemons locales y remotos.",
          "El CLI puede coexistir con el daemon en distintas máquinas — diseño cliente-servidor explícito."
        ]
      },
      {
        type: "concepts",
        title: "Docker Daemon (dockerd) — el corazón",
        items: [
          "Corre como servicio del sistema (systemd). PID 1 del proceso docker en el host.",
          "Gestiona el ciclo de vida completo de imágenes, contenedores, redes y volúmenes.",
          "Expone la API REST que consume el CLI. También puede exponerse vía TCP con TLS.",
          "Delega la creación real de contenedores a containerd vía gRPC.",
          "Configuración: `/etc/docker/daemon.json` — permite cambiar storage driver, registry mirrors, logging drivers.",
          "Logs del daemon: `sudo journalctl -u docker -f`",
          "Si el daemon se cae, los contenedores existentes siguen corriendo (gestionados por containerd/shim)."
        ]
      },
      {
        type: "concepts",
        title: "containerd — el runtime de alto nivel",
        items: [
          "Runtime de contenedores de alto nivel. Proyecto independiente bajo la CNCF (no solo de Docker).",
          "Gestiona el ciclo de vida completo: pull de imagen, snapshot de filesystem, creación, ejecución, parada y eliminación.",
          "Se comunica con dockerd vía gRPC sobre socket Unix (`/run/containerd/containerd.sock`).",
          "Kubernetes lo usa directamente (Container Runtime Interface — CRI) sin pasar por Docker.",
          "Tiene su propio CLI: `ctr` (low-level) y `nerdctl` (Docker-compatible).",
          "Cada contenedor tiene un proceso `containerd-shim` que persiste aunque dockerd se reinicie."
        ]
      },
      {
        type: "concepts",
        title: "runc y el estándar OCI",
        items: [
          "runc es el runtime de bajo nivel que implementa la especificación OCI Runtime Spec.",
          "OCI (Open Container Initiative) define dos estándares: image spec (formato de imagen) y runtime spec (cómo correr un contenedor).",
          "runc recibe una especificación en JSON (config.json) y un rootfs, y llama a `clone()` del kernel.",
          "runc existe solo durante el setup del contenedor. Una vez que el proceso arranca, runc termina.",
          "Alternativas a runc: **crun** (más rápido, menos memoria, escrito en C), **gVisor** (sandbox de Google, emula syscalls), **kata-containers** (VM ligera por contenedor, mayor aislamiento)."
        ]
      },
      {
        type: "concepts",
        title: "El socket de Docker — punto de control crítico",
        body: `El socket Unix \`/var/run/docker.sock\` es el punto de comunicación entre el CLI y el daemon.`,
        items: [
          "**Seguridad crítica**: acceso al socket = acceso root efectivo al host. Cualquiera que pueda hablar con el socket puede montar el filesystem del host, crear contenedores privilegiados, etc.",
          "El grupo `docker` tiene permisos sobre el socket. Por eso `sudo usermod -aG docker $USER` te evita el sudo.",
          "Nunca montes `/var/run/docker.sock` en contenedores de producción sin control estricto.",
          "Podés hacer llamadas REST directamente: `curl --unix-socket /var/run/docker.sock http://localhost/v1.43/version`",
          "Docker Desktop (Mac/Windows) usa una VM Linux interna — el socket es un proxy al socket dentro de la VM."
        ]
      },
      {
        type: "diagram",
        title: "Flujo de docker pull — paso a paso",
        diagram: `docker pull python:3.12-slim
        │
        ▼
CLI → dockerd: GET /images/create?fromImage=python&tag=3.12-slim
        │
        ▼
dockerd → Docker Hub registry: GET /v2/library/python/manifests/3.12-slim
        │
        ▼
Registry devuelve el manifest (lista de capas con sus hashes)
        │
        ▼
dockerd → containerd: descargá estas capas
        │
        ▼
containerd descarga cada capa en paralelo (si no las tiene ya)
Cada capa: GET /v2/library/python/blobs/sha256:xxxx
        │
        ▼
containerd descomprime y aplica cada capa en el snapshotter
        │
        ▼
Imagen disponible localmente
/var/lib/docker/overlay2/  ← capas individuales
/var/lib/docker/image/     ← metadata e índice`
      },
      {
        type: "lab",
        title: "Laboratorio: Explorando la arquitectura en profundidad",
        steps: [
          { cmd: "systemctl status docker\nsystemctl status containerd", desc: "Verifica que ambos servicios están corriendo y su estado de salud." },
          { cmd: "curl --unix-socket /var/run/docker.sock http://localhost/version | python3 -m json.tool", desc: "Llama a la API REST directamente sin el CLI. El daemon responde JSON con versión, OS, arquitectura." },
          { cmd: "curl --unix-socket /var/run/docker.sock http://localhost/containers/json | python3 -m json.tool", desc: "Lista contenedores corriendo directamente via REST. Equivale a 'docker ps'." },
          { cmd: "ls -la /run/containerd/containerd.sock", desc: "El socket de containerd, separado del de dockerd. Kubernetes accede directamente a este." },
          { cmd: "sudo ctr version\nsudo ctr containers list\nsudo ctr images list", desc: "CLI nativo de containerd. Muestra versión, contenedores e imágenes desde la perspectiva de containerd." },
          { cmd: "cat /etc/docker/daemon.json 2>/dev/null || echo 'No existe — usando valores por defecto'", desc: "Archivo de configuración principal. Aquí se configura storage driver, log driver, registry mirrors." },
          { cmd: "sudo journalctl -u docker --no-pager -n 30", desc: "Últimas 30 líneas de logs del daemon. Útil para diagnóstico de problemas de arranque." },
          { cmd: "# Ver el proceso shim de un contenedor:\ndocker run -d --name test nginx:alpine\nps aux | grep shim", desc: "Cada contenedor tiene un proceso containerd-shim que persiste aunque dockerd se reinicie." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Imágenes",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender qué es una imagen Docker, cómo está construida internamente y cómo gestionar el ciclo de vida de imágenes.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Una imagen Docker no es un archivo único ni un ZIP. Tiene una estructura interna sofisticada que hace posible la reutilización, el versionado y la distribución eficiente.

Si no entendés esa estructura, no podés optimizar tamaños, ni entender por qué un pull tarda lo que tarda, ni debuggear problemas de filesystem, ni saber si tu imagen de 2 GB es evitable.

Las imágenes son inmutables. Eso es una feature, no un bug. Significa que la imagen que testeaste es exactamente la misma que va a producción.`
      },
      {
        type: "analogy",
        title: "La analogía de las capas",
        body: `Una imagen es como una pila de acetatos transparentes. Cada acetato agrega algo encima del anterior. Para ver el resultado final, mirás a través de todos los acetatos apilados.

El acetato de abajo es la imagen base (Ubuntu, Alpine, etc.). Encima hay uno con las librerías del sistema. Encima otro con las dependencias de tu app. Y arriba de todo, el código de tu aplicación.

Cuando hacés un cambio en el código, solo reemplazás el acetato de arriba. Los de abajo se reutilizan. Eso es por qué un segundo build es tan rápido y un segundo pull solo descarga las capas que cambiaron.`
      },
      {
        type: "diagram",
        title: "Estructura interna de una imagen OCI",
        diagram: `imagen: python:3.12-slim
│
├── manifest.json (índice principal)
│     ├── config digest: sha256:abc...
│     └── layers:
│           ├── sha256:111... → layer 0 (debian:bookworm-slim base)
│           ├── sha256:222... → layer 1 (apt install python3)
│           └── sha256:333... → layer 2 (pip install y setup)
│
├── config (sha256:abc...)
│     ├── architecture: amd64
│     ├── os: linux
│     ├── env: [PYTHON_VERSION=3.12.0, PATH=...]
│     ├── cmd: ["python3"]
│     ├── workdir: ""
│     └── history: [comandos que generaron cada capa]
│
└── layers/
      ├── sha256:111.../layer.tar  (filesystem completo de debian base)
      ├── sha256:222.../layer.tar  (solo los archivos que agregó apt)
      └── sha256:333.../layer.tar  (solo los archivos de python/pip)`
      },
      {
        type: "concepts",
        title: "Operaciones fundamentales con imágenes",
        items: [
          "`docker pull ubuntu:22.04` — Descarga desde el registry. Solo baja las capas que no tenés localmente.",
          "`docker images` — Lista imágenes locales: nombre, tag, ID, fecha de creación y tamaño.",
          "`docker image inspect ubuntu:22.04` — JSON completo: layers, config, env, entrypoint, labels, historial.",
          "`docker image history ubuntu:22.04` — Cada capa con su tamaño, el comando que la creó y la fecha.",
          "`docker image rm ubuntu:22.04` — Borra la imagen. Falla si hay contenedores (activos o detenidos) que la usan.",
          "`docker image prune` — Elimina imágenes 'dangling' (sin tag, huérfanas de builds). `prune -a` borra todas las no usadas.",
          "`docker tag mi-imagen:latest mi-imagen:v1.2.3` — Crea un alias. No copia la imagen, solo apunta al mismo manifest.",
          "`docker save -o imagen.tar mi-imagen:v1` — Exporta imagen completa a archivo tar (útil para transferir sin registry).",
          "`docker load -i imagen.tar` — Importa imagen desde archivo tar.",
          "`docker image ls --format '{{.Repository}}:{{.Tag}} {{.Size}}'` — Output formateado con Go templates."
        ]
      },
      {
        type: "concepts",
        title: "Digest vs Tag — la diferencia crítica",
        items: [
          "Un **tag** es un alias mutable: `nginx:latest` hoy puede apuntar a una imagen distinta que la de mañana.",
          "Un **digest** es inmutable: `nginx@sha256:e4f0474a5...` siempre es exactamente la misma imagen.",
          "En producción usá digests para reproducibilidad garantizada — especialmente en Kubernetes.",
          "`docker pull nginx@sha256:e4f0474a5...` — Pull por digest, 100% determinista.",
          "`docker images --digests` — Muestra el digest de cada imagen local.",
          "Estrategia profesional: en CI/CD, fijar el digest de la imagen base en el Dockerfile para builds reproducibles."
        ]
      },
      {
        type: "concepts",
        title: "Imágenes multi-arquitectura",
        items: [
          "Una imagen puede tener variantes para diferentes arquitecturas: `linux/amd64`, `linux/arm64`, `linux/arm/v7`.",
          "Un manifest list (o image index) apunta a manifests específicos por arquitectura.",
          "Cuando hacés `docker pull nginx`, Docker elige automáticamente la variante correcta para tu arquitectura.",
          "`docker buildx build --platform linux/amd64,linux/arm64 -t mi-imagen .` — Build multi-arch con BuildKit.",
          "Crítico si desarrollás en Mac M1/M2 (arm64) y desplegás en servidores x86_64 (amd64)."
        ]
      },
      {
        type: "concepts",
        title: "Imágenes base — cuál elegir",
        items: [
          "**`ubuntu:22.04`** — Base completa con apt. Familiar pero pesada (~77MB comprimida).",
          "**`debian:bookworm-slim`** — Debian sin paquetes opcionales. Buen balance (~30MB).",
          "**`alpine:3.19`** — Basada en musl libc y BusyBox. Ultra mínima (~5MB). Cuidado con compatibilidad.",
          "**`python:3.12-slim`** — Debian slim + Python. ~50MB. Recomendada para Python.",
          "**`python:3.12-alpine`** — Alpine + Python. ~20MB. Requiere más trabajo de compilación.",
          "**`distroless`** — Solo el runtime, sin shell ni package manager. Máxima seguridad.",
          "**`scratch`** — Imagen vacía. Para binarios estáticos (Go, Rust compilado con musl)."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Anatomía completa de una imagen",
        steps: [
          { cmd: "docker pull python:3.12-slim", desc: "Descarga la imagen. Observá cuántas capas se descargan y sus tamaños individuales." },
          { cmd: "docker image history python:3.12-slim --no-trunc", desc: "Ve qué comando generó cada capa y su tamaño. Las capas con tamaño 0 son metadata." },
          { cmd: "docker image inspect python:3.12-slim | python3 -m json.tool | head -100", desc: "JSON completo: RootFS.Layers (hashes de capas), Config (env, cmd, entrypoint)." },
          { cmd: "docker images python:3.12-slim --format 'Size: {{.Size}}'", desc: "Tamaño total de la imagen. Nota: este es el tamaño virtual — las capas compartidas no se cuentan." },
          { cmd: "ls /var/lib/docker/overlay2/ | wc -l", desc: "Número total de capas almacenadas en el host. Más imágenes = más capas, pero muchas son compartidas." },
          { cmd: "# Extraer la imagen manualmente para inspeccionarla\nmkdir -p /tmp/python-img\ndocker save python:3.12-slim | tar -xC /tmp/python-img\nls /tmp/python-img\ncat /tmp/python-img/manifest.json | python3 -m json.tool", desc: "Expone la estructura interna: manifest.json, config y carpetas de capas." },
          { cmd: "# Ver qué hay dentro de una capa específica\nls /tmp/python-img/\n# Tomar el primer directorio de capa y ver su contenido:\ntar -tzf /tmp/python-img/$(ls /tmp/python-img | head -1)/layer.tar | head -30", desc: "Cada capa es un tar con los archivos que esa instrucción agregó al filesystem." },
          { cmd: "# Comparar tamaño de dos imágenes base\ndocker pull alpine:3.19\ndocker images --format '{{.Repository}}:{{.Tag}}\\t{{.Size}}' | grep -E '(python|alpine)'", desc: "La diferencia de tamaño entre alpine y python-slim es significativa." }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Contenedores",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Dominar el ciclo de vida completo de los contenedores y los comandos esenciales de operación.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Un contenedor no es una imagen corriendo. Es una imagen + una capa de escritura + procesos + estado de red + estado de filesystem. Confundir imagen con contenedor es uno de los errores más comunes.

Necesitás entender el ciclo de vida completo: cómo nace un contenedor, cómo se detiene, cuándo se borra, qué persiste y qué no, cómo inspeccionarlo cuando algo falla, y cómo interactuar con él en producción.

La diferencia entre un administrador que sabe y uno que adivina está en conocer estos comandos íntimamente.`
      },
      {
        type: "diagram",
        title: "Ciclo de vida completo de un contenedor",
        diagram: `  docker run (= create + start)
       │
       │   docker create
       ▼       ▼
  [created] ──────────── docker start ──────► [running]
       ▲                                          │
       │                                   docker stop (SIGTERM → SIGKILL)
       │                                   docker kill (SIGKILL inmediato)
       │                                   proceso termina (exit code != 0)
       │                                          │
       │                                          ▼
       │                                      [stopped/exited]
       │                                          │
       │                         docker restart   │   docker rm
       └─────────────────────────────────────────-┘──────────────► [deleted]

  Estados adicionales:
  [paused]   ← docker pause (SIGSTOP a todos los procesos)
  [restarting] ← restart policy en acción
  [dead]     ← error fatal, no se puede gestionar`
      },
      {
        type: "concepts",
        title: "docker run — el comando central",
        body: `\`docker run\` es la composición de \`docker create\` + \`docker start\`. El 90% de las veces usás \`run\`.`,
        items: [
          "`docker run -d --name web -p 8080:80 nginx` — Crea y arranca en background, mapeando puerto 8080→80.",
          "`docker run -it ubuntu bash` — Terminal interactiva. `-i` mantiene stdin, `-t` asigna pseudo-TTY.",
          "`docker run --rm alpine echo 'hola'` — Corre y borra automáticamente al terminar. Para tareas one-shot.",
          "`docker run -e DB_HOST=localhost -e DB_PORT=5432 mi-app` — Variables de entorno al contenedor.",
          "`docker run --network mi-red mi-app` — Conecta a una red específica.",
          "`docker run --memory=256m --cpus=0.5 mi-app` — Límites de recursos via cgroups.",
          "`docker run --restart=unless-stopped nginx` — Se reinicia automáticamente excepto si fue detenido manualmente.",
          "`docker run --user 1000:1000 mi-app` — Corre el proceso como usuario no-root (seguridad)."
        ]
      },
      {
        type: "concepts",
        title: "Comandos de operación diaria",
        items: [
          "`docker ps` — Lista contenedores corriendo. `docker ps -a` incluye los detenidos.",
          "`docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'` — Output tabular formateado.",
          "`docker logs web` — Logs del proceso principal. `-f` para follow, `--tail 100` para las últimas 100 líneas.",
          "`docker logs web --since 10m` — Solo logs de los últimos 10 minutos.",
          "`docker exec -it web bash` — Shell dentro de un contenedor corriendo. Sin `-it`, usa para comandos one-shot.",
          "`docker exec web cat /etc/nginx/nginx.conf` — Ejecuta sin TTY interactiva.",
          "`docker stop web` — Envía SIGTERM y espera 10s. Si no terminó, SIGKILL. Permite graceful shutdown.",
          "`docker kill web` — SIGKILL inmediato. No da tiempo de cleanup.",
          "`docker rm web` — Borra el contenedor detenido. Usa `-f` para forzar borrado de uno corriendo.",
          "`docker inspect web` — JSON completo con toda la configuración, estado, red y filesystem del contenedor."
        ]
      },
      {
        type: "concepts",
        title: "Monitoreo y diagnóstico",
        items: [
          "`docker stats` — Métricas en tiempo real: CPU%, Memoria usada/límite, I/O de red y disco, PIDs.",
          "`docker stats --no-stream` — Una sola muestra (sin modo watch). Útil en scripts.",
          "`docker top web` — Lista los procesos corriendo dentro del contenedor (desde el host).",
          "`docker diff web` — Muestra qué archivos fueron modificados, agregados o borrados respecto a la imagen.",
          "`docker port web` — Lista los mapeos de puertos del contenedor.",
          "`docker inspect web --format '{{.NetworkSettings.IPAddress}}'` — IP interna del contenedor.",
          "`docker inspect web --format '{{.State.ExitCode}}'` — Código de salida del último proceso.",
          "`docker events` — Stream de eventos del daemon en tiempo real: create, start, stop, kill, die."
        ]
      },
      {
        type: "concepts",
        title: "Restart policies — resiliencia automática",
        items: [
          "`no` — No reinicia nunca (default). El contenedor queda en estado 'exited'.",
          "`always` — Siempre reinicia, incluso cuando el host se reinicia. Usado en servicios críticos.",
          "`unless-stopped` — Igual que 'always' pero no reinicia si el operador lo detuvo manualmente.",
          "`on-failure` — Solo reinicia si terminó con código != 0. `on-failure:5` limita a 5 intentos.",
          "Las restart policies son una red de seguridad, no un sustituto de una aplicación bien escrita.",
          "Con Docker Compose, `restart: unless-stopped` es el valor recomendado para servicios en staging."
        ]
      },
      {
        type: "diagram",
        title: "Señales de parada — SIGTERM vs SIGKILL",
        diagram: `docker stop web
    │
    ├── Envía SIGTERM al proceso PID 1 del contenedor
    │     El proceso tiene 10 segundos para terminar limpiamente:
    │     - cerrar conexiones de red
    │     - escribir datos pendientes
    │     - liberar recursos
    │
    └── Si no terminó en 10 segundos:
          SIGKILL (no se puede ignorar ni atrapar)
          Terminación inmediata — datos en vuelo se pierden

docker kill web
    │
    └── SIGKILL inmediato (sin gracia)

IMPORTANTE: Para que SIGTERM llegue al proceso correcto,
tu Dockerfile debe usar forma exec, no forma shell:
✓  ENTRYPOINT ["python", "app.py"]  ← PID 1 es python
✗  ENTRYPOINT python app.py         ← PID 1 es /bin/sh, python no recibe SIGTERM`
      },
      {
        type: "lab",
        title: "Laboratorio: Ciclo de vida completo y diagnóstico",
        steps: [
          { cmd: "# Crear sin iniciar\ndocker create --name demo nginx:alpine\ndocker ps -a", desc: "El contenedor existe en estado 'Created' pero no corre. No consume CPU." },
          { cmd: "docker start demo\ndocker ps", desc: "Ahora está en estado 'Up'. Iniciado con el comando default de nginx." },
          { cmd: "docker logs demo\ndocker logs demo --follow &", desc: "Logs del proceso principal de nginx. El & manda el follow a background." },
          { cmd: "curl -s http://$(docker inspect demo --format '{{.NetworkSettings.IPAddress}}')/", desc: "Accede al nginx por su IP interna de Docker. Debe responder HTML." },
          { cmd: "docker exec demo cat /etc/nginx/conf.d/default.conf", desc: "Lee la configuración de nginx desde dentro del contenedor sin terminal interactiva." },
          { cmd: "docker stats demo --no-stream", desc: "CPU, memoria usada y límite, I/O de red y disco. Verifica que los recursos son mínimos." },
          { cmd: "docker top demo", desc: "Procesos corriendo dentro del contenedor vistos desde el host." },
          { cmd: "docker diff demo", desc: "Archivos modificados respecto a la imagen base. Con nginx recién iniciado debería ser mínimo." },
          { cmd: "# Simular cambio de archivo\ndocker exec demo touch /tmp/archivo-prueba\ndocker diff demo", desc: "Ahora aparece el archivo nuevo en el diff como 'A' (added)." },
          { cmd: "docker stop demo\ndocker inspect demo --format 'ExitCode: {{.State.ExitCode}}'", desc: "nginx termina limpiamente con SIGTERM. Exit code 0 = terminación normal." },
          { cmd: "docker rm demo\ndocker ps -a | grep demo", desc: "Limpieza completa. Sin resultados confirma que el contenedor fue eliminado." }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Dockerfile",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Escribir Dockerfiles correctos y profesionales, entendiendo qué hace cada instrucción y cómo impacta en el resultado final.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Un Dockerfile mal escrito produce imágenes de 2 GB cuando deberían pesar 50 MB. Reconstruye todo desde cero cuando solo cambió una línea de código. Expone credenciales en las capas. Corre como root sin necesidad.

El Dockerfile es el ADN de tu imagen. Cada instrucción crea una capa, y esas capas determinan el tamaño, la seguridad, la velocidad de build y la superficie de ataque.

El 80% de las imágenes en producción tienen al menos uno de estos problemas. Aprendé a evitarlos desde el principio.`
      },
      {
        type: "concepts",
        title: "FROM — elegir bien la base",
        body: `Siempre la primera instrucción. Define la imagen base sobre la que todo lo demás se construye.`,
        items: [
          "`FROM ubuntu:22.04` — Base completa con apt. Útil pero pesada (~77MB). Muchos paquetes innecesarios.",
          "`FROM debian:bookworm-slim` — Debian reducido. Buen balance entre compatibilidad y tamaño (~30MB).",
          "`FROM python:3.12-slim` — Versión reducida de la imagen oficial de Python. Recomendada para APIs Python.",
          "`FROM python:3.12-alpine` — Alpine + Python. Mínima, pero usa musl libc — puede causar issues con C extensions.",
          "`FROM scratch` — Imagen vacía. Para binarios completamente estáticos (Go compilado con CGO_ENABLED=0).",
          "Siempre especificá la versión exacta. `FROM python:latest` en producción cambia silenciosamente con cada release.",
          "Usá `FROM python:3.12.3-slim-bookworm` si necesitás total reproducibilidad de la imagen base.",
          "Considerá las imágenes distroless de Google para producción: sin shell, sin package manager, mínima superficie de ataque."
        ]
      },
      {
        type: "concepts",
        title: "RUN — ejecutar comandos y optimizar capas",
        items: [
          "Cada `RUN` crea una nueva capa. Encadenar comandos con `&&` minimiza el número de capas.",
          "`RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*` — El `rm` borra el cache en la misma capa. Si lo ponés en un `RUN` separado, el cache ya está en una capa previa y la imagen igual pesa.",
          "Usá `--no-install-recommends` en apt para no instalar paquetes opcionales y reducir tamaño.",
          "En Alpine usá `--no-cache`: `RUN apk add --no-cache python3 py3-pip`",
          "Backslash `\\` para legibilidad multi-línea sin crear capas extras.",
          "Con BuildKit: `RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt` — cachea el pip cache entre builds.",
          "Con BuildKit: `RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret` — usa secretos sin que queden en capas."
        ]
      },
      {
        type: "concepts",
        title: "COPY vs ADD — cuándo usar cada uno",
        items: [
          "`COPY` copia archivos del contexto de build al filesystem de la imagen. Simple y predecible. Usalo por defecto.",
          "`ADD` hace lo mismo pero además: extrae tarballs automáticamente y soporta URLs remotas.",
          "Regla: usá `COPY` siempre. Usá `ADD` solo cuando necesités extracción automática de un tarball local.",
          "`COPY --chown=user:group archivo.py /app/` — Copia con ownership correcto sin `RUN chown` separado.",
          "`COPY --chmod=755 script.sh /app/` — Copia con permisos de ejecución (BuildKit).",
          "`COPY . .` al final del Dockerfile, no al principio — para aprovechar el cache de capas anteriores.",
          "Usá `.dockerignore` para excluir `node_modules`, `.git`, `.env` y otros archivos innecesarios del contexto."
        ]
      },
      {
        type: "concepts",
        title: "CMD vs ENTRYPOINT — la confusión más común",
        body: `La combinación de ENTRYPOINT y CMD es una de las partes más mal entendidas del Dockerfile.`,
        items: [
          "`CMD` define el comando por defecto. Se sobreescribe completamente con argumentos en `docker run imagen OTRO_CMD`.",
          "`ENTRYPOINT` define el ejecutable que siempre corre. Los argumentos de `docker run` se **agregan** como args, no reemplazan.",
          "Patrón profesional: `ENTRYPOINT [\"./app\"]` + `CMD [\"--config\", \"default.yaml\"]`. El CMD son defaults sobreescribibles.",
          "Forma exec `[\"cmd\", \"arg\"]` es la correcta. Hace que el proceso sea PID 1 directamente — recibe SIGTERM.",
          "Forma shell `cmd arg` crea un proceso `/bin/sh -c` como PID 1. Tu app no recibe SIGTERM directamente.",
          "Para sobreescribir ENTRYPOINT en docker run: `docker run --entrypoint /bin/bash mi-imagen`.",
          "Si solo usás CMD, el shell interpreta el comando. Si usás ENTRYPOINT exec, el proceso es PID 1."
        ]
      },
      {
        type: "concepts",
        title: "El resto de instrucciones esenciales",
        items: [
          "`WORKDIR /app` — Establece el directorio de trabajo. Lo crea si no existe. Preferible a `RUN mkdir && cd`.",
          "`ENV DB_HOST=localhost PORT=8000` — Variables de entorno disponibles en runtime. Visible en `docker inspect`.",
          "`ARG VERSION=1.0` — Variable disponible SOLO durante el build. No persiste en la imagen. Para tokens de CI, versiones.",
          "`EXPOSE 8080` — Documentación. No abre el puerto — eso lo hace `-p` en `docker run`. Pero `docker run -P` usa EXPOSE.",
          "`LABEL maintainer=\"dev@empresa.com\" version=\"1.0\"` — Metadata. Consultable con `docker inspect`.",
          "`USER appuser` — Cambia el usuario para instrucciones siguientes y para el proceso del contenedor.",
          "`VOLUME /data` — Declara un punto de montaje. Crea un volumen anónimo si no se especifica en `docker run`.",
          "`HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1` — Healthcheck integrado en la imagen.",
          "`ONBUILD COPY . /app` — Se ejecuta cuando esta imagen se usa como base en otro Dockerfile.",
          "`STOPSIGNAL SIGQUIT` — Señal que Docker envía para detener el contenedor (por defecto: SIGTERM)."
        ]
      },
      {
        type: "code",
        title: "Dockerfile profesional — Python FastAPI",
        code: `# syntax=docker/dockerfile:1
# Imagen base con versión exacta y digest para reproducibilidad
FROM python:3.12-slim-bookworm

# Metadata
LABEL maintainer="dev@empresa.com"
LABEL org.opencontainers.image.title="Mi API"
LABEL org.opencontainers.image.version="1.0.0"

# Variables de entorno para Python
ENV PYTHONUNBUFFERED=1 \\
    PYTHONDONTWRITEBYTECODE=1 \\
    PIP_NO_CACHE_DIR=1 \\
    PIP_DISABLE_PIP_VERSION_CHECK=1 \\
    PORT=8000

# Directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema (si las hay)
RUN apt-get update \\
    && apt-get install -y --no-install-recommends \\
        curl \\
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias Python primero (aprovecha cache)
# Esta capa solo se reconstruye cuando requirements.txt cambia
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación (cambia frecuentemente)
COPY . .

# Crear usuario no-root y cambiar ownership
RUN addgroup --system --gid 1001 appgroup \\
    && adduser --system --uid 1001 --ingroup appgroup --no-create-home appuser \\
    && chown -R appuser:appgroup /app

# Cambiar a usuario no-root
USER appuser

# Puerto documentado
EXPOSE 8000

# Healthcheck integrado
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
    CMD curl -f http://localhost:8000/health || exit 1

# Entrypoint fijo + cmd sobreescribible
ENTRYPOINT ["python", "-m", "uvicorn"]
CMD ["main:app", "--host", "0.0.0.0", "--port", "8000"]`
      },
      {
        type: "code",
        title: ".dockerignore — fundamental",
        code: `# Control de versiones
.git
.gitignore

# Python
__pycache__
*.py[cod]
*.pyo
*.pyd
.Python
*.egg
*.egg-info
dist
build
venv
.venv
env
.env

# Node (si aplica)
node_modules
npm-debug.log
yarn-error.log

# Entornos y secretos
.env
.env.*
*.local
secrets/

# Tests y coverage
.pytest_cache
.coverage
coverage/
htmlcov/
.tox

# IDEs
.idea
.vscode
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/`
      },
      {
        type: "lab",
        title: "Laboratorio: Imagen FastAPI desde cero",
        steps: [
          { cmd: "mkdir mi-api && cd mi-api", desc: "Crea el directorio del proyecto." },
          { cmd: "cat > requirements.txt << 'EOF'\nfastapi==0.111.0\nuvicorn[standard]==0.29.0\nhttpx==0.27.0\nEOF", desc: "Dependencias fijadas con versiones exactas para reproducibilidad." },
          { cmd: "cat > main.py << 'EOF'\nfrom fastapi import FastAPI\nimport os, platform\n\napp = FastAPI(title='Mi API Demo')\n\n@app.get('/health')\ndef health(): return {'status': 'ok'}\n\n@app.get('/')\ndef root():\n    return {\n        'message': 'Hola desde Docker',\n        'python': platform.python_version(),\n        'host': os.environ.get('HOSTNAME', 'unknown')\n    }\nEOF", desc: "API mínima con endpoint de health y root." },
          { cmd: "# Crear el Dockerfile (copiá el del ejemplo anterior)\n# Crear .dockerignore (copiá el del ejemplo anterior)", desc: "" },
          { cmd: "docker build -t mi-api:v1 .\ndocker image history mi-api:v1", desc: "Observá cómo se crea cada capa. History muestra tamaño y comando de cada una." },
          { cmd: "docker run -d -p 8000:8000 --name api mi-api:v1\ncurl http://localhost:8000/\ncurl http://localhost:8000/health", desc: "Debe devolver JSON con status ok y info del entorno." },
          { cmd: "# Modificar código y reconstruir — observar cache\necho '# cambio' >> main.py\ndocker build -t mi-api:v2 .", desc: "Las capas de dependencias se reutilizan del cache. Solo reconstruye desde COPY . ." },
          { cmd: "# Comparar tamaños v1 vs v2\ndocker images mi-api\n# Verificar que corre como non-root\ndocker exec api whoami\ndocker exec api id", desc: "Debe mostrar 'appuser', no 'root'. Seguridad verificada." }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Build Profesional",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Dominar técnicas avanzadas de build: multi-stage, cache eficiente, BuildKit y optimización de tamaño.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Una imagen de Go o Java que incluye el compilador, las herramientas de build y los archivos fuente puede pesar 1.5 GB. La imagen que necesitás en producción debería pesar 15 MB — solo el binario compilado.

Sin multi-stage builds, tus opciones son: imagen gigante en producción, o scripts complejos externos para compilar y luego copiar. Con multi-stage, el problema desaparece con elegancia.

Y si cada build tarda 5 minutos reinstalando dependencias que no cambiaron, tu pipeline de CI es 10 veces más lento de lo que podría ser.`
      },
      {
        type: "diagram",
        title: "Multi-stage build — el principio",
        diagram: `Stage 1: builder (imagen de compilación)
┌────────────────────────────────────────────┐
│  FROM golang:1.22-alpine AS builder        │
│  WORKDIR /build                            │
│  COPY go.mod go.sum ./                     │
│  RUN go mod download                       │
│  COPY . .                                  │
│  RUN CGO_ENABLED=0 go build -o app .       │
│                                            │
│  Tamaño: ~400MB (compilador + fuentes)     │
└──────────────────┬─────────────────────────┘
                   │
                   │  COPY --from=builder /build/app /app
                   │  Solo el binario compilado (5MB)
                   ▼
Stage 2: production (imagen final)
┌────────────────────────────────────────────┐
│  FROM scratch                              │
│  COPY --from=builder /build/app /app       │
│  EXPOSE 8080                               │
│  ENTRYPOINT ["/app"]                       │
│                                            │
│  Tamaño: ~8MB (solo el binario + certs)    │
└────────────────────────────────────────────┘

La imagen de build nunca llega a producción.
Solo el resultado final se exporta.`
      },
      {
        type: "code",
        title: "Multi-stage: Go — imagen de 8 MB",
        code: `# Stage 1: compilación
FROM golang:1.22-alpine AS builder

# Instalar dependencias del sistema para la compilación
RUN apk add --no-cache git ca-certificates tzdata

# Crear usuario no-root para el stage final
RUN adduser -D -g '' appuser

WORKDIR /build

# Descargar dependencias primero (cache de módulos)
COPY go.mod go.sum ./
RUN go mod download && go mod verify

# Copiar código y compilar
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \\
    go build \\
    -ldflags='-w -s -extldflags "-static"' \\
    -a -installsuffix cgo \\
    -o app .

# Stage 2: imagen de producción mínima
FROM scratch

# Copiar certificados SSL (para llamadas HTTPS a APIs externas)
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copiar información de timezone
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copiar info del usuario no-root
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copiar el binario compilado
COPY --from=builder /build/app /app

USER appuser

EXPOSE 8080
ENTRYPOINT ["/app"]`
      },
      {
        type: "code",
        title: "Multi-stage: Node.js — separar build de producción",
        code: `# Stage 1: instalar TODAS las dependencias y hacer build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas las deps (incluyendo devDependencies)
RUN npm ci

# Copiar fuente y compilar (TypeScript, bundler, etc.)
COPY . .
RUN npm run build

# Stage 2: instalar solo deps de producción
FROM node:20-alpine AS deps

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 3: imagen final
FROM node:20-alpine

WORKDIR /app

# Copiar solo los artefactos necesarios
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs \\
    && adduser --system --uid 1001 --ingroup nodejs nextjs

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/server.js"]`
      },
      {
        type: "code",
        title: "Multi-stage: Java/Spring Boot",
        code: `# Stage 1: build con Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Descargar dependencias (cache de Maven)
COPY pom.xml .
RUN mvn dependency:resolve -q

# Build
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: extraer capas del JAR para mejor cache en K8s
FROM eclipse-temurin:21-jre-alpine AS layertools

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: imagen final con capas separadas (mejor cache)
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup --system --gid 1001 spring \\
    && adduser --system --uid 1001 --ingroup spring spring

COPY --from=layertools --chown=spring:spring /app/dependencies/ ./
COPY --from=layertools --chown=spring:spring /app/spring-boot-loader/ ./
COPY --from=layertools --chown=spring:spring /app/snapshot-dependencies/ ./
COPY --from=layertools --chown=spring:spring /app/application/ ./

USER spring

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]`
      },
      {
        type: "concepts",
        title: "Cache de capas — la estrategia correcta",
        body: `El cache es la optimización más impactante para builds repetitivos. La regla de oro: **lo que cambia con más frecuencia va al final**.`,
        items: [
          "Las dependencias (package.json, requirements.txt, go.mod) cambian raramente — copiálas primero.",
          "El código fuente cambia en cada commit — copiálo al final.",
          "Si invertís el orden, cada cambio de código invalida el cache de dependencias y reinstalás todo desde cero.",
          "Una capa invalidada invalida TODAS las capas siguientes. El cache es secuencial.",
          "`docker build --no-cache .` — Fuerza rebuild completo. Útil para CI o cuando sospecháis de cache corrupto.",
          "`docker build --cache-from mi-imagen:latest .` — Usa una imagen remota como fuente de cache (CI/CD).",
          "Con BuildKit: `--mount=type=cache` persiste directorios de cache entre builds sin crear capas."
        ]
      },
      {
        type: "concepts",
        title: "BuildKit — el motor moderno",
        items: [
          "BuildKit es el motor de build moderno de Docker, activo por defecto desde Docker 23.0.",
          "En versiones anteriores: `DOCKER_BUILDKIT=1 docker build .` para activarlo.",
          "Builds paralelos: los stages independientes se construyen en paralelo automáticamente.",
          "`--mount=type=cache,target=/root/.cache/pip` — Cachea el pip/npm/maven cache entre builds sin crear capas.",
          "`--mount=type=secret,id=gh_token` — Pasa secretos al build sin que queden en la imagen.",
          "`--mount=type=ssh` — Usa tu SSH agent para clonar repos privados durante el build.",
          "`docker buildx build --platform linux/amd64,linux/arm64 -t imagen:v1 --push .` — Cross-platform build.",
          "`docker buildx imagetools inspect imagen:v1` — Inspecciona un manifest multi-arch en el registry."
        ]
      },
      {
        type: "concepts",
        title: "Reducción de tamaño — checklist",
        items: [
          "Elegir imagen base apropiada: `slim` o `alpine` en lugar de la imagen completa.",
          "Combinar comandos RUN con `&&` para minimizar capas.",
          "Limpiar caches de package managers en la misma instrucción RUN: `rm -rf /var/lib/apt/lists/*`, `npm cache clean`.",
          "Usar multi-stage builds para separar herramientas de compilación del resultado final.",
          "Excluir archivos innecesarios con `.dockerignore` (node_modules, .git, tests, docs).",
          "Instalar solo lo necesario: `--no-install-recommends` en apt, `--only=production` en npm.",
          "`docker scout cves mi-imagen` — Escanear vulnerabilidades (Docker Scout, gratuito para repos públicos).",
          "`dive mi-imagen` — Herramienta que analiza qué archivos hay en cada capa y dónde se desperdicia espacio."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Reducción de 900MB a 8MB con Go",
        steps: [
          { cmd: "mkdir go-app && cd go-app\ngo mod init miapp", desc: "Inicializa módulo Go." },
          { cmd: "cat > main.go << 'EOF'\npackage main\n\nimport (\n  \"fmt\"\n  \"net/http\"\n  \"runtime\"\n)\n\nfunc main() {\n  http.HandleFunc(\"/\", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintf(w, \"{\\\"go\\\": \\\"%s\\\", \\\"os\\\": \\\"%s\\\"}\",\n      runtime.Version(), runtime.GOOS)\n  })\n  http.HandleFunc(\"/health\", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintln(w, \"{\\\"status\\\": \\\"ok\\\"}\")\n  })\n  http.ListenAndServe(\":8080\", nil)\n}\nEOF", desc: "Servidor HTTP mínimo en Go." },
          { cmd: "# Dockerfile naive: imagen enorme\ncat > Dockerfile.naive << 'EOF'\nFROM golang:1.22\nWORKDIR /app\nCOPY . .\nRUN go build -o app .\nCMD [\"/app/app\"]\nEOF\ndocker build -f Dockerfile.naive -t go-naive .\ndocker images go-naive", desc: "Observá el tamaño — ~900MB con el compilador adentro." },
          { cmd: "# Multi-stage build\ncat > Dockerfile << 'EOF'\nFROM golang:1.22-alpine AS builder\nRUN apk add --no-cache ca-certificates\nWORKDIR /build\nCOPY go.mod ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -ldflags=\"-w -s\" -o app .\n\nFROM scratch\nCOPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/\nCOPY --from=builder /build/app /app\nEXPOSE 8080\nENTRYPOINT [\"/app\"]\nEOF\ndocker build -t go-slim .", desc: "Multi-stage: solo el binario en la imagen final." },
          { cmd: "docker images | grep go-\necho '---'\necho 'Reducción:'", desc: "go-naive vs go-slim — diferencia de ~890MB. Mismo binario, sin compilador." },
          { cmd: "docker run -d -p 8080:8080 --name goapp go-slim\ncurl http://localhost:8080/\ncurl http://localhost:8080/health", desc: "Funciona igual. La imagen de scratch no tiene shell ni nada extra." },
          { cmd: "# Verificar que no hay shell (imagen scratch)\ndocker exec goapp sh 2>&1 || echo 'Sin shell — solo el binario'", desc: "Imagen de scratch: superficie de ataque mínima absoluta." }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Volúmenes",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender los tipos de almacenamiento en Docker y cuándo usar cada uno para gestionar datos persistentes.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Los contenedores son efímeros por diseño. Todo lo que escribís dentro de un contenedor vive en su capa de escritura (UpperDir de OverlayFS). Cuando el contenedor se borra, esos datos desaparecen para siempre.

¿Cómo persistís datos de una base de datos entre reinicios? ¿Cómo compartís archivos entre múltiples contenedores? ¿Cómo un desarrollador monta su código fuente para hot-reload sin reconstruir la imagen?

La respuesta es volúmenes — y elegir el tipo correcto para cada caso importa.`
      },
      {
        type: "diagram",
        title: "Los tres tipos de almacenamiento en Docker",
        diagram: `┌─────────────────────────────────────────────────────────────────┐
│                         HOST                                    │
│                                                                 │
│  /var/lib/docker/volumes/   /home/user/proyecto/   RAM         │
│         │                           │               │           │
│    Named Volume               Bind Mount         tmpfs          │
│    (Docker gestiona)         (path del host)   (en memoria)    │
│         │                           │               │           │
│  ┌──────┴───────────────────────────┴───────────────┴──────┐   │
│  │                     CONTENEDOR                          │   │
│  │                                                         │   │
│  │   /var/lib/postgresql/data   /app    /tmp/secrets       │   │
│  │          │                    │           │              │   │
│  │       Named               Bind         tmpfs             │   │
│  │       Volume              Mount        Mount             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Regla de oro:
- Datos de DB/uploads/logs → Named Volume
- Código fuente en desarrollo → Bind Mount
- Secretos temporales sensibles → tmpfs`
      },
      {
        type: "concepts",
        title: "Named Volumes — la opción recomendada",
        items: [
          "Gestionados completamente por Docker. Almacenados en `/var/lib/docker/volumes/nombre/_data`.",
          "Recomendados para datos de aplicación: bases de datos, uploads de usuarios, logs persistentes.",
          "`docker volume create pgdata` — Crea el volumen con nombre.",
          "`docker run -v pgdata:/var/lib/postgresql/data postgres:16` — Monta el volumen en el contenedor.",
          "Persisten aunque borres el contenedor. Solo se eliminan con `docker volume rm pgdata`.",
          "`docker volume ls` — Lista todos los volúmenes del sistema.",
          "`docker volume inspect pgdata` — Muestra el Mountpoint real en el host, driver, labels.",
          "Backup: `docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .`",
          "En producción cloud: los named volumes son locales al host. Para compartir entre servidores necesitás NFS o CSI drivers."
        ]
      },
      {
        type: "concepts",
        title: "Bind Mounts — para desarrollo",
        items: [
          "Montan un directorio o archivo específico del host dentro del contenedor.",
          "`docker run -v /home/user/app:/app node:20` — El directorio del host se monta en /app del contenedor.",
          "`docker run -v $(pwd):/app node:20` — Atajo para montar el directorio actual.",
          "Los cambios en el host se reflejan inmediatamente en el contenedor — ideal para hot-reload en desarrollo.",
          "El contenedor también puede escribir en el host — cuidado con permisos (UID mismatch).",
          "`:ro` al final para montaje de solo lectura: `-v $(pwd)/config:/app/config:ro`",
          "**No usar en producción**: acopla el contenedor a la estructura de directorios del host. No es portable.",
          "Si el path del host no existe, Docker lo crea como directorio (potencial fuente de confusión)."
        ]
      },
      {
        type: "concepts",
        title: "tmpfs — almacenamiento en memoria",
        items: [
          "Almacenamiento en RAM. No persiste al disco en ningún momento.",
          "`docker run --tmpfs /tmp:size=64m,mode=1777 app` — Monta /tmp en memoria con tamaño máximo.",
          "Ideal para archivos temporales sensibles: tokens de sesión, keys temporales, datos que no deben tocar disco.",
          "Se limpia automáticamente al detener el contenedor.",
          "Más rápido que el disco — útil para aplicaciones con muchas operaciones I/O temporales.",
          "No disponible como opción en Windows containers."
        ]
      },
      {
        type: "concepts",
        title: "Volume drivers y plugins",
        items: [
          "El driver `local` es el default — almacena en el host donde corre el contenedor.",
          "**NFS**: `docker volume create --driver local --opt type=nfs --opt o=addr=192.168.1.1,rw --opt device=:/path nfs-vol`",
          "**AWS EFS** con el plugin `rexray/efs` — volúmenes compartidos en AWS.",
          "**GlusterFS, Ceph** — para almacenamiento distribuido en producción multi-nodo.",
          "En producción seria, el almacenamiento distribuido lo gestiona Kubernetes + CSI drivers, no Docker directamente."
        ]
      },
      {
        type: "diagram",
        title: "Permisos y ownership — el problema clásico",
        diagram: `Problema frecuente:
  Host: developer corre como UID 1000
  Contenedor: proceso corre como root (UID 0) o UID diferente

Síntoma: archivos creados dentro del contenedor son de root,
el desarrollador no puede editarlos desde el host.

Soluciones:

1. Especificar el mismo UID en el contenedor:
   docker run --user $(id -u):$(id -g) -v $(pwd):/app node

2. Usar --chown en COPY dentro del Dockerfile:
   COPY --chown=1000:1000 . /app

3. Ajustar permisos del directorio del host:
   chmod -R a+rw ./data

4. En Docker Desktop (Mac/Win): sincronización automática de UIDs
   a través de la VM — el problema es menos visible.`
      },
      {
        type: "lab",
        title: "Laboratorio: PostgreSQL con datos persistentes y backup",
        steps: [
          { cmd: "docker volume create pgdata\ndocker volume inspect pgdata", desc: "Crea el volumen y verifica su ubicación en el host." },
          { cmd: "docker run -d \\\n  --name postgres \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  -e POSTGRES_USER=admin \\\n  -v pgdata:/var/lib/postgresql/data \\\n  -p 5432:5432 \\\n  postgres:16-alpine", desc: "Inicia PostgreSQL con el volumen nombrado. Los datos van al volumen, no a la capa del contenedor." },
          { cmd: "# Esperar a que PostgreSQL esté listo\nsleep 3\ndocker exec postgres pg_isready -U admin -d demo", desc: "pg_isready verifica que el servidor acepta conexiones." },
          { cmd: "docker exec -it postgres psql -U admin -d demo -c \\\n  \"CREATE TABLE usuarios (id serial PRIMARY KEY, nombre text, email text);\"\ndocker exec -it postgres psql -U admin -d demo -c \\\n  \"INSERT INTO usuarios (nombre, email) VALUES ('Alice', 'alice@test.com'), ('Bob', 'bob@test.com'), ('Carlos', 'carlos@test.com');\"", desc: "Crea tabla e inserta datos de prueba." },
          { cmd: "docker exec postgres psql -U admin -d demo -c \"SELECT COUNT(*) FROM usuarios;\"", desc: "Verifica que los datos están ahí. Debe devolver 3." },
          { cmd: "docker rm -f postgres", desc: "Borra el contenedor completamente. Los datos en el volumen persisten." },
          { cmd: "docker run -d \\\n  --name postgres2 \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  -e POSTGRES_USER=admin \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16-alpine\nsleep 3\ndocker exec postgres2 psql -U admin -d demo -c \"SELECT * FROM usuarios;\"", desc: "Nuevo contenedor, mismo volumen. Los tres usuarios siguen ahí — persistencia confirmada." },
          { cmd: "# Backup del volumen\ndocker run --rm \\\n  -v pgdata:/data:ro \\\n  -v $(pwd):/backup \\\n  alpine \\\n  tar czf /backup/pgdata-$(date +%Y%m%d).tar.gz -C /data .", desc: "Patrón estándar de backup: contenedor temporal que lee el volumen y escribe al host." },
          { cmd: "ls -lh pgdata-*.tar.gz", desc: "Verifica el archivo de backup creado en el directorio actual." }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Redes Docker",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender los tipos de redes Docker y cómo los contenedores se comunican entre sí y con el exterior.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Por defecto, los contenedores están aislados en la red. ¿Cómo hace tu backend para hablar con tu base de datos si están en contenedores separados? ¿Cómo exponés tu aplicación al mundo exterior? ¿Cómo aislás la base de datos para que no sea accesible desde fuera?

La red es uno de los aspectos más mal entendidos de Docker. Configurarla incorrectamente causa tanto problemas de conectividad (servicios que no se pueden hablar) como problemas de seguridad (servicios expuestos que no deberían estarlo).`
      },
      {
        type: "diagram",
        title: "Drivers de red — cuándo usar cada uno",
        diagram: `bridge (default — el más común)
│  Red virtual privada en el host.
│  Cada contenedor tiene su IP en la subred 172.x.x.x.
│  Los contenedores en la misma red bridge se ven entre sí.
│  Acceso al exterior vía NAT (el host hace de router).
│  DNS por nombre solo en redes definidas por el usuario.
│
host
│  El contenedor usa la interfaz de red del host directamente.
│  Sin aislamiento de red — puede colisionar puertos con el host.
│  Solo disponible en Linux. Mayor performance (sin overhead NAT).
│  Caso de uso: monitoring agents que necesitan ver la red del host.
│
none
│  Sin red. El contenedor no puede comunicarse con nadie.
│  Para tareas de procesamiento puro que no necesitan red.
│
overlay
│  Red distribuida entre múltiples hosts Docker.
│  Usada en Docker Swarm. Cada host ve los contenedores de otros.
│  Kubernetes usa su propio modelo de red (CNI plugins).
│
macvlan
   El contenedor aparece en la red física con su propia MAC.
   Útil para integrar contenedores en redes LAN existentes.
   Requiere configuración del switch/router de red física.`
      },
      {
        type: "concepts",
        title: "Bridge network — user-defined vs default",
        items: [
          "La red `bridge` por defecto (`docker0`) existe siempre. **No provee DNS entre contenedores por nombre**.",
          "Las redes bridge **definidas por el usuario** sí proveen resolución DNS automática por nombre de servicio.",
          "**Siempre creá redes personalizadas**. No uses la bridge por defecto para comunicación entre contenedores.",
          "`docker network create app-net` — Crea red bridge personalizada con subred automática.",
          "`docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 mi-red` — Con subred explícita.",
          "`docker run --network app-net --name backend mi-api` — Conecta el contenedor a la red.",
          "Desde otro contenedor en la misma red: `curl http://backend:8000/` — DNS resuelve 'backend' automáticamente.",
          "Un contenedor puede conectarse a múltiples redes: `docker network connect otra-red mi-contenedor`."
        ]
      },
      {
        type: "concepts",
        title: "Publicar puertos — exposición al exterior",
        items: [
          "`-p 8080:80` — Mapea el puerto 80 del contenedor al 8080 del host. Accesible desde cualquier IP del host.",
          "`-p 127.0.0.1:8080:80` — Solo acepta conexiones del localhost del host. No expuesto a la red externa.",
          "`-p 0.0.0.0:8080:80` — Acepta en todas las interfaces. Comportamiento por defecto de `-p 8080:80`.",
          "`-p 80` (un solo número) — Docker elige un puerto aleatorio en el host. Ver con `docker port contenedor`.",
          "`-P` / `--publish-all` — Publica todos los puertos EXPOSE del Dockerfile en puertos aleatorios.",
          "El daemon de Docker modifica iptables para implementar el mapeo de puertos.",
          "**Seguridad**: si publicás un puerto, es accesible para cualquiera que pueda llegar a la IP del host."
        ]
      },
      {
        type: "concepts",
        title: "DNS interno y resolución de nombres",
        body: `Docker incluye un servidor DNS embebido que gestiona la resolución de nombres entre contenedores.`,
        items: [
          "En redes user-defined, cada contenedor registra su nombre en el DNS de Docker (127.0.0.11).",
          "Los contenedores resuelven nombres de otros contenedores en la misma red automáticamente.",
          "Si escalás con `--scale backend=3`, el DNS hace round-robin entre las tres instancias.",
          "Los aliases de red dan nombres alternativos: `docker run --network-alias postgres mi-db`.",
          "Podés inspeccionar el DNS: `docker exec mi-app cat /etc/resolv.conf` — verás `127.0.0.11`.",
          "El nameserver `127.0.0.11` solo está disponible dentro del contenedor, no en el host."
        ]
      },
      {
        type: "diagram",
        title: "Aislamiento de red — patrón de seguridad",
        diagram: `Mala práctica — todo en la misma red:
┌──────────────────────────────────────┐
│  red: app-net                        │
│  nginx ←→ backend ←→ postgres        │
│          nginx puede ver postgres     │
└──────────────────────────────────────┘

Buena práctica — redes separadas por zona:
┌────────────────────┐  ┌─────────────────────────────┐
│  red: public       │  │  red: private               │
│  nginx             │  │  backend ←→ postgres        │
│        │           │  │  backend ←→ redis           │
└────────┼───────────┘  └─────────────────────────────┘
         │ nginx está en ambas redes (puente)
         └── nginx conectado a private también

Resultado:
- nginx puede hablar con backend ✓
- nginx NO puede hablar directamente con postgres o redis ✓
- backend puede hablar con postgres y redis ✓
- postgres no tiene puertos publicados al host ✓`
      },
      {
        type: "concepts",
        title: "Diagnóstico de red",
        items: [
          "`docker network ls` — Lista todas las redes. Siempre verás bridge, host y none por defecto.",
          "`docker network inspect app-net` — Muestra IPs de todos los contenedores conectados, subred, gateway.",
          "`docker exec mi-app ping otro-contenedor` — Prueba conectividad por nombre.",
          "`docker exec mi-app nslookup otro-contenedor` — Resolución DNS explícita.",
          "`docker exec mi-app curl http://backend:8000/health` — Prueba HTTP entre contenedores.",
          "`docker network disconnect app-net mi-contenedor` — Desconecta un contenedor de una red.",
          "`docker network rm app-net` — Elimina la red (falla si hay contenedores conectados).",
          "`docker network prune` — Elimina todas las redes sin contenedores."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Redes y aislamiento multicontenedor",
        steps: [
          { cmd: "docker network create public-net\ndocker network create private-net\ndocker network ls | grep -E '(public|private)'", desc: "Crea dos redes separadas para simular zonas de seguridad." },
          { cmd: "docker run -d \\\n  --name db \\\n  --network private-net \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  postgres:16-alpine", desc: "DB solo en la red privada. Sin puertos publicados al host." },
          { cmd: "docker run -d \\\n  --name backend \\\n  --network private-net \\\n  -e DB_HOST=db \\\n  nginx:alpine", desc: "Backend solo en red privada. Puede ver a 'db' pero no está expuesto al exterior." },
          { cmd: "# Conectar backend también a la red pública\ndocker network connect public-net backend", desc: "Backend ahora tiene un pie en cada red — patrón puente." },
          { cmd: "# Verificar DNS interno\ndocker exec backend ping -c 2 db", desc: "El nombre 'db' resuelve al contenedor de PostgreSQL en la red privada." },
          { cmd: "# Verificar que desde una red diferente no se puede acceder\ndocker run --rm --network public-net alpine ping -c 2 db 2>&1 || echo 'Correcto: db no visible desde public-net'", desc: "La DB no es visible desde la red pública — aislamiento funcionando." },
          { cmd: "docker network inspect private-net --format '{{json .Containers}}' | python3 -m json.tool", desc: "Muestra los contenedores conectados a la red privada con sus IPs." },
          { cmd: "docker rm -f db backend\ndocker network rm public-net private-net", desc: "Limpieza completa." }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Docker Registry",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender qué es un registry, cómo publicar imágenes y cómo configurar un registry privado.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Construiste tu imagen. Funciona perfectamente en tu máquina. ¿Cómo la llevás a producción? ¿Cómo la compartís con tu equipo? ¿Cómo tu servidor de CI la publica y tu servidor de producción la descarga automáticamente?

Necesitás un registry: un servidor centralizado que almacena y distribuye imágenes Docker usando el protocolo OCI Distribution Spec.

Sin un registry, tenés que copiar imágenes manualmente con \`docker save | ssh servidor docker load\` — no escala para un equipo.`
      },
      {
        type: "diagram",
        title: "Flujo completo de imágenes en un equipo",
        diagram: `Developer local              CI/CD Pipeline            Producción
      │                           │                        │
  git push                        │                        │
      │                           │                        │
      └──── trigger CI ──────────►│                        │
                              docker build                  │
                              docker test                   │
                              docker push ─────────────────►│
                                  │                     Registry
                                  │              (Docker Hub / GHCR / ECR)
                                  │                        │
                                  └──────────── deploy ────►│
                                              kubectl set image
                                              docker-compose pull && up
                                                    │
                                               docker pull
                                               docker run`
      },
      {
        type: "concepts",
        title: "Opciones de registry — comparativa",
        items: [
          "**Docker Hub** — Registry público por defecto. `docker.io/library/nginx`. Límites de pull rate en tier gratuito (100 pulls/6h anónimo, 200 auth). Gratuito para repos públicos.",
          "**GHCR (GitHub Container Registry)** — `ghcr.io/usuario/imagen`. Integrado con GitHub Actions y permisos de repositorio. Excelente opción gratuita.",
          "**AWS ECR** — `123456789.dkr.ecr.us-east-1.amazonaws.com/imagen`. Registry privado de Amazon. Integrado con EKS, IAM. Por GB almacenado.",
          "**GCP Artifact Registry** — `us-central1-docker.pkg.dev/proyecto/repo/imagen`. Reemplaza a GCR. Integrado con GKE.",
          "**Azure Container Registry (ACR)** — `miregistry.azurecr.io/imagen`. Integrado con AKS.",
          "**Harbor** — Registry open source self-hosted. Incluye vulnerability scanning (Trivy), RBAC, replicación entre registries y notarización de imágenes.",
          "**Registry v2 (docker/registry)** — Imagen oficial de Docker. Mínima, sin UI. Para uso interno simple."
        ]
      },
      {
        type: "concepts",
        title: "Convención de nombres de imágenes",
        body: `El nombre completo de una imagen sigue el patrón: \`[registry/][usuario/]nombre[:tag][@digest]\``,
        items: [
          "`nginx` — Imagen oficial del Docker Hub. Equivale a `docker.io/library/nginx:latest`.",
          "`usuario/mi-imagen:v1.0.0` — Imagen personal en Docker Hub.",
          "`ghcr.io/miorg/mi-imagen:v1.0.0` — Imagen en GitHub Container Registry.",
          "`localhost:5000/mi-imagen:dev` — Registry local en el puerto 5000.",
          "`mi-imagen@sha256:abc123...` — Pin por digest para reproducibilidad total.",
          "El tag `latest` es mutable y ambiguo. En producción: usá tags semánticos o digests."
        ]
      },
      {
        type: "concepts",
        title: "Estrategia de versionado — buenas prácticas",
        items: [
          "**Semver completo**: `v1.2.3` — Siempre. Permite saber exactamente qué versión está en prod.",
          "**Por commit SHA**: `mi-imagen:abc1234` — Para traceabilidad perfecta (hash del commit que generó la imagen).",
          "**Por rama + commit**: `mi-imagen:main-abc1234` — Indica la rama además del commit.",
          "**Tags múltiples**: publicar `v1.2.3`, `v1.2` y `v1` apuntando a la misma imagen. El usuario elige cuánto fijar.",
          "**latest**: solo actualizar `latest` en releases estables. Nunca en branches de feature.",
          "**Digests en K8s**: en manifiestos de Kubernetes, usar digest en lugar de tag para deploys reproducibles."
        ]
      },
      {
        type: "concepts",
        title: "Autenticación y seguridad",
        items: [
          "`docker login` — Interactivo. Guarda credenciales en `~/.docker/config.json` (base64, no cifrado).",
          "`docker login ghcr.io -u USUARIO --password-stdin` — Desde stdin, evita credenciales en historial de shell.",
          "En CI/CD: usar tokens de acceso con permisos mínimos (read para pull, write para push). Nunca tu password personal.",
          "Docker secrets para Swarm: `docker secret create` guarda secretos cifrados.",
          "En Kubernetes: `kubectl create secret docker-registry regcred --docker-server=... --docker-username=...` para autenticación a registries privados.",
          "`docker trust sign imagen:tag` — Firma de imágenes con Notary para verificar integridad."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Publicar en Docker Hub y registry privado",
        steps: [
          { cmd: "docker login", desc: "Autentica con Docker Hub. Pedirá usuario y contraseña (o token de acceso)." },
          { cmd: "# Asumiendo que tenés mi-api:v1 del nivel anterior\n# Tagear con tu usuario de Docker Hub\ndocker tag mi-api:v1 TU_USUARIO/mi-api:v1.0.0\ndocker tag mi-api:v1 TU_USUARIO/mi-api:latest\ndocker images TU_USUARIO/mi-api", desc: "Reemplazá TU_USUARIO. El tag no copia la imagen — solo crea un alias al mismo manifest." },
          { cmd: "docker push TU_USUARIO/mi-api:v1.0.0\ndocker push TU_USUARIO/mi-api:latest", desc: "Subida al Docker Hub. Observá cómo se suben las capas individualmente y cuántas ya existían." },
          { cmd: "# Simular pull desde otra máquina\ndocker image rm TU_USUARIO/mi-api:v1.0.0 TU_USUARIO/mi-api:latest\ndocker pull TU_USUARIO/mi-api:v1.0.0\ndocker run --rm TU_USUARIO/mi-api:v1.0.0 python -c 'print(\"funciona\")'", desc: "Borrás la imagen local y la volvés a bajar — simula lo que haría un servidor de producción." },
          { cmd: "# Registry privado local\ndocker run -d \\\n  --name registry \\\n  -p 5000:5000 \\\n  -v $(pwd)/registry-data:/var/lib/registry \\\n  registry:2", desc: "Registry privado corriendo en localhost:5000 con datos persistidos en el host." },
          { cmd: "docker tag mi-api:v1 localhost:5000/mi-api:v1\ndocker push localhost:5000/mi-api:v1", desc: "Push al registry privado local." },
          { cmd: "curl http://localhost:5000/v2/_catalog\ncurl http://localhost:5000/v2/mi-api/tags/list", desc: "La API del registry devuelve las imágenes almacenadas. Protocolo OCI Distribution Spec." },
          { cmd: "# Ver digest de la imagen subida\ndocker images --digests localhost:5000/mi-api\n# Pull por digest\ndocker pull localhost:5000/mi-api@$(docker inspect localhost:5000/mi-api:v1 --format '{{.RepoDigests}}' | tr -d '[]' | cut -d@ -f2)", desc: "Pull por digest — reproducibilidad garantizada independiente del tag." }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Docker Compose — Fundamentos",
    etapa: "compose",
    etapaLabel: "Etapa II — Docker Compose",
    objetivo: "Entender qué es Docker Compose, por qué existe y cómo definir aplicaciones multi-contenedor con un archivo YAML.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Hasta ahora correr un stack completo requería ejecutar un comando docker run por cada servicio, en el orden correcto, con todos los flags, redes y volúmenes. Para una app con backend + base de datos + cache + nginx, eso son cuatro comandos complejos que tenés que recordar, coordinar y documentar.

¿Y si querés compartirlo con tu equipo? ¿O levantarlo en un servidor de staging? Mandás un Slack con cuatro comandos y rezás que los copien bien.

Docker Compose resuelve exactamente esto: define toda tu aplicación — todos sus servicios, redes y volúmenes — en un archivo YAML versionado junto con tu código.`
      },
      {
        type: "analogy",
        title: "La analogía de la partitura",
        body: `Cada instrumento de una orquesta sabe qué tocar. Pero sin una partitura que diga cuándo entra cada uno, en qué orden y qué tempo, el resultado es ruido.

Docker Compose es la partitura de tu aplicación. Define qué servicios existen, cómo se comunican, qué volúmenes usan, qué variables de entorno reciben y en qué orden deben arrancar. Un solo comando — \`docker compose up\` — levanta toda la orquesta sincronizada.`
      },
      {
        type: "diagram",
        title: "Sin Compose vs Con Compose",
        diagram: `Sin Compose — 4 comandos coordinados manualmente:

docker network create app-net
docker volume create pgdata

docker run -d \\
  --name postgres --network app-net \\
  -e POSTGRES_PASSWORD=secret \\
  -v pgdata:/var/lib/postgresql/data \\
  postgres:16-alpine

docker run -d \\
  --name redis --network app-net \\
  redis:7-alpine

docker run -d \\
  --name backend --network app-net \\
  -e DB_HOST=postgres -e CACHE_HOST=redis \\
  -p 8000:8000 mi-api:latest

docker run -d \\
  --name nginx --network app-net \\
  -p 80:80 nginx:alpine

─────────────────────────────────────────────────────────

Con Compose — 1 archivo, 1 comando:

docker compose up -d`
      },
      {
        type: "code",
        title: "Estructura del archivo compose.yaml",
        code: `# compose.yaml (nombre recomendado; también acepta docker-compose.yml)
# Spec: https://compose-spec.io

services:          # Los contenedores de la aplicación
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: miapp
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - private

  redis:
    image: redis:7-alpine
    networks:
      - private

  backend:
    build: .       # Construye desde el Dockerfile del directorio actual
    ports:
      - "8000:8000"
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      CACHE_HOST: redis
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - private
      - public

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
    networks:
      - public

volumes:
  pgdata:          # Named volume gestionado por Docker

networks:
  public:          # Red para tráfico externo
  private:         # Red interna — DB y Redis no expuestos`
      },
      {
        type: "concepts",
        title: "Comandos esenciales de Compose",
        items: [
          "`docker compose up` — Crea y arranca todos los servicios. `-d` en background (detached).",
          "`docker compose up --build` — Reconstruye las imágenes antes de arrancar. Útil cuando cambiaste el Dockerfile.",
          "`docker compose down` — Para y elimina contenedores, redes. Los volúmenes persisten.",
          "`docker compose down -v` — También elimina los volúmenes. **Cuidado: borra datos.**",
          "`docker compose ps` — Estado de todos los servicios del proyecto.",
          "`docker compose logs` — Logs de todos los servicios mezclados. `-f` para follow. `docker compose logs backend` para uno solo.",
          "`docker compose restart backend` — Reinicia solo un servicio.",
          "`docker compose exec backend bash` — Shell dentro del contenedor del servicio.",
          "`docker compose run --rm backend python manage.py migrate` — Corre un comando one-shot en un nuevo contenedor del servicio.",
          "`docker compose pull` — Actualiza las imágenes de todos los servicios.",
          "`docker compose config` — Valida y muestra el compose.yaml resuelto (con variables interpoladas)."
        ]
      },
      {
        type: "concepts",
        title: "Variables de entorno — las tres formas",
        body: `Hardcodear valores en el compose.yaml es un anti-pattern. Usá variables de entorno para separar configuración de definición.`,
        items: [
          "**Inline**: `environment: DB_PASS: secret` — Nunca en producción. Queda en git.",
          "**Variable del host**: `environment: DB_PASS: $DB_PASS` — Toma el valor del shell que lanza Compose.",
          "**Archivo .env**: Compose busca `.env` en el mismo directorio automáticamente. No requiere configuración.",
          "**env_file explícito**: `env_file: - .env.production` — Para archivos con otro nombre o en otra ruta.",
          "El `.env` **no** se pasa a los contenedores automáticamente — solo es para interpolación en el YAML. Para pasarlo al contenedor, usá `env_file` o `environment`.",
          "En CI/CD: las variables del entorno del runner se inyectan al compose. Nunca commitees el `.env` de producción.",
          "`docker compose config` muestra las variables interpoladas — útil para debuggear."
        ]
      },
      {
        type: "code",
        title: "Archivo .env — configuración por entorno",
        code: `# .env (en el mismo directorio que compose.yaml)
# Este archivo NO va a git — agregalo a .gitignore
# Provide .env.example con valores de desarrollo para el equipo

# Base de datos
POSTGRES_USER=admin
POSTGRES_PASSWORD=dev_password_change_in_prod
POSTGRES_DB=miapp_dev

# Aplicación
APP_ENV=development
APP_PORT=8000
APP_SECRET_KEY=dev-secret-key-insecure

# Registry
IMAGE_TAG=latest

# En compose.yaml se usa así:
# services:
#   backend:
#     image: ghcr.io/miorg/mi-api:\${IMAGE_TAG}
#     ports:
#       - "\${APP_PORT}:8000"
#     environment:
#       SECRET_KEY: \${APP_SECRET_KEY}
#       DB_NAME: \${POSTGRES_DB}`
      },
      {
        type: "concepts",
        title: "depends_on y healthchecks — orden de arranque",
        body: `\`depends_on\` no espera que el servicio esté listo — solo que el contenedor haya arrancado. Para esperar que el servicio esté realmente disponible, combiná con healthchecks.`,
        items: [
          "`depends_on: [postgres]` — Solo espera que el contenedor esté en estado 'running'. No que PostgreSQL acepte conexiones.",
          "`depends_on: postgres: condition: service_healthy` — Espera a que el healthcheck del servicio devuelva healthy.",
          "El healthcheck se define en el servicio dependido o en el Dockerfile con `HEALTHCHECK`.",
          "`condition: service_started` — Comportamiento default: contenedor arrancado, no necesariamente listo.",
          "`condition: service_completed_successfully` — Para servicios one-shot (migrations, seed data).",
          "Alternativa histórica: scripts `wait-for-it.sh` o `dockerize` — workarounds antes de que Compose soportara healthchecks en depends_on."
        ]
      },
      {
        type: "code",
        title: "Healthchecks en Compose",
        code: `services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 5s       # Frecuencia del check
      timeout: 5s        # Tiempo máximo para que el check responda
      retries: 5         # Intentos antes de marcar como unhealthy
      start_period: 10s  # Gracia inicial antes del primer check

  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 3

  backend:
    build: .
    depends_on:
      postgres:
        condition: service_healthy   # Espera hasta que pg_isready devuelva OK
      redis:
        condition: service_healthy   # Espera hasta que redis-cli ping responda
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 15s`
      },
      {
        type: "concepts",
        title: "Proyecto y naming — cómo Compose nombra los recursos",
        items: [
          "Compose prefija todos los recursos con el nombre del proyecto: `miapp_postgres_1`, `miapp_app-net`.",
          "El nombre del proyecto por defecto es el nombre del directorio donde está el compose.yaml.",
          "`docker compose -p mistack up` — Nombre de proyecto explícito. Útil para correr múltiples instancias.",
          "La variable `COMPOSE_PROJECT_NAME` en `.env` también lo define.",
          "`name: miapp` al inicio del compose.yaml — Define el nombre desde el archivo (Compose Spec v3.9+).",
          "Con el nombre del proyecto podés identificar qué contenedores pertenecen a qué stack con `docker ps`."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Stack completo con Compose",
        steps: [
          { cmd: "mkdir stack-demo && cd stack-demo", desc: "Crea el directorio del proyecto." },
          { cmd: "cat > compose.yaml << 'EOF'\nname: stack-demo\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: demo\n      POSTGRES_USER: admin\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U admin -d demo\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n      start_period: 10s\n\n  adminer:\n    image: adminer\n    ports:\n      - \"8080:8080\"\n    depends_on:\n      postgres:\n        condition: service_healthy\n\nvolumes:\n  pgdata:\nEOF", desc: "Stack con PostgreSQL + Adminer (UI web para la DB). Mínimo y funcional." },
          { cmd: "docker compose up -d", desc: "Levanta el stack. Compose espera que postgres esté healthy antes de arrancar adminer." },
          { cmd: "docker compose ps", desc: "Estado de todos los servicios. Verás el healthcheck status de postgres." },
          { cmd: "docker compose logs postgres --tail 20", desc: "Logs de inicialización de PostgreSQL." },
          { cmd: "docker compose exec postgres psql -U admin -d demo -c \"CREATE TABLE test (id serial, valor text);\"\ndocker compose exec postgres psql -U admin -d demo -c \"INSERT INTO test (valor) VALUES ('desde compose');\"", desc: "Ejecuta SQL dentro del contenedor de postgres vía Compose." },
          { cmd: "docker compose exec postgres psql -U admin -d demo -c \"SELECT * FROM test;\"", desc: "Verifica los datos insertados." },
          { cmd: "docker compose down\ndocker compose up -d\ndocker compose exec postgres psql -U admin -d demo -c \"SELECT * FROM test;\"", desc: "Down y up de nuevo — los datos persisten porque el volumen pgdata sobrevive." },
          { cmd: "docker compose down -v\ndocker compose ps", desc: "Down con -v elimina el volumen. Los datos de la DB desaparecen. Contenedores también." }
        ]
      }
    ]
  },
  {
    id: 11,
    title: "Docker Compose — Redes, Volúmenes y Secrets",
    etapa: "compose",
    etapaLabel: "Etapa II — Docker Compose",
    objetivo: "Dominar la configuración avanzada de redes y volúmenes en Compose, y gestionar secretos de forma segura.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Un compose.yaml básico funciona. Pero en el mundo real necesitás separar servicios en redes distintas por seguridad, gestionar datos persistentes con control, y manejar credenciales sin que terminen en el código fuente o en la historia de git.

¿Cómo hacés que nginx pueda hablar con tu backend pero no con tu base de datos? ¿Cómo compartís un volumen entre dos servicios? ¿Cómo pasás un token de API sin hardcodearlo en el yaml?

Estas decisiones de configuración determinan si tu stack es robusto o frágil, seguro o vulnerable.`
      },
      {
        type: "diagram",
        title: "Arquitectura de redes en un stack real",
        diagram: `Internet
    │
    │ :80/:443
    ▼
┌─────────────────────────────────────────────────────────┐
│  Red: public                                            │
│                                                         │
│  nginx ──────────────────────────────────────────────   │
│    │                                                     │
└────┼────────────────────────────────────────────────────┘
     │ :8000
┌────┼────────────────────────────────────────────────────┐
│    │  Red: backend-net                                  │
│    ▼                                                     │
│  api ──────────────────────────────────────────────     │
│    │ :5432              │ :6379                          │
└────┼────────────────────┼───────────────────────────────┘
┌────┼────────────────────┼───────────────────────────────┐
│    │  Red: data-net     │                               │
│    ▼                    ▼                               │
│  postgres            redis                              │
│                                                         │
└─────────────────────────────────────────────────────────┘

nginx: en public + backend-net
api: en backend-net + data-net
postgres y redis: solo en data-net (no expuestos)`
      },
      {
        type: "code",
        title: "Redes en Compose — configuración completa",
        code: `services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    networks:
      - public
      - backend-net

  api:
    build: .
    networks:
      - backend-net
      - data-net
    # Sin ports — solo accesible desde nginx, no desde el exterior

  postgres:
    image: postgres:16-alpine
    networks:
      - data-net
    # Sin ports — completamente aislada del exterior

  redis:
    image: redis:7-alpine
    networks:
      - data-net

networks:
  public:
    driver: bridge
    # Red para tráfico que viene de internet

  backend-net:
    driver: bridge
    # Red de comunicación nginx ↔ api

  data-net:
    driver: bridge
    # Red de datos — api ↔ postgres, api ↔ redis
    internal: true   # Los contenedores en esta red NO pueden salir a internet`
      },
      {
        type: "code",
        title: "Redes externas — compartir entre stacks",
        code: `# Stack A — define la red
# compose-database.yaml
networks:
  shared-db:
    name: empresa-db-net  # Nombre explícito en Docker

services:
  postgres:
    image: postgres:16-alpine
    networks:
      - shared-db

# ─────────────────────────────────────────────────────────

# Stack B — usa la red definida por Stack A
# compose-app.yaml
networks:
  shared-db:
    external: true        # No la crea — espera que ya exista
    name: empresa-db-net

services:
  backend:
    build: .
    networks:
      - shared-db
    environment:
      DB_HOST: postgres   # Resuelve el contenedor del otro stack por nombre`
      },
      {
        type: "concepts",
        title: "Volúmenes en Compose — todas las opciones",
        items: [
          "**Named volume**: `volumes: - pgdata:/var/lib/postgresql/data` — Gestionado por Docker, persiste entre up/down.",
          "**Bind mount**: `volumes: - ./data:/var/lib/postgresql/data` — Path del host. Útil en desarrollo para hot-reload.",
          "**Tmpfs**: `tmpfs: - /tmp:size=100m` — En memoria, no persiste. Para archivos temporales sensibles.",
          "**Volume externo**: `external: true` — Volume creado fuera de Compose, no lo gestiona el stack.",
          "Volúmenes compartidos entre servicios: el mismo volumen nombrado puede montarse en múltiples servicios simultáneamente.",
          "`:ro` para solo lectura: `- pgdata:/data:ro` — El contenedor no puede modificar el volumen.",
          "`docker compose down -v` borra **solo** los volúmenes definidos en el compose, no los externos."
        ]
      },
      {
        type: "code",
        title: "Volúmenes avanzados — compartidos y externos",
        code: `services:
  postgres:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data        # Named volume

  backup:
    image: alpine
    volumes:
      - pgdata:/data:ro                         # Mismo volumen, solo lectura
      - ./backups:/backups                      # Bind mount para guardar backups
    command: tar czf /backups/backup.tar.gz -C /data .

  app:
    build: .
    volumes:
      - ./src:/app/src                          # Bind mount — hot reload en desarrollo
      - app-cache:/app/.cache                   # Cache persistente entre reinicios
      - /app/node_modules                       # Volumen anónimo — no sobrescribir con el host

  uploads-processor:
    image: imagemagick-worker
    volumes:
      - uploads:/data/uploads:ro               # Lee los uploads sin poder modificarlos

  nginx:
    image: nginx:alpine
    volumes:
      - uploads:/var/www/uploads:ro            # Sirve los mismos archivos

volumes:
  pgdata:
  app-cache:
  uploads:
    external: true      # Creado manualmente con: docker volume create uploads`
      },
      {
        type: "concepts",
        title: "Secrets en Docker Compose",
        body: `Los secrets son la forma correcta de pasar información sensible — contraseñas, tokens, certificados — sin exponerlos en variables de entorno ni en el YAML.`,
        items: [
          "En modo Compose standalone (sin Swarm): los secrets son bind mounts a archivos locales montados en `/run/secrets/nombre`.",
          "En Docker Swarm: los secrets están cifrados en el raft store del cluster y se distribuyen de forma segura.",
          "Los secrets se montan como archivos, no como variables de entorno — el proceso los lee en runtime.",
          "Ventaja sobre ENV: no aparecen en `docker inspect`, en los logs de proceso, ni en `ps aux`.",
          "`docker compose config` no muestra el contenido de los secrets — solo su configuración.",
          "Para desarrollo: archivos locales `./secrets/db_password.txt`. Para producción con Swarm: `docker secret create`."
        ]
      },
      {
        type: "code",
        title: "Secrets en Compose — modo standalone",
        code: `# Crear los archivos de secretos (fuera del proyecto, nunca en git)
# echo "contraseña_real_aqui" > /run/secrets/db_password
# echo "token_api_aqui" > /run/secrets/api_token

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_DB: miapp
      # PostgreSQL busca POSTGRES_PASSWORD_FILE si no hay POSTGRES_PASSWORD
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password

  backend:
    build: .
    environment:
      DB_HOST: postgres
      DB_USER: admin
      DB_NAME: miapp
      # La app lee el secret como archivo, no como env var
      # with open('/run/secrets/db_password') as f:
      #     DB_PASSWORD = f.read().strip()
    secrets:
      - db_password
      - api_token

secrets:
  db_password:
    file: ./secrets/db_password.txt   # Path relativo al compose.yaml

  api_token:
    file: ./secrets/api_token.txt

# .gitignore debe incluir:
# secrets/`
      },
      {
        type: "concepts",
        title: "Override files — configuración por entorno",
        body: `Compose soporta múltiples archivos que se fusionan. Esto permite tener una configuración base y sobreescribir solo lo necesario para cada entorno.`,
        items: [
          "`compose.yaml` — Configuración base, aplica a todos los entornos.",
          "`compose.override.yaml` — Se fusiona automáticamente con el base cuando corés `docker compose up`.",
          "`docker compose -f compose.yaml -f compose.prod.yaml up` — Fusión explícita para producción.",
          "La fusión suma arrays (volumes, ports, env_file) y sobreescribe valores escalares.",
          "Patrón: en base definís la estructura, en override de dev agregás bind mounts y debug ports, en override de prod configurás restart policies y limits.",
          "`docker compose config` muestra el YAML final fusionado — verificá que sea lo esperado antes de deployar."
        ]
      },
      {
        type: "code",
        title: "Override files — desarrollo vs producción",
        code: `# compose.yaml — base (va a git)
services:
  backend:
    image: ghcr.io/miorg/mi-api:\${IMAGE_TAG:-latest}
    environment:
      DB_HOST: postgres

  postgres:
    image: postgres:16-alpine

# ─────────────────────────────────────────────────────────

# compose.override.yaml — desarrollo (va a git)
# Se fusiona AUTOMÁTICAMENTE con compose.yaml
services:
  backend:
    build: .               # En dev, construimos local en lugar de usar la imagen
    volumes:
      - .:/app             # Hot reload
      - /app/.venv         # No sobrescribir el venv del contenedor
    environment:
      DEBUG: "true"
      RELOAD: "true"
    ports:
      - "8000:8000"        # Exponer en dev para acceso directo

  postgres:
    ports:
      - "5432:5432"        # Exponer DB en dev para acceder con DBeaver/pgAdmin

# ─────────────────────────────────────────────────────────

# compose.prod.yaml — producción (va a git, sin secrets hardcodeados)
services:
  backend:
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
    secrets:
      - db_password

  postgres:
    restart: unless-stopped
    # Sin ports — no exponer la DB en producción

secrets:
  db_password:
    external: true   # En Swarm, creado con: docker secret create db_password -

# Deploy en producción:
# docker compose -f compose.yaml -f compose.prod.yaml up -d`
      },
      {
        type: "lab",
        title: "Laboratorio: Stack seguro con redes y secrets",
        steps: [
          { cmd: "mkdir secure-stack && cd secure-stack\nmkdir -p secrets", desc: "Estructura del proyecto con directorio para secrets." },
          { cmd: "echo 'dev_db_password_123' > secrets/db_password.txt\necho 'dev_api_key_abc456' > secrets/api_key.txt\necho 'secrets/' > .gitignore", desc: "Crea archivos de secretos locales y excluye del git." },
          { cmd: "cat > compose.yaml << 'EOF'\nname: secure-stack\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: admin\n      POSTGRES_DB: miapp\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\n    networks:\n      - data-net\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U admin\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n      start_period: 10s\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  backend:\n    image: nginx:alpine\n    networks:\n      - data-net\n      - public\n    depends_on:\n      postgres:\n        condition: service_healthy\n\n  nginx:\n    image: nginx:alpine\n    ports:\n      - '80:80'\n    networks:\n      - public\n    depends_on:\n      - backend\n\nnetworks:\n  public:\n  data-net:\n    internal: true\n\nvolumes:\n  pgdata:\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt\nEOF", desc: "Stack con redes separadas y secret para la contraseña." },
          { cmd: "docker compose up -d\ndocker compose ps", desc: "Levanta el stack. Observá que postgres pasa por el healthcheck antes de que backend arranque." },
          { cmd: "docker compose exec postgres cat /run/secrets/db_password", desc: "El secret está disponible como archivo dentro del contenedor." },
          { cmd: "# Verificar que el secret NO aparece en las variables de entorno\ndocker compose exec postgres env | grep -i password || echo 'No aparece como env var — correcto'", desc: "La contraseña no está en las variables de entorno del contenedor. Seguridad mantenida." },
          { cmd: "# Verificar aislamiento de red\ndocker compose exec nginx ping -c 2 postgres 2>&1 || echo 'nginx no puede ver postgres — aislamiento correcto'", desc: "nginx está solo en la red public, no puede alcanzar postgres que está en data-net (internal)." },
          { cmd: "docker compose down -v", desc: "Limpieza completa con volúmenes." }
        ]
      }
    ]
  },
  {
    id: 12,
    title: "Docker Compose — Producción y Perfiles",
    etapa: "compose",
    etapaLabel: "Etapa II — Docker Compose",
    objetivo: "Configurar Compose para producción: profiles, límites de recursos, logging, restart policies y deployment patterns.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Compose en desarrollo es fácil. Compose en producción requiere pensar en qué pasa cuando un servicio falla, cuánta RAM puede consumir un contenedor antes de matar al host, cómo rotás los logs para no quedarte sin espacio en disco, y cómo desplegás una nueva versión sin downtime.

También necesitás servicios que solo existan en ciertos contextos: una herramienta de migrations que corre una sola vez, un servicio de debug que no debe estar en producción, un seed de datos solo para desarrollo.

Los perfiles de Compose resuelven esto de forma elegante.`
      },
      {
        type: "concepts",
        title: "Profiles — servicios condicionales",
        body: `Los profiles permiten marcar servicios como opcionales. Solo se incluyen si el perfil está activo.`,
        items: [
          "Servicios sin perfil: siempre activos con `docker compose up`.",
          "Servicios con perfil: solo activos cuando el perfil se activa explícitamente.",
          "`docker compose --profile debug up` — Activa el perfil 'debug' y los servicios marcados con él.",
          "`COMPOSE_PROFILES=debug,monitoring docker compose up` — Múltiples perfiles vía variable de entorno.",
          "`docker compose --profile tools run --rm migrations python manage.py migrate` — Corre un servicio de perfil específico.",
          "Un servicio puede tener múltiples perfiles: `profiles: [debug, development]`.",
          "Perfiles comunes: `debug`, `monitoring`, `tools`, `development`, `testing`."
        ]
      },
      {
        type: "code",
        title: "Profiles en práctica",
        code: `services:
  # Servicios base — siempre activos
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: \${DB_PASSWORD}

  backend:
    build: .
    depends_on:
      - postgres

  # Solo en desarrollo — hot reload, código montado
  backend-dev:
    build:
      context: .
      target: development    # Stage de desarrollo en multi-stage Dockerfile
    volumes:
      - .:/app
    environment:
      DEBUG: "true"
      RELOAD: "true"
    profiles: [development]

  # Herramientas de DB — solo cuando se necesitan
  migrations:
    build: .
    command: python manage.py migrate
    depends_on:
      postgres:
        condition: service_healthy
    profiles: [tools]

  seed:
    build: .
    command: python manage.py seed_data
    depends_on:
      - migrations
    profiles: [tools]

  # Monitoring — solo en producción o cuando se necesita
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    profiles: [monitoring]

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"
    profiles: [monitoring]

  # Debug — pgAdmin para inspeccionar la DB
  pgadmin:
    image: dpage/pgadmin4
    environment:
      PGADMIN_DEFAULT_EMAIL: dev@local.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    profiles: [debug]

volumes:
  prometheus-data:
  grafana-data:

# Uso:
# Desarrollo:  docker compose --profile development up
# Migrations:  docker compose --profile tools run --rm migrations
# Monitoring:  docker compose --profile monitoring up
# Debug DB:    docker compose --profile debug up pgadmin`
      },
      {
        type: "concepts",
        title: "Límites de recursos — deploy.resources",
        body: `Sin límites, un proceso descontrolado puede consumir toda la CPU y RAM del host. En producción, siempre definí límites.`,
        items: [
          "`deploy.resources.limits.cpus: '0.5'` — Máximo medio core. Cgroups lo hace cumplir.",
          "`deploy.resources.limits.memory: 512M` — Si supera 512MB, el kernel mata el proceso (OOM Kill).",
          "`deploy.resources.reservations.cpus: '0.1'` — CPU garantizada en sistemas con múltiples servicios.",
          "`deploy.resources.reservations.memory: 128M` — RAM garantizada — el scheduler la reserva.",
          "Los límites aplican con `docker compose up` en modo standalone (sin Swarm).",
          "`docker compose ps --format json | jq '.[].MemoryUsage'` — Monitoreo de uso en tiempo real.",
          "Si un servicio muere por OOM: `docker compose logs servicio` mostrará 'Killed' o el kernel logeará en `dmesg`."
        ]
      },
      {
        type: "code",
        title: "Configuración de producción completa",
        code: `# compose.prod.yaml
services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: \${DB_USER}
      POSTGRES_DB: \${DB_NAME}
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - data-net
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${DB_USER} -d \${DB_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"

  backend:
    image: ghcr.io/miorg/mi-api:\${IMAGE_TAG}
    restart: unless-stopped
    environment:
      DB_HOST: postgres
      DB_USER: \${DB_USER}
      DB_NAME: \${DB_NAME}
      WORKERS: "4"
    secrets:
      - db_password
    networks:
      - data-net
      - public
    depends_on:
      postgres:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - static-files:/var/www/static:ro
    networks:
      - public
    depends_on:
      backend:
        condition: service_healthy
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 64M
    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

networks:
  public:
  data-net:
    internal: true

volumes:
  pgdata:
  static-files:

secrets:
  db_password:
    external: true`
      },
      {
        type: "concepts",
        title: "Logging drivers — gestión de logs",
        body: `Por defecto, Docker guarda los logs en JSON en el host. Sin configuración, pueden crecer indefinidamente y llenar el disco.`,
        items: [
          "`json-file` (default) — Guarda logs en `/var/lib/docker/containers/<id>/<id>-json.log`. Configurable con `max-size` y `max-file`.",
          "`none` — Sin logs. Para servicios muy verbosos cuya salida no importa.",
          "`syslog` — Envía logs al syslog del host. Integrado con rsyslog/journald.",
          "`journald` — Integración con systemd journal. `journalctl CONTAINER_NAME=backend -f` para seguirlos.",
          "`fluentd` — Para centralized logging con Fluentd/Fluent Bit hacia Elasticsearch o S3.",
          "`awslogs` — Envía directamente a AWS CloudWatch Logs. Requiere credenciales IAM.",
          "`gelf` — Graylog Extended Log Format. Compatible con Graylog y Logstash.",
          "En producción: configurá `max-size: '100m'` y `max-file: '5'` como mínimo para evitar que el disco se llene."
        ]
      },
      {
        type: "concepts",
        title: "Zero-downtime deployment con Compose",
        body: `Compose no tiene rolling updates nativo como Kubernetes. Pero hay patrones para minimizar el downtime.`,
        items: [
          "**Patrón básico**: `docker compose pull && docker compose up -d` — Descarga nueva imagen y recrea contenedores. Hay segundos de downtime.",
          "**Con múltiples réplicas y nginx**: `docker compose up -d --scale backend=2 --no-recreate` → actualizar uno por vez.",
          "**Blue-Green con Compose**: dos stacks (blue/prod y green/new), nginx apunta a uno, actualizás el otro, cambiás nginx.",
          "Para zero-downtime real en producción, necesitás Kubernetes o Docker Swarm. Compose standalone tiene limitaciones.",
          "`docker compose up -d --no-deps backend` — Recrea solo el backend sin tocar los servicios dependientes.",
          "Siempre testear el healthcheck antes de cambiar el tráfico — `docker compose ps` muestra el estado de salud."
        ]
      },
      {
        type: "code",
        title: "Script de deployment con Compose",
        code: `#!/bin/bash
# deploy.sh — Script de deployment con validaciones

set -euo pipefail

PROJECT_DIR="/opt/miapp"
COMPOSE_FILE="$PROJECT_DIR/compose.yaml"
COMPOSE_PROD="$PROJECT_DIR/compose.prod.yaml"

echo "=== Iniciando deployment ==="

# 1. Pull de la nueva imagen
echo "Descargando nueva imagen..."
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" pull backend

# 2. Correr migrations si las hay
echo "Corriendo migrations..."
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" \\
  --profile tools run --rm migrations

# 3. Recrear solo el backend (nginx y postgres siguen corriendo)
echo "Actualizando backend..."
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" \\
  up -d --no-deps backend

# 4. Esperar a que el healthcheck esté OK
echo "Esperando que el servicio esté listo..."
ATTEMPTS=0
MAX_ATTEMPTS=30
until docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" \\
  exec -T backend curl -sf http://localhost:8000/health > /dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ $ATTEMPTS -ge $MAX_ATTEMPTS ]; then
    echo "ERROR: el servicio no respondió después de $MAX_ATTEMPTS intentos"
    exit 1
  fi
  sleep 2
done

echo "=== Deployment exitoso ==="
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" ps`
      },
      {
        type: "lab",
        title: "Laboratorio: Stack de producción con profiles y límites",
        steps: [
          { cmd: "mkdir prod-stack && cd prod-stack", desc: "Directorio del proyecto." },
          { cmd: "cat > compose.yaml << 'EOF'\nname: prod-demo\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    restart: unless-stopped\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: miapp\n      POSTGRES_USER: admin\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U admin\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n    deploy:\n      resources:\n        limits:\n          memory: 256M\n    logging:\n      driver: json-file\n      options:\n        max-size: '20m'\n        max-file: '3'\n\n  backend:\n    image: nginx:alpine\n    restart: unless-stopped\n    ports:\n      - '8080:80'\n    depends_on:\n      postgres:\n        condition: service_healthy\n    deploy:\n      resources:\n        limits:\n          cpus: '0.5'\n          memory: 128M\n    logging:\n      driver: json-file\n      options:\n        max-size: '50m'\n        max-file: '5'\n\n  pgadmin:\n    image: dpage/pgadmin4\n    environment:\n      PGADMIN_DEFAULT_EMAIL: dev@local.com\n      PGADMIN_DEFAULT_PASSWORD: admin\n    ports:\n      - '5050:80'\n    profiles: [debug]\n\nvolumes:\n  pgdata:\nEOF", desc: "Stack con restart policies, límites de recursos, logging controlado y perfil debug." },
          { cmd: "docker compose up -d\ndocker compose ps", desc: "Levanta solo los servicios base (sin perfil debug)." },
          { cmd: "docker stats --no-stream", desc: "Ve el consumo de CPU y RAM. Con los límites activos, postgres no puede superar 256MB." },
          { cmd: "docker compose --profile debug up -d pgadmin\ndocker compose ps", desc: "Activa el servicio de pgAdmin con el perfil debug. Ahora corre junto al stack base." },
          { cmd: "# Simular un límite de memoria\ndocker compose exec postgres bash -c 'cat /sys/fs/cgroup/memory.max' 2>/dev/null || \\\ndocker compose exec postgres cat /sys/fs/cgroup/memory/memory.limit_in_bytes", desc: "Verifica el límite de memoria aplicado por cgroups al contenedor." },
          { cmd: "# Ver dónde están los logs\nls -lh /var/lib/docker/containers/ | head -5\ndocker compose logs backend --tail 10", desc: "Los logs están en json-file con rotación automática." },
          { cmd: "docker compose down --profile debug -v", desc: "Limpieza completa incluyendo los servicios con perfil." }
        ]
      }
    ]
  },
  {
    id: 13,
    title: "Seguridad en Docker",
    etapa: "docker",
    etapaLabel: "Etapa I — Fundamentos Docker",
    objetivo: "Entender los vectores de ataque más comunes en Docker y cómo mitigarlos: usuarios no-root, capabilities, seccomp, AppArmor y scanning de vulnerabilidades.",
    sections: [
      {
        type: "problem",
        title: "El problema",
        body: `Docker no es seguro por defecto. Un contenedor mal configurado puede ser la puerta de entrada a todo el host. Root dentro del contenedor puede ser root en el host bajo ciertas condiciones. Un socket de Docker mal expuesto es equivalente a dar acceso root al servidor.

Esto no significa que Docker sea inseguro — significa que la seguridad requiere decisiones conscientes. El container escapar (container breakout) es real y ocurre cuando se acumula configuración insegura.

Entender los vectores de ataque es el primer paso para defenderlos.`
      },
      {
        type: "diagram",
        title: "Superficie de ataque en Docker",
        diagram: `Vectores de ataque principales:

1. IMAGEN COMPROMETIDA
   └── imagen con malware, backdoor o CVEs críticos
   └── imagen de usuario sin verificar en Docker Hub

2. CONTENEDOR CON PRIVILEGIOS EXCESIVOS
   └── --privileged: acceso total al host (mountar /proc, /sys, /dev)
   └── --cap-add=SYS_ADMIN: casi equivalente a privileged
   └── root dentro del contenedor + vuln del kernel = host comprometido

3. SOCKET DE DOCKER EXPUESTO
   └── -v /var/run/docker.sock:/var/run/docker.sock
   └── Acceso al socket = docker run --privileged = root en el host
   └── CI/CD que expone el socket a la imagen que construyen

4. BIND MOUNTS PELIGROSOS
   └── -v /:/host o -v /etc:/etc: acceso al filesystem del host
   └── Modificar /etc/passwd desde dentro del contenedor

5. SECRETOS EN IMÁGENES
   └── Credenciales en ENV o ARG del Dockerfile quedan en capas
   └── git history con .env archivos
   └── docker history muestra args de build

6. RED SIN AISLAR
   └── Todos los contenedores en la bridge por defecto pueden verse
   └── Servicios internos con puertos publicados innecesariamente`
      },
      {
        type: "concepts",
        title: "Principio 1: Nunca corras como root",
        items: [
          "El proceso dentro del contenedor por defecto corre como root (UID 0). Si hay un container breakout, tenés root en el host.",
          "Agregá un usuario no-root al Dockerfile con `RUN adduser --system --uid 1001 appuser` y `USER appuser`.",
          "`docker run --user 1001:1001 imagen` — Sobreescribe el usuario en runtime sin modificar la imagen.",
          "Verificar: `docker exec contenedor whoami` — No debe devolver 'root'.",
          "User namespaces: mapean UID 0 del contenedor a un UID alto del host. Más aislamiento pero requiere configuración.",
          "`/etc/docker/daemon.json` con `\"userns-remap\": \"default\"` activa user namespaces globalmente.",
          "Las imágenes oficiales modernas (nginx, postgres, etc.) ya incluyen usuarios no-root — revisá su documentación."
        ]
      },
      {
        type: "concepts",
        title: "Principio 2: Capabilities — menor privilegio",
        body: `root en Linux no es un estado binario. Está dividido en capabilities. Los contenedores heredan un subconjunto por defecto. Podés reducirlo.`,
        items: [
          "Docker dropea todas las capabilities excepto un set mínimo por defecto. Aun así, incluye algunas peligrosas.",
          "`--cap-drop=ALL --cap-add=NET_BIND_SERVICE` — Dropa todo y agrega solo lo necesario.",
          "Capabilities peligrosas: `SYS_ADMIN` (casi root), `NET_ADMIN` (modificar red del host), `SYS_PTRACE` (debuggear procesos del host).",
          "**Nunca uses `--privileged`** en producción. Da acceso completo al host. Solo para herramientas de diagnóstico en contenedores de mantenimiento.",
          "`docker inspect contenedor --format '{{.HostConfig.CapAdd}}'` — Ve las capabilities agregadas.",
          "Capabilities mínimas necesarias: `CHOWN`, `SETUID`, `SETGID` para la mayoría de apps web. Muchas no necesitan ninguna."
        ]
      },
      {
        type: "code",
        title: "Contenedor hardened — configuración completa",
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
          pids: 100`
      },
      {
        type: "concepts",
        title: "Seccomp y AppArmor — filtros de syscalls",
        items: [
          "**Seccomp** (Secure Computing Mode) — Filtra qué syscalls puede hacer un proceso. Docker aplica un perfil por defecto que bloquea ~44 syscalls peligrosas.",
          "El perfil por defecto bloquea: `ptrace`, `mount`, `reboot`, `swapon`, acceso a módulos del kernel, etc.",
          "`--security-opt seccomp=unconfined` — Desactiva seccomp completamente. **No hacer en producción.**",
          "Podés crear perfiles custom en JSON basados en el perfil default de Docker (disponible en GitHub).",
          "**AppArmor** — Mandatory Access Control a nivel de proceso en el kernel. Docker aplica un perfil por defecto en distros que lo soportan (Ubuntu, Debian).",
          "`docker inspect contenedor --format '{{.HostConfig.SecurityOpt}}'` — Ver opciones de seguridad aplicadas.",
          "**gVisor** (runsc) y **Kata Containers** son alternativas que proveen mayor aislamiento a costa de performance."
        ]
      },
      {
        type: "concepts",
        title: "Scanning de vulnerabilidades — no deployar a ciegas",
        items: [
          "Las imágenes base contienen paquetes con CVEs. Escanear antes de producción es obligatorio en ambientes serios.",
          "**Docker Scout** — Integrado en Docker Desktop y CLI. `docker scout cves mi-imagen:latest` lista CVEs con severidad.",
          "**Trivy** (Aqua Security) — Open source, rápido, escanea imágenes, filesystems y repos. `trivy image mi-imagen:latest`.",
          "**Snyk** — Integrable en CI/CD. `snyk container test mi-imagen:latest`.",
          "**Grype** (Anchore) — Alternativa open source rápida y precisa.",
          "Automatizá el escaneo en CI: `trivy image --exit-code 1 --severity CRITICAL mi-imagen:$TAG` falla el build si hay CVEs críticos.",
          "Reconstruí imágenes regularmente incluso sin cambios de código — las actualizaciones de seguridad de la imagen base llegan vía pull.",
          "Usá `FROM python:3.12-slim@sha256:...` (digest fijo) para builds reproducibles, pero actualizá el digest regularmente."
        ]
      },
      {
        type: "concepts",
        title: "El socket de Docker — el error más peligroso",
        body: `Montar el socket de Docker en un contenedor es equivalente a darle root en el host. Es la misconfiguration más común y más peligrosa.`,
        items: [
          "**El problema**: `-v /var/run/docker.sock:/var/run/docker.sock` permite que el contenedor hable con el daemon.",
          "Desde ese contenedor: `docker run --privileged -v /:/host ubuntu chroot /host` — acceso completo al host.",
          "**Usos legítimos**: Portainer, Watchtower, CI/CD que necesitan construir imágenes (DinD). Siempre con riesgo calculado.",
          "**Alternativa para CI**: Docker-in-Docker (DinD) con `--privileged` en un contenedor aislado, o usar BuildKit en modo rootless.",
          "**Alternativa a Portainer**: UI de gestión que usen TCP con TLS mutual authentication en lugar del socket Unix.",
          "Si necesitás el socket, usá **Docker Socket Proxy** (Tecnativa) — expone solo los endpoints que necesitás con una capa de autorización.",
          "Auditá todos los compose.yaml y manifiestos buscando `/var/run/docker.sock`."
        ]
      },
      {
        type: "concepts",
        title: "Secrets — nunca en la imagen",
        items: [
          "**ENV en Dockerfile**: `ENV DB_PASS=secreto` — visible en `docker inspect`, en `docker history`, en el registry.",
          "**ARG en Dockerfile**: `ARG DB_PASS` — no persiste en la imagen final, pero visible en `docker history --no-trunc` y en las capas de build.",
          "Con BuildKit: `RUN --mount=type=secret,id=db_pass cat /run/secrets/db_pass` — el secreto nunca queda en ninguna capa.",
          "En runtime: variables de entorno son visibles en `/proc/PID/environ` dentro del contenedor. Mejor que en capas, pero no ideal.",
          "Lo más seguro en runtime: leer secretos de archivos montados (Docker secrets, Kubernetes secrets como volúmenes).",
          "Escáneres de secretos en git: `truffleHog`, `gitleaks`, `detect-secrets` — integrá en pre-commit hooks.",
          "Si un secret termina en una imagen publicada: rotalo inmediatamente, no alcanza con borrar la imagen del registry (puede estar cacheada)."
        ]
      },
      {
        type: "lab",
        title: "Laboratorio: Auditando y hardening de contenedores",
        steps: [
          { cmd: "# Verificar usuario por defecto de una imagen\ndocker run --rm nginx:alpine whoami\ndocker run --rm postgres:16-alpine whoami", desc: "nginx corre como root por defecto. postgres corre como 'postgres' (no root) — buena práctica incorporada." },
          { cmd: "# Ver capabilities de un contenedor\ndocker run --rm --name caps-test -d nginx:alpine sleep 60\ndocker inspect caps-test --format '{{.HostConfig.CapAdd}}'\ndocker inspect caps-test --format '{{.HostConfig.CapDrop}}'\ndocker rm -f caps-test", desc: "Muestra las capabilities agregadas y dropeadas. Por defecto, Docker ya dropea algunas." },
          { cmd: "# Correr nginx como non-root con cap-drop\ndocker run --rm -d \\\n  --name nginx-secure \\\n  --user 101:101 \\\n  --cap-drop=ALL \\\n  --cap-add=NET_BIND_SERVICE \\\n  --read-only \\\n  --tmpfs /var/cache/nginx:uid=101,gid=101 \\\n  --tmpfs /var/run:uid=101,gid=101 \\\n  -p 8080:8080 \\\n  nginx:alpine\ndocker exec nginx-secure whoami", desc: "nginx corriendo como usuario 101 (www-data), filesystem de solo lectura, capabilities mínimas." },
          { cmd: "# Instalar trivy y escanear\nif command -v trivy &>/dev/null; then\n  trivy image --severity HIGH,CRITICAL nginx:alpine\nelse\n  echo 'Trivy no instalado. Usando docker scout:'\n  docker scout cves nginx:alpine 2>/dev/null || echo 'Instala trivy: https://trivy.dev'\nfi", desc: "Escaneo de CVEs en la imagen nginx:alpine. Alpine tiene muy pocos — por eso es popular." },
          { cmd: "# Demostrar el peligro del socket\n# (en un entorno seguro de prueba)\ndocker run --rm \\\n  -v /var/run/docker.sock:/var/run/docker.sock \\\n  alpine sh -c 'apk add --quiet curl && curl -s --unix-socket /var/run/docker.sock http://localhost/version | head -c 200'", desc: "Un contenedor con el socket puede hablar con el daemon. Desde aquí podría crear contenedores con --privileged." },
          { cmd: "# Comparar imagen con y sin secreto en ENV\ndocker build -t con-secreto - << 'EOF'\nFROM alpine\nENV API_KEY=secreto_expuesto_en_imagen\nCMD echo hola\nEOF\ndocker history con-secreto --no-trunc | grep API_KEY", desc: "El secreto es visible en el historial de la imagen — cualquiera que acceda a la imagen lo ve." },
          { cmd: "docker rm -f nginx-secure 2>/dev/null; docker rmi con-secreto 2>/dev/null; echo 'Limpieza lista'", desc: "Limpieza de los artefactos del lab." }
        ]
      }
    ]
  }
];


export function getNivel(id) {
  return niveles.find(n => n.id === id) ?? null;
}

export default {
  id: 0,
  title: 'Introducción',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo: 'Entender qué es Docker, qué problema resuelve y cómo se posiciona frente a otras tecnologías.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Imaginá que terminaste de desarrollar tu aplicación. Funciona perfectamente en tu máquina. La desplegás en el servidor de producción… y no arranca. El error dice que falta una librería. O que la versión de Python es distinta. O que una variable de entorno no existe.

Este problema tiene nombre: *"works on my machine"*. Y destruyó releases, atrasó proyectos y quemó a miles de equipos durante décadas.

El problema no es solo el deploy inicial. Es cada vez que un developer nuevo clona el repo, cada vez que migrás a un servidor nuevo, cada vez que actualizás una dependencia sin querer romper otra. El entorno de ejecución es tan parte de la aplicación como el código mismo.`,
    },
    {
      type: 'analogy',
      title: 'La analogía del contenedor de barco',
      body: `Antes de los contenedores estandarizados, cada mercancía se cargaba de forma diferente: bolsas, cajones, fardos. Los puertos necesitaban trabajadores especializados para cada tipo. Era lento, caro e impredecible.

Con los contenedores estandarizados, da igual si adentro hay bananas, electrónica o ropa. El barco, el camión y la grúa saben exactamente cómo manejarlo. El contenedor es la interfaz estándar.

Docker hace lo mismo con el software: empaqueta tu aplicación + sus dependencias + su configuración + su entorno de ejecución en una unidad estándar que corre igual en cualquier máquina que tenga Docker instalado. Tu laptop, el servidor de CI, el servidor de staging, producción — todos ven exactamente el mismo contenedor.`,
    },
    {
      type: 'concepts',
      title: '¿Qué es Docker?',
      items: [
        'Docker es una plataforma de contenedores que empaqueta aplicaciones con todo lo que necesitan para correr.',
        'Un contenedor es un proceso aislado que comparte el kernel del sistema operativo anfitrión pero tiene su propio filesystem, red y espacio de procesos.',
        'A diferencia de una VM, no virtualiza hardware. No tiene su propio kernel. Es más liviano, arranca en milisegundos y usa menos RAM.',
        'Docker estandarizó los contenedores Linux y creó el ecosistema: CLI, registry, compose, swarm y más.',
        'Detrás de escena usa tecnologías del kernel Linux que ya existían: namespaces, cgroups y union filesystems.',
        'Docker Inc. fue fundada en 2013. La tecnología fue open-sourceada desde el primer día.',
        'Hoy el runtime subyacente (containerd) es independiente de Docker y lo usa Kubernetes directamente.',
        'El formato de imagen OCI (Open Container Initiative) es un estándar abierto — no estás atado a Docker.',
      ],
    },
    {
      type: 'comparison',
      title: 'Docker vs VMs vs bare metal',
      rows: [
        { feature: 'Arranque', vm: 'Minutos (boot de OS)', docker: 'Milisegundos (proceso)' },
        { feature: 'Tamaño', vm: 'GB (OS completo)', docker: 'MB (solo diferencias)' },
        {
          feature: 'Aislamiento',
          vm: 'Completo (hardware virtualizado)',
          docker: 'Proceso (kernel compartido)',
        },
        {
          feature: 'Portabilidad',
          vm: 'Media (depende del hypervisor)',
          docker: 'Alta (cualquier host Linux/Mac/Win)',
        },
        { feature: 'Overhead de RAM', vm: 'Alto (OS por VM)', docker: 'Mínimo (solo el proceso)' },
        { feature: 'Ecosistema', vm: 'VMware, VirtualBox, KVM', docker: 'Docker Hub, Compose, K8s, GHCR' },
        { feature: 'Seguridad', vm: 'Mayor aislamiento', docker: 'Menor (kernel compartido)' },
        { feature: 'Reproducibilidad', vm: 'Media', docker: 'Alta (imagen inmutable)' },
      ],
    },
    {
      type: 'history',
      title: 'Historia y evolución',
      items: [
        '**2006** — Google introduce cgroups en el kernel Linux 2.6.24 para limitar recursos de procesos.',
        '**2008** — Linux Containers (LXC) aparece: primer sistema completo de contenedores en Linux usando namespaces + cgroups.',
        '**2013** — Solomon Hykes presenta Docker en PyCon. Open source desde el primer día. Usa LXC inicialmente.',
        '**2014** — Docker 1.0. Adopción masiva en la industria. Docker reemplaza LXC con su propio runtime (libcontainer).',
        '**2015** — Open Container Initiative (OCI): Google, Docker, CoreOS y otros crean estándares abiertos para runtimes e imágenes.',
        '**2016** — Docker Inc. separa containerd como proyecto independiente donado a la CNCF.',
        '**2017** — Kubernetes adopta containerd como runtime. Docker Swarm pierde la guerra de orquestadores.',
        '**2019** — Docker Desktop para Mac y Windows se vuelve el estándar para desarrollo local.',
        '**2020** — Docker Hub introduce límites de pull rate para usuarios gratuitos. Surge GHCR como alternativa.',
        '**2022** — Docker Desktop requiere suscripción para empresas grandes. Alternativas como Podman ganan tracción.',
        '**2024** — El ecosistema incluye Podman, containerd, nerdctl, Lima como alternativas compatibles con OCI.',
      ],
    },
    {
      type: 'diagram',
      title: 'Arquitectura general — la cadena completa',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 640 700" role="img" aria-label="docker run baja por CLI, daemon y containerd hasta que runc invoca clone() en el kernel Linux">
      <defs>
        <marker id="arrow-00a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="320" y="26" text-anchor="middle" font-size="12">docker run nginx</text>
      <line x1="320" y1="36" x2="320" y2="66" stroke="currentColor" marker-end="url(#arrow-00a)"/>

      <rect x="120" y="70" width="400" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="100" text-anchor="middle" font-size="13">Docker CLI (cliente)</text>

      <line x1="320" y1="120" x2="320" y2="158" stroke="currentColor" marker-end="url(#arrow-00a)"/>
      <rect x="196" y="133" width="248" height="16" fill="#0a0d16"/>
      <text x="320" y="145" text-anchor="middle" font-size="10">REST API · /var/run/docker.sock</text>

      <rect x="120" y="164" width="400" height="60" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="188" text-anchor="middle" font-size="13">Docker Daemon (dockerd)</text>
      <text x="320" y="206" text-anchor="middle" font-size="10">gestiona imágenes, contenedores, redes, volúmenes</text>

      <line x1="320" y1="224" x2="320" y2="262" stroke="currentColor" marker-end="url(#arrow-00a)"/>
      <rect x="292" y="233" width="56" height="16" fill="#0a0d16"/>
      <text x="320" y="245" text-anchor="middle" font-size="10">gRPC</text>

      <rect x="120" y="268" width="400" height="130" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="288" text-anchor="middle" font-size="13">containerd (runtime de alto nivel)</text>

      <rect x="136" y="300" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="194" y="326" text-anchor="middle" font-size="11">Snapshotter</text>
      <text x="194" y="342" text-anchor="middle" font-size="9">(overlayfs)</text>

      <rect x="262" y="300" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="320" y="326" text-anchor="middle" font-size="11">Content store</text>
      <text x="320" y="342" text-anchor="middle" font-size="9">(imágenes)</text>

      <rect x="388" y="300" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="446" y="326" text-anchor="middle" font-size="11">Task service</text>
      <text x="446" y="342" text-anchor="middle" font-size="9">(lifecycle)</text>

      <line x1="320" y1="398" x2="320" y2="440" stroke="currentColor" marker-end="url(#arrow-00a)"/>
      <rect x="252" y="411" width="136" height="16" fill="#0a0d16"/>
      <text x="320" y="423" text-anchor="middle" font-size="10">OCI runtime spec</text>

      <rect class="dg-accent" x="120" y="446" width="400" height="60" rx="6" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="320" y="470" text-anchor="middle" font-size="13" fill="currentColor">runc (runtime de bajo nivel OCI)</text>
      <text x="320" y="488" text-anchor="middle" font-size="10">arma namespaces/cgroups y llama a clone()</text>

      <line x1="320" y1="506" x2="320" y2="544" stroke="currentColor" marker-end="url(#arrow-00a)"/>
      <rect x="266" y="515" width="108" height="16" fill="#0a0d16"/>
      <text x="320" y="527" text-anchor="middle" font-size="10">clone() syscall</text>

      <rect x="120" y="550" width="400" height="130" rx="6" stroke="currentColor" fill="none"/>
      <text x="320" y="570" text-anchor="middle" font-size="13">Kernel Linux</text>

      <rect x="136" y="582" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="194" y="608" text-anchor="middle" font-size="11">Namespaces</text>
      <text x="194" y="624" text-anchor="middle" font-size="9">(aislamiento)</text>

      <rect x="262" y="582" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="320" y="608" text-anchor="middle" font-size="11">cgroups</text>
      <text x="320" y="624" text-anchor="middle" font-size="9">(límites)</text>

      <rect x="388" y="582" width="116" height="80" rx="4" stroke="currentColor" fill="none"/>
      <text x="446" y="608" text-anchor="middle" font-size="11">OverlayFS</text>
      <text x="446" y="624" text-anchor="middle" font-size="9">(capas fs)</text>
    </svg>
    <figcaption>docker run baja del CLI al daemon, del daemon a containerd vía gRPC, y de containerd a runc vía OCI, hasta que runc invoca clone() en el kernel Linux.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'Conceptos clave antes de empezar',
      items: [
        '**Imagen** — Snapshot inmutable de un filesystem + configuración. Como un template.',
        '**Contenedor** — Instancia en ejecución de una imagen. Como un proceso con su propio entorno.',
        '**Dockerfile** — Receta para construir una imagen. Serie de instrucciones en texto plano.',
        '**Registry** — Servidor que almacena y distribuye imágenes. Docker Hub es el público por defecto.',
        '**Layer** — Cada instrucción del Dockerfile crea una capa inmutable. Las capas se comparten entre imágenes.',
        '**Volume** — Almacenamiento persistente externo al contenedor. Los datos sobreviven al ciclo de vida del contenedor.',
        '**Network** — Red virtual que conecta contenedores entre sí y con el exterior.',
        '**Compose** — Herramienta para definir y correr aplicaciones multi-contenedor con un archivo YAML.',
      ],
    },
    {
      type: 'concepts',
      title: 'Errores comunes al empezar',
      items: [
        'Confundir imagen con contenedor: la imagen es el molde inmutable, el contenedor es la instancia en ejecución. Podés tener 20 contenedores de la misma imagen.',
        'Correr `docker run` sin `--rm` en pruebas rápidas: cada ejecución deja un contenedor detenido acumulado. Usá `docker run --rm` para descartable automático.',
        "Pensar que un contenedor 'apagado' libera espacio: los contenedores detenidos siguen ocupando disco (su capa de escritura) hasta hacer `docker rm`.",
        'Usar `sudo` para siempre — si agregaste tu usuario al grupo `docker`, no lo necesitás. Si seguís necesitando sudo, la sesión no recargó el grupo.',
        "Instalar 'Docker' solo con `docker.io` del repositorio de la distro: suele ser una versión vieja. El repo oficial de Docker (docker-ce) trae versiones actualizadas y Buildx/Compose como plugins.",
        'No verificar `docker info` después de instalar: ahí se ve si el storage driver es overlay2 (correcto) o algo obsoleto, y cuántos recursos ve el daemon.',
        "Esperar que Docker en Mac/Windows sea 'nativo': corre dentro de una VM Linux oculta (Docker Desktop). El rendimiento de I/O de archivos montados puede ser notablemente más lento que en Linux nativo.",
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Instalación y primer contenedor',
      steps: [
        {
          cmd: 'uname -r',
          desc: 'Verifica la versión del kernel. Docker requiere 3.10+ en Linux. Kernels modernos (5.x, 6.x) tienen todas las features.',
        },
        {
          cmd: 'sudo dnf -y install dnf-plugins-core\nsudo dnf config-manager --add-repo https://download.docker.com/linux/fedora/docker-ce.repo\nsudo dnf install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin',
          desc: "Instala Docker Engine en Fedora/RHEL. Para Ubuntu: 'sudo apt-get update && sudo apt-get install ca-certificates curl' seguido del repo apt.docker.com.",
        },
        {
          cmd: 'sudo systemctl enable --now docker',
          desc: 'Habilita Docker como servicio del sistema e inicia inmediatamente.',
        },
        {
          cmd: 'sudo usermod -aG docker $USER\nnewgrp docker',
          desc: "Agrega tu usuario al grupo 'docker' para no necesitar sudo. 'newgrp docker' aplica el cambio de grupo en la sesión actual sin tener que cerrar sesión.",
        },
        {
          cmd: 'docker version',
          desc: "Muestra versiones del cliente y del servidor (daemon). Si falla con 'permission denied', el grupo docker no se aplicó todavía.",
        },
        {
          cmd: "docker info --format '{{.ServerVersion}} driver={{.Driver}} containers={{.Containers}} images={{.Images}}'",
          desc: 'Extrae del info completo solo los datos clave: versión del daemon, storage driver (debería ser overlay2) y conteos actuales.',
        },
        {
          cmd: 'docker run hello-world',
          desc: 'El contenedor oficial de prueba. Descarga la imagen, crea el contenedor, corre el proceso y muestra un mensaje. Si ves el mensaje de éxito, Docker funciona correctamente.',
        },
        {
          cmd: 'docker ps -a --filter ancestor=hello-world',
          desc: "Verificación: el contenedor de hello-world quedó en estado 'Exited (0)' — corrió y terminó, pero sigue existiendo hasta que lo borres.",
        },
        {
          cmd: 'docker run -it --rm ubuntu:22.04 bash',
          desc: "Corre Ubuntu interactivo y descartable. -i mantiene stdin abierto, -t asigna un pseudo-TTY, --rm borra el contenedor automáticamente al salir. Escribí 'exit' para salir.",
        },
        {
          cmd: 'docker ps -a',
          desc: 'Verificación de limpieza: gracias a --rm, el contenedor de ubuntu ya no aparece en la lista. hello-world sí sigue ahí.',
        },
        {
          cmd: 'docker rm $(docker ps -aq --filter ancestor=hello-world)\ndocker rmi hello-world ubuntu:22.04',
          desc: 'Limpieza final: borra el contenedor de hello-world y ambas imágenes descargadas para dejar el entorno como estaba.',
        },
      ],
    },
  ],
};

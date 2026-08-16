export default {
  id: 4,
  title: 'Contenedores',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo: 'Dominar el ciclo de vida completo de los contenedores y los comandos esenciales de operación.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Un contenedor no es una imagen corriendo. Es una imagen + una capa de escritura + procesos + estado de red + estado de filesystem. Confundir imagen con contenedor es uno de los errores más comunes.

Necesitás entender el ciclo de vida completo: cómo nace un contenedor, cómo se detiene, cuándo se borra, qué persiste y qué no, cómo inspeccionarlo cuando algo falla, y cómo interactuar con él en producción.

La diferencia entre un administrador que sabe y uno que adivina está en conocer estos comandos íntimamente.`,
    },
    {
      type: 'diagram',
      title: 'Ciclo de vida completo de un contenedor',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 760 300" role="img" aria-label="Un contenedor pasa de created a running con start, de running a stopped con stop/kill, restart lo vuelve a running, y rm lo borra; pause, restart policy y errores fatales lo desvían a paused, restarting o dead">
      <defs>
        <marker id="arrow-04a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="160" y="14" text-anchor="middle" font-size="10">docker run = docker create + docker start</text>

      <path d="M 480,50 C 480,14 250,14 250,50" stroke="currentColor" fill="none" marker-end="url(#arrow-04a)"/>
      <rect x="335" y="6" width="60" height="16" fill="#0a0d16"/>
      <text x="365" y="18" text-anchor="middle" font-size="9">restart</text>

      <rect x="20" y="50" width="100" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="70" y="80" text-anchor="middle" font-size="11">[created]</text>

      <rect class="dg-accent" x="190" y="50" width="120" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="250" y="80" text-anchor="middle" font-size="11" fill="currentColor">[running]</text>

      <rect x="400" y="50" width="160" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="480" y="80" text-anchor="middle" font-size="11">[stopped / exited]</text>

      <rect x="630" y="50" width="100" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="680" y="80" text-anchor="middle" font-size="11">[deleted]</text>

      <line x1="120" y1="75" x2="190" y2="75" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="132" y="67" width="46" height="14" fill="#0a0d16"/>
      <text x="155" y="78" text-anchor="middle" font-size="9">start</text>

      <line x1="310" y1="75" x2="400" y2="75" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="316" y="67" width="78" height="14" fill="#0a0d16"/>
      <text x="355" y="78" text-anchor="middle" font-size="8">stop / kill / exit</text>

      <line x1="560" y1="75" x2="630" y2="75" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="580" y="67" width="30" height="14" fill="#0a0d16"/>
      <text x="595" y="78" text-anchor="middle" font-size="9">rm</text>

      <rect x="190" y="220" width="120" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="250" y="245" text-anchor="middle" font-size="11">[paused]</text>
      <text x="250" y="260" text-anchor="middle" font-size="8">docker pause (SIGSTOP)</text>

      <rect x="380" y="220" width="140" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="450" y="245" text-anchor="middle" font-size="11">[restarting]</text>
      <text x="450" y="260" text-anchor="middle" font-size="8">restart policy en acción</text>

      <rect x="600" y="220" width="100" height="50" rx="6" stroke="currentColor" fill="none"/>
      <text x="650" y="245" text-anchor="middle" font-size="11">[dead]</text>
      <text x="650" y="260" text-anchor="middle" font-size="8">error fatal, no gestionable</text>

      <line x1="250" y1="100" x2="250" y2="220" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="256" y="153" width="40" height="14" fill="#0a0d16"/>
      <text x="276" y="164" text-anchor="middle" font-size="8">pause</text>

      <line x1="290" y1="100" x2="440" y2="220" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="330" y="153" width="76" height="14" fill="#0a0d16"/>
      <text x="368" y="164" text-anchor="middle" font-size="8">restart policy</text>

      <line x1="305" y1="100" x2="640" y2="220" stroke="currentColor" marker-end="url(#arrow-04a)"/>
      <rect x="470" y="153" width="70" height="14" fill="#0a0d16"/>
      <text x="505" y="164" text-anchor="middle" font-size="8">error fatal</text>

      <path d="M 520,220 C 570,180 340,120 306,102" stroke="currentColor" fill="none" stroke-dasharray="3 4" marker-end="url(#arrow-04a)"/>
      <text x="580" y="205" text-anchor="middle" font-size="8">reinicia → running</text>
    </svg>
    <figcaption>docker start lleva un contenedor de created a running; stop/kill/exit lo pasan a stopped; restart lo vuelve a running y rm lo borra. Desde running, pause lo congela, una restart policy fallida lo lleva a restarting (y de vuelta a running si funciona), y un error fatal lo deja en dead.</figcaption>
  </figure>`,
    },
    {
      type: 'concepts',
      title: 'docker run — el comando central',
      body: `\`docker run\` es la composición de \`docker create\` + \`docker start\`. El 90% de las veces usás \`run\`.`,
      items: [
        '`docker run -d --name web -p 8080:80 nginx` — Crea y arranca en background, mapeando puerto 8080→80.',
        '`docker run -it ubuntu bash` — Terminal interactiva. `-i` mantiene stdin, `-t` asigna pseudo-TTY.',
        "`docker run --rm alpine echo 'hola'` — Corre y borra automáticamente al terminar. Para tareas one-shot.",
        '`docker run -e DB_HOST=localhost -e DB_PORT=5432 mi-app` — Variables de entorno al contenedor.',
        '`docker run --network mi-red mi-app` — Conecta a una red específica.',
        '`docker run --memory=256m --cpus=0.5 mi-app` — Límites de recursos via cgroups.',
        '`docker run --restart=unless-stopped nginx` — Se reinicia automáticamente excepto si fue detenido manualmente.',
        '`docker run --user 1000:1000 mi-app` — Corre el proceso como usuario no-root (seguridad).',
        '`docker run -v mis-datos:/var/lib/data mi-app` — Monta un volumen nombrado. Sin esto, todo lo escrito muere con el contenedor.',
        '`docker run --add-host db.interno:10.0.0.5 mi-app` — Agrega una entrada a /etc/hosts sin depender de DNS externo.',
        "`docker run --health-cmd='curl -f http://localhost/ || exit 1' --health-interval=10s nginx` — Define un healthcheck desde la CLI sin tocar el Dockerfile.",
      ],
    },
    {
      type: 'concepts',
      title: 'Comandos de operación diaria',
      items: [
        '`docker ps` — Lista contenedores corriendo. `docker ps -a` incluye los detenidos.',
        "`docker ps --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'` — Output tabular formateado.",
        '`docker logs web` — Logs del proceso principal. `-f` para follow, `--tail 100` para las últimas 100 líneas.',
        '`docker logs web --since 10m` — Solo logs de los últimos 10 minutos.',
        '`docker exec -it web bash` — Shell dentro de un contenedor corriendo. Sin `-it`, usa para comandos one-shot.',
        '`docker exec web cat /etc/nginx/nginx.conf` — Ejecuta sin TTY interactiva.',
        '`docker stop web` — Envía SIGTERM y espera 10s. Si no terminó, SIGKILL. Permite graceful shutdown.',
        '`docker kill web` — SIGKILL inmediato. No da tiempo de cleanup.',
        '`docker rm web` — Borra el contenedor detenido. Usa `-f` para forzar borrado de uno corriendo.',
        '`docker inspect web` — JSON completo con toda la configuración, estado, red y filesystem del contenedor.',
      ],
    },
    {
      type: 'concepts',
      title: 'Monitoreo y diagnóstico',
      items: [
        '`docker stats` — Métricas en tiempo real: CPU%, Memoria usada/límite, I/O de red y disco, PIDs.',
        '`docker stats --no-stream` — Una sola muestra (sin modo watch). Útil en scripts.',
        '`docker top web` — Lista los procesos corriendo dentro del contenedor (desde el host).',
        '`docker diff web` — Muestra qué archivos fueron modificados, agregados o borrados respecto a la imagen.',
        '`docker port web` — Lista los mapeos de puertos del contenedor.',
        "`docker inspect web --format '{{.NetworkSettings.IPAddress}}'` — IP interna del contenedor.",
        "`docker inspect web --format '{{.State.ExitCode}}'` — Código de salida del último proceso.",
        '`docker events` — Stream de eventos del daemon en tiempo real: create, start, stop, kill, die.',
      ],
    },
    {
      type: 'concepts',
      title: 'Restart policies — resiliencia automática',
      items: [
        "`no` — No reinicia nunca (default). El contenedor queda en estado 'exited'.",
        '`always` — Siempre reinicia, incluso cuando el host se reinicia. Usado en servicios críticos.',
        "`unless-stopped` — Igual que 'always' pero no reinicia si el operador lo detuvo manualmente.",
        '`on-failure` — Solo reinicia si terminó con código != 0. `on-failure:5` limita a 5 intentos.',
        'Las restart policies son una red de seguridad, no un sustituto de una aplicación bien escrita.',
        'Con Docker Compose, `restart: unless-stopped` es el valor recomendado para servicios en staging.',
      ],
    },
    {
      type: 'comparison',
      title: 'Formas de terminar un contenedor',
      headers: ['Comando', 'Señal / mecanismo', 'Cuándo usarlo'],
      rows: [
        {
          feature: 'docker stop',
          a: 'SIGTERM, espera hasta 10s, luego SIGKILL',
          b: 'Caso normal: permite shutdown limpio (cerrar conexiones, flush de datos).',
        },
        {
          feature: 'docker kill',
          a: 'SIGKILL inmediato (o la señal que le pases con -s)',
          b: 'El contenedor no responde a SIGTERM, o necesitás cortarlo ya (no hay gracia).',
        },
        {
          feature: 'docker pause',
          a: 'SIGSTOP a todos los procesos (cgroup freezer)',
          b: 'Congelar temporalmente sin perder estado — útil para depurar sin que el proceso avance.',
        },
        {
          feature: 'docker rm -f',
          a: 'Equivale a kill + rm en un solo paso',
          b: 'Limpieza rápida en scripts, aceptando que no hubo shutdown gracioso.',
        },
      ],
    },
    {
      type: 'diagram',
      title: 'Señales de parada — SIGTERM vs SIGKILL',
      diagram: `<figure class="diagram-figure">
    <svg viewBox="0 0 700 400" role="img" aria-label="docker stop da 10 segundos de gracia con SIGTERM antes de un SIGKILL forzado, docker kill mata sin gracia, y solo la forma exec del ENTRYPOINT deja que el proceso reciba la señal">
      <defs>
        <marker id="arrow-04b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
        </marker>
      </defs>

      <text x="160" y="18" text-anchor="middle" font-size="12">docker stop web</text>
      <line x1="160" y1="26" x2="160" y2="46" stroke="currentColor" marker-end="url(#arrow-04b)"/>
      <rect x="40" y="50" width="240" height="36" rx="5" stroke="currentColor" fill="none"/>
      <text x="160" y="72" text-anchor="middle" font-size="10">SIGTERM → PID 1 del contenedor</text>

      <line x1="160" y1="86" x2="160" y2="106" stroke="currentColor" marker-end="url(#arrow-04b)"/>
      <rect x="40" y="110" width="240" height="66" rx="5" stroke="currentColor" fill="none"/>
      <text x="160" y="128" text-anchor="middle" font-size="9">10s para terminar limpio:</text>
      <text x="160" y="144" text-anchor="middle" font-size="9">cerrar conexiones · flush datos</text>
      <text x="160" y="160" text-anchor="middle" font-size="9">liberar recursos</text>

      <line x1="160" y1="176" x2="160" y2="200" stroke="currentColor" marker-end="url(#arrow-04b)"/>
      <rect x="115" y="181" width="90" height="14" fill="#0a0d16"/>
      <text x="160" y="192" text-anchor="middle" font-size="8">no respondió a tiempo</text>

      <rect x="40" y="204" width="240" height="46" rx="5" stroke="currentColor" fill="none"/>
      <text x="160" y="222" text-anchor="middle" font-size="10">SIGKILL (no se ignora ni atrapa)</text>
      <text x="160" y="238" text-anchor="middle" font-size="9">datos en vuelo se pierden</text>

      <line x1="280" y1="128" x2="330" y2="128" stroke="currentColor" stroke-dasharray="3 4" marker-end="url(#arrow-04b)"/>
      <text x="335" y="123" font-size="8">responde a tiempo →</text>
      <text x="335" y="135" font-size="8">stopped (exit 0), sin SIGKILL</text>

      <text x="540" y="18" text-anchor="middle" font-size="12">docker kill web</text>
      <line x1="540" y1="26" x2="540" y2="46" stroke="currentColor" marker-end="url(#arrow-04b)"/>
      <rect x="420" y="50" width="240" height="36" rx="5" stroke="currentColor" fill="none"/>
      <text x="540" y="72" text-anchor="middle" font-size="10">SIGKILL inmediato (sin gracia)</text>

      <line x1="540" y1="86" x2="540" y2="106" stroke="currentColor" marker-end="url(#arrow-04b)"/>
      <rect x="420" y="110" width="240" height="46" rx="5" stroke="currentColor" fill="none"/>
      <text x="540" y="128" text-anchor="middle" font-size="10">Terminación inmediata</text>
      <text x="540" y="144" text-anchor="middle" font-size="9">no hay cleanup</text>

      <line x1="30" y1="270" x2="670" y2="270" stroke="currentColor" stroke-dasharray="2 4"/>
      <text x="350" y="290" text-anchor="middle" font-size="11">Para que SIGTERM llegue al proceso: forma exec vs shell</text>

      <rect class="dg-accent" x="40" y="304" width="300" height="80" rx="6" stroke="currentColor" fill="none"/>
      <text class="dg-accent" x="190" y="326" text-anchor="middle" font-size="10" fill="currentColor">✓ ENTRYPOINT ["python","app.py"]</text>
      <text x="190" y="344" text-anchor="middle" font-size="9">PID 1 = python</text>
      <text x="190" y="360" text-anchor="middle" font-size="9">recibe SIGTERM directamente</text>

      <rect x="360" y="304" width="300" height="80" rx="6" stroke="currentColor" fill="none"/>
      <text x="510" y="326" text-anchor="middle" font-size="10">✗ ENTRYPOINT python app.py</text>
      <text x="510" y="344" text-anchor="middle" font-size="9">PID 1 = /bin/sh, no python</text>
      <text x="510" y="360" text-anchor="middle" font-size="9">docker stop tarda los 10s completos</text>
    </svg>
    <figcaption>docker stop da 10 segundos de gracia con SIGTERM antes de forzar SIGKILL; docker kill mata sin gracia. Esa señal solo llega al proceso correcto si el ENTRYPOINT usa forma exec — en forma shell, PID 1 es /bin/sh y la app nunca recibe SIGTERM.</figcaption>
  </figure>`,
    },
    {
      type: 'history',
      title: 'Errores comunes con el ciclo de vida de contenedores',
      items: [
        'Confundir *stop* con *rm*: parar un contenedor no lo borra. `docker ps -a` sigue mostrándolo y `docker start` lo revive con el mismo filesystem.',
        "Usar `docker run` en loops de desarrollo sin `--rm`: acumular decenas de contenedores 'Exited' que después hay que limpiar a mano con `docker container prune`.",
        'ENTRYPOINT en forma shell (`ENTRYPOINT app`) hace que SIGTERM lo reciba `/bin/sh`, no la app. `docker stop` tarda siempre los 10 segundos completos porque nadie responde a la señal.',
        "Ignorar el exit code: un contenedor con `restart: on-failure` que reinicia en loop infinito generalmente indica un bug en el arranque, no un problema de infraestructura. `docker inspect --format '{{.State.ExitCode}}'` es el primer diagnóstico.",
        'Depender de la IP interna del contenedor (`docker inspect`) para que otros servicios se conecten: cambia cada vez que se recrea. La solución correcta es una red definida por el usuario con resolución DNS por nombre (visto en el nivel de redes).',
        "Usar `docker kill` como primera opción 'porque es más rápido': en producción eso es perder datos en vuelo. `docker stop` primero, siempre.",
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Ciclo de vida completo y diagnóstico',
      steps: [
        {
          cmd: '# Crear sin iniciar\ndocker create --name demo nginx:alpine\ndocker ps -a',
          desc: "El contenedor existe en estado 'Created' pero no corre. No consume CPU.",
        },
        {
          cmd: 'docker start demo\ndocker ps',
          desc: "Ahora está en estado 'Up'. Iniciado con el comando default de nginx.",
        },
        {
          cmd: 'docker logs demo\ndocker logs demo --follow &',
          desc: 'Logs del proceso principal de nginx. El & manda el follow a background.',
        },
        {
          cmd: "curl -s http://$(docker inspect demo --format '{{.NetworkSettings.IPAddress}}')/",
          desc: 'Accede al nginx por su IP interna de Docker. Debe responder HTML.',
        },
        {
          cmd: 'docker exec demo cat /etc/nginx/conf.d/default.conf',
          desc: 'Lee la configuración de nginx desde dentro del contenedor sin terminal interactiva.',
        },
        {
          cmd: 'docker stats demo --no-stream',
          desc: 'CPU, memoria usada y límite, I/O de red y disco. Verifica que los recursos son mínimos.',
        },
        { cmd: 'docker top demo', desc: 'Procesos corriendo dentro del contenedor vistos desde el host.' },
        {
          cmd: 'docker diff demo',
          desc: 'Archivos modificados respecto a la imagen base. Con nginx recién iniciado debería ser mínimo.',
        },
        {
          cmd: '# Simular cambio de archivo\ndocker exec demo touch /tmp/archivo-prueba\ndocker diff demo',
          desc: "Ahora aparece el archivo nuevo en el diff como 'A' (added).",
        },
        {
          cmd: "docker stop demo\ndocker inspect demo --format 'ExitCode: {{.State.ExitCode}}'",
          desc: 'nginx termina limpiamente con SIGTERM. Exit code 0 = terminación normal.',
        },
        {
          cmd: "# Simular un crash y ver la restart policy en acción\ndocker run -d --name crasher --restart=on-failure:3 alpine sh -c 'sleep 1; exit 1'\nsleep 8\ndocker inspect crasher --format 'RestartCount: {{.RestartCount}} Status: {{.State.Status}}'",
          desc: 'Después de 3 reintentos fallidos, el contenedor queda detenido — la política tiene un límite, no reintenta para siempre.',
        },
        {
          cmd: "docker rm -f crasher demo\ndocker ps -a | grep -E 'crasher|demo' || echo 'Limpieza confirmada: ningún contenedor de la práctica quedó vivo'",
          desc: 'Limpieza completa. El mensaje sin coincidencias confirma que ambos contenedores fueron eliminados.',
        },
      ],
    },
  ],
};

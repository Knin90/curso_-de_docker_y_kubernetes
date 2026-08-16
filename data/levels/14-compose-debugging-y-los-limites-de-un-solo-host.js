export default {
  id: 14,
  title: 'Compose — Debugging y los límites de un solo host',
  etapa: 'compose',
  etapaLabel: 'Etapa II — Docker Compose',
  objetivo:
    'Diagnosticar stacks de Compose en producción con logs, healthchecks y exec, y entender por qué un solo host deja de alcanzar — la motivación real para pasar a un orquestador.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tu stack de Compose funciona perfecto en tu laptop. En el servidor de staging, el backend se reinicia cada tres minutos y no sabés por qué. \`docker compose ps\` dice "running" pero la app no responde. Sin herramientas de diagnóstico, cada incidente se convierte en \`docker compose logs\` a ciegas, contenedor por contenedor, esperando encontrar la línea correcta entre miles.

Y aunque diagnostiques todo perfecto: tu servidor tiene 8 GB de RAM y el stack ya usa 7. El próximo deploy con más tráfico no entra. No hay a dónde escalar dentro de esa máquina — y Compose no sabe hablar con una segunda.`,
    },
    {
      type: 'concepts',
      title: 'Diagnóstico sistemático — el orden que ahorra horas',
      items: [
        '**Primero el estado**: `docker compose ps` — columna `STATUS` dice si reinicia (`Restarting`), si el healthcheck falla (`unhealthy`) o si ya murió (`Exited`).',
        '**Logs con contexto**: `docker compose logs -f --tail=100 <servicio>` — nunca logs sin filtro en un stack de 6 servicios, es ruido.',
        '**Logs con timestamps** cuando el orden entre servicios importa: `docker compose logs -f -t backend db`.',
        '**Entrar al contenedor vivo**: `docker compose exec backend sh` — para probar DNS interno, variables de entorno reales, o si el proceso realmente escucha en el puerto esperado.',
        '**Inspeccionar la config resuelta**: `docker compose config` — muestra el YAML final después de mergear `.env`, overrides y variables — la fuente más común de "funciona en mi máquina".',
        "**Eventos del daemon**: `docker events --filter 'label=com.docker.compose.project=<nombre>'` — ve reinicios y OOM-kills en tiempo real mientras reproducís el bug.",
      ],
    },
    {
      type: 'code',
      title: 'Comandos de diagnóstico — receta rápida',
      code: `# Estado de todos los servicios del stack
docker compose ps

# Logs de un servicio específico, últimas 100 líneas, siguiendo en vivo
docker compose logs -f --tail=100 backend

# Logs de varios servicios a la vez, con timestamp
docker compose logs -f -t backend db redis

# Config resuelta: YAML final tras aplicar .env y overrides
docker compose config

# Entrar a un contenedor corriendo
docker compose exec backend sh

# Ver por qué murió un contenedor (exit code + razón)
docker compose ps -a
docker inspect $(docker compose ps -q backend) --format '{{.State.ExitCode}} {{.State.Error}}'

# Uso de recursos en vivo de todo el stack
docker stats $(docker compose ps -q)

# Fue matado por el OOM killer del kernel?
dmesg | grep -i 'killed process' | tail -5`,
    },
    {
      type: 'concepts',
      title: 'Causas más comunes de "funciona en mi máquina"',
      items: [
        '**Variables de entorno distintas**: tu `.env` local no viaja al servidor. `docker compose config` expone el YAML real que se está aplicando.',
        '**Orden de arranque sin healthcheck**: `depends_on` sin `condition: service_healthy` arranca el backend antes de que la DB acepte conexiones — falla intermitente, no siempre.',
        '**OOM silencioso**: sin `mem_limit`, un contenedor puede consumir toda la RAM del host y el kernel mata al que decida, no necesariamente al culpable.',
        '**Volúmenes con datos viejos**: un volumen con un esquema de DB antiguo sobrevive a `docker compose up` — solo `down -v` lo limpia, y eso borra datos.',
        '**Puertos ocupados en el host**: otro proceso (u otro stack) ya usa el puerto — el error de bind se ve en logs, no en `ps`.',
        '**DNS interno que no resuelve**: un servicio referenciado por nombre (`DB_HOST=db`) solo resuelve si ambos contenedores están en la **misma red** de Compose — `docker compose exec backend getent hosts db` confirma si el DNS interno lo ve.',
      ],
    },
    {
      type: 'diagram',
      title: 'El techo de un solo host',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 920 400" role="img" aria-label="Un host aislado tiene techo de RAM y CPU y no se conecta con nada más; un cluster reparte los mismos servicios entre nodos que un scheduler asigna y reubica">
    <defs>
      <marker id="arrow-14a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="230" y="30" font-size="11" text-anchor="middle">Un host, escalando verticalmente</text>
    <rect x="40" y="40" width="380" height="220" fill="none" stroke="currentColor" rx="6"/>
    <text x="55" y="58" font-size="11">Host único</text>

    <rect x="70" y="70" width="100" height="46" fill="none" stroke="currentColor" rx="4"/>
    <text x="120" y="97" font-size="11" text-anchor="middle">backend (x2)</text>
    <rect x="190" y="70" width="100" height="46" fill="none" stroke="currentColor" rx="4"/>
    <text x="240" y="97" font-size="11" text-anchor="middle">backend (x2)</text>
    <rect x="310" y="70" width="90" height="46" fill="none" stroke="currentColor" rx="4"/>
    <text x="355" y="97" font-size="11" text-anchor="middle">db</text>

    <text x="230" y="148" font-size="11" text-anchor="middle">RAM: 7/8 GB usada</text>
    <text x="230" y="165" font-size="11" text-anchor="middle">CPU: 90% promedio</text>
    <text x="230" y="195" font-size="10" text-anchor="middle">Si el host cae, cae todo el stack</text>
    <text x="230" y="210" font-size="10" text-anchor="middle">No hay balanceo entre máquinas</text>
    <text x="230" y="225" font-size="10" text-anchor="middle">No hay rolling update sin downtime</text>
    <text x="230" y="245" font-size="10" text-anchor="middle">Compose solo sabe hablar con ESTE host</text>

    <text x="690" y="30" font-size="11" text-anchor="middle">Un orquestador — múltiples hosts como un pool</text>

    <rect x="470" y="70" width="110" height="50" fill="none" stroke="currentColor" rx="4"/>
    <text x="525" y="91" font-size="11" text-anchor="middle">Nodo A</text>
    <text x="525" y="107" font-size="10" text-anchor="middle">backend</text>

    <rect x="610" y="70" width="110" height="50" fill="none" stroke="currentColor" rx="4"/>
    <text x="665" y="91" font-size="11" text-anchor="middle">Nodo B</text>
    <text x="665" y="107" font-size="10" text-anchor="middle">backend</text>

    <rect x="750" y="70" width="110" height="50" fill="none" stroke="currentColor" rx="4"/>
    <text x="805" y="91" font-size="11" text-anchor="middle">Nodo C</text>
    <text x="805" y="107" font-size="10" text-anchor="middle">db</text>

    <rect class="dg-accent" x="635" y="220" width="140" height="50" fill="none" stroke="currentColor" rx="4"/>
    <text x="705" y="250" font-size="11" text-anchor="middle">Scheduler</text>

    <line x1="705" y1="220" x2="525" y2="122" stroke="currentColor" marker-end="url(#arrow-14a)"/>
    <line x1="705" y1="220" x2="665" y2="122" stroke="currentColor" marker-end="url(#arrow-14a)"/>
    <line x1="705" y1="220" x2="805" y2="122" stroke="currentColor" marker-end="url(#arrow-14a)"/>

    <text x="705" y="290" font-size="10" text-anchor="middle">decide dónde vive cada contenedor</text>
    <text x="705" y="304" font-size="10" text-anchor="middle">reubica si un nodo muere</text>
    <text x="705" y="318" font-size="10" text-anchor="middle">escala agregando nodos</text>
  </svg>
  <figcaption>Un solo host tiene techo de RAM/CPU y ninguna conexión hacia afuera; un cluster reparte los mismos servicios entre nodos que un scheduler asigna y reubica.</figcaption>
</figure>`,
    },
    {
      type: 'comparison',
      title: 'Compose vs un orquestador',
      headers: ['Característica', 'Docker Compose', 'Orquestador (Kubernetes)'],
      rows: [
        { feature: 'Alcance', a: 'Un solo host', b: 'Cluster de N hosts' },
        { feature: 'Si un host muere', a: 'Todo el stack cae', b: 'Se reprograma en otro nodo' },
        { feature: 'Escalado', a: 'Manual, dentro del host', b: 'Automático, entre nodos (HPA)' },
        { feature: 'Rolling update', a: 'Downtime breve por servicio', b: 'Sin downtime, con health checks' },
        {
          feature: 'Descubrimiento de servicios',
          a: 'DNS del stack (nombre del servicio)',
          b: 'DNS del cluster + balanceo interno',
        },
        { feature: 'Curva de aprendizaje', a: 'Baja — un YAML', b: 'Alta — varios recursos y conceptos' },
        {
          feature: 'Uso típico',
          a: 'Dev, staging, apps chicas',
          b: 'Producción a escala, alta disponibilidad',
        },
      ],
    },
    {
      type: 'history',
      title: 'Por qué esto no es "Compose está mal"',
      items: [
        'Compose sigue siendo la herramienta correcta para desarrollo local y para apps chicas de un solo host — cambiarla por Kubernetes ahí es sobre-ingeniería.',
        'El límite no es un bug: Compose fue diseñado para *un* host. Kubernetes fue diseñado para *un cluster*. Son herramientas para escalas distintas.',
        'Muchos equipos corren Compose en producción durante años antes de necesitar un orquestador — la migración se justifica cuando aparece un problema real (alta disponibilidad, escalado, múltiples equipos desplegando), no antes.',
        'Docker Compose puede convertirse en manifiestos de Kubernetes con herramientas como `kompose`, como punto de partida — nunca como traducción perfecta.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Diagnosticar un stack roto',
      steps: [
        {
          cmd: "mkdir -p ~/lab-debug-compose && cd ~/lab-debug-compose\ncat > compose.yaml << 'EOF'\nservices:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n  backend:\n    image: alpine\n    command: sh -c \"sleep 1 && echo 'Conectando a DB_HOST vacio' && exit 1\"\n    depends_on:\n      - db\nEOF\ndocker compose up -d",
          desc: "Stack con un bug deliberado: 'backend' no tiene DB_HOST configurado y termina con exit 1.",
        },
        {
          cmd: 'docker compose ps -a',
          desc: "backend aparece como 'Exited (1)' — el primer síntoma visible.",
        },
        {
          cmd: 'docker compose logs backend',
          desc: 'El log muestra exactamente el mensaje y por qué salió — sin adivinar.',
        },
        {
          cmd: "docker inspect $(docker compose ps -a -q backend) --format 'Exit code: {{.State.ExitCode}}'",
          desc: 'Confirma el código de salida — 1, error de aplicación, no un crash del runtime.',
        },
        {
          cmd: "docker compose config | grep -A3 'backend:'",
          desc: 'Muestra la config resuelta del servicio backend — se ve que falta DB_HOST.',
        },
        {
          cmd: 'cat > compose.yaml << \'EOF\'\nservices:\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n  backend:\n    image: alpine\n    environment:\n      DB_HOST: db\n    command: sh -c "echo Conectando a $$DB_HOST && sleep 300"\n    depends_on:\n      - db\nEOF\ndocker compose up -d --force-recreate backend',
          desc: 'Aplica el fix real: define DB_HOST y hace que el proceso quede vivo en vez de terminar. --force-recreate reemplaza el contenedor viejo.',
        },
        {
          cmd: 'docker compose ps',
          desc: "Verificación: backend ahora aparece como 'Up', no 'Exited' — el síntoma original desapareció.",
        },
        {
          cmd: 'docker compose logs backend --tail 5',
          desc: "Confirma en el log que el mensaje ahora imprime la variable correcta: 'Conectando a db'.",
        },
        {
          cmd: 'docker compose down\ncd .. && rm -rf ~/lab-debug-compose',
          desc: 'Limpieza completa: baja el stack y borra el directorio del laboratorio.',
        },
      ],
    },
  ],
};

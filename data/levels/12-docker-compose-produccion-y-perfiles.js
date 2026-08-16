export default {
  id: 12,
  title: 'Docker Compose — Producción y Perfiles',
  etapa: 'compose',
  etapaLabel: 'Etapa II — Docker Compose',
  objetivo:
    'Configurar Compose para producción: profiles, límites de recursos, logging, restart policies y deployment patterns.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Compose en desarrollo es fácil. Compose en producción requiere pensar en qué pasa cuando un servicio falla, cuánta RAM puede consumir un contenedor antes de matar al host, cómo rotás los logs para no quedarte sin espacio en disco, y cómo desplegás una nueva versión sin downtime.

También necesitás servicios que solo existan en ciertos contextos: una herramienta de migrations que corre una sola vez, un servicio de debug que no debe estar en producción, un seed de datos solo para desarrollo.

Los perfiles de Compose resuelven esto de forma elegante.`,
    },
    {
      type: 'concepts',
      title: 'Profiles — servicios condicionales',
      body: `Los profiles permiten marcar servicios como opcionales. Solo se incluyen si el perfil está activo.`,
      items: [
        'Servicios sin perfil: siempre activos con `docker compose up`.',
        'Servicios con perfil: solo activos cuando el perfil se activa explícitamente.',
        "`docker compose --profile debug up` — Activa el perfil 'debug' y los servicios marcados con él.",
        '`COMPOSE_PROFILES=debug,monitoring docker compose up` — Múltiples perfiles vía variable de entorno.',
        '`docker compose --profile tools run --rm migrations python manage.py migrate` — Corre un servicio de perfil específico.',
        'Un servicio puede tener múltiples perfiles: `profiles: [debug, development]`.',
        'Perfiles comunes: `debug`, `monitoring`, `tools`, `development`, `testing`.',
      ],
    },
    {
      type: 'diagram',
      title: 'Qué levanta Compose según los profiles activos',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 780 340" role="img" aria-label="Cada comando de Compose incluye un set distinto de servicios según los profiles activos; postgres y backend, sin profile, se incluyen siempre">
    <defs>
      <marker id="arrow-12a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="190" y="40" width="550" height="270" fill="none" stroke="currentColor"/>
    <line x1="190" y1="70" x2="740" y2="70" stroke="currentColor"/>
    <line x1="190" y1="130" x2="740" y2="130" stroke="currentColor"/>
    <line x1="190" y1="190" x2="740" y2="190" stroke="currentColor"/>
    <line x1="190" y1="250" x2="740" y2="250" stroke="currentColor"/>
    <line x1="290" y1="40" x2="290" y2="310" stroke="currentColor"/>
    <line x1="380" y1="40" x2="380" y2="310" stroke="currentColor"/>
    <line x1="470" y1="40" x2="470" y2="310" stroke="currentColor"/>
    <line x1="560" y1="40" x2="560" y2="310" stroke="currentColor"/>
    <line x1="650" y1="40" x2="650" y2="310" stroke="currentColor"/>

    <text x="245" y="58" font-size="10" text-anchor="middle">postgres</text>
    <text x="335" y="58" font-size="10" text-anchor="middle">backend</text>
    <text x="425" y="58" font-size="10" text-anchor="middle">backend-dev</text>
    <text x="515" y="58" font-size="10" text-anchor="middle">migrations</text>
    <text x="605" y="58" font-size="10" text-anchor="middle">prometheus</text>
    <text x="695" y="58" font-size="10" text-anchor="middle">pgadmin</text>

    <text x="20" y="104" font-size="10">docker compose up</text>
    <text x="20" y="160" font-size="10">--profile development up</text>
    <text x="20" y="216" font-size="10">COMPOSE_PROFILES=dev,monitoring</text>
    <text x="20" y="272" font-size="10">--profile tools run migrations</text>

    <circle class="dg-accent" cx="245" cy="100" r="8" fill="currentColor"/>
    <circle class="dg-accent" cx="335" cy="100" r="8" fill="currentColor"/>
    <circle cx="425" cy="100" r="8" fill="none" stroke="currentColor"/>
    <circle cx="515" cy="100" r="8" fill="none" stroke="currentColor"/>
    <circle cx="605" cy="100" r="8" fill="none" stroke="currentColor"/>
    <circle cx="695" cy="100" r="8" fill="none" stroke="currentColor"/>

    <circle cx="245" cy="160" r="8" fill="currentColor"/>
    <circle cx="335" cy="160" r="8" fill="currentColor"/>
    <circle cx="425" cy="160" r="8" fill="currentColor"/>
    <circle cx="515" cy="160" r="8" fill="none" stroke="currentColor"/>
    <circle cx="605" cy="160" r="8" fill="none" stroke="currentColor"/>
    <circle cx="695" cy="160" r="8" fill="none" stroke="currentColor"/>

    <circle cx="245" cy="220" r="8" fill="currentColor"/>
    <circle cx="335" cy="220" r="8" fill="currentColor"/>
    <circle cx="425" cy="220" r="8" fill="currentColor"/>
    <circle cx="515" cy="220" r="8" fill="none" stroke="currentColor"/>
    <circle cx="605" cy="220" r="8" fill="currentColor"/>
    <circle cx="695" cy="220" r="8" fill="none" stroke="currentColor"/>

    <circle cx="245" cy="280" r="8" fill="none" stroke="currentColor"/>
    <circle cx="335" cy="280" r="8" fill="none" stroke="currentColor"/>
    <circle cx="425" cy="280" r="8" fill="none" stroke="currentColor"/>
    <circle cx="515" cy="280" r="8" fill="currentColor"/>
    <circle cx="605" cy="280" r="8" fill="none" stroke="currentColor"/>
    <circle cx="695" cy="280" r="8" fill="none" stroke="currentColor"/>
  </svg>
  <figcaption>postgres y backend (sin profile, en cian) están en todos los comandos; cada profile activo suma servicios, y run aísla uno solo de forma one-shot.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Profiles en práctica',
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
# Debug DB:    docker compose --profile debug up pgadmin`,
    },
    {
      type: 'concepts',
      title: 'Límites de recursos — deploy.resources',
      body: `Sin límites, un proceso descontrolado puede consumir toda la CPU y RAM del host. En producción, siempre definí límites.`,
      items: [
        "`deploy.resources.limits.cpus: '0.5'` — Máximo medio core. Cgroups lo hace cumplir.",
        '`deploy.resources.limits.memory: 512M` — Si supera 512MB, el kernel mata el proceso (OOM Kill).',
        "`deploy.resources.reservations.cpus: '0.1'` — CPU garantizada en sistemas con múltiples servicios.",
        '`deploy.resources.reservations.memory: 128M` — RAM garantizada — el scheduler la reserva.',
        'Los límites aplican con `docker compose up` en modo standalone (sin Swarm).',
        "`docker compose ps --format json | jq '.[].MemoryUsage'` — Monitoreo de uso en tiempo real.",
        "Si un servicio muere por OOM: `docker compose logs servicio` mostrará 'Killed' o el kernel logeará en `dmesg`.",
      ],
    },
    {
      type: 'history',
      title: 'deploy: — la clave que Compose heredó de Swarm',
      items: [
        '`deploy:` nació en Docker Swarm mode (2016) para describir cómo distribuir servicios en un cluster: réplicas, restart policies, resources, placement constraints.',
        'Cuando Compose Spec se estandarizó, se decidió **reutilizar la misma clave** en lugar de inventar una nueva — pero Compose standalone solo respeta un subconjunto.',
        '`deploy.resources.limits/reservations` — respetado por `docker compose up` desde Compose V2, aplicado vía cgroups del propio host.',
        '`deploy.replicas` — **ignorado** por `docker compose up` en modo standalone; para múltiples instancias de un servicio usá `docker compose up --scale backend=3` en su lugar.',
        '`deploy.placement`, `deploy.update_config`, `deploy.rollback_config` — solo tienen efecto real en Swarm mode (`docker stack deploy`), Compose standalone los ignora silenciosamente.',
        'Consecuencia práctica: copiar un `compose.yaml` pensado para Swarm no te da automáticamente rolling updates ni placement en un host único — hay que verificar qué subconjunto de `deploy` aplica en cada contexto.',
      ],
    },
    {
      type: 'code',
      title: 'Configuración de producción completa',
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
    external: true`,
    },
    {
      type: 'concepts',
      title: 'Logging drivers — gestión de logs',
      body: `Por defecto, Docker guarda los logs en JSON en el host. Sin configuración, pueden crecer indefinidamente y llenar el disco.`,
      items: [
        '`json-file` (default) — Guarda logs en `/var/lib/docker/containers/<id>/<id>-json.log`. Configurable con `max-size` y `max-file`.',
        '`none` — Sin logs. Para servicios muy verbosos cuya salida no importa.',
        '`syslog` — Envía logs al syslog del host. Integrado con rsyslog/journald.',
        '`journald` — Integración con systemd journal. `journalctl CONTAINER_NAME=backend -f` para seguirlos.',
        '`fluentd` — Para centralized logging con Fluentd/Fluent Bit hacia Elasticsearch o S3.',
        '`awslogs` — Envía directamente a AWS CloudWatch Logs. Requiere credenciales IAM.',
        '`gelf` — Graylog Extended Log Format. Compatible con Graylog y Logstash.',
        "En producción: configurá `max-size: '100m'` y `max-file: '5'` como mínimo para evitar que el disco se llene.",
      ],
    },
    {
      type: 'concepts',
      title: 'Zero-downtime deployment con Compose',
      body: `Compose no tiene rolling updates nativo como Kubernetes. Pero hay patrones para minimizar el downtime.`,
      items: [
        '**Patrón básico**: `docker compose pull && docker compose up -d` — Descarga nueva imagen y recrea contenedores. Hay segundos de downtime.',
        '**Con múltiples réplicas y nginx**: `docker compose up -d --scale backend=2 --no-recreate` → actualizar uno por vez.',
        '**Blue-Green con Compose**: dos stacks (blue/prod y green/new), nginx apunta a uno, actualizás el otro, cambiás nginx.',
        'Para zero-downtime real en producción, necesitás Kubernetes o Docker Swarm. Compose standalone tiene limitaciones.',
        '`docker compose up -d --no-deps backend` — Recrea solo el backend sin tocar los servicios dependientes.',
        'Siempre testear el healthcheck antes de cambiar el tráfico — `docker compose ps` muestra el estado de salud.',
      ],
    },
    {
      type: 'code',
      title: 'Script de deployment con Compose',
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
docker compose -f "$COMPOSE_FILE" -f "$COMPOSE_PROD" ps`,
    },
    {
      type: 'lab',
      title: 'Laboratorio: Stack de producción con profiles y límites',
      steps: [
        { cmd: 'mkdir prod-stack && cd prod-stack', desc: 'Directorio del proyecto.' },
        {
          cmd: "cat > compose.yaml << 'EOF'\nname: prod-demo\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    restart: unless-stopped\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: miapp\n      POSTGRES_USER: admin\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U admin\"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n    deploy:\n      resources:\n        limits:\n          memory: 256M\n    logging:\n      driver: json-file\n      options:\n        max-size: '20m'\n        max-file: '3'\n\n  backend:\n    image: nginx:alpine\n    restart: unless-stopped\n    ports:\n      - '8080:80'\n    depends_on:\n      postgres:\n        condition: service_healthy\n    deploy:\n      resources:\n        limits:\n          cpus: '0.5'\n          memory: 128M\n    logging:\n      driver: json-file\n      options:\n        max-size: '50m'\n        max-file: '5'\n\n  pgadmin:\n    image: dpage/pgadmin4\n    environment:\n      PGADMIN_DEFAULT_EMAIL: dev@local.com\n      PGADMIN_DEFAULT_PASSWORD: admin\n    ports:\n      - '5050:80'\n    profiles: [debug]\n\nvolumes:\n  pgdata:\nEOF",
          desc: 'Stack con restart policies, límites de recursos, logging controlado y perfil debug.',
        },
        {
          cmd: 'docker compose up -d\ndocker compose ps',
          desc: 'Levanta solo los servicios base (sin perfil debug).',
        },
        {
          cmd: 'docker stats --no-stream',
          desc: 'Ve el consumo de CPU y RAM. Con los límites activos, postgres no puede superar 256MB.',
        },
        {
          cmd: 'docker compose --profile debug up -d pgadmin\ndocker compose ps',
          desc: 'Activa el servicio de pgAdmin con el perfil debug. Ahora corre junto al stack base.',
        },
        {
          cmd: "# Simular un límite de memoria\ndocker compose exec postgres bash -c 'cat /sys/fs/cgroup/memory.max' 2>/dev/null || \\\ndocker compose exec postgres cat /sys/fs/cgroup/memory/memory.limit_in_bytes",
          desc: 'Verifica el límite de memoria aplicado por cgroups al contenedor.',
        },
        {
          cmd: '# Ver dónde están los logs\nls -lh /var/lib/docker/containers/ | head -5\ndocker compose logs backend --tail 10',
          desc: 'Los logs están en json-file con rotación automática.',
        },
        {
          cmd: 'docker compose down --profile debug -v',
          desc: 'Limpieza completa incluyendo los servicios con perfil.',
        },
      ],
    },
  ],
};

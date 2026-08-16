export default {
  id: 10,
  title: 'Docker Compose — Fundamentos',
  etapa: 'compose',
  etapaLabel: 'Etapa II — Docker Compose',
  objetivo:
    'Entender qué es Docker Compose, por qué existe y cómo definir aplicaciones multi-contenedor con un archivo YAML.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Hasta ahora correr un stack completo requería ejecutar un comando docker run por cada servicio, en el orden correcto, con todos los flags, redes y volúmenes. Para una app con backend + base de datos + cache + nginx, eso son cuatro comandos complejos que tenés que recordar, coordinar y documentar.

¿Y si querés compartirlo con tu equipo? ¿O levantarlo en un servidor de staging? Mandás un Slack con cuatro comandos y rezás que los copien bien.

Docker Compose resuelve exactamente esto: define toda tu aplicación — todos sus servicios, redes y volúmenes — en un archivo YAML versionado junto con tu código.`,
    },
    {
      type: 'analogy',
      title: 'La analogía de la partitura',
      body: `Cada instrumento de una orquesta sabe qué tocar. Pero sin una partitura que diga cuándo entra cada uno, en qué orden y qué tempo, el resultado es ruido.

Docker Compose es la partitura de tu aplicación. Define qué servicios existen, cómo se comunican, qué volúmenes usan, qué variables de entorno reciben y en qué orden deben arrancar. Un solo comando — \`docker compose up\` — levanta toda la orquesta sincronizada.`,
    },
    {
      type: 'diagram',
      title: 'Sin Compose vs Con Compose',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 700 320" role="img" aria-label="Sin Compose hacen falta cuatro comandos docker run coordinados manualmente en el orden correcto; con Compose, un solo compose.yaml y docker compose up -d levantan el mismo stack">
    <defs>
      <marker id="arrow-10a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="170" y="26" text-anchor="middle" font-size="13" font-weight="bold">Sin Compose</text>
    <rect x="30" y="40" width="280" height="26" rx="3" fill="none" stroke="currentColor"/>
    <text x="170" y="58" text-anchor="middle" font-size="11">network create + volume create</text>
    <line x1="170" y1="66" x2="170" y2="78" stroke="currentColor" marker-end="url(#arrow-10a)"/>
    <rect x="30" y="80" width="280" height="26" rx="3" fill="none" stroke="currentColor"/>
    <text x="170" y="98" text-anchor="middle" font-size="11">docker run postgres</text>
    <line x1="170" y1="106" x2="170" y2="118" stroke="currentColor" marker-end="url(#arrow-10a)"/>
    <rect x="30" y="120" width="280" height="26" rx="3" fill="none" stroke="currentColor"/>
    <text x="170" y="138" text-anchor="middle" font-size="11">docker run redis</text>
    <line x1="170" y1="146" x2="170" y2="158" stroke="currentColor" marker-end="url(#arrow-10a)"/>
    <rect x="30" y="160" width="280" height="26" rx="3" fill="none" stroke="currentColor"/>
    <text x="170" y="178" text-anchor="middle" font-size="11">docker run backend -p 8000:8000</text>
    <line x1="170" y1="186" x2="170" y2="198" stroke="currentColor" marker-end="url(#arrow-10a)"/>
    <rect x="30" y="200" width="280" height="26" rx="3" fill="none" stroke="currentColor"/>
    <text x="170" y="218" text-anchor="middle" font-size="11">docker run nginx -p 80:80</text>
    <text x="170" y="248" text-anchor="middle" font-size="11">4 comandos, el orden importa</text>

    <text x="540" y="26" text-anchor="middle" font-size="13" font-weight="bold">Con Compose</text>
    <rect class="dg-accent" x="400" y="60" width="270" height="70" rx="4" fill="none" stroke="currentColor"/>
    <text x="535" y="82" text-anchor="middle" font-size="12" font-weight="bold">compose.yaml</text>
    <text x="535" y="100" text-anchor="middle" font-size="11">services: postgres, redis,</text>
    <text x="535" y="116" text-anchor="middle" font-size="11">backend, nginx</text>

    <line x1="535" y1="130" x2="535" y2="170" stroke="currentColor" marker-end="url(#arrow-10a)"/>
    <text x="535" y="152" text-anchor="middle" font-size="10">docker compose up -d</text>

    <rect x="400" y="172" width="270" height="70" rx="4" fill="none" stroke="currentColor"/>
    <text x="535" y="194" text-anchor="middle" font-size="12" font-weight="bold">Stack levantado</text>
    <text x="535" y="212" text-anchor="middle" font-size="11">postgres, redis,</text>
    <text x="535" y="228" text-anchor="middle" font-size="11">backend, nginx</text>
    <text x="535" y="264" text-anchor="middle" font-size="11">1 archivo, 1 comando</text>
  </svg>
  <figcaption>Los mismos cuatro servicios que sin Compose requieren cuatro comandos docker run coordinados a mano, con Compose se definen en un compose.yaml y se levantan con un solo docker compose up -d.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Estructura del archivo compose.yaml',
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
  private:         # Red interna — DB y Redis no expuestos`,
    },
    {
      type: 'concepts',
      title: 'Comandos esenciales de Compose',
      items: [
        '`docker compose up` — Crea y arranca todos los servicios. `-d` en background (detached).',
        '`docker compose up --build` — Reconstruye las imágenes antes de arrancar. Útil cuando cambiaste el Dockerfile.',
        '`docker compose down` — Para y elimina contenedores, redes. Los volúmenes persisten.',
        '`docker compose down -v` — También elimina los volúmenes. **Cuidado: borra datos.**',
        '`docker compose ps` — Estado de todos los servicios del proyecto.',
        '`docker compose logs` — Logs de todos los servicios mezclados. `-f` para follow. `docker compose logs backend` para uno solo.',
        '`docker compose restart backend` — Reinicia solo un servicio.',
        '`docker compose exec backend bash` — Shell dentro del contenedor del servicio.',
        '`docker compose run --rm backend python manage.py migrate` — Corre un comando one-shot en un nuevo contenedor del servicio.',
        '`docker compose pull` — Actualiza las imágenes de todos los servicios.',
        '`docker compose config` — Valida y muestra el compose.yaml resuelto (con variables interpoladas).',
        '`docker compose top` — Procesos corriendo dentro de cada servicio, como un *ps* multi-contenedor.',
        '`docker compose events` — Stream de eventos del proyecto (creación, arranque, muerte de contenedores) en tiempo real.',
      ],
    },
    {
      type: 'concepts',
      title: 'Variables de entorno — las tres formas',
      body: `Hardcodear valores en el compose.yaml es un anti-pattern. Usá variables de entorno para separar configuración de definición.`,
      items: [
        '**Inline**: `environment: DB_PASS: secret` — Nunca en producción. Queda en git.',
        '**Variable del host**: `environment: DB_PASS: $DB_PASS` — Toma el valor del shell que lanza Compose.',
        '**Archivo .env**: Compose busca `.env` en el mismo directorio automáticamente. No requiere configuración.',
        '**env_file explícito**: `env_file: - .env.production` — Para archivos con otro nombre o en otra ruta.',
        'El `.env` **no** se pasa a los contenedores automáticamente — solo es para interpolación en el YAML. Para pasarlo al contenedor, usá `env_file` o `environment`.',
        'En CI/CD: las variables del entorno del runner se inyectan al compose. Nunca commitees el `.env` de producción.',
        '`docker compose config` muestra las variables interpoladas — útil para debuggear.',
      ],
    },
    {
      type: 'code',
      title: 'Archivo .env — configuración por entorno',
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
#       DB_NAME: \${POSTGRES_DB}`,
    },
    {
      type: 'concepts',
      title: 'depends_on y healthchecks — orden de arranque',
      body: `\`depends_on\` no espera que el servicio esté listo — solo que el contenedor haya arrancado. Para esperar que el servicio esté realmente disponible, combiná con healthchecks.`,
      items: [
        "`depends_on: [postgres]` — Solo espera que el contenedor esté en estado 'running'. No que PostgreSQL acepte conexiones.",
        '`depends_on: postgres: condition: service_healthy` — Espera a que el healthcheck del servicio devuelva healthy.',
        'El healthcheck se define en el servicio dependido o en el Dockerfile con `HEALTHCHECK`.',
        '`condition: service_started` — Comportamiento default: contenedor arrancado, no necesariamente listo.',
        '`condition: service_completed_successfully` — Para servicios one-shot (migrations, seed data).',
        'Alternativa histórica: scripts `wait-for-it.sh` o `dockerize` — workarounds antes de que Compose soportara healthchecks en depends_on.',
      ],
    },
    {
      type: 'code',
      title: 'Healthchecks en Compose',
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
      start_period: 15s`,
    },
    {
      type: 'concepts',
      title: 'Proyecto y naming — cómo Compose nombra los recursos',
      items: [
        'Compose prefija todos los recursos con el nombre del proyecto: `miapp_postgres_1`, `miapp_app-net`.',
        'El nombre del proyecto por defecto es el nombre del directorio donde está el compose.yaml.',
        '`docker compose -p mistack up` — Nombre de proyecto explícito. Útil para correr múltiples instancias.',
        'La variable `COMPOSE_PROJECT_NAME` en `.env` también lo define.',
        '`name: miapp` al inicio del compose.yaml — Define el nombre desde el archivo (Compose Spec v3.9+).',
        'Con el nombre del proyecto podés identificar qué contenedores pertenecen a qué stack con `docker ps`.',
        'El nombre se normaliza: minúsculas, y todo lo que no sea alfanumérico se reemplaza por guion bajo — un directorio *Mi-App!* termina siendo el proyecto `mi-app_`.',
      ],
    },
    {
      type: 'history',
      title: 'De docker-compose (Python) a docker compose (Go) — por qué cambió la sintaxis',
      items: [
        '**Compose V1** (2014-2021): un binario Python separado, `docker-compose`, que había que instalar aparte con pip o un binario standalone. Sintaxis con guion.',
        '**Compose V2** (2021 en adelante): reescrito en Go y distribuido como **plugin** de la CLI de Docker. Se invoca sin guion — `docker compose` — y viene incluido en Docker Desktop y en `docker-compose-plugin` de los paquetes oficiales de Linux.',
        'V1 quedó deprecado oficialmente en julio de 2023 — dejó de recibir actualizaciones. Si tu CI todavía usa `docker-compose` con guion, es momento de migrar.',
        'La sintaxis del YAML es compatible entre ambas versiones en el 99% de los casos — el cambio grande fue la implementación, no el formato.',
        '**Compose Specification** (compose-spec.io): a partir de V2, el formato del archivo se separó del binario de Docker y se volvió un estándar abierto — por eso otras herramientas (Podman Compose, por ejemplo) también lo leen.',
        'La clave `version: "3.8"` al inicio del archivo, obligatoria en V1, es **obsoleta y se ignora** en la Compose Specification actual — Compose infiere las capacidades disponibles sin necesitar declarar una versión.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Stack completo con Compose',
      steps: [
        { cmd: 'mkdir stack-demo && cd stack-demo', desc: 'Crea el directorio del proyecto.' },
        {
          cmd: 'cat > compose.yaml << \'EOF\'\nname: stack-demo\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_PASSWORD: secret\n      POSTGRES_DB: demo\n      POSTGRES_USER: admin\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U admin -d demo"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n      start_period: 10s\n\n  adminer:\n    image: adminer\n    ports:\n      - "8080:8080"\n    depends_on:\n      postgres:\n        condition: service_healthy\n\nvolumes:\n  pgdata:\nEOF',
          desc: 'Stack con PostgreSQL + Adminer (UI web para la DB). Mínimo y funcional.',
        },
        {
          cmd: 'docker compose up -d',
          desc: 'Levanta el stack. Compose espera que postgres esté healthy antes de arrancar adminer.',
        },
        {
          cmd: 'docker compose ps',
          desc: 'Estado de todos los servicios. Verás el healthcheck status de postgres.',
        },
        { cmd: 'docker compose logs postgres --tail 20', desc: 'Logs de inicialización de PostgreSQL.' },
        {
          cmd: 'docker compose exec postgres psql -U admin -d demo -c "CREATE TABLE test (id serial, valor text);"\ndocker compose exec postgres psql -U admin -d demo -c "INSERT INTO test (valor) VALUES (\'desde compose\');"',
          desc: 'Ejecuta SQL dentro del contenedor de postgres vía Compose.',
        },
        {
          cmd: 'docker compose exec postgres psql -U admin -d demo -c "SELECT * FROM test;"',
          desc: 'Verifica los datos insertados.',
        },
        {
          cmd: 'docker compose down\ndocker compose up -d\ndocker compose exec postgres psql -U admin -d demo -c "SELECT * FROM test;"',
          desc: 'Down y up de nuevo — los datos persisten porque el volumen pgdata sobrevive.',
        },
        {
          cmd: 'docker compose down -v\ndocker compose ps',
          desc: 'Down con -v elimina el volumen. Los datos de la DB desaparecen. Contenedores también.',
        },
      ],
    },
  ],
};

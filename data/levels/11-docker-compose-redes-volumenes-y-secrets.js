export default {
  id: 11,
  title: 'Docker Compose — Redes, Volúmenes y Secrets',
  etapa: 'compose',
  etapaLabel: 'Etapa II — Docker Compose',
  objetivo:
    'Dominar la configuración avanzada de redes y volúmenes en Compose, y gestionar secretos de forma segura.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Un compose.yaml básico funciona. Pero en el mundo real necesitás separar servicios en redes distintas por seguridad, gestionar datos persistentes con control, y manejar credenciales sin que terminen en el código fuente o en la historia de git.

¿Cómo hacés que nginx pueda hablar con tu backend pero no con tu base de datos? ¿Cómo compartís un volumen entre dos servicios? ¿Cómo pasás un token de API sin hardcodearlo en el yaml?

Estas decisiones de configuración determinan si tu stack es robusto o frágil, seguro o vulnerable.`,
    },
    {
      type: 'diagram',
      title: 'Arquitectura de redes en un stack real',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 720 400" role="img" aria-label="nginx solo llega a api en backend-net, y api es el único puente hacia postgres y redis, aislados en data-net">
    <defs>
      <marker id="arrow-11a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="360" y="24" font-size="12" text-anchor="middle">Internet</text>
    <line x1="360" y1="30" x2="360" y2="56" stroke="currentColor" marker-end="url(#arrow-11a)"/>
    <rect x="337" y="36" width="60" height="14" fill="#0a0d16"/>
    <text x="367" y="47" font-size="11" text-anchor="start">:80/:443</text>

    <rect x="40" y="60" width="640" height="90" fill="none" stroke="currentColor" rx="6"/>
    <text x="55" y="78" font-size="11">Red: public</text>
    <rect x="310" y="88" width="100" height="42" fill="none" stroke="currentColor" rx="4"/>
    <text x="360" y="113" font-size="12" text-anchor="middle">nginx</text>

    <line x1="360" y1="130" x2="360" y2="166" stroke="currentColor" marker-end="url(#arrow-11a)"/>
    <rect x="335" y="140" width="50" height="14" fill="#0a0d16"/>
    <text x="360" y="151" font-size="11" text-anchor="middle">:8000</text>

    <rect x="40" y="170" width="640" height="90" fill="none" stroke="currentColor" rx="6"/>
    <text x="55" y="188" font-size="11">Red: backend-net</text>
    <rect x="310" y="198" width="100" height="42" fill="none" stroke="currentColor" rx="4"/>
    <text x="360" y="223" font-size="12" text-anchor="middle">api</text>

    <line x1="330" y1="240" x2="255" y2="316" stroke="currentColor" marker-end="url(#arrow-11a)"/>
    <text x="240" y="285" font-size="11" text-anchor="middle">:5432</text>

    <line x1="390" y1="240" x2="495" y2="316" stroke="currentColor" marker-end="url(#arrow-11a)"/>
    <text x="500" y="285" font-size="11" text-anchor="middle">:6379</text>

    <rect class="dg-accent" x="40" y="280" width="640" height="110" fill="none" stroke="currentColor" rx="6"/>
    <text x="55" y="298" font-size="11">Red: data-net (internal: true — sin salida a internet)</text>

    <rect x="180" y="316" width="140" height="42" fill="none" stroke="currentColor" rx="4"/>
    <text x="250" y="341" font-size="12" text-anchor="middle">postgres</text>

    <rect x="430" y="316" width="140" height="42" fill="none" stroke="currentColor" rx="4"/>
    <text x="500" y="341" font-size="12" text-anchor="middle">redis</text>

    <text x="360" y="380" font-size="11" text-anchor="middle">postgres y redis no reciben conexiones directas de nginx ni de internet</text>
  </svg>
  <figcaption>Cada red segmenta el acceso: nginx solo llega a api, y api es el único puente hacia postgres y redis, aislados en data-net.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Redes en Compose — configuración completa',
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
    internal: true   # Los contenedores en esta red NO pueden salir a internet`,
    },
    {
      type: 'code',
      title: 'Redes externas — compartir entre stacks',
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
      DB_HOST: postgres   # Resuelve el contenedor del otro stack por nombre`,
    },
    {
      type: 'concepts',
      title: 'Volúmenes en Compose — todas las opciones',
      items: [
        '**Named volume**: `volumes: - pgdata:/var/lib/postgresql/data` — Gestionado por Docker, persiste entre up/down.',
        '**Bind mount**: `volumes: - ./data:/var/lib/postgresql/data` — Path del host. Útil en desarrollo para hot-reload.',
        '**Tmpfs**: `tmpfs: - /tmp:size=100m` — En memoria, no persiste. Para archivos temporales sensibles.',
        '**Volume externo**: `external: true` — Volume creado fuera de Compose, no lo gestiona el stack.',
        'Volúmenes compartidos entre servicios: el mismo volumen nombrado puede montarse en múltiples servicios simultáneamente.',
        '`:ro` para solo lectura: `- pgdata:/data:ro` — El contenedor no puede modificar el volumen.',
        '`docker compose down -v` borra **solo** los volúmenes definidos en el compose, no los externos.',
      ],
    },
    {
      type: 'comparison',
      title: 'Named volume vs Bind mount — cuál usar cuándo',
      headers: ['Característica', 'Named volume', 'Bind mount'],
      rows: [
        {
          feature: 'Quién lo gestiona',
          a: 'Docker (crea, ubica y limpia)',
          b: 'Vos — es un path del filesystem del host',
        },
        {
          feature: 'Ubicación',
          a: '/var/lib/docker/volumes/... (oculta)',
          b: 'El path exacto que declaraste',
        },
        {
          feature: 'Portabilidad',
          a: 'Alta — no depende de la estructura del host',
          b: 'Baja — atada a esa máquina y ese path',
        },
        {
          feature: 'Uso típico',
          a: 'Datos persistentes de producción (DB, uploads)',
          b: 'Hot-reload de código en desarrollo',
        },
        {
          feature: 'Performance en macOS/Windows',
          a: 'Mejor (usa el filesystem nativo de la VM)',
          b: 'Peor — pasa por el sistema de sincronización de archivos',
        },
        {
          feature: 'Backup',
          a: '`docker run --rm -v vol:/data -v $(pwd):/backup alpine tar czf /backup/b.tar.gz /data`',
          b: '`tar czf backup.tar.gz ./data` directo, sin Docker',
        },
      ],
    },
    {
      type: 'code',
      title: 'Volúmenes avanzados — compartidos y externos',
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
    external: true      # Creado manualmente con: docker volume create uploads`,
    },
    {
      type: 'concepts',
      title: 'Secrets en Docker Compose',
      body: `Los secrets son la forma correcta de pasar información sensible — contraseñas, tokens, certificados — sin exponerlos en variables de entorno ni en el YAML.`,
      items: [
        'En modo Compose standalone (sin Swarm): los secrets son bind mounts a archivos locales montados en `/run/secrets/nombre`.',
        'En Docker Swarm: los secrets están cifrados en el raft store del cluster y se distribuyen de forma segura.',
        'Los secrets se montan como archivos, no como variables de entorno — el proceso los lee en runtime.',
        'Ventaja sobre ENV: no aparecen en `docker inspect`, en los logs de proceso, ni en `ps aux`.',
        '`docker compose config` no muestra el contenido de los secrets — solo su configuración.',
        'Para desarrollo: archivos locales `./secrets/db_password.txt`. Para producción con Swarm: `docker secret create`.',
        'Compose Spec también soporta secrets desde variable de entorno: `secrets: db_password: environment: DB_PASSWORD` — útil cuando el secreto ya llega inyectado por el orquestador externo (Vault, AWS Secrets Manager) sin pasar por un archivo.',
      ],
    },
    {
      type: 'code',
      title: 'Secrets en Compose — modo standalone',
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
# secrets/`,
    },
    {
      type: 'concepts',
      title: 'Override files — configuración por entorno',
      body: `Compose soporta múltiples archivos que se fusionan. Esto permite tener una configuración base y sobreescribir solo lo necesario para cada entorno.`,
      items: [
        '`compose.yaml` — Configuración base, aplica a todos los entornos.',
        '`compose.override.yaml` — Se fusiona automáticamente con el base cuando corés `docker compose up`.',
        '`docker compose -f compose.yaml -f compose.prod.yaml up` — Fusión explícita para producción.',
        'La fusión suma arrays (volumes, ports, env_file) y sobreescribe valores escalares.',
        'Patrón: en base definís la estructura, en override de dev agregás bind mounts y debug ports, en override de prod configurás restart policies y limits.',
        '`docker compose config` muestra el YAML final fusionado — verificá que sea lo esperado antes de deployar.',
      ],
    },
    {
      type: 'history',
      title: 'Por qué secrets son archivos y no variables de entorno',
      items: [
        'El patrón de "12-factor app" (2011) popularizó pasar configuración por variables de entorno — simple, portable, pero **nunca pensado para datos sensibles**.',
        'Una variable de entorno queda visible en `docker inspect`, en `/proc/PID/environ` dentro del contenedor, y a veces en logs de crash o en herramientas de APM que dumpean el entorno completo del proceso.',
        'Docker Swarm introdujo `docker secret` en 2017 montando el secreto como archivo en `/run/secrets/` — cifrado en tránsito y en el raft store, fuera del entorno del proceso.',
        'Compose standalone adoptó la misma interfaz (archivo en `/run/secrets/`) por consistencia, aunque sin cifrado — es solo un bind mount de un archivo local. La seguridad ahí depende de los permisos del filesystem del host.',
        'Kubernetes replicó el mismo patrón con sus `Secret` objects montados como volúmenes — la convención de "secreto = archivo montado, no env var" es hoy transversal a todo el ecosistema de contenedores.',
      ],
    },
    {
      type: 'code',
      title: 'Override files — desarrollo vs producción',
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
# docker compose -f compose.yaml -f compose.prod.yaml up -d`,
    },
    {
      type: 'lab',
      title: 'Laboratorio: Stack seguro con redes y secrets',
      steps: [
        {
          cmd: 'mkdir secure-stack && cd secure-stack\nmkdir -p secrets',
          desc: 'Estructura del proyecto con directorio para secrets.',
        },
        {
          cmd: "echo 'dev_db_password_123' > secrets/db_password.txt\necho 'dev_api_key_abc456' > secrets/api_key.txt\necho 'secrets/' > .gitignore",
          desc: 'Crea archivos de secretos locales y excluye del git.',
        },
        {
          cmd: 'cat > compose.yaml << \'EOF\'\nname: secure-stack\n\nservices:\n  postgres:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: admin\n      POSTGRES_DB: miapp\n      POSTGRES_PASSWORD_FILE: /run/secrets/db_password\n    secrets:\n      - db_password\n    networks:\n      - data-net\n    healthcheck:\n      test: ["CMD-SHELL", "pg_isready -U admin"]\n      interval: 5s\n      timeout: 5s\n      retries: 5\n      start_period: 10s\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n\n  backend:\n    image: nginx:alpine\n    networks:\n      - data-net\n      - public\n    depends_on:\n      postgres:\n        condition: service_healthy\n\n  nginx:\n    image: nginx:alpine\n    ports:\n      - \'80:80\'\n    networks:\n      - public\n    depends_on:\n      - backend\n\nnetworks:\n  public:\n  data-net:\n    internal: true\n\nvolumes:\n  pgdata:\n\nsecrets:\n  db_password:\n    file: ./secrets/db_password.txt\nEOF',
          desc: 'Stack con redes separadas y secret para la contraseña.',
        },
        {
          cmd: 'docker compose up -d\ndocker compose ps',
          desc: 'Levanta el stack. Observá que postgres pasa por el healthcheck antes de que backend arranque.',
        },
        {
          cmd: 'docker compose exec postgres cat /run/secrets/db_password',
          desc: 'El secret está disponible como archivo dentro del contenedor.',
        },
        {
          cmd: "# Verificar que el secret NO aparece en las variables de entorno\ndocker compose exec postgres env | grep -i password || echo 'No aparece como env var — correcto'",
          desc: 'La contraseña no está en las variables de entorno del contenedor. Seguridad mantenida.',
        },
        {
          cmd: "# Verificar aislamiento de red\ndocker compose exec nginx ping -c 2 postgres 2>&1 || echo 'nginx no puede ver postgres — aislamiento correcto'",
          desc: 'nginx está solo en la red public, no puede alcanzar postgres que está en data-net (internal).',
        },
        { cmd: 'docker compose down -v', desc: 'Limpieza completa con volúmenes.' },
      ],
    },
  ],
};

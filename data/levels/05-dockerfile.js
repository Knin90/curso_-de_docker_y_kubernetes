export default {
  id: 5,
  title: 'Dockerfile',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Escribir Dockerfiles correctos y profesionales, entendiendo qué hace cada instrucción y cómo impacta en el resultado final.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Un Dockerfile mal escrito produce imágenes de 2 GB cuando deberían pesar 50 MB. Reconstruye todo desde cero cuando solo cambió una línea de código. Expone credenciales en las capas. Corre como root sin necesidad.

El Dockerfile es el ADN de tu imagen. Cada instrucción crea una capa, y esas capas determinan el tamaño, la seguridad, la velocidad de build y la superficie de ataque.

El 80% de las imágenes en producción tienen al menos uno de estos problemas. Aprendé a evitarlos desde el principio.`,
    },
    {
      type: 'concepts',
      title: 'FROM — elegir bien la base',
      body: `Siempre la primera instrucción. Define la imagen base sobre la que todo lo demás se construye.`,
      items: [
        '`FROM ubuntu:22.04` — Base completa con apt. Útil pero pesada (~77MB). Muchos paquetes innecesarios.',
        '`FROM debian:bookworm-slim` — Debian reducido. Buen balance entre compatibilidad y tamaño (~30MB).',
        '`FROM python:3.12-slim` — Versión reducida de la imagen oficial de Python. Recomendada para APIs Python.',
        '`FROM python:3.12-alpine` — Alpine + Python. Mínima, pero usa musl libc — puede causar issues con C extensions.',
        '`FROM scratch` — Imagen vacía. Para binarios completamente estáticos (Go compilado con CGO_ENABLED=0).',
        'Siempre especificá la versión exacta. `FROM python:latest` en producción cambia silenciosamente con cada release.',
        'Usá `FROM python:3.12.3-slim-bookworm` si necesitás total reproducibilidad de la imagen base.',
        'Considerá las imágenes distroless de Google para producción: sin shell, sin package manager, mínima superficie de ataque.',
      ],
    },
    {
      type: 'comparison',
      title: 'Slim vs Alpine vs Distroless — elegir la base correcta',
      headers: ['Variante', 'Tamaño típico / libc', 'Riesgo y compatibilidad'],
      rows: [
        {
          feature: 'python:3.12-slim (Debian)',
          a: '~130MB, glibc',
          b: 'Máxima compatibilidad con wheels precompiladas. Tiene apt y shell — mayor superficie de ataque que alpine.',
        },
        {
          feature: 'python:3.12-alpine',
          a: '~50MB, musl libc',
          b: 'Mucho más chica, pero paquetes con C extensions (numpy, pandas, cryptography) pueden fallar o requerir compilar desde cero.',
        },
        {
          feature: 'gcr.io/distroless/python3',
          a: '~50MB, sin shell ni package manager',
          b: 'Ataque mínimo: no hay `sh`, no hay `apt`, ni siquiera hay forma de hacer `docker exec ... bash`. Ideal para producción, más difícil de depurar.',
        },
        {
          feature: 'FROM scratch',
          a: '0MB base, solo lo que copiés',
          b: 'Solo viable con binarios estáticos (Go, Rust). Ni siquiera tiene certificados SSL — hay que copiarlos a mano.',
        },
      ],
    },
    {
      type: 'concepts',
      title: 'RUN — ejecutar comandos y optimizar capas',
      items: [
        'Cada `RUN` crea una nueva capa. Encadenar comandos con `&&` minimiza el número de capas.',
        '`RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*` — El `rm` borra el cache en la misma capa. Si lo ponés en un `RUN` separado, el cache ya está en una capa previa y la imagen igual pesa.',
        'Usá `--no-install-recommends` en apt para no instalar paquetes opcionales y reducir tamaño.',
        'En Alpine usá `--no-cache`: `RUN apk add --no-cache python3 py3-pip`',
        'Backslash `\\` para legibilidad multi-línea sin crear capas extras.',
        'Con BuildKit: `RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt` — cachea el pip cache entre builds.',
        'Con BuildKit: `RUN --mount=type=secret,id=mysecret cat /run/secrets/mysecret` — usa secretos sin que queden en capas.',
      ],
    },
    {
      type: 'concepts',
      title: 'COPY vs ADD — cuándo usar cada uno',
      items: [
        '`COPY` copia archivos del contexto de build al filesystem de la imagen. Simple y predecible. Usalo por defecto.',
        '`ADD` hace lo mismo pero además: extrae tarballs automáticamente y soporta URLs remotas.',
        'Regla: usá `COPY` siempre. Usá `ADD` solo cuando necesités extracción automática de un tarball local.',
        '`COPY --chown=user:group archivo.py /app/` — Copia con ownership correcto sin `RUN chown` separado.',
        '`COPY --chmod=755 script.sh /app/` — Copia con permisos de ejecución (BuildKit).',
        '`COPY . .` al final del Dockerfile, no al principio — para aprovechar el cache de capas anteriores.',
        'Usá `.dockerignore` para excluir `node_modules`, `.git`, `.env` y otros archivos innecesarios del contexto.',
      ],
    },
    {
      type: 'concepts',
      title: 'CMD vs ENTRYPOINT — la confusión más común',
      body: `La combinación de ENTRYPOINT y CMD es una de las partes más mal entendidas del Dockerfile.`,
      items: [
        '`CMD` define el comando por defecto. Se sobreescribe completamente con argumentos en `docker run imagen OTRO_CMD`.',
        '`ENTRYPOINT` define el ejecutable que siempre corre. Los argumentos de `docker run` se **agregan** como args, no reemplazan.',
        'Patrón profesional: `ENTRYPOINT ["./app"]` + `CMD ["--config", "default.yaml"]`. El CMD son defaults sobreescribibles.',
        'Forma exec `["cmd", "arg"]` es la correcta. Hace que el proceso sea PID 1 directamente — recibe SIGTERM.',
        'Forma shell `cmd arg` crea un proceso `/bin/sh -c` como PID 1. Tu app no recibe SIGTERM directamente.',
        'Para sobreescribir ENTRYPOINT en docker run: `docker run --entrypoint /bin/bash mi-imagen`.',
        'Si solo usás CMD, el shell interpreta el comando. Si usás ENTRYPOINT exec, el proceso es PID 1.',
      ],
    },
    {
      type: 'concepts',
      title: 'El resto de instrucciones esenciales',
      items: [
        '`WORKDIR /app` — Establece el directorio de trabajo. Lo crea si no existe. Preferible a `RUN mkdir && cd`.',
        '`ENV DB_HOST=localhost PORT=8000` — Variables de entorno disponibles en runtime. Visible en `docker inspect`.',
        '`ARG VERSION=1.0` — Variable disponible SOLO durante el build. No persiste en la imagen. Para tokens de CI, versiones.',
        '`EXPOSE 8080` — Documentación. No abre el puerto — eso lo hace `-p` en `docker run`. Pero `docker run -P` usa EXPOSE.',
        '`LABEL maintainer="dev@empresa.com" version="1.0"` — Metadata. Consultable con `docker inspect`.',
        '`USER appuser` — Cambia el usuario para instrucciones siguientes y para el proceso del contenedor.',
        '`VOLUME /data` — Declara un punto de montaje. Crea un volumen anónimo si no se especifica en `docker run`.',
        '`HEALTHCHECK CMD curl -f http://localhost:8000/health || exit 1` — Healthcheck integrado en la imagen.',
        '`ONBUILD COPY . /app` — Se ejecuta cuando esta imagen se usa como base en otro Dockerfile.',
        '`STOPSIGNAL SIGQUIT` — Señal que Docker envía para detener el contenedor (por defecto: SIGTERM).',
      ],
    },
    {
      type: 'code',
      title: 'Dockerfile profesional — Python FastAPI',
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
CMD ["main:app", "--host", "0.0.0.0", "--port", "8000"]`,
    },
    {
      type: 'code',
      title: '.dockerignore — fundamental',
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
logs/`,
    },
    {
      type: 'history',
      title: 'Errores comunes en Dockerfiles reales',
      items: [
        '`COPY . .` antes de instalar dependencias: cualquier cambio de código invalida el cache de `pip install` o `npm ci`, y cada build reinstala todo desde cero.',
        'Dejar credenciales en `ENV` o `ARG` sin `--mount=type=secret`: quedan grabadas en la capa para siempre, visibles con `docker history` o `docker inspect` aunque borres el archivo en una instrucción posterior.',
        "Un `RUN apt-get update` sin `apt-get install` en la misma línea: el índice de paquetes queda cacheado y desactualizado, causando errores de 'paquete no encontrado' en builds futuros.",
        "Correr como root porque 'es más simple': sin `USER`, cualquier RCE en la app tiene privilegios de root dentro del contenedor — y si hay un escape de contenedor, root en el host.",
        'No fijar versión de la imagen base (`FROM node:latest`): el build de hoy y el de dentro de un mes pueden traer versiones de Node distintas, rompiendo reproducibilidad.',
        "Instalar herramientas de debug (`vim`, `curl`, `net-tools`) en la imagen final 'por si las dudas': cada paquete es superficie de ataque y peso extra que nunca se usa en producción.",
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Imagen FastAPI desde cero',
      steps: [
        { cmd: 'mkdir mi-api && cd mi-api', desc: 'Crea el directorio del proyecto.' },
        {
          cmd: "cat > requirements.txt << 'EOF'\nfastapi==0.111.0\nuvicorn[standard]==0.29.0\nhttpx==0.27.0\nEOF",
          desc: 'Dependencias fijadas con versiones exactas para reproducibilidad.',
        },
        {
          cmd: "cat > main.py << 'EOF'\nfrom fastapi import FastAPI\nimport os, platform\n\napp = FastAPI(title='Mi API Demo')\n\n@app.get('/health')\ndef health(): return {'status': 'ok'}\n\n@app.get('/')\ndef root():\n    return {\n        'message': 'Hola desde Docker',\n        'python': platform.python_version(),\n        'host': os.environ.get('HOSTNAME', 'unknown')\n    }\nEOF",
          desc: 'API mínima con endpoint de health y root.',
        },
        {
          cmd: '# Crear el Dockerfile (copiá el del ejemplo anterior)\n# Crear .dockerignore (copiá el del ejemplo anterior)',
          desc: '',
        },
        {
          cmd: 'docker build -t mi-api:v1 .\ndocker image history mi-api:v1',
          desc: 'Observá cómo se crea cada capa. History muestra tamaño y comando de cada una.',
        },
        {
          cmd: 'docker run -d -p 8000:8000 --name api mi-api:v1\ncurl http://localhost:8000/\ncurl http://localhost:8000/health',
          desc: 'Debe devolver JSON con status ok y info del entorno.',
        },
        {
          cmd: "# Modificar código y reconstruir — observar cache\necho '# cambio' >> main.py\ndocker build -t mi-api:v2 .",
          desc: 'Las capas de dependencias se reutilizan del cache. Solo reconstruye desde COPY . .',
        },
        {
          cmd: '# Comparar tamaños v1 vs v2\ndocker images mi-api\n# Verificar que corre como non-root\ndocker exec api whoami\ndocker exec api id',
          desc: "Debe mostrar 'appuser', no 'root'. Seguridad verificada.",
        },
        {
          cmd: "# Confirmar que el healthcheck integrado funciona\ndocker inspect api --format '{{.State.Health.Status}}'",
          desc: "Debe pasar a 'healthy' después del start-period. Si queda en 'unhealthy', revisá el endpoint /health.",
        },
        {
          cmd: '# Medir el efecto real del cache: rebuild sin cambios\ntime docker build -t mi-api:v3 .\n# Ahora forzar sin cache\ntime docker build --no-cache -t mi-api:v4 .',
          desc: 'El primer build es casi instantáneo (todo cacheado). El segundo reinstala requirements.txt desde cero — la diferencia de tiempo es el valor del cache.',
        },
        {
          cmd: "docker stop api && docker rm api\ndocker rmi mi-api:v1 mi-api:v2 mi-api:v3 mi-api:v4\ndocker images | grep mi-api || echo 'Limpieza confirmada: no quedan imágenes mi-api'",
          desc: 'Limpieza completa de contenedor e imágenes creadas durante la práctica.',
        },
      ],
    },
  ],
};

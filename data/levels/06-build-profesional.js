export default {
  id: 6,
  title: 'Build Profesional',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Dominar técnicas avanzadas de build: multi-stage, cache eficiente, BuildKit y optimización de tamaño.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Una imagen de Go o Java que incluye el compilador, las herramientas de build y los archivos fuente puede pesar 1.5 GB. La imagen que necesitás en producción debería pesar 15 MB — solo el binario compilado.

Sin multi-stage builds, tus opciones son: imagen gigante en producción, o scripts complejos externos para compilar y luego copiar. Con multi-stage, el problema desaparece con elegancia.

Y si cada build tarda 5 minutos reinstalando dependencias que no cambiaron, tu pipeline de CI es 10 veces más lento de lo que podría ser.`,
    },
    {
      type: 'diagram',
      title: 'Multi-stage build — el principio',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 640 330" role="img" aria-label="El stage builder compila con el compilador y las fuentes (~400MB) y solo el binario final se copia a la imagen scratch de producción (~8MB); el builder nunca llega a producción">
    <defs>
      <marker id="arrow-06a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>
    <rect x="60" y="24" width="520" height="120" rx="4" fill="none" stroke="currentColor"/>
    <text x="320" y="46" text-anchor="middle" font-size="13" font-weight="bold">Stage 1: builder</text>
    <text x="320" y="66" text-anchor="middle" font-size="12">FROM golang:1.22-alpine</text>
    <text x="320" y="84" text-anchor="middle" font-size="12">RUN go build -o app .</text>
    <text x="320" y="102" text-anchor="middle" font-size="12">compilador + herramientas + fuentes</text>
    <text x="320" y="122" text-anchor="middle" font-size="12">Tamaño: ~400MB</text>

    <line x1="320" y1="144" x2="320" y2="200" stroke="currentColor" marker-end="url(#arrow-06a)"/>
    <rect x="170" y="152" width="300" height="20" fill="#0a0d16"/>
    <text x="320" y="166" text-anchor="middle" font-size="11">COPY --from=builder /build/app /app (5MB)</text>

    <rect class="dg-accent" x="60" y="204" width="520" height="90" rx="4" fill="none" stroke="currentColor"/>
    <text x="320" y="226" text-anchor="middle" font-size="13" font-weight="bold">Stage 2: production</text>
    <text x="320" y="246" text-anchor="middle" font-size="12">FROM scratch — ENTRYPOINT ["/app"]</text>
    <text x="320" y="266" text-anchor="middle" font-size="12">Tamaño: ~8MB (solo el binario + certs)</text>

    <text x="320" y="316" text-anchor="middle" font-size="11">La imagen de build nunca llega a producción</text>
  </svg>
  <figcaption>El stage builder compila con el compilador y las fuentes (~400MB), pero solo el binario final se copia a la imagen scratch de producción (~8MB) — el builder nunca llega a producción.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Multi-stage: Go — imagen de 8 MB',
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
ENTRYPOINT ["/app"]`,
    },
    {
      type: 'code',
      title: 'Multi-stage: Node.js — separar build de producción',
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
CMD ["node", "dist/server.js"]`,
    },
    {
      type: 'code',
      title: 'Multi-stage: Java/Spring Boot',
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
ENTRYPOINT ["java", "org.springframework.boot.loader.JarLauncher"]`,
    },
    {
      type: 'concepts',
      title: 'Cache de capas — la estrategia correcta',
      body: `El cache es la optimización más impactante para builds repetitivos. La regla de oro: **lo que cambia con más frecuencia va al final**.`,
      items: [
        'Las dependencias (package.json, requirements.txt, go.mod) cambian raramente — copiálas primero.',
        'El código fuente cambia en cada commit — copiálo al final.',
        'Si invertís el orden, cada cambio de código invalida el cache de dependencias y reinstalás todo desde cero.',
        'Una capa invalidada invalida TODAS las capas siguientes. El cache es secuencial.',
        '`docker build --no-cache .` — Fuerza rebuild completo. Útil para CI o cuando sospecháis de cache corrupto.',
        '`docker build --cache-from mi-imagen:latest .` — Usa una imagen remota como fuente de cache (CI/CD).',
        'Con BuildKit: `--mount=type=cache` persiste directorios de cache entre builds sin crear capas.',
      ],
    },
    {
      type: 'concepts',
      title: 'BuildKit — el motor moderno',
      items: [
        'BuildKit es el motor de build moderno de Docker, activo por defecto desde Docker 23.0.',
        'En versiones anteriores: `DOCKER_BUILDKIT=1 docker build .` para activarlo.',
        'Builds paralelos: los stages independientes se construyen en paralelo automáticamente.',
        '`--mount=type=cache,target=/root/.cache/pip` — Cachea el pip/npm/maven cache entre builds sin crear capas.',
        '`--mount=type=secret,id=gh_token` — Pasa secretos al build sin que queden en la imagen.',
        '`--mount=type=ssh` — Usa tu SSH agent para clonar repos privados durante el build.',
        '`docker buildx build --platform linux/amd64,linux/arm64 -t imagen:v1 --push .` — Cross-platform build.',
        '`docker buildx imagetools inspect imagen:v1` — Inspecciona un manifest multi-arch en el registry.',
      ],
    },
    {
      type: 'comparison',
      title: 'Elegir la base del stage final',
      headers: ['Base final', 'Qué incluye', 'Cuándo elegirla'],
      rows: [
        {
          feature: 'scratch',
          a: 'Nada — ni shell, ni libc, ni certs',
          b: 'Binarios 100% estáticos (Go con CGO_ENABLED=0). El mínimo absoluto, pero hay que copiar certs y passwd a mano.',
        },
        {
          feature: 'alpine',
          a: 'musl libc, busybox, apk',
          b: 'Necesitás un shell para debug o el binario no es completamente estático. ~5MB de base.',
        },
        {
          feature: 'distroless (gcr.io/distroless/static)',
          a: 'Solo certs y timezone, sin shell',
          b: 'Balance entre seguridad de scratch y comodidad — no hay que copiar certs manualmente, pero tampoco hay shell para `docker exec`.',
        },
        {
          feature: 'debian-slim',
          a: 'glibc completa, sin shell interactivo pesado',
          b: 'Cuando el binario dinámico depende de glibc (común en Java/Node nativos) y alpine/musl da problemas.',
        },
      ],
    },
    {
      type: 'history',
      title: 'Errores comunes en multi-stage builds',
      items: [
        'Copiar de más entre stages: `COPY --from=builder /build /app` en vez de copiar solo el binario final trae también el código fuente y las herramientas de build a la imagen final.',
        'Nombrar los stages sin usarlos (`AS builder` pero copiar con `--from=0`): funciona, pero rompe legibilidad y es fácil de romper si se reordenan los stages.',
        'Repetir instalación de dependencias del sistema en cada stage sin necesidad — cada `apk add` o `apt-get install` que no aporta al resultado final es tiempo de build perdido.',
        'Olvidar `RUN go mod verify` o el equivalente de checksum: sin verificación, una dependencia comprometida puede compilarse sin que nadie note nada hasta producción.',
        'Usar `latest` en la imagen del builder (`FROM golang:alpine`): el compilador puede cambiar de versión entre builds y producir binarios con comportamiento distinto sin cambiar una línea de código propio.',
        'No fijar `--platform` en builds multi-arch: en CI con runners ARM y AMD mezclados, la imagen final puede terminar con la arquitectura equivocada si buildx no la fuerza explícitamente.',
      ],
    },
    {
      type: 'concepts',
      title: 'Reducción de tamaño — checklist',
      items: [
        'Elegir imagen base apropiada: `slim` o `alpine` en lugar de la imagen completa.',
        'Combinar comandos RUN con `&&` para minimizar capas.',
        'Limpiar caches de package managers en la misma instrucción RUN: `rm -rf /var/lib/apt/lists/*`, `npm cache clean`.',
        'Usar multi-stage builds para separar herramientas de compilación del resultado final.',
        'Excluir archivos innecesarios con `.dockerignore` (node_modules, .git, tests, docs).',
        'Instalar solo lo necesario: `--no-install-recommends` en apt, `--only=production` en npm.',
        '`docker scout cves mi-imagen` — Escanear vulnerabilidades (Docker Scout, gratuito para repos públicos).',
        '`dive mi-imagen` — Herramienta que analiza qué archivos hay en cada capa y dónde se desperdicia espacio.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Reducción de 900MB a 8MB con Go',
      steps: [
        { cmd: 'mkdir go-app && cd go-app\ngo mod init miapp', desc: 'Inicializa módulo Go.' },
        {
          cmd: 'cat > main.go << \'EOF\'\npackage main\n\nimport (\n  "fmt"\n  "net/http"\n  "runtime"\n)\n\nfunc main() {\n  http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintf(w, "{\\"go\\": \\"%s\\", \\"os\\": \\"%s\\"}",\n      runtime.Version(), runtime.GOOS)\n  })\n  http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {\n    fmt.Fprintln(w, "{\\"status\\": \\"ok\\"}")\n  })\n  http.ListenAndServe(":8080", nil)\n}\nEOF',
          desc: 'Servidor HTTP mínimo en Go.',
        },
        {
          cmd: '# Dockerfile naive: imagen enorme\ncat > Dockerfile.naive << \'EOF\'\nFROM golang:1.22\nWORKDIR /app\nCOPY . .\nRUN go build -o app .\nCMD ["/app/app"]\nEOF\ndocker build -f Dockerfile.naive -t go-naive .\ndocker images go-naive',
          desc: 'Observá el tamaño — ~900MB con el compilador adentro.',
        },
        {
          cmd: '# Multi-stage build\ncat > Dockerfile << \'EOF\'\nFROM golang:1.22-alpine AS builder\nRUN apk add --no-cache ca-certificates\nWORKDIR /build\nCOPY go.mod ./\nRUN go mod download\nCOPY . .\nRUN CGO_ENABLED=0 go build -ldflags="-w -s" -o app .\n\nFROM scratch\nCOPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/\nCOPY --from=builder /build/app /app\nEXPOSE 8080\nENTRYPOINT ["/app"]\nEOF\ndocker build -t go-slim .',
          desc: 'Multi-stage: solo el binario en la imagen final.',
        },
        {
          cmd: "docker images go-naive go-slim --format 'table {{.Repository}}\\t{{.Tag}}\\t{{.Size}}'",
          desc: 'Tabla lado a lado: go-naive ronda 900MB, go-slim ronda 8-15MB. Mismo binario, misma funcionalidad.',
        },
        {
          cmd: 'docker run -d -p 8080:8080 --name goapp go-slim\ncurl http://localhost:8080/\ncurl http://localhost:8080/health',
          desc: 'Funciona igual. La imagen de scratch no tiene shell ni nada extra.',
        },
        {
          cmd: "# Verificar que no hay shell (imagen scratch)\ndocker exec goapp sh 2>&1 || echo 'Sin shell — solo el binario'",
          desc: 'Imagen de scratch: superficie de ataque mínima absoluta.',
        },
        {
          cmd: "# Confirmar que el stage builder no llegó a la imagen final\ndocker history go-slim\ndocker inspect go-slim --format '{{len .RootFS.Layers}} capas'",
          desc: 'docker history de go-slim solo muestra las instrucciones del stage final (COPY --from, EXPOSE, ENTRYPOINT) — nada del compilador Go.',
        },
        {
          cmd: "docker stop goapp && docker rm goapp\ndocker rmi go-naive go-slim\ndocker images | grep -E 'go-naive|go-slim' || echo 'Limpieza confirmada: sin imágenes go-* remanentes'",
          desc: 'Limpieza completa de contenedor e imágenes de la práctica.',
        },
      ],
    },
  ],
};

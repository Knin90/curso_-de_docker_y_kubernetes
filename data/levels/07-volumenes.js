export default {
  id: 7,
  title: 'Volúmenes',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Entender los tipos de almacenamiento en Docker y cuándo usar cada uno para gestionar datos persistentes.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Los contenedores son efímeros por diseño. Todo lo que escribís dentro de un contenedor vive en su capa de escritura (UpperDir de OverlayFS). Cuando el contenedor se borra, esos datos desaparecen para siempre.

¿Cómo persistís datos de una base de datos entre reinicios? ¿Cómo compartís archivos entre múltiples contenedores? ¿Cómo un desarrollador monta su código fuente para hot-reload sin reconstruir la imagen?

La respuesta es volúmenes — y elegir el tipo correcto para cada caso importa.`,
    },
    {
      type: 'diagram',
      title: 'Los tres tipos de almacenamiento en Docker',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 700 440" role="img" aria-label="Los tres tipos de almacenamiento montan datos de distinto origen (volumen gestionado por Docker, path del host, o RAM) dentro del contenedor, y cada uno se usa para un tipo de dato distinto">
    <defs>
      <marker id="arrow-07a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="20" y="20" width="650" height="170" rx="4" fill="none" stroke="currentColor"/>
    <text x="40" y="42" font-size="13" font-weight="bold">HOST</text>

    <rect class="dg-accent" x="40" y="56" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="135" y="74" text-anchor="middle" font-size="12" font-weight="bold">Named Volume</text>
    <text x="135" y="90" text-anchor="middle" font-size="11">/var/lib/docker/volumes/</text>
    <text x="135" y="104" text-anchor="middle" font-size="11">Docker gestiona</text>

    <rect x="250" y="56" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="345" y="74" text-anchor="middle" font-size="12" font-weight="bold">Bind Mount</text>
    <text x="345" y="90" text-anchor="middle" font-size="11">/home/user/proyecto/</text>
    <text x="345" y="104" text-anchor="middle" font-size="11">path del host</text>

    <rect x="460" y="56" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="555" y="74" text-anchor="middle" font-size="12" font-weight="bold">tmpfs</text>
    <text x="555" y="90" text-anchor="middle" font-size="11">RAM</text>
    <text x="555" y="104" text-anchor="middle" font-size="11">en memoria</text>

    <rect x="20" y="230" width="650" height="140" rx="4" fill="none" stroke="currentColor"/>
    <text x="40" y="252" font-size="13" font-weight="bold">CONTENEDOR</text>

    <rect x="40" y="266" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="135" y="288" text-anchor="middle" font-size="11">/var/lib/postgresql/data</text>
    <text x="135" y="304" text-anchor="middle" font-size="11">Named Volume Mount</text>

    <rect x="250" y="266" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="345" y="288" text-anchor="middle" font-size="11">/app</text>
    <text x="345" y="304" text-anchor="middle" font-size="11">Bind Mount</text>

    <rect x="460" y="266" width="190" height="54" rx="3" fill="none" stroke="currentColor"/>
    <text x="555" y="288" text-anchor="middle" font-size="11">/tmp/secrets</text>
    <text x="555" y="304" text-anchor="middle" font-size="11">tmpfs Mount</text>

    <line x1="135" y1="110" x2="135" y2="266" stroke="currentColor" marker-end="url(#arrow-07a)"/>
    <line x1="345" y1="110" x2="345" y2="266" stroke="currentColor" marker-end="url(#arrow-07a)"/>
    <line x1="555" y1="110" x2="555" y2="266" stroke="currentColor" marker-end="url(#arrow-07a)"/>

    <text x="350" y="392" text-anchor="middle" font-size="12" font-weight="bold">Regla de oro</text>
    <text x="350" y="408" text-anchor="middle" font-size="11">DB / uploads / logs → Named Volume · código en desarrollo → Bind Mount · secretos temporales → tmpfs</text>
  </svg>
  <figcaption>Named Volume, Bind Mount y tmpfs son tres orígenes de datos distintos que Docker monta dentro del contenedor, cada uno apropiado para un tipo de dato diferente.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Named Volumes — la opción recomendada',
      items: [
        'Gestionados completamente por Docker. Almacenados en `/var/lib/docker/volumes/nombre/_data`.',
        'Recomendados para datos de aplicación: bases de datos, uploads de usuarios, logs persistentes.',
        '`docker volume create pgdata` — Crea el volumen con nombre.',
        '`docker run -v pgdata:/var/lib/postgresql/data postgres:16` — Monta el volumen en el contenedor.',
        'Sintaxis larga equivalente (más explícita, recomendada en scripts): `docker run --mount type=volume,source=pgdata,target=/var/lib/postgresql/data postgres:16`.',
        'Persisten aunque borres el contenedor. Solo se eliminan con `docker volume rm pgdata`.',
        '`docker volume ls` — Lista todos los volúmenes del sistema.',
        '`docker volume inspect pgdata` — Muestra el Mountpoint real en el host, driver, labels.',
        'Backup: `docker run --rm -v pgdata:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .`',
        'En producción cloud: los named volumes son locales al host. Para compartir entre servidores necesitás NFS o CSI drivers.',
      ],
    },
    {
      type: 'concepts',
      title: 'Bind Mounts — para desarrollo',
      items: [
        'Montan un directorio o archivo específico del host dentro del contenedor.',
        '`docker run -v /home/user/app:/app node:20` — El directorio del host se monta en /app del contenedor.',
        '`docker run -v $(pwd):/app node:20` — Atajo para montar el directorio actual.',
        'Los cambios en el host se reflejan inmediatamente en el contenedor — ideal para hot-reload en desarrollo.',
        'El contenedor también puede escribir en el host — cuidado con permisos (UID mismatch).',
        '`:ro` al final para montaje de solo lectura: `-v $(pwd)/config:/app/config:ro`',
        'Sintaxis larga: `docker run --mount type=bind,source=$(pwd),target=/app,readonly node:20`. Falla explícitamente si el path no existe (a diferencia de `-v`).',
        '**No usar en producción**: acopla el contenedor a la estructura de directorios del host. No es portable.',
        'Si el path del host no existe, Docker lo crea como directorio (potencial fuente de confusión).',
      ],
    },
    {
      type: 'concepts',
      title: 'tmpfs — almacenamiento en memoria',
      items: [
        'Almacenamiento en RAM. No persiste al disco en ningún momento.',
        '`docker run --tmpfs /tmp:size=64m,mode=1777 app` — Monta /tmp en memoria con tamaño máximo.',
        'Ideal para archivos temporales sensibles: tokens de sesión, keys temporales, datos que no deben tocar disco.',
        'Se limpia automáticamente al detener el contenedor.',
        'Más rápido que el disco — útil para aplicaciones con muchas operaciones I/O temporales.',
        'No disponible como opción en Windows containers.',
      ],
    },
    {
      type: 'concepts',
      title: 'Volume drivers y plugins',
      items: [
        'El driver `local` es el default — almacena en el host donde corre el contenedor.',
        '**NFS**: `docker volume create --driver local --opt type=nfs --opt o=addr=192.168.1.1,rw --opt device=:/path nfs-vol`',
        '**AWS EFS** con el plugin `rexray/efs` — volúmenes compartidos en AWS.',
        '**GlusterFS, Ceph** — para almacenamiento distribuido en producción multi-nodo.',
        'En producción seria, el almacenamiento distribuido lo gestiona Kubernetes + CSI drivers, no Docker directamente.',
      ],
    },
    {
      type: 'comparison',
      title: 'Named Volume vs Bind Mount — a la hora de decidir',
      headers: ['Característica', 'Named Volume', 'Bind Mount'],
      rows: [
        {
          feature: 'Ubicación',
          a: 'Gestionada por Docker en `/var/lib/docker/volumes/`',
          b: 'Cualquier path del host, elegido por vos',
        },
        {
          feature: 'Portabilidad',
          a: 'Alta — funciona igual en cualquier host con Docker',
          b: 'Baja — depende de que el path exista en el host',
        },
        {
          feature: 'Si el destino no existe',
          a: 'Docker crea el volumen automáticamente',
          b: 'Docker crea el directorio en el host (fuente de confusión)',
        },
        {
          feature: 'Uso recomendado',
          a: 'Datos de producción: DB, uploads, colas, logs',
          b: 'Desarrollo: código fuente para hot-reload',
        },
        {
          feature: 'Backup',
          a: 'Vía contenedor temporal con tar, o drivers NFS/EFS',
          b: 'Backup directo con las herramientas del filesystem del host',
        },
        {
          feature: 'Rendimiento en Docker Desktop (Mac/Win)',
          a: 'Óptimo — vive dentro de la VM Linux',
          b: 'Más lento — cruza la barrera VM↔host (gRPC-FUSE/VirtioFS)',
        },
      ],
    },
    {
      type: 'history',
      title: 'Errores comunes con volúmenes',
      items: [
        'Montar un bind mount vacío encima de un directorio con datos generados por la imagen — el contenido original queda **oculto** (shadowing), no borrado. Confunde mucho en debugging.',
        'Escribir `-v ./data:/data` en vez de `-v $(pwd)/data:/data` en versiones viejas de Docker — algunos parsers interpretan la ruta relativa como nombre de volumen en lugar de path. Desde Docker 20.10+ funciona, pero seguir usando rutas absolutas evita ambigüedad.',
        'No correr `docker volume prune` en runners de CI — cada pipeline deja volúmenes anónimos huérfanos (los que Docker crea sin `-v nombre:` explícito) que llenan el disco.',
        'Usar bind mounts para datos de producción en Docker Desktop — la sincronización de archivos entre macOS/Windows y la VM Linux introduce latencia notable en bases de datos con muchas escrituras.',
        "No versionar el driver de volumen ni sus opciones en el Compose file — el volumen 'funciona' en un servidor porque tiene NFS montado a mano, y falla en otro sin esa configuración.",
      ],
    },
    {
      type: 'diagram',
      title: 'Permisos y ownership — el problema clásico',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 640 370" role="img" aria-label="El host corre como UID 1000 y el contenedor como root UID 0; ambos escriben en el mismo volumen compartido, y los archivos creados por el contenedor quedan como root — la solución es igualar el UID con --user">
    <defs>
      <marker id="arrow-07b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="40" y="30" width="230" height="70" rx="4" fill="none" stroke="currentColor"/>
    <text x="155" y="58" text-anchor="middle" font-size="12" font-weight="bold">Host: developer</text>
    <text x="155" y="76" text-anchor="middle" font-size="12">UID 1000</text>

    <rect x="370" y="30" width="230" height="70" rx="4" fill="none" stroke="currentColor"/>
    <text x="485" y="58" text-anchor="middle" font-size="12" font-weight="bold">Contenedor: proceso</text>
    <text x="485" y="76" text-anchor="middle" font-size="12">root (UID 0)</text>

    <line x1="155" y1="100" x2="290" y2="150" stroke="currentColor" marker-end="url(#arrow-07b)"/>
    <line x1="485" y1="100" x2="350" y2="150" stroke="currentColor" marker-end="url(#arrow-07b)"/>

    <rect x="205" y="150" width="230" height="60" rx="4" fill="none" stroke="currentColor"/>
    <text x="320" y="172" text-anchor="middle" font-size="12" font-weight="bold">Volumen compartido</text>
    <text x="320" y="190" text-anchor="middle" font-size="11">archivos creados → root:root</text>
    <text x="320" y="204" text-anchor="middle" font-size="11">host UID 1000 no puede editar ✗</text>

    <line x1="320" y1="210" x2="320" y2="256" stroke="currentColor" marker-end="url(#arrow-07b)"/>

    <rect class="dg-accent" x="120" y="260" width="400" height="60" rx="4" fill="none" stroke="currentColor"/>
    <text x="320" y="284" text-anchor="middle" font-size="12" font-weight="bold">Fix: --user $(id -u):$(id -g)</text>
    <text x="320" y="302" text-anchor="middle" font-size="11">iguala el UID del proceso al del host</text>

    <text x="320" y="350" text-anchor="middle" font-size="11">Alternativas: --chown en COPY, chmod del directorio, o sync de UID en Docker Desktop</text>
  </svg>
  <figcaption>Cuando el proceso del contenedor corre como root y el host como UID 1000, los archivos escritos en el volumen compartido quedan como root:root; igualar el UID con --user resuelve el mismatch.</figcaption>
</figure>`,
    },
    {
      type: 'lab',
      title: 'Laboratorio: PostgreSQL con datos persistentes y backup',
      steps: [
        {
          cmd: 'docker volume create pgdata\ndocker volume inspect pgdata',
          desc: 'Crea el volumen y verifica su ubicación en el host.',
        },
        {
          cmd: 'docker run -d \\\n  --name postgres \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  -e POSTGRES_USER=admin \\\n  -v pgdata:/var/lib/postgresql/data \\\n  -p 5432:5432 \\\n  postgres:16-alpine',
          desc: 'Inicia PostgreSQL con el volumen nombrado. Los datos van al volumen, no a la capa del contenedor.',
        },
        {
          cmd: '# Esperar a que PostgreSQL esté listo\nsleep 3\ndocker exec postgres pg_isready -U admin -d demo',
          desc: 'pg_isready verifica que el servidor acepta conexiones.',
        },
        {
          cmd: "docker exec -it postgres psql -U admin -d demo -c \\\n  \"CREATE TABLE usuarios (id serial PRIMARY KEY, nombre text, email text);\"\ndocker exec -it postgres psql -U admin -d demo -c \\\n  \"INSERT INTO usuarios (nombre, email) VALUES ('Alice', 'alice@test.com'), ('Bob', 'bob@test.com'), ('Carlos', 'carlos@test.com');\"",
          desc: 'Crea tabla e inserta datos de prueba.',
        },
        {
          cmd: 'docker exec postgres psql -U admin -d demo -c "SELECT COUNT(*) FROM usuarios;"',
          desc: 'Verifica que los datos están ahí. Debe devolver 3.',
        },
        {
          cmd: 'docker rm -f postgres',
          desc: 'Borra el contenedor completamente. Los datos en el volumen persisten.',
        },
        {
          cmd: 'docker run -d \\\n  --name postgres2 \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  -e POSTGRES_USER=admin \\\n  -v pgdata:/var/lib/postgresql/data \\\n  postgres:16-alpine\nsleep 3\ndocker exec postgres2 psql -U admin -d demo -c "SELECT * FROM usuarios;"',
          desc: 'Nuevo contenedor, mismo volumen. Los tres usuarios siguen ahí — persistencia confirmada.',
        },
        {
          cmd: '# Backup del volumen\ndocker run --rm \\\n  -v pgdata:/data:ro \\\n  -v $(pwd):/backup \\\n  alpine \\\n  tar czf /backup/pgdata-$(date +%Y%m%d).tar.gz -C /data .',
          desc: 'Patrón estándar de backup: contenedor temporal que lee el volumen y escribe al host.',
        },
        {
          cmd: 'ls -lh pgdata-*.tar.gz',
          desc: 'Verifica el archivo de backup creado en el directorio actual.',
        },
        {
          cmd: "docker rm -f postgres2\ndocker volume rm pgdata\nrm -f pgdata-*.tar.gz\ndocker volume ls | grep pgdata || echo 'Correcto: el volumen ya no existe'",
          desc: 'Limpieza completa: contenedor, volumen nombrado y archivo de backup local.',
        },
      ],
    },
  ],
};

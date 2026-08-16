export default {
  id: 9,
  title: 'Docker Registry',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo: 'Entender qué es un registry, cómo publicar imágenes y cómo configurar un registry privado.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Construiste tu imagen. Funciona perfectamente en tu máquina. ¿Cómo la llevás a producción? ¿Cómo la compartís con tu equipo? ¿Cómo tu servidor de CI la publica y tu servidor de producción la descarga automáticamente?

Necesitás un registry: un servidor centralizado que almacena y distribuye imágenes Docker usando el protocolo OCI Distribution Spec.

Sin un registry, tenés que copiar imágenes manualmente con \`docker save | ssh servidor docker load\` — no escala para un equipo.`,
    },
    {
      type: 'diagram',
      title: 'Flujo completo de imágenes en un equipo',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 760 270" role="img" aria-label="El desarrollador dispara CI con git push, CI construye, testea y hace push al registry, y producción hace pull desde el registry para desplegar">
    <defs>
      <marker id="arrow-09a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="30" y="40" width="160" height="70" rx="4" fill="none" stroke="currentColor"/>
    <text x="110" y="66" text-anchor="middle" font-size="12" font-weight="bold">Developer local</text>
    <text x="110" y="86" text-anchor="middle" font-size="11">git push</text>

    <rect x="300" y="40" width="220" height="90" rx="4" fill="none" stroke="currentColor"/>
    <text x="410" y="62" text-anchor="middle" font-size="12" font-weight="bold">CI/CD Pipeline</text>
    <text x="410" y="80" text-anchor="middle" font-size="11">docker build</text>
    <text x="410" y="96" text-anchor="middle" font-size="11">docker test</text>
    <text x="410" y="112" text-anchor="middle" font-size="11">docker push</text>

    <rect x="590" y="40" width="150" height="90" rx="4" fill="none" stroke="currentColor"/>
    <text x="665" y="62" text-anchor="middle" font-size="12" font-weight="bold">Producción</text>
    <text x="665" y="82" text-anchor="middle" font-size="11">kubectl set image</text>
    <text x="665" y="98" text-anchor="middle" font-size="11">compose pull &amp;&amp; up</text>
    <text x="665" y="114" text-anchor="middle" font-size="11">docker pull / run</text>

    <line x1="190" y1="75" x2="300" y2="75" stroke="currentColor" marker-end="url(#arrow-09a)"/>
    <rect x="205" y="58" width="80" height="16" fill="#0a0d16"/>
    <text x="245" y="70" text-anchor="middle" font-size="10">trigger CI</text>

    <rect class="dg-accent" x="300" y="190" width="220" height="60" rx="4" fill="none" stroke="currentColor"/>
    <text x="410" y="212" text-anchor="middle" font-size="12" font-weight="bold">Registry</text>
    <text x="410" y="230" text-anchor="middle" font-size="10">Docker Hub / GHCR / ECR</text>

    <line x1="410" y1="130" x2="410" y2="190" stroke="currentColor" marker-end="url(#arrow-09a)"/>
    <text x="410" y="164" text-anchor="middle" font-size="10">docker push</text>

    <line x1="520" y1="215" x2="665" y2="130" stroke="currentColor" marker-end="url(#arrow-09a)"/>
    <text x="590" y="185" text-anchor="middle" font-size="10">docker pull / deploy</text>
  </svg>
  <figcaption>El developer dispara CI con git push, CI/CD construye, testea y publica la imagen en el registry, y producción hace pull desde ahí para desplegar.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Opciones de registry — comparativa',
      items: [
        '**Docker Hub** — Registry público por defecto. `docker.io/library/nginx`. Límites de pull rate en tier gratuito (100 pulls/6h anónimo, 200 auth). Gratuito para repos públicos.',
        '**GHCR (GitHub Container Registry)** — `ghcr.io/usuario/imagen`. Integrado con GitHub Actions y permisos de repositorio. Excelente opción gratuita.',
        '**AWS ECR** — `123456789.dkr.ecr.us-east-1.amazonaws.com/imagen`. Registry privado de Amazon. Integrado con EKS, IAM. Por GB almacenado.',
        '**GCP Artifact Registry** — `us-central1-docker.pkg.dev/proyecto/repo/imagen`. Reemplaza a GCR. Integrado con GKE.',
        '**Azure Container Registry (ACR)** — `miregistry.azurecr.io/imagen`. Integrado con AKS.',
        '**Harbor** — Registry open source self-hosted. Incluye vulnerability scanning (Trivy), RBAC, replicación entre registries y notarización de imágenes.',
        '**Registry v2 (docker/registry)** — Imagen oficial de Docker. Mínima, sin UI. Para uso interno simple.',
      ],
    },
    {
      type: 'concepts',
      title: 'Convención de nombres de imágenes',
      body: `El nombre completo de una imagen sigue el patrón: \`[registry/][usuario/]nombre[:tag][@digest]\``,
      items: [
        '`nginx` — Imagen oficial del Docker Hub. Equivale a `docker.io/library/nginx:latest`.',
        '`usuario/mi-imagen:v1.0.0` — Imagen personal en Docker Hub.',
        '`ghcr.io/miorg/mi-imagen:v1.0.0` — Imagen en GitHub Container Registry.',
        '`localhost:5000/mi-imagen:dev` — Registry local en el puerto 5000.',
        '`mi-imagen@sha256:abc123...` — Pin por digest para reproducibilidad total.',
        'El tag `latest` es mutable y ambiguo. En producción: usá tags semánticos o digests.',
      ],
    },
    {
      type: 'concepts',
      title: 'Estrategia de versionado — buenas prácticas',
      items: [
        '**Semver completo**: `v1.2.3` — Siempre. Permite saber exactamente qué versión está en prod.',
        '**Por commit SHA**: `mi-imagen:abc1234` — Para traceabilidad perfecta (hash del commit que generó la imagen).',
        '**Por rama + commit**: `mi-imagen:main-abc1234` — Indica la rama además del commit.',
        '**Tags múltiples**: publicar `v1.2.3`, `v1.2` y `v1` apuntando a la misma imagen. El usuario elige cuánto fijar.',
        '**latest**: solo actualizar `latest` en releases estables. Nunca en branches de feature.',
        '**Digests en K8s**: en manifiestos de Kubernetes, usar digest en lugar de tag para deploys reproducibles.',
      ],
    },
    {
      type: 'concepts',
      title: 'Autenticación y seguridad',
      items: [
        '`docker login` — Interactivo. Guarda credenciales en `~/.docker/config.json` (base64, no cifrado).',
        '`docker login ghcr.io -u USUARIO --password-stdin` — Desde stdin, evita credenciales en historial de shell.',
        'En CI/CD: usar tokens de acceso con permisos mínimos (read para pull, write para push). Nunca tu password personal.',
        'Docker secrets para Swarm: `docker secret create` guarda secretos cifrados.',
        'En Kubernetes: `kubectl create secret docker-registry regcred --docker-server=... --docker-username=...` para autenticación a registries privados.',
        '`docker trust sign imagen:tag` — Firma de imágenes con Notary para verificar integridad.',
        '`docker scout cves imagen:tag` o `trivy image imagen:tag` — escanean vulnerabilidades conocidas en capas y dependencias antes de hacer push.',
        '`docker exec registry bin/registry garbage-collect /etc/docker/registry/config.yml` — libera espacio de blobs sin tags activos en un registry v2 self-hosted (correrlo en modo mantenimiento, con el registry en solo lectura).',
      ],
    },
    {
      type: 'comparison',
      title: 'Docker Hub vs registry privado self-hosted',
      headers: ['Característica', 'Docker Hub', 'Registry privado self-hosted'],
      rows: [
        {
          feature: 'Costo',
          a: 'Gratis para repos públicos; planes pagos para privados',
          b: 'Solo la infraestructura propia (servidor, storage, backup)',
        },
        {
          feature: 'Control de acceso',
          a: 'RBAC básico, orgs y teams en planes superiores',
          b: 'Total — vos definís auth, TLS y políticas de red',
        },
        {
          feature: 'Disponibilidad',
          a: 'Alta, gestionada por Docker Inc. con SLA',
          b: 'Depende de tu infraestructura y tu on-call',
        },
        {
          feature: 'Escaneo de vulnerabilidades',
          a: 'Docker Scout incluido en tiers superiores',
          b: 'Hay que integrarlo manualmente (Trivy, Clair, Harbor)',
        },
        {
          feature: 'Mantenimiento',
          a: 'Cero — es un servicio administrado',
          b: 'Actualizaciones, storage, backups y garbage collection a tu cargo',
        },
        {
          feature: 'Caso de uso típico',
          a: 'Open source, equipos chicos, prototipos',
          b: 'Compliance estricto, entornos air-gapped, control total de datos',
        },
      ],
    },
    {
      type: 'history',
      title: 'Errores comunes con registries',
      items: [
        'Dejar `latest` como único tag en producción — un rollback se vuelve una lotería porque nadie sabe qué versión corría antes.',
        'Hardcodear credenciales de `docker login` en un Dockerfile o en variables de entorno versionadas — quedan en el historial de git y a veces hasta en las capas de la imagen.',
        'No correr garbage collection en un registry self-hosted — borrar un tag no borra los blobs (capas) subyacentes por defecto, y el storage crece indefinidamente.',
        'Publicar imágenes sin escaneo de vulnerabilidades — una CVE crítica en una dependencia de la imagen base llega directo a producción sin que nadie se entere.',
        'No configurar políticas de retención — el registry acumula miles de tags de branches de feature que ya se borraron hace meses.',
        'Permitir pull anónimo en un registry privado expuesto a internet sin autenticación — cualquiera puede descargar (y si está mal configurado, hasta subir) imágenes.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Publicar en Docker Hub y registry privado',
      steps: [
        {
          cmd: 'docker login',
          desc: 'Autentica con Docker Hub. Pedirá usuario y contraseña (o token de acceso).',
        },
        {
          cmd: '# Asumiendo que tenés mi-api:v1 del nivel anterior\n# Tagear con tu usuario de Docker Hub\ndocker tag mi-api:v1 TU_USUARIO/mi-api:v1.0.0\ndocker tag mi-api:v1 TU_USUARIO/mi-api:latest\ndocker images TU_USUARIO/mi-api',
          desc: 'Reemplazá TU_USUARIO. El tag no copia la imagen — solo crea un alias al mismo manifest.',
        },
        {
          cmd: 'docker push TU_USUARIO/mi-api:v1.0.0\ndocker push TU_USUARIO/mi-api:latest',
          desc: 'Subida al Docker Hub. Observá cómo se suben las capas individualmente y cuántas ya existían.',
        },
        {
          cmd: '# Simular pull desde otra máquina\ndocker image rm TU_USUARIO/mi-api:v1.0.0 TU_USUARIO/mi-api:latest\ndocker pull TU_USUARIO/mi-api:v1.0.0\ndocker run --rm TU_USUARIO/mi-api:v1.0.0 python -c \'print("funciona")\'',
          desc: 'Borrás la imagen local y la volvés a bajar — simula lo que haría un servidor de producción.',
        },
        {
          cmd: '# Registry privado local\ndocker run -d \\\n  --name registry \\\n  -p 5000:5000 \\\n  -v $(pwd)/registry-data:/var/lib/registry \\\n  registry:2',
          desc: 'Registry privado corriendo en localhost:5000 con datos persistidos en el host.',
        },
        {
          cmd: 'docker tag mi-api:v1 localhost:5000/mi-api:v1\ndocker push localhost:5000/mi-api:v1',
          desc: 'Push al registry privado local.',
        },
        {
          cmd: 'curl http://localhost:5000/v2/_catalog\ncurl http://localhost:5000/v2/mi-api/tags/list',
          desc: 'La API del registry devuelve las imágenes almacenadas. Protocolo OCI Distribution Spec.',
        },
        {
          cmd: "# Ver digest de la imagen subida\ndocker images --digests localhost:5000/mi-api\n# Pull por digest\ndocker pull localhost:5000/mi-api@$(docker inspect localhost:5000/mi-api:v1 --format '{{.RepoDigests}}' | tr -d '[]' | cut -d@ -f2)",
          desc: 'Pull por digest — reproducibilidad garantizada independiente del tag.',
        },
        {
          cmd: "docker rm -f registry\ndocker rmi TU_USUARIO/mi-api:v1.0.0 TU_USUARIO/mi-api:latest localhost:5000/mi-api:v1 2>/dev/null\nrm -rf registry-data\ndocker ps -a | grep registry || echo 'Correcto: el registry ya no existe'",
          desc: 'Limpieza completa: contenedor del registry, imágenes locales y datos persistidos en el host.',
        },
      ],
    },
  ],
};

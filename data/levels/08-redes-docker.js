export default {
  id: 8,
  title: 'Redes Docker',
  etapa: 'docker',
  etapaLabel: 'Etapa I — Fundamentos Docker',
  objetivo:
    'Entender los tipos de redes Docker y cómo los contenedores se comunican entre sí y con el exterior.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Por defecto, los contenedores están aislados en la red. ¿Cómo hace tu backend para hablar con tu base de datos si están en contenedores separados? ¿Cómo exponés tu aplicación al mundo exterior? ¿Cómo aislás la base de datos para que no sea accesible desde fuera?

La red es uno de los aspectos más mal entendidos de Docker. Configurarla incorrectamente causa tanto problemas de conectividad (servicios que no se pueden hablar) como problemas de seguridad (servicios expuestos que no deberían estarlo).`,
    },
    {
      type: 'diagram',
      title: 'Drivers de red — cuándo usar cada uno',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 760 350" role="img" aria-label="Cada driver de red conecta el contenedor de forma distinta: bridge usa NAT dentro de una subred propia, host comparte la pila de red sin aislamiento, none no tiene salida, overlay conecta contenedores entre múltiples hosts, y macvlan expone el contenedor con su propia MAC en la LAN física">
    <defs>
      <marker id="arrow-08a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect class="dg-accent" x="28" y="54" width="136" height="90" rx="3" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="46" y="96" width="100" height="32" rx="3" fill="none" stroke="currentColor"/>
    <text x="96" y="116" text-anchor="middle" font-size="10">container</text>
    <line x1="96" y1="96" x2="96" y2="30" stroke="currentColor" marker-end="url(#arrow-08a)"/>
    <text x="96" y="22" text-anchor="middle" font-size="10">NAT</text>
    <text x="96" y="300" text-anchor="middle" font-size="12" font-weight="bold">bridge</text>
    <text x="96" y="316" text-anchor="middle" font-size="10">NAT, subred propia</text>

    <rect x="170" y="54" width="136" height="90" rx="3" fill="none" stroke="currentColor"/>
    <text x="238" y="98" text-anchor="middle" font-size="10">container =</text>
    <text x="238" y="112" text-anchor="middle" font-size="10">host net</text>
    <line x1="238" y1="54" x2="238" y2="30" stroke="currentColor" marker-end="url(#arrow-08a)"/>
    <text x="238" y="22" text-anchor="middle" font-size="10">directo</text>
    <text x="238" y="300" text-anchor="middle" font-size="12" font-weight="bold">host</text>
    <text x="238" y="316" text-anchor="middle" font-size="10">sin aislamiento</text>

    <rect x="312" y="54" width="136" height="90" rx="3" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <rect x="330" y="96" width="100" height="32" rx="3" fill="none" stroke="currentColor"/>
    <text x="380" y="116" text-anchor="middle" font-size="10">container</text>
    <text x="380" y="22" text-anchor="middle" font-size="10">✗ sin red</text>
    <text x="380" y="300" text-anchor="middle" font-size="12" font-weight="bold">none</text>
    <text x="380" y="316" text-anchor="middle" font-size="10">sin comunicación</text>

    <rect x="454" y="54" width="136" height="38" rx="3" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="522" y="76" text-anchor="middle" font-size="10">Host A (containers)</text>
    <rect x="454" y="106" width="136" height="38" rx="3" fill="none" stroke="currentColor" stroke-dasharray="4 3"/>
    <text x="522" y="128" text-anchor="middle" font-size="10">Host B (containers)</text>
    <line x1="522" y1="92" x2="522" y2="106" stroke="currentColor" marker-end="url(#arrow-08a)"/>
    <text x="522" y="300" text-anchor="middle" font-size="12" font-weight="bold">overlay</text>
    <text x="522" y="316" text-anchor="middle" font-size="10">multi-host (Swarm)</text>

    <rect x="614" y="74" width="100" height="32" rx="3" fill="none" stroke="currentColor"/>
    <text x="664" y="94" text-anchor="middle" font-size="10">container</text>
    <rect x="614" y="30" width="100" height="24" rx="3" fill="none" stroke="currentColor"/>
    <text x="664" y="46" text-anchor="middle" font-size="10">LAN física</text>
    <line x1="664" y1="74" x2="664" y2="54" stroke="currentColor" marker-end="url(#arrow-08a)"/>
    <text x="664" y="300" text-anchor="middle" font-size="12" font-weight="bold">macvlan</text>
    <text x="664" y="316" text-anchor="middle" font-size="10">MAC propia en la LAN</text>
  </svg>
  <figcaption>bridge aísla el contenedor en una subred propia con NAT (el driver por defecto), host elimina ese aislamiento, none no da red, overlay conecta contenedores entre hosts distintos, y macvlan lo expone en la LAN física con su propia MAC.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Bridge network — user-defined vs default',
      items: [
        'La red `bridge` por defecto (`docker0`) existe siempre. **No provee DNS entre contenedores por nombre**.',
        'Las redes bridge **definidas por el usuario** sí proveen resolución DNS automática por nombre de servicio.',
        '**Siempre creá redes personalizadas**. No uses la bridge por defecto para comunicación entre contenedores.',
        '`docker network create app-net` — Crea red bridge personalizada con subred automática.',
        '`docker network create --subnet=172.20.0.0/16 --gateway=172.20.0.1 mi-red` — Con subred explícita.',
        '`docker run --network app-net --name backend mi-api` — Conecta el contenedor a la red.',
        "Desde otro contenedor en la misma red: `curl http://backend:8000/` — DNS resuelve 'backend' automáticamente.",
        'Un contenedor puede conectarse a múltiples redes: `docker network connect otra-red mi-contenedor`.',
      ],
    },
    {
      type: 'concepts',
      title: 'Publicar puertos — exposición al exterior',
      items: [
        '`-p 8080:80` — Mapea el puerto 80 del contenedor al 8080 del host. Accesible desde cualquier IP del host.',
        '`-p 127.0.0.1:8080:80` — Solo acepta conexiones del localhost del host. No expuesto a la red externa.',
        '`-p 0.0.0.0:8080:80` — Acepta en todas las interfaces. Comportamiento por defecto de `-p 8080:80`.',
        '`-p 80` (un solo número) — Docker elige un puerto aleatorio en el host. Ver con `docker port contenedor`.',
        '`-P` / `--publish-all` — Publica todos los puertos EXPOSE del Dockerfile en puertos aleatorios.',
        '`-p 8080:80/udp` — Especifica protocolo UDP explícitamente. Por defecto Docker publica TCP.',
        'En Docker Compose la sintaxis es la misma bajo `ports:` — una lista de strings `"HOST:CONTENEDOR"`.',
        'El daemon de Docker modifica iptables para implementar el mapeo de puertos.',
        '**Seguridad**: si publicás un puerto, es accesible para cualquiera que pueda llegar a la IP del host.',
      ],
    },
    {
      type: 'comparison',
      title: 'bridge (user-defined) vs host — cuándo elegir cada uno',
      headers: ['Característica', 'bridge (user-defined)', 'host'],
      rows: [
        {
          feature: 'Aislamiento',
          a: 'Subred privada — nada fuera de la red la ve',
          b: 'Ninguno — comparte la pila de red completa del host',
        },
        {
          feature: 'DNS entre contenedores',
          a: 'Automático, por nombre de servicio',
          b: "No aplica — todo es 'localhost' como en el host",
        },
        { feature: 'Rendimiento', a: 'Overhead mínimo de NAT', b: 'Máximo — sin traducción de direcciones' },
        {
          feature: 'Portabilidad',
          a: 'Alta — funciona igual en cualquier host Docker',
          b: 'Baja — depende de qué puertos estén libres en ese host',
        },
        { feature: 'Disponibilidad', a: 'Linux, macOS, Windows', b: 'Solo Linux' },
        {
          feature: 'Caso de uso típico',
          a: 'La gran mayoría de apps multi-contenedor',
          b: 'Agentes de monitoreo, sniffers, benchmarks de latencia',
        },
      ],
    },
    {
      type: 'history',
      title: 'Errores comunes de red',
      items: [
        'Usar la red `bridge` default en vez de crear una red propia — pierdes DNS interno y quedás forzado a `--link` (deprecado desde hace años).',
        'Confundir `EXPOSE` en el Dockerfile con publicar un puerto — `EXPOSE` es solo documentación para quien lea la imagen, no abre nada. Sin `-p` no hay tráfico entrando.',
        "Publicar el puerto de la base de datos (`-p 5432:5432`) en producción 'por si las moscas' — si el firewall del host no filtra, la DB queda alcanzable desde internet.",
        'Poner todos los servicios en una sola red plana — un contenedor comprometido puede alcanzar cualquier otro. Segmentar por zona (pública/privada) reduce el radio de impacto.',
        'No limpiar redes creadas en tests de CI — cada `docker network create` sin `docker network rm` posterior acumula redes huérfanas en el runner.',
      ],
    },
    {
      type: 'concepts',
      title: 'DNS interno y resolución de nombres',
      body: `Docker incluye un servidor DNS embebido que gestiona la resolución de nombres entre contenedores.`,
      items: [
        'En redes user-defined, cada contenedor registra su nombre en el DNS de Docker (127.0.0.11).',
        'Los contenedores resuelven nombres de otros contenedores en la misma red automáticamente.',
        'Si escalás con `--scale backend=3`, el DNS hace round-robin entre las tres instancias.',
        'Los aliases de red dan nombres alternativos: `docker run --network-alias postgres mi-db`.',
        'Podés inspeccionar el DNS: `docker exec mi-app cat /etc/resolv.conf` — verás `127.0.0.11`.',
        'El nameserver `127.0.0.11` solo está disponible dentro del contenedor, no en el host.',
      ],
    },
    {
      type: 'diagram',
      title: 'Aislamiento de red — patrón de seguridad',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 700 390" role="img" aria-label="En una sola red plana nginx puede llegar directo a postgres; separando public y private, con backend como puente entre ambas, nginx solo alcanza a backend y postgres queda inaccesible desde afuera">
    <defs>
      <marker id="arrow-08b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="170" y="30" text-anchor="middle" font-size="13" font-weight="bold">Mala práctica</text>
    <rect x="30" y="50" width="280" height="120" rx="4" fill="none" stroke="currentColor"/>
    <text x="50" y="68" font-size="11">red: app-net</text>

    <rect x="45" y="100" width="70" height="34" rx="3" fill="none" stroke="currentColor"/>
    <text x="80" y="121" text-anchor="middle" font-size="11">nginx</text>
    <rect x="140" y="100" width="70" height="34" rx="3" fill="none" stroke="currentColor"/>
    <text x="175" y="121" text-anchor="middle" font-size="11">backend</text>
    <rect x="235" y="100" width="70" height="34" rx="3" fill="none" stroke="currentColor"/>
    <text x="270" y="121" text-anchor="middle" font-size="11">postgres</text>

    <line x1="115" y1="117" x2="140" y2="117" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <line x1="210" y1="117" x2="235" y2="117" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <line x1="80" y1="100" x2="260" y2="100" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <text x="170" y="150" text-anchor="middle" font-size="10">nginx ve a postgres ✗</text>

    <text x="540" y="30" text-anchor="middle" font-size="13" font-weight="bold">Buena práctica</text>
    <rect x="380" y="50" width="140" height="120" rx="4" fill="none" stroke="currentColor"/>
    <text x="395" y="68" font-size="11">red: public</text>
    <rect x="395" y="100" width="110" height="34" rx="3" fill="none" stroke="currentColor"/>
    <text x="450" y="121" text-anchor="middle" font-size="11">nginx</text>

    <rect class="dg-accent" x="540" y="50" width="140" height="120" rx="4" fill="none" stroke="currentColor"/>
    <text x="555" y="68" font-size="11">red: private</text>
    <rect x="555" y="88" width="110" height="30" rx="3" fill="none" stroke="currentColor"/>
    <text x="610" y="107" text-anchor="middle" font-size="11">backend</text>
    <rect x="555" y="130" width="50" height="30" rx="3" fill="none" stroke="currentColor"/>
    <text x="580" y="149" text-anchor="middle" font-size="10">postgres</text>
    <rect x="615" y="130" width="50" height="30" rx="3" fill="none" stroke="currentColor"/>
    <text x="640" y="149" text-anchor="middle" font-size="10">redis</text>

    <line x1="505" y1="117" x2="555" y2="103" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <line x1="610" y1="118" x2="580" y2="130" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <line x1="610" y1="118" x2="640" y2="130" stroke="currentColor" marker-end="url(#arrow-08b)"/>
    <text x="540" y="192" text-anchor="middle" font-size="10">backend está en ambas redes (puente)</text>

    <text x="350" y="330" text-anchor="middle" font-size="11">nginx→backend ✓ · nginx→postgres/redis ✗</text>
    <text x="350" y="346" text-anchor="middle" font-size="11">backend→postgres,redis ✓ · postgres sin puertos publicados ✓</text>
  </svg>
  <figcaption>Segmentar en redes public y private, con backend como único puente entre ambas, evita que nginx llegue directo a postgres o redis y reduce el radio de impacto de un contenedor comprometido.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Diagnóstico de red',
      items: [
        '`docker network ls` — Lista todas las redes. Siempre verás bridge, host y none por defecto.',
        '`docker network inspect app-net` — Muestra IPs de todos los contenedores conectados, subred, gateway.',
        '`docker exec mi-app ping otro-contenedor` — Prueba conectividad por nombre.',
        '`docker exec mi-app nslookup otro-contenedor` — Resolución DNS explícita.',
        '`docker exec mi-app curl http://backend:8000/health` — Prueba HTTP entre contenedores.',
        '`docker network disconnect app-net mi-contenedor` — Desconecta un contenedor de una red.',
        '`docker network rm app-net` — Elimina la red (falla si hay contenedores conectados).',
        '`docker network prune` — Elimina todas las redes sin contenedores.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Redes y aislamiento multicontenedor',
      steps: [
        {
          cmd: "docker network create public-net\ndocker network create private-net\ndocker network ls | grep -E '(public|private)'",
          desc: 'Crea dos redes separadas para simular zonas de seguridad.',
        },
        {
          cmd: 'docker run -d \\\n  --name db \\\n  --network private-net \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=demo \\\n  postgres:16-alpine',
          desc: 'DB solo en la red privada. Sin puertos publicados al host.',
        },
        {
          cmd: 'docker run -d \\\n  --name backend \\\n  --network private-net \\\n  -e DB_HOST=db \\\n  nginx:alpine',
          desc: "Backend solo en red privada. Puede ver a 'db' pero no está expuesto al exterior.",
        },
        {
          cmd: '# Conectar backend también a la red pública\ndocker network connect public-net backend',
          desc: 'Backend ahora tiene un pie en cada red — patrón puente.',
        },
        {
          cmd: '# Verificar DNS interno\ndocker exec backend ping -c 2 db',
          desc: "El nombre 'db' resuelve al contenedor de PostgreSQL en la red privada.",
        },
        {
          cmd: "# Verificar que desde una red diferente no se puede acceder\ndocker run --rm --network public-net alpine ping -c 2 db 2>&1 || echo 'Correcto: db no visible desde public-net'",
          desc: 'La DB no es visible desde la red pública — aislamiento funcionando.',
        },
        {
          cmd: "docker network inspect private-net --format '{{json .Containers}}' | python3 -m json.tool",
          desc: 'Muestra los contenedores conectados a la red privada con sus IPs.',
        },
        {
          cmd: 'docker rm -f db backend\ndocker network rm public-net private-net',
          desc: 'Limpieza completa.',
        },
      ],
    },
  ],
};

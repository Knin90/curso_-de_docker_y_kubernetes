export default {
  id: 21,
  title: 'Ingress y exposición externa',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Exponer múltiples servicios HTTP bajo un mismo punto de entrada con Ingress: ruteo por host/path, TLS y por qué es la alternativa correcta a un LoadBalancer por servicio.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tenés 5 microservicios HTTP en el cluster. Con \`type: LoadBalancer\` en cada Service, el cloud provider crea 5 balanceadores externos — 5 IPs públicas, 5 facturas separadas, y ningún ruteo inteligente por dominio o path (api.midominio.com vs app.midominio.com vs midominio.com/admin).

Necesitás un único punto de entrada HTTP/HTTPS que reciba todo el tráfico externo y lo reparta según el host o el path a los Services internos correctos — con un solo certificado TLS a mantener, no cinco.`,
    },
    {
      type: 'concepts',
      title: 'Ingress — reglas de ruteo, no el balanceador en sí',
      items: [
        'Un recurso `Ingress` es solo **reglas declarativas**: qué host y qué path van a qué Service. No es un proceso — necesita un **Ingress Controller** corriendo en el cluster que las interprete y las aplique.',
        'El Ingress Controller (nginx-ingress, Traefik, HAProxy, o el nativo del cloud provider) SÍ es un proceso real: normalmente un Deployment con un Service `LoadBalancer` — es el único punto de entrada externo real.',
        'Sin un Ingress Controller instalado, crear un recurso `Ingress` no hace nada — es la causa más común de "por qué mi Ingress no funciona" en los primeros intentos.',
        'El Ingress resuelve el problema de las "5 IPs públicas": UN LoadBalancer (el del controller) para todo el tráfico HTTP/HTTPS del cluster, con las reglas de ruteo viviendo como YAML versionable.',
      ],
    },
    {
      type: 'diagram',
      title: 'Un Ingress Controller, múltiples reglas',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 640 340" role="img" aria-label="Todo el tráfico externo entra por el único LoadBalancer del Ingress Controller, que lee las reglas de host y path para enrutar hacia los Services ClusterIP internos correctos">
    <defs>
      <marker id="arrow-21a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="320" y="24" text-anchor="middle" font-size="12">Internet</text>
    <path d="M320,30 L320,60" stroke="currentColor" fill="none" marker-end="url(#arrow-21a)"/>

    <rect class="dg-accent" x="140" y="60" width="360" height="56" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="82" text-anchor="middle" font-size="12">Ingress Controller (nginx)</text>
    <text x="320" y="98" text-anchor="middle" font-size="11">Service LoadBalancer · 1 IP pública</text>

    <path d="M320,116 L320,146" stroke="currentColor" fill="none" marker-end="url(#arrow-21a)"/>
    <rect x="210" y="123" width="220" height="14" fill="#0a0d16"/>
    <text x="320" y="134" text-anchor="middle" font-size="11">lee reglas de todos los Ingress</text>

    <rect x="100" y="148" width="440" height="90" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="166" text-anchor="middle" font-size="12">Reglas</text>
    <text x="320" y="180" text-anchor="middle" font-size="10.5">api.midominio.com → api-svc</text>
    <text x="320" y="194" text-anchor="middle" font-size="10.5">app.midominio.com → frontend-svc</text>
    <text x="320" y="208" text-anchor="middle" font-size="10.5">midominio.com/admin → admin-svc</text>
    <text x="320" y="222" text-anchor="middle" font-size="10.5">midominio.com/* → frontend-svc</text>

    <path d="M130,238 L130,270" stroke="currentColor" fill="none" marker-end="url(#arrow-21a)"/>
    <path d="M320,238 L320,270" stroke="currentColor" fill="none" marker-end="url(#arrow-21a)"/>
    <path d="M510,238 L510,270" stroke="currentColor" fill="none" marker-end="url(#arrow-21a)"/>
    <rect x="260" y="248" width="120" height="14" fill="#0a0d16"/>
    <text x="320" y="259" text-anchor="middle" font-size="11">ruteo por host/path</text>

    <rect x="45" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="130" y="292" text-anchor="middle" font-size="12">api-svc</text>
    <text x="130" y="308" text-anchor="middle" font-size="11">(ClusterIP)</text>

    <rect x="235" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="292" text-anchor="middle" font-size="12">frontend-svc</text>
    <text x="320" y="308" text-anchor="middle" font-size="11">(ClusterIP)</text>

    <rect x="425" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="510" y="292" text-anchor="middle" font-size="12">admin-svc</text>
    <text x="510" y="308" text-anchor="middle" font-size="11">(ClusterIP)</text>
  </svg>
  <figcaption>Todo el tráfico externo entra por el único LoadBalancer del Ingress Controller, que lee las reglas de host y path y enruta hacia Services ClusterIP internos normales, nunca expuestos directamente.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Ingress — ruteo por host y por path',
      code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /   # anotaciones: config específica del controller
spec:
  ingressClassName: nginx        # cuál Ingress Controller atiende esta regla
  rules:
    - host: api.midominio.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-svc
                port: { number: 80 }

    - host: midominio.com
      http:
        paths:
          - path: /admin
            pathType: Prefix
            backend:
              service: { name: admin-svc, port: { number: 80 } }
          - path: /
            pathType: Prefix
            backend:
              service: { name: frontend-svc, port: { number: 80 } }`,
    },
    {
      type: 'concepts',
      title: 'TLS en el Ingress — HTTPS centralizado',
      items: [
        'El certificado y su clave privada viven en un Secret de tipo `kubernetes.io/tls` — el Ingress lo referencia por nombre, no lo contiene inline.',
        "**cert-manager** es la herramienta estándar para automatizar esto: emite y renueva certificados de Let's Encrypt automáticamente, creando el Secret TLS por vos según anotaciones en el propio Ingress.",
        'Sin cert-manager, hay que generar el certificado a mano y actualizarlo antes de que expire — factible en un lab, impracticable en producción con múltiples dominios.',
        'El TLS termina en el Ingress Controller: el tráfico entre el controller y los Services internos suele ir sin cifrar (HTTP plano) dentro del cluster — aceptable en la mayoría de casos, no en entornos con requisitos estrictos de cifrado interno (ahí entra un service mesh).',
      ],
    },
    {
      type: 'code',
      title: 'Ingress con TLS',
      code: `apiVersion: v1
kind: Secret
metadata:
  name: midominio-tls
type: kubernetes.io/tls
data:
  tls.crt: <certificado en base64>
  tls.key: <clave privada en base64>

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress-tls
spec:
  ingressClassName: nginx
  tls:
    - hosts: [api.midominio.com]
      secretName: midominio-tls
  rules:
    - host: api.midominio.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend: { service: { name: api-svc, port: { number: 80 } } }`,
    },
    {
      type: 'comparison',
      title: 'Cómo exponer un Service: las tres opciones, comparadas',
      headers: ['Opción', 'Cuándo usarla', 'Costo/complejidad'],
      rows: [
        {
          feature: 'NodePort',
          a: 'Dev/testing, acceso rápido sin cloud provider',
          b: 'Gratis, pero puertos altos feos y sin TLS',
        },
        {
          feature: 'LoadBalancer por Service',
          a: 'Un solo servicio expuesto, o tráfico no-HTTP (TCP/UDP crudo)',
          b: 'Un balanceador (y su costo) por servicio',
        },
        {
          feature: 'Ingress',
          a: 'Múltiples servicios HTTP/HTTPS bajo dominios/paths distintos',
          b: 'Un balanceador total; requiere instalar el controller',
        },
      ],
    },
    {
      type: 'history',
      title: 'Buenas prácticas',
      items: [
        'Instalar el Ingress Controller es responsabilidad de quien administra el cluster (o viene preinstalado en soluciones gestionadas) — un desarrollador de apps normalmente solo escribe recursos `Ingress`.',
        '`ingressClassName` es obligatorio cuando hay más de un controller en el cluster (por ejemplo nginx + Traefik convivendo) — sin especificarlo, el Ingress puede no ser atendido por nadie.',
        'Las anotaciones (`nginx.ingress.kubernetes.io/...`) son específicas de cada implementación de Ingress Controller — no son portables entre nginx-ingress, Traefik y el controller nativo de un cloud provider.',
        'Para tráfico que no es HTTP/HTTPS (bases de datos expuestas externamente, protocolos binarios), Ingress no aplica — ahí corresponde `LoadBalancer` directo sobre el Service.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Ingress Controller local + ruteo por path',
      steps: [
        {
          cmd: 'cat > kind-config.yaml << \'EOF\'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n  - role: control-plane\n    kubeadmConfigPatches:\n      - |\n        kind: InitConfiguration\n        nodeRegistration:\n          kubeletExtraArgs:\n            node-labels: "ingress-ready=true"\n    extraPortMappings:\n      - containerPort: 80\n        hostPort: 80\nEOF\nkind create cluster --name ingress-lab --config kind-config.yaml',
          desc: 'kind necesita config extra para exponer el puerto 80 del Ingress Controller al host.',
        },
        {
          cmd: 'kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml\nkubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s',
          desc: 'Instala nginx-ingress-controller adaptado para kind, y espera a que esté listo.',
        },
        {
          cmd: "cat > apps.yaml << 'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: api }\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: api } }\n  template:\n    metadata: { labels: { app: api } }\n    spec: { containers: [{ name: api, image: traefik/whoami, args: ['--name=api'] }] }\n---\napiVersion: v1\nkind: Service\nmetadata: { name: api-svc }\nspec: { selector: { app: api }, ports: [{ port: 80 }] }\n---\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata: { name: app-ingress }\nspec:\n  ingressClassName: nginx\n  rules:\n    - http:\n        paths:\n          - path: /api\n            pathType: Prefix\n            backend: { service: { name: api-svc, port: { number: 80 } } }\nEOF\nkubectl apply -f apps.yaml",
          desc: "Servicio 'whoami' + Ingress que rutea /api hacia él.",
        },
        {
          cmd: 'curl -s localhost/api | grep Hostname',
          desc: 'El tráfico entra por el puerto 80 del host, el Ingress Controller lo rutea por path hasta el Service.',
        },
        { cmd: 'kubectl delete -f apps.yaml\nkind delete cluster --name ingress-lab', desc: 'Limpieza.' },
      ],
    },
  ],
};

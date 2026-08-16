export default {
  id: 22,
  title: 'Producción: probes, recursos y autoscaling',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Cerrar el curso con lo que separa un cluster de juguete de uno listo para producción: liveness/readiness probes, límites de recursos, HPA, y un despliegue completo que integra todo lo aprendido.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tu Deployment tiene 3 réplicas "Running". Pero una de ellas quedó colgada — el proceso vive, responde al puerto, pero cuelga cada request porque perdió la conexión con la base de datos. Kubernetes no tiene forma de saberlo: para él, un contenedor con el proceso vivo está sano. Un tercio del tráfico se va a un Pod roto.

Y en el otro extremo: el Black Friday llega, el tráfico se triplica, y tenés que escalar los Pods a mano cada vez que alguien nota que la app está lenta — a las 3 AM, si hace falta.`,
    },
    {
      type: 'concepts',
      title: "Probes — enseñarle a Kubernetes qué significa 'sano'",
      items: [
        '**livenessProbe**: responde "¿este contenedor está vivo?". Si falla repetidamente, kubelet lo **reinicia** — es el mecanismo de auto-reparación a nivel de Pod individual.',
        '**readinessProbe**: responde "¿este contenedor puede recibir tráfico AHORA?". Si falla, el Pod se saca de los Endpoints del Service — sigue vivo, pero deja de recibir requests hasta que vuelva a responder bien.',
        '**startupProbe**: para apps con arranque lento (cargan un modelo, hacen un warm-up largo) — bloquea las otras dos probes hasta que la app termine de iniciar, evitando que liveness la mate por "tardar mucho".',
        'La confusión más común: usar solo liveness. Sin readiness, un Pod que perdió la conexión a la DB pero no crasheó sigue recibiendo tráfico normal — exactamente el problema del ejemplo de arriba.',
        'Tipos de chequeo: `httpGet` (código 2xx/3xx = sano), `tcpSocket` (puerto abre = sano), `exec` (comando sale con 0 = sano) — el mismo mecanismo que vimos con healthchecks en Compose (nivel 10), ahora a nivel de Pod.',
      ],
    },
    {
      type: 'code',
      title: 'Las tres probes en un Deployment',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: app
          image: mi-api:2.0
          ports: [{ containerPort: 8080 }]

          startupProbe:                  # arranque lento: hasta 30 * 5s = 150s de gracia
            httpGet: { path: /health, port: 8080 }
            failureThreshold: 30
            periodSeconds: 5

          livenessProbe:                 # ¿sigue vivo? si falla 3 veces → restart
            httpGet: { path: /health, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 3

          readinessProbe:                # ¿puede recibir tráfico AHORA? si falla → fuera del Service
            httpGet: { path: /ready, port: 8080 }   # /ready chequea DB, cache, etc.
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 2`,
    },
    {
      type: 'concepts',
      title: 'Requests y Limits — el contrato de recursos',
      items: [
        '**requests**: lo que el Pod pide garantizado. El scheduler solo lo asigna a un nodo que tenga ese CPU/memoria libres — es la base de una programación predecible.',
        '**limits**: el techo. Si el contenedor pasa el límite de memoria, el kernel lo mata (`OOMKilled`). Si pasa el límite de CPU, se lo throttlea — sigue vivo, pero más lento.',
        'Sin `requests`, el scheduler puede amontonar demasiados Pods en un nodo (cada uno "cree" que tiene todo el nodo para sí) — el equivalente al problema del nivel 14 pero multiplicado por nodo.',
        'Un Pod sin `limits` de memoria puede consumir toda la RAM del nodo y afectar a OTROS Pods vecinos — el aislamiento de recursos depende de que estos campos estén bien puestos, no es automático.',
        'QoS Class resultante: `Guaranteed` (requests == limits en todo), `Burstable` (tiene requests, limits distintos o parciales), `BestEffort` (sin nada) — determina a quién mata primero el kernel bajo presión de memoria.',
      ],
    },
    {
      type: 'code',
      title: 'Requests y Limits en la práctica',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: app
          image: mi-api:2.0
          resources:
            requests:
              cpu: "250m"        # 0.25 núcleos garantizados
              memory: "256Mi"
            limits:
              cpu: "500m"        # tope de 0.5 núcleos (throttle, no mata)
              memory: "512Mi"    # tope de memoria (OOMKilled si lo pasa)`,
    },
    {
      type: 'concepts',
      title: 'HorizontalPodAutoscaler — escalar solo, según demanda',
      items: [
        'El **HPA** observa una métrica (CPU/memoria por defecto, o métricas custom vía Prometheus Adapter) y ajusta `replicas` del Deployment automáticamente entre un mínimo y un máximo.',
        'Requiere que los Pods tengan `requests` de CPU definidos — el HPA calcula el % de uso relativo a ese request, no a un valor absoluto.',
        '`metrics-server` tiene que estar instalado en el cluster para que existan las métricas que el HPA consulta — sin él, el HPA se queda sin datos (`<unknown>` en `kubectl get hpa`).',
        'El escalado hacia ABAJO es más conservador que hacia arriba por diseño (`stabilizationWindowSeconds`) — evita el efecto "yo-yo" de escalar y desescalar en cada pico corto de tráfico.',
      ],
    },
    {
      type: 'code',
      title: 'HPA — de 2 a 10 réplicas según CPU',
      code: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70    # escala cuando el promedio supera 70% del request`,
    },
    {
      type: 'comparison',
      title: 'Checklist: de un YAML de desarrollo a uno listo para producción',
      headers: ['Aspecto', 'Falta (dev)', 'Producción'],
      rows: [
        {
          feature: 'Probes',
          a: 'Ninguna — el Pod "parece" sano siempre',
          b: 'liveness + readiness (+ startup si aplica)',
        },
        { feature: 'Recursos', a: 'Sin requests/limits', b: 'Ambos definidos, medidos con carga real' },
        { feature: 'Réplicas', a: '1, fija', b: '≥2 + HPA con min/max razonables' },
        {
          feature: 'Rollout',
          a: 'Recreate implícito',
          b: 'RollingUpdate con maxUnavailable/maxSurge ajustados',
        },
        {
          feature: 'Secrets',
          a: 'En variables de entorno sueltas',
          b: 'Secret + volumen montado, RBAC acotado',
        },
        { feature: 'Observabilidad', a: 'Solo `kubectl logs`', b: 'Logs centralizados + métricas + alertas' },
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio final: despliegue completo de producción',
      steps: [
        { cmd: 'kind create cluster --name final-lab', desc: 'Cluster nuevo para el cierre del curso.' },
        {
          cmd: "curl -Lo components.yaml https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml\nsd 'args:' 'args:\\n        - --kubelet-insecure-tls' components.yaml\nkubectl apply -f components.yaml\nkubectl wait --for=condition=available --timeout=90s deployment/metrics-server -n kube-system",
          desc: 'metrics-server con TLS inseguro (solo válido para un cluster de práctica en kind, nunca en producción real).',
        },
        {
          cmd: 'kubectl create secret generic db-credentials --from-literal=password=prodpass123',
          desc: 'Credencial, igual que en el nivel 19.',
        },
        {
          cmd: "cat > prod.yaml << 'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata: { name: web }\nspec:\n  replicas: 2\n  selector: { matchLabels: { app: web } }\n  template:\n    metadata: { labels: { app: web } }\n    spec:\n      containers:\n        - name: app\n          image: traefik/whoami\n          ports: [{ containerPort: 80 }]\n          resources:\n            requests: { cpu: 50m, memory: 32Mi }\n            limits: { cpu: 100m, memory: 64Mi }\n          readinessProbe:\n            httpGet: { path: /, port: 80 }\n            periodSeconds: 3\n          livenessProbe:\n            httpGet: { path: /, port: 80 }\n            periodSeconds: 10\n            failureThreshold: 3\n---\napiVersion: v1\nkind: Service\nmetadata: { name: web-svc }\nspec: { selector: { app: web }, ports: [{ port: 80 }] }\n---\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata: { name: web-hpa }\nspec:\n  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: web }\n  minReplicas: 2\n  maxReplicas: 6\n  metrics:\n    - type: Resource\n      resource: { name: cpu, target: { type: Utilization, averageUtilization: 50 } }\nEOF\nkubectl apply -f prod.yaml\nkubectl rollout status deployment/web",
          desc: 'Deployment con probes + recursos + Service + HPA — todo lo del curso en un manifiesto.',
        },
        {
          cmd: 'kubectl get hpa web-hpa',
          desc: 'Muestra TARGETS (uso actual/objetivo) y el rango de réplicas — puede tardar ~1 min en mostrar métricas reales.',
        },
        {
          cmd: "kubectl run carga --rm -it --image=busybox --restart=Never -- sh -c 'while true; do wget -q -O- http://web-svc > /dev/null; done' &\nsleep 60\nkubectl get hpa web-hpa\nkubectl get pods -l app=web",
          desc: 'Genera carga sostenida; el HPA debería empezar a subir réplicas al pasar el umbral de CPU.',
        },
        {
          cmd: 'kill %1 2>/dev/null; kubectl delete -f prod.yaml\nkind delete cluster --name final-lab',
          desc: 'Limpieza final — cierre del curso completo Docker → Compose → Kubernetes.',
        },
      ],
    },
  ],
};

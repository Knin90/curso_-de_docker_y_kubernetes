export default {
  id: 24,
  title: 'Helm — el gestor de paquetes de Kubernetes',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Empaquetar y versionar manifiestos de Kubernetes como un solo artefacto instalable: Charts, Templates, values.yaml, releases, y el ciclo install/upgrade/rollback — cerrando el curso con la herramienta que la mayoría de los proyectos reales usan para desplegar.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `El manifiesto de producción del nivel 22 (Deployment + Service + HPA) funciona perfecto para UN entorno. Pero ahora necesitás desplegar la misma app en dev, staging y producción — cada uno con distinta cantidad de réplicas, distinto límite de recursos, y distinto dominio de Ingress.

Copiar y pegar el YAML tres veces con find-and-replace es exactamente el mismo error que hornear configuración en la imagen (nivel 19): la próxima vez que cambies el readinessProbe, tenés que acordarte de actualizar los tres archivos a mano, en los tres entornos, sin romper ninguno. Y cuando el deploy sale mal, no hay un "undo" atómico — hay que reconstruir el estado anterior manifiesto por manifiesto.`,
    },
    {
      type: 'concepts',
      title: 'Qué es Helm y por qué existe',
      items: [
        '**Helm** es el gestor de paquetes de Kubernetes — lo que `apt`/`npm` son para sus ecosistemas, Helm lo es para conjuntos de manifiestos YAML.',
        'Un **Chart** es el paquete: una carpeta con templates de manifiestos, metadata, y valores por defecto. Podés instalar un Chart propio o uno público (bases de datos, ingress controllers, cert-manager — la mayoría del software de infraestructura se distribuye como Chart).',
        'Helm resuelve tres problemas a la vez: parametrizar el mismo YAML para múltiples entornos (con **values**), versionar el conjunto completo como una unidad (**release**), y poder hacer **rollback** atómico de todo el conjunto si algo sale mal — no manifiesto por manifiesto.',
        'A diferencia de aplicar YAMLs sueltos con `kubectl apply -f`, Helm mantiene un historial de revisiones por release — sabe exactamente qué versión de qué Chart, con qué valores, está corriendo en el cluster en este momento.',
      ],
    },
    {
      type: 'concepts',
      title: 'Anatomía de un Chart',
      items: [
        '`Chart.yaml`: metadata del paquete — nombre, versión del Chart, versión de la app que empaqueta (`appVersion`), descripción.',
        '`values.yaml`: los valores **por defecto** que los templates usan — acá vive todo lo parametrizable: cantidad de réplicas, imagen, límites de recursos, dominio del Ingress.',
        '`templates/`: los manifiestos reales, pero con placeholders (`{{ .Values.algo }}`) en vez de valores fijos — Helm los renderiza combinando el template con los values antes de mandarlos al API server.',
        '`templates/_helpers.tpl`: funciones reutilizables dentro de los templates (nombres consistentes, labels comunes) — evita repetir la misma expresión en cada archivo.',
        'El motor de templates es **Go templates**, el mismo lenguaje que usan muchas herramientas de infraestructura — soporta condicionales (`{{- if }}`), loops (`{{- range }}`) y funciones (`{{ .Values.name | default "app" }}`).',
      ],
    },
    {
      type: 'code',
      title: 'Estructura de un Chart y su values.yaml',
      code: `mi-chart/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── deployment.yaml
    ├── service.yaml
    ├── hpa.yaml
    └── _helpers.tpl

# Chart.yaml
apiVersion: v2
name: mi-chart
description: Chart de la app web del curso
version: 0.1.0          # versión del Chart en sí
appVersion: "2.0"        # versión de la imagen que empaqueta

# values.yaml — los defaults; cada entorno los sobreescribe parcialmente
replicaCount: 2
image:
  repository: mi-api
  tag: "2.0"
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits: { cpu: 500m, memory: 512Mi }
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPU: 70`,
    },
    {
      type: 'code',
      title: 'Template: el Deployment del nivel 22, ahora parametrizado',
      code: `# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-web        # nombre único por release
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels: { app: {{ .Release.Name }} }
  template:
    metadata:
      labels: { app: {{ .Release.Name }} }
    spec:
      containers:
        - name: app
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          readinessProbe:               # las probes del nivel 22, iguales en todo entorno
            httpGet: { path: /ready, port: 8080 }
            periodSeconds: 5
          livenessProbe:
            httpGet: { path: /health, port: 8080 }
            periodSeconds: 10
            failureThreshold: 3
---
# templates/hpa.yaml
{{- if .Values.autoscaling.enabled }}
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: {{ .Release.Name }}-hpa
spec:
  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: {{ .Release.Name }}-web }
  minReplicas: {{ .Values.autoscaling.minReplicas }}
  maxReplicas: {{ .Values.autoscaling.maxReplicas }}
  metrics:
    - type: Resource
      resource: { name: cpu, target: { type: Utilization, averageUtilization: {{ .Values.autoscaling.targetCPU }} } }
{{- end }}`,
    },
    {
      type: 'concepts',
      title: 'Releases y el ciclo install / upgrade / rollback',
      items: [
        'Una **release** es una instancia instalada de un Chart en el cluster, identificada por nombre — podés instalar el mismo Chart varias veces con distintos nombres de release (ej. `web-dev` y `web-staging`) usando distintos values.',
        '`helm install <release> <chart> -f values-prod.yaml`: renderiza los templates con esos values y los aplica — equivalente a un `kubectl apply -f` de todo el conjunto, pero registrado como una unidad versionada.',
        '`helm upgrade <release> <chart> -f values-prod.yaml`: aplica cambios (nuevo values, nueva versión del Chart) y crea una nueva revisión — Helm calcula el diff y solo toca lo que cambió.',
        '`helm rollback <release> <revision>`: vuelve a un estado anterior completo — Deployment, Service, HPA, todo junto — en un solo comando. Es el "undo atómico" que un `kubectl apply` suelto no te da.',
        '`helm history <release>` muestra todas las revisiones con su estado; `helm uninstall <release>` borra todos los recursos que esa release creó, limpio, sin tener que acordarte de cada manifiesto por separado.',
      ],
    },
    {
      type: 'comparison',
      title: 'kubectl apply -f suelto vs Helm',
      headers: ['Aspecto', 'kubectl apply -f manifests/', 'Helm'],
      rows: [
        {
          feature: 'Multi-entorno',
          a: 'Copiar YAML por entorno o usar Kustomize aparte',
          b: 'Un Chart + un values.yaml distinto por entorno',
        },
        {
          feature: 'Rollback',
          a: 'Manual, manifiesto por manifiesto',
          b: '`helm rollback` — atómico, a cualquier revisión anterior',
        },
        {
          feature: 'Historial de cambios',
          a: 'Solo lo que Git guarde del repo de manifiestos',
          b: '`helm history` — revisiones dentro del cluster mismo',
        },
        {
          feature: 'Instalar software de terceros',
          a: 'Buscar YAMLs sueltos, adaptarlos a mano',
          b: '`helm install` desde un repo público (Bitnami, ingress-nginx, etc.)',
        },
        {
          feature: 'Curva de entrada',
          a: 'Baja — YAML plano, lo que ya sabés del curso',
          b: 'Requiere aprender el motor de templates (Go templates)',
        },
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: crear un Chart propio e iterar sobre él',
      steps: [
        { cmd: 'kind create cluster --name helm-lab', desc: 'Cluster nuevo para el cierre del curso.' },
        {
          cmd: 'helm create mi-chart',
          desc: 'Genera el scaffold completo de un Chart (Chart.yaml, values.yaml, templates/ con ejemplos).',
        },
        {
          cmd: "sd 'repository: nginx' 'repository: traefik/whoami' mi-chart/values.yaml\nsd 'tag: \"\"' 'tag: \"latest\"' mi-chart/values.yaml\nsd 'replicaCount: 1' 'replicaCount: 2' mi-chart/values.yaml",
          desc: 'Ajustamos los defaults del scaffold a la imagen de práctica del curso.',
        },
        {
          cmd: 'helm install web-dev mi-chart --set replicaCount=1',
          desc: 'Instala la release "web-dev" — --set sobreescribe un valor puntual sin tocar values.yaml.',
        },
        {
          cmd: 'helm list\nkubectl get deployment,svc -l app.kubernetes.io/instance=web-dev',
          desc: 'Confirma la release instalada y los recursos reales que Helm creó en el cluster.',
        },
        {
          cmd: 'helm upgrade web-dev mi-chart --set replicaCount=3\nhelm history web-dev',
          desc: 'Nueva revisión con 3 réplicas — el historial queda registrado.',
        },
        {
          cmd: 'helm rollback web-dev 1\nkubectl get pods -l app.kubernetes.io/instance=web-dev',
          desc: 'Vuelve a la revisión 1 (1 réplica) en un solo comando — el "undo atómico" que YAML suelto no ofrece.',
        },
        {
          cmd: 'helm uninstall web-dev\nkind delete cluster --name helm-lab',
          desc: 'Limpieza final — cierre del curso completo Docker → Compose → Kubernetes → Helm.',
        },
      ],
    },
  ],
};

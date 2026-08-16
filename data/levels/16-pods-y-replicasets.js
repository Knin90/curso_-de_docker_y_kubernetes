export default {
  id: 16,
  title: 'Pods y ReplicaSets',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Entender el Pod como unidad mínima de Kubernetes, cuándo agrupar contenedores en uno, y cómo ReplicaSet mantiene N copias vivas siempre.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `En el nivel anterior corriste un Pod a mano con \`kubectl apply\`. Si lo borrás, no vuelve. Si el nodo se cae, no vuelve. Si querés 3 copias para repartir carga, tenés que crear 3 manifiestos casi idénticos y llevar la cuenta vos mismo.

Necesitás algo que diga "quiero 3 copias de este Pod, siempre" y que se encargue de crearlas, contarlas y reemplazar las que mueran — sin que vos ejecutes un comando cada vez.`,
    },
    {
      type: 'concepts',
      title: 'Qué es (y qué NO es) un Pod',
      items: [
        'Un Pod es un grupo de uno o más contenedores que **siempre corren juntos, en el mismo nodo**, comparten IP y almacenamiento efímero (localhost entre ellos).',
        'El Pod, no el contenedor, es la unidad mínima que Kubernetes programa y escala. Nunca escalás "un contenedor" — escalás Pods.',
        '**Un Pod ≠ un contenedor**: la mayoría de los Pods tienen un solo contenedor, pero el diseño permite más de uno cuando están fuertemente acoplados.',
        '**Patrón sidecar**: un contenedor auxiliar que asiste al principal — un proxy de logs, un exportador de métricas, un proxy de service mesh (Envoy en Istio).',
        '**Patrón init container**: corre y termina ANTES que los contenedores principales — para migraciones de DB, esperar a una dependencia, o preparar archivos.',
        'Los Pods son **efímeros y desechables por diseño**: nunca deberías "reparar" un Pod roto — se destruye y se crea uno nuevo. Por eso casi nunca se crean Pods sueltos en producción.',
      ],
    },
    {
      type: 'code',
      title: 'Pod con sidecar e init container',
      code: `apiVersion: v1
kind: Pod
metadata:
  name: web-con-sidecar
  labels:
    app: web
spec:
  initContainers:
    - name: espera-db
      image: busybox
      command: ['sh', '-c', 'until nc -z db 5432; do echo esperando db...; sleep 2; done']

  containers:
    - name: nginx
      image: nginx:alpine
      ports:
        - containerPort: 80
      volumeMounts:
        - name: logs
          mountPath: /var/log/nginx

    - name: log-shipper           # sidecar: lee los mismos logs y los envía afuera
      image: busybox
      command: ['sh', '-c', 'tail -f /var/log/nginx/access.log']
      volumeMounts:
        - name: logs
          mountPath: /var/log/nginx

  volumes:
    - name: logs
      emptyDir: {}                # almacenamiento efímero compartido entre contenedores`,
    },
    {
      type: 'concepts',
      title: 'Ciclo de vida de un Pod',
      items: [
        '**Pending**: el Pod fue aceptado por el apiserver pero todavía no fue asignado a un nodo (o su imagen se está descargando).',
        '**Running**: al menos un contenedor está corriendo y el Pod fue asignado a un nodo.',
        '**Succeeded**: todos los contenedores terminaron con éxito (código 0) y no van a reiniciar — típico de Jobs, no de servicios web.',
        '**Failed**: al menos un contenedor terminó con error y la `restartPolicy` no lo relanza.',
        '**CrashLoopBackOff**: no es un estado real del Pod, es lo que reporta kubectl cuando un contenedor crashea, reinicia, crashea de nuevo — con backoff exponencial entre intentos.',
        '**restartPolicy**: `Always` (default, para servicios), `OnFailure` (para Jobs que deben reintentar), `Never` (para tareas de un solo intento).',
      ],
    },
    {
      type: 'diagram',
      title: 'ReplicaSet — el bucle de reconciliación en acción',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 640 300" role="img" aria-label="El ReplicaSet detecta que hay 2 de 3 Pods deseados y crea un Pod 4 nuevo con la misma plantilla, en vez de reparar el Pod 2 muerto">
    <defs>
      <marker id="arrow-16a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="250" y="16" width="140" height="34" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="37" text-anchor="middle" font-size="12">ReplicaSet web-rs</text>

    <path d="M320,50 L320,60 L140,60 L140,70" stroke="currentColor" fill="none"/>
    <path d="M320,50 L320,70" stroke="currentColor" fill="none"/>
    <path d="M320,50 L320,60 L500,60 L500,70" stroke="currentColor" fill="none"/>

    <rect x="70" y="70" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="140" y="90" text-anchor="middle" font-size="12">Pod 1</text>
    <text x="140" y="105" text-anchor="middle" font-size="11">Running</text>

    <rect x="250" y="70" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="90" text-anchor="middle" font-size="12">Pod 2</text>
    <text x="320" y="105" text-anchor="middle" font-size="11">Running</text>

    <rect x="430" y="70" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="500" y="90" text-anchor="middle" font-size="12">Pod 3</text>
    <text x="500" y="105" text-anchor="middle" font-size="11">Running</text>

    <path d="M320,116 L320,140" stroke="currentColor" fill="none" stroke-dasharray="4 3"/>
    <rect x="250" y="140" width="140" height="34" rx="4" stroke="currentColor" fill="none" stroke-dasharray="4 3"/>
    <text x="320" y="161" text-anchor="middle" font-size="12">Pod 2 ✗ muerto</text>

    <text x="320" y="192" text-anchor="middle" font-size="11">controller detecta 2/3 deseadas</text>
    <path d="M320,174 L320,210" stroke="currentColor" fill="none" marker-end="url(#arrow-16a)"/>

    <rect x="70" y="210" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="140" y="230" text-anchor="middle" font-size="12">Pod 1</text>
    <text x="140" y="245" text-anchor="middle" font-size="11">Running</text>

    <rect class="dg-accent" x="250" y="210" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="230" text-anchor="middle" font-size="12">Pod 4 (nuevo)</text>
    <text x="320" y="245" text-anchor="middle" font-size="11">Running</text>

    <rect x="430" y="210" width="140" height="46" rx="4" stroke="currentColor" fill="none"/>
    <text x="500" y="230" text-anchor="middle" font-size="12">Pod 3</text>
    <text x="500" y="245" text-anchor="middle" font-size="11">Running</text>

    <text x="320" y="278" text-anchor="middle" font-size="11">misma plantilla, nombre distinto — nunca "repara"</text>
  </svg>
  <figcaption>El ReplicaSet detecta que hay 2 de 3 Pods deseados y crea un Pod 4 nuevo con la misma plantilla, en vez de reparar el Pod 2 muerto.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'ReplicaSet — manifiesto y selector',
      code: `apiVersion: apps/v1
kind: ReplicaSet
metadata:
  name: web-rs
spec:
  replicas: 3
  selector:                 # cómo el RS sabe cuáles Pods "le pertenecen"
    matchLabels:
      app: web
  template:                 # la plantilla usada para crear cada Pod
    metadata:
      labels:
        app: web            # DEBE coincidir con el selector de arriba
    spec:
      containers:
        - name: nginx
          image: nginx:alpine
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: "100m"
              memory: "64Mi"
            limits:
              cpu: "250m"
              memory: "128Mi"`,
    },
    {
      type: 'concepts',
      title: 'Labels y selectors — el mecanismo de acoplamiento débil',
      items: [
        'Los **labels** son pares clave-valor arbitrarios en `metadata.labels` de cualquier recurso — no tienen significado especial por sí mismos.',
        'Los **selectors** son consultas sobre esos labels (`matchLabels`, `matchExpressions`) que otros recursos usan para "encontrar" Pods relacionados.',
        'Este desacople es la base de todo K8s: un ReplicaSet no sabe nada de sus Pods por ID — los encuentra por label cada vez. Lo mismo hacen los Services (nivel 18).',
        '`kubectl get pods -l app=web` — filtra por label desde la CLI, igual que lo haría un selector internamente.',
        'Si editás el label de un Pod para que ya no matchee el selector, el ReplicaSet lo "pierde" y crea otro para llegar al número deseado — el Pod huérfano queda corriendo solo, sin controller.',
      ],
    },
    {
      type: 'history',
      title: 'Por qué casi nunca vas a escribir un ReplicaSet directo',
      items: [
        'ReplicaSet resuelve "mantener N réplicas", pero no sabe hacer rolling updates — cambiar la imagen borra y recrea todos los Pods de golpe, con downtime.',
        'Por eso en el próximo nivel aparece **Deployment**: un recurso que gestiona ReplicaSets por vos y agrega versionado, rolling updates y rollback.',
        'En la práctica: escribís Deployments, casi nunca ReplicaSets a mano. Pero entender el ReplicaSet es entender qué hace el Deployment por debajo.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: ReplicaSet, auto-reparación y labels',
      steps: [
        { cmd: 'kind create cluster --name pods-lab', desc: 'Cluster nuevo para el laboratorio.' },
        {
          cmd: "cat > rs.yaml << 'EOF'\napiVersion: apps/v1\nkind: ReplicaSet\nmetadata:\n  name: web-rs\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:alpine\nEOF\nkubectl apply -f rs.yaml",
          desc: 'Crea el ReplicaSet con 3 réplicas deseadas.',
        },
        {
          cmd: 'kubectl get pods -l app=web -o wide',
          desc: 'Los 3 Pods, cada uno con nombre generado (web-rs-xxxxx), todos con el mismo label.',
        },
        {
          cmd: "kubectl delete pod -l app=web --field-selector=status.phase=Running --grace-period=0 --force | head -1\n# (o simplemente): kubectl delete pod $(kubectl get pod -l app=web -o jsonpath='{.items[0].metadata.name}')",
          desc: 'Mata uno de los Pods a mano, simulando una falla.',
        },
        {
          cmd: 'kubectl get pods -l app=web -w',
          desc: 'En segundos aparece un Pod nuevo con nombre distinto — el ReplicaSet reconcilió solo (Ctrl+C para salir).',
        },
        {
          cmd: 'kubectl scale replicaset web-rs --replicas=5\nkubectl get pods -l app=web',
          desc: 'Escala imperativamente a 5 — el controller crea 2 más para llegar al nuevo objetivo.',
        },
        {
          cmd: 'kubectl delete -f rs.yaml\nkind delete cluster --name pods-lab',
          desc: 'Limpieza: borrar el ReplicaSet borra también sus Pods; luego destruye el cluster.',
        },
      ],
    },
  ],
};

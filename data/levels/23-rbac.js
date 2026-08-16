export default {
  id: 23,
  title: 'RBAC — control de acceso basado en roles',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Entender quién puede hacer qué dentro de un cluster: la diferencia entre autenticación y autorización, y cómo Role, ClusterRole, RoleBinding, ClusterRoleBinding y ServiceAccounts controlan el acceso al API de Kubernetes.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Un Pod de tu aplicación necesita leer un Secret para conectarse a la base de datos. Le das al proceso dentro del contenedor acceso al API de Kubernetes vía el ServiceAccount por defecto... y sin darte cuenta, ese mismo Pod ahora puede LISTAR TODOS los Secrets del namespace, borrar Deployments, o crear nuevos Pods con privilegios elevados. Un bug de "server-side request forgery" en tu app pasó de ser un incidente contenido a un compromiso total del namespace.

El problema no es solo "¿quién sos?" (autenticación) — eso ya lo resuelve el certificado o token que usás para hablar con el API server. El problema es "¿qué te dejo hacer, exactamente?" (autorización). Sin RBAC bien configurado, la respuesta por defecto es demasiado permisiva.`,
    },
    {
      type: 'concepts',
      title: 'Autenticación vs autorización — dos preguntas distintas',
      items: [
        '**Autenticación (AuthN)**: "¿quién sos?". Kubernetes no gestiona usuarios humanos directamente — delega en certificados x509, tokens OIDC, o tokens de **ServiceAccount** para procesos dentro del cluster.',
        '**Autorización (AuthZ)**: "¿qué te dejo hacer?". Es la capa que responde esta pregunta en Kubernetes — evalúa cada request contra las reglas que definiste.',
        'Cada request al API server pasa primero por AuthN (te identifica) y después por AuthZ (decide si esa identidad puede hacer esa acción sobre ese recurso) — el mismo orden que un login seguido de un chequeo de permisos en cualquier sistema.',
        'Sin ninguna regla que lo permita explícitamente, RBAC **deniega por defecto** — a diferencia del ServiceAccount "default" de un namespace, que históricamente viene con más permisos de los que la mayoría de los Pods necesitan si no lo restringís.',
        'RBAC no es la única forma de hacer AuthZ (existen ABAC, Webhook, Node authorizer), pero es la que se usa en la práctica en el 99% de los clusters modernos — declarativa, versionable en Git, igual que todo lo demás en Kubernetes.',
      ],
    },
    {
      type: 'concepts',
      title: 'Role y ClusterRole — el "qué"',
      items: [
        'Un **Role** define un conjunto de permisos (verbos como `get`, `list`, `watch`, `create`, `delete`) sobre recursos (`pods`, `secrets`, `deployments`) dentro de **un namespace específico** — no existe fuera de él.',
        'Un **ClusterRole** es lo mismo pero sin límite de namespace: aplica a todo el cluster, o a recursos que de por sí no son namespaced (`nodes`, `persistentvolumes`, `namespaces` mismos).',
        'Ni Role ni ClusterRole otorgan nada por sí solos — son solo la "lista de permisos" (como el ConfigMap del nivel 19 es solo datos, no hace nada hasta que algo lo referencia). Hace falta un Binding para que tengan efecto.',
        'Un ClusterRole puede reutilizarse en varios namespaces distintos vía RoleBinding (ver abajo) — es más común definir un ClusterRole genérico ("puede leer Pods") y aplicarlo con Bindings namespaced que duplicar el mismo Role en cada namespace.',
        'Las reglas usan `apiGroups` (`""` para el core, `apps` para Deployments, etc.), `resources` y `verbs` — granularidad fina: podés dar `get`+`list` sobre `pods` sin dar `delete`.',
      ],
    },
    {
      type: 'code',
      title: 'Role: solo lectura de Pods en un namespace',
      code: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""]              # "" = core API group (pods, services, secrets...)
    resources: ["pods"]
    verbs: ["get", "list", "watch"]   # solo lectura — nada de create/delete

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-reader-clusterwide
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list"]        # peligroso a nivel cluster — usar con cuidado`,
    },
    {
      type: 'concepts',
      title: 'ServiceAccount y Bindings — el "quién" y la conexión',
      items: [
        '**ServiceAccount**: identidad para procesos que corren DENTRO del cluster (un Pod, un controller) — lo mismo que un "usuario de sistema" en Linux, pero para el API de Kubernetes. Todo Pod usa uno; si no especificás, usa el `default` del namespace.',
        'Kubernetes monta automáticamente un token del ServiceAccount en `/var/run/secrets/kubernetes.io/serviceaccount/token` dentro del Pod — así es como una app puede llamar al API server sin credenciales hardcodeadas, el mismo patrón que vimos con Secrets montados como archivo (nivel 19).',
        '**RoleBinding**: conecta un Role (o ClusterRole) con uno o más "sujetos" (usuarios, grupos, o ServiceAccounts) **dentro de un namespace**. Es el paso que realmente otorga el permiso.',
        '**ClusterRoleBinding**: igual, pero sin restricción de namespace — el sujeto obtiene esos permisos en TODO el cluster. Reservado para casos como operators o controllers que de verdad necesitan alcance global.',
        'Combinación clave: un ClusterRole + un RoleBinding en un namespace específico = permisos del ClusterRole PERO acotados a ese namespace. Es la forma recomendada de reutilizar roles sin dar acceso cluster-wide por accidente.',
      ],
    },
    {
      type: 'code',
      title: 'ServiceAccount dedicado + Binding acotado al namespace',
      code: `apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-app
  namespace: default

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-app-can-read-pods
  namespace: default
subjects:
  - kind: ServiceAccount
    name: web-app
    namespace: default
roleRef:
  kind: Role                 # también podría ser ClusterRole (acotado a este namespace)
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 2
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      serviceAccountName: web-app   # sin esto, usa "default" (más permisivo o vacío según el cluster)
      automountServiceAccountToken: true
      containers:
        - name: app
          image: mi-api:2.0`,
    },
    {
      type: 'diagram',
      title: 'De la identidad al permiso: las cuatro piezas de RBAC',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 560 300" role="img" aria-label="Un ServiceAccount se conecta a un Role mediante un RoleBinding; el Role define las reglas que finalmente autorizan la acción sobre un recurso">
    <defs>
      <marker id="arrow-23a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="30" y="30" width="150" height="60" rx="4" stroke="currentColor" fill="none"/>
    <text x="105" y="55" text-anchor="middle" font-size="12">ServiceAccount</text>
    <text x="105" y="72" text-anchor="middle" font-size="11">"quién" (identidad)</text>

    <rect class="dg-accent" x="220" y="30" width="150" height="60" rx="4" stroke="currentColor" fill="none"/>
    <text x="295" y="55" text-anchor="middle" font-size="12">RoleBinding</text>
    <text x="295" y="72" text-anchor="middle" font-size="11">conecta ambos</text>

    <rect x="410" y="30" width="130" height="60" rx="4" stroke="currentColor" fill="none"/>
    <text x="475" y="55" text-anchor="middle" font-size="12">Role</text>
    <text x="475" y="72" text-anchor="middle" font-size="11">"qué" (reglas)</text>

    <path d="M180,60 L220,60" stroke="currentColor" fill="none" marker-end="url(#arrow-23a)"/>
    <path d="M370,60 L410,60" stroke="currentColor" fill="none" marker-end="url(#arrow-23a)"/>

    <path d="M295,90 L295,150" stroke="currentColor" fill="none" marker-end="url(#arrow-23a)"/>

    <rect x="145" y="150" width="300" height="60" rx="4" stroke="currentColor" fill="none"/>
    <text x="295" y="175" text-anchor="middle" font-size="12">verbs: get, list, watch...</text>
    <text x="295" y="192" text-anchor="middle" font-size="11">resources: pods, secrets, deployments...</text>

    <path d="M295,210 L295,250" stroke="currentColor" fill="none" marker-end="url(#arrow-23a)"/>

    <rect x="170" y="250" width="250" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="295" y="275" text-anchor="middle" font-size="12">Acción autorizada (o denegada) sobre el API</text>
  </svg>
  <figcaption>Un ServiceAccount no tiene permisos por sí solo: un RoleBinding lo conecta con un Role que define las reglas, y recién ahí el API server autoriza (o no) cada request.</figcaption>
</figure>`,
    },
    {
      type: 'comparison',
      title: 'Role vs ClusterRole, RoleBinding vs ClusterRoleBinding',
      headers: ['Aspecto', 'Namespaced (Role / RoleBinding)', 'Cluster-wide (ClusterRole / ClusterRoleBinding)'],
      rows: [
        {
          feature: 'Alcance',
          a: 'Un único namespace',
          b: 'Todo el cluster (o recursos no-namespaced: nodes, PVs)',
        },
        {
          feature: 'Caso típico',
          a: 'Un Pod que solo necesita leer Secrets de SU namespace',
          b: 'Un operator que gestiona recursos en todos los namespaces',
        },
        {
          feature: 'Riesgo si se abusa',
          a: 'Contenido a ese namespace',
          b: 'Alto — compromiso potencial de todo el cluster',
        },
        {
          feature: 'Reutilización',
          a: 'No reutilizable entre namespaces directamente',
          b: 'Un ClusterRole + RoleBinding namespaced combina lo mejor de ambos',
        },
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: ServiceAccount con permisos mínimos',
      steps: [
        { cmd: 'kind create cluster --name rbac-lab', desc: 'Cluster nuevo.' },
        {
          cmd: 'kubectl create serviceaccount web-app',
          desc: 'ServiceAccount dedicado — no vamos a usar el "default" del namespace.',
        },
        {
          cmd: "cat > rbac.yaml << 'EOF'\napiVersion: rbac.authorization.k8s.io/v1\nkind: Role\nmetadata:\n  name: pod-reader\nrules:\n  - apiGroups: [\"\"]\n    resources: [\"pods\"]\n    verbs: [\"get\", \"list\", \"watch\"]\n---\napiVersion: rbac.authorization.k8s.io/v1\nkind: RoleBinding\nmetadata:\n  name: web-app-can-read-pods\nsubjects:\n  - kind: ServiceAccount\n    name: web-app\nroleRef:\n  kind: Role\n  name: pod-reader\n  apiGroup: rbac.authorization.k8s.io\nEOF\nkubectl apply -f rbac.yaml",
          desc: 'Role de solo-lectura de Pods + Binding que conecta el ServiceAccount con ese Role.',
        },
        {
          cmd: 'kubectl auth can-i list pods --as=system:serviceaccount:default:web-app',
          desc: 'Confirma el permiso otorgado: debería responder "yes".',
        },
        {
          cmd: 'kubectl auth can-i delete pods --as=system:serviceaccount:default:web-app\nkubectl auth can-i list secrets --as=system:serviceaccount:default:web-app',
          desc: 'Confirma que NO tiene permisos que nunca le diste — ambos deberían responder "no".',
        },
        {
          cmd: "kubectl run test-rbac --image=bitnami/kubectl --restart=Never --overrides='{\"spec\":{\"serviceAccountName\":\"web-app\"}}' -- get pods\nsleep 3\nkubectl logs test-rbac",
          desc: 'Un Pod usando ese ServiceAccount consulta el API en vivo — debería listar Pods sin error.',
        },
        {
          cmd: 'kubectl delete -f rbac.yaml\nkubectl delete pod test-rbac\nkubectl delete serviceaccount web-app\nkind delete cluster --name rbac-lab',
          desc: 'Limpieza.',
        },
      ],
    },
  ],
};

export default {
  id: 15,
  title: 'Introducción a Kubernetes',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Entender qué problema resuelve Kubernetes, su arquitectura de control plane y nodos, y correr el primer cluster local con kubectl.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tenés 30 microservicios corriendo en 15 servidores. Uno se cae a las 3 AM — ¿quién lo reinicia en otro servidor? Necesitás desplegar una nueva versión sin downtime — ¿cómo movés el tráfico del contenedor viejo al nuevo sin que nadie note el cambio? El Black Friday triplica el tráfico — ¿cómo agregás instancias automáticamente y las quitás cuando pasa el pico?

Con Compose, cada una de esas preguntas requiere un script manual, un cronjob casero o guardia humana. Kubernetes existe porque Google, con miles de máquinas y el sistema interno Borg, ya había resuelto este problema — y en 2014 lo liberó como proyecto open source.`,
    },
    {
      type: 'analogy',
      title: 'La analogía del aeropuerto',
      body: `Docker es el avión: empaqueta y transporta la carga (tu aplicación) de forma estandarizada. Pero un aeropuerto no es un avión — es torre de control, pistas, personal de tierra, meteorología. Decide qué avión despega, a qué pista, qué hacer si uno se avería en el aire, cómo redirigir vuelos si cierra una pista.

Kubernetes es el aeropuerto. No reemplaza a Docker (o a containerd) — los orquesta. Decide en qué nodo corre cada contenedor, lo reubica si el nodo falla, distribuye el tráfico entre las instancias sanas, y escala la flota según la demanda.`,
    },
    {
      type: 'diagram',
      title: 'Arquitectura de un cluster — control plane y nodos',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 900 650" role="img" aria-label="kubectl solo habla con kube-apiserver; el control plane reconcilia el estado y el apiserver instruye a los kubelets de cada nodo, que corren los Pods vía containerd">
    <defs>
      <marker id="arrow-15a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="150" y="30" font-size="11" text-anchor="middle">kubectl</text>
    <line x1="150" y1="38" x2="150" y2="68" stroke="currentColor" marker-end="url(#arrow-15a)"/>

    <rect x="40" y="70" width="820" height="190" fill="none" stroke="currentColor" rx="6"/>
    <text x="55" y="90" font-size="11">CONTROL PLANE</text>

    <rect class="dg-accent" x="70" y="100" width="170" height="60" fill="none" stroke="currentColor" rx="4"/>
    <text x="155" y="124" font-size="11" text-anchor="middle">kube-apiserver</text>
    <text x="155" y="140" font-size="10" text-anchor="middle">(única puerta)</text>

    <rect x="260" y="100" width="170" height="60" fill="none" stroke="currentColor" rx="4"/>
    <text x="345" y="124" font-size="11" text-anchor="middle">kube-scheduler</text>
    <text x="345" y="140" font-size="10" text-anchor="middle">(decide dónde)</text>

    <rect x="450" y="100" width="130" height="60" fill="none" stroke="currentColor" rx="4"/>
    <text x="515" y="134" font-size="11" text-anchor="middle">etcd</text>
    <text x="515" y="150" font-size="10" text-anchor="middle">(estado)</text>

    <rect x="600" y="100" width="240" height="60" fill="none" stroke="currentColor" rx="4"/>
    <text x="720" y="124" font-size="11" text-anchor="middle">cloud-controller-</text>
    <text x="720" y="140" font-size="11" text-anchor="middle">manager</text>

    <rect x="260" y="190" width="340" height="50" fill="none" stroke="currentColor" rx="4"/>
    <text x="430" y="211" font-size="11" text-anchor="middle">kube-controller-manager</text>
    <text x="430" y="227" font-size="10" text-anchor="middle">(reconcilia: estado real == deseado)</text>

    <line x1="300" y1="190" x2="155" y2="162" stroke="currentColor" marker-end="url(#arrow-15a)"/>
    <line x1="350" y1="190" x2="345" y2="162" stroke="currentColor" marker-end="url(#arrow-15a)"/>
    <line x1="400" y1="190" x2="515" y2="162" stroke="currentColor" marker-end="url(#arrow-15a)"/>

    <rect x="60" y="320" width="220" height="240" fill="none" stroke="currentColor" rx="6"/>
    <text x="170" y="340" font-size="11" text-anchor="middle">Nodo A</text>
    <rect x="80" y="350" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="170" y="373" font-size="10" text-anchor="middle">kubelet</text>
    <rect x="80" y="396" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="170" y="419" font-size="10" text-anchor="middle">kube-proxy</text>
    <rect x="80" y="442" width="180" height="94" fill="none" stroke="currentColor" rx="4"/>
    <text x="170" y="483" font-size="10" text-anchor="middle">Pods</text>
    <text x="170" y="499" font-size="10" text-anchor="middle">(containerd)</text>

    <rect x="340" y="320" width="220" height="240" fill="none" stroke="currentColor" rx="6"/>
    <text x="450" y="340" font-size="11" text-anchor="middle">Nodo B</text>
    <rect x="360" y="350" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="450" y="373" font-size="10" text-anchor="middle">kubelet</text>
    <rect x="360" y="396" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="450" y="419" font-size="10" text-anchor="middle">kube-proxy</text>
    <rect x="360" y="442" width="180" height="94" fill="none" stroke="currentColor" rx="4"/>
    <text x="450" y="483" font-size="10" text-anchor="middle">Pods</text>
    <text x="450" y="499" font-size="10" text-anchor="middle">(containerd)</text>

    <rect x="620" y="320" width="220" height="240" fill="none" stroke="currentColor" rx="6"/>
    <text x="730" y="340" font-size="11" text-anchor="middle">Nodo C</text>
    <rect x="640" y="350" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="730" y="373" font-size="10" text-anchor="middle">kubelet</text>
    <rect x="640" y="396" width="180" height="36" fill="none" stroke="currentColor" rx="4"/>
    <text x="730" y="419" font-size="10" text-anchor="middle">kube-proxy</text>
    <rect x="640" y="442" width="180" height="94" fill="none" stroke="currentColor" rx="4"/>
    <text x="730" y="483" font-size="10" text-anchor="middle">Pods</text>
    <text x="730" y="499" font-size="10" text-anchor="middle">(containerd)</text>

    <line x1="155" y1="260" x2="170" y2="348" stroke="currentColor" marker-end="url(#arrow-15a)"/>
    <line x1="430" y1="260" x2="450" y2="348" stroke="currentColor" marker-end="url(#arrow-15a)"/>
    <line x1="700" y1="260" x2="730" y2="348" stroke="currentColor" marker-end="url(#arrow-15a)"/>
  </svg>
  <figcaption>kubectl habla solo con el apiserver; el control plane reconcilia estado deseado vs. real y el apiserver instruye a los kubelets, que corren los Pods vía containerd en cada nodo.</figcaption>
</figure>`,
    },
    {
      type: 'concepts',
      title: 'Los componentes, uno por uno',
      items: [
        '**kube-apiserver**: la única puerta de entrada al cluster. Todo — `kubectl`, el scheduler, los kubelets — habla con él vía API REST/gRPC. Nada toca `etcd` directamente.',
        '**etcd**: base de datos clave-valor distribuida que guarda TODO el estado del cluster (qué Pods existen, en qué nodo, su configuración). Si se pierde sin backup, se pierde el cluster.',
        '**kube-scheduler**: decide en qué nodo corre cada Pod nuevo, según CPU/RAM disponible, afinidad, taints y tolerations. No ejecuta nada — solo decide y anota.',
        '**kube-controller-manager**: corre los bucles de reconciliación (Deployment, ReplicaSet, Node controller...). Su trabajo constante: comparar estado deseado vs. estado real y corregir la diferencia.',
        '**kubelet**: agente en cada nodo. Recibe instrucciones del apiserver y le dice al runtime de contenedores (containerd) qué correr, y reporta el estado de vuelta.',
        '**kube-proxy**: en cada nodo, mantiene las reglas de red (iptables/IPVS) que hacen funcionar los Services — el balanceo interno de tráfico entre Pods.',
        '**containerd**: el mismo runtime OCI que usa Docker por debajo. Kubernetes no corre contenedores directamente — delega en containerd/CRI-O vía la interfaz CRI.',
      ],
    },
    {
      type: 'concepts',
      title: 'El bucle de reconciliación — la idea central de K8s',
      body: `Todo en Kubernetes gira alrededor de un patrón: **declarás el estado deseado, el control plane lo hace realidad y lo mantiene así para siempre**. No le decís "creá 3 réplicas" como una orden puntual — le decís "quiero 3 réplicas" como una verdad permanente. Si una muere, el controller lo nota y crea otra, sin que nadie intervenga.`,
      items: [
        '**Observar**: el controller lee el estado actual del cluster desde el apiserver.',
        '**Comparar**: lo compara contra el estado deseado (lo que declaraste en el YAML).',
        '**Actuar**: si hay diferencia, ejecuta la acción mínima para corregirla — y vuelve a observar.',
        'Este bucle corre continuamente, para cada recurso, todo el tiempo. Es la razón por la que Kubernetes se "auto-repara".',
      ],
    },
    {
      type: 'comparison',
      title: 'De Compose a Kubernetes — el vocabulario cambia',
      headers: ['Concepto en Compose', 'Equivalente en Kubernetes', 'Diferencia clave'],
      rows: [
        {
          feature: '`services:`',
          a: 'Deployment + Service',
          b: 'K8s separa "qué corre" de "cómo se accede"',
        },
        {
          feature: '`docker compose up`',
          a: '`kubectl apply -f`',
          b: 'Declarativo en ambos, pero K8s reconcilia sin parar',
        },
        {
          feature: 'Contenedor',
          a: 'Pod (uno o más contenedores)',
          b: 'El Pod es la unidad mínima programable, no el contenedor',
        },
        {
          feature: 'Red del stack',
          a: 'Service + DNS del cluster',
          b: 'DNS interno resuelve por nombre de Service, no de contenedor',
        },
        {
          feature: '`restart: always`',
          a: 'Controlador del Deployment',
          b: 'Reconciliación activa, no solo reinicio local',
        },
        {
          feature: 'Un host',
          a: 'Un cluster (N nodos)',
          b: 'El scheduler decide el nodo; vos no elegís a mano',
        },
      ],
    },
    {
      type: 'code',
      title: 'Primer contacto: kubectl contra un cluster local',
      code: `# Cluster local con kind (Kubernetes in Docker) — corre nodos como contenedores
kind create cluster --name lab

# Alternativa equivalente: minikube start

# Ver los nodos del cluster (con kind, 1 nodo = 1 contenedor)
kubectl get nodes

# Ver info detallada del cluster y a qué apiserver estás hablando
kubectl cluster-info

# Correr el primer Pod imperativamente (para explorar, no para producción)
kubectl run nginx-test --image=nginx:alpine

# Ver el Pod: nodo asignado, IP interna, estado
kubectl get pods -o wide

# Logs del Pod, como docker logs
kubectl logs nginx-test

# Entrar al Pod, como docker exec
kubectl exec -it nginx-test -- sh

# Limpieza
kubectl delete pod nginx-test
kind delete cluster --name lab`,
    },
    {
      type: 'lab',
      title: 'Laboratorio: Primer cluster y primer Pod declarativo',
      steps: [
        {
          cmd: 'kind create cluster --name intro-k8s',
          desc: 'Crea un cluster de un nodo usando Docker como backend. Tarda ~1 minuto la primera vez (descarga la imagen del nodo).',
        },
        {
          cmd: 'kubectl get nodes -o wide',
          desc: 'Un solo nodo, rol control-plane. En un cluster real esto tendría varios nodos worker separados.',
        },
        {
          cmd: "cat > pod-nginx.yaml << 'EOF'\napiVersion: v1\nkind: Pod\nmetadata:\n  name: web\n  labels:\n    app: web\nspec:\n  containers:\n    - name: nginx\n      image: nginx:alpine\n      ports:\n        - containerPort: 80\nEOF\nkubectl apply -f pod-nginx.yaml",
          desc: 'Primer manifiesto declarativo: describe el Pod deseado, no un comando imperativo.',
        },
        {
          cmd: 'kubectl get pods -w',
          desc: 'Observa el Pod pasar de Pending a ContainerCreating a Running en tiempo real (Ctrl+C para salir).',
        },
        {
          cmd: 'kubectl describe pod web',
          desc: 'Muestra eventos del scheduler: a qué nodo fue asignado y por qué — clave para diagnosticar Pods que no arrancan.',
        },
        {
          cmd: 'kubectl port-forward pod/web 8080:80 &\ncurl localhost:8080\nkill %1',
          desc: 'Sin Service todavía: port-forward directo al Pod para probar que nginx responde.',
        },
        {
          cmd: 'kubectl delete -f pod-nginx.yaml\nkind delete cluster --name intro-k8s',
          desc: 'Limpieza: borra el Pod y destruye el cluster completo.',
        },
      ],
    },
  ],
};

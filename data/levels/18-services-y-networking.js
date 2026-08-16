export default {
  id: 18,
  title: 'Services y networking',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Entender por qué los Pods necesitan un Service para ser accedidos de forma estable, los cuatro tipos de Service y cómo funciona el DNS interno del cluster.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Cada Pod tiene una IP propia — pero esa IP es efímera. Si un Pod muere y el Deployment crea otro, la IP cambia. Si tenés 5 réplicas de un backend, ¿a cuál IP le hablás desde el frontend? ¿Y cómo reparte el tráfico entre las 5 sin que cada cliente tenga que saber cuántas hay?

Necesitás una dirección **estable** que apunte siempre a "el backend", sin importar cuántos Pods haya ni cuáles murieron y fueron reemplazados.`,
    },
    {
      type: 'concepts',
      title: 'Service — IP estable + balanceo + descubrimiento',
      items: [
        'Un Service es un recurso con **IP virtual fija** (ClusterIP) que enruta tráfico hacia los Pods que matchean su `selector` — el mismo mecanismo de labels que ReplicaSet.',
        '`kube-proxy` en cada nodo mantiene las reglas (iptables o IPVS) que hacen que tráfico a esa IP virtual se reparta entre los Pods reales, sin que el cliente lo note.',
        'El Service **no es un proceso ni un Pod** — es una entrada de configuración de red distribuida entre los nodos vía kube-proxy.',
        'Cuando un Pod detrás de un Service muere y otro lo reemplaza, el Service actualiza su lista de destinos automáticamente (vía Endpoints/EndpointSlices) — el cliente nunca se entera del cambio.',
      ],
    },
    {
      type: 'diagram',
      title: 'Cómo el Service encuentra a los Pods correctos',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 640 340" role="img" aria-label="El cliente habla siempre al ClusterIP fijo del Service, que kube-proxy enruta según la lista de Endpoints hacia uno de los Pods reales por round-robin">
    <defs>
      <marker id="arrow-18a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="220" y="16" width="200" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="40" text-anchor="middle" font-size="12">Cliente (dentro del cluster)</text>

    <path d="M320,56 L320,86" stroke="currentColor" fill="none" marker-end="url(#arrow-18a)"/>
    <rect x="248" y="64" width="144" height="14" fill="#0a0d16"/>
    <text x="320" y="75" text-anchor="middle" font-size="11">http://backend-svc:80</text>

    <rect class="dg-accent" x="200" y="90" width="240" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="110" text-anchor="middle" font-size="12">Service backend-svc</text>
    <text x="320" y="128" text-anchor="middle" font-size="11">ClusterIP 10.96.14.20</text>

    <path d="M320,140 L320,168" stroke="currentColor" fill="none" marker-end="url(#arrow-18a)"/>
    <rect x="256" y="147" width="128" height="14" fill="#0a0d16"/>
    <text x="320" y="158" text-anchor="middle" font-size="11">kube-proxy enruta</text>

    <rect x="120" y="170" width="400" height="70" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="186" text-anchor="middle" font-size="12">Endpoints / EndpointSlice</text>
    <text x="320" y="200" text-anchor="middle" font-size="10.5">10.244.1.5:8000 (backend-abc12)</text>
    <text x="320" y="213" text-anchor="middle" font-size="10.5">10.244.2.9:8000 (backend-def34)</text>
    <text x="320" y="226" text-anchor="middle" font-size="10.5">10.244.3.2:8000 (backend-ghi56)</text>

    <path d="M130,240 L130,270" stroke="currentColor" fill="none" marker-end="url(#arrow-18a)"/>
    <path d="M320,240 L320,270" stroke="currentColor" fill="none" marker-end="url(#arrow-18a)"/>
    <path d="M510,240 L510,270" stroke="currentColor" fill="none" marker-end="url(#arrow-18a)"/>
    <rect x="270" y="250" width="100" height="14" fill="#0a0d16"/>
    <text x="320" y="261" text-anchor="middle" font-size="11">round-robin</text>

    <rect x="45" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="130" y="292" text-anchor="middle" font-size="12">Pod backend-abc12</text>
    <text x="130" y="308" text-anchor="middle" font-size="11">10.244.1.5:8000</text>

    <rect x="235" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="320" y="292" text-anchor="middle" font-size="12">Pod backend-def34</text>
    <text x="320" y="308" text-anchor="middle" font-size="11">10.244.2.9:8000</text>

    <rect x="425" y="270" width="170" height="50" rx="4" stroke="currentColor" fill="none"/>
    <text x="510" y="292" text-anchor="middle" font-size="12">Pod backend-ghi56</text>
    <text x="510" y="308" text-anchor="middle" font-size="11">10.244.3.2:8000</text>
  </svg>
  <figcaption>El cliente siempre habla al ClusterIP fijo del Service; kube-proxy usa la lista de Endpoints para enrutar cada conexión a uno de los 3 Pods reales por round-robin, sin que el cliente vea sus IPs.</figcaption>
</figure>`,
    },
    {
      type: 'comparison',
      title: 'Los 4 tipos de Service',
      headers: ['Tipo', 'Alcance', 'Caso de uso'],
      rows: [
        {
          feature: 'ClusterIP (default)',
          a: 'Solo dentro del cluster',
          b: 'Comunicación interna entre microservicios',
        },
        {
          feature: 'NodePort',
          a: 'IP de cualquier nodo + puerto fijo (30000-32767)',
          b: 'Acceso externo simple, dev/testing',
        },
        {
          feature: 'LoadBalancer',
          a: 'IP pública provista por el cloud provider',
          b: 'Producción en AWS/GCP/Azure — crea un LB externo real',
        },
        {
          feature: 'ExternalName',
          a: 'Alias DNS a un servicio fuera del cluster',
          b: 'Apuntar a una DB externa por nombre, sin proxy real',
        },
      ],
    },
    {
      type: 'code',
      title: 'Service ClusterIP — el caso más común',
      code: `apiVersion: v1
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP            # default — no hace falta declararlo
  selector:
    app: backend             # mismo mecanismo que ReplicaSet: matchea por label
  ports:
    - port: 80                # puerto que expone el Service
      targetPort: 8000         # puerto real donde escucha el contenedor
      protocol: TCP

---
apiVersion: v1
kind: Service
metadata:
  name: backend-svc-external
spec:
  type: NodePort
  selector:
    app: backend
  ports:
    - port: 80
      targetPort: 8000
      nodePort: 30080          # opcional: si no se especifica, K8s asigna uno`,
    },
    {
      type: 'concepts',
      title: 'DNS interno del cluster — cómo se llaman los servicios entre sí',
      items: [
        'CoreDNS corre como Pods dentro del cluster y resuelve nombres de Service automáticamente — nadie configura esto a mano.',
        'Desde cualquier Pod, `http://backend-svc` resuelve al ClusterIP del Service `backend-svc` **si están en el mismo namespace**.',
        'Entre namespaces, el nombre completo es `<service>.<namespace>.svc.cluster.local` — por ejemplo `backend-svc.produccion.svc.cluster.local`.',
        'Esto reemplaza directamente lo que hacía Compose con el nombre del servicio en su red interna — misma idea, implementación distinta y con balanceo real de por medio.',
      ],
    },
    {
      type: 'code',
      title: 'Probar el DNS interno desde un Pod',
      code: `# Desde cualquier Pod del mismo namespace
kubectl run debug --rm -it --image=busybox -- sh
# dentro del Pod:
nslookup backend-svc
wget -qO- http://backend-svc/health

# Desde otro namespace, nombre completo:
nslookup backend-svc.produccion.svc.cluster.local`,
    },
    {
      type: 'lab',
      title: 'Laboratorio: Deployment + Service, balanceo real',
      steps: [
        { cmd: 'kind create cluster --name svc-lab', desc: 'Cluster nuevo.' },
        {
          cmd: "cat > app.yaml << 'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: backend\nspec:\n  replicas: 3\n  selector:\n    matchLabels: { app: backend }\n  template:\n    metadata:\n      labels: { app: backend }\n    spec:\n      containers:\n        - name: whoami\n          image: traefik/whoami\n          ports: [{ containerPort: 80 }]\n---\napiVersion: v1\nkind: Service\nmetadata:\n  name: backend-svc\nspec:\n  selector: { app: backend }\n  ports:\n    - port: 80\n      targetPort: 80\nEOF\nkubectl apply -f app.yaml\nkubectl rollout status deployment/backend",
          desc: 'whoami responde con el hostname del Pod que atendió — perfecto para ver el balanceo.',
        },
        {
          cmd: 'kubectl get endpoints backend-svc',
          desc: 'Muestra las 3 IPs de Pods reales detrás del Service.',
        },
        {
          cmd: "kubectl run curler --rm -it --image=busybox --restart=Never -- sh -c 'for i in $(seq 1 6); do wget -qO- http://backend-svc | grep Hostname; done'",
          desc: '6 requests reparten entre los 3 Pods — se ven distintos hostnames rotando.',
        },
        { cmd: 'kubectl delete -f app.yaml\nkind delete cluster --name svc-lab', desc: 'Limpieza.' },
      ],
    },
  ],
};

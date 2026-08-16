export default {
  id: 17,
  title: 'Deployments — rolling updates y rollback',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Usar Deployment para versionar aplicaciones sin downtime: rolling updates controlados, rollback instantáneo y estrategias de despliegue.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tenés un ReplicaSet con 5 Pods corriendo la versión 1.0 de tu app. Necesitás desplegar la 1.1. Si borrás el ReplicaSet y creás uno nuevo, los 5 Pods viejos mueren antes de que los nuevos estén listos — downtime total durante el cambio.

Y si la 1.1 tiene un bug crítico que solo aparece en producción, ¿cómo volvés a la 1.0 en segundos, sin reconstruir nada?`,
    },
    {
      type: 'analogy',
      title: 'La analogía de la cinta transportadora',
      body: `Cambiar de ReplicaSet a mano es apagar toda la línea de producción, retirar las piezas viejas y encender de nuevo con las nuevas — parás todo.

Un Deployment es una cinta transportadora que reemplaza piezas una por una mientras la línea sigue funcionando: retira una pieza vieja, coloca una nueva, espera a que esté lista, y solo entonces retira la siguiente. En todo momento hay piezas trabajando.`,
    },
    {
      type: 'code',
      title: 'Deployment — el manifiesto',
      code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 5
  revisionHistoryLimit: 5      # cuántas versiones anteriores recordar para rollback
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1          # cuántos Pods pueden faltar durante el update
      maxSurge: 1                # cuántos Pods extra se permiten temporalmente
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.25-alpine   # el campo que cambia en cada release
          ports:
            - containerPort: 80
          readinessProbe:            # sin esto, el rollout no sabe cuándo un Pod está listo
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 3
            periodSeconds: 5`,
    },
    {
      type: 'diagram',
      title: 'Rolling update paso a paso — maxUnavailable:1, maxSurge:1',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 660 440" role="img" aria-label="El rolling update reemplaza los 5 Pods v1.0 por v1.1 de a uno, creando un Pod extra antes de retirar uno viejo, sin bajar nunca de 4 Pods activos">
    <defs>
      <marker id="arrow-17a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <text x="330" y="30" text-anchor="middle" font-size="11">Inicial — 5× v1.0</text>
    <rect x="22" y="36" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="70" y="60" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="126" y="36" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="174" y="60" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="230" y="36" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="278" y="60" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="334" y="36" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="382" y="60" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="438" y="36" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="486" y="60" text-anchor="middle" font-size="12">v1.0</text>

    <path d="M330,76 L330,116" stroke="currentColor" fill="none" marker-end="url(#arrow-17a)"/>

    <text x="330" y="110" text-anchor="middle" font-size="11">Paso 1 — maxSurge: crea 1 v1.1</text>
    <rect x="22" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="70" y="140" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="126" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="174" y="140" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="230" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="278" y="140" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="334" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="382" y="140" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="438" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="486" y="140" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="542" y="116" width="95" height="40" rx="4" stroke="currentColor" fill="none" stroke-dasharray="4 3"/>
    <text x="590" y="134" text-anchor="middle" font-size="10">v1.1</text>
    <text x="590" y="148" text-anchor="middle" font-size="10">creando</text>

    <path d="M330,156 L330,196" stroke="currentColor" fill="none" marker-end="url(#arrow-17a)"/>

    <text x="330" y="190" text-anchor="middle" font-size="11">Paso 2 — readiness OK → retira 1 (maxUnavailable)</text>
    <rect x="22" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="70" y="220" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="126" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="174" y="220" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="230" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="278" y="220" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="334" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="382" y="220" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="438" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none" stroke-dasharray="4 3"/>
    <text x="486" y="220" text-anchor="middle" font-size="10">✗ retirado</text>
    <rect x="542" y="196" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="590" y="220" text-anchor="middle" font-size="12">v1.1</text>

    <path d="M330,236 L330,276" stroke="currentColor" fill="none" marker-end="url(#arrow-17a)"/>

    <text x="330" y="270" text-anchor="middle" font-size="11">Paso 3 — repite: crea, espera, retira</text>
    <rect x="22" y="276" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="70" y="300" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="126" y="276" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="174" y="300" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="230" y="276" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="278" y="300" text-anchor="middle" font-size="12">v1.0</text>
    <rect x="334" y="276" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="382" y="300" text-anchor="middle" font-size="12">v1.1</text>
    <rect x="438" y="276" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="486" y="300" text-anchor="middle" font-size="12">v1.1</text>

    <path d="M330,316 L330,356" stroke="currentColor" fill="none" marker-end="url(#arrow-17a)"/>

    <text x="330" y="350" text-anchor="middle" font-size="11">Completado — 5× v1.1, sin downtime</text>
    <rect class="dg-accent" x="16" y="350" width="523" height="52" rx="4" stroke="currentColor" fill="none"/>
    <rect x="22" y="356" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="70" y="380" text-anchor="middle" font-size="12">v1.1</text>
    <rect x="126" y="356" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="174" y="380" text-anchor="middle" font-size="12">v1.1</text>
    <rect x="230" y="356" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="278" y="380" text-anchor="middle" font-size="12">v1.1</text>
    <rect x="334" y="356" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="382" y="380" text-anchor="middle" font-size="12">v1.1</text>
    <rect x="438" y="356" width="95" height="40" rx="4" stroke="currentColor" fill="none"/>
    <text x="486" y="380" text-anchor="middle" font-size="12">v1.1</text>

    <text x="330" y="418" text-anchor="middle" font-size="11">Nunca menos de 4 Pods activos · si el readinessProbe falla, el rollout se pausa solo</text>
  </svg>
  <figcaption>El rolling update reemplaza los 5 Pods de a uno —crea un extra por maxSurge, luego retira uno viejo por maxUnavailable— sin bajar nunca de 4 Pods sirviendo tráfico.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'Comandos de rollout — el ciclo completo',
      code: `# Aplicar el manifiesto inicial
kubectl apply -f deployment.yaml

# Ver el estado del rollout en vivo (bloquea hasta terminar)
kubectl rollout status deployment/web

# Cambiar la versión de la imagen — dispara el rolling update
kubectl set image deployment/web nginx=nginx:1.26-alpine

# Ver el historial de revisiones
kubectl rollout history deployment/web

# Ver el detalle de una revisión específica
kubectl rollout history deployment/web --revision=2

# Algo salió mal: volver a la revisión anterior INMEDIATAMENTE
kubectl rollout undo deployment/web

# Volver a una revisión específica (no solo la anterior)
kubectl rollout undo deployment/web --to-revision=1

# Pausar un rollout a mitad de camino (para investigar antes de continuar)
kubectl rollout pause deployment/web
kubectl rollout resume deployment/web

# Escalar el Deployment (afecta al ReplicaSet activo)
kubectl scale deployment/web --replicas=8`,
    },
    {
      type: 'concepts',
      title: 'Cómo Deployment usa ReplicaSet por debajo',
      items: [
        'Un Deployment nunca gestiona Pods directamente: crea y gestiona **ReplicaSets**, y cada ReplicaSet gestiona sus Pods — dos capas de indirección.',
        'Cada vez que cambiás la plantilla del Pod (imagen, env vars, etc.), el Deployment crea un **ReplicaSet nuevo** con 0 réplicas y empieza a subirlas mientras baja las del ReplicaSet viejo.',
        'El ReplicaSet viejo NO se borra — queda en 0 réplicas, guardado como historial. Por eso `rollout undo` es instantáneo: solo tiene que subir las réplicas del ReplicaSet anterior, no reconstruir nada.',
        '`kubectl get replicasets -l app=web` muestra esta historia: varios ReplicaSets, solo uno con réplicas > 0.',
        '`revisionHistoryLimit` controla cuántos ReplicaSets viejos se conservan — cada uno consume algo de memoria en etcd aunque tenga 0 Pods.',
      ],
    },
    {
      type: 'concepts',
      title: 'Estrategias de despliegue más allá de RollingUpdate',
      items: [
        '**Recreate**: borra todos los Pods viejos antes de crear los nuevos. Con downtime garantizado, pero simple — útil cuando la app no soporta dos versiones corriendo a la vez (migraciones de esquema incompatibles).',
        '**Blue-Green**: dos Deployments completos (blue=actual, green=nuevo) y un Service que apunta a uno u otro. El corte es instantáneo y el rollback también — pero duplica el uso de recursos mientras ambos coexisten.',
        '**Canary**: el nuevo Deployment recibe solo un porcentaje del tráfico (vía pesos en el Service o un Ingress/service mesh) mientras se valida en producción real con usuarios reales, antes de subirlo al 100%.',
        'Kubernetes nativo solo trae `RollingUpdate` y `Recreate`. Blue-Green y Canary reales requieren herramientas adicionales (Argo Rollouts, Flagger) o un service mesh.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Rolling update, rollback y una versión rota',
      steps: [
        { cmd: 'kind create cluster --name deploy-lab', desc: 'Cluster nuevo.' },
        {
          cmd: "cat > deploy.yaml << 'EOF'\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: web\nspec:\n  replicas: 4\n  strategy:\n    rollingUpdate:\n      maxUnavailable: 1\n      maxSurge: 1\n  selector:\n    matchLabels:\n      app: web\n  template:\n    metadata:\n      labels:\n        app: web\n    spec:\n      containers:\n        - name: nginx\n          image: nginx:1.25-alpine\n          readinessProbe:\n            httpGet: { path: /, port: 80 }\n            periodSeconds: 3\nEOF\nkubectl apply -f deploy.yaml\nkubectl rollout status deployment/web",
          desc: 'Despliega la v1.25 y espera a que las 4 réplicas estén listas.',
        },
        {
          cmd: 'kubectl set image deployment/web nginx=nginx:1.26-alpine\nkubectl rollout status deployment/web',
          desc: 'Dispara el rolling update a 1.26 — observá cómo nunca caen todos los Pods a la vez.',
        },
        {
          cmd: 'kubectl get replicasets -l app=web',
          desc: 'Dos ReplicaSets: el de 1.25 en 0 réplicas, el de 1.26 en 4 — la historia queda visible.',
        },
        {
          cmd: "kubectl set image deployment/web nginx=nginx:no-existe-esta-tag\nkubectl rollout status deployment/web --timeout=20s || echo 'Rollout atascado (esperado)'",
          desc: 'Simula un deploy roto: la imagen no existe, los Pods nuevos no pueden arrancar.',
        },
        {
          cmd: 'kubectl get pods -l app=web',
          desc: 'Los Pods viejos (1.26 bueno) siguen sirviendo — el rollout no completó, no rompió lo que ya andaba.',
        },
        {
          cmd: 'kubectl rollout undo deployment/web\nkubectl rollout status deployment/web',
          desc: 'Rollback instantáneo a la última revisión sana.',
        },
        { cmd: 'kubectl delete -f deploy.yaml\nkind delete cluster --name deploy-lab', desc: 'Limpieza.' },
      ],
    },
  ],
};

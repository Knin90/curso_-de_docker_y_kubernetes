export default {
  id: 20,
  title: 'Almacenamiento persistente',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Entender por qué los Pods no pueden guardar datos por sí mismos, y cómo Volumes, PersistentVolumes, PersistentVolumeClaims y StorageClass resuelven el almacenamiento en un cluster.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tu base de datos corre en un Pod. El Pod muere (nodo caído, OOM, rolling update) y el Deployment crea otro — en OTRO nodo, posiblemente. Todo lo que la base de datos escribió en el filesystem del contenedor viejo se perdió: el filesystem de un contenedor es efímero por diseño.

Necesitás que los datos sobrevivan al Pod, sobrevivan a que el Pod se mueva de nodo, y que la app no tenga que saber en qué disco físico ni en qué nodo están guardados.`,
    },
    {
      type: 'concepts',
      title: 'Volumes — el volumen efímero más simple: emptyDir',
      items: [
        'Un `emptyDir` es almacenamiento que vive **mientras el Pod existe**: útil para compartir archivos entre contenedores del mismo Pod (como el sidecar del nivel 16), o cachés temporales.',
        'Si el Pod muere y se recrea, el `emptyDir` empieza vacío de nuevo — no es persistencia real, es solo un directorio compartido con ciclo de vida atado al Pod.',
        'Otros volúmenes de nodo (`hostPath`) atan el Pod al disco de UN nodo específico — rompen la portabilidad del scheduler y casi nunca son la respuesta correcta en producción.',
        'Para datos que deben sobrevivir al Pod y no estar atados a un nodo, Kubernetes separa el problema en dos capas: **PersistentVolume** (el almacenamiento real) y **PersistentVolumeClaim** (el pedido que hace un Pod).',
      ],
    },
    {
      type: 'diagram',
      title: 'PV y PVC — dos capas, como Service/Endpoints',
      diagram: `<figure class="diagram-figure">
  <svg viewBox="0 0 560 340" role="img" aria-label="El Pod referencia un PersistentVolumeClaim, que actúa como capa de indirección y se bindea 1 a 1 con un PersistentVolume real, sin que el Pod sepa qué disco físico hay detrás">
    <defs>
      <marker id="arrow-20a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="currentColor"/>
      </marker>
    </defs>

    <rect x="50" y="20" width="460" height="70" rx="4" stroke="currentColor" fill="none"/>
    <text x="280" y="38" text-anchor="middle" font-size="12">PersistentVolume (PV)</text>
    <text x="280" y="54" text-anchor="middle" font-size="11">10Gi · ReadWriteOnce · disco real (EBS/GCE PD/NFS/local)</text>
    <text x="280" y="70" text-anchor="middle" font-size="11">existe independiente de cualquier Pod</text>

    <path d="M280,140 L280,90" stroke="currentColor" fill="none" marker-end="url(#arrow-20a)"/>
    <rect x="215" y="107" width="130" height="14" fill="#0a0d16"/>
    <text x="280" y="118" text-anchor="middle" font-size="11">binding 1:1</text>

    <rect class="dg-accent" x="50" y="140" width="460" height="70" rx="4" stroke="currentColor" fill="none"/>
    <text x="280" y="158" text-anchor="middle" font-size="12">PersistentVolumeClaim (PVC)</text>
    <text x="280" y="174" text-anchor="middle" font-size="11">"10Gi, ReadWriteOnce" — declarado por el dev</text>
    <text x="280" y="190" text-anchor="middle" font-size="11">no sabe qué disco real hay detrás</text>

    <path d="M280,260 L280,210" stroke="currentColor" fill="none" marker-end="url(#arrow-20a)"/>
    <rect x="180" y="227" width="200" height="14" fill="#0a0d16"/>
    <text x="280" y="238" text-anchor="middle" font-size="11">referenciado en volumes:</text>

    <rect x="50" y="260" width="460" height="60" rx="4" stroke="currentColor" fill="none"/>
    <text x="280" y="282" text-anchor="middle" font-size="12">Pod / Deployment</text>
    <text x="280" y="300" text-anchor="middle" font-size="11">monta el PVC como si fuera una carpeta</text>
  </svg>
  <figcaption>El Pod monta un PersistentVolumeClaim sin saber qué disco hay detrás; el PVC se bindea 1 a 1 con un PersistentVolume real, la misma capa de indirección que un Service aplica sobre los Pods.</figcaption>
</figure>`,
    },
    {
      type: 'code',
      title: 'PersistentVolumeClaim + montaje en un Deployment',
      code: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce        # un solo nodo a la vez puede montarlo en lectura/escritura
  resources:
    requests:
      storage: 10Gi
  storageClassName: standard   # qué "tipo" de disco (ver StorageClass abajo)

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
spec:
  replicas: 1              # bases de datos con RWO casi siempre van con 1 réplica
  selector: { matchLabels: { app: postgres } }
  template:
    metadata: { labels: { app: postgres } }
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          env:
            - name: POSTGRES_PASSWORD
              valueFrom: { secretKeyRef: { name: db-credentials, key: password } }
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: postgres-pvc     # el Pod ni sabe qué disco hay detrás`,
    },
    {
      type: 'concepts',
      title: 'StorageClass — aprovisionamiento dinámico',
      items: [
        'Sin StorageClass, un administrador tendría que crear PVs a mano, uno por uno, anticipando cuánta gente los va a necesitar — no escala.',
        'Una **StorageClass** define un `provisioner` (el driver del proveedor de nube o del storage on-prem) que crea el PV automáticamente cuando aparece un PVC que la referencia.',
        'En clusters administrados (EKS, GKE, AKS) siempre hay una StorageClass `default` — por eso muchos PVC ni siquiera declaran `storageClassName` explícitamente.',
        '`reclaimPolicy: Delete` (default en la mayoría de provisioners) borra el disco real cuando se borra el PVC — `Retain` lo conserva para recuperación manual. Verificarlo antes de borrar un PVC de producción.',
        '`volumeBindingMode: WaitForFirstConsumer` demora la creación del disco hasta que un Pod realmente lo necesite — evita crear el volumen en una zona de disponibilidad distinta a donde termina programado el Pod.',
      ],
    },
    {
      type: 'code',
      title: 'StorageClass — ejemplo (proveedor cloud genérico)',
      code: `apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: ebs.csi.aws.com        # varía según el proveedor (GCE, Azure, etc.)
parameters:
  type: gp3
  iops: "3000"
reclaimPolicy: Delete
volumeBindingMode: WaitForFirstConsumer
allowVolumeExpansion: true          # permite ampliar el PVC sin recrear el volumen`,
    },
    {
      type: 'comparison',
      title: 'Access Modes — quién puede montar el mismo volumen',
      headers: ['Modo', 'Significado', 'Caso de uso típico'],
      rows: [
        {
          feature: 'ReadWriteOnce (RWO)',
          a: 'Un solo nodo, lectura y escritura',
          b: 'Bases de datos — Postgres, MySQL',
        },
        {
          feature: 'ReadOnlyMany (ROX)',
          a: 'Múltiples nodos, solo lectura',
          b: 'Assets estáticos compartidos, configs',
        },
        {
          feature: 'ReadWriteMany (RWX)',
          a: 'Múltiples nodos, lectura y escritura',
          b: 'NFS/EFS compartido entre réplicas — no todo storage lo soporta',
        },
        {
          feature: 'ReadWriteOncePod',
          a: 'Un solo POD (más estricto que RWO)',
          b: 'Garantiza exclusividad total, evita el caso raro de 2 Pods en el mismo nodo montando RWO',
        },
      ],
    },
    {
      type: 'history',
      title: 'Errores comunes con almacenamiento',
      items: [
        'Escalar un Deployment con PVC en RWO a `replicas: 3` no reparte el disco entre las 3 — falla, porque solo un nodo puede montarlo. Para eso existe StatefulSet (no visto en este curso), que da un PVC por réplica.',
        'Borrar un PVC sin verificar `reclaimPolicy` puede borrar el disco real irreversiblemente — chequear siempre antes en un entorno de producción.',
        'Un PVC en estado `Pending` casi siempre significa: no hay StorageClass default, o `WaitForFirstConsumer` está esperando a que exista un Pod que lo consuma.',
        'Redimensionar (`kubectl edit pvc` con más `storage`) solo funciona si la StorageClass tiene `allowVolumeExpansion: true` — y algunos filesystems requieren reiniciar el Pod para ver el nuevo tamaño.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Postgres con datos que sobreviven a un Pod muerto',
      steps: [
        {
          cmd: 'kind create cluster --name storage-lab',
          desc: "kind trae una StorageClass 'standard' local por defecto — suficiente para el lab.",
        },
        {
          cmd: 'kubectl create secret generic db-credentials --from-literal=password=secret123',
          desc: 'Credencial de la DB, separada del resto (nivel 19).',
        },
        {
          cmd: "cat > pg.yaml << 'EOF'\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata:\n  name: postgres-pvc\nspec:\n  accessModes: [ReadWriteOnce]\n  resources: { requests: { storage: 1Gi } }\n---\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: postgres\nspec:\n  replicas: 1\n  selector: { matchLabels: { app: postgres } }\n  template:\n    metadata: { labels: { app: postgres } }\n    spec:\n      containers:\n        - name: postgres\n          image: postgres:16-alpine\n          env:\n            - name: POSTGRES_PASSWORD\n              valueFrom: { secretKeyRef: { name: db-credentials, key: password } }\n          volumeMounts:\n            - { name: data, mountPath: /var/lib/postgresql/data }\n      volumes:\n        - name: data\n          persistentVolumeClaim: { claimName: postgres-pvc }\nEOF\nkubectl apply -f pg.yaml\nkubectl rollout status deployment/postgres",
          desc: 'Postgres con PVC de 1Gi.',
        },
        {
          cmd: 'kubectl exec deploy/postgres -- psql -U postgres -c "CREATE TABLE prueba (id int); INSERT INTO prueba VALUES (42);"',
          desc: 'Escribe un dato de prueba dentro del contenedor.',
        },
        {
          cmd: 'kubectl delete pod -l app=postgres\nkubectl rollout status deployment/postgres',
          desc: 'Mata el Pod a propósito — el Deployment crea uno nuevo.',
        },
        {
          cmd: 'kubectl exec deploy/postgres -- psql -U postgres -c "SELECT * FROM prueba;"',
          desc: 'El dato sigue ahí: el Pod es nuevo, el disco (PVC) es el mismo de siempre.',
        },
        { cmd: 'kubectl get pv,pvc', desc: "Muestra el PV real detrás del PVC, y su estado 'Bound'." },
        { cmd: 'kubectl delete -f pg.yaml\nkind delete cluster --name storage-lab', desc: 'Limpieza.' },
      ],
    },
  ],
};

export default {
  id: 19,
  title: 'ConfigMaps y Secrets',
  etapa: 'k8s',
  etapaLabel: 'Etapa III — Kubernetes',
  objetivo:
    'Externalizar configuración y credenciales de las imágenes: ConfigMaps para datos no sensibles, Secrets para los que sí, y las formas de montarlos como variables de entorno o archivos.',
  sections: [
    {
      type: 'problem',
      title: 'El problema',
      body: `Tu Deployment de nginx necesita 5 variables de entorno distintas en dev, staging y producción. Hornear esos valores dentro de la imagen significa reconstruir la imagen por cada entorno — exactamente lo que Docker prometía evitar.

Y peor: una contraseña de base de datos NO puede vivir en el YAML del Deployment en texto plano dentro de un repositorio Git. Necesitás separar "qué corre" de "con qué configuración" y de "con qué credenciales" — tres cosas distintas con requisitos de seguridad distintos.`,
    },
    {
      type: 'concepts',
      title: 'ConfigMap — configuración no sensible',
      items: [
        'Un ConfigMap guarda pares clave-valor (o archivos completos) que **no son secretos**: URLs, flags de features, nombres de host, archivos de configuración de una app.',
        'Se referencia desde un Pod de dos formas: como variables de entorno, o como archivos montados en un volumen — la misma dualidad que Secret.',
        'Cambiar un ConfigMap **no reinicia los Pods automáticamente**. Si está montado como volumen, el archivo se actualiza solo (con demora de sincronización); si está como env var, el Pod necesita recrearse para verlo.',
        'Es el equivalente directo del archivo `.env` de Compose, pero como recurso de Kubernetes: versionable, con su propio ciclo de vida, referenciable desde múltiples Pods.',
      ],
    },
    {
      type: 'code',
      title: 'ConfigMap — manifiesto y las dos formas de consumirlo',
      code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  LOG_LEVEL: "info"
  MAX_CONNECTIONS: "100"
  nginx.conf: |                    # también puede guardar archivos completos
    server {
      listen 80;
      location /health { return 200 'ok'; }
    }

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
      containers:
        - name: app
          image: mi-app:1.0
          env:
            - name: APP_ENV                        # variable individual
              valueFrom:
                configMapKeyRef: { name: app-config, key: APP_ENV }
          envFrom:
            - configMapRef: { name: app-config }    # TODAS las claves como env vars
          volumeMounts:
            - name: nginx-conf
              mountPath: /etc/nginx/conf.d          # como archivo montado
      volumes:
        - name: nginx-conf
          configMap:
            name: app-config
            items:
              - key: nginx.conf
                path: default.conf`,
    },
    {
      type: 'concepts',
      title: 'Secret — lo mismo, pero para datos sensibles',
      items: [
        'Un Secret tiene la MISMA forma que un ConfigMap (`data` de clave-valor, montable como env var o volumen) — la diferencia es cómo Kubernetes lo trata internamente, no la sintaxis.',
        'Los valores se guardan codificados en **base64** en el manifiesto — eso NO es cifrado, es solo una codificación. Un Secret en YAML plano sigue siendo legible por cualquiera con acceso al archivo.',
        'En el cluster, `etcd` guarda los Secrets sin cifrar por defecto. Para cifrado real en reposo hace falta habilitar `EncryptionConfiguration` a nivel de cluster (tarea de quien administra el cluster, no del desarrollador).',
        "Kubernetes evita loguear el contenido de un Secret en `kubectl describe` (muestra `<set to the key 'x' in secret 'y'>`) — pero eso es una barrera de UX, no de seguridad real.",
        'Tipos especiales: `kubernetes.io/dockerconfigjson` (credenciales de un registry privado), `kubernetes.io/tls` (certificado + clave privada) — el resto usa el tipo genérico `Opaque`.',
      ],
    },
    {
      type: 'code',
      title: 'Secret — creación y montaje como archivos (la forma recomendada)',
      code: `# Crear un Secret desde la CLI (mejor que escribir base64 a mano en YAML)
kubectl create secret generic db-credentials \\
  --from-literal=username=admin \\
  --from-literal=password='S3cr3t!Pass'

# Ver el Secret (los valores NO se muestran en claro)
kubectl get secret db-credentials -o yaml
# data:
#   username: YWRtaW4=          <- base64, no cifrado
#   password: UzNjcjN0IVBhc3M=

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector: { matchLabels: { app: backend } }
  template:
    metadata: { labels: { app: backend } }
    spec:
      containers:
        - name: app
          image: mi-backend:1.0
          volumeMounts:
            - name: db-creds
              mountPath: /etc/secrets/db     # más seguro que env vars
              readOnly: true
      volumes:
        - name: db-creds
          secret:
            secretName: db-credentials       # aparece como /etc/secrets/db/username, /password`,
    },
    {
      type: 'comparison',
      title: 'Variables de entorno vs archivos montados: cuál usar',
      headers: ['Aspecto', 'Env vars', 'Archivo montado'],
      rows: [
        {
          feature: 'Visibilidad en el Pod',
          a: 'Legible en /proc/PID/environ dentro del contenedor',
          b: 'Solo quien lea el archivo específico',
        },
        {
          feature: 'Actualización sin reiniciar',
          a: 'No — hace falta recrear el Pod',
          b: 'Sí (con demora, vía kubelet sync)',
        },
        {
          feature: 'Volcado accidental en logs',
          a: 'Alto riesgo (crashes, stack traces)',
          b: 'Bajo — no aparece en variables de proceso',
        },
        {
          feature: 'Facilidad de uso en la app',
          a: 'Trivial — `process.env.X`',
          b: 'Requiere leer el archivo al arrancar',
        },
        {
          feature: 'Recomendado para',
          a: 'Config no sensible, flags',
          b: 'Secrets, certificados, configs grandes',
        },
      ],
    },
    {
      type: 'history',
      title: 'Buenas prácticas y errores comunes',
      items: [
        'Nunca commitear un manifiesto de Secret con valores reales a un repositorio Git — ni siquiera en base64, es trivialmente reversible.',
        'Para GitOps: herramientas como **Sealed Secrets** o **External Secrets Operator** permiten versionar una versión cifrada del Secret, o referenciarlo desde un vault externo (AWS Secrets Manager, HashiCorp Vault, Google Secret Manager).',
        '`immutable: true` en un ConfigMap/Secret evita cambios accidentales y mejora el rendimiento del apiserver (deja de vigilarlo por cambios) — útil cuando la config es fija por versión de release.',
        'Un Pod con `envFrom` sobre un ConfigMap que no existe todavía queda en `CreateContainerConfigError` — verificar con `kubectl describe pod` antes de asumir que es un bug de la app.',
        'RBAC: los Secrets son legibles por cualquiera con permiso `get` sobre ellos en el namespace — no son un límite de seguridad por sí solos, van de la mano con políticas de acceso.',
      ],
    },
    {
      type: 'lab',
      title: 'Laboratorio: Config no sensible + credenciales separadas',
      steps: [
        { cmd: 'kind create cluster --name cm-lab', desc: 'Cluster nuevo.' },
        {
          cmd: 'kubectl create configmap app-config --from-literal=APP_ENV=production --from-literal=LOG_LEVEL=debug',
          desc: 'ConfigMap con dos claves, creado imperativamente.',
        },
        {
          cmd: "kubectl create secret generic db-credentials --from-literal=password='hunter2'",
          desc: 'Secret con una credencial — nunca en el mismo recurso que la config pública.',
        },
        {
          cmd: "cat > pod.yaml << 'EOF'\napiVersion: v1\nkind: Pod\nmetadata:\n  name: config-test\nspec:\n  containers:\n    - name: app\n      image: busybox\n      command: ['sh', '-c', 'env | grep -E \"APP_ENV|LOG_LEVEL\"; cat /etc/secrets/password; sleep 3600']\n      envFrom:\n        - configMapRef: { name: app-config }\n      volumeMounts:\n        - name: secret-vol\n          mountPath: /etc/secrets\n  volumes:\n    - name: secret-vol\n      secret: { secretName: db-credentials, items: [{ key: password, path: password }] }\nEOF\nkubectl apply -f pod.yaml",
          desc: 'El ConfigMap entra como env vars; el Secret, como archivo montado.',
        },
        {
          cmd: 'kubectl logs config-test',
          desc: 'Muestra APP_ENV/LOG_LEVEL en el entorno y el contenido del archivo de password — dos canales distintos.',
        },
        {
          cmd: "kubectl get secret db-credentials -o jsonpath='{.data.password}' | base64 -d",
          desc: 'Decodifica el valor real desde fuera del Pod — confirma que base64 no es cifrado.',
        },
        { cmd: 'kubectl delete -f pod.yaml\nkind delete cluster --name cm-lab', desc: 'Limpieza.' },
      ],
    },
  ],
};

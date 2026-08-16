// Índice de niveles: cada nivel vive en su propio archivo bajo ./levels
// (uno por tema, <400 líneas) — este módulo solo los importa y arma el
// array en orden. Contenido real de cada nivel: ver ./levels/*.js
import nivel0 from './levels/00-introduccion.js';
import nivel1 from './levels/01-que-ocurre-internamente.js';
import nivel2 from './levels/02-arquitectura-docker.js';
import nivel3 from './levels/03-imagenes.js';
import nivel4 from './levels/04-contenedores.js';
import nivel5 from './levels/05-dockerfile.js';
import nivel6 from './levels/06-build-profesional.js';
import nivel7 from './levels/07-volumenes.js';
import nivel8 from './levels/08-redes-docker.js';
import nivel9 from './levels/09-docker-registry.js';
import nivel10 from './levels/10-docker-compose-fundamentos.js';
import nivel11 from './levels/11-docker-compose-redes-volumenes-y-secrets.js';
import nivel12 from './levels/12-docker-compose-produccion-y-perfiles.js';
import nivel13 from './levels/13-seguridad-en-docker.js';
import nivel14 from './levels/14-compose-debugging-y-los-limites-de-un-solo-host.js';
import nivel15 from './levels/15-introduccion-a-kubernetes.js';
import nivel16 from './levels/16-pods-y-replicasets.js';
import nivel17 from './levels/17-deployments-rolling-updates-y-rollback.js';
import nivel18 from './levels/18-services-y-networking.js';
import nivel19 from './levels/19-configmaps-y-secrets-en-k8s.js';
import nivel20 from './levels/20-almacenamiento-persistente.js';
import nivel21 from './levels/21-ingress-y-exposicion-externa.js';
import nivel22 from './levels/22-produccion-probes-recursos-y-autoscaling.js';
import nivel23 from './levels/23-rbac.js';
import nivel24 from './levels/24-helm.js';

export const niveles = [
  nivel0,
  nivel1,
  nivel2,
  nivel3,
  nivel4,
  nivel5,
  nivel6,
  nivel7,
  nivel8,
  nivel9,
  nivel10,
  nivel11,
  nivel12,
  nivel13,
  nivel14,
  nivel15,
  nivel16,
  nivel17,
  nivel18,
  nivel19,
  nivel20,
  nivel21,
  nivel22,
  nivel23,
  nivel24,
];

export function getNivel(id) {
  return niveles.find((n) => n.id === id) ?? null;
}

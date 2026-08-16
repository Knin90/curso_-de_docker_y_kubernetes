// Logos oficiales de marcas (simple-icons) para el ticker del hero y la
// sección de herramientas. Los productos sin logo propio usan el de su marca
// madre, igual que lo hacen oficialmente: Compose → Docker, kubectl/Minikube
// → Kubernetes. Los SVG se importan en crudo (?raw) y se inyectan inline con
// currentColor para pintarlos en blanco monocromo.
import dockerSvg from 'simple-icons/icons/docker.svg?raw';
import kubernetesSvg from 'simple-icons/icons/kubernetes.svg?raw';
import helmSvg from 'simple-icons/icons/helm.svg?raw';
import postgresqlSvg from 'simple-icons/icons/postgresql.svg?raw';
import nginxSvg from 'simple-icons/icons/nginx.svg?raw';
import containerdSvg from 'simple-icons/icons/containerd.svg?raw';
import podmanSvg from 'simple-icons/icons/podman.svg?raw';
import harborSvg from 'simple-icons/icons/harbor.svg?raw';
import githubSvg from 'simple-icons/icons/github.svg?raw';

const ICONS = {
  docker: dockerSvg,
  kubernetes: kubernetesSvg,
  helm: helmSvg,
  postgresql: postgresqlSvg,
  nginx: nginxSvg,
  containerd: containerdSvg,
  podman: podmanSvg,
  harbor: harborSvg,
  github: githubSvg,
};

const LOGOS = [
  { label: 'Docker', icon: 'docker' },
  { label: 'Compose', icon: 'docker' },
  { label: 'Kubernetes', icon: 'kubernetes' },
  { label: 'Helm', icon: 'helm' },
  { label: 'kubectl', icon: 'kubernetes' },
  { label: 'Minikube', icon: 'kubernetes' },
  { label: 'PostgreSQL', icon: 'postgresql' },
  { label: 'Nginx', icon: 'nginx' },
];

// Tool-tags de la sección Herramientas → logo oficial (o marca madre).
// Solo las herramientas que aparecen en el landing; las que no tienen logo
// (volúmenes, redes, conceptos) no se listan aquí para no inflar el bundle.
export const TOOL_ICON_MAP = {
  docker: 'docker',
  'docker compose': 'docker',
  'docker hub': 'docker',
  'docker logs': 'docker',
  containerd: 'containerd',
  podman: 'podman',
  minikube: 'kubernetes',
  kind: 'kubernetes',
  kubectl: 'kubernetes',
  'kubectl logs': 'kubernetes',
  'kubectl describe': 'kubernetes',
  'k8s dashboard': 'kubernetes',
  helm: 'helm',
  harbor: 'harbor',
  ghcr: 'github',
};

/** Extrae el <path> del SVG original y lo envuelve en un <svg> limpio. */
export function svgMarkup(raw) {
  const m = raw.match(/<path[^>]*d="([^"]+)"/);
  const d = m ? m[1] : '';
  return `<svg class="brand-logo" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
}

// Markup precomputado por icono (evita re-correr el regex por cada item)
const MARKUP = Object.fromEntries(Object.entries(ICONS).map(([key, raw]) => [key, svgMarkup(raw)]));

/** SVG de una marca por su clave (o vacío si no existe). */
export function brandMarkup(key) {
  return MARKUP[key] ?? '';
}

export function initTickerLogos() {
  const track = document.querySelector('.hero__ticker-inner');
  if (!track) return;
  const item = (logo) =>
    `<span>${MARKUP[logo.icon].replace('brand-logo', 'ticker-logo')}${logo.label}</span>`;
  // Contenido duplicado para el marquee infinito (translateX(-50%))
  track.innerHTML = [...LOGOS, ...LOGOS].map(item).join('');
}

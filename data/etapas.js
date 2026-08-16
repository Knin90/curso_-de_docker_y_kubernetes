// ─── Etapas del curso: agrupación de niveles para el modo escenas ───
// Vivía hardcodeada en main/landing-scenes.js; se extrajo a su propio módulo
// para que los tests de data/levels puedan validar el contrato sin arrastrar
// el grafo de módulos del landing (gsap/ScrollTrigger). Los ids de cada
// etapa deben coincidir con el campo `etapa` de data/levels/*.js — eso lo
// verifica tests/data-levels.test.js.
export const ETAPAS = [
  {
    key: 'docker',
    label: 'Etapa I',
    icon: 'ph-cube',
    title: 'Fundamentos Docker',
    desc: 'Namespaces, cgroups, overlayfs, imágenes, volúmenes y redes: la base que todo profesional DevOps necesita dominar.',
    ids: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 13],
  },
  {
    key: 'compose',
    label: 'Etapa II',
    icon: 'ph-stack-simple',
    title: 'Docker Compose',
    desc: 'Coordiná múltiples contenedores como una sola aplicación: servicios, redes, volúmenes y secrets en YAML.',
    ids: [10, 11, 12, 14],
  },
  {
    key: 'k8s',
    label: 'Etapa III',
    icon: 'ph-squares-four',
    title: 'Kubernetes',
    desc: 'El salto a la orquestación distribuida: Pods, Deployments, Services, Ingress, almacenamiento y autoscaling.',
    ids: [15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
  },
];

// ─── Motor de modo escenas compartido (DRY) ─── Zoom por scroll entre
// módulos (estilo ui8.ai/forge), snap con glide amortiguado, inmersivo y
// HUD. Compartido entre nivel/scenes.js y main/landing-scenes.js; cada
// página aporta: wrap/stage/scenes (DOM ya construido), state (objeto
// mutable { enabled }, el motor le escribe scrollTo/refresh del HUD), hud
// ({ counter, updateHud, initDisplay, refreshHud? }), playEntrance(idx)
// (reveal propio de cada escena), onActiveChange? (scrollspy) y
// setupExtras? (animaciones extra). Respeta prefers-reduced-motion — el
// caller decide si no llama al motor.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  clamp,
  glideDt,
  glideStepY,
  moduleY as moduleYAt,
  canSceneScroll,
  enteredStage as enteredStageAt,
  sceneTransition,
  activeIndexFromProgress,
} from './scene-engine-utils.js';
import { setupScrollGuards } from './scene-engine-scroll-guards.js';

export function createSceneEngine({
  wrap,
  stage,
  scenes,
  state,
  hud,
  playEntrance,
  onActiveChange,
  setupExtras,
}) {
  const N = scenes.length;
  const nav = document.querySelector('.nav');
  const counter = hud.counter;

  // El scroll interno vive en .nivel-scene__inner, no en .nivel-scene: ese
  // elemento no lleva transform propio (GSAP escala/desvanece .nivel-scene),
  // así se evita el parpadeo clásico de scrollear un elemento transformado.
  const scroller = (scene) => scene?.querySelector('.nivel-scene__inner') ?? scene;

  // Parámetros del efecto (los mismos tonos que la landing de Forge):
  const ZOOM = 0.45; // escala máxima extra al "atravesar" (1 → 1.45)
  const TRANS = 0.45; // fracción del segmento dedicada al zoom de paso

  // Recorrido por módulo: un poco más de una pantalla (el zoom necesita aire).
  const seg = () => window.innerHeight * 1.15;
  // Scroll hasta que el ÚLTIMO módulo se asienta: ahí el snap debe aterrizar
  // con la escena final a escala 1 y opacidad 1.
  const sceneEnd = () => (N - 1) * seg();
  // Pista de salida: EXIT_FADE extra de scroll tras el último módulo para
  // disolver el stage hacia la sección siguiente (el snap no cae en este tramo).
  const totalScroll = () => sceneEnd() + EXIT_FADE;
  const ENTER_FADE = window.innerHeight * 0.5; // fundido del stage al entrar
  const EXIT_FADE = window.innerHeight * 0.35; // fundido al salir

  document.body.classList.add('scenes-mode');
  state.enabled = true;

  // El glide y los scrub de GSAP mueven el scroll por frame con scrollTo:
  // con `html { scroll-behavior: smooth }` cada llamada dispara una
  // animación que se cancela a sí misma (el scroll queda trabado en 0).
  // El modo escenas controla TODO el scroll de la página, así que el
  // suavizado CSS se desactiva mientras esté activo.
  document.documentElement.style.scrollBehavior = 'auto';

  const updateWrapHeight = () => {
    // El wrapper reserva 100vh + recorrido: el stage (fijo) tiene scroll de sobra.
    wrap.style.height = `${window.innerHeight + totalScroll()}px`;
  };
  updateWrapHeight();
  window.addEventListener('resize', updateWrapHeight);

  // Posición del wrapper, cacheada: no cambia mientras dura el escenario, y
  // leerla vía getBoundingClientRect() en cada wheel/touch fuerza un layout
  // síncrono en cada uno (medido: ~400ms de "forced reflow" en un scroll
  // rápido, peor cuanto más denso el DOM del módulo). Se mide una vez.
  let wrapStart = 0;
  const measureWrapStart = () => {
    wrapStart = wrap.getBoundingClientRect().top + window.scrollY;
  };
  measureWrapStart();
  window.addEventListener('resize', measureWrapStart);

  const { fadeUpdaters } = setupScrollGuards(scenes, scroller);

  // ─── Snap por módulo: glide amortiguado exponencialmente (lag filter) ───
  // Forge convierte el scroll en un valor virtual y lo amortigua con
  // `current += (target - current) * (1 - exp(-dt/τ))`. Aquí el "target" es
  // la posición Y del módulo destino y un rAF mueve window.scrollY con esa
  // curva: el documento se desliza y se asienta con peso.
  const GLIDE_TAU = 170; // constante de tiempo del lag filter (ms) — más bajo = alcanza el target más rápido
  const GLIDE_LOCK = 480; // ventana de bloqueo tras disparar un glide — más corta = responde antes al próximo gesto
  const WHEEL_STEP = 46; // delta acumulado (px) para considerar un gesto — más bajo = dispara con un scroll más liviano
  const SWIPE_STEP = 36; // distancia táctil (px) para navegar

  let activeIndex = 0; // módulo visible (redondeo del progreso)
  const sceneScrolls = new Map(); // scroll interno por módulo (para volver)

  // ── Glide interrumpible: el "target" vive en una variable y el rAF lo
  // persigue con la curva exponencial. Si llega otro gesto antes de asentarse
  // (misma dirección o reversa), solo cambia el target y el loop redirige.
  let glideTarget = null; // Y absoluta objetivo (null = glide inactivo)
  let glideY = 0; // valor amortiguado actual
  let glideRaf = null;
  let glideLast = 0;
  let glideLockUntil = 0;

  const moduleY = (k) => moduleYAt(wrapStart, k, N, sceneEnd(), ENTER_FADE);

  const glideStep = (now) => {
    if (glideTarget === null) {
      glideRaf = null;
      return;
    }
    const dt = glideDt(now, glideLast);
    glideLast = now;
    glideY = glideStepY(glideY, glideTarget, dt, GLIDE_TAU);
    window.scrollTo(0, glideY);
    if (Math.abs(glideTarget - glideY) < 0.5) {
      glideTarget = null;
      glideRaf = null;
      window.scrollTo(0, glideY);
    } else {
      glideRaf = requestAnimationFrame(glideStep);
    }
  };

  const goToModule = (k) => {
    const idx = clamp(k, 0, N - 1);
    glideLockUntil = performance.now() + GLIDE_LOCK;
    // Guarda el scroll interno del módulo que dejamos y restaura el destino.
    const from = scroller(scenes[activeIndex]);
    if (from) sceneScrolls.set(activeIndex, from.scrollTop);
    const to = scroller(scenes[idx]);
    if (to) to.scrollTop = sceneScrolls.get(idx) ?? 0;

    glideTarget = moduleY(idx);
    if (!glideRaf) {
      glideY = window.scrollY;
      glideLast = 0;
      glideRaf = requestAnimationFrame(glideStep);
    }
  };

  // ─── Inmersivo: oculta el chrome mientras el escenario está activo ───
  let immersed = false;
  const setImmersed = (on) => {
    if (on === immersed) return;
    immersed = on;
    document.body.classList.toggle('scenes-immersed', on);
    if (nav)
      gsap.to(nav, { yPercent: on ? -100 : 0, duration: 0.45, ease: 'power3.inOut', overwrite: 'auto' });
  };

  // El stage recién se intercepta después del fundido de entrada: antes, el
  // scroll nativo deja "caer" al usuario al primer módulo (dive de entrada).
  // wrapStart es el valor cacheado de arriba — sin getBoundingClientRect()
  // acá, este helper corre en el hot path de wheel/touch.
  const wrapStartDoc = () => wrapStart;
  const enteredStage = () => enteredStageAt(window.scrollY, wrapStartDoc(), ENTER_FADE);

  // ─── Rueda / trackpad: scroll interno primero; al llegar al final, snap ───
  let wheelAcc = 0,
    wheelDir = 0;
  const onWheel = (e) => {
    if (!state.enabled || !immersed || !enteredStage()) return;
    const dir = e.deltaY > 0 ? 1 : -1;
    if (canSceneScroll(scroller(scenes[activeIndex]), dir)) return; // deja el scroll interno
    // En los bordes del escenario, el gesto hacia afuera sale (scroll nativo).
    if ((activeIndex === 0 && dir < 0) || (activeIndex === N - 1 && dir > 0)) return;
    if (!e.cancelable) return;
    e.preventDefault();
    // Durante un glide, el scroll nativo pelearía con el tween: se bloquea.
    if (performance.now() < glideLockUntil) return;
    if (dir !== wheelDir) {
      wheelDir = dir;
      wheelAcc = 0;
    }
    wheelAcc += Math.min(160, Math.abs(e.deltaY));
    if (wheelAcc >= WHEEL_STEP) {
      wheelAcc = 0;
      goToModule(activeIndex + dir);
    }
  };
  window.addEventListener('wheel', onWheel, { passive: false });

  // ─── Swipe táctil (misma lógica: contenido interno → luego módulo) ───
  let touchY = null;
  const onTouchStart = (e) => {
    if (e.touches.length === 1) touchY = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (!state.enabled || !immersed || !enteredStage() || touchY === null || e.touches.length !== 1) return;
    const dy = e.touches[0].clientY - touchY;
    const dir = dy > 0 ? -1 : 1;
    if (canSceneScroll(scroller(scenes[activeIndex]), dir)) {
      touchY = e.touches[0].clientY;
      return;
    }
    if ((activeIndex === 0 && dir < 0) || (activeIndex === N - 1 && dir > 0)) return;
    // Durante un glide, bloquear el scroll nativo (pelearía con el tween).
    if (performance.now() < glideLockUntil) {
      e.preventDefault();
      return;
    }
    if (Math.abs(dy) < SWIPE_STEP) return;
    e.preventDefault();
    touchY = e.touches[0].clientY;
    goToModule(activeIndex + dir);
  };
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener(
    'touchend',
    () => {
      touchY = null;
    },
    { passive: true },
  );

  // ─── Teclado: flechas / espacio / PageUp-Down / Home-End ───
  const onKey = (e) => {
    if (!state.enabled || !immersed) return;
    const t = e.target;
    // e.target puede ser el propio `document` (no un Element) si nada tiene
    // foco — document.closest no existe y tira TypeError sin capturar.
    if (t?.closest?.('input, textarea, select, [contenteditable]')) return;
    const map = {
      ArrowDown: 1,
      ArrowRight: 1,
      PageDown: 1,
      ' ': 1,
      ArrowUp: -1,
      ArrowLeft: -1,
      PageUp: -1,
      Home: -Infinity,
      End: Infinity,
    };
    const dir = map[e.key];
    if (dir === undefined || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    if (dir === -Infinity) {
      goToModule(0);
      return;
    }
    if (dir === Infinity) {
      goToModule(N - 1);
      return;
    }
    const scene = scroller(scenes[activeIndex]);
    if (scene && canSceneScroll(scene, dir)) {
      scene.scrollBy({ top: dir * scene.clientHeight * 0.85, behavior: 'smooth' });
    } else {
      goToModule(activeIndex + dir);
    }
  };
  window.addEventListener('keydown', onKey);

  // playEntrance solo la primera vez por escena: si el límite entre módulos
  // se cruza varias veces seguidas (rebote de trackpad) y el reveal se
  // reinicia a mitad de camino, una segunda animación cortada deja contenido
  // pegado a medio revelar ("se ve cortado"). Una vez y listo.
  const revealed = new Set();
  const playEntranceOnce = (idx) => {
    if (revealed.has(idx)) return;
    revealed.add(idx);
    playEntrance(idx);
    // El desvanecido de "hay más abajo" depende del alto real del contenido,
    // que puede asentarse recién con el reveal (stagger, fuentes, etc.).
    requestAnimationFrame(() => fadeUpdaters[idx]?.());
  };

  // Transición de las escenas según la posición flotante en [0, N-1].
  // `vel` (px/s) añade un "punch" de escala como la resolución de movimiento
  // de Forge: a más velocidad de scroll, más "respira" la escena activa.
  let lastK = -1;
  const updateScenes = (sf, vel = 0) => {
    const { k, t, punch } = sceneTransition(sf, N, TRANS, vel);

    scenes.forEach((scene, i) => {
      if (i === k) {
        // Escena activa: se "atraviesa" — zoom hacia adentro y fundido.
        // La opacidad llega a 0 justo cuando el zoom es máximo: evita el
        // tramo intermedio de texto semitransparente y ampliado que se ve
        // borroso/ilegible (t alto = mucho scale + todavía visible).
        gsap.set(scene, {
          scale: 1 + t * ZOOM + punch,
          opacity: 1 - t,
          zIndex: 10,
          transformOrigin: '50% 50%',
        });
      } else if (i === k + 1) {
        // Siguiente escena: emerge desde atrás y se asienta en escala 1,
        // arrancando en opacidad 0 (mismo criterio que la saliente).
        gsap.set(scene, {
          scale: 1 + ZOOM - t * ZOOM - punch,
          opacity: t,
          zIndex: 5,
          transformOrigin: '50% 50%',
        });
      } else {
        gsap.set(scene, { scale: 1, opacity: 0, zIndex: 0 });
      }
    });

    // Al empezar una nueva transición, la escena que quedó visible (k) revela
    // su contenido y guardamos el scroll interno de la que dejamos (lastK).
    if (k !== lastK) {
      if (lastK >= 0) sceneScrolls.set(lastK, scroller(scenes[lastK])?.scrollTop ?? 0);
      lastK = k;
      playEntranceOnce(k);
    }
  };

  // Fundidos de entrada/salida del stage (el escenario aparece sobre el
  // header y se disuelve cuando llega la sección siguiente).
  // Posiciones ABSOLUTAS numéricas (función re-evaluada en cada refresh):
  // las cadenas tipo `top top+=X` devueltas desde funciones no se parsean
  // de forma fiable en GSAP y producen starts negativos espurios.
  const fadeInOut = (el) => {
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        ease: 'none',
        scrollTrigger: { trigger: wrap, start: 'top top', end: `+=${ENTER_FADE}`, scrub: true },
      },
    );
    gsap.fromTo(
      el,
      { opacity: 1 },
      {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: () => wrapStartDoc() + sceneEnd(),
          end: () => wrapStartDoc() + sceneEnd() + EXIT_FADE,
          scrub: true,
        },
      },
    );
  };
  fadeInOut(stage);
  fadeInOut(counter);

  // ScrollTrigger principal: el recorrido de escenas termina en sceneEnd;
  // la pista de salida (totalScroll − sceneEnd) queda para el fundido final.
  // scrub: true (sin lag propio) — el glide de arriba YA suaviza el scroll;
  // agregarle un scrub numérico aquí duplica el suavizado (dos "resortes"
  // persiguiéndose entre sí) y es lo que produce el parpadeo/oscilación al
  // cruzar el límite entre módulos.
  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: () => `+=${sceneEnd()}`,
    scrub: true,
    anticipatePin: 1,
    onUpdate: (self) => {
      const sf = self.progress * (N - 1);
      activeIndex = activeIndexFromProgress(sf, N);
      updateScenes(sf, self.getVelocity());
      hud.updateHud(sf, activeIndex);
      onActiveChange?.(activeIndex);
    },
    onEnter: () => setImmersed(true),
    onEnterBack: () => {
      setImmersed(true);
      // Al volver desde la pista de salida, la última escena se revela.
      if (lastK < N - 1) playEntranceOnce(N - 1);
    },
    onLeave: () => {
      setImmersed(false);
      // updateScenes clampea s a N-1-ε, así el flip k que revela la última
      // escena nunca dispara: se revela aquí, justo al salir del escenario.
      if (lastK < N - 1) playEntranceOnce(N - 1);
    },
    onLeaveBack: () => {
      setImmersed(false);
      onActiveChange?.(-1);
    },
    onRefresh: updateWrapHeight,
  });

  // Animaciones extra de la página (nivel: header + atmósfera; landing: nada).
  setupExtras?.({ wrap, sceneEnd, totalScroll, ENTER_FADE });

  // Clicks del índice de secciones: glide amortiguado hasta el módulo.
  state.scrollTo = goToModule;

  // Refrescos del HUD expuestos a la página (si el HUD los ofrece).
  if (hud.refreshHudRead) state.refreshHudRead = hud.refreshHudRead;
  if (hud.refreshHud) state.refreshHud = hud.refreshHud;

  // Estado inicial: primera escena visible y revelada.
  hud.initDisplay();
  lastK = 0;
  activeIndex = 0;
  updateScenes(0, 0);
  playEntranceOnce(0);

  requestAnimationFrame(() => ScrollTrigger.refresh());
}

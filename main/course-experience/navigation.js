// ─── Controles de navegación: flechas, teclado y swipe táctil ───
const SWIPE_THRESHOLD = 48;

function isTypingTarget(el) {
  const tag = el?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable;
}

function isInViewport(el) {
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0;
}

/**
 * @param {HTMLElement} root  contenedor `.course-exp` (recibe el swipe)
 * @param {{onNext: Function, onPrev: Function, onOpen: Function, onEscape?: Function}} handlers
 */
export function initNavigation(root, { onNext, onPrev, onOpen, onEscape }) {
  const prevBtn = document.getElementById('course-exp-prev');
  const nextBtn = document.getElementById('course-exp-next');
  prevBtn?.addEventListener('click', onPrev);
  nextBtn?.addEventListener('click', onNext);

  root.addEventListener('course-exp:navigate', (e) => {
    const offset = e.detail?.offset;
    if (offset === 1) onNext();
    else if (offset === -1) onPrev();
  });

  const onKeydown = (e) => {
    if (isTypingTarget(document.activeElement)) return;
    if (e.key === 'Escape') {
      onEscape?.();
      return;
    }
    if (!isInViewport(root)) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onPrev();
    } else if (e.key === 'Enter' && document.activeElement?.closest('.course-exp-card[aria-current="true"]')) {
      onOpen();
    }
  };
  document.addEventListener('keydown', onKeydown);

  // Swipe táctil real: umbral de distancia horizontal, no clicks diminutos.
  let startX = 0;
  let startY = 0;
  let tracking = false;
  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch' && e.pointerType !== 'pen') return;
    tracking = true;
    startX = e.clientX;
    startY = e.clientY;
  };
  const onPointerUp = (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) onNext();
      else onPrev();
    }
  };
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', () => {
    tracking = false;
  });

  return function destroy() {
    document.removeEventListener('keydown', onKeydown);
    root.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointerup', onPointerUp);
  };
}

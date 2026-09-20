// Sehr reduzierter Custom-Cursor: ein einzelner Punkt, der der Maus mit
// leichtem Lerp/Lag folgt. Nur auf Geräten mit echtem Maus-Pointer aktiv –
// auf Touch-Geräten bzw. bei reduzierter Bewegung bleibt der native Cursor
// unverändert (siehe #custom-cursor in global.css).
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load": ohne das
// würde der rAF-Loop nach der ersten client-seitigen Navigation nicht mehr
// neu starten (ES-Module werden vom Browser nur einmal ausgeführt).
export {};

const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const dot = document.getElementById('custom-cursor');
  if (!dot || !supportsFinePointer || reduceMotion) {
    cleanup = null;
    return;
  }

  document.body.classList.add('has-custom-cursor');

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let active = false;
  let rafId: number | null = null;
  let stopped = false;

  const onMouseMove = (event: MouseEvent) => {
    targetX = event.clientX;
    targetY = event.clientY;
    if (!active) {
      active = true;
      dot.classList.add('is-active');
    }
  };

  const onMouseLeave = () => {
    active = false;
    dot.classList.remove('is-active');
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);

  const tick = () => {
    if (stopped) return;
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    dot.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(tick);
  };

  rafId = requestAnimationFrame(tick);

  cleanup = () => {
    stopped = true;
    if (rafId) cancelAnimationFrame(rafId);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
  };
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

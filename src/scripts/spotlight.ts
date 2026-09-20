// Cursor-Spotlight: ein sehr dezenter, radialer Lichtschein, der der Maus
// 1:1 folgt (siehe .cursor-spotlight in global.css). Bewusst OHNE Lerp/
// Nachlaufen – direkt auf die Cursor-Position gesetzt, damit es sich
// unmittelbar statt träge anfühlt. Nur auf Geräten mit echtem Maus-Pointer,
// nicht bei reduzierter Bewegung.
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
export {};

const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const spot = document.querySelector<HTMLElement>('.cursor-spotlight');
  if (!spot || !supportsFinePointer || reduceMotion) {
    cleanup = null;
    return;
  }

  const onMouseMove = (event: MouseEvent) => {
    spot.style.setProperty('--spot-x', `${event.clientX}px`);
    spot.style.setProperty('--spot-y', `${event.clientY}px`);
    spot.style.opacity = '1';
  };

  const onMouseLeave = () => {
    spot.style.opacity = '0';
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave);

  cleanup = () => {
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
  };
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

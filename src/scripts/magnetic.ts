// Magnetischer Button-Effekt: Elemente mit [data-magnetic] werden beim
// Hover minimal (max. ~6px) zum Cursor hin verschoben und federn beim
// Verlassen zurück. Nur mit echtem Maus-Pointer, siehe global.css für die
// zugehörige Transition.
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load": nötig, damit
// der Effekt auch auf client-seitig nachgeladenen Seiten neue Elemente
// findet (die alten Listener hängen sonst an bereits entfernten Knoten).
export {};

const MAX_PULL = 6;
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  if (!supportsFinePointer || reduceMotion) {
    cleanup = null;
    return;
  }

  const cleanups: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const onMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `translate3d(${relX * MAX_PULL * 2}px, ${relY * MAX_PULL * 2}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = 'translate3d(0, 0, 0)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    cleanups.push(() => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    });
  });

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

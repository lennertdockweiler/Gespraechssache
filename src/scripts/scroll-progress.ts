// Sehr dünne Scroll-Progress-Bar oben am Viewport (siehe ScrollProgress.astro).
// Läuft über requestAnimationFrame, um Scroll-Jank zu vermeiden.
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load": nötig, damit
// die Bar auch nach einer client-seitigen Navigation weiter funktioniert.
export {};

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const bar = document.getElementById('scroll-progress');
  if (!bar) {
    cleanup = null;
    return;
  }

  let ticking = false;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    bar.style.transform = `scaleX(${progress})`;
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  update();

  cleanup = () => window.removeEventListener('scroll', onScroll);
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

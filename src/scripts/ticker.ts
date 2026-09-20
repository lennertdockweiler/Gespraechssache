// Pausiert die Ticker-Marquee-Animation, sobald sie den Viewport verlässt,
// damit im Hintergrund keine unnötige Animation weiterläuft (Performance).
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
export {};

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const tickers = document.querySelectorAll<HTMLElement>('.ticker');
  if (!tickers.length) {
    cleanup = null;
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('is-paused', !entry.isIntersecting);
    }
  });

  tickers.forEach((el) => observer.observe(el));
  cleanup = () => observer.disconnect();
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

// Zeilenweiser Reveal für kurze, aber inhaltlich dynamische Zitate
// (z.B. das Kurz-Zitat auf den Personenseiten). Anders als .line-mask
// (siehe global.css), das feste, manuell autorierte Zeilen braucht, werden
// hier die tatsächlich gerenderten Zeilen zur Laufzeit anhand ihrer
// Position gemessen – nötig, weil der Zeilenumbruch bei CMS-Text von
// Bildschirmbreite und Inhalt abhängt und nicht im Voraus bekannt ist.
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
export {};

function splitIntoLines(el: HTMLElement) {
  const originalText = el.dataset.quoteText ?? el.textContent ?? '';
  el.dataset.quoteText = originalText;

  const words = originalText.trim().split(/\s+/);
  el.innerHTML = words.map((word, i) => `<span data-word="${i}">${word}</span>`).join(' ');

  const wordEls = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
  const lines: string[][] = [];
  let lastTop: number | null = null;

  for (const wordEl of wordEls) {
    const top = wordEl.offsetTop;
    if (lastTop === null || Math.abs(top - lastTop) > 4) {
      lines.push([]);
      lastTop = top;
    }
    lines[lines.length - 1].push(wordEl.textContent ?? '');
  }

  el.innerHTML = lines
    .map((line) => `<span class="quote-line"><span>${line.join(' ')}</span></span>`)
    .join(' ');
}

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll<HTMLElement>('[data-quote-reveal]');

  if (!elements.length) {
    cleanup = null;
    return;
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => {
      splitIntoLines(el);
      el.classList.add('is-visible');
    });
    cleanup = null;
    return;
  }

  elements.forEach((el) => splitIntoLines(el));

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.4 },
  );

  elements.forEach((el) => observer.observe(el));

  let resizeTimer: number | undefined;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      elements.forEach((el) => splitIntoLines(el));
    }, 200);
  };
  window.addEventListener('resize', onResize);

  cleanup = () => {
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    window.clearTimeout(resizeTimer);
  };
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

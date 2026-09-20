// Aktiviert dezente Fade/Translate-Reveals für alle Elemente mit
// [data-reveal]. Nutzt IntersectionObserver statt einer Animations-
// Library, um die JS-Menge minimal zu halten.
//
// Leerer export: macht die Datei zu einem echten ES-Modul mit eigenem
// Scope. Ohne jeden import/export behandelt TypeScript Skript-Dateien
// sonst als globales Script – dann kollidieren gleichnamige Variablen
// (z.B. `reduceMotion`) mit anderen <script>-Dateien wie mobile-nav.ts.
export {};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
  elements.forEach((el) => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const delay = el.dataset.revealDelay;
          if (delay) {
            el.style.transitionDelay = `${delay}ms`;
          }
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );

  elements.forEach((el) => observer.observe(el));
}

// Hochwertiges mobiles Menü: Toggle + Escape-Taste + Klick außerhalb.
// Öffnen/Schließen läuft als echte, gestaffelte Animation (siehe
// #mobile-nav-panel-Styles in Header.astro): erst `hidden` entfernen,
// dann (nächster Frame) `.is-open` setzen, damit der Browser den
// Übergang tatsächlich animiert statt direkt zum Endzustand zu springen.
//
// Leerer export: siehe Kommentar in reveal.ts – verhindert Namenskollisionen
// zwischen den einzelnen <script>-Dateien beim Typecheck.
export {};

const toggle = document.getElementById('mobile-nav-toggle');
const panel = document.getElementById('mobile-nav-panel');
const closeBtn = document.getElementById('mobile-nav-close');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const OPEN_TRANSITION_MS = reduceMotion ? 0 : 600;

if (toggle && panel) {
  const open = () => {
    panel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panel.classList.add('is-open');
      });
    });
    const firstLink = panel.querySelector<HTMLElement>('a');
    firstLink?.focus();
  };

  const close = () => {
    panel.classList.remove('is-open');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
    window.setTimeout(() => {
      panel.classList.add('hidden');
    }, OPEN_TRANSITION_MS);
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  closeBtn?.addEventListener('click', close);

  panel.addEventListener('click', (event) => {
    if (event.target === panel) close();
  });

  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
    }
  });
}

// Dezentes Header-Verhalten beim Scrollen: leichter Schatten statt eines
// auffälligen Größen-/Farbwechsels.
const header = document.getElementById('site-header');

if (header) {
  let ticking = false;

  const update = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true },
  );

  update();
}

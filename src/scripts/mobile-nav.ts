// Hochwertiges mobiles Menü: Toggle + Escape-Taste + Klick außerhalb.
// Öffnen/Schließen läuft als echte, gestaffelte Animation (siehe
// #mobile-nav-panel-Styles in Header.astro): erst `hidden` entfernen,
// dann (nächster Frame) `.is-open` setzen, damit der Browser den
// Übergang tatsächlich animiert statt direkt zum Endzustand zu springen.
//
// Wegen <ClientRouter /> (View Transitions, siehe Layout.astro) wird HTML
// bei jeder Navigation ausgetauscht, aber dieses Modul-Skript vom Browser
// nur ein einziges Mal ausgeführt (ES-Module werden pro URL gecacht). Ohne
// weiteres Zutun würden Menü/Header-Scroll deshalb nach der ersten
// Client-seitigen Navigation nicht mehr reagieren. Die eigentliche Logik
// läuft daher in init(), das sowohl sofort als auch bei jedem weiteren
// "astro:page-load" erneut aufgerufen wird; "astro:before-swap" räumt vorher
// die Listener der jeweils vorherigen Seite ab.
export {};

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  const cleanups: (() => void)[] = [];

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

    const onToggleClick = () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    };
    toggle.addEventListener('click', onToggleClick);
    cleanups.push(() => toggle.removeEventListener('click', onToggleClick));

    closeBtn?.addEventListener('click', close);

    const onPanelClick = (event: MouseEvent) => {
      if (event.target === panel) close();
    };
    panel.addEventListener('click', onPanelClick);
    cleanups.push(() => panel.removeEventListener('click', onPanelClick));

    panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
      }
    };
    document.addEventListener('keydown', onKeydown);
    cleanups.push(() => document.removeEventListener('keydown', onKeydown));
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

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    cleanups.push(() => window.removeEventListener('scroll', onScroll));
  }

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

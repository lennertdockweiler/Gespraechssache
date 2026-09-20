// Lädt den offiziellen YouTube-Embedded-Player erst bei Interaktion nach
// (Klick oder Enter/Leertaste), nicht beim Seitenaufbau. Nutzt bewusst
// youtube-nocookie.com (die von YouTube offiziell dokumentierte
// datenschutzfreundlichere Embed-Variante): Vor dem Klick entstehen dadurch
// keine Requests oder Cookies von YouTube auf dieser Seite (siehe
// Datenschutz-Hinweise im Abschlussbericht).
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load": nötig,
// damit nach einer client-seitigen Navigation auch die Facade(s) der neuen
// Seite klickbar werden.
export {};

function activateFacade(facade: HTMLElement) {
  const videoId = facade.dataset.videoId;
  if (!videoId) return;

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  iframe.title = facade.getAttribute('aria-label') ?? 'YouTube-Video';
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  iframe.className = 'absolute inset-0 h-full w-full';
  iframe.setAttribute('frameborder', '0');

  facade.replaceChildren(iframe);
  facade.removeAttribute('role');
  facade.removeAttribute('tabindex');
}

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  const cleanups: (() => void)[] = [];

  document.querySelectorAll<HTMLElement>('[data-yt-facade]').forEach((facade) => {
    const onClick = () => activateFacade(facade);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateFacade(facade);
      }
    };

    facade.addEventListener('click', onClick);
    facade.addEventListener('keydown', onKeydown);
    cleanups.push(() => {
      facade.removeEventListener('click', onClick);
      facade.removeEventListener('keydown', onKeydown);
    });
  });

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

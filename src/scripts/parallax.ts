// Bündelt alle scroll-/cursor-gebundenen Bewegungseffekte in einem
// gemeinsamen rAF-Takt statt mehrerer unabhängiger Listener:
//   [data-parallax]        – dezenter Scroll-Parallax-Drift (wenige px)
//   [data-scroll-zoom]     – Scroll-gebundener Zoom (Scale 1.00 → 1.04)
//   [data-cursor-parallax] – Cursor-reaktive Bildposition (Kamera-Gefühl)
// Auf kleinen/Touch-Viewports bzw. bei reduzierter Bewegung bleiben die
// Elemente in ihrem Ruhezustand (siehe global.css Reduced-Motion-Block).
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load": ohne das
// würden Scroll-Listener/Observer nach der ersten client-seitigen
// Navigation nicht neu für die jeweils aktuelle Seite aufgesetzt.
export {};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isSmallViewport = window.matchMedia('(max-width: 640px)').matches;

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  const cleanups: (() => void)[] = [];

  const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
  const zoomEls = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-zoom]'));
  const cursorEls = Array.from(document.querySelectorAll<HTMLElement>('[data-cursor-parallax]'));

  if ((parallaxEls.length || zoomEls.length) && !reduceMotion && !isSmallViewport) {
    const visible = new Set<HTMLElement>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
          else visible.delete(entry.target as HTMLElement);
        }
      },
      { rootMargin: '20% 0px 20% 0px' },
    );
    [...parallaxEls, ...zoomEls].forEach((el) => observer.observe(el));

    let ticking = false;

    const updateScroll = () => {
      const viewportH = window.innerHeight;

      for (const el of parallaxEls) {
        if (!visible.has(el)) continue;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = (viewportH / 2 - center) / viewportH;
        el.style.setProperty('--parallax-y', `${(progress * 16).toFixed(2)}px`);
      }

      for (const el of zoomEls) {
        if (!visible.has(el)) continue;
        const rect = el.getBoundingClientRect();
        const raw = 1 - rect.top / viewportH;
        const clamped = Math.min(Math.max(raw, 0), 1);
        el.style.setProperty('--scroll-zoom', clamped.toFixed(3));
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    cleanups.push(() => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    });
  }

  if (cursorEls.length && supportsFinePointer && !reduceMotion) {
    const MAX_OFFSET = 6;

    cursorEls.forEach((el) => {
      const onMove = (event: MouseEvent) => {
        const rect = el.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--parallax-x', `${(relX * MAX_OFFSET * 2).toFixed(2)}px`);
        el.style.setProperty('--parallax-y', `${(relY * MAX_OFFSET * 2).toFixed(2)}px`);
      };
      const onLeave = () => {
        el.style.setProperty('--parallax-x', '0px');
        el.style.setProperty('--parallax-y', '0px');
      };

      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });
  }

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

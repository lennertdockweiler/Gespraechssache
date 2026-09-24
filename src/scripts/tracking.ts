// Lädt Google Analytics (GA4) und/oder Meta-Pixel NUR, wenn (a) die
// jeweilige ID als Umgebungsvariable zur Build-Zeit gesetzt ist UND
// (b) aktive Einwilligung für die passende Kategorie vorliegt (siehe
// cookie-consent.ts). Ohne gesetzte ID passiert für die jeweilige
// Kategorie schlicht nichts – analog zum bestehenden Muster bei
// YouTube/Instagram (src/lib/youtube.ts, src/lib/instagram.ts).
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
import type { CookieConsent } from './cookie-consent';

export {};

const GA_ID = import.meta.env.PUBLIC_GA_MEASUREMENT_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined;

let analyticsLoaded = false;
let marketingLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded || !GA_ID) return;
  analyticsLoaded = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: unknown[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  // IP-Anonymisierung ist seit GA4 Standard (kein anonymize_ip-Flag mehr
  // nötig wie bei Universal Analytics), siehe Google-Dokumentation.
  gtag('config', GA_ID);
}

function loadMetaPixel() {
  if (marketingLoaded || !META_PIXEL_ID) return;
  marketingLoaded = true;

  const w = window as any;
  if (!w.fbq) {
    const n: any = (w.fbq = function (...args: unknown[]) {
      n.callMethod ? n.callMethod(...args) : n.queue.push(args);
    });
    w._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  w.fbq('init', META_PIXEL_ID);
  w.fbq('track', 'PageView');
}

function applyConsent(consent: CookieConsent) {
  if (consent.analytics) loadAnalytics();
  if (consent.marketing) loadMetaPixel();
}

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  if (!GA_ID && !META_PIXEL_ID) {
    cleanup = null;
    return;
  }

  import('./cookie-consent').then(({ getStoredConsent }) => {
    const existing = getStoredConsent();
    if (existing) applyConsent(existing);
  });

  const onConsentChanged = (event: Event) => {
    applyConsent((event as CustomEvent<CookieConsent>).detail);
  };
  document.addEventListener('cookie-consent-changed', onConsentChanged);
  cleanup = () => document.removeEventListener('cookie-consent-changed', onConsentChanged);
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

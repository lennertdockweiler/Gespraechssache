// Verwaltet die Cookie-Einwilligung (Consent Management). Speichert die
// Entscheidung in localStorage und feuert "cookie-consent-changed" auf
// document, worauf tracking.ts hört, um Google Analytics/Meta-Pixel erst
// NACH aktiver Einwilligung nachzuladen – nie vorher.
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
export {};

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'gespraechssache-cookie-consent';

export function getStoredConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics === 'boolean' && typeof parsed?.marketing === 'boolean') {
      return { necessary: true, analytics: parsed.analytics, marketing: parsed.marketing };
    }
    return null;
  } catch {
    return null;
  }
}

function storeConsent(consent: CookieConsent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Local Storage nicht verfügbar (z.B. Privatmodus mit Blockierung) –
    // Einwilligung gilt dann nur für die aktuelle Seitenansicht.
  }
  document.dispatchEvent(new CustomEvent<CookieConsent>('cookie-consent-changed', { detail: consent }));
}

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  const cleanups: (() => void)[] = [];

  const banner = document.getElementById('cookie-banner');
  const dialog = document.getElementById('cookie-settings-dialog') as HTMLDialogElement | null;
  const analyticsBox = document.getElementById('consent-analytics') as HTMLInputElement | null;
  const marketingBox = document.getElementById('consent-marketing') as HTMLInputElement | null;

  if (!banner || !dialog || !analyticsBox || !marketingBox) {
    cleanup = null;
    return;
  }

  const showBanner = () => banner.classList.remove('hidden');
  const openBanner = () => requestAnimationFrame(() => banner.classList.add('is-open'));
  const hideBanner = () => {
    banner.classList.remove('is-open');
    window.setTimeout(() => banner.classList.add('hidden'), 350);
  };

  const existing = getStoredConsent();
  if (existing) {
    analyticsBox.checked = existing.analytics;
    marketingBox.checked = existing.marketing;
  } else {
    showBanner();
    openBanner();
  }

  const onAcceptAll = () => {
    storeConsent({ necessary: true, analytics: true, marketing: true });
    hideBanner();
  };
  const onRejectAll = () => {
    storeConsent({ necessary: true, analytics: false, marketing: false });
    hideBanner();
  };
  const onOpenSettings = () => {
    analyticsBox.checked = existing?.analytics ?? false;
    marketingBox.checked = existing?.marketing ?? false;
    dialog.showModal();
  };
  const onCloseSettings = () => dialog.close();
  const onSaveSettings = () => {
    storeConsent({ necessary: true, analytics: analyticsBox.checked, marketing: marketingBox.checked });
    dialog.close();
    hideBanner();
  };
  const onDialogBackdropClick = (event: MouseEvent) => {
    if (event.target === dialog) dialog.close();
  };

  document.getElementById('cookie-accept')?.addEventListener('click', onAcceptAll);
  document.getElementById('cookie-reject')?.addEventListener('click', onRejectAll);
  document.getElementById('cookie-settings-open')?.addEventListener('click', onOpenSettings);
  document.getElementById('cookie-settings-close')?.addEventListener('click', onCloseSettings);
  document.getElementById('cookie-settings-save')?.addEventListener('click', onSaveSettings);
  dialog.addEventListener('click', onDialogBackdropClick);

  // Öffentlicher Hook, damit ein Link (z.B. im Footer: "Cookie-Einstellungen")
  // die Auswahl jederzeit erneut öffnen kann, ohne den localStorage-Eintrag
  // zu löschen.
  const onReopenRequest = () => {
    const current = getStoredConsent();
    analyticsBox.checked = current?.analytics ?? false;
    marketingBox.checked = current?.marketing ?? false;
    dialog.showModal();
  };
  document.addEventListener('cookie-consent-reopen', onReopenRequest);

  // Beliebige Elemente (z.B. der Footer-Link "Cookie-Einstellungen") können
  // die Auswahl per data-Attribut erneut öffnen, ohne eigenen JS-Code.
  document.querySelectorAll<HTMLElement>('[data-cookie-reopen]').forEach((el) => {
    el.addEventListener('click', onReopenRequest);
    cleanups.push(() => el.removeEventListener('click', onReopenRequest));
  });

  cleanups.push(() => {
    document.getElementById('cookie-accept')?.removeEventListener('click', onAcceptAll);
    document.getElementById('cookie-reject')?.removeEventListener('click', onRejectAll);
    document.getElementById('cookie-settings-open')?.removeEventListener('click', onOpenSettings);
    document.getElementById('cookie-settings-close')?.removeEventListener('click', onCloseSettings);
    document.getElementById('cookie-settings-save')?.removeEventListener('click', onSaveSettings);
    dialog.removeEventListener('click', onDialogBackdropClick);
    document.removeEventListener('cookie-consent-reopen', onReopenRequest);
    if (dialog.open) dialog.close();
  });

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

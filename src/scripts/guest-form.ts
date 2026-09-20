// Progressive Enhancement für das Gast-vorschlagen-Formular.
//
// Versand über Formspree (https://formspree.io) – ein reiner Form-as-a-
// Service-Anbieter, der mit statischem Hosting (GitHub Pages) funktioniert,
// ohne eigenen Server. Die Formular-Endpunkt-URL ist keine geheime
// Zugangsdaten (sie steht ohnehin im ausgelieferten Client-Bundle), wird
// aber trotzdem über eine PUBLIC_-Environment-Variable statt hart codiert
// gepflegt, siehe .env.example. Ohne gesetzten Wert bleibt das Formular wie
// zuvor unverdrahtet und kommuniziert das transparent.
//
// Siehe Kommentar in mobile-nav.ts zu init()/"astro:page-load".
export {};

const ENDPOINT: string | null = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT ?? null;

let cleanup: (() => void) | null = null;

function init() {
  cleanup?.();
  const cleanups: (() => void)[] = [];

  const form = document.getElementById('guest-form') as HTMLFormElement | null;
  const statusEl = document.getElementById('guest-form-status');
  const submitBtn = document.getElementById('guest-form-submit') as HTMLButtonElement | null;

  const selfNominate = document.getElementById('nominate-self') as HTMLInputElement | null;
  const otherNominate = document.getElementById('nominate-other') as HTMLInputElement | null;
  const nameField = document.getElementById('guest-name-field');

  function updateNomineeVisibility() {
    if (!nameField) return;
    const isSelf = selfNominate?.checked;
    nameField.classList.toggle('hidden', Boolean(isSelf));
  }

  selfNominate?.addEventListener('change', updateNomineeVisibility);
  otherNominate?.addEventListener('change', updateNomineeVisibility);
  updateNomineeVisibility();
  if (selfNominate) cleanups.push(() => selfNominate.removeEventListener('change', updateNomineeVisibility));
  if (otherNominate) cleanups.push(() => otherNominate.removeEventListener('change', updateNomineeVisibility));

  const onSubmit = async (event: SubmitEvent) => {
    if (!ENDPOINT) {
      // Kein Backend angebunden: Formular nicht wirklich absenden, sondern
      // transparent kommunizieren, dass V1 hier noch nicht verdrahtet ist.
      event.preventDefault();
      if (statusEl) {
        statusEl.textContent =
          'Formular ist technisch vorbereitet, aber noch nicht mit einem Versand-Endpunkt verbunden. Siehe README.md.';
        statusEl.className = 'mt-4 text-sm text-stone';
      }
      return;
    }

    event.preventDefault();
    if (!submitBtn || !form) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet …';

    try {
      const formData = new FormData(form);
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Request failed');

      form.reset();
      updateNomineeVisibility();
      if (statusEl) {
        statusEl.textContent = 'Danke! Dein Vorschlag ist angekommen – wir melden uns.';
        statusEl.className = 'mt-4 text-sm text-accent';
      }
    } catch (error) {
      if (statusEl) {
        statusEl.textContent = 'Etwas ist schiefgelaufen. Bitte versuche es später erneut.';
        statusEl.className = 'mt-4 text-sm text-accent';
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Gast vorschlagen';
    }
  };

  form?.addEventListener('submit', onSubmit);
  if (form) cleanups.push(() => form.removeEventListener('submit', onSubmit));

  cleanup = () => cleanups.forEach((fn) => fn());
}

document.addEventListener('astro:before-swap', () => cleanup?.());
document.addEventListener('astro:page-load', init);
init();

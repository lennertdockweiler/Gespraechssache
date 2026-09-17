// Progressive Enhancement für das Gast-vorschlagen-Formular.
//
// V1 hat noch kein Backend angebunden. Dieses Skript ist bewusst so gebaut,
// dass es EINEN zentralen Punkt gibt, an dem später ein echter Endpunkt
// (Netlify Forms, Formspree, eine eigene API-Route o.ä.) eingehängt wird –
// siehe ENDPOINT weiter unten und README.md, Abschnitt "Formular anbinden".
const ENDPOINT: string | null = null; // TODO: Formular-Endpunkt eintragen.

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

form?.addEventListener('submit', async (event) => {
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
  if (!submitBtn) return;

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
});

// Hochwertiges mobiles Menü: Toggle + Escape-Taste + Klick außerhalb.
const toggle = document.getElementById('mobile-nav-toggle');
const panel = document.getElementById('mobile-nav-panel');
const closeBtn = document.getElementById('mobile-nav-close');

if (toggle && panel) {
  const open = () => {
    panel.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    toggle.setAttribute('aria-expanded', 'true');
    const firstLink = panel.querySelector<HTMLElement>('a');
    firstLink?.focus();
  };

  const close = () => {
    panel.classList.add('hidden');
    document.body.style.overflow = '';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? close() : open();
  });

  closeBtn?.addEventListener('click', close);

  panel.addEventListener('click', (event) => {
    if (event.target === panel) close();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      close();
    }
  });
}

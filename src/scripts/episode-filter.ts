// Client-seitiger Filter für die Gespräche-Übersicht. Kein Framework nötig:
// Buttons setzen data-active, Cards werden per data-category ein-/ausgeblendet.
const filterBar = document.getElementById('episode-filter');
const cards = document.querySelectorAll<HTMLElement>('[data-episode-card]');
const emptyState = document.getElementById('episode-empty-state');
const searchInput = document.getElementById('episode-search') as HTMLInputElement | null;

let activeCategory = 'Alle';

function applyFilters() {
  const query = (searchInput?.value ?? '').trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category ?? '';
    const searchable = card.dataset.searchable ?? '';
    const matchesCategory = activeCategory === 'Alle' || category === activeCategory;
    const matchesSearch = query === '' || searchable.includes(query);
    const visible = matchesCategory && matchesSearch;
    card.classList.toggle('hidden', !visible);
    if (visible) visibleCount += 1;
  });

  emptyState?.classList.toggle('hidden', visibleCount !== 0);
}

if (filterBar) {
  const buttons = filterBar.querySelectorAll<HTMLButtonElement>('[data-filter-value]');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.filterValue ?? 'Alle';
      buttons.forEach((btn) => {
        const isActive = btn === button;
        btn.setAttribute('aria-pressed', String(isActive));
        btn.classList.toggle('bg-ink', isActive);
        btn.classList.toggle('text-paper', isActive);
        btn.classList.toggle('border-ink', isActive);
        btn.classList.toggle('text-ink', !isActive);
      });
      applyFilters();
    });
  });
}

searchInput?.addEventListener('input', applyFilters);

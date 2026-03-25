/**
 * Attentube — SearchForm Component
 * Renders the search input and handles submission.
 */

/**
 * @param {(query: string) => void} onSearch
 * @param {string} [initialValue]
 * @returns {HTMLElement}
 */
export function SearchForm(onSearch, initialValue = '') {
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.setAttribute('aria-label', 'Search YouTube videos');

  form.innerHTML = `
    <label for="search-input" class="sr-only">Search YouTube</label>
    <input
      id="search-input"
      class="search-form__input"
      type="search"
      name="q"
      placeholder="Search for videos…"
      autocomplete="off"
      autocorrect="off"
      spellcheck="false"
      value="${escapeAttr(initialValue)}"
      aria-label="Search YouTube videos"
    />
    <button class="search-form__btn" type="submit" aria-label="Search">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <span>Search</span>
    </button>
  `;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[name="q"]');
    const query = input.value.trim();
    if (query) onSearch(query);
  });

  return form;
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

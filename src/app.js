/**
 * Attentube — Main Application Controller
 *
 * State machine:
 *   idle → searching → results
 *                   ↳ player (on video click)
 *                   ↕ back to results
 */

import { searchVideos } from './utils/youtube.js';
import { VideoCard } from './components/VideoCard.js';
import { Config } from './utils/config.js';
import { VideoPlayer } from './components/VideoPlayer.js';
import { SearchForm } from './components/SearchForm.js';

// ── App State ──────────────────────────────────────────────

/** @type {{ view: 'idle'|'loading'|'results'|'player', query: string, results: any[], currentVideo: any|null, nextPageToken: string|null, totalResults: number, error: string|null }} */
const state = {
  view: 'idle',
  query: '',
  results: [],
  currentVideo: null,
  nextPageToken: null,
  totalResults: 0,
  error: null,
};

// ── DOM References ─────────────────────────────────────────

const $hero        = document.getElementById('hero');
const $main        = document.getElementById('main-content');
const $searchMount = document.getElementById('search-mount');
const $themeToggle = document.getElementById('theme-toggle');

// ── Theme ──────────────────────────────────────────────────

(function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = prefersDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
})();

$themeToggle?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  if (!$themeToggle) return;
  if (theme === 'dark') {
    $themeToggle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`;
    $themeToggle.setAttribute('aria-label', 'Switch to light mode');
  } else {
    $themeToggle.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>`;
    $themeToggle.setAttribute('aria-label', 'Switch to dark mode');
  }
}

// ── Search Form Mount ──────────────────────────────────────

function mountSearchForm(initialValue = '') {
  if (!$searchMount) return;
  $searchMount.innerHTML = '';
  $searchMount.appendChild(SearchForm(handleSearch, initialValue));
}

mountSearchForm();

// ── Handlers ──────────────────────────────────────────────

async function handleSearch(query) {
  state.query = query;
  state.view = 'loading';
  state.results = [];
  state.nextPageToken = null;
  state.error = null;

  // Compact the hero
  $hero?.classList.add('hero--compact');
  $hero?.querySelector('.hero__title')?.classList.add('sr-only');
  $hero?.querySelector('.hero__subtitle')?.classList.add('sr-only');
  $hero?.querySelector('.hero__eyebrow')?.classList.add('sr-only');

  // Update search input with current query
  mountSearchForm(query);

  renderLoading();

  try {
    const { items, nextPageToken, totalResults } = await searchVideos(query);
    state.results = items;
    state.nextPageToken = nextPageToken;
    state.totalResults = totalResults;
    state.view = 'results';
    renderResults();
  } catch (err) {
    state.view = 'results';
    state.error = formatError(err);
    renderError(state.error);
  }
}

function handleVideoClick(video) {
  state.currentVideo = video;
  state.view = 'player';

  // Scroll to top of main
  $main.scrollIntoView({ behavior: 'smooth' });

  renderPlayer();
}

function handleBackToResults() {
  state.view = 'results';
  state.currentVideo = null;
  renderResults();
}

// ── Render Functions ───────────────────────────────────────

function renderLoading() {
  $main.innerHTML = '';
  const section = document.createElement('div');
  section.className = 'results-section';

  // Skeleton grid
  const grid = document.createElement('div');
  grid.className = 'video-grid';
  grid.setAttribute('aria-busy', 'true');
  grid.setAttribute('aria-label', 'Loading search results');

  for (let i = 0; i < 12; i++) {
    grid.appendChild(skeletonCard());
  }

  section.appendChild(grid);
  $main.appendChild(section);
}

function renderResults() {
  $main.innerHTML = '';

  if (state.error) {
    renderError(state.error);
    return;
  }

  if (!state.results.length) {
    renderEmpty();
    return;
  }

  const section = document.createElement('div');
  section.className = 'results-section';

  // Header
  const header = document.createElement('div');
  header.className = 'results-section__header';
  header.innerHTML = `
    <p class="results-section__count">
      Results for <span class="results-section__query">${escapeHtml(state.query)}</span>
    </p>
  `;
  section.appendChild(header);

  // Grid
  const grid = document.createElement('div');
  grid.className = 'video-grid';
  grid.setAttribute('role', 'list');

  for (const video of state.results) {
    const card = VideoCard(video, handleVideoClick);
    card.setAttribute('role', 'listitem');
    grid.appendChild(card);
  }

  section.appendChild(grid);
  $main.appendChild(section);
}

function renderPlayer() {
  $main.innerHTML = '';
  $main.appendChild(VideoPlayer(state.currentVideo, handleBackToResults));
}

function renderEmpty() {
  $main.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'state-container fade-in';
  el.innerHTML = `
    <svg class="state-container__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <h2 class="state-container__title">No results found</h2>
    <p class="state-container__body">Try a different search term or check your spelling.</p>
  `;
  $main.appendChild(el);
}

function renderError(message) {
  $main.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'state-container fade-in';
  el.innerHTML = `
    <svg class="state-container__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <h2 class="state-container__title">Something went wrong</h2>
    <p class="state-container__body">${escapeHtml(message)}</p>
  `;
  $main.appendChild(el);
}

// ── Helpers ────────────────────────────────────────────────

function skeletonCard() {
  const card = document.createElement('div');
  card.className = 'skeleton-card';
  card.setAttribute('aria-hidden', 'true');
  card.innerHTML = `
    <div class="skeleton skeleton-thumb"></div>
    <div class="skeleton-body">
      <div class="skeleton skeleton-line skeleton-line--long"></div>
      <div class="skeleton skeleton-line skeleton-line--medium"></div>
      <div class="skeleton skeleton-line skeleton-line--tiny"></div>
    </div>
  `;
  return card;
}

function formatError(err) {
  if (err?.name === 'APIError') {
    if (err.status === 403) return 'API quota exceeded or key invalid. Check your YouTube API key.';
    if (err.status === 400) return 'Invalid search request. Please try again.';
    return err.message || 'API error. Please try again.';
  }
  if (err?.message === 'NO_API_KEY') {
    return 'No API key configured. See README.md for setup instructions.';
  }
  return 'Network error. Please check your connection and try again.';
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

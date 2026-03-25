/**
 * Attentube — VideoPlayer Component
 * Renders the embedded video player and video info.
 */

import { buildEmbedUrl } from '../utils/youtube.js';

/**
 * Build the player section HTML.
 * @param {import('../utils/youtube.js').VideoItem} video
 * @param {() => void} onBack - callback to return to results
 * @returns {HTMLElement}
 */
export function VideoPlayer(video, onBack) {
  const section = document.createElement('section');
  section.className = 'player-section fade-in';
  section.setAttribute('aria-label', `Now playing: ${video.title}`);

  const embedUrl = buildEmbedUrl(video.id);

  section.innerHTML = `
    <button class="player-section__back" aria-label="Back to search results">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
      Back to results
    </button>

    <div class="player-wrapper">
      <iframe
        src="${embedUrl}"
        title="${escapeHtml(video.title)}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>

    <div class="player-info">
      <h2 class="player-info__title">${escapeHtml(video.title)}</h2>
      <p class="player-info__channel">${escapeHtml(video.channelTitle)}</p>
      ${video.description
        ? `<p class="player-info__description">${escapeHtml(truncate(video.description, 280))}</p>`
        : ''}
    </div>
  `;

  section.querySelector('.player-section__back').addEventListener('click', onBack);

  return section;
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

function truncate(str, max) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max).trimEnd() + '…';
}

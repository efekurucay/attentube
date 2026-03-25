/**
 * Attentube — VideoCard Component
 * Renders a single video card in the results grid.
 */

import { formatRelativeDate } from '../utils/youtube.js';

/**
 * Create and return a video card DOM element.
 * @param {import('../utils/youtube.js').VideoItem} video
 * @param {(video: import('../utils/youtube.js').VideoItem) => void} onClick
 * @returns {HTMLElement}
 */
export function VideoCard(video, onClick) {
  const card = document.createElement('article');
  card.className = 'video-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Play: ${video.title}`);
  card.setAttribute('data-video-id', video.id);

  const relDate = formatRelativeDate(video.publishedAt);

  card.innerHTML = `
    <div class="video-card__thumb-wrapper">
      <img
        class="video-card__thumb"
        src="${escapeHtml(video.thumbnail.url)}"
        alt="${escapeHtml(video.title)}"
        loading="lazy"
        decoding="async"
        width="${video.thumbnail.width || 480}"
        height="${video.thumbnail.height || 360}"
      />
      <div class="video-card__play-overlay" aria-hidden="true">
        <div class="video-card__play-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      ${video.duration ? `<span class="video-card__duration">${escapeHtml(video.duration)}</span>` : ''}
    </div>
    <div class="video-card__body">
      <h3 class="video-card__title">${escapeHtml(video.title)}</h3>
      <p class="video-card__channel">${escapeHtml(video.channelTitle)}</p>
      <div class="video-card__meta">
        ${video.viewCount ? `<span>${escapeHtml(video.viewCount)}</span>` : ''}
        ${video.viewCount && relDate ? `<span class="video-card__meta-dot" aria-hidden="true"></span>` : ''}
        ${relDate ? `<span>${escapeHtml(relDate)}</span>` : ''}
      </div>
    </div>
  `;

  const activate = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (e.key === ' ') e.preventDefault();
    onClick(video);
  };

  card.addEventListener('click', activate);
  card.addEventListener('keydown', activate);

  return card;
}

/** Safe HTML escaping */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

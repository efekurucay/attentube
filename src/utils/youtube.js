/**
 * Attentube — YouTube Data API v3 Client
 * Clean, minimal wrapper around the search and video endpoints.
 */

import { Config } from './config.js';

/**
 * @typedef {Object} VideoItem
 * @property {string} id
 * @property {string} title
 * @property {string} channelTitle
 * @property {string} description
 * @property {string} publishedAt
 * @property {{ url: string, width: number, height: number }} thumbnail
 * @property {string|null} duration  — ISO 8601 or null if not fetched
 * @property {string|null} viewCount
 */

/**
 * Search YouTube for videos matching a query.
 * @param {string} query
 * @param {string|null} pageToken — for pagination
 * @returns {Promise<{ items: VideoItem[], nextPageToken: string|null, totalResults: number }>}
 */
export async function searchVideos(query, pageToken = null) {
  const apiKey = Config.getApiKey();
  if (!apiKey) throw new Error('NO_API_KEY');

  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    q: query,
    maxResults: String(Config.MAX_RESULTS),
    key: apiKey,
    safeSearch: 'moderate',
    videoEmbeddable: 'true',
  });

  if (pageToken) params.set('pageToken', pageToken);

  const res = await fetch(`${Config.YT_API_BASE}/search?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new APIError(res.status, err?.error?.message || 'Search failed');
  }

  const data = await res.json();

  const ids = data.items
    .filter(i => i.id?.videoId)
    .map(i => i.id.videoId)
    .join(',');

  // Fetch video details (duration + viewCount) in parallel
  let details = {};
  if (ids) {
    try {
      details = await fetchVideoDetails(ids, apiKey);
    } catch (_) {
      // Non-fatal — we'll just show without duration/views
    }
  }

  const items = data.items
    .filter(i => i.id?.videoId)
    .map(i => normalizeVideo(i, details[i.id.videoId]));

  return {
    items,
    nextPageToken: data.nextPageToken || null,
    totalResults: data.pageInfo?.totalResults ?? 0,
  };
}

/**
 * Fetch details (duration, viewCount) for a comma-separated list of video IDs.
 * @param {string} ids
 * @param {string} apiKey
 * @returns {Promise<Record<string, { duration: string, viewCount: string }>>}
 */
async function fetchVideoDetails(ids, apiKey) {
  const params = new URLSearchParams({
    part: 'contentDetails,statistics',
    id: ids,
    key: apiKey,
  });

  const res = await fetch(`${Config.YT_API_BASE}/videos?${params}`);
  if (!res.ok) return {};

  const data = await res.json();
  const map = {};
  for (const item of data.items ?? []) {
    map[item.id] = {
      duration: item.contentDetails?.duration || null,
      viewCount: item.statistics?.viewCount || null,
    };
  }
  return map;
}

/**
 * Normalize a raw YouTube search item into a clean VideoItem.
 */
function normalizeVideo(raw, details = {}) {
  const s = raw.snippet;
  const thumb =
    s.thumbnails?.maxres ||
    s.thumbnails?.high ||
    s.thumbnails?.medium ||
    s.thumbnails?.default;

  return {
    id: raw.id.videoId,
    title: decodeHtmlEntities(s.title),
    channelTitle: decodeHtmlEntities(s.channelTitle),
    description: decodeHtmlEntities(s.description || ''),
    publishedAt: s.publishedAt,
    thumbnail: thumb || { url: '', width: 480, height: 360 },
    duration: details.duration ? parseDuration(details.duration) : null,
    viewCount: details.viewCount ? formatCount(details.viewCount) : null,
  };
}

/**
 * Decode HTML entities returned by YouTube API (e.g. &#39; → ').
 * @param {string} str
 * @returns {string}
 */
function decodeHtmlEntities(str) {
  if (!str) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

/**
 * Parse ISO 8601 duration (e.g. PT4M13S → "4:13").
 * @param {string} iso
 * @returns {string}
 */
export function parseDuration(iso) {
  if (!iso) return '';
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '';
  const [, h, m, s] = match;
  const hours   = parseInt(h || '0');
  const minutes = parseInt(m || '0');
  const seconds = parseInt(s || '0');
  const mm = String(minutes).padStart(hours ? 2 : 1, '0');
  const ss = String(seconds).padStart(2, '0');
  return hours ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Format a large number into a human-readable string.
 * @param {string|number} n
 * @returns {string}
 */
export function formatCount(n) {
  const num = typeof n === 'string' ? parseInt(n, 10) : n;
  if (isNaN(num)) return '';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M views`;
  if (num >= 1_000)     return `${(num / 1_000).toFixed(0)}K views`;
  return `${num} views`;
}

/**
 * Format a UTC date string to relative time.
 * @param {string} dateStr
 * @returns {string}
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)           return 'just now';
  if (s < 3600)         return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)        return `${Math.floor(s / 3600)}h ago`;
  if (s < 2592000)      return `${Math.floor(s / 86400)}d ago`;
  if (s < 31536000)     return `${Math.floor(s / 2592000)}mo ago`;
  return `${Math.floor(s / 31536000)}yr ago`;
}

/**
 * Build a YouTube embed URL with privacy-enhanced mode.
 * @param {string} videoId
 * @returns {string}
 */
export function buildEmbedUrl(videoId) {
  return `${Config.YT_EMBED_BASE}/${videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=0`;
}

/** Custom error class for API errors. */
export class APIError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

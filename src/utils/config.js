/**
 * Attentube — Configuration
 * API key is read from VITE_YOUTUBE_API_KEY environment variable.
 * Set it in .env (local) or in Coolify environment variables.
 */

export const Config = {
  YT_API_BASE: 'https://www.googleapis.com/youtube/v3',
  MAX_RESULTS: 24,
  YT_EMBED_BASE: 'https://www.youtube.com/embed',
  YT_WATCH_BASE: 'https://www.youtube.com/watch',

  getApiKey() {
    return import.meta.env.VITE_YOUTUBE_API_KEY || null;
  },
};

<div align="center">

<!-- Logo / Banner -->
<br/>

```
 █████╗ ████████╗████████╗███████╗███╗   ██╗████████╗██╗   ██╗██████╗ ███████╗
██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝██║   ██║██╔══██╗██╔════╝
███████║   ██║      ██║   █████╗  ██╔██╗ ██║   ██║   ██║   ██║██████╔╝█████╗
██╔══██║   ██║      ██║   ██╔══╝  ██║╚██╗██║   ██║   ██║   ██║██╔══██╗██╔══╝
██║  ██║   ██║      ██║   ███████╗██║ ╚████║   ██║   ╚██████╔╝██████╔╝███████╗
╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═════╝ ╚══════╝
```

**Watch YouTube. Just the video. Nothing else.**

<br/>

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg?style=flat-square)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4-red?style=flat-square)](https://github.com/efekurucay/attentube)
[![YouTube Data API](https://img.shields.io/badge/YouTube%20Data%20API-v3-red?style=flat-square&logo=youtube)](https://developers.google.com/youtube/v3)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-yellow?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML-5-orange?style=flat-square&logo=html5)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS-3-blue?style=flat-square&logo=css3)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

<br/>

> **Attentube** strips YouTube down to its core: search and watch.  
> No recommendations. No sidebar clutter. No comment sections pulling you in.  
> Just the video you chose to watch.

<br/>

</div>

---

## The Problem

YouTube is engineered to capture attention. Every page element — the sidebar, the autoplay queue, the comments, the notification bell — is designed to keep you watching longer than you intended.

Attentube removes all of it. You search, you click, you watch. Then you leave.

---

## Features

- **Clean search** — Powered by the YouTube Data API v3. Results only, no fluff.
- **Distraction-free player** — Embedded playback with `rel=0` and `modestbranding=1`. No related videos.
- **Zero recommendations** — No algorithm-driven sidebar or autoplay queue.
- **Dark & light mode** — System-preference aware, manually toggleable.
- **Keyboard accessible** — Full keyboard navigation.
- **Fast** — Pure HTML/CSS/JS. No framework, no bundler. Instant load.
- **Skeleton loaders** — Smooth loading states while results fetch.
- **Responsive** — Works on all screen sizes.

---

## Screenshots

> _Search for anything, click a result, and it plays directly on the page — no YouTube tabs, no algorithm rabbit holes._

| Search View | Player View |
|---|---|
| Clean search grid | Embedded player, no distractions |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/efekurucay/attentube.git
cd attentube
```

### 2. Set up your YouTube API key

Attentube requires a [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started) key.

```bash
# Copy the example env file
cp .env.example .env

# Open .env and fill in your key
# YOUTUBE_API_KEY=your_key_here
```

Then generate the gitignored `config.js`:

```bash
node scripts/generate-config.js
```

> **Security note:** `config.js` is in `.gitignore` and will never be committed.  
> The API key lives only in your local `.env` and the generated `config.js`.

### 3. Serve locally

Any static file server works. Examples:

```bash
# Python (built-in)
python3 -m http.server 8080

# Node (npx)
npx serve .

# VS Code Live Server
# Right-click index.html → Open with Live Server
```

Then open [http://localhost:8080](http://localhost:8080).

---

## Configuration

| Variable | Description |
|---|---|
| `YOUTUBE_API_KEY` | Your YouTube Data API v3 key. Required. |

The key is injected at runtime via `window.ATTENTUBE_CONFIG.apiKey` from the gitignored `config.js`.  
If you're deploying to a server, your server-side template/build step should inject this object.

---

## Project Structure

```
attentube/
├── index.html                  # App entry point
├── config.js                   # 🔒 Gitignored — runtime API key injection
├── .env.example                # Copy to .env and fill in your key
├── .gitignore
├── LICENSE
├── README.md
│
├── src/
│   ├── app.js                  # Main application controller (state machine)
│   ├── components/
│   │   ├── SearchForm.js       # Search input component
│   │   ├── VideoCard.js        # Video card component
│   │   └── VideoPlayer.js      # Embedded player component
│   ├── utils/
│   │   ├── config.js           # Config & API key resolution
│   │   └── youtube.js          # YouTube Data API v3 client
│   └── styles/
│       ├── tokens.css          # Design tokens (color, type, spacing)
│       ├── base.css            # CSS reset & global styles
│       └── components.css      # Component styles
│
└── scripts/
    └── generate-config.js      # Generates gitignored config.js from .env
```

### Architecture Notes

- **No framework, no bundler** — Pure ES modules (`type="module"`). Runs directly in the browser.
- **Clean state machine** — `app.js` manages app state transitions: `idle → loading → results → player`.
- **Component pattern** — Each component is a pure function that returns a DOM element.
- **API separation** — `youtube.js` is a standalone client module with no UI dependencies.
- **Key never in source** — The API key is loaded at runtime from a gitignored file, never hardcoded.

---

## API Usage & Quotas

Attentube uses the [YouTube Data API v3](https://developers.google.com/youtube/v3/getting-started).

| Endpoint | Cost per call | Calls per search |
|---|---|---|
| `search.list` | 100 units | 1 |
| `videos.list` | 1 unit | 1 |

The default free quota is **10,000 units/day** — enough for ~100 searches per day. For higher volume, request a quota increase in [Google Cloud Console](https://console.cloud.google.com/).

---

## Roadmap

- [ ] Keyboard shortcut to focus search from anywhere (`/`)
- [ ] Search history (in-memory, session only)
- [ ] "Focus timer" overlay — set a watch limit
- [ ] Channel filter in search
- [ ] Pagination / load more results

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/focus-timer`
3. Commit your changes: `git commit -m 'add: focus timer overlay'`
4. Push and open a PR

Please keep PRs focused and include a clear description of what changed and why.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with focus by [efekurucay](https://github.com/efekurucay)  
Powered by [YouTube Data API v3](https://developers.google.com/youtube/v3)  
<a href="https://www.perplexity.ai/computer" target="_blank" rel="noopener noreferrer">Created with Perplexity Computer</a>

</div>

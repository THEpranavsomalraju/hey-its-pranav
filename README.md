# hey-its-pranav

Pranav Somalraju's personal site. A single page laid out like a document, with three tabs: Home (bio, recent wins, contact, a live GitHub contribution skyline, and what's been playing on Spotify), Experience (a timeline), and Projects (a network of shared tools feeding into each project, with the project's details underneath).

Live at **https://pranavsomalraju.dev**

Plain HTML, CSS, and vanilla JS. No build step and no dependencies; the only server-side pieces are two Vercel functions, one reading GitHub and one reading Spotify.

## Structure

- `index.html` — page markup, plus the social preview and favicon tags. One tiny inline script in `<head>` applies the saved theme before first paint.
- `css/styles.css` — all styles
- `js/app.js` — page behavior: tabs and routing (`#home`, `#experience`, `#projects`, `#projects/<id>`), theme toggle, the projects network and its readout, the command palette (`/` or ⌘K), letter scrambling, the bio's highlighter, and loading the two live sections
- `js/skyline.js` — the contribution skyline, a dependency-free port of the React `contribution-skyline` component
- `js/squeeze.js` — the listening carousel, a dependency-free port of the React `carousel-squeeze` component
- `api/contributions.js` — Vercel function returning the year's GitHub contribution calendar
- `api/listening.js` — Vercel function returning the current Spotify track and recently played ones, with album art
- `scripts/spotify-token.mjs` — one-time local helper that mints the Spotify refresh token
- `portrait.jpg` — the portrait at the top of the page
- `img/` — the timeline logos (cropped to their visible edges; `unchealth-dark.svg` is the reversed mark for dark mode) and `card.png`, the 1200×630 social share card
- `favicon.svg`, `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` — the **ps** monogram. The SVG reverses itself in dark browsers; the rasters are the ink tile, and the touch icon is full-bleed because iOS rounds it

`api/` is CommonJS on purpose: with no `package.json` a `.js` file is CJS on Vercel, so an ESM `export default` would fail at runtime. The local helper is `.mjs` and is therefore unambiguously ESM.

Image paths are absolute (`/img/...`) everywhere, including in `url()` inside inline styles, so they mean the same thing from the page and from the stylesheet.

## Running locally

For everything except the two live sections, serve the folder:

```bash
python3 -m http.server 8000
```

That has no `/api` route, so the skyline and the listening carousel stay hidden; both only render when their endpoint returns data. To run the functions too:

```bash
vercel dev            # serves the site and /api together
```

## GitHub contributions

`api/contributions.js` works with no setup: it reads the public contribution calendar GitHub renders on the profile. That page's markup is not a stable API, so for something sturdier set `GITHUB_TOKEN` in the Vercel project (a fine-grained token with no extra permissions is enough) and it switches to the GraphQL API. Responses are edge-cached for ten minutes.

## Spotify

`api/listening.js` needs three environment variables:

| Variable | Where it comes from |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | Spotify app dashboard |
| `SPOTIFY_CLIENT_SECRET` | Spotify app dashboard |
| `SPOTIFY_REFRESH_TOKEN` | `scripts/spotify-token.mjs` |

The token needs the `user-read-currently-playing` and `user-read-recently-played` scopes, which is what the helper asks for. In production these live in the Vercel project settings. Locally they go in `.env`, which is gitignored. Never commit them, and never put them in `js/`, which anyone can read.

### Re-minting the refresh token

The refresh token does not expire, but revoking access or resetting the client secret invalidates it. When that happens the listening section silently disappears (it is built to fail quietly rather than show an error), so this is the first thing to check.

```bash
node --env-file=.env scripts/spotify-token.mjs
```

Open the URL it prints, approve, and it prints a new token. Add it to `.env` and to the Vercel env vars.

The Spotify app's Redirect URIs must contain exactly `http://127.0.0.1:8888/callback`. Spotify rejects `localhost`, and a mismatch here is the usual cause of `INVALID_CLIENT`.

## Deploying

Pushes to `main` deploy to production automatically.

Two things that are easy to get wrong:

- **Environment variables are baked in at build time.** Adding or changing one does nothing until the next deploy. Redeploy from the dashboard, or push a commit.
- **`og:url` and `og:image` are absolute URLs** and appear three times in `index.html`. Crawlers do not reliably resolve relative ones, so a stale domain means the link preview does not render at all. After changing them, force a re-scrape with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), which also clears their cache.

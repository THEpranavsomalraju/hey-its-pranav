# hey-its-pranav

Pranav Somalraju's personal site — a single-page portfolio covering education, research, projects, and contact info.

Live at **https://pranavsomalraju.dev**

Plain HTML, CSS, and vanilla JS. No build step and no dependencies; the only server-side piece is one Vercel function that reads Spotify.

## Structure

- `index.html` — page markup, plus the social preview and favicon tags. Keeps one tiny inline script in `<head>` (scroll-restore / `.js` class) that has to run before first paint; everything else lives in `css/` and `js/`.
- `css/styles.css` — all styles
- `js/script.js` — all page behavior (intro curtain, theme toggle, scroll reveals, forward-pass timeline, projects network, now-playing sticker, ticker bands)
- `api/now-playing.js` — Vercel serverless function returning the current or last-played Spotify track
- `scripts/spotify-token.mjs` — one-time local helper that mints the Spotify refresh token
- `portrait.jpg` — hero portrait
- `img/` — school logos and `og.png`, the 1200×630 social share card
- `favicon.ico`, `favicon-32.png`, `apple-touch-icon.png` — the **P** monogram

`api/` is CommonJS on purpose: with no `package.json` a `.js` file is CJS on Vercel, so an ESM `export default` would fail at runtime. The local helper is `.mjs` and is therefore unambiguously ESM.

## Running locally

For everything except the Spotify sticker, serve the folder:

```bash
python3 -m http.server 8000
```

That has no `/api` route, so the now-playing sticker stays hidden — by design; it only appears when the endpoint returns a track. To run the function too:

```bash
vercel dev            # serves the site and /api together
```

## Spotify now-playing

The sticker at the top right of the portrait shows the current track, falling back to the last played one. It needs three environment variables:

| Variable | Where it comes from |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | Spotify app dashboard |
| `SPOTIFY_CLIENT_SECRET` | Spotify app dashboard |
| `SPOTIFY_REFRESH_TOKEN` | `scripts/spotify-token.mjs` |

In production these live in the Vercel project settings. Locally they go in `.env`, which is gitignored — never commit them, and never put them in `js/script.js`, which anyone can read.

### Re-minting the refresh token

The refresh token does not expire, but revoking access or resetting the client secret invalidates it. When that happens the sticker silently disappears — it is built to fail quietly rather than show an error — so this is the first thing to check.

```bash
node --env-file=.env scripts/spotify-token.mjs
```

Open the URL it prints, approve, and it prints a new token. Add it to `.env` and to the Vercel env vars.

The Spotify app's Redirect URIs must contain exactly `http://127.0.0.1:8888/callback`. Spotify rejects `localhost`, and a mismatch here is the usual cause of `INVALID_CLIENT`.

## Deploying

Pushes to `main` deploy to production automatically.

Two things that are easy to get wrong:

- **Environment variables are baked in at build time.** Adding or changing one does nothing until the next deploy — redeploy from the dashboard, or push a commit.
- **`og:url` and `og:image` are absolute URLs** and appear three times in `index.html`. Crawlers do not reliably resolve relative ones, so a stale domain means the link preview does not render at all. Update them when a custom domain lands, then force a re-scrape with [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/), which also clears their cache.

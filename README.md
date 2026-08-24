# hey-its-pranav

Pranav Somalraju's personal site — a single-page portfolio covering education, research, projects, and contact info.

Built with plain HTML, CSS, and vanilla JS. No build step, no dependencies.

## Structure

- `index.html` — page markup. Keeps one tiny inline script in `<head>` (scroll-restore / `.js` class) that has to run before first paint, and everything else in `css/` and `js/`.
- `css/styles.css` — all styles
- `js/script.js` — all page behavior (intro curtain, theme toggle, scroll reveals, projects network, ticker bands, etc.)
- `portrait.jpg` — hero portrait image

## Running locally

Just open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Deploying

Not yet deployed — planned for Vercel.

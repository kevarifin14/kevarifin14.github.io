# kevinarifin.com

A deliberately simple, static HTML site. No build step, no framework.

## Structure
- `index.html` — home
- `writing.html` — list of posts
- `about.html` — about page
- `posts/` — individual post pages (copy one to add a new post)
- `styles.css` — shared styles
- `CNAME` — custom domain for GitHub Pages
- `.nojekyll` — tells GitHub Pages to serve files as-is (no Jekyll)

## Local preview
Open `index.html` in a browser, or run:

    python3 -m http.server

## Deploy
Pushed to `main`; GitHub Pages serves it at https://kevinarifin.com

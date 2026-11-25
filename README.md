# Adelio Ghosh — Developer Portfolio

A refined, responsive portfolio for computer engineer **Adelio Ghosh**, specializing in AI & ML, Python, Java, and real-world software development.

## Included

- Editorial, responsive portfolio design
- Semantic sections for profile, education, tech stack, projects, and contact
- Accessible mobile navigation, focus states, skip link, and reduced-motion support
- Scroll progress, active-section navigation, subtle reveal animations, and rotating roles
- Dedicated print-ready résumé page
- Search and social metadata, JSON-LD, favicon, `robots.txt`, and `sitemap.xml`
- Optimized WebP hero artwork with PNG fallback

## Run locally

```powershell
python -m http.server 8000
```

Open `http://127.0.0.1:8000`.

## Structure

- `index.html` — portfolio markup and metadata
- `util.css` — complete responsive design system
- `script.js` — navigation, typing, scroll, and reveal interactions
- `resume.html` / `resume.css` — print-ready résumé
- `image.png` / `image.webp` — hero artwork
- `favicon.svg` — site icon
- `robots.txt` / `sitemap.xml` — crawler metadata

## Deployment

This repository is configured for the existing Cloudflare Workers static deployment. Push the `main` branch and the Worker build will publish the updated portfolio.

```powershell
git add .
git commit -m "Redesign developer portfolio"
git push origin main
```

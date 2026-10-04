# Osama Sarfraz — Lead Game Developer Portfolio

Source for [osamasarfraz.github.io](https://osamasarfraz.github.io), the portfolio of Osama Sarfraz, Lead Game Developer specialising in Unity, C#, multiplayer networking and gameplay systems.

---

## 🎮 What's on the site
- **Hero** — a typographic introduction with portrait, headline stats and a "now building" card.
- **Projects** — a filterable grid of all 22 games (filter by genre), each with cover art, store links and a details dialog.
- **Experience, Skills, Education and Achievements** — plain, readable HTML with workplace and university logos.
- **Contact** — LinkedIn, itch.io, email and phone.

Plain HTML, CSS and JavaScript. No framework, no build step, no runtime dependencies.

---

## 📂 Project Structure
```
.
├── index.html                 # The whole page (content lives here as HTML)
├── assets/
│   ├── css/style.css          # Site styles (design tokens at the top)
│   ├── js/
│   │   ├── main.js            # Project grid, filters, dialog, scroll effects
│   │   └── projects.js        # Project data (titles, genres, art, links)
│   └── img/
│       ├── projects/          # Game screenshots and icons
│       ├── companies/         # Workplace and university logos
│       └── osama.jpg
└── _config.yml                # GitHub Pages settings
```

To add or edit a game, update `assets/js/projects.js` — each entry's fields are documented at the top of the file. Square icons are shown as an app tile on a blurred backdrop; wide screenshots fill the card. Projects without art get a generated monogram cover. Experience, skills and the rest are edited directly in `index.html`.

---

## 🧰 Local Preview
The page uses JavaScript modules, so it must be served over HTTP (opening the file directly won't work):
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`.

---

## ⚙️ Deployment
GitHub Pages serves the `main` branch from the repository root. Push to `main` and the site updates within a minute or two.

**Before each deploy that changes CSS or JS**, bump the `?v=` version on the stylesheet and script in `index.html` and on the `import` line in `assets/js/main.js` (search for `?v=`). GitHub Pages lets browsers cache files for 10 minutes; without a new version, returning visitors can briefly get the new page with old styles or scripts.

---

## ♿ Accessibility
- Every project card is real HTML: titles, links and filters all work from the keyboard, and the details dialog is a native `<dialog>`.
- Motion (orbs, reveal-on-scroll, card entrance) is disabled under `prefers-reduced-motion`.
- Text colours meet WCAG AA contrast on their backgrounds.

---

## 🧑‍💻 Author
**Osama Sarfraz**
Lead Game Developer
📧 [osamasarfrazsheikh@gmail.com](mailto:osamasarfrazsheikh@gmail.com)
📞 +92 313 2753719

---

© 2026 Osama Sarfraz. All rights reserved.

# Osama Sarfraz — Lead Game Developer Portfolio

Source for [osamasarfraz.github.io](https://osamasarfraz.github.io), the portfolio of Osama Sarfraz, Lead Game Developer specialising in Unity, C#, multiplayer networking and gameplay systems.

---

## 🎮 What's on the site
- **Hero** — a headline with game-feel physics: the letters drop in and bounce on load, wobble when the cursor brushes them and launch with sparks and screen shake when clicked. Beside it, a tilting portrait card and a "now building" toast; below, a scrolling stack marquee.
- **Projects** — a filterable grid of all 22 games, colour-coded by genre. Cards tilt toward the cursor, filtering animates cards into their new places, and the details dialog zooms out of the card you clicked.
- **Experience, Skills, Education and Achievements** — plain, readable HTML. The timelines fill as you scroll, and achievements "unlock" like in-game badges.
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
│   │   ├── main.js            # Project grid, filters, dialog; starts everything
│   │   ├── hero.js            # Physics headline, sparks canvas, "now building" toast
│   │   ├── fx.js              # Scroll reveals, tilt, sliding pills, timeline rail, menu
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
- Under `prefers-reduced-motion` the page is still: no physics headline, tilt, marquee, reveals or dialog zoom.
- The physics headline keeps the real text for screen readers; the animated letters are hidden from assistive tech.
- Text colours meet WCAG AA contrast on their backgrounds.

---

## 🧑‍💻 Author
**Osama Sarfraz**
Lead Game Developer
📧 [osamasarfrazsheikh@gmail.com](mailto:osamasarfrazsheikh@gmail.com)
📞 +92 313 2753719

---

© 2026 Osama Sarfraz. All rights reserved.

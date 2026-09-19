# Osama Sarfraz — Game Developer & Designer Portfolio

Source for [osamasarfraz.github.io](https://osamasarfraz.github.io), the interactive portfolio of Osama Sarfraz, Lead Game Developer specializing in Unity, C#, multiplayer networking and gameplay systems.

---

## 🎮 What's on the site
- **Bottle-flip hero** — a playable physics mini-game: press, pull down and release (or hold Space) to flip the bottle. Land it upright to build a streak.
- **3D project gallery** — every shipped and in-development game on a rotating ring, with details and store links.
- **Experience, Skills, Education and Achievements** — plain, readable HTML, with workplace and university logos.
- **Contact** — LinkedIn, itch.io, email and phone.

Built with [three.js](https://threejs.org) and [cannon-es](https://github.com/pmndrs/cannon-es), loaded from the jsdelivr CDN — no build step.

---

## 📂 Project Structure
```
.
├── index.html                 # The whole page (content lives here as HTML)
├── assets/
│   ├── css/style.css          # Site styles
│   ├── js/
│   │   ├── main.js            # Wires up the page: hero input, gallery, dialog
│   │   ├── bottle.js          # Renders the bottle-flip scene
│   │   ├── bottle-physics.js  # Flip physics (no rendering; can run in Node)
│   │   ├── gallery.js         # 3D project ring + generated card covers
│   │   └── projects.js        # Project data for the gallery
│   └── img/
│       ├── projects/          # Game screenshots and icons
│       ├── companies/         # Workplace and university logos
│       └── osama.jpg
└── _config.yml                # GitHub Pages settings
```

To add or edit a game, update `assets/js/projects.js`. Experience, skills and the rest are edited directly in `index.html`.

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

---

## ♿ Accessibility
- Every project is also listed as plain HTML for screen readers, and shown as a list when WebGL is unavailable.
- The bottle flip and gallery work from the keyboard; animations calm down under `prefers-reduced-motion`.

---

## 🧑‍💻 Author
**Osama Sarfraz**
Lead Game Developer
📧 [osamasarfrazsheikh@gmail.com](mailto:osamasarfrazsheikh@gmail.com)
📞 +92 313 2753719

---

© 2026 Osama Sarfraz. All rights reserved.

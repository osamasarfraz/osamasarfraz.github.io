# Changelog

All notable changes to this project are documented in this file.

## v3.0.0 - 2026-10-04

- Redesigned the site with a refined dark theme: new palette (ember/amber accent, teal secondary), Space Grotesk headings, glass cards, reveal-on-scroll and a frosted sticky top bar.
- Replaced the bottle-flip mini-game hero with a typographic hero: headline, portrait, stats and a "now building" card.
- Replaced the three.js 3D ring gallery with a filterable project grid (filter by genre). Cards show real art where it exists (icons as tiles on a blurred backdrop, wide screenshots full-bleed) and a generated monogram cover otherwise; featured projects span two columns.
- Added a details dialog per project with genre, status, description and store links.
- Removed three.js and cannon-es (no more CDN dependencies) and the `bottle.js`, `bottle-physics.js` and `gallery.js` modules.
- Added Open Graph tags, a favicon, a skip link and active-section highlighting in the nav.
- Added *Hammy's Cosmic Wheel* (Juniper Dev game jam entry on itch.io), *Super Stylist Nail Salon* and the DSU external-evaluator achievement.

## v2.0.0 - 2026-09-19

- Rebuilt the site as an interactive three.js portfolio, replacing the Jekyll/Minima page.
- Added a bottle-flip physics mini-game hero (cannon-es) with power meter and streaks.
- Added a 3D ring gallery of 20 projects, including *Just Different Experience* (in development at Meta Frolic Labs).
- Updated content from the 2026 resume: Lead Game Developer at Meta Frolic Labs, Visiting Faculty at DHA Suffa University, ePlanet Global end date.
- Added Experience, Skills, Education and Achievements sections with workplace and university logos.
- Added LinkedIn and itch.io links beside the name, and contact tiles for LinkedIn, itch.io, email and phone.
- Removed `index_preview.html` (no longer needed; serve the folder locally instead).

## v1.1.0 - 2026-02-23

- Added experience: **Eplanet Global** (Senior Game Developer).
- Updated the **About** section with full resume text and cleaned formatting.
- Replaced the `OS` logo with a portrait image and enforced sizing/rounding.
- Updated sidebar: renamed `Quick Links` → `Socials` and added LinkedIn + itch.io links.
- Replaced sidebar `Skills` with a focused list from the resume.
- Restored/cleaned Projects section and fixed HTML entity issues (`&` → `&amp;`).
- Removed the privacy/footer note referencing the uploaded resume/PDF.
- Removed macOS `.DS_Store` files and added `.gitignore`.
- Minor CSS/JS tweaks: fixed logo sizing, added image object-fit, and small responsive rules.

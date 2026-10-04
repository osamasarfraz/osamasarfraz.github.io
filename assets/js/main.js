// Wires up the page: project grid + filters, details dialog, scroll effects.
import { projects, GENRES } from './projects.js?v=3.0.0';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Wide art (16:9-ish) fills the cover. Anything squarer — app icons, 4:3
// gameplay captures — sits as a tile on a blurred backdrop of itself.
// Decided by the file's real dimensions once loaded.
const WIDE = (w, h) => w / h >= 1.45;
const SQUARE = (w, h) => Math.abs(w / h - 1) < 0.08;

// Gradient pairs for projects without art (ember/teal/amber, varied by index).
const GEN = [
  ['rgba(255,122,89,.75)', 'rgba(45,212,191,.55)'],
  ['rgba(45,212,191,.7)', 'rgba(255,179,71,.5)'],
  ['rgba(255,179,71,.7)', 'rgba(255,122,89,.5)'],
  ['rgba(99,102,241,.6)', 'rgba(45,212,191,.5)'],
];

const STORE_ICON = {
  'Play Store': '<svg viewBox="0 0 24 24"><path d="M3.6 1.8 13.3 12 3.6 22.2c-.3-.2-.5-.6-.5-1V2.8c0-.4.2-.8.5-1zm11 8.9 2.7 2.7-10.6 6.1 7.9-8.8zm0 2.6L6.7 4.5l10.6 6.1-2.7 2.7zm4.9-.8c.6.3.6 1.2 0 1.5l-2.8 1.6-3-3 3-3 2.8 1.9z"/></svg>',
  'App Store': '<svg viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>',
  'itch.io': '<svg viewBox="0 0 24 24"><path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.436-1.102 2.436-2.41 0 1.308 1.07 2.41 2.4 2.41 1.328 0 2.362-1.102 2.362-2.41 0 1.308 1.137 2.41 2.466 2.41h.024c1.33 0 2.466-1.102 2.466-2.41 0 1.308 1.034 2.41 2.363 2.41 1.33 0 2.4-1.102 2.4-2.41 0 1.308 1.106 2.41 2.435 2.41C22.78 8.43 24 7.282 24 5.98V4.95c-.02-.62-2.082-2.99-3.13-3.612-3.253-.114-5.508-.134-8.87-.133-3.362 0-7.945.053-8.87.133zm6.376 6.477a2.74 2.74 0 0 1-.468.602c-.5.49-1.19.795-1.947.795a2.786 2.786 0 0 1-1.95-.795c-.182-.178-.32-.37-.446-.59-.127.222-.303.412-.486.59a2.788 2.788 0 0 1-1.95.795c-.092 0-.187-.025-.264-.052-.107 1.113-.152 2.176-.168 2.95v.005l-.006 1.167c.02 2.334-.23 7.564 1.03 8.85 1.952.454 5.545.662 9.15.663 3.605 0 7.198-.21 9.15-.664 1.26-1.284 1.01-6.514 1.03-8.848l-.006-1.167v-.004c-.016-.775-.06-1.838-.168-2.95-.077.026-.172.052-.263.052a2.788 2.788 0 0 1-1.95-.795c-.184-.178-.36-.368-.486-.59-.127.22-.265.412-.447.59a2.786 2.786 0 0 1-1.95.794c-.76 0-1.446-.303-1.948-.793a2.74 2.74 0 0 1-.468-.602 2.738 2.738 0 0 1-.463.602 2.787 2.787 0 0 1-1.95.794h-.16a2.787 2.787 0 0 1-1.95-.793 2.738 2.738 0 0 1-.464-.602zm-2.004 2.59v.002c.795.002 1.5 0 2.373.953.687-.072 1.406-.108 2.125-.107.72 0 1.438.035 2.125.107.873-.953 1.578-.95 2.372-.953.376 0 1.876 0 2.92 2.934l1.123 4.028c.832 2.995-.266 3.068-1.636 3.07-2.03-.075-3.156-1.55-3.156-3.025-1.124.184-2.436.276-3.748.277-1.312 0-2.624-.093-3.748-.277 0 1.475-1.125 2.95-3.156 3.026-1.37-.004-2.468-.077-1.636-3.072l1.122-4.027c1.045-2.934 2.545-2.934 2.92-2.934zM12 12.714c-.002.002-2.14 1.964-2.523 2.662l1.4-.056v1.22c0 .056.56.033 1.123.007.562.026 1.124.05 1.124-.008v-1.22l1.4.055C14.138 14.677 12 12.713 12 12.713z"/></svg>',
  'YouTube demo': '<svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg>',
};
const LINK_ICON = '<svg viewBox="0 0 24 24" class="line"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';
const INFO_ICON = '<svg viewBox="0 0 24 24" class="line"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>';

const monogram = (title) => title.split(/[\s:-]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

// Builds the cover markup; the "tile" vs full-bleed choice is made when the
// image loads, by swapping classes (so the HTML never needs to know sizes).
function coverParts(p, i) {
  if (!p.image) {
    const [c1, c2] = GEN[i % GEN.length];
    return { cls: 'gen', style: `--c1:${c1};--c2:${c2}`, inner: `<span class="mono" aria-hidden="true">${esc(monogram(p.title))}</span>` };
  }
  return { cls: '', style: '', inner: `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">` };
}
function fitCover(cover) {
  const img = cover.querySelector('img');
  if (!img) return;
  const apply = () => {
    if (WIDE(img.naturalWidth, img.naturalHeight)) return;
    cover.classList.add('tile');
    img.classList.add(SQUARE(img.naturalWidth, img.naturalHeight) ? 'icon' : 'shot');
    const back = img.cloneNode();
    back.className = 'backdrop';
    back.removeAttribute('loading');
    cover.prepend(back);
  };
  img.complete && img.naturalWidth ? apply() : img.addEventListener('load', apply, { once: true });
}

function linkHTML(l) {
  const icon = STORE_ICON[l.label] || LINK_ICON;
  return `<a class="link-pill" href="${esc(l.url)}" target="_blank" rel="noopener">${icon}${esc(l.label)}</a>`;
}

// ---------------- Grid ----------------
function renderGrid() {
  const grid = $('#project-grid');
  grid.innerHTML = projects.map((p, i) => {
    const status = p.status
      ? `<span class="card-status${/development/i.test(p.status) ? ' dev' : ''}">${esc(p.status)}</span>` : '';
    const c = coverParts(p, i);
    return `
    <li class="card${p.featured ? ' featured' : ''}" data-genre="${esc(p.genre)}" style="animation-delay:${(i % 6) * 60}ms">
      <button class="card-cover ${c.cls}" type="button" data-open="${i}" aria-label="Details for ${esc(p.title)}" style="${c.style}">
        ${status}${c.inner}
      </button>
      <div class="card-body">
        <span class="card-genre">${esc(p.genre)}</span>
        <h3><button type="button" data-open="${i}">${esc(p.title)}</button></h3>
        <p class="card-meta">${esc(p.meta)}</p>
        <div class="card-links">
          ${(p.links || []).map(linkHTML).join('')}
          ${p.about ? `<button class="link-pill more" type="button" data-open="${i}">${INFO_ICON}About</button>` : ''}
        </div>
      </div>
    </li>`;
  }).join('');

  grid.querySelectorAll('.card-cover').forEach(fitCover);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) openProject(Number(btn.dataset.open));
  });
}

function renderFilters() {
  const box = $('#filters');
  const counts = projects.reduce((m, p) => (m[p.genre] = (m[p.genre] || 0) + 1, m), {});
  const all = ['All', ...GENRES.filter((g) => counts[g])];
  box.innerHTML = all.map((g) => `
    <button class="filter" type="button" data-genre="${esc(g)}" aria-pressed="${g === 'All'}">
      ${esc(g)}<span class="count">${g === 'All' ? projects.length : counts[g]}</span>
    </button>`).join('');

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    box.querySelectorAll('.filter').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    const g = btn.dataset.genre;
    let shown = 0;
    $('#project-grid').querySelectorAll('.card').forEach((card, i) => {
      const show = g === 'All' || card.dataset.genre === g;
      card.classList.toggle('hidden', !show);
      if (show) {
        // replay the entrance animation
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
        card.style.animationDelay = `${(shown % 6) * 50}ms`;
        shown++;
      }
    });
    $('#project-empty').hidden = shown > 0;
  });
}

// ---------------- Dialog ----------------
const dialog = $('#project-dialog');
function openProject(i) {
  const p = projects[i];
  $('#dialog-title').textContent = p.title;
  $('#dialog-meta').textContent = p.genre + ' · ' + p.meta + (p.status ? ' · ' + p.status : '');
  const about = $('#dialog-about');
  about.textContent = p.about || '';
  about.hidden = !p.about;
  const cover = $('#dialog-cover');
  const c = coverParts(p, i);
  cover.className = `dialog-cover ${c.cls}`;
  cover.style.cssText = c.style;
  cover.innerHTML = c.inner;
  fitCover(cover);
  $('#dialog-links').innerHTML = (p.links || []).map(linkHTML).join('')
    || '<span class="card-meta">No public link yet.</span>';
  dialog.showModal();
}
$('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// ---------------- Scroll effects ----------------
function initScroll() {
  const bar = $('#topbar');
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); reveal.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => reveal.observe(el));

  // Highlight the nav link for the section in view.
  const links = [...document.querySelectorAll('.nav a')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  links.forEach((a) => { const t = $(a.getAttribute('href')); if (t) spy.observe(t); });
}

$('#year').textContent = new Date().getFullYear();
renderGrid();
renderFilters();
initScroll();

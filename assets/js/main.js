// Wires up the page: project grid + filters, details dialog, then hands off to
// the hero physics (hero.js) and page-wide motion (fx.js).
import { projects, GENRES } from './projects.js?v=4.0.0';
import { initFx, observeReveal, tilt, slidingPill, reduce } from './fx.js?v=4.0.0';
import { initHero } from './hero.js?v=4.0.0';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const EASE = 'cubic-bezier(.16,1,.3,1)';

// Wide art (16:9-ish) fills the cover. Anything squarer — app icons, 4:3
// gameplay captures — sits as a tile on a blurred backdrop of itself.
// Decided by the file's real dimensions once loaded.
const WIDE = (w, h) => w / h >= 1.45;
const SQUARE = (w, h) => Math.abs(w / h - 1) < 0.08;

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
// Projects without art get a cover in their genre's colours (see style.css).
function coverParts(p) {
  if (!p.image) return { cls: 'gen', inner: `<span class="mono" aria-hidden="true">${esc(monogram(p.title))}</span>` };
  return { cls: '', inner: `<img src="${esc(p.image)}" alt="" loading="lazy" decoding="async">` };
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
const grid = $('#project-grid');

function renderGrid() {
  grid.innerHTML = projects.map((p, i) => {
    const status = p.status
      ? `<span class="card-status${/development/i.test(p.status) ? ' dev' : ''}">${esc(p.status)}</span>` : '';
    const c = coverParts(p);
    return `
    <li class="card reveal${p.featured ? ' featured' : ''}" data-genre="${esc(p.genre)}">
      <div class="card-inner">
        <button class="card-cover ${c.cls}" type="button" data-open="${i}" aria-label="Details for ${esc(p.title)}">
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
        <span class="glare" aria-hidden="true"></span>
      </div>
    </li>`;
  }).join('');

  grid.querySelectorAll('.card-cover').forEach(fitCover);
  grid.querySelectorAll('.card-inner').forEach((el) => tilt(el, 7));
  observeReveal([...grid.children]);

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) openProject(Number(btn.dataset.open), btn.closest('.card'));
  });
}

// Filtering animates what changed: leaving cards shrink away, the rest glide
// to their new slots (FLIP), and newcomers pop in.
let filterRun = 0;
async function applyFilter(genre) {
  const run = ++filterRun;
  const cards = [...grid.children];
  const match = (c) => genre === 'All' || c.dataset.genre === genre;
  cards.forEach((c) => c.getAnimations().forEach((a) => a.cancel()));

  if (!reduce) {
    const leaving = cards.filter((c) => !c.classList.contains('hidden') && !match(c));
    await Promise.all(leaving.map((c) => c.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.9) translateY(10px)' }],
      { duration: 200, easing: 'ease-in', fill: 'forwards' },
    ).finished.catch(() => {})));
    if (run !== filterRun) return;
  }

  const first = new Map(cards.filter((c) => !c.classList.contains('hidden')).map((c) => [c, c.getBoundingClientRect()]));
  cards.forEach((c) => {
    c.getAnimations().forEach((a) => a.cancel());
    c.classList.toggle('hidden', !match(c));
  });

  let shown = 0, entering = 0;
  cards.forEach((c) => {
    if (c.classList.contains('hidden')) return;
    shown++;
    c.classList.add('in');
    if (reduce) return;
    const a = first.get(c), b = c.getBoundingClientRect();
    if (a) {
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 650, easing: EASE });
      }
    } else if (b.top < window.innerHeight && b.bottom > 0) {
      c.animate(
        [{ opacity: 0, transform: 'scale(.88) translateY(24px)' }, { opacity: 1, transform: 'none' }],
        { duration: 600, delay: 60 + entering++ * 45, easing: 'cubic-bezier(.34,1.56,.64,1)', fill: 'backwards' },
      );
    }
  });
  $('#project-empty').hidden = shown > 0;
}

function renderFilters() {
  const box = $('#filters');
  const counts = projects.reduce((m, p) => (m[p.genre] = (m[p.genre] || 0) + 1, m), {});
  const all = ['All', ...GENRES.filter((g) => counts[g])];
  box.innerHTML = all.map((g) => `
    <button class="filter" type="button" data-genre="${esc(g)}" aria-pressed="${g === 'All'}">
      ${esc(g)}<span class="count">${g === 'All' ? projects.length : counts[g]}</span>
    </button>`).join('');

  const place = slidingPill(box);
  const active = () => box.querySelector('[aria-pressed="true"]');
  requestAnimationFrame(() => place(active(), true));
  document.fonts?.ready.then(() => place(active(), true));

  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn || btn.getAttribute('aria-pressed') === 'true') return;
    box.querySelectorAll('.filter').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    place(btn);
    applyFilter(btn.dataset.genre);
  });
}

// ---------------- Dialog ----------------
// Opens by zooming out of the card that was clicked, and closes back into it.
const dialog = $('#project-dialog');
let origin = null;

function fromOrigin() {
  const cover = origin?.querySelector('.card-cover');
  if (!cover || !cover.offsetParent) return { opacity: 0, transform: 'translateY(30px) scale(.94)' };
  const a = cover.getBoundingClientRect(), b = dialog.getBoundingClientRect();
  const s = a.width / b.width;
  return {
    opacity: 0.3,
    transform: `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top - b.top - (b.height * (1 - s)) / 2}px) scale(${s})`,
  };
}

function openProject(i, card) {
  const p = projects[i];
  origin = card || null;
  dialog.dataset.genre = p.genre;
  $('#dialog-title').textContent = p.title;
  $('#dialog-meta').textContent = p.genre + ' · ' + p.meta + (p.status ? ' · ' + p.status : '');
  const about = $('#dialog-about');
  about.textContent = p.about || '';
  about.hidden = !p.about;
  const cover = $('#dialog-cover');
  const c = coverParts(p);
  cover.className = `dialog-cover ${c.cls}`;
  cover.innerHTML = c.inner;
  fitCover(cover);
  $('#dialog-links').innerHTML = (p.links || []).map(linkHTML).join('')
    || '<span class="card-meta">No public link yet.</span>';
  dialog.classList.remove('closing');
  dialog.showModal();
  if (!reduce) {
    dialog.animate([fromOrigin(), { opacity: 1, transform: 'none' }], { duration: 520, easing: EASE });
    $('.dialog-body', dialog).animate(
      [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, delay: 160, easing: EASE, fill: 'backwards' },
    );
  }
}

let closing = false;
async function closeDialog() {
  if (!dialog.open || closing) return;
  if (!reduce) {
    closing = true;
    dialog.classList.add('closing');
    await dialog.animate([{ opacity: 1, transform: 'none' }, fromOrigin()], { duration: 280, easing: 'cubic-bezier(.4,0,.8,.4)', fill: 'forwards' })
      .finished.catch(() => {});
    closing = false;
  }
  dialog.close();
  dialog.classList.remove('closing');
  dialog.getAnimations().forEach((a) => a.cancel());
}
$('#dialog-close').addEventListener('click', closeDialog);
dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
dialog.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(); });

$('#year').textContent = new Date().getFullYear();
renderGrid();
renderFilters();
initFx();
initHero();

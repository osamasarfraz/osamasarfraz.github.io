import { createBottleHero, MAX_POWER } from './bottle.js';
import { createGallery, drawCoverArt } from './gallery.js';
import { projects } from './projects.js';

// Power band that lands a clean flip, measured by sweeping bottle-physics.js
const SWEET = [0.9, 1.175];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel) => document.querySelector(sel);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch { return false; }
}

// Accessible HTML list of every project: always in the DOM for screen readers
// and search engines, and the visible fallback when WebGL isn't available.
function renderProjectList() {
  $('#project-list').innerHTML = projects.map((p) => `
    <li>
      <strong>${p.title}</strong>
      <span>${p.meta}${p.status ? ' · ' + p.status : ''}</span>
      ${p.about ? `<span>${p.about}</span>` : ''}
      ${(p.links || []).map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join(' ')}
    </li>`).join('');
}

function storage(key, fallback) {
  try { return Number(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function store(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* private mode etc. */ }
}

// Only render a scene while it's on screen.
function renderWhenVisible(el, scene) {
  new IntersectionObserver(([entry]) => {
    entry.isIntersecting ? scene.start() : scene.stop();
  }).observe(el);
}

// ---------------- Hero ----------------
function initHero() {
  const zone = $('#flip-zone');
  const fill = $('#meter-fill');
  const toast = $('#toast');
  const stats = { flips: 0, streak: 0, best: storage('bestStreak', 0) };

  const sweet = $('#meter-sweet');
  sweet.style.bottom = `${(SWEET[0] / MAX_POWER) * 100}%`;
  sweet.style.height = `${((SWEET[1] - SWEET[0]) / MAX_POWER) * 100}%`;

  function renderStats() {
    $('#stat-flips').textContent = stats.flips;
    $('#stat-streak').textContent = stats.streak;
    $('#stat-best').textContent = stats.best;
  }
  renderStats();

  let toastTimer;
  function showToast(text, kind) {
    toast.textContent = text;
    toast.dataset.kind = kind;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 1600);
  }

  const hero = createBottleHero({
    canvas: $('#hero-canvas'),
    reducedMotion,
    onResult(result) {
      if (result === 'fail') {
        stats.streak = 0;
        showToast('So close — try again', 'fail');
      } else {
        stats.flips++;
        stats.streak++;
        if (stats.streak > stats.best) { stats.best = stats.streak; store('bestStreak', stats.best); }
        showToast(result === 'cap' ? 'Cap landing?! Legendary 🤯' : 'Perfect flip! 🎯', 'win');
      }
      renderStats();
    },
  });
  renderWhenVisible($('#hero'), hero);

  function setPower(p) {
    fill.style.height = `${(p / MAX_POWER) * 100}%`;
    fill.classList.toggle('in-sweet', p >= SWEET[0] && p <= SWEET[1]);
    hero.setCharge(p);
  }
  function release(p) {
    setPower(0);
    zone.classList.remove('charging');
    if (p > 0.12) hero.launch(p);
  }

  // Pointer: press, pull down, release — like drawing a slingshot.
  let pull = null;
  zone.addEventListener('pointerdown', (e) => {
    if (!hero.isReady()) return;
    pull = { y: e.clientY, power: 0 };
    zone.setPointerCapture(e.pointerId);
    zone.classList.add('charging');
    $('#hint').classList.add('used');
  });
  zone.addEventListener('pointermove', (e) => {
    if (!pull) return;
    const range = Math.max(160, window.innerHeight * 0.3);
    pull.power = Math.min(MAX_POWER, Math.max(0, (e.clientY - pull.y) / range) * MAX_POWER);
    setPower(pull.power);
  });
  const endPull = () => { if (pull) { release(pull.power); pull = null; } };
  zone.addEventListener('pointerup', endPull);
  zone.addEventListener('pointercancel', () => { pull = null; setPower(0); zone.classList.remove('charging'); });

  // Keyboard: hold Space to charge (power ping-pongs), release to flip.
  let charge = null;
  zone.addEventListener('keydown', (e) => {
    if (e.code !== 'Space' || e.repeat) return;
    e.preventDefault();
    if (!hero.isReady()) return;
    charge = { t0: performance.now(), power: 0 };
    zone.classList.add('charging');
    (function tick() {
      if (!charge) return;
      const t = ((performance.now() - charge.t0) / 1100) % 2;
      charge.power = (t < 1 ? t : 2 - t) * MAX_POWER;
      setPower(charge.power);
      requestAnimationFrame(tick);
    })();
  });
  zone.addEventListener('keyup', (e) => {
    if (e.code !== 'Space' || !charge) return;
    const p = charge.power;
    charge = null;
    release(p);
  });

  if (new URLSearchParams(location.search).has('debug')) window.__hero = hero;
}

// ---------------- Gallery ----------------
function initGallery() {
  const caption = $('#gallery-caption');
  const dialog = $('#project-dialog');

  function openProject(i) {
    const p = projects[i];
    $('#dialog-title').textContent = p.title;
    $('#dialog-meta').textContent = p.meta + (p.status ? ' · ' + p.status : '');
    const about = $('#dialog-about');
    about.textContent = p.about || '';
    about.hidden = !p.about;
    const img = $('#dialog-img');
    img.hidden = !(p.image || p.cover);
    if (p.image) {
      img.src = p.image;
    } else if (p.cover) {
      const cvs = document.createElement('canvas');
      cvs.width = 800;
      cvs.height = 500;
      drawCoverArt(p, cvs.getContext('2d'), cvs.width, cvs.height);
      img.src = cvs.toDataURL('image/jpeg', 0.9);
    }
    img.alt = p.title;
    $('#dialog-links').innerHTML = (p.links || [])
      .map((l) => `<a class="btn" href="${l.url}" target="_blank" rel="noopener">${l.label} ↗</a>`).join('');
    gallery.setPaused(true);
    dialog.showModal();
  }

  const gallery = createGallery({
    canvas: $('#gallery-canvas'),
    projects,
    // Open on a project with real art — and the one the hero's bottle nods to.
    initial: Math.max(0, projects.findIndex((p) => p.title === 'Gravity Bottle Flip')),
    reducedMotion,
    onOpen: openProject,
    onActiveChange(i) {
      const p = projects[i];
      caption.querySelector('.cap-title').textContent = p.title;
      caption.querySelector('.cap-meta').textContent = p.meta + (p.status ? ' · ' + p.status : '');
      caption.querySelector('.cap-count').textContent = `${i + 1} / ${projects.length}`;
    },
  });
  renderWhenVisible($('#projects'), gallery);

  $('#prev').addEventListener('click', gallery.prev);
  $('#next').addEventListener('click', gallery.next);
  $('#open').addEventListener('click', () => openProject(gallery.getActive()));
  $('#gallery-stage').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); gallery.next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); gallery.prev(); }
    if (e.key === 'Enter') { e.preventDefault(); openProject(gallery.getActive()); }
  });
  $('#dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => gallery.setPaused(false));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
}

renderProjectList();
if (hasWebGL()) {
  document.documentElement.classList.add('webgl');
  initHero();
  initGallery();
} else {
  document.documentElement.classList.add('no-webgl');
}

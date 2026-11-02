// Page-wide motion helpers: scroll reveals, word-split headings, pointer tilt
// with parallax, magnetic buttons, the sliding pill indicator, the scroll-filled
// timeline rail, a scroll-reactive marquee, the progress bar, the top bar and
// the mobile menu. Each one degrades to a still, fully readable page.

import { sfx } from './sfx.js?v=4.1.0';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// Wrap each word of a heading so it can slide up from behind a mask.
export function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = '';
  words.forEach((word, i) => {
    if (i) el.append(' ');
    const w = document.createElement('span');
    w.className = 'w';
    const s = document.createElement('span');
    s.textContent = word;
    s.style.setProperty('--i', i);
    w.append(s);
    el.append(w);
  });
}

// Reveal .reveal elements as they scroll in; items entering together stagger.
let revealIO = null;
export function observeReveal(els) {
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  revealIO ??= new IntersectionObserver((entries) => {
    entries.filter((en) => en.isIntersecting).forEach((en, i) => {
      en.target.style.setProperty('--stagger', `${i * 80}ms`);
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  els.forEach((el) => revealIO.observe(el));
}

// 3D tilt + glare that follows the pointer (fine pointers only).
export function tilt(el, max = 8) {
  if (reduce || !finePointer || !el) return;
  let raf = 0, ev = null;
  const apply = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    const px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height;
    el.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`);
    el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
    el.style.setProperty('--px', ((px - 0.5) * 2).toFixed(3));
    el.style.setProperty('--py', ((py - 0.5) * 2).toFixed(3));
  };
  el.addEventListener('pointerenter', () => el.classList.add('tilting'));
  el.addEventListener('pointermove', (e) => { ev = e; raf ||= requestAnimationFrame(apply); });
  el.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf); raf = 0;
    el.classList.remove('tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--px', '0');
    el.style.setProperty('--py', '0');
  });
}

// Buttons that lean toward the pointer when it comes near (fine pointers only).
// Only the nearest button engages, and none does while the pointer is over
// some other control, so neighbouring buttons never slide into each other.
export function magnetic(els, reach = 28, pull = 0.3, maxX = 8, maxY = 6) {
  if (reduce || !finePointer || !els.length) return;
  let raf = 0, ev = null;
  const release = (el) => {
    if (!el.classList.contains('magnet')) return;
    el.style.setProperty('--bx', '0px');
    el.style.setProperty('--by', '0px');
    el.classList.remove('magnet');
  };
  const apply = () => {
    raf = 0;
    const over = ev.target instanceof Element ? ev.target.closest('a, button, input, select, textarea, [role="button"]') : null;
    let best = null, bestD = Infinity, bx = 0, by = 0;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = ev.clientX - cx, dy = ev.clientY - cy;
      // distance from the pointer to the button's edge (0 when inside it)
      const d = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
      if (d <= reach && d < bestD && (!over || over === el)) { best = el; bestD = d; bx = dx; by = dy; }
    }
    for (const el of els) if (el !== best) release(el);
    if (best) {
      const ease = 1 - bestD / (reach + 1); // fades out toward the edge of reach
      const clampTo = (v, m) => Math.max(-m, Math.min(m, v));
      best.style.setProperty('--bx', `${clampTo(bx * pull * ease, maxX).toFixed(1)}px`);
      best.style.setProperty('--by', `${clampTo(by * pull * ease, maxY).toFixed(1)}px`);
      best.classList.add('magnet');
    }
  };
  window.addEventListener('pointermove', (e) => { ev = e; raf ||= requestAnimationFrame(apply); }, { passive: true });
  window.addEventListener('pointerleave', () => els.forEach(release));
}

// A pill that glides to whichever item is active. Returns place(active).
export function slidingPill(container) {
  const pill = document.createElement('span');
  pill.className = 'pill-indicator';
  pill.setAttribute('aria-hidden', 'true');
  pill.style.opacity = '0';
  container.prepend(pill);
  let current = null;
  const place = (active = current, instant = false) => {
    current = active;
    if (!active || !active.offsetParent) { pill.style.opacity = '0'; return; }
    if (instant || pill.style.opacity === '0') pill.style.transition = 'none';
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.height = `${active.offsetHeight}px`;
    const color = getComputedStyle(active).getPropertyValue('--g').trim();
    if (color) pill.style.setProperty('--pc', color);
    pill.style.opacity = '1';
    if (pill.style.transition) { void pill.offsetWidth; pill.style.transition = ''; }
  };
  new ResizeObserver(() => place(current, true)).observe(container);
  return place;
}

// Timeline rails fill with scroll; each marker lights when the fill reaches it.
function initTimelines() {
  const tls = $$('.timeline');
  if (!tls.length) return;
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.6;
    for (const tl of tls) {
      const r = tl.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (line - r.top - 12) / (r.height - 36)));
      tl.style.setProperty('--p', p.toFixed(4));
      const reach = line - r.top;
      for (const job of tl.children) {
        const what = job.querySelector('.what');
        if (what) job.classList.toggle('passed', reach >= what.offsetTop + 16);
      }
    }
  };
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

// The stack marquee scrolls on its own and speeds up with the page's scroll
// velocity, in whichever direction you scroll.
function initMarquee() {
  const track = $('.marquee-track');
  if (!track || reduce) return;
  const half = () => track.scrollWidth / 2;
  let x = 0, speed = 0.6, boost = 0, lastY = window.scrollY, last = performance.now();
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    boost += (y - lastY) * 0.12;
    lastY = y;
  }, { passive: true });
  const frame = (now) => {
    const dt = Math.min((now - last) / 16.667, 3);
    last = now;
    boost *= Math.pow(0.92, dt);
    x -= (speed + Math.max(-12, Math.min(12, boost))) * dt;
    const w = half();
    if (w) x = ((x % w) + w) % w - w;
    track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function initProgress() {
  const bar = $('#progress');
  if (!bar) return;
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
}

// Achievement badges chime as they unlock (only if sound is on).
function initUnlockSounds() {
  const awards = $$('.award');
  if (!awards.length || reduce) return;
  const io = new IntersectionObserver((entries) => {
    entries.filter((en) => en.isIntersecting).forEach((en, i) => {
      sfx.unlock(i);
      io.unobserve(en.target);
    });
  }, { threshold: 0.3 });
  awards.forEach((a) => io.observe(a));
}

function initTopbar() {
  const bar = $('#topbar');
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const btn = $('#menu-btn'), nav = $('#site-nav');
  const setOpen = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => { setOpen(!nav.classList.contains('open')); sfx.click(); });
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!bar.contains(e.target)) setOpen(false); });

  // Scroll spy with a sliding pill
  const links = $$('a', nav);
  const place = slidingPill(nav);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      let active = null;
      links.forEach((a) => {
        const on = a.getAttribute('href') === '#' + en.target.id;
        a.classList.toggle('active', on);
        if (on) active = a;
      });
      place(active);
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main > section, main + footer').forEach((s) => spy.observe(s));
}

export function initFx() {
  $$('[data-split]').forEach(splitWords);
  observeReveal($$('.reveal'));
  initTimelines();
  initTopbar();
  initMarquee();
  initProgress();
  initUnlockSounds();
  tilt($('.portrait-frame'), 14);
  magnetic($$('.cta .btn, .topbar .btn.primary'));
}

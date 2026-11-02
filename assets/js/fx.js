// Page-wide motion helpers: scroll reveals, word-split headings, pointer tilt,
// the sliding pill indicator, the scroll-filled timeline rail, the top bar and
// the mobile menu. Each one degrades to a still, fully readable page.

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
  };
  el.addEventListener('pointerenter', () => el.classList.add('tilting'));
  el.addEventListener('pointermove', (e) => { ev = e; raf ||= requestAnimationFrame(apply); });
  el.addEventListener('pointerleave', () => {
    cancelAnimationFrame(raf); raf = 0;
    el.classList.remove('tilting');
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  });
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

function initTopbar() {
  const bar = $('#topbar');
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const btn = $('#menu-btn'), nav = $('#site-nav');
  const setOpen = (open) => { nav.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
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
  tilt($('.portrait-frame'), 14);
}

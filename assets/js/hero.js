// Hero: a headline with game feel.
//
// The <h1> is split into letters, each a tiny physics body:
//   • on load they drop in under gravity and land with a squash and a puff of dust;
//   • moving the pointer through them kicks them with the pointer's velocity,
//     and they spring back with a wobble and a colour "hit flash";
//   • clicking/tapping launches the nearby letters with sparks and screen shake.
// Plain DOM transforms plus one <canvas> for particles; no libraries.
// Everything here is skipped under prefers-reduced-motion.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const INK = [245, 241, 255];
const HUES = [[255, 210, 63], [255, 92, 138], [62, 230, 255], [139, 227, 107], [179, 155, 255]];
const G = 1.15;                 // gravity (px / frame²)
const K = 0.075, D = 0.16;      // position spring: low damping = bouncy
const KR = 0.08, DR = 0.2;      // rotation spring
const KS = 0.16, DS = 0.26;     // squash & stretch spring
const STAGGER = 34;             // ms between letters in the intro drop

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function split(h1) {
  const text = h1.textContent.trim().replace(/\s+/g, ' ');
  h1.textContent = '';
  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = text;
  const inner = document.createElement('span');
  inner.className = 'kinetic-inner';
  inner.setAttribute('aria-hidden', 'true');
  const letters = [];
  text.split(' ').forEach((word, wi) => {
    if (wi) inner.append(' ');
    const w = document.createElement('span');
    w.className = 'word';
    for (const c of word) {
      const el = document.createElement('span');
      el.className = 'ch';
      el.textContent = c;
      el.style.opacity = '0';
      w.append(el);
      letters.push({
        el, x: 0, y: 0, vx: 0, vy: 0, r: 0, vr: 0, s: 0, vs: 0, flash: 0, shown: 0,
        hue: HUES[letters.length % HUES.length], mode: 'wait', start: 0, cx: 0, cy: 0, bottom: 0,
      });
    }
    inner.append(w);
  });
  h1.append(sr, inner);
  return { letters, inner };
}

export function initHero() {
  const hero = document.querySelector('.hero');
  const h1 = document.querySelector('[data-kinetic]');
  if (!hero || !h1) return;
  const toast = hero.querySelector('.toast');
  const hint = hero.querySelector('.hint');

  if (reduce) {
    h1.classList.add('ready');
    toast?.classList.add('show');
    return;
  }

  const { letters, inner } = split(h1);
  h1.classList.add('ready');

  const canvas = hero.querySelector('.sparks');
  const ctx = canvas?.getContext('2d');
  const parts = [];
  let dpr = 1, fontPx = 64, off = { x: 0, y: 0 };
  let shake = 0, running = false, last = 0, introDone = false, touched = false, canvasDirty = false;

  function measure() {
    fontPx = parseFloat(getComputedStyle(h1).fontSize) || 64;
    for (const L of letters) {
      L.cx = L.el.offsetLeft + L.el.offsetWidth / 2;
      L.cy = L.el.offsetTop + L.el.offsetHeight / 2;
      L.bottom = L.el.offsetTop + L.el.offsetHeight * 0.86;
    }
    const hr = hero.getBoundingClientRect();
    const ir = inner.getBoundingClientRect();
    off = { x: ir.left - hr.left, y: ir.top - hr.top };
    if (canvas) {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(hr.width * dpr);
      canvas.height = Math.round(hr.height * dpr);
    }
  }

  function render(L) {
    const f = L.flash;
    L.el.style.transform =
      `translate3d(${L.x.toFixed(2)}px,${L.y.toFixed(2)}px,0) rotate(${L.r.toFixed(2)}deg) scale(${(1 + L.s).toFixed(3)},${(1 - L.s).toFixed(3)})`;
    if (f > 0.01) {
      const c = INK.map((v, i) => Math.round(v + (L.hue[i] - v) * Math.min(1, f * 1.4)));
      L.el.style.color = `rgb(${c})`;
      L.shown = 1;
    } else if (L.shown) {
      L.el.style.color = '';
      L.shown = 0;
    }
  }

  // ---- particles (hero coordinates) ----
  function dust(L, impact) {
    const x = off.x + L.cx, y = off.y + L.bottom;
    const n = impact > 12 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? 1 : -1;
      parts.push({ kind: 'dust', x, y, vx: dir * (1 + Math.random() * 2), vy: -Math.random() * 0.8, life: 26, max: 26, size: 3 + Math.random() * 3 });
    }
  }
  function burst(x, y) {
    parts.push({ kind: 'ring', x, y, life: 22, max: 22, size: 0 });
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 8;
      parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, life: 30 + Math.random() * 16, max: 46, color: HUES[i % HUES.length] });
    }
  }
  function drawParts(dt) {
    if (!ctx) { parts.length = 0; return; }
    if (!parts.length && !canvasDirty) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    canvasDirty = parts.length > 0;
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const t = p.life / p.max;
      if (p.kind === 'ring') {
        p.size += (70 - p.size) * 0.18 * dt;
        ctx.strokeStyle = `rgba(255,210,63,${t * 0.9})`;
        ctx.lineWidth = 3 * t + 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.stroke();
      } else if (p.kind === 'spark') {
        p.vy += 0.32 * dt; p.vx *= Math.pow(0.97, dt);
        p.x += p.vx * dt; p.y += p.vy * dt;
        ctx.strokeStyle = `rgba(${p.color},${Math.min(1, t * 1.5)})`;
        ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6); ctx.stroke();
      } else {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(0.92, dt); p.size += 0.25 * dt;
        ctx.fillStyle = `rgba(214,204,255,${t * 0.35})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  // ---- simulation ----
  function step(L, dt, now) {
    if (L.mode === 'wait') {
      if (now < L.start) return true;
      L.mode = 'drop';
      L.el.style.opacity = '';
    }
    const lim = fontPx * 1.6;
    L.vx += (-K * L.x - D * L.vx) * dt; L.x = clamp(L.x + L.vx * dt, -lim, lim);
    if (L.mode === 'drop') {
      L.vy += G * dt; L.y += L.vy * dt;
      if (L.vy > 4) L.s += (-Math.min(0.14, L.vy * 0.007) - L.s) * 0.25 * dt; // stretch while falling
      if (L.y >= 0 && L.vy > 0) {
        const impact = L.vy;
        L.y = 0;
        if (impact > 3.2) {
          L.vy = -impact * 0.34;
          L.vs += Math.min(0.28, impact * 0.016);
          L.vr += (Math.random() - 0.5) * impact * 0.6;
          if (impact > 7) dust(L, impact);
        } else {
          L.vy = 0; L.mode = 'spring';
        }
      }
    } else {
      L.vy += (-K * L.y - D * L.vy) * dt; L.y = clamp(L.y + L.vy * dt, -lim, lim);
    }
    L.vr += (-KR * L.r - DR * L.vr) * dt; L.r += L.vr * dt;
    L.vs += (-KS * L.s - DS * L.vs) * dt; L.s = clamp(L.s + L.vs * dt, -0.3, 0.4);
    L.flash *= Math.pow(0.93, dt);
    render(L);
    return L.mode !== 'spring' || L.flash > 0.01 ||
      Math.abs(L.x) + Math.abs(L.y) + Math.abs(L.vx) + Math.abs(L.vy) + Math.abs(L.r) + Math.abs(L.vr) > 0.08 ||
      Math.abs(L.s) + Math.abs(L.vs) > 0.003;
  }

  function tick(now) {
    const dt = Math.min((now - last) / 16.667, 3);
    last = now;
    let active = false;
    for (const L of letters) if (step(L, dt, now)) active = true;
    if (shake > 0.3) {
      shake *= Math.pow(0.85, dt);
      h1.style.transform = `translate(${((Math.random() - 0.5) * shake).toFixed(1)}px,${((Math.random() - 0.5) * shake).toFixed(1)}px)`;
      active = true;
    } else if (shake) {
      shake = 0; h1.style.transform = '';
    }
    drawParts(dt);
    if (parts.length || canvasDirty) active = true;
    if (active) requestAnimationFrame(tick);
    else running = false;
  }
  function wake() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function interacted() {
    if (touched || !introDone) return;
    touched = true;
    hint?.classList.add('done');
  }

  // ---- input ----
  let px = null, py = null, pt = 0;
  hero.addEventListener('pointermove', (e) => {
    const r = inner.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const now = performance.now();
    if (px !== null && x > -fontPx && y > -fontPx && x < r.width + fontPx && y < r.height + fontPx) {
      const fdt = Math.max(8, now - pt) / 16.667;
      let vx = (x - px) / fdt, vy = (y - py) / fdt;
      const sp = Math.hypot(vx, vy);
      if (sp > 40) { vx *= 40 / sp; vy *= 40 / sp; }
      const R = fontPx * 0.95;
      let hit = false;
      for (const L of letters) {
        if (L.mode !== 'spring') continue;
        const dx = L.cx + L.x - x, dy = L.cy + L.y - y, d = Math.hypot(dx, dy);
        if (d > R) continue;
        const f = (1 - d / R) ** 2, n = d || 1;
        L.vx += (vx * 0.42 + (dx / n) * 2.2) * f;
        L.vy += (vy * 0.42 + (dy / n) * 2.2) * f;
        L.vr += vx * 0.5 * f;
        L.vs += Math.min(sp, 30) * 0.004 * f;
        L.flash = Math.min(1, Math.max(L.flash, (f * Math.min(sp, 30)) / 10));
        hit = true;
      }
      if (hit) { interacted(); wake(); }
    }
    px = x; py = y; pt = now;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { px = null; });

  h1.addEventListener('pointerdown', (e) => {
    if (!introDone) return;
    const r = inner.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const R = fontPx * 3.2;
    for (const L of letters) {
      const dx = L.cx + L.x - x, dy = L.cy + L.y - y, d = Math.hypot(dx, dy);
      if (d > R) continue;
      const f = 1 - d / R, n = d || 1;
      L.mode = 'drop';
      L.vy = Math.min(L.vy, 0) - (5 + 13 * f) * (0.8 + Math.random() * 0.4);
      L.vx += (dx / n) * 7 * f;
      L.vr += ((Math.random() - 0.5) * 36 + (dx / n) * 12) * f;
      L.vs -= 0.2 * f;
      L.flash = 1;
    }
    shake = Math.max(shake, 8);
    burst(off.x + x, off.y + y);
    interacted();
    wake();
  });

  // ---- intro: letters fall into place ----
  function intro() {
    measure();
    const t0 = performance.now() + 120;
    letters.forEach((L, i) => {
      L.mode = 'wait';
      L.start = t0 + i * STAGGER + Math.random() * 40;
      L.y = -(L.cy + fontPx * (1.4 + Math.random() * 1.2));
      L.vy = 0;
      L.r = (Math.random() - 0.5) * 40;
      render(L);
    });
    wake();
    setTimeout(() => {
      introDone = true;
      toast?.classList.add('show');
      hint?.classList.add('show');
    }, letters.length * STAGGER + 700);
  }

  let measured = false;
  const ro = new ResizeObserver(() => { if (measured) measure(); });
  ro.observe(hero);

  const fontsReady = document.fonts?.ready ?? Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 1500))]).then(() => {
    measured = true;
    intro();
  });
}

// 3D project gallery: project cards on a rotating ring. Drag or use the
// arrow buttons/keys to spin it; clicking the front card opens its details.

import * as THREE from 'three';

const CARD_W = 1.6;
const CARD_H = 1.0;
const TEX_W = 800;
const TEX_H = 500;
const PALETTES = [
  ['#7c3aed', '#2dd4bf'], ['#f97316', '#db2777'], ['#0ea5e9', '#6366f1'],
  ['#10b981', '#0ea5e9'], ['#e11d48', '#7c3aed'], ['#eab308', '#f97316'],
];

export function createGallery({ canvas, projects, initial = 0, onActiveChange, onOpen, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071827);
  scene.fog = new THREE.Fog(0x071827, 8, 18);

  const N = projects.length;
  const STEP = (Math.PI * 2) / N;
  const RADIUS = (N * (CARD_W + 0.28)) / (Math.PI * 2);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const ring = new THREE.Group();
  scene.add(ring);

  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  const cardGeo = new THREE.PlaneGeometry(CARD_W, CARD_H);
  const backMat = new THREE.MeshBasicMaterial({ map: makeBackTexture(), transparent: true });

  const cards = projects.map((project, i) => {
    const tex = new THREE.CanvasTexture(drawCard(project, i, null));
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;

    const pivot = new THREE.Group();
    pivot.rotation.y = i * STEP;
    const card = new THREE.Group();
    card.position.z = RADIUS;
    const front = new THREE.Mesh(cardGeo, new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    front.userData.index = i;
    const back = new THREE.Mesh(cardGeo, backMat);
    back.rotation.y = Math.PI;
    card.add(front, back);
    pivot.add(card);
    ring.add(pivot);

    if (project.image) {
      const img = new Image();
      img.onload = () => { drawCard(project, i, img, tex.image); tex.needsUpdate = true; };
      img.src = project.image;
    }
    return { card, front, lift: 0 };
  });

  // ---- Floor reflection glow ----
  const glow = new THREE.Mesh(
    new THREE.CircleGeometry(RADIUS + 1.5, 64),
    new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.05 }),
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -CARD_H / 2 - 0.35;
  scene.add(glow);

  // ---- Rotation state (target snaps to whole cards) ----
  let rot = -initial * STEP;
  let target = rot;
  let active = initial;
  let paused = false;
  let lastInteraction = performance.now();

  function indexForRotation(r) {
    return ((Math.round(-r / STEP) % N) + N) % N;
  }
  function goTo(index) {
    // Choose the shortest way round the ring to reach `index`.
    const current = Math.round(-target / STEP);
    let delta = (index - (((current % N) + N) % N));
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;
    target = -(current + delta) * STEP;
    lastInteraction = performance.now();
  }
  const next = () => goTo((active + 1) % N);
  const prev = () => goTo((active - 1 + N) % N);

  // ---- Pointer: drag to spin, click to focus/open ----
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let hovered = -1;
  let drag = null;

  function pick(e) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(cards.map((c) => c.front))[0];
    return hit ? hit.object.userData.index : -1;
  }

  canvas.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, startX: e.clientX, startTarget: target, moved: 0 };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) {
      drag.moved = Math.max(drag.moved, Math.abs(e.clientX - drag.startX));
      target = drag.startTarget + (e.clientX - drag.startX) * 0.006;
      lastInteraction = performance.now();
    } else {
      hovered = pick(e);
      canvas.style.cursor = hovered >= 0 ? 'pointer' : 'grab';
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!drag) return;
    const wasClick = drag.moved < 6;
    drag = null;
    if (wasClick) {
      const i = pick(e);
      if (i === active) onOpen?.(i);
      else if (i >= 0) goTo(i);
    } else {
      target = Math.round(target / STEP) * STEP;
    }
  });
  canvas.addEventListener('pointerleave', () => { hovered = -1; });

  // ---- Layout ----
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // On narrow screens, size the distance so the front card fills ~80% of
    // the width; wide screens use a fixed distance that shows the neighbours.
    const dist = camera.aspect < 1 ? Math.max(3.2, 2.9 / camera.aspect) : 4.4;
    camera.position.set(0, 0.9, RADIUS + dist);
    camera.lookAt(0, 0, RADIUS - 1.2);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // ---- Loop ----
  const clock = new THREE.Clock();
  let running = false;

  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 1 / 30);

    // Idle auto-advance, one card at a time.
    if (!reducedMotion && !paused && !drag && hovered < 0 && performance.now() - lastInteraction > 4500) {
      next();
    }

    rot += (target - rot) * Math.min(1, dt * (reducedMotion ? 30 : 7));
    ring.rotation.y = rot;

    const nowActive = indexForRotation(rot);
    if (nowActive !== active) {
      active = nowActive;
      onActiveChange?.(active);
    }

    cards.forEach((c, i) => {
      const goal = i === active ? 1 : i === hovered ? 0.5 : 0;
      c.lift += (goal - c.lift) * Math.min(1, dt * 8);
      c.card.position.z = RADIUS + c.lift * 0.35;
      c.card.scale.setScalar(1 + c.lift * 0.08);
    });

    renderer.render(scene, camera);
  }

  onActiveChange?.(active);

  return {
    next, prev, goTo,
    getActive: () => active,
    // Hold auto-advance (e.g. while a detail dialog is open).
    setPaused(value) { paused = value; lastInteraction = performance.now(); },
    start() { if (!running) { running = true; clock.getDelta(); frame(); } },
    stop() { running = false; },
  };
}

// ---- Card textures (2D canvas → WebGL texture) ----

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = word; }
    else line = test;
  }
  lines.push(line);
  return lines;
}

function drawCard(project, index, img, existing) {
  const cvs = existing || document.createElement('canvas');
  cvs.width = TEX_W;
  cvs.height = TEX_H;
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, TEX_W, TEX_H);
  ctx.save();
  roundRect(ctx, 0, 0, TEX_W, TEX_H, 36);
  ctx.clip();

  const [c1, c2] = PALETTES[index % PALETTES.length];
  if (img) {
    // object-fit: cover
    const s = Math.max(TEX_W / img.width, TEX_H / img.height);
    const w = img.width * s;
    const h = img.height * s;
    ctx.drawImage(img, (TEX_W - w) / 2, (TEX_H - h) / 2, w, h);
  } else if (!drawCoverArt(project, ctx, TEX_W, TEX_H)) {
    const g = ctx.createLinearGradient(0, 0, TEX_W, TEX_H);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, TEX_W, TEX_H);
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#fff';
    ctx.font = '800 300px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(project.title.replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase(), 40, TEX_H / 2 - 30);
    ctx.globalAlpha = 1;
  }

  // Bottom scrim so the title is readable over any image.
  const scrim = ctx.createLinearGradient(0, TEX_H * 0.45, 0, TEX_H);
  scrim.addColorStop(0, 'rgba(4,10,24,0)');
  scrim.addColorStop(1, 'rgba(4,10,24,0.92)');
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.fillStyle = '#fff';
  ctx.font = '700 48px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'alphabetic';
  const lines = wrapLines(ctx, project.title, TEX_W - 80).slice(0, 2);
  const metaY = TEX_H - 40;
  lines.reverse().forEach((line, k) => ctx.fillText(line, 40, metaY - 44 - k * 54));
  ctx.fillStyle = 'rgba(226,236,248,0.8)';
  ctx.font = '500 26px Inter, system-ui, sans-serif';
  ctx.fillText(project.status ? `${project.meta} · ${project.status}` : project.meta, 40, metaY, TEX_W - 80);

  ctx.restore();
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  roundRect(ctx, 2, 2, TEX_W - 4, TEX_H - 4, 34);
  ctx.stroke();
  return cvs;
}

// Hand-drawn covers for projects that have no screenshot yet.
export function drawCoverArt(project, ctx, w, h) {
  if (project.cover !== 'climb') return false;
  drawClimbArt(ctx, w, h);
  return true;
}

// Just Different Experience: a route of floating platforms zig-zagging up to
// a flag at the summit, with a climber starting out at the bottom.
function drawClimbArt(ctx, w, h) {
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#0b1026');
  sky.addColorStop(0.55, '#3b1a78');
  sky.addColorStop(1, '#c2410c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // Stars (fixed pattern so the cover never changes between loads).
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 60; i++) {
    const size = i % 3 ? 1.5 : 2.5;
    ctx.fillRect((i * 131) % w, (i * 53) % Math.round(h * 0.45), size, size);
  }

  // Two ridgelines of distant mountains.
  const ridge = (color, base, peaks) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, h);
    peaks.forEach(([px, py]) => ctx.lineTo(px * w, py * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
  };
  ridge('rgba(30,16,70,0.85)', 0.7, [[0, 0.72], [0.18, 0.5], [0.34, 0.66], [0.55, 0.42], [0.72, 0.6], [0.9, 0.46], [1, 0.58]]);
  ridge('rgba(17,10,45,0.95)', 0.8, [[0, 0.84], [0.22, 0.66], [0.42, 0.8], [0.62, 0.62], [0.82, 0.78], [1, 0.68]]);

  // The climbing route: platforms from low-left up to the summit at top-right.
  // The top platform sits low enough to leave room for the flag above it.
  const plats = [
    [0.1, 0.66, 0.17], [0.34, 0.58, 0.13], [0.16, 0.49, 0.12], [0.4, 0.41, 0.12],
    [0.62, 0.34, 0.12], [0.46, 0.26, 0.1], [0.72, 0.19, 0.15],
  ];
  const T = h * 0.028;

  ctx.setLineDash([6, 8]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  plats.forEach(([x, y, pw], i) => {
    const cx = (x + pw / 2) * w;
    i ? ctx.lineTo(cx, y * h - 4) : ctx.moveTo(cx, y * h - 4);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  plats.forEach(([x, y, pw], i) => {
    const px = x * w, py = y * h, W = pw * w;
    ctx.fillStyle = '#1e1b4b';                      // underside, for depth
    roundRect(ctx, px, py + T * 0.5, W, T * 1.4, 6);
    ctx.fill();
    ctx.fillStyle = i === plats.length - 1 ? '#fbbf24' : '#2dd4bf';
    roundRect(ctx, px, py, W, T, 6);
    ctx.fill();
  });

  // Summit flag with a glow.
  const [fx, fy, fw] = plats[plats.length - 1];
  const poleX = (fx + fw * 0.7) * w, poleTop = fy * h - 58;
  const glow = ctx.createRadialGradient(poleX, poleTop + 20, 4, poleX, poleTop + 20, 90);
  glow.addColorStop(0, 'rgba(251,191,36,0.55)');
  glow.addColorStop(1, 'rgba(251,191,36,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(poleX - 90, poleTop - 70, 180, 180);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(poleX - 2, poleTop, 4, fy * h - poleTop);
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(poleX + 2, poleTop);
  ctx.lineTo(poleX + 40, poleTop + 12);
  ctx.lineTo(poleX + 2, poleTop + 24);
  ctx.closePath();
  ctx.fill();

  // The climber, starting out on the first platform.
  const [cx0, cy0, cw0] = plats[0];
  const bx = (cx0 + cw0 * 0.35) * w, by = cy0 * h;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, bx - 9, by - 34, 18, 26, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bx, by - 42, 9, 0, Math.PI * 2);
  ctx.fill();
}

function makeBackTexture() {
  const cvs = document.createElement('canvas');
  cvs.width = 256;
  cvs.height = 160;
  const ctx = cvs.getContext('2d');
  roundRect(ctx, 0, 0, 256, 160, 12);
  ctx.fillStyle = '#101c33';
  ctx.fill();
  const tex = new THREE.CanvasTexture(cvs);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

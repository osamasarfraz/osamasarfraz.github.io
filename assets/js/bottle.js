// Bottle-flip hero: renders the physics bottle from bottle-physics.js, which
// the visitor launches by pulling down and releasing.

import * as THREE from 'three';
import { createBottlePhysics, COM_H, MAX_POWER } from './bottle-physics.js?v=2.0.1';

export { MAX_POWER };

export function createBottleHero({ canvas, onResult, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071025);
  scene.fog = new THREE.Fog(0x071025, 12, 30);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  const lookAt = new THREE.Vector3();

  // ---- Lights ----
  scene.add(new THREE.HemisphereLight(0x9ecbff, 0x0b1020, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 6, bottom: -2, near: 1, far: 25 });
  scene.add(key);
  const rim = new THREE.PointLight(0x7c3aed, 30, 12);
  rim.position.set(-3, 3, -3);
  scene.add(rim);

  // ---- Ground + target ring ----
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(14, 64),
    new THREE.MeshStandardMaterial({ color: 0x0c1830, roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.PolarGridHelper(6, 12, 6, 64, 0x1e3a5f, 0x13233d);
  grid.position.y = 0.002;
  scene.add(grid);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.55 });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.7, 64), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.004;
  scene.add(ring);

  // ---- Ambient particles ----
  const pCount = 300;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 24;
    pPos[i * 3 + 1] = Math.random() * 10;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 16 - 3;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x7dd3fc, size: 0.05, transparent: true, opacity: 0.6, depthWrite: false,
  }));
  scene.add(particles);

  // ---- Bottle visual (built with its base at y=0, then shifted so the
  //      group origin sits at the centre of mass like the physics body) ----
  const bottle = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.y = -COM_H;
  bottle.add(inner);

  const profile = [
    [0, 0], [0.36, 0], [0.42, 0.06], [0.42, 1.2], [0.38, 1.38],
    [0.22, 1.6], [0.17, 1.68], [0.17, 1.86],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shell = new THREE.Mesh(
    new THREE.LatheGeometry(profile, 40),
    new THREE.MeshPhysicalMaterial({
      color: 0xd6ecff, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.32,
      side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  shell.castShadow = true;
  inner.add(shell);

  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(0.39, 0.39, 0.72, 32),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8, emissive: 0x0e4a6e, roughness: 0.2, transparent: true, opacity: 0.85,
    }),
  );
  water.position.y = 0.06 + 0.36;
  inner.add(water);

  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.425, 0.425, 0.42, 40, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x2e1065, roughness: 0.5, side: THREE.DoubleSide }),
  );
  label.position.y = 0.95;
  label.castShadow = true;
  inner.add(label);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19, 0.19, 0.16, 24),
    new THREE.MeshStandardMaterial({ color: 0x2dd4bf, roughness: 0.4 }),
  );
  cap.position.y = 1.86 + 0.08;
  cap.castShadow = true;
  inner.add(cap);

  scene.add(bottle);

  // ---- Physics ----
  let squash = 0;          // visual compression while charging
  let ringPulse = 0;
  const physics = createBottlePhysics({
    onResult(result) {
      if (result === 'upright') ringPulse = 1;
      onResult?.(result);
    },
  });
  const body = physics.body;

  // ---- Layout: bottle on the right on wide screens, centred on narrow ----
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const wide = camera.aspect > 1.1;
    const offsetX = wide ? -Math.min(camera.aspect, 2) * 1.35 : 0;
    camera.position.set(offsetX, 2.6, wide ? 9 : 11);
    lookAt.set(offsetX, wide ? 1.9 : 2.4, 0);
    camera.lookAt(lookAt);
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

    physics.step(dt);

    bottle.position.copy(body.position);
    bottle.quaternion.copy(body.quaternion);
    const s = 1 - squash * 0.12;
    inner.scale.set(1 + squash * 0.06, s, 1 + squash * 0.06);

    ringPulse = Math.max(0, ringPulse - dt * 1.2);
    ring.scale.setScalar(1 + ringPulse * 1.5);
    ringMat.opacity = 0.55 + ringPulse * 0.45;

    if (!reducedMotion) {
      particles.rotation.y += dt * 0.02;
      grid.rotation.y -= dt * 0.03;
    }
    renderer.render(scene, camera);
  }

  return {
    launch: physics.launch,
    setCharge(p) { squash = physics.isReady() ? Math.min(p / MAX_POWER, 1) : 0; },
    isReady: physics.isReady,
    start() { if (!running) { running = true; clock.getDelta(); frame(); } },
    stop() { running = false; },
  };
}

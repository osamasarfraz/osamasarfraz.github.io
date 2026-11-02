// Tiny synthesised sound effects (Web Audio, no files). Off until the visitor
// turns them on with the speaker button; the choice is remembered. Every sound
// is a few oscillators or a noise burst, so the whole set weighs nothing.

const KEY = 'sfx';
let ctx = null, master = null, noiseBuf = null;
let enabled = false;
try { enabled = localStorage.getItem(KEY) === '1'; } catch { /* private mode */ }

const now = () => ctx.currentTime;

function ensure() {
  if (!enabled) return false;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx.state !== 'closed';
}

// A single oscillator with an exponential pitch slide and a volume envelope.
function tone({ type = 'sine', f = 440, to = f, dur = 0.1, gain = 0.5, attack = 0.004, delay = 0 }) {
  const t = now() + delay;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

// Filtered white noise: thuds, whooshes and bursts.
function noise({ dur = 0.08, gain = 0.4, f = 800, to = f, q = 1, type = 'lowpass', delay = 0 }) {
  const t = now() + delay;
  const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf;
  fl.type = type; fl.Q.value = q;
  fl.frequency.setValueAtTime(f, t);
  fl.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl).connect(g).connect(master);
  s.start(t); s.stop(t + dur + 0.02);
}

let lastLand = 0, lastTick = 0;

export const sfx = {
  get enabled() { return enabled; },
  set(on) {
    enabled = !!on;
    try { localStorage.setItem(KEY, enabled ? '1' : '0'); } catch { /* ignore */ }
    if (enabled && ensure()) sfx.confirm();
  },
  // Letter hitting the ground. Rate-limited: the intro drops 26 of them.
  land(impact = 8) {
    if (!ensure()) return;
    const t = performance.now();
    if (t - lastLand < 28) return;
    lastLand = t;
    const v = Math.min(1, impact / 16);
    noise({ dur: 0.06, gain: 0.25 * v, f: 500, to: 120 });
    tone({ f: 110 + v * 40, to: 45, dur: 0.09, gain: 0.5 * v });
  },
  // Brushing a letter: a blip that climbs with the combo.
  hit(strength = 0.5, step = 0) {
    if (!ensure()) return;
    const f = 520 * Math.pow(2, Math.min(step, 12) / 12);
    tone({ type: 'triangle', f, to: f * 1.3, dur: 0.07, gain: 0.12 + 0.3 * strength });
  },
  // Clicking the headline: a burst and a falling sweep.
  launch(combo = 1) {
    if (!ensure()) return;
    noise({ dur: 0.22, gain: 0.5, f: 3000, to: 200, type: 'bandpass', q: 0.7 });
    tone({ type: 'sawtooth', f: 700, to: 90, dur: 0.22, gain: 0.25 });
    const f = 880 * Math.pow(2, Math.min(combo - 1, 12) / 12);
    tone({ type: 'square', f, to: f, dur: 0.06, gain: 0.12, delay: 0.02 });
    if (combo > 1 && combo % 5 === 0) sfx.fanfare();
  },
  fanfare() {
    if (!ensure()) return;
    [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f, to: f, dur: 0.18, gain: 0.28, delay: i * 0.07 }));
  },
  // Counters ticking up.
  tick() {
    if (!ensure()) return;
    const t = performance.now();
    if (t - lastTick < 24) return;
    lastTick = t;
    tone({ f: 1800, to: 1400, dur: 0.025, gain: 0.12 });
  },
  // Filters, toggles and other small presses.
  click() {
    if (!ensure()) return;
    tone({ type: 'triangle', f: 420, to: 220, dur: 0.05, gain: 0.3 });
    noise({ dur: 0.03, gain: 0.12, f: 2500, to: 800 });
  },
  open() {
    if (!ensure()) return;
    noise({ dur: 0.25, gain: 0.18, f: 300, to: 2400, type: 'bandpass', q: 1.2 });
    tone({ f: 330, to: 880, dur: 0.2, gain: 0.14 });
  },
  close() {
    if (!ensure()) return;
    noise({ dur: 0.18, gain: 0.14, f: 2000, to: 250, type: 'bandpass', q: 1.2 });
    tone({ f: 660, to: 240, dur: 0.16, gain: 0.12 });
  },
  flip() {
    if (!ensure()) return;
    noise({ dur: 0.3, gain: 0.22, f: 400, to: 3000, type: 'bandpass', q: 2 });
    tone({ type: 'triangle', f: 500, to: 1000, dur: 0.25, gain: 0.08 });
  },
  // Achievement badge popping in.
  unlock(i = 0) {
    if (!ensure()) return;
    const d = i * 0.08;
    tone({ type: 'triangle', f: 784, to: 784, dur: 0.12, gain: 0.25, delay: d });
    tone({ type: 'triangle', f: 1175, to: 1175, dur: 0.25, gain: 0.25, delay: d + 0.09 });
    tone({ f: 2350, to: 2350, dur: 0.3, gain: 0.08, delay: d + 0.09 });
  },
  confirm() {
    if (!ensure()) return;
    tone({ type: 'triangle', f: 660, to: 660, dur: 0.09, gain: 0.25 });
    tone({ type: 'triangle', f: 990, to: 990, dur: 0.14, gain: 0.25, delay: 0.08 });
  },
};

// Wires the speaker button. The audio context is only created inside a user
// gesture, which is what browsers require before anything can play.
export function initSoundToggle(btn) {
  if (!btn) return;
  const paint = () => {
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? 'Turn sound effects off' : 'Turn sound effects on');
  };
  paint();
  btn.addEventListener('click', () => { sfx.set(!enabled); paint(); });
  if (enabled) {
    const warm = () => { ensure(); };
    window.addEventListener('pointerdown', warm, { once: true });
    window.addEventListener('keydown', warm, { once: true });
  }
}

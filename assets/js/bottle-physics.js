// Bottle-flip physics, independent of rendering so it can be stepped and
// tuned headlessly. Spin is fixed and power sets the flight time, so the
// rotation angle grows with power and only a band of powers lands close to a
// clean 360°. All timing uses simulation time, never wall-clock.

import * as CANNON from 'cannon-es';

export const GRAVITY = -20;     // heavier than real gravity so flips feel snappy
export const BOTTLE_H = 2.0;
export const BOTTLE_R = 0.42;
export const COM_H = 0.5;       // centre of mass above the base — the "water" keeps it low
export const MAX_POWER = 1.4;
const LAUNCH_V = 9;             // upward speed at power 1
const LAUNCH_SPIN = 7;          // spin (rad/s); ≈ one full turn at power 1
const BASE_DAMPING = 0.1;
const SETTLE_DAMPING = 0.8;     // held while settling so it doesn't rock for ages
// Coming within ~35° of upright soon after touchdown "sticks". Cap-down
// landings get no help, so they stay genuinely rare.
const STICK_UPRIGHT = Math.cos((35 * Math.PI) / 180);
const STICK_WINDOW = 0.4;       // seconds after first touchdown
const SLOSH_KEEP = 0.08;        // fraction of spin that survives the slosh
const STUCK_DAMPING = 0.985;    // once stuck, rock back upright without swinging
const FIXED_STEP = 1 / 120;

export function createBottlePhysics({ onResult, random = Math.random } = {}) {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, GRAVITY, 0) });
  const groundMat = new CANNON.Material('ground');
  const bottleMat = new CANNON.Material('bottle');
  world.addContactMaterial(new CANNON.ContactMaterial(groundMat, bottleMat, {
    friction: 0.6, restitution: 0.02,
  }));

  const ground = new CANNON.Body({ mass: 0, material: groundMat, shape: new CANNON.Plane() });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);

  const body = new CANNON.Body({ mass: 1, material: bottleMat, linearDamping: 0.05 });
  // cannon-es cylinders are Y-aligned; offset the shape so the body's origin
  // (its centre of mass) sits COM_H above the base.
  body.addShape(
    new CANNON.Cylinder(0.19, BOTTLE_R, BOTTLE_H, 16),
    new CANNON.Vec3(0, BOTTLE_H / 2 - COM_H, 0),
  );
  world.addBody(body);

  // idle → flying → settling → done → (reset) idle
  let state = 'idle';
  let simTime = 0;
  let launchTime = 0;
  let stillTime = 0;
  let landTime = 0;
  let sloshed = false;
  let slosh = false;       // absorption waiting to be applied after the step
  let resetAt = Infinity;

  function reset() {
    body.position.set(0, COM_H, 0);
    body.quaternion.set(0, 0, 0, 1);
    body.velocity.setZero();
    body.angularVelocity.setZero();
    body.angularDamping = BASE_DAMPING;
    sloshed = false;
    slosh = false;
    state = 'idle';
    resetAt = Infinity;
  }
  reset();

  const up = new CANNON.Vec3();
  const Y = new CANNON.Vec3(0, 1, 0);
  function upness() {
    body.quaternion.vmult(Y, up);
    return up.y;
  }

  body.addEventListener('collide', () => {
    if (state === 'flying' && simTime - launchTime > 0.15) {
      state = 'settling';
      landTime = simTime;
      body.angularDamping = SETTLE_DAMPING;
      stillTime = 0;
    }
    // Water sloshing to the bottom absorbs the spin on impact — the real
    // reason a bottle flip sticks. Checked on every contact in a short window,
    // because an edge-first landing only swings into the zone a moment later.
    // Applied after the step: the solver's contact impulse runs after this
    // event and would otherwise put the spin straight back.
    if (state === 'settling' && !sloshed && simTime - landTime < STICK_WINDOW && upness() > STICK_UPRIGHT) {
      sloshed = true;
      slosh = true;
    }
  });

  function applySlosh() {
    slosh = false;
    body.angularVelocity.scale(SLOSH_KEEP, body.angularVelocity);
    body.angularDamping = STUCK_DAMPING;
    body.velocity.x *= 0.3;
    body.velocity.z *= 0.3;
  }

  function launch(power) {
    if (state !== 'idle') return false;
    const p = Math.min(Math.max(power, 0), MAX_POWER);
    body.wakeUp();
    // Lift clear of the ground first: if the base is still in contact on the
    // first step, friction eats a third of the spin and turns it into drift.
    body.position.y += 0.05;
    body.velocity.set((random() - 0.5) * 0.4, LAUNCH_V * p, 0);
    body.angularVelocity.set(0, 0, -LAUNCH_SPIN);
    state = 'flying';
    launchTime = simTime;
    return true;
  }

  function finish(result) {
    state = 'done';
    resetAt = simTime + (result === 'fail' ? 0.8 : 1.2);
    onResult?.(result);
  }

  function evaluate() {
    const u = upness();
    return u > 0.9 ? 'upright' : u < -0.9 ? 'cap' : 'fail';
  }

  function step(dt) {
    world.step(FIXED_STEP, dt, 8);
    simTime += dt;
    if (slosh) applySlosh();

    if (state === 'settling') {
      // Call the outcome as soon as it's certain rather than waiting for the
      // bottle to stop dead. A stuck bottle that's near-upright only has a
      // little rattle left in it, so that's a win; tipped past ~55° can't
      // recover (it tips over at ~40°), so that's a fail right away.
      const u = upness();
      const calm = body.velocity.length() < 0.4 && body.angularVelocity.length() < 0.5;
      const settledEnough = sloshed
        ? u > 0.94 && body.angularVelocity.length() < 1.2
        : u > 0.97 && calm;
      stillTime = settledEnough ? stillTime + dt : 0;
      const sinceLanding = simTime - landTime;
      let result = null;
      if (stillTime >= (sloshed ? 0.15 : 0.25)) result = 'upright';
      else if (u < -0.9 && calm && sinceLanding > 0.5) result = 'cap';
      else if (u < 0.57 && u > -0.9 && sinceLanding > 0.3) result = 'fail';
      else if (sinceLanding > 3) result = evaluate();
      if (result) finish(result);
    } else if (state === 'flying' && simTime - launchTime > 4) {
      finish('fail');
    }
    if (state === 'done' && simTime >= resetAt) reset();
  }

  return {
    body,
    launch,
    step,
    isReady: () => state === 'idle',
    getState: () => state,
  };
}

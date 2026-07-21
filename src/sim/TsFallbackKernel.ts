// Pure-TypeScript physics fallback kernel (spec §3.3, §4.4, §4.5, D2, FR-7, FR-10).
//
// Used when the Rust→WASM kernel cannot load. It implements the same
// {@link PhysicsKernel} contract at reduced fidelity: a capped set of dust
// particles collapses under softened Newtonian gravity toward the forming core,
// planets orbit and spin, and visiting comets/asteroids are spawned on approach
// trajectories and classified as CAPTURED or EJECTED (FR-7). The lifecycle stage
// FSM ({@link StageMachine}) is advanced by the same sim-time `dt` and drives the
// narrative events; body capture/ejection events are interleaved with the stage
// events on a shared {@link EventBus} and drained once per {@link step}.
//
// The model is illustrative, not simulation-grade (PRD A1). To stay bounded and
// deterministic regardless of the (astronomically large) sim-time `dt` produced
// at fast pace, the numeric integration runs a small, capped number of internal
// substeps with a fixed internal timestep; the stage FSM still consumes the full
// `dt`. Everything is seeded deterministically from the config so runs are
// reproducible (a prerequisite for later WASM parity checks).

import type { CloudComposition, SimulationConfig } from '../config/SimulationConfig';
import { LifecycleStage } from '../config/fateModel';
import { EventBus, SimEventType } from './events';
import { StageMachine } from './stages';
import {
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_OFFSET,
  PARTICLE_STRIDE,
  type CelestialBody,
  type KernelInit,
  type PhysicsKernel,
  type StepResult,
  type Vec3,
} from './PhysicsKernel';

// --- Tunable constants (illustrative; centralized for auditability) ---------

/** Gravitational constant in scene units (masses in M☉, lengths in scene AU). */
export const GRAVITY = 1;

/** Softening length (scene units) that removes the 1/r² singularity at r→0. */
export const SOFTENING = 1;

/** Hard cap on simulated dust particles for interactive frame rates (FR-10). */
export const MAX_PARTICLES = 4000;

/** Maximum integration substeps per {@link TsFallbackKernel.step} call. */
export const MAX_SUBSTEPS = 8;

/** Fixed internal integration timestep (dimensionless visual seconds). */
export const INTERNAL_DT = 1 / 60;

/** Sim seconds that map to one internal integration substep. */
const SIM_SECONDS_PER_SUBSTEP = 5e14;

/** Number of planets seeded into the system at init. */
const PLANET_COUNT = 4;

/** Sim seconds between visiting comet/asteroid spawns. */
const VISITOR_SPAWN_INTERVAL = 8e15;

/**
 * Cap on simultaneously present visiting bodies (comets/asteroids). Captured
 * visitors stay in orbit indefinitely, so without a cap the body count would
 * grow without bound; once this many are present, spawning pauses until some
 * leave the system.
 */
const MAX_VISITORS = 10;

/** Per-species dust colour tint (linear RGB), visualizing composition (A2). */
const SPECIES_COLOR: Readonly<Record<keyof CloudComposition, Vec3>> = {
  hydrogen: [0.45, 0.6, 1.0],
  helium: [0.85, 0.88, 1.0],
  metals: [1.0, 0.62, 0.32],
};

// --- Pure numeric helpers (exported for unit testing) -----------------------

/**
 * Deterministic 32-bit PRNG (mulberry32). Returns a function yielding floats in
 * [0, 1). Used instead of `Math.random` so scenarios are reproducible.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fold a {@link SimulationConfig} into a stable 32-bit seed. */
export function seedFromConfig(config: SimulationConfig): number {
  const nums = [
    config.mass,
    config.cloudExtent,
    config.pace,
    config.composition.hydrogen,
    config.composition.helium,
    config.composition.metals,
  ];
  let h = 0x811c9dc5;
  for (const n of nums) {
    // Mix the float's bit pattern in so tiny parameter changes reseed.
    const bits = Math.trunc(n * 1e6) >>> 0;
    h = Math.imul(h ^ (bits & 0xffff), 0x01000193);
    h = Math.imul(h ^ (bits >>> 16), 0x01000193);
  }
  return h >>> 0;
}

/** Euclidean length of a vector. */
export function magnitude(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * Softened gravitational acceleration toward the origin (where the core sits)
 * for a body at `pos` around a central `mu = G·M`. The softening removes the
 * singularity so near-core bodies stay numerically stable.
 */
export function softenedAccel(mu: number, softening: number, pos: Vec3): Vec3 {
  const r2 = pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2];
  const denom = Math.pow(r2 + softening * softening, 1.5);
  const factor = denom > 0 ? -mu / denom : 0;
  return [pos[0] * factor, pos[1] * factor, pos[2] * factor];
}

/**
 * Total specific orbital energy under the SOFTENED potential, consistent with
 * {@link softenedAccel}. Used for energy-conservation checks.
 */
export function totalSpecificEnergySoftened(
  mu: number,
  softening: number,
  pos: Vec3,
  vel: Vec3,
): number {
  const speed = magnitude(vel);
  const r = magnitude(pos);
  return 0.5 * speed * speed - mu / Math.sqrt(r * r + softening * softening);
}

/**
 * Keplerian specific orbital energy `v²/2 − μ/r`. Negative ⇒ the body is
 * gravitationally bound to the system (FR-7). `r` is clamped away from 0.
 */
export function specificOrbitalEnergy(mu: number, r: number, speed: number): number {
  const rSafe = Math.max(r, Number.EPSILON);
  return 0.5 * speed * speed - mu / rSafe;
}

/** Whether a body with the given radius/speed is bound (energy < 0). */
export function isBound(mu: number, r: number, speed: number): boolean {
  return specificOrbitalEnergy(mu, r, speed) < 0;
}

/**
 * Circular-orbit speed for the SOFTENED central force at radius `r`. Seeding
 * planets with this speed gives near-constant-radius orbits.
 */
export function circularSpeed(mu: number, softening: number, r: number): number {
  const denom = Math.pow(r * r + softening * softening, 1.5);
  return denom > 0 ? Math.sqrt((mu * r * r) / denom) : 0;
}

/**
 * Advance a body one symplectic (semi-implicit) Euler substep under the softened
 * central force. Returns fresh position/velocity; the symplectic form keeps
 * bounded orbits bounded and conserves the softened energy well.
 */
export function integrateOrbit(
  pos: Vec3,
  vel: Vec3,
  mu: number,
  softening: number,
  h: number,
): { pos: Vec3; vel: Vec3 } {
  const a = softenedAccel(mu, softening, pos);
  const nvel: Vec3 = [vel[0] + a[0] * h, vel[1] + a[1] * h, vel[2] + a[2] * h];
  const npos: Vec3 = [pos[0] + nvel[0] * h, pos[1] + nvel[1] * h, pos[2] + nvel[2] * h];
  return { pos: npos, vel: nvel };
}

/** Classification of a visiting body's fate at a given instant. */
export type VisitorClassification = 'captured' | 'ejected' | 'transit';

/**
 * Classify a visiting comet/asteroid (FR-7). A bound trajectory is `captured`;
 * an unbound body that has passed the system boundary while receding is
 * `ejected`; otherwise it is still in `transit`.
 */
export function classifyVisitor(
  mu: number,
  pos: Vec3,
  vel: Vec3,
  ejectRadius: number,
): VisitorClassification {
  const r = magnitude(pos);
  const speed = magnitude(vel);
  if (isBound(mu, r, speed)) {
    return 'captured';
  }
  const radialVelocity = r > 0 ? (pos[0] * vel[0] + pos[1] * vel[1] + pos[2] * vel[2]) / r : 0;
  if (r >= ejectRadius && radialVelocity > 0) {
    return 'ejected';
  }
  return 'transit';
}

// --- Internal particle representation ---------------------------------------

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  g: number;
  b: number;
  size: number;
}

/**
 * Pure-TypeScript {@link PhysicsKernel}. Construct once, then drive with
 * {@link init} and repeated {@link step}. Deterministic for a given config.
 */
export class TsFallbackKernel implements PhysicsKernel {
  private readonly bus = new EventBus();
  private config: SimulationConfig | null = null;
  private machine: StageMachine | null = null;
  private rng: () => number = mulberry32(1);

  private particles: Particle[] = [];
  private bodies: CelestialBody[] = [];
  private particleBuffer = new Float32Array(0);
  private bodyBuffer = new Float32Array(0);

  private mu = 0;
  private ejectRadius = 0;
  private simTime = 0;
  private nextBodyId = 0;
  private spawnAccumulator = 0;

  init(init: KernelInit): void {
    const { config } = init;
    this.config = config;
    this.bus.clear();
    this.machine = new StageMachine(config, this.bus);
    this.rng = mulberry32(seedFromConfig(config));

    this.mu = GRAVITY * Math.max(config.mass, Number.EPSILON);
    this.ejectRadius = config.cloudExtent * 1.5;
    this.simTime = 0;
    this.nextBodyId = 0;
    this.spawnAccumulator = 0;

    this.seedParticles(init.particleCount);
    this.seedPlanets();

    this.particleBuffer = new Float32Array(this.particles.length * PARTICLE_STRIDE);
    this.bodyBuffer = new Float32Array(this.bodies.length * BODY_STRIDE);
    this.writeParticleBuffer();
    this.writeBodyBuffer();
  }

  step(dtSimSeconds: number): StepResult {
    const machine = this.machine;
    if (machine === null) {
      throw new Error('TsFallbackKernel.step called before init');
    }
    if (!Number.isFinite(dtSimSeconds) || dtSimSeconds <= 0) {
      return { events: this.bus.drain(), stage: machine.currentStage };
    }

    // Advance the narrative FSM over the full sim-time increment.
    machine.update(dtSimSeconds);
    this.simTime += dtSimSeconds;

    // Once the star ignites, the protoplanets have finished accreting and are
    // now full planets — reflect that in their type (and thus their labels).
    if (machine.currentStage >= LifecycleStage.FusionIgnition) {
      this.promotePlanets();
    }

    // Advance the numeric model with a bounded number of internal substeps.
    const substeps = Math.min(
      MAX_SUBSTEPS,
      Math.max(1, Math.round(dtSimSeconds / SIM_SECONDS_PER_SUBSTEP)),
    );
    for (let s = 0; s < substeps; s += 1) {
      this.integrateParticles(INTERNAL_DT);
      this.integrateBodies(INTERNAL_DT);
    }

    this.spawnVisitors(dtSimSeconds);
    this.resolveVisitors();

    this.writeParticleBuffer();
    this.rebuildBodyBuffer();

    return { events: this.bus.drain(), stage: machine.currentStage };
  }

  getParticleBuffer(): Float32Array {
    return this.particleBuffer;
  }

  getBodyBuffer(): Float32Array {
    return this.bodyBuffer;
  }

  dispose(): void {
    this.bus.clear();
    this.particles = [];
    this.bodies = [];
    this.particleBuffer = new Float32Array(0);
    this.bodyBuffer = new Float32Array(0);
    this.machine = null;
    this.config = null;
  }

  // --- Seeding ---------------------------------------------------------------

  private seedParticles(requested: number): void {
    const config = this.config;
    if (config === null) {
      return;
    }
    const count = Math.max(0, Math.min(Math.floor(requested), MAX_PARTICLES));
    const extent = config.cloudExtent;
    const cum = this.speciesCumulative(config.composition);
    this.particles = [];
    for (let i = 0; i < count; i += 1) {
      // Uniformly sample a point inside the spherical cloud.
      const radius = extent * Math.cbrt(this.rng());
      const cosTheta = 2 * this.rng() - 1;
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
      const phi = 2 * Math.PI * this.rng();
      const x = radius * sinTheta * Math.cos(phi);
      const y = radius * sinTheta * Math.sin(phi);
      const z = radius * cosTheta;

      // Gentle swirl about the y-axis (tangent in the x–z plane) so the collapse
      // forms a rotating disc rather than a straight radial in-fall.
      const swirl = 0.05 * circularSpeed(this.mu, SOFTENING, Math.max(radius, SOFTENING));
      const rho = Math.hypot(x, z) || 1;
      const [cr, cg, cb, size] = this.speciesColorSize(cum);
      this.particles.push({
        x,
        y,
        z,
        vx: (-z / rho) * swirl,
        vy: 0,
        vz: (x / rho) * swirl,
        r: cr,
        g: cg,
        b: cb,
        size,
      });
    }
  }

  private seedPlanets(): void {
    const config = this.config;
    if (config === null) {
      return;
    }
    this.bodies = [];
    const inner = config.cloudExtent * 0.15;
    const spacing = (config.cloudExtent * 0.55) / PLANET_COUNT;
    for (let i = 0; i < PLANET_COUNT; i += 1) {
      const r = inner + spacing * i;
      const speed = circularSpeed(this.mu, SOFTENING, r);
      const phase = 2 * Math.PI * this.rng();
      const position: Vec3 = [r * Math.cos(phase), 0, r * Math.sin(phase)];
      // Velocity tangential to the circular orbit in the x–z plane.
      const velocity: Vec3 = [-speed * Math.sin(phase), 0, speed * Math.cos(phase)];
      this.bodies.push({
        id: this.nextBodyId++,
        type: BodyType.Protoplanet,
        mass: 1e-6 * config.mass * (i + 1),
        radius: 0.4 + 0.15 * i,
        position,
        velocity,
        spin: 0.5 + this.rng(),
        captured: true,
      });
    }
  }

  // --- Integration -----------------------------------------------------------

  private integrateParticles(h: number): void {
    const mu = this.mu;
    for (const p of this.particles) {
      const a = softenedAccel(mu, SOFTENING, [p.x, p.y, p.z]);
      p.vx += a[0] * h;
      p.vy += a[1] * h;
      p.vz += a[2] * h;
      p.x += p.vx * h;
      p.y += p.vy * h;
      p.z += p.vz * h;
    }
  }

  private integrateBodies(h: number): void {
    const mu = this.mu;
    for (const body of this.bodies) {
      const stepped = integrateOrbit(body.position, body.velocity, mu, SOFTENING, h);
      body.position = stepped.pos;
      body.velocity = stepped.vel;
    }
  }

  // --- Visiting bodies (FR-7) ------------------------------------------------

  private spawnVisitors(dtSimSeconds: number): void {
    this.spawnAccumulator += dtSimSeconds;
    let guard = 0;
    while (this.spawnAccumulator >= VISITOR_SPAWN_INTERVAL && guard < MAX_SUBSTEPS) {
      this.spawnAccumulator -= VISITOR_SPAWN_INTERVAL;
      // Bound the number of visitors so captured ones can't accumulate forever.
      if (this.visitorCount() < MAX_VISITORS) {
        this.bodies.push(this.makeVisitor());
      }
      guard += 1;
    }
  }

  /** Promote any remaining protoplanets to full planets (idempotent). */
  private promotePlanets(): void {
    for (const body of this.bodies) {
      if (body.type === BodyType.Protoplanet) {
        body.type = BodyType.Planet;
      }
    }
  }

  /** Count currently-present visiting bodies (comets + asteroids). */
  private visitorCount(): number {
    let n = 0;
    for (const body of this.bodies) {
      if (body.type === BodyType.Comet || body.type === BodyType.Asteroid) {
        n += 1;
      }
    }
    return n;
  }

  /** Create a comet/asteroid at the system boundary heading inward. */
  private makeVisitor(): CelestialBody {
    const rng = this.rng;
    // Start on the boundary sphere.
    const cosTheta = 2 * rng() - 1;
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const phi = 2 * Math.PI * rng();
    const position: Vec3 = [
      this.ejectRadius * sinTheta * Math.cos(phi),
      this.ejectRadius * sinTheta * Math.sin(phi),
      this.ejectRadius * cosTheta,
    ];
    // Aim roughly at the core, with a speed straddling the escape threshold so
    // some visitors are captured and some fly through / are ejected.
    const escape = Math.sqrt((2 * this.mu) / Math.max(this.ejectRadius, Number.EPSILON));
    // Mostly above escape speed so visitors typically fly through and leave;
    // only the slower minority (< escape) are gravitationally captured, making
    // capture an occasional event rather than the common case.
    const speed = escape * (0.9 + 0.7 * rng());
    const dist = magnitude(position);
    const aim = 0.15 + 0.5 * rng(); // fraction of "straight at core" vs tangential
    const velocity: Vec3 = [
      (-position[0] / dist) * speed * aim,
      (-position[1] / dist) * speed * aim,
      (-position[2] / dist) * speed * aim,
    ];
    const isComet = rng() < 0.5;
    return {
      id: this.nextBodyId++,
      type: isComet ? BodyType.Comet : BodyType.Asteroid,
      mass: 1e-9,
      radius: isComet ? 0.3 : 0.2,
      position,
      velocity,
      spin: rng(),
      captured: false,
    };
  }

  /**
   * Evaluate visiting bodies for capture/ejection, emit the corresponding event
   * once per transition, and remove bodies that have left the system.
   */
  private resolveVisitors(): void {
    const survivors: CelestialBody[] = [];
    for (const body of this.bodies) {
      if (body.type !== BodyType.Comet && body.type !== BodyType.Asteroid) {
        survivors.push(body);
        continue;
      }
      const fate = classifyVisitor(this.mu, body.position, body.velocity, this.ejectRadius);
      if (fate === 'captured') {
        if (!body.captured) {
          body.captured = true;
          this.bus.emit({
            type: SimEventType.BodyCaptured,
            simTime: this.simTime,
            data: { bodyId: body.id, bodyType: body.type },
          });
        }
        survivors.push(body);
      } else if (fate === 'ejected') {
        this.bus.emit({
          type: SimEventType.BodyEjected,
          simTime: this.simTime,
          data: { bodyId: body.id, bodyType: body.type },
        });
        // Dropped from `survivors`: it has left the system.
      } else {
        survivors.push(body);
      }
    }
    this.bodies = survivors;
  }

  // --- Buffer serialization --------------------------------------------------

  private writeParticleBuffer(): void {
    const buf = this.particleBuffer;
    for (let i = 0; i < this.particles.length; i += 1) {
      const p = this.particles[i];
      if (p === undefined) {
        continue;
      }
      const base = i * PARTICLE_STRIDE;
      buf[base + PARTICLE_OFFSET.x] = p.x;
      buf[base + PARTICLE_OFFSET.y] = p.y;
      buf[base + PARTICLE_OFFSET.z] = p.z;
      buf[base + PARTICLE_OFFSET.r] = p.r;
      buf[base + PARTICLE_OFFSET.g] = p.g;
      buf[base + PARTICLE_OFFSET.b] = p.b;
      buf[base + PARTICLE_OFFSET.size] = p.size;
    }
  }

  /** Reallocate the body buffer if the count changed, then write it. */
  private rebuildBodyBuffer(): void {
    const needed = this.bodies.length * BODY_STRIDE;
    if (this.bodyBuffer.length !== needed) {
      this.bodyBuffer = new Float32Array(needed);
    }
    this.writeBodyBuffer();
  }

  private writeBodyBuffer(): void {
    const buf = this.bodyBuffer;
    for (let i = 0; i < this.bodies.length; i += 1) {
      const body = this.bodies[i];
      if (body === undefined) {
        continue;
      }
      const base = i * BODY_STRIDE;
      buf[base + BODY_OFFSET.id] = body.id;
      buf[base + BODY_OFFSET.type] = body.type;
      buf[base + BODY_OFFSET.mass] = body.mass;
      buf[base + BODY_OFFSET.radius] = body.radius;
      buf[base + BODY_OFFSET.x] = body.position[0];
      buf[base + BODY_OFFSET.y] = body.position[1];
      buf[base + BODY_OFFSET.z] = body.position[2];
      buf[base + BODY_OFFSET.vx] = body.velocity[0];
      buf[base + BODY_OFFSET.vy] = body.velocity[1];
      buf[base + BODY_OFFSET.vz] = body.velocity[2];
      buf[base + BODY_OFFSET.spin] = body.spin;
      buf[base + BODY_OFFSET.captured] = body.captured ? 1 : 0;
    }
  }

  // --- Composition → colour helpers -----------------------------------------

  /** Cumulative species fractions in H, He, metals order for sampling. */
  private speciesCumulative(composition: CloudComposition): [number, number, number] {
    const h = composition.hydrogen;
    const he = h + composition.helium;
    const m = he + composition.metals;
    return [h, he, m];
  }

  /** Pick a species by the seeded RNG and return its colour + point size. */
  private speciesColorSize(cum: [number, number, number]): [number, number, number, number] {
    const roll = this.rng() * (cum[2] > 0 ? cum[2] : 1);
    let color: Vec3;
    let size: number;
    if (roll < cum[0]) {
      color = SPECIES_COLOR.hydrogen;
      size = 1.0;
    } else if (roll < cum[1]) {
      color = SPECIES_COLOR.helium;
      size = 1.1;
    } else {
      color = SPECIES_COLOR.metals;
      size = 1.4;
    }
    return [color[0], color[1], color[2], size];
  }
}

/** Convenience: whether the FSM has reached its terminal remnant stage. */
export function isTerminalStage(stage: LifecycleStage): boolean {
  return stage === LifecycleStage.Remnant;
}

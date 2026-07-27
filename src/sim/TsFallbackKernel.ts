// Pure-TypeScript physics kernel — emergent gravitational-accretion model
// (spec §3.3, §4.4, §4.5, D2, FR-7, FR-10).
//
// This is the reference implementation of the hybrid realistic model. The
// PLANETARY SYSTEM is emergent: a rotating dust cloud collapses under the
// growing central core's gravity, dissipates its vertical motion into a thin
// coplanar disc, and accretes onto a central protostar and a set of seeded
// planetesimals (oligarchic growth) that merge and grow into protoplanets and
// planets — so planet count, mass and size are OUTCOMES, not scripted. Bodies
// follow real (softened) Keplerian orbits and visibly revolve; dust is
// physically depleted as it is accreted or falls into the star.
//
// The lifecycle is hybrid (see `advanceStages`): the FORMATION stages
// (DustCloud → Protostar → Fusion → MainSequence) are driven by the accreted
// core-mass fraction — the physics — so formation is always watchable; the
// STELLAR stages (MainSequence → RedGiant → Death → Remnant) cannot emerge from
// N-body gravity (they are nuclear/structural physics) so they are a mass-driven
// timed model using `stageDurations`. The particle/orbit dynamics advance on a
// bounded, always-visible "orbital time" derived from the sim clock (a stellar
// life spans ~10^10 yr and an orbit ~1 yr — they cannot share wall-clock, so
// orbital time is compressed to a watchable rate).
//
// Determinism holds per-language (seeded RNG, fixed iteration order); the model
// is intentionally not bit-identical to the Rust kernel (accretion is order-
// dependent), so tests assert physical invariants rather than cross-kernel
// parity.

import type { CloudComposition, SimulationConfig } from '../config/SimulationConfig';
import { LifecycleStage, RemnantType, fateModel, type FateOutcome } from '../config/fateModel';
import { auToScene, sceneToAu } from './astro';
import { EventBus, SimEventType } from './events';
import { stageDurations } from './stages';
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

/** Gravitational constant in scene units. */
export const GRAVITY = 1;

/** Softening length (scene units = AU) that removes the 1/r² singularity at r→0. */
export const SOFTENING = 0.35;

/** Hard cap on simulated dust particles for interactive frame rates (FR-10). */
export const MAX_PARTICLES = 4000;

/** Maximum integration substeps per {@link TsFallbackKernel.step} call. */
export const MAX_SUBSTEPS = 16;

/** Fixed internal integration timestep (dimensionless visual seconds). */
export const INTERNAL_DT = 1 / 60;

/**
 * Visual speed-up of the orbital dynamics: orbits and the collapse must be
 * watchable in seconds, so the effective central gravitational parameter is the
 * accreted core mass times this factor. Purely a time-scale choice; the stellar
 * model still uses the true mass.
 */
export const ORBITAL_MASS_SCALE = 110;

/**
 * Reference sim-seconds for the orbital-time compression curve. Calibrated to
 * the per-FRAME `simDt` the Clock produces across the pace range (~1e5 at slow
 * pace up to ~1e14 at the fastest) so orbits advance at a watchable rate: near-
 * frozen at the slowest pace, saturating to {@link ORBITAL_MAX} at fast pace.
 */
export const ORBITAL_REF = 2e4;

/** Orbital-time units produced per unit of the compression curve. */
export const ORBITAL_TIME_UNIT = 0.03;

/** Maximum orbital time advanced per {@link TsFallbackKernel.step} (stability). */
export const ORBITAL_MAX = 0.2;

/** Rate at which vertical (out-of-plane) velocity is dissipated → disc flattening. */
export const VERTICAL_DAMP = 1.8;

/**
 * Rate at which vertical POSITION relaxes toward the mid-plane. Collisions in a
 * real proto-disc convert vertical excursions to heat that radiates away over
 * many orbits; here we settle the disc on a watchable timescale so the cloud is
 * visibly seen to flatten into a plane during formation.
 */
export const DISK_SETTLE = 2.6;

/**
 * Gas drag that lets un-accreted dust lose angular momentum and spiral inward to
 * feed the growing star (formation only). Deliberately GENTLE so the cloud drains
 * onto the core GRADUALLY over the formation phase — a real protostar takes ~1 Myr
 * to assemble, and with a stronger drag the on-screen collapse was so fast the
 * star appeared to be born almost immediately. The drag is dissipative and
 * monotonic, so ignition is still reached; it just takes more steps.
 */
export const GAS_DRAG = 0.28;

/** Number of planetesimal seeds placed in the disc (survivors become planets). */
export const PLANETESIMAL_COUNT = 12;

/**
 * Snow line, in AU: the distance beyond which water/ammonia/methane ices
 * condense. Inside it only refractory rock and metal are available, so planets
 * stay small and rocky; beyond it the solid surface density jumps several-fold
 * and cores grow fast enough to capture nebular gas — which is why the Solar
 * System has small rocky worlds inside ~2.7 AU and giants outside it.
 */
export const SNOW_LINE_AU = 2.7;

/** Dust a planetesimal retains per sweep INSIDE the snow line (rock only). */
export const ROCKY_ACCRETION_EFFICIENCY = 0.0001;

/** Extra retention just beyond the snow line (ices + runaway gas capture). */
export const GIANT_ACCRETION_EFFICIENCY = 0.02;

/** e-folding distance (AU) over which the giant-forming supply thins out. */
export const GIANT_EFOLD_AU = 7;

/**
 * How strongly planetesimals feel the disc's vertical damping compared with the
 * dust. Well below 1 so planets keep a few degrees of mutual inclination rather
 * than collapsing into one perfectly flat plane.
 */
export const BODY_DAMP_FRACTION = 0.02;

/**
 * Core mass fractions (accreted mass / total cloud mass) at which the FORMATION
 * stages advance. These are physics-driven — the star ignites once the core has
 * gravitationally gathered enough of the cloud — so formation is always visible
 * and independent of the (astronomically longer) stellar clock. Mirror in Rust.
 */
export const PROTOSTAR_CORE_FRACTION = 0.1;
export const FUSION_CORE_FRACTION = 0.3;
export const IGNITION_CORE_FRACTION = 0.5;

/**
 * Maximum rate at which the protostar can swallow dust, as a FRACTION OF THE
 * CLOUD MASS per unit of orbital time (Ṁ, scaled by cloud mass so heavy clouds
 * both need and accrete more).
 *
 * This is the single most important pacing constant for formation, and it is
 * real physics, not a fudge: a protostar cannot accrete material as fast as
 * gravity delivers it. Infalling gas carries angular momentum, so it piles into
 * a disc and only reaches the star as fast as that angular momentum is
 * transported outward — a finite Ṁ (~1e-5 M☉/yr). THAT is why star formation
 * takes ~1 Myr instead of a free-fall time.
 *
 * Without this cap every grain crossing the capture radius was swallowed
 * instantly, so the core ran from its 4% seed to the 50% ignition threshold in
 * about a second of playback and the star appeared to be born immediately.
 * Dust that arrives faster than the cap simply stays in the visible inner disc
 * and is accreted over the following steps.
 */
export const CORE_ACCRETION_RATE = 0.0055;

/** Sim seconds between visiting comet/asteroid spawns. */
const VISITOR_SPAWN_INTERVAL = 8e15;

/** Cap on simultaneously present visiting bodies (comets/asteroids). */
const MAX_VISITORS = 10;

/** Fraction of the cloud mass pre-seeded into the central protostar core. */
const CORE_SEED_FRACTION = 0.04;

/** Fraction of the cloud mass in each planetesimal seed (~3 M⊕ for 1 M☉). */
const PLANETESIMAL_MASS_FRACTION = 1e-5;

/**
 * Fraction of swept dust a planetesimal RETAINS at `distanceAu`; the remainder
 * continues inward onto the star. This single curve is what makes the emergent
 * system look like a real one:
 *
 *   - inside the snow line only rock/metal condenses ⇒ small terrestrial worlds;
 *   - just beyond it ices multiply the solid supply and cores grow fast enough
 *     to capture gas ⇒ Jupiter-class giants;
 *   - further out the disc thins ⇒ Uranus/Neptune-class ice giants.
 *
 * Pure; exported for unit testing.
 */
export function accretionEfficiency(distanceAu: number): number {
  if (!(distanceAu > 0)) {
    return 0;
  }
  if (distanceAu < SNOW_LINE_AU) {
    return ROCKY_ACCRETION_EFFICIENCY;
  }
  const falloff = Math.exp(-(distanceAu - SNOW_LINE_AU) / GIANT_EFOLD_AU);
  return ROCKY_ACCRETION_EFFICIENCY + GIANT_ACCRETION_EFFICIENCY * falloff;
}

/**
 * Body-swallow radius as a fraction of the dust feeding radius. A body that
 * plunges inside it has effectively fallen into the star and is destroyed —
 * without this, a body whose orbit decays parks ON the star, which is not
 * physically plausible.
 */
export const BODY_SWALLOW_FRACTION = 0.6;

/**
 * Visual radius bounds for celestial bodies, in scene units (= AU).
 *
 * These are SOLAR-SYSTEM proportions, not arcade ones: Jupiter's true radius is
 * 0.00048 AU against a 5.2 AU orbit, so a literal drawing would be sub-pixel.
 * The bodies are therefore exaggerated ~30×, but no further — the largest gas
 * giant (0.016 AU) is still ~1/3 of the star's radius and ~1/300 of its orbit,
 * so the eye reads "tiny worlds separated by vast distances" rather than
 * "marbles orbiting a beach ball". Visibility at any zoom is handled in the
 * renderer by a minimum APPARENT (screen-space) size, not by inflating the
 * physical radius — see `screenScale.ts`.
 */
export const MIN_BODY_RADIUS = 0.004;
export const MAX_BODY_RADIUS = 0.016;

/** Visual radii of visiting comets/asteroids, in scene units (= AU). */
export const COMET_RADIUS = 0.008;
export const ASTEROID_RADIUS = 0.006;

/** Particles beyond this multiple of the cloud extent are considered escaped. */
const ESCAPE_EXTENT_FACTOR = 2.4;

/** Number of ejecta particles thrown out when the star dies (nebula/supernova). */
const EJECTA_COUNT = 1200;

/** Debris fragments spawned when a body is tidally disrupted by the star. */
const DEBRIS_PER_BODY = 140;

/**
 * Orbital-time lifetime of a tidal-disruption debris stream. Debris torn off a
 * body the star is eating is NOT on a stable orbit — it is falling in, and it is
 * accreted within a few orbits. Without a finite lifetime the fragments stayed
 * on whatever orbit they inherited and could still be seen circling the star
 * long after it had become a white dwarf, which is not physical.
 */
export const DEBRIS_LIFETIME = 6;

/**
 * Per-orbital-time velocity drag on debris. The stream is shredded, shocked and
 * colliding with itself, so it loses angular momentum fast and spirals into the
 * star — the visible tidal in-fall.
 */
export const DEBRIS_DRAG = 0.6;

/**
 * Minimum death-ejecta speed as a multiple of the LOCAL ESCAPE SPEED. Real
 * planetary-nebula and supernova ejecta always exceeds escape velocity — that is
 * why the shell disperses and leaves a bare remnant instead of settling into a
 * ring around it. Enforcing it here guarantees no ejecta can end up orbiting the
 * white dwarf/neutron star.
 */
export const EJECTA_ESCAPE_MARGIN = 1.25;

/**
 * Reach of the red giant's photosphere, in AU, for a 1 M☉ star (scaled by mass).
 * As the star swells it engulfs and destroys planets that orbit inside this
 * radius — the Sun will reach ~1–2 AU and consume Mercury, Venus and probably
 * Earth, while Jupiter and the outer planets survive. Real, and the reason a
 * remnant should NOT be surrounded by close-in planets.
 */
export const REDGIANT_ENGULF_AU = 2.2;

/**
 * Cap on how much surviving orbits widen when the dying star sheds its mass.
 * Slow (adiabatic) mass loss expands an orbit by M_initial / M_remnant; a Sun
 * loses ~half its mass to a white dwarf (≈1.8×), a supernova far more. Capped so
 * survivors drift to clearly wider orbits without flying off-screen.
 */
export const REMNANT_ORBIT_EXPANSION_MAX = 2.6;

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
    const bits = Math.trunc(n * 1e6) >>> 0;
    h = Math.imul(h ^ (bits & 0xffff), 0x01000193);
    h = Math.imul(h ^ (bits >>> 16), 0x01000193);
  }
  return h >>> 0;
}

/**
 * Central gravitational parameter the kernels integrate against, for a cloud of
 * `cloudMass` solar masses. Exposed so the renderer can reconstruct the same
 * Kepler orbits the kernel is actually following (orbit-path overlay).
 */
export function orbitalMu(cloudMass: number): number {
  // Scales as √M rather than M so a 20 M☉ cloud's orbits are faster than a
  // solar one's, but not 20× faster — at full mass-proportionality the inner
  // dynamics outrun the fixed integration substep, and grains get numerically
  // flung out of the system instead of accreting. This only sets the VISUAL
  // orbital rate; every reported figure (orbital speed, period, temperature)
  // is computed from true Kepler physics in `astro.ts`.
  return GRAVITY * ORBITAL_MASS_SCALE * Math.sqrt(Math.max(cloudMass, Number.EPSILON));
}

/** Euclidean length of a vector. */
export function magnitude(v: Vec3): number {
  return Math.hypot(v[0], v[1], v[2]);
}

/**
 * A unit vector perpendicular to `axis`, rotated by `angle` around it — i.e. an
 * arbitrary direction in the plane normal to `axis`. Used to give an incoming
 * visitor a tangential velocity component (a non-zero impact parameter), which
 * is what turns a degenerate radial plunge into a real hyperbolic fly-by.
 * Returns a stable fallback for a degenerate axis. Pure.
 */
export function perpendicularTo(axis: Vec3, angle: number): Vec3 {
  const len = magnitude(axis);
  if (!(len > 0)) {
    return [1, 0, 0];
  }
  const a: Vec3 = [axis[0] / len, axis[1] / len, axis[2] / len];
  // Pick any reference not parallel to the axis, then build an orthonormal pair.
  const ref: Vec3 = Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const e1: Vec3 = [
    a[1] * ref[2] - a[2] * ref[1],
    a[2] * ref[0] - a[0] * ref[2],
    a[0] * ref[1] - a[1] * ref[0],
  ];
  const e1Len = magnitude(e1);
  if (!(e1Len > 0)) {
    return [1, 0, 0];
  }
  const u: Vec3 = [e1[0] / e1Len, e1[1] / e1Len, e1[2] / e1Len];
  // v = a × u completes the right-handed basis of the perpendicular plane.
  const v: Vec3 = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
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
 * bodies with this speed gives near-constant-radius orbits.
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

/**
 * Compress the (astronomically scaled) stellar sim-time increment into a
 * bounded, always-visible amount of orbital time. Zero when paused; saturates so
 * fast pace never blows up the integrator. Pure; exported for unit testing.
 */
export function orbitalStep(simDtSeconds: number): number {
  if (!Number.isFinite(simDtSeconds) || simDtSeconds <= 0) {
    return 0;
  }
  const compressed = ORBITAL_TIME_UNIT * Math.log(1 + simDtSeconds / ORBITAL_REF);
  return Math.min(ORBITAL_MAX, Math.max(0, compressed));
}

/**
 * Accretion (feeding-zone) radius of a body of the given mass, in scene units —
 * an oligarchic-growth heuristic (∝ cube-root of mass, Hill-sphere-like). Pure.
 */
export function accretionRadius(bodyMass: number, cloudMass: number): number {
  const ref = Math.max(cloudMass, Number.EPSILON);
  // Deliberately modest so planetesimals sip from their feeding zone while the
  // central protostar (a far larger sink) swallows the bulk of the infalling
  // dust — planets end up a tiny fraction of the stellar mass, as in reality.
  return 0.4 + 1.2 * Math.cbrt(Math.max(bodyMass, 0) / ref);
}

/**
 * Visual radius (scene units = AU) of a body from its accreted mass. Pure.
 *
 * Kept at Solar-System proportions (see {@link MAX_BODY_RADIUS}): every body is
 * a small fraction of the star and a minute fraction of its own orbit. Radius
 * follows the physical ∝ M^(1/3) (constant-density) relation.
 */
export function bodyRadiusFromMass(bodyMass: number, cloudMass: number): number {
  // Reference ≈ one Jupiter mass (9.5e-4 M☉), so a Jupiter-class planet lands
  // above the gas-giant threshold and Earth-class worlds well below it.
  const ref = Math.max(cloudMass * 1e-3, Number.EPSILON);
  const r = 0.0035 + 0.011 * Math.cbrt(Math.max(bodyMass, 0) / ref);
  return Math.min(MAX_BODY_RADIUS, Math.max(MIN_BODY_RADIUS, r));
}

/**
 * Radius at which two growing oligarchs COLLIDE and merge, in scene units.
 *
 * Deliberately decoupled from {@link bodyRadiusFromMass}: this is a DYNAMICAL
 * radius (overlapping feeding zones plus gravitational focusing, which hugely
 * enlarges a planetesimal's effective cross-section), not the drawn size of the
 * body. Merging on the drawn radius would be doubly wrong — real accretion
 * collisions are far more frequent than the geometric cross-section implies, and
 * it would make the emergent planet count depend on a purely visual choice.
 * Pure; exported for unit testing.
 */
export function mergeRadius(bodyMass: number, cloudMass: number): number {
  const ref = Math.max(cloudMass * 1e-3, Number.EPSILON);
  const r = 0.026 + 0.085 * Math.cbrt(Math.max(bodyMass, 0) / ref);
  return Math.min(0.12, Math.max(0.03, r));
}

/**
 * Momentum-conserving merge of two masses' velocities (perfectly inelastic
 * collision): the combined body carries the total momentum. Pure.
 */
export function mergedVelocity(m1: number, v1: Vec3, m2: number, v2: Vec3): Vec3 {
  const m = m1 + m2;
  if (m <= 0) {
    return [0, 0, 0];
  }
  return [
    (m1 * v1[0] + m2 * v2[0]) / m,
    (m1 * v1[1] + m2 * v2[1]) / m,
    (m1 * v1[2] + m2 * v2[2]) / m,
  ];
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

/**
 * What a particle physically IS. The three populations behave differently and,
 * crucially, die differently — conflating them is what left glowing fragments
 * orbiting the white dwarf forever.
 */
export enum ParticleKind {
  /** Primordial birth-cloud grain: carries mass, settles into the disc, accretes. */
  Dust = 0,
  /** Tidal-disruption debris from a body the star destroyed: falls in, short-lived. */
  Debris = 1,
  /** Death ejecta (planetary nebula / supernova shell): unbound, expands away. */
  Ejecta = 2,
}

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
  mass: number;
  /** Population this particle belongs to (drives drag, damping and lifetime). */
  kind: ParticleKind;
  /** Remaining lifetime in orbital-time units; `Infinity` for permanent grains. */
  ttl: number;
}

/**
 * Pure-TypeScript {@link PhysicsKernel} with emergent accretion. Construct once,
 * then drive with {@link init} and repeated {@link step}. Deterministic for a
 * given config.
 */
export class TsFallbackKernel implements PhysicsKernel {
  private readonly bus = new EventBus();
  private config: SimulationConfig | null = null;
  private rng: () => number = mulberry32(1);

  private particles: Particle[] = [];
  private bodies: CelestialBody[] = [];
  private particleBuffer = new Float32Array(0);
  private bodyBuffer = new Float32Array(0);

  private cloudExtent = 50;
  private cloudMass = 1;
  private coreMass = 0;
  /**
   * Mass that has left the dust pool but has NOT yet reached the star: the inner
   * accretion disc. Dust swept up by a planetesimal but not retained by it flows
   * in here, and it drains onto the core under the same {@link CORE_ACCRETION_RATE}
   * limit as direct infall — so no channel can bypass the star's finite Ṁ.
   */
  private discReservoir = 0;
  /** Radius within which the central protostar swallows dust (scaled to extent). */
  private coreAccretionRadius = 3;
  /**
   * Radius within which a discrete BODY that plunges inward is destroyed and
   * absorbed by the star. Smaller than {@link coreAccretionRadius} (which is the
   * diffuse dust feeding zone): a planet is only consumed if it actually falls
   * into the star, not merely because it orbits close to it.
   */
  private bodySwallowRadius = 2;
  private ejectRadius = 0;
  private simTime = 0;
  private nextBodyId = 0;
  private spawnAccumulator = 0;
  private ejectaDone = false;

  // --- Stellar/formation evolution controller state ---
  /** Current lifecycle stage (formation is accretion-driven, stellar is timed). */
  private stage: LifecycleStage = LifecycleStage.DustCloud;
  /** Sim seconds elapsed since entering the current STELLAR stage. */
  private stellarElapsed = 0;
  /** Per-stage stellar durations (sim seconds), keyed by mass + composition. */
  private durations: Readonly<Record<LifecycleStage, number>> = stageDurations(1, {
    hydrogen: 0.74,
    helium: 0.24,
    metals: 0.02,
  });
  /** Pre-computed death outcome (supernova flag + remnant kind). */
  private fate: FateOutcome = { supernova: false, remnant: RemnantType.WhiteDwarf };
  /** Core mass fraction at the last step, for {@link stageProgress}. */
  private coreFraction = 0;
  /**
   * Cumulative sim-seconds of the three FORMATION stages, and the running total.
   * Formation is accretion-driven, so its progress is mapped onto these REAL
   * durations to report a physically meaningful elapsed time (a solar cloud
   * takes ~1.6 Myr to form a star, not the few dozen years the raw pace-scaled
   * clock would show).
   */
  private formationDuration = 0;

  init(init: KernelInit): void {
    const { config } = init;
    this.config = config;
    this.bus.clear();
    this.rng = mulberry32(seedFromConfig(config));

    this.cloudExtent = config.cloudExtent;
    this.cloudMass = Math.max(config.mass, Number.EPSILON);
    this.coreMass = this.cloudMass * CORE_SEED_FRACTION;
    this.discReservoir = 0;
    // Small capture zone (AU) so planets can orbit INSIDE the snow line; dust
    // still reaches the star by spiralling in under gas drag.
    this.coreAccretionRadius = Math.min(2, Math.max(0.5, config.cloudExtent * 0.02));
    this.bodySwallowRadius = this.coreAccretionRadius * BODY_SWALLOW_FRACTION;
    this.ejectRadius = config.cloudExtent * 1.5;
    this.simTime = 0;
    this.nextBodyId = 0;
    this.spawnAccumulator = 0;
    this.ejectaDone = false;

    this.stage = LifecycleStage.DustCloud;
    this.stellarElapsed = 0;
    this.durations = stageDurations(config.mass, config.composition);
    this.formationDuration =
      this.durations[LifecycleStage.DustCloud] +
      this.durations[LifecycleStage.ProtostarCoalescence] +
      this.durations[LifecycleStage.FusionIgnition];
    this.fate = fateModel.determineFate(config.mass, config.composition);
    this.coreFraction = this.coreMass / this.cloudMass;

    this.seedParticles(init.particleCount);
    this.seedPlanetesimals();

    this.particleBuffer = new Float32Array(this.particles.length * PARTICLE_STRIDE);
    this.bodyBuffer = new Float32Array(this.bodies.length * BODY_STRIDE);
    this.writeParticleBuffer();
    this.writeBodyBuffer();
  }

  step(dtSimSeconds: number): StepResult {
    if (this.config === null) {
      throw new Error('TsFallbackKernel.step called before init');
    }
    if (!Number.isFinite(dtSimSeconds) || dtSimSeconds <= 0) {
      return {
        events: this.bus.drain(),
        stage: this.stage,
        stageProgress: this.stageProgress(),
        elapsedSimSeconds: this.elapsedSimSeconds(),
      };
    }

    this.simTime += dtSimSeconds;

    // Advance the emergent dynamics on the bounded, watchable orbital clock. This
    // grows the accreted core mass, which in turn drives the formation stages.
    const orbital = orbitalStep(dtSimSeconds);
    if (orbital > 0) {
      const substeps = Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil(orbital / INTERNAL_DT)));
      const h = orbital / substeps;
      const forming = this.stage <= LifecycleStage.FusionIgnition;
      for (let s = 0; s < substeps; s += 1) {
        this.integrateParticles(h, forming);
        this.integrateBodies(h);
      }
      this.accrete(this.stage, orbital);
      this.ageParticles(orbital);
    }

    // Drive the lifecycle: FORMATION from accreted core mass, STELLAR from time.
    this.coreFraction = this.coreMass / Math.max(this.cloudMass, Number.EPSILON);
    this.advanceStages(dtSimSeconds, this.coreFraction);

    // Once the star ignites, the surviving planetesimals are full planets.
    if (this.stage >= LifecycleStage.FusionIgnition) {
      this.promotePlanets();
    }
    // When the star dies, sweep away everything still circling it (a real
    // system's disc and any tidal debris are long gone by the remnant stage —
    // otherwise they would be seen orbiting forever right next to the white
    // dwarf) and throw a shell of ejecta outward.
    if (this.stage >= LifecycleStage.Death && !this.ejectaDone) {
      this.dissipateDiscMaterial();
      this.spawnEjecta();
      this.ejectaDone = true;
    }

    this.spawnVisitors(dtSimSeconds);
    this.resolveVisitors();
    this.cullParticles();

    this.rebuildParticleBuffer();
    this.rebuildBodyBuffer();

    return {
      events: this.bus.drain(),
      stage: this.stage,
      stageProgress: this.stageProgress(),
      elapsedSimSeconds: this.elapsedSimSeconds(),
    };
  }

  /**
   * Advance the lifecycle. FORMATION (DustCloud → Protostar → Fusion →
   * MainSequence) is driven by the accreted core-mass fraction — the star
   * ignites once it has gravitationally gathered enough of the cloud, so
   * formation is always watchable regardless of the stellar pace. The STELLAR
   * stages (MainSequence → RedGiant → Death → Remnant) are driven by sim-time.
   * Emits exactly one entry event per transition.
   */
  private advanceStages(simDt: number, coreFrac: number): void {
    // Formation — sequential ifs so a big accretion jump can cascade in one step.
    if (this.stage === LifecycleStage.DustCloud && coreFrac >= PROTOSTAR_CORE_FRACTION) {
      this.stage = LifecycleStage.ProtostarCoalescence;
      this.emitStageEvent(SimEventType.CollapseOnset);
    }
    if (this.stage === LifecycleStage.ProtostarCoalescence && coreFrac >= FUSION_CORE_FRACTION) {
      this.stage = LifecycleStage.FusionIgnition;
      this.emitStageEvent(SimEventType.ProtostarFormed);
    }
    if (this.stage === LifecycleStage.FusionIgnition && coreFrac >= IGNITION_CORE_FRACTION) {
      this.stage = LifecycleStage.MainSequence;
      this.stellarElapsed = 0;
      this.emitStageEvent(SimEventType.FusionIgnition);
    }

    // Stellar — sim-time driven; a single large dt can cross several boundaries.
    if (
      this.stage >= LifecycleStage.MainSequence &&
      this.stage < LifecycleStage.Remnant &&
      Number.isFinite(simDt) &&
      simDt > 0
    ) {
      this.stellarElapsed += simDt;
      let guard = 0;
      while (guard < 8) {
        guard += 1;
        const dur = this.durations[this.stage];
        if (!Number.isFinite(dur) || dur <= 0 || this.stellarElapsed < dur) {
          break;
        }
        this.stellarElapsed -= dur;
        if (this.stage === LifecycleStage.MainSequence) {
          this.stage = LifecycleStage.RedGiant;
          // The swelling giant engulfs and destroys its inner planets.
          this.engulfInnerPlanets();
          this.emitStageEvent(SimEventType.RedGiantOnset);
        } else if (this.stage === LifecycleStage.RedGiant) {
          this.stage = LifecycleStage.Death;
          this.emitStageEvent(SimEventType.DeathEvent, { supernova: this.fate.supernova });
        } else if (this.stage === LifecycleStage.Death) {
          this.stage = LifecycleStage.Remnant;
          // Mass loss widens the surviving planets' orbits (they were left
          // orbiting a much lighter star).
          this.expandOrbitsAfterMassLoss();
          this.emitStageEvent(SimEventType.RemnantFormed, {
            remnant: this.fate.remnant,
            supernova: this.fate.supernova,
          });
          break;
        } else {
          break;
        }
      }
    }
  }

  /** Emit a lifecycle event stamped with the current sim time. */
  private emitStageEvent(type: SimEventType, data?: Record<string, unknown>): void {
    if (data === undefined) {
      this.bus.emit({ type, simTime: this.simTime });
    } else {
      this.bus.emit({ type, simTime: this.simTime, data });
    }
  }

  /**
   * Physically meaningful elapsed time (sim seconds). During FORMATION the
   * accretion progress is mapped onto the real formation durations, so the star
   * ignites after ~1.6 Myr (solar) rather than after the handful of years the
   * raw pace-scaled clock would report. Afterwards the stellar clock continues
   * from the end of formation.
   */
  private elapsedSimSeconds(): number {
    const d = this.durations;
    switch (this.stage) {
      case LifecycleStage.DustCloud:
        return d[LifecycleStage.DustCloud] * this.stageProgress();
      case LifecycleStage.ProtostarCoalescence:
        return (
          d[LifecycleStage.DustCloud] +
          d[LifecycleStage.ProtostarCoalescence] * this.stageProgress()
        );
      case LifecycleStage.FusionIgnition:
        return (
          d[LifecycleStage.DustCloud] +
          d[LifecycleStage.ProtostarCoalescence] +
          d[LifecycleStage.FusionIgnition] * this.stageProgress()
        );
      default:
        return this.formationDuration + this.stellarElapsedTotal();
    }
  }

  /** Sim seconds elapsed since the star reached the main sequence. */
  private stellarElapsedTotal(): number {
    const d = this.durations;
    let done = 0;
    if (this.stage > LifecycleStage.MainSequence) {
      done += d[LifecycleStage.MainSequence];
    }
    if (this.stage > LifecycleStage.RedGiant) {
      done += d[LifecycleStage.RedGiant];
    }
    if (this.stage > LifecycleStage.Death) {
      done += d[LifecycleStage.Death];
    }
    return done + this.stellarElapsed;
  }

  /** Normalized 0..1 progress through the current stage (see StepResult). */
  private stageProgress(): number {
    const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
    switch (this.stage) {
      case LifecycleStage.DustCloud:
        return clamp01(this.coreFraction / PROTOSTAR_CORE_FRACTION);
      case LifecycleStage.ProtostarCoalescence:
        return clamp01(
          (this.coreFraction - PROTOSTAR_CORE_FRACTION) /
            (FUSION_CORE_FRACTION - PROTOSTAR_CORE_FRACTION),
        );
      case LifecycleStage.FusionIgnition:
        return clamp01(
          (this.coreFraction - FUSION_CORE_FRACTION) /
            (IGNITION_CORE_FRACTION - FUSION_CORE_FRACTION),
        );
      case LifecycleStage.MainSequence:
      case LifecycleStage.RedGiant:
      case LifecycleStage.Death: {
        const dur = this.durations[this.stage];
        return Number.isFinite(dur) && dur > 0 ? clamp01(this.stellarElapsed / dur) : 1;
      }
      default:
        return 1;
    }
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
    this.config = null;
  }

  /**
   * Gravitational parameter driving the dynamics (visual-scaled). Uses the TOTAL
   * cloud mass — the collapsing cloud gravitates as a whole, not just the tiny
   * seed core — so the collapse and orbits proceed from the very start rather
   * than stalling until the core has (somehow) grown.
   */
  private get mu(): number {
    return orbitalMu(this.cloudMass);
  }

  /**
   * Effective radius within which the star captures dust. At least the physical
   * feeding radius, but never smaller than the distance a fast in-falling grain
   * covers in one integration substep — otherwise, around a massive (and
   * therefore fast) cloud, grains would "tunnel" straight through the capture
   * sphere between substeps and the star could never finish forming.
   */
  private get captureRadius(): number {
    const infallPerSubstep = Math.sqrt(this.mu) * INTERNAL_DT;
    return Math.max(this.coreAccretionRadius, 2 * infallPerSubstep);
  }

  // --- Seeding ---------------------------------------------------------------

  private seedParticles(requested: number): void {
    const config = this.config;
    if (config === null) {
      return;
    }
    const count = Math.max(0, Math.min(Math.floor(requested), MAX_PARTICLES));
    const extent = this.cloudExtent;
    const cum = this.speciesCumulative(config.composition);
    const seedMu = this.mu;
    // Distribute the dust budget across the particles.
    const dustBudget =
      this.cloudMass * (1 - CORE_SEED_FRACTION - PLANETESIMAL_COUNT * PLANETESIMAL_MASS_FRACTION);
    const perParticle = count > 0 ? Math.max(dustBudget / count, 0) : 0;
    this.particles = [];
    for (let i = 0; i < count; i += 1) {
      // Centrally-concentrated cloud (surface density ∝ 1/ρ) in the x–z plane
      // with a modest vertical spread that dissipation collapses into a thin
      // disc. Concentration + sub-Keplerian spin let the cloud drain onto the
      // forming star over the formation phase.
      const rho = extent * (0.04 + 0.56 * this.rng());
      const phi = 2 * Math.PI * this.rng();
      const x = rho * Math.cos(phi);
      const z = rho * Math.sin(phi);
      const y = (this.rng() - 0.5) * extent * 0.45;

      // Sub-Keplerian prograde rotation (so the cloud both spins and collapses).
      const vCirc = circularSpeed(seedMu, SOFTENING, Math.max(rho, SOFTENING));
      const spin = vCirc * (0.45 + 0.15 * this.rng());
      const disp = vCirc * 0.05;
      const [cr, cg, cb, size] = this.speciesColorSize(cum);
      this.particles.push({
        x,
        y,
        z,
        vx: (-z / Math.max(rho, 1e-6)) * spin + (this.rng() - 0.5) * disp,
        vy: (this.rng() - 0.5) * disp,
        vz: (x / Math.max(rho, 1e-6)) * spin + (this.rng() - 0.5) * disp,
        r: cr,
        g: cg,
        b: cb,
        size,
        mass: perParticle,
        kind: ParticleKind.Dust,
        ttl: Infinity,
      });
    }
  }

  private seedPlanetesimals(): void {
    if (this.config === null) {
      return;
    }
    this.bodies = [];
    const seedMu = this.mu;
    // Keep the innermost seed clear of the star's feeding zone, then space the
    // seeds GEOMETRICALLY (each orbit ~30% wider than the last). Real systems —
    // including our own, via the Titius–Bode pattern — space their planets by
    // roughly constant ratios, because that is the spacing at which neighbouring
    // feeding zones stop overlapping.
    const inner = Math.max(this.cloudExtent * 0.02, this.coreAccretionRadius * 1.3);
    const outer = Math.max(inner * 4, this.cloudExtent * 0.8);
    const mass = this.cloudMass * PLANETESIMAL_MASS_FRACTION;
    const ratio =
      PLANETESIMAL_COUNT > 1 ? Math.pow(outer / inner, 1 / (PLANETESIMAL_COUNT - 1)) : 1;
    for (let i = 0; i < PLANETESIMAL_COUNT; i += 1) {
      // Semi-major axis, with a little scatter so the pattern is not mechanical.
      const a = inner * Math.pow(ratio, i) * (0.94 + 0.12 * this.rng());
      // Protoplanetary discs are dynamically "warm": orbits are near-circular but
      // never exactly circular, and slightly inclined to one another.
      const ecc = 0.02 + 0.13 * this.rng();
      const inclination = (this.rng() - 0.5) * 0.09; // ±~2.5°
      const phase = 2 * Math.PI * this.rng();

      // Seed at this radius with a tangential speed scaled off the SOFTENED
      // circular speed: faster than circular ⇒ we are at periapsis and the orbit
      // swings outward; slower ⇒ apoapsis. Either way |e| ≈ ecc.
      const atPeriapsis = this.rng() < 0.5;
      const speed = circularSpeed(seedMu, SOFTENING, a) * Math.sqrt(1 + (atPeriapsis ? ecc : -ecc));

      const cosI = Math.cos(inclination);
      const sinI = Math.sin(inclination);
      const position: Vec3 = [a * Math.cos(phase), a * sinI, a * Math.sin(phase) * cosI];
      const velocity: Vec3 = [
        -speed * Math.sin(phase),
        speed * sinI * 0.5,
        speed * Math.cos(phase) * cosI,
      ];
      this.bodies.push({
        id: this.nextBodyId++,
        type: BodyType.Protoplanet,
        mass,
        radius: bodyRadiusFromMass(mass, this.cloudMass),
        position,
        velocity,
        spin: 0.5 + this.rng(),
        captured: true,
      });
    }
  }

  // --- Integration -----------------------------------------------------------

  private integrateParticles(h: number, forming: boolean): void {
    const mu = this.mu;
    const vertical = Math.max(0, 1 - VERTICAL_DAMP * h);
    const settle = Math.max(0, 1 - DISK_SETTLE * h);
    // Gas drag only acts while the disc is forming, letting dust spiral inward
    // to be accreted; afterwards the surviving disc coasts on stable orbits.
    const dustDrag = forming ? Math.max(0, 1 - GAS_DRAG * h) : 1;
    // Debris from a disrupted body is shocked, self-colliding material on its
    // way into the star, so it bleeds angular momentum far faster than disc gas.
    const debrisDrag = Math.max(0, 1 - DEBRIS_DRAG * h);
    for (const p of this.particles) {
      const a = softenedAccel(mu, SOFTENING, [p.x, p.y, p.z]);
      const dust = p.kind === ParticleKind.Dust;
      const drag = dust ? dustDrag : p.kind === ParticleKind.Debris ? debrisDrag : 1;
      // Vertical dissipation is a DISC phenomenon (grain-on-grain collisions in a
      // dense midplane). Applying it to the death shell would squash a spherical
      // planetary nebula into a pancake, and applying it to a tidal stream would
      // flatten an arc that should stay ballistic.
      p.vx = (p.vx + a[0] * h) * drag;
      p.vy = (p.vy + a[1] * h) * (dust ? vertical : drag);
      p.vz = (p.vz + a[2] * h) * drag;
      p.x += p.vx * h;
      p.y = (dust ? p.y * settle : p.y) + p.vy * h;
      p.z += p.vz * h;
    }
  }

  /**
   * Age the transient particle populations and remove those whose lifetime has
   * run out. Only debris is transient: birth dust is removed by accretion and
   * ejecta by escaping the system, both physically.
   */
  private ageParticles(orbitalDt: number): void {
    let expired = false;
    for (const p of this.particles) {
      if (Number.isFinite(p.ttl)) {
        p.ttl -= orbitalDt;
        if (p.ttl <= 0) {
          expired = true;
        }
      }
    }
    if (expired) {
      this.particles = this.particles.filter((p) => p.ttl > 0);
    }
  }

  private integrateBodies(h: number): void {
    const mu = this.mu;
    // Planetesimals damp toward the mid-plane FAR more weakly than the dust: a
    // real disc leaves its planets with small but non-zero mutual inclinations
    // (the Solar System spans ~7°). Damping them as hard as the gas would give
    // a perfectly flat, artificial-looking system.
    const vertical = Math.max(0, 1 - VERTICAL_DAMP * BODY_DAMP_FRACTION * h);
    for (const body of this.bodies) {
      const stepped = integrateOrbit(body.position, body.velocity, mu, SOFTENING, h);
      if (body.type === BodyType.Protoplanet || body.type === BodyType.Planet) {
        stepped.vel[1] *= vertical;
      }
      body.position = stepped.pos;
      body.velocity = stepped.vel;
    }
  }

  // --- Accretion -------------------------------------------------------------

  /**
   * Sweep dust onto the central core and the planetesimals/planets, and merge
   * overlapping bodies — the emergent growth that turns a disc into planets and
   * feeds the star. Momentum is conserved on every merge.
   */
  private accrete(stage: LifecycleStage, orbitalDt: number): void {
    const cloudMass = this.cloudMass;
    const survivors: Particle[] = [];
    const captureRadius = this.captureRadius;
    const coreR2 = captureRadius * captureRadius;
    // Angular-momentum-regulated accretion budget for this step: the star can
    // only take so much mass per unit time (see CORE_ACCRETION_RATE). Dust that
    // arrives faster stays in the inner disc and is swallowed on later steps.
    let coreBudget = CORE_ACCRETION_RATE * cloudMass * Math.max(orbitalDt, 0);

    // Material already waiting in the inner disc reaches the star first.
    const fromReservoir = Math.min(this.discReservoir, coreBudget);
    this.discReservoir -= fromReservoir;
    this.coreMass += fromReservoir;
    coreBudget -= fromReservoir;
    // Precompute each body's squared accretion radius.
    const bodyR2 = this.bodies.map((b) =>
      b.type === BodyType.Protoplanet || b.type === BodyType.Planet
        ? accretionRadius(b.mass, cloudMass) ** 2
        : -1,
    );

    for (const p of this.particles) {
      const r2 = p.x * p.x + p.y * p.y + p.z * p.z;
      if (r2 <= coreR2) {
        if (coreBudget >= p.mass) {
          coreBudget -= p.mass;
          this.coreMass += p.mass; // swallowed by the protostar
          continue;
        }
        // Over the accretion rate limit: the grain waits in the inner disc
        // (still visible, still orbiting) until the star can take it.
        survivors.push(p);
        continue;
      }
      let absorbed = false;
      for (let i = 0; i < this.bodies.length; i += 1) {
        if (bodyR2[i]! < 0) {
          continue;
        }
        const b = this.bodies[i]!;
        const dx = p.x - b.position[0];
        const dy = p.y - b.position[1];
        const dz = p.z - b.position[2];
        if (dx * dx + dy * dy + dz * dz <= bodyR2[i]!) {
          // How much a body retains depends on WHERE it orbits: rock only inside
          // the snow line, ices + gas beyond it (see `accretionEfficiency`).
          const orbitRadius = Math.hypot(b.position[0], b.position[1], b.position[2]);
          const retained = p.mass * accretionEfficiency(sceneToAu(orbitRadius));
          b.mass += retained;
          b.radius = bodyRadiusFromMass(b.mass, cloudMass);
          // The remainder is NOT teleported to the star: it flows into the inner
          // disc and reaches the core only at the rate-limited Ṁ (above).
          this.discReservoir += p.mass - retained;
          // NOTE: deliberately NOT blending the dust's velocity into the body.
          // The simulated dust is strongly sub-Keplerian (that is what makes the
          // cloud collapse), so mixing its momentum in would spiral every planet
          // into the star within a few million years — the opposite of the real
          // disc, where a planet's orbit is essentially unaffected by the grains
          // it sweeps up.
          absorbed = true;
          break;
        }
      }
      if (!absorbed) {
        survivors.push(p);
      }
    }
    this.particles = survivors;

    // Merge overlapping protoplanets/planets (oligarch collisions).
    if (stage <= LifecycleStage.MainSequence) {
      this.mergeBodies();
    }

    // Anything that has plunged into the star is consumed by it.
    this.swallowBodiesIntoStar();
  }

  /**
   * Destroy bodies that have fallen into the star, adding their mass to the
   * core. A momentum-conserving merge between bodies on opposing orbital phases
   * can cancel most of the orbital velocity, and accreting sub-Keplerian dust
   * slowly decays orbits — either way the body free-falls inward. Physically it
   * is then swallowed by the star; without this it would sit at the star's
   * position forever (a "planet inside the star").
   */
  /**
   * Engulf and destroy every planet that orbits inside the swollen red giant.
   * Done ONCE as the star becomes a red giant so it is deterministic at any pace
   * (a single fast step can otherwise skip the whole red-giant phase). Consumed
   * planets are tidally disrupted (debris + a `BodyConsumed` event), so the Sun
   * would lose Mercury/Venus/Earth here while Jupiter and the outer planets
   * survive.
   */
  private engulfInnerPlanets(): void {
    const r = this.redGiantEngulfRadius();
    const r2 = r * r;
    const survivors: CelestialBody[] = [];
    for (const body of this.bodies) {
      const isPlanet = body.type === BodyType.Planet || body.type === BodyType.Protoplanet;
      const d2 =
        body.position[0] * body.position[0] +
        body.position[1] * body.position[1] +
        body.position[2] * body.position[2];
      if (isPlanet && d2 <= r2) {
        this.spawnDebris(body);
        this.coreMass += body.mass;
        this.bus.emit({
          type: SimEventType.BodyConsumed,
          simTime: this.simTime,
          data: { bodyId: body.id, bodyType: body.type },
        });
        continue;
      }
      survivors.push(body);
    }
    this.bodies = survivors;
  }

  /** Red-giant photospheric reach in scene units (∝ mass^0.3). */
  private redGiantEngulfRadius(): number {
    return auToScene(REDGIANT_ENGULF_AU * Math.pow(Math.max(this.cloudMass, 0.1), 0.3));
  }

  /**
   * Expand surviving planets' orbits when the dying star sheds its mass: the
   * weaker gravity lets each orbit widen (adiabatically, a ∝ 1/M) and slow. A
   * supernova additionally kicks orbits eccentric. Without this the planets stay
   * crowded around the tiny remnant, which is not physically plausible.
   */
  private expandOrbitsAfterMassLoss(): void {
    const retained = this.fate.supernova ? 0.16 : 0.55;
    const f = Math.min(REMNANT_ORBIT_EXPANSION_MAX, Math.max(1, 1 / retained));
    const vScale = 1 / Math.sqrt(f);
    for (const body of this.bodies) {
      if (body.type !== BodyType.Planet && body.type !== BodyType.Protoplanet) {
        continue;
      }
      body.position = [body.position[0] * f, body.position[1] * f, body.position[2] * f];
      body.velocity = [
        body.velocity[0] * vScale,
        body.velocity[1] * vScale,
        body.velocity[2] * vScale,
      ];
      if (this.fate.supernova) {
        // Impulsive, asymmetric mass loss makes the survivors eccentric.
        const kick = 0.18 * magnitude(body.velocity);
        body.velocity[0] += (this.rng() - 0.5) * kick;
        body.velocity[1] += (this.rng() - 0.5) * kick;
        body.velocity[2] += (this.rng() - 0.5) * kick;
      }
    }
  }

  private swallowBodiesIntoStar(): void {
    const r2max = this.bodySwallowRadius * this.bodySwallowRadius;
    const survivors: CelestialBody[] = [];
    let swallowed = false;
    for (const body of this.bodies) {
      const x = body.position[0];
      const y = body.position[1];
      const z = body.position[2];
      if (x * x + y * y + z * z <= r2max) {
        // Tidal disruption: the body is torn into a debris stream that falls
        // into the star, rather than simply vanishing.
        this.spawnDebris(body);
        this.coreMass += body.mass; // the star absorbs it
        this.bus.emit({
          type: SimEventType.BodyConsumed,
          simTime: this.simTime,
          data: { bodyId: body.id, bodyType: body.type },
        });
        swallowed = true;
        continue;
      }
      survivors.push(body);
    }
    if (swallowed) {
      this.bodies = survivors;
    }
  }

  /** Merge pairs of planets/protoplanets whose discs overlap (momentum-conserving). */
  private mergeBodies(): void {
    const kept: CelestialBody[] = [];
    const removed = new Set<number>();
    for (let i = 0; i < this.bodies.length; i += 1) {
      const a = this.bodies[i]!;
      if (removed.has(a.id)) {
        continue;
      }
      if (a.type !== BodyType.Protoplanet && a.type !== BodyType.Planet) {
        kept.push(a);
        continue;
      }
      for (let j = i + 1; j < this.bodies.length; j += 1) {
        const b = this.bodies[j]!;
        if (removed.has(b.id) || (b.type !== BodyType.Protoplanet && b.type !== BodyType.Planet)) {
          continue;
        }
        const dx = a.position[0] - b.position[0];
        const dy = a.position[1] - b.position[1];
        const dz = a.position[2] - b.position[2];
        // Collide on the DYNAMICAL radius, not the drawn one (see mergeRadius).
        const touch = mergeRadius(a.mass, this.cloudMass) + mergeRadius(b.mass, this.cloudMass);
        if (dx * dx + dy * dy + dz * dz <= touch * touch) {
          // a absorbs b (a is the earlier/anchor body).
          a.velocity = mergedVelocity(a.mass, a.velocity, b.mass, b.velocity);
          a.mass += b.mass;
          a.radius = bodyRadiusFromMass(a.mass, this.cloudMass);
          removed.add(b.id);
        }
      }
      kept.push(a);
    }
    if (removed.size > 0) {
      this.bodies = kept.filter((b) => !removed.has(b.id));
    }
  }

  /**
   * Tear a doomed body into a glowing debris stream. The fragments inherit the
   * body's orbital velocity plus a spread, so they visibly shear into an arc and
   * spiral into the star over the following steps — a real tidal disruption
   * rather than the body blinking out of existence.
   */
  private spawnDebris(body: CelestialBody): void {
    const budget = Math.max(0, MAX_PARTICLES - this.particles.length);
    const n = Math.min(DEBRIS_PER_BODY, budget);
    const speed = magnitude(body.velocity);
    for (let i = 0; i < n; i += 1) {
      // Spread fragments around the body and shear their speeds so the stream
      // stretches along the orbit (leading fragments faster, trailing slower).
      const shear = 0.75 + 0.5 * this.rng();
      const jitter = speed * 0.08;
      this.particles.push({
        x: body.position[0] + (this.rng() - 0.5) * body.radius * 3,
        y: body.position[1] + (this.rng() - 0.5) * body.radius * 3,
        z: body.position[2] + (this.rng() - 0.5) * body.radius * 3,
        vx: body.velocity[0] * shear + (this.rng() - 0.5) * jitter,
        vy: body.velocity[1] * shear + (this.rng() - 0.5) * jitter,
        vz: body.velocity[2] * shear + (this.rng() - 0.5) * jitter,
        // Hot, glowing rock shading from white-yellow to orange.
        r: 1.0,
        g: 0.55 + 0.35 * this.rng(),
        b: 0.25,
        size: 1.5,
        mass: 0,
        kind: ParticleKind.Debris,
        // Finite: the stream is falling into the star, not settling into a ring.
        ttl: DEBRIS_LIFETIME * (0.6 + 0.8 * this.rng()),
      });
    }
  }

  /** Remove dust that has escaped far beyond the system (keeps counts bounded). */
  private cullParticles(): void {
    const escape = this.cloudExtent * ESCAPE_EXTENT_FACTOR;
    const escape2 = escape * escape;
    let changed = false;
    const survivors: Particle[] = [];
    for (const p of this.particles) {
      if (p.x * p.x + p.y * p.y + p.z * p.z <= escape2) {
        survivors.push(p);
      } else {
        changed = true;
      }
    }
    if (changed) {
      this.particles = survivors;
    }
  }

  /**
   * Clear every circumstellar particle when the star dies, leaving only the
   * death ejecta itself.
   *
   * By the time a star becomes a compact remnant its protoplanetary disc has
   * been accreted, photo-evaporated and blown away, and any tidal debris from
   * planets it ate has long since fallen in — and whatever survived that would
   * be swept up by the ejecta shell anyway. So nothing should be left circling
   * the white dwarf/neutron star. (Filtering on `mass <= 0` here previously kept
   * the massless tidal debris alive, which is exactly what was seen orbiting the
   * white dwarf.)
   */
  private dissipateDiscMaterial(): void {
    this.particles = this.particles.filter((p) => p.kind === ParticleKind.Ejecta);
  }

  // --- Death ejecta ----------------------------------------------------------

  /**
   * Throw a shell of glowing ejecta outward when the star dies (planetary nebula
   * / supernova). Reuses the particle pool so the death is visible even after
   * the birth dust has been accreted away.
   */
  private spawnEjecta(): void {
    const budget = Math.max(0, MAX_PARTICLES - this.particles.length);
    const n = Math.min(EJECTA_COUNT, budget);
    // Faster shell for a supernova; gentler for a quiet envelope ejection.
    const violent = this.cloudMass >= 8;
    const baseSpeed = (violent ? 26 : 12) * Math.sqrt(this.mu / (this.cloudExtent + 1));
    for (let i = 0; i < n; i += 1) {
      const cosT = 2 * this.rng() - 1;
      const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
      const phi = 2 * Math.PI * this.rng();
      const dir: Vec3 = [sinT * Math.cos(phi), cosT, sinT * Math.sin(phi)];
      const r0 = 1 + this.rng() * 2;
      // Never below the local escape speed: real nebula/supernova ejecta is
      // unbound, which is why the shell disperses and leaves a BARE remnant
      // instead of settling into a ring of particles around it.
      const escapeSpeed = Math.sqrt((2 * this.mu) / Math.max(r0, Number.EPSILON));
      const speed = Math.max(
        baseSpeed * (0.6 + 0.8 * this.rng()),
        EJECTA_ESCAPE_MARGIN * escapeSpeed,
      );
      this.particles.push({
        x: dir[0] * r0,
        y: dir[1] * r0,
        z: dir[2] * r0,
        vx: dir[0] * speed,
        vy: dir[1] * speed,
        vz: dir[2] * speed,
        r: violent ? 1.0 : 0.9,
        g: violent ? 0.7 : 0.5,
        b: violent ? 0.5 : 0.9,
        size: 1.6,
        mass: 0,
        kind: ParticleKind.Ejecta,
        ttl: Infinity,
      });
    }
  }

  // --- Visiting bodies (FR-7) ------------------------------------------------

  private spawnVisitors(dtSimSeconds: number): void {
    this.spawnAccumulator += dtSimSeconds;
    let guard = 0;
    while (this.spawnAccumulator >= VISITOR_SPAWN_INTERVAL && guard < MAX_SUBSTEPS) {
      this.spawnAccumulator -= VISITOR_SPAWN_INTERVAL;
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
    const mu = this.mu;
    const cosTheta = 2 * rng() - 1;
    const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
    const phi = 2 * Math.PI * rng();
    const position: Vec3 = [
      this.ejectRadius * sinTheta * Math.cos(phi),
      this.ejectRadius * sinTheta * Math.sin(phi),
      this.ejectRadius * cosTheta,
    ];
    const escape = Math.sqrt((2 * mu) / Math.max(this.ejectRadius, Number.EPSILON));
    // Mostly above escape so visitors typically fly through; a slower minority
    // is captured, making capture an occasional event rather than the norm.
    const speed = escape * (0.9 + 0.7 * rng());
    const dist = Math.max(magnitude(position), Number.EPSILON);
    // Impact parameter: how far the incoming trajectory MISSES the star by. Real
    // interstellar visitors are never aimed exactly at the star, and this is what
    // makes them swing past it on a hyperbola.
    //
    // Aiming a visitor precisely at the star (the previous behaviour) gives it
    // ZERO angular momentum — a degenerate radial trajectory with no orbital
    // plane. Such a body fell straight through the softened core and oscillated
    // back and forth on a fixed line forever, and its "orbit" drew as a straight
    // line running through the star.
    const impact = this.ejectRadius * (0.08 + 0.45 * rng());
    const sinAlpha = Math.min(0.95, impact / dist);
    const cosAlpha = Math.sqrt(Math.max(0, 1 - sinAlpha * sinAlpha));
    const radial: Vec3 = [position[0] / dist, position[1] / dist, position[2] / dist];
    const tangent = perpendicularTo(radial, 2 * Math.PI * rng());
    const velocity: Vec3 = [
      speed * (-radial[0] * cosAlpha + tangent[0] * sinAlpha),
      speed * (-radial[1] * cosAlpha + tangent[1] * sinAlpha),
      speed * (-radial[2] * cosAlpha + tangent[2] * sinAlpha),
    ];
    const isComet = rng() < 0.5;
    return {
      id: this.nextBodyId++,
      type: isComet ? BodyType.Comet : BodyType.Asteroid,
      mass: 1e-9,
      // Comets/asteroids are far smaller than planets (scene units).
      radius: isComet ? COMET_RADIUS : ASTEROID_RADIUS,
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
      } else {
        survivors.push(body);
      }
    }
    this.bodies = survivors;
  }

  // --- Buffer serialization --------------------------------------------------

  /** Reallocate the particle buffer if the (now dynamic) count changed, then write. */
  private rebuildParticleBuffer(): void {
    const needed = this.particles.length * PARTICLE_STRIDE;
    if (this.particleBuffer.length !== needed) {
      this.particleBuffer = new Float32Array(needed);
    }
    this.writeParticleBuffer();
  }

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

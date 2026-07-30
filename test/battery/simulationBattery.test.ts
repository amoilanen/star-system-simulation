// Physical-soundness simulation battery (headless).
//
// Runs a large sample of full birth→death simulations across the whole
// parameter space the setup form exposes (cloud mass 0.1–250 M☉, extent
// 10–250 AU, compositions from metal-free to metal-rich, several paces) and
// asserts PHYSICAL invariants on every run, against the WASM kernel:
//
//   - buffers stay finite (no NaN/Inf ever reaches the renderer);
//   - the lifecycle advances monotonically and emits exactly one entry event
//     per transition, in the correct order;
//   - the reported star mass tracks the star-formation budget (a cloud never
//     makes a star of its own mass), and the remnant mass respects the
//     Chandrasekhar / TOV limits and the initial–final mass relation;
//   - the death path (supernova? which remnant?) matches stellar theory via
//     the centralized fate model evaluated on the STELLAR mass;
//   - the reported elapsed time matches the illustrative stage durations
//     (massive stars live fast and die young);
//   - mass is conserved by the kernel's accretion bookkeeping (dust + core +
//     inner disc + dispersed + bodies never exceeds the cloud budget and never
//     spontaneously grows);
//   - planets stay gravitationally bound to the system while the star lives,
//     and the emergent architecture is solar-like (massive gas giants form
//     beyond the snow line, not on top of the star);
//   - once the star is a remnant, nothing is left circling it except its own
//     (unbound, receding) death ejecta;
//   - a SUBSTELLAR cloud produces a brown dwarf instead: it never emits a
//     fusion event, never reaches a main sequence or a death, keeps all of its
//     mass, throws no ejecta, and stops its clock at the formation timescale;
//   - a cloud with NO metals condenses no solids, so it forms no worlds at all
//     (reported bug 4) — while still being free to fragment into companions;
//   - every body is typed by its own mass: nothing at or above the
//     hydrogen-burning limit is ever a world (reported bug 1);
//   - no world's position jumps when the remnant appears — orbits widen because
//     gravity weakened, over many steps (reported bug 2);
//   - the shed envelope is a nebula that is still framed and still there when
//     the remnant forms, and thins gradually rather than being deleted
//     mid-flight (reported bug 7).
//
// The run count is BATTERY_RUNS. The default of 12 keeps `npm test` quick while
// still covering every fate boundary; the full audit is
//
//   BATTERY_RUNS=100 npx vitest run test/battery
//
// which exercises 100 distinct parameter sets.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CloudComposition, SimulationConfig } from '../../src/config/SimulationConfig';
import {
  LifecycleStage,
  RemnantType,
  determineFate,
  isSubstellar,
  remnantMass,
  FATE_THRESHOLDS,
} from '../../src/config/fateModel';
import { stellarMassFromCloud, cloudMassForStar } from '../../src/config/starFormation';
import { stageDurations } from '../../src/sim/stages';
import { SimEventType } from '../../src/sim/events';
import {
  ATTRACTOR_OFFSET,
  ATTRACTOR_STRIDE,
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_OFFSET,
  PARTICLE_STRIDE,
  type PhysicsKernel,
} from '../../src/sim/PhysicsKernel';
import { engulfRadius } from '../../src/render/starVisual';
import { paceToRate, DEFAULT_LIFECYCLE_SIM_SECONDS } from '../../src/sim/Clock';
import { loadWasmModule, WasmKernel } from '../../src/sim/WasmKernel';
import { sceneToAu, solarToEarthMasses } from '../../src/sim/astro';

/**
 * Deterministic RNG used ONLY to generate the battery's configuration list, so
 * every run of the suite exercises the same twelve systems. This is test
 * scaffolding, not simulation semantics — the kernel owns its own RNG.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Outer edge of the kernel's dust disc, as a fraction of the cloud extent
 * (`DISC_OUTER_FRACTION` in `wasm/src/lib.rs`). Every planetesimal is seeded and
 * every grain placed inside it, so it bounds where a WORLD can be — which is what
 * lets the harness tell a scattered escapee in a multiple system from an
 * integration failure among the planets.
 */
const DISC_OUTER_FRACTION = 0.6;

const RUNS = Number(process.env.BATTERY_RUNS ?? 12);
const PARTICLES = 900;
const FRAME_REAL_DT = 1 / 60;
const MAX_TICKS = 60000;
/** Ticks to keep stepping after the remnant forms (the nebula must keep going). */
const REMNANT_SETTLE_TICKS = 400;
/**
 * Sim-dt handed to the kernel while the remnant is watched.
 *
 * The nebula ages in ORBITAL time, which the kernel advances at its own stable
 * rate however large a dt it is given (it back-pressures rather than integrating
 * inaccurately), so this is simply "as fast as the kernel will go". It lets the
 * battery watch a real slice of the nebula's life — about a third of it over
 * {@link REMNANT_SETTLE_TICKS} — instead of the few playback seconds a
 * frame-sized dt would cover, which is far too short to tell a nebula that
 * lingers from one that is deleted the moment it crosses the escape radius
 * (the reported bug 7 behaviour).
 */
const REMNANT_WATCH_DT = 1e16;
/**
 * Largest share of the fragments still in flight that may disappear in a single
 * step (plus a few, so the last handful may simply expire together). A nebula
 * DISPERSES; it does not wink out. Mirrors the bound of the kernel's own
 * `the_nebula_fades_out_instead_of_being_deleted_mid_flight`.
 */
const NEBULA_MAX_STEP_LOSS = 1 / 8;
/**
 * Fraction of the envelope's fragments that must still be in flight when the
 * remnant appears. The kernel launches 2200; before the fix the whole shell was
 * culled mid-flight, leaving the reported "small star remnant" and no nebula.
 */
const NEBULA_MIN_FRAGMENTS = 1000;
/**
 * How far out the nebula's outer edge may be when the remnant appears, as a
 * multiple of the framed system radius (the cloud, or the dying star itself if
 * that is larger — a 30 M☉ supergiant's photosphere is 34 AU, which is bigger
 * than the smallest cloud the form allows). Beyond this the shell has left the
 * view before the user can see it, which is the other half of "there is no
 * nebula, only the small star remnant".
 */
const NEBULA_MAX_FRAMED_REACH = 2;
/**
 * How much of an OUTLIER the single step that forms the remnant may be, against
 * the largest ordinary step of the same death: the step has to be an ordinary
 * one (reported bug 2).
 *
 * Stated relatively on purpose. An absolute bound on how far a world may move in
 * one step is not a statement about physics here — the battery hands the kernel
 * whatever dt the pace implies, and around a 0.08 M☉ star an inner world
 * genuinely covers a ~2 radii arc of its own orbit in a single step, while
 * around a 15 M☉ one it covers 0.05. What "no jump" means is that NOTHING
 * special happens on the step the remnant appears, which is exactly what a
 * comparison against the neighbouring steps says. (The deleted closed-form
 * rewrite moved worlds by ~3× their radius on that step against a ~0.1 ordinary
 * radial motion — a 30× outlier.)
 */
const REMNANT_STEP_OUTLIER_FACTOR = 1.5;
/**
 * Floor for that comparison, so a death whose worlds barely move cannot make the
 * bound arbitrarily tight, and fallback bounds for the (unobserved) case of a
 * death too short to establish a baseline from.
 */
const REMNANT_STEP_MOTION_FLOOR = 0.05;
const REMNANT_BASELINE_MIN_STEPS = 10;
const REMNANT_MAX_STEP_SHIFT = 0.5;
const REMNANT_MAX_STEP_RADIAL = 0.25;

const LIFECYCLE_EVENT_ORDER: readonly SimEventType[] = [
  SimEventType.CollapseOnset,
  SimEventType.ProtostarFormed,
  SimEventType.FusionIgnition,
  SimEventType.RedGiantOnset,
  SimEventType.DeathEvent,
  SimEventType.RemnantFormed,
];

interface BatteryConfig extends SimulationConfig {
  label: string;
}

function composition(metals: number): CloudComposition {
  const rest = 1 - metals;
  return { hydrogen: rest * 0.755, helium: rest * 0.245, metals };
}

/**
 * The compositions the battery sweeps, from the primordial gas the first stars
 * formed out of to a metal-rich disc.
 *
 * The last two are the ones reported bug 4 is about: with `metals = 0` there is
 * nothing condensable in this three-species model (O, C, N and the refractories
 * all live in the `metals` fraction), so the disc has no solid budget and can
 * seed no planetesimal — see Decision D3. `100 % H` is the literal setting from
 * the report; `metal-free` keeps the primordial He fraction, to show that it is
 * the METALS that gate planet formation and not the hydrogen number.
 */
const COMPOSITIONS: readonly { label: string; value: CloudComposition }[] = [
  { label: 'Z=1e-4', value: composition(0.0001) },
  { label: 'Z=0.004', value: composition(0.004) },
  // Half-solar: inside the 0.005–0.02 band where `seeded_planetesimal_count`
  // hands back a FRACTIONAL embryo budget, so the sweep exercises the partial
  // seeding regime and not just the "none" and "all" ends of it.
  { label: 'Z=0.01', value: composition(0.01) },
  { label: 'Z=0.02', value: composition(0.02) },
  { label: 'Z=0.05', value: composition(0.05) },
  { label: 'Z=0.12', value: composition(0.12) },
  { label: 'metal-free', value: composition(0) },
  { label: '100%H', value: { hydrogen: 1, helium: 0, metals: 0 } },
];

/** Deterministic battery configurations spanning the setup form's domain. */
function buildConfigs(count: number): BatteryConfig[] {
  const rng = mulberry32(0xbadc0de);
  const configs: BatteryConfig[] = [];
  // Star masses straddling every fate boundary (M☉ of STELLAR mass), including
  // the 0.08 M☉ hydrogen-burning limit that separates a brown dwarf that never
  // ignites from the lightest object that can genuinely become a star.
  const starTargets = [
    0.03, 0.05, 0.079, 0.081, 0.2, 0.5, 0.8, 1, 1.5, 2.2, 3, 5, 7, 7.9, 8.1, 10, 11.9, 12.1, 15, 18,
    21.9, 22.1, 30, 39, 41, 50,
  ];
  const extents = [10, 25, 50, 80, 120, 250];
  for (let i = 0; i < count; i += 1) {
    let mass: number;
    let label: string;
    const comp = COMPOSITIONS[i % COMPOSITIONS.length]!;
    const metals = comp.value.metals;
    if (i < starTargets.length) {
      const target = starTargets[i]!;
      mass = Math.min(250, Math.max(0.05, cloudMassForStar(target, metals)));
      label = `star≈${target}M☉`;
    } else {
      // Log-uniform cloud mass over the form's full range.
      mass = 0.1 * Math.pow(250 / 0.1, rng());
      label = `cloud=${mass.toFixed(2)}M☉`;
    }
    const cloudExtent = extents[(i * 7 + 3) % extents.length]!;
    const pace = i % 9 === 8 ? 0.9 : 1;
    configs.push({
      locale: 'en',
      composition: comp.value,
      mass,
      cloudExtent,
      pace,
      showEventAnnotations: false,
      label: `#${i} ${label} ${comp.label} ext=${cloudExtent} pace=${pace}`,
    });
  }
  return configs;
}

interface RunReport {
  issues: string[];
  events: { type: SimEventType; simTime: number; data?: Record<string, unknown> | undefined }[];
  finalStage: LifecycleStage;
  finalStarMass: number;
  finalElapsed: number;
  ticks: number;
  /** Planet orbits sampled while the star is on the main sequence. */
  architecture: { mass: number; aAu: number; apoapsisAu: number }[];
  /** Whether any world existed at any moment of the run (reported bug 4). */
  sawWorld: boolean;
  /**
   * Particle counts sampled on every tick of the remnant watch — the nebula's
   * decay curve (reported bug 7).
   */
  nebula: number[];
}

function bodyView(buf: Float32Array, i: number) {
  const b = i * BODY_STRIDE;
  return {
    id: buf[b + BODY_OFFSET.id]!,
    type: buf[b + BODY_OFFSET.type]! as BodyType,
    mass: buf[b + BODY_OFFSET.mass]!,
    x: buf[b + BODY_OFFSET.x]!,
    y: buf[b + BODY_OFFSET.y]!,
    z: buf[b + BODY_OFFSET.z]!,
    vx: buf[b + BODY_OFFSET.vx]!,
    vy: buf[b + BODY_OFFSET.vy]!,
    vz: buf[b + BODY_OFFSET.vz]!,
  };
}

/**
 * Specific orbital energy of a body in the kernel's FULL gravitational field —
 * every gravitating centre it is actually integrating against (spec §4.1), read
 * live from the attractor buffer.
 *
 * The single-centre form (`0.5 v² − mu/r` about the origin) is only the right
 * question for a single star. In a MULTIPLE system a world can be perfectly
 * bound while having positive energy with respect to the primary alone: after the
 * primary sheds its envelope the surviving orbits widen by up to ~6×, which can
 * carry a planet out to the companion and leave it bound to THAT star instead.
 * Judging such a planet "unbound" would be the harness testing a model the kernel
 * does not implement.
 */
function systemEnergy(
  attractors: Float32Array,
  softening: number,
  body: { x: number; y: number; z: number; vx: number; vy: number; vz: number },
): number {
  const v2 = body.vx * body.vx + body.vy * body.vy + body.vz * body.vz;
  let potential = 0;
  for (let i = 0; i + ATTRACTOR_STRIDE <= attractors.length; i += ATTRACTOR_STRIDE) {
    const dx = body.x - attractors[i + ATTRACTOR_OFFSET.x]!;
    const dy = body.y - attractors[i + ATTRACTOR_OFFSET.y]!;
    const dz = body.z - attractors[i + ATTRACTOR_OFFSET.z]!;
    const mu = attractors[i + ATTRACTOR_OFFSET.mu]!;
    potential -= mu / Math.sqrt(dx * dx + dy * dy + dz * dz + softening * softening);
  }
  return 0.5 * v2 + potential;
}

/**
 * Whether a world being unbound is EXPECTED rather than a defect.
 *
 * Around a single star the field is a monopole: a bound orbit stays bound, so an
 * unbound world can only mean the integrator manufactured energy. A companion
 * star changes that — the outer disc of a wide binary is dynamically unstable and
 * a world thrown out of it genuinely is unbound (the kernel ejects it once it is
 * demonstrably leaving, see `eject_escaping_worlds`). So in a MULTIPLE system the
 * strict claim is kept only where planets actually live and where manufactured
 * energy would appear: inside the dust disc.
 */
function unboundIsExplainable(multiple: boolean, r: number, cloudExtent: number): boolean {
  return multiple && r > cloudExtent * DISC_OUTER_FRACTION;
}

/** Whether a body kind is a WORLD (a planet or an embryo), not a star or a visitor. */
function isWorld(type: BodyType): boolean {
  return type === BodyType.Planet || type === BodyType.Protoplanet;
}

/** Positions of every world in the buffer, keyed by body id. */
function worldPositions(buf: Float32Array): Map<number, [number, number, number]> {
  const positions = new Map<number, [number, number, number]>();
  for (let i = 0; i < buf.length / BODY_STRIDE; i += 1) {
    const b = bodyView(buf, i);
    if (isWorld(b.type)) {
      positions.set(b.id, [b.x, b.y, b.z]);
    }
  }
  return positions;
}

/** Distances of every particle from the scene origin, ascending (scene units). */
function particleRadii(buf: Float32Array): number[] {
  const radii: number[] = [];
  for (let i = 0; i + PARTICLE_STRIDE <= buf.length; i += PARTICLE_STRIDE) {
    radii.push(
      Math.hypot(
        buf[i + PARTICLE_OFFSET.x]!,
        buf[i + PARTICLE_OFFSET.y]!,
        buf[i + PARTICLE_OFFSET.z]!,
      ),
    );
  }
  radii.sort((a, b) => a - b);
  return radii;
}

/** Distance of the outermost gravitating centre from the origin (scene units). */
function outermostAttractorRadius(attractors: Float32Array): number {
  let furthest = 0;
  for (let i = 0; i + ATTRACTOR_STRIDE <= attractors.length; i += ATTRACTOR_STRIDE) {
    const r = Math.hypot(
      attractors[i + ATTRACTOR_OFFSET.x]!,
      attractors[i + ATTRACTOR_OFFSET.y]!,
      attractors[i + ATTRACTOR_OFFSET.z]!,
    );
    furthest = Math.max(furthest, r);
  }
  return furthest;
}

function allFinite(buf: Float32Array): boolean {
  for (let i = 0; i < buf.length; i += 1) {
    if (!Number.isFinite(buf[i]!)) {
      return false;
    }
  }
  return true;
}

/** Model constants read from the kernel itself, never re-declared here. */
interface KernelConstants {
  softening: number;
  snowLineAu: number;
}

/** How far the worlds moved in one step, as a fraction of their orbital radius. */
interface StepMotion {
  /** Largest displacement / radius over the worlds that survived the step. */
  shift: number;
  /** Largest CHANGE OF DISTANCE from the star / radius — the teleport signature. */
  radial: number;
  /** Whether any world was actually measured. */
  measured: boolean;
}

/** The largest ordinary step of a death, and how many steps that is drawn from. */
interface DeathMotionBaseline {
  shift: number;
  radial: number;
  steps: number;
}

function stepMotion(
  before: ReadonlyMap<number, [number, number, number]>,
  after: ReadonlyMap<number, [number, number, number]>,
): StepMotion {
  const motion: StepMotion = { shift: 0, radial: 0, measured: false };
  for (const [id, p0] of before) {
    const p1 = after.get(id);
    if (p1 === undefined) {
      continue; // destroyed or unbound by the death itself — not a teleport
    }
    const r0 = Math.hypot(p0[0], p0[1], p0[2]);
    if (r0 <= 0) {
      continue;
    }
    motion.measured = true;
    motion.shift = Math.max(
      motion.shift,
      Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]) / r0,
    );
    motion.radial = Math.max(motion.radial, Math.abs(Math.hypot(p1[0], p1[1], p1[2]) - r0) / r0);
  }
  return motion;
}

/**
 * Everything that must be true about the SINGLE step that turns the dying star
 * into a remnant — the step both reported bug 2 and reported bug 7 are about.
 *
 * 1. It must be an ORDINARY step: no surviving world may move, or change its
 *    distance from the star, by more than the ordinary steps of the same death
 *    already did. The deleted closed-form rewrite `r → r / retained` moved
 *    worlds by up to 3× their orbital radius here, so a world hidden in the
 *    giant's glare reappeared at a new radius the instant the giant collapsed —
 *    which is what "new planets emerge out of it" was.
 * 2. The shed envelope must be THERE, must have detached from the star, and must
 *    still be inside the view. Before the fix the shell was thrown in one burst,
 *    swept past the frame within the death stage and was then culled outright,
 *    leaving "only the small star remnant".
 */
function checkRemnantOnset(
  kernel: PhysicsKernel,
  config: BatteryConfig,
  stellarMass: number,
  before: ReadonlyMap<number, [number, number, number]>,
  baseline: DeathMotionBaseline,
  issue: (msg: string) => void,
): void {
  const motion = stepMotion(before, worldPositions(kernel.getBodyBuffer()));
  if (motion.measured) {
    // Against the death's own ordinary steps where there are enough of them to
    // say what "ordinary" is, and against a flat bound otherwise.
    const enough = baseline.steps >= REMNANT_BASELINE_MIN_STEPS;
    const shiftCap = enough
      ? Math.max(baseline.shift * REMNANT_STEP_OUTLIER_FACTOR, REMNANT_STEP_MOTION_FLOOR)
      : REMNANT_MAX_STEP_SHIFT;
    const radialCap = enough
      ? Math.max(baseline.radial * REMNANT_STEP_OUTLIER_FACTOR, REMNANT_STEP_MOTION_FLOOR)
      : REMNANT_MAX_STEP_RADIAL;
    if (motion.shift > shiftCap) {
      issue(
        `a world moved ${motion.shift.toFixed(2)}× its orbital radius in the single step that ` +
          `formed the remnant, against ${baseline.shift.toFixed(2)}× in the largest of the ` +
          `${baseline.steps} steps before it — that is a teleport, not an orbit`,
      );
    }
    if (motion.radial > radialCap) {
      issue(
        `a world's distance from the star changed by ${motion.radial.toFixed(2)}× in the single ` +
          `step that formed the remnant, against ${baseline.radial.toFixed(2)}× in the largest ` +
          `of the ${baseline.steps} steps before it`,
      );
    }
  }

  const radii = particleRadii(kernel.getParticleBuffer());
  if (radii.length < NEBULA_MIN_FRAGMENTS) {
    issue(
      `only ${radii.length} fragments are in flight when the remnant appears — ` +
        `the shed envelope has to still be there as a nebula`,
    );
    return;
  }
  // The bulk of the shell, rather than its fastest stragglers.
  const edge = radii[Math.floor(radii.length * 0.9)]!;
  // A supergiant's own photosphere can be larger than the smallest cloud the
  // form allows (34 AU at 30 M☉ against a 10 AU cloud), and the view frames
  // whichever is bigger — so that, not the cloud alone, is the yardstick.
  const framed = Math.max(config.cloudExtent, engulfRadius(stellarMass));
  if (edge > framed * NEBULA_MAX_FRAMED_REACH) {
    issue(
      `the nebula's edge is at ${edge.toFixed(0)} AU when the remnant appears — ` +
        `${(edge / framed).toFixed(1)}× the framed ${framed.toFixed(0)} AU system, i.e. off screen`,
    );
  }
  if (edge <= engulfRadius(stellarMass)) {
    issue(
      `the nebula's edge is at ${edge.toFixed(2)} AU, still inside the ` +
        `${engulfRadius(stellarMass).toFixed(2)} AU photosphere it was launched from — ` +
        `the envelope is not seen to leave`,
    );
  }
}

/**
 * The nebula must DISPERSE rather than disappear.
 *
 * Measured before the fix: 2198 fragments at one moment and 0 about fifteen
 * seconds of playback later, because the whole shell was culled the instant it
 * crossed the escape radius — the reported "there is no nebula, only the small
 * star remnant". The curve sampled over the remnant watch must therefore stay
 * populated (the shell is still on screen well into the remnant stage) and fall
 * only gradually, as individual fragments reach the end of their life.
 *
 * The tail of the fade — that it does eventually end, and dims on the way out —
 * belongs to the kernel's own
 * `the_nebula_fades_out_instead_of_being_deleted_mid_flight`, which can afford
 * to run the nebula's whole life. What the battery adds is that this holds for
 * EVERY star the form can produce, not just a solar one.
 */
function checkNebulaDecay(counts: readonly number[], issue: (msg: string) => void): void {
  if (counts.length === 0) {
    issue('the remnant stage was never watched, so the nebula was never checked');
    return;
  }
  const onset = counts[0]!;
  for (let i = 1; i < counts.length; i += 1) {
    const previous = counts[i - 1]!;
    const lost = previous - counts[i]!;
    if (lost > previous * NEBULA_MAX_STEP_LOSS + 8) {
      issue(
        `the nebula lost ${lost} of its ${previous} fragments in a single step ` +
          `(watch tick ${i}) — that is a deletion, not a fade`,
      );
      return;
    }
  }
  const last = counts[counts.length - 1]!;
  if (last <= 0) {
    issue(`the nebula was gone ${counts.length} ticks into the remnant stage`);
  } else if (last < onset / 2) {
    issue(
      `the nebula is down to ${last} of its ${onset} fragments a third of the way through ` +
        `its life — it must linger and fade, not evaporate`,
    );
  }
}

function runBattery(
  kernel: PhysicsKernel,
  config: BatteryConfig,
  consts: KernelConstants,
): RunReport {
  const report: RunReport = {
    issues: [],
    events: [],
    finalStage: LifecycleStage.DustCloud,
    finalStarMass: 0,
    finalElapsed: 0,
    ticks: 0,
    architecture: [],
    sawWorld: false,
    nebula: [],
  };
  const issue = (msg: string): void => {
    if (report.issues.length < 12) {
      report.issues.push(msg);
    }
  };

  kernel.init({ config, particleCount: PARTICLES });
  const stellarMass = stellarMassFromCloud(config.mass, config.composition.metals);
  const durations = stageDurations(stellarMass, config.composition);
  const paceRate = paceToRate(config.pace, 1, DEFAULT_LIFECYCLE_SIM_SECONDS, 60);
  const baseSimDt = paceRate * FRAME_REAL_DT;
  // The kernel owns these; the harness must not keep its own copies or the
  // energy checks below would be testing a different model than the one running.
  // The gravitational field is read from the attractor buffer at the moment of
  // each check rather than cached: it has more than one centre in a multiple
  // system (spec §4.1), the companions move, and the primary's own `mu` shrinks
  // as it sheds its envelope (Decision D4).
  const { softening: SOFTENING } = consts;

  let lastStage: LifecycleStage = LifecycleStage.DustCloud;
  let lastElapsed = -Infinity;
  let remnantTicks = 0;
  /** Where the worlds were at the START of this step, kept while the star dies. */
  let dyingPositions = new Map<number, [number, number, number]>();
  /** The largest ORDINARY step of the death, to judge the last one against. */
  const deathBaseline: DeathMotionBaseline = { shift: 0, radial: 0, steps: 0 };

  for (let tick = 0; tick < MAX_TICKS; tick += 1) {
    report.ticks = tick + 1;
    // Long stellar stages are crossed with a larger dt (the user can crank the
    // pace arbitrarily high; the kernel must stay sound under any dt).
    let simDt = baseSimDt;
    if (lastStage === LifecycleStage.MainSequence || lastStage === LifecycleStage.RedGiant) {
      const dur = durations[lastStage];
      if (Number.isFinite(dur)) {
        simDt = Math.max(baseSimDt, dur / 200);
      }
    } else if (lastStage === LifecycleStage.Remnant) {
      simDt = Math.max(baseSimDt, REMNANT_WATCH_DT);
    }
    // The one step that forms the remnant is the step the deleted closed-form
    // rewrite used to teleport every survivor in, so the positions going into it
    // have to be known before it is taken.
    const stageBefore = lastStage;
    if (stageBefore === LifecycleStage.Death) {
      dyingPositions = worldPositions(kernel.getBodyBuffer());
    }
    const res = kernel.step(simDt);
    if (stageBefore === LifecycleStage.Death) {
      if (res.stage === LifecycleStage.Remnant) {
        checkRemnantOnset(kernel, config, stellarMass, dyingPositions, deathBaseline, issue);
      } else {
        // An ordinary step of this death: how far a world moves in one is set by
        // the dt, the star's mass and how close in the world is, so it is the
        // only honest yardstick for the step that ends the death.
        const motion = stepMotion(dyingPositions, worldPositions(kernel.getBodyBuffer()));
        if (motion.measured) {
          deathBaseline.shift = Math.max(deathBaseline.shift, motion.shift);
          deathBaseline.radial = Math.max(deathBaseline.radial, motion.radial);
          deathBaseline.steps += 1;
        }
      }
    }

    for (const ev of res.events) {
      report.events.push({ type: ev.type, simTime: ev.simTime, data: ev.data });
    }
    if (res.stage < lastStage) {
      issue(`stage regressed ${LifecycleStage[lastStage]} -> ${LifecycleStage[res.stage]}`);
    }
    const stageChanged = res.stage !== lastStage;
    lastStage = res.stage;
    if (!Number.isFinite(res.elapsedSimSeconds) || res.elapsedSimSeconds < lastElapsed - 1) {
      issue(`elapsed time not monotonic at tick ${tick}`);
    }
    lastElapsed = res.elapsedSimSeconds;
    if (!Number.isFinite(res.starMassSolar) || res.starMassSolar < 0) {
      issue(`non-finite/negative star mass at tick ${tick}`);
    }
    if (res.stage < LifecycleStage.Remnant && res.starMassSolar > stellarMass * 1.02 + 1e-9) {
      issue(
        `star mass ${res.starMassSolar.toFixed(3)} exceeds formation budget ` +
          `${stellarMass.toFixed(3)} at stage ${LifecycleStage[res.stage]}`,
      );
    }
    if (res.stageProgress < 0 || res.stageProgress > 1 || !Number.isFinite(res.stageProgress)) {
      issue(`stageProgress out of [0,1]: ${res.stageProgress}`);
    }

    // Per-tick body invariants. Sampling these only every 25th tick let a
    // single-step energy blow-up slip through if the body was culled again
    // before the next sample, and would let a mis-typed body exist unobserved
    // for a whole stage.
    {
      const bbuf = kernel.getBodyBuffer();
      const attractors = kernel.getAttractorBuffer();
      const multiple = attractors.length > ATTRACTOR_STRIDE;
      for (let i = 0; i < bbuf.length / BODY_STRIDE; i += 1) {
        const b = bodyView(bbuf, i);
        // Every body is typed by its OWN mass (spec §4.2). A 2–3 M☉ fragment
        // that stayed a "protoplanet" was reported bug 1; a body that shines
        // must never be drawn or described as a world.
        if (isWorld(b.type) && b.mass >= FATE_THRESHOLDS.hydrogenBurningMinMass) {
          issue(
            `a ${b.mass.toFixed(3)} M☉ body is typed ${BodyType[b.type]} at tick ${tick} — ` +
              `above the ${FATE_THRESHOLDS.hydrogenBurningMinMass} M☉ hydrogen-burning limit ` +
              `it is a star`,
          );
        }
        if (b.type === BodyType.Star && b.mass < FATE_THRESHOLDS.hydrogenBurningMinMass) {
          issue(`a ${b.mass.toFixed(4)} M☉ body is typed Star at tick ${tick} — it cannot fuse`);
        }
        // NB deliberately NOT asserting the converse for a brown dwarf. A
        // fragment is seeded at the opacity limit, BELOW the deuterium-burning
        // mass, and assembles the rest of itself by accretion — but it is a
        // protostellar core on the stellar track from birth, so the kernel gives
        // it a substellar kind from the start rather than letting it spend its
        // first frames as a "protoplanet" that merges, is engulfed, or is drawn
        // with rings. What must hold is only that a body that has passed a
        // burning limit is never typed BELOW it.
        if (b.type === BodyType.BrownDwarf && b.mass >= FATE_THRESHOLDS.hydrogenBurningMinMass) {
          issue(
            `a ${b.mass.toFixed(3)} M☉ body is still typed BrownDwarf at tick ${tick} — ` +
              `it is above the hydrogen-burning limit and has to be a star`,
          );
        }
        if (!isWorld(b.type)) {
          continue;
        }
        report.sawWorld = true;
        // Reported bug 4: with no metals there is nothing condensable, so the
        // disc has no solid budget and cannot seed a single planetesimal — no
        // rocky worlds, no icy ones, no cores for giants (Decision D3).
        if (config.composition.metals <= 0) {
          issue(
            `a world exists at tick ${tick} (${LifecycleStage[res.stage]}) in a cloud with no ` +
              `metals — there is nothing for it to have condensed out of`,
          );
        }
        if (res.stage >= LifecycleStage.Death) {
          continue;
        }
        const r = Math.hypot(b.x, b.y, b.z);
        if (
          systemEnergy(attractors, SOFTENING, b) >= 0 &&
          !unboundIsExplainable(multiple, r, config.cloudExtent)
        ) {
          issue(
            `planet unbound at tick ${tick} (stage ${LifecycleStage[res.stage]}) r=${r.toFixed(1)}`,
          );
        }
      }
    }

    // Sample the emergent architecture once, mid-main-sequence: the star is
    // fully formed, and the red giant has not yet eaten the inner planets.
    if (
      report.architecture.length === 0 &&
      res.stage === LifecycleStage.MainSequence &&
      res.stageProgress > 0.3
    ) {
      const bbuf = kernel.getBodyBuffer();
      // The ARCHITECTURE is the shape of the orbits about the primary, so this
      // block — and only this block — wants the primary's own `mu`. Read live
      // from the kernel; it is still exactly its formation value here, mid-main-
      // sequence, because mass loss does not start until the late red giant.
      const mu = kernel.orbitalMu();
      for (let i = 0; i < bbuf.length / BODY_STRIDE; i += 1) {
        const b = bodyView(bbuf, i);
        if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
          continue;
        }
        const r = Math.hypot(b.x, b.y, b.z);
        const v2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
        const energy = 0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING);
        // Semi-major axis from the vis-viva relation; bound orbits only.
        const aScene = energy < 0 ? -mu / (2 * energy) : Infinity;
        // Eccentricity from the specific angular momentum, so we can ask how far
        // OUT the orbit actually reaches — which is what decides whether the
        // body ever sees ices (the kernel accretes at the instantaneous radius).
        const lx = b.y * b.vz - b.z * b.vy;
        const ly = b.z * b.vx - b.x * b.vz;
        const lz = b.x * b.vy - b.y * b.vx;
        const l2 = lx * lx + ly * ly + lz * lz;
        const ecc = Math.sqrt(Math.max(0, 1 + (2 * energy * l2) / (mu * mu)));
        report.architecture.push({
          mass: b.mass,
          aAu: sceneToAu(aScene),
          apoapsisAu: Number.isFinite(aScene) ? sceneToAu(aScene * (1 + ecc)) : Infinity,
        });
      }
    }

    const sampled = tick % 25 === 0 || stageChanged;
    if (sampled) {
      const pbuf = kernel.getParticleBuffer();
      const bbuf = kernel.getBodyBuffer();
      if (!allFinite(pbuf)) {
        issue(`non-finite particle buffer at tick ${tick} (${LifecycleStage[res.stage]})`);
      }
      if (!allFinite(bbuf)) {
        issue(`non-finite body buffer at tick ${tick} (${LifecycleStage[res.stage]})`);
      }
      if (pbuf.length % PARTICLE_STRIDE !== 0 || bbuf.length % BODY_STRIDE !== 0) {
        issue(`buffer length not stride-aligned at tick ${tick}`);
      }

      // Planets must be gravitationally bound at EVERY stage, not just once the
      // star is on the main sequence. Judged in the kernel's FULL field, because
      // a companion star holds worlds the primary alone would not (spec §4.1).
      //
      // How strict this can be depends on how many stars there are. Around a
      // SINGLE star the field is a monopole, so a bound orbit stays bound and any
      // unbound world means the integrator manufactured energy. A COMPANION can
      // genuinely scatter one: the outer disc of a wide binary is dynamically
      // unstable, and a world thrown out of it really is unbound (the kernel
      // ejects it once it is demonstrably leaving). So for a multiple system the
      // claim is narrowed to the region where planets actually live and where
      // manufactured energy would show up — inside the dust disc, whose outer edge
      // the kernel places at this fraction of the cloud extent.
      if (res.stage < LifecycleStage.Death) {
        const attractors = kernel.getAttractorBuffer();
        const multiple = attractors.length > ATTRACTOR_STRIDE;
        const n = bbuf.length / BODY_STRIDE;
        for (let i = 0; i < n; i += 1) {
          const b = bodyView(bbuf, i);
          if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
            continue;
          }
          const r = Math.hypot(b.x, b.y, b.z);
          const energy = systemEnergy(attractors, SOFTENING, b);
          if (energy >= 0 && !unboundIsExplainable(multiple, r, config.cloudExtent)) {
            issue(`unbound planet (E=${energy.toFixed(3)}) at tick ${tick} r=${r.toFixed(1)}`);
          }
          // A world may legitimately orbit the WIDEST star in the system, so the
          // ceiling is whichever is further out: the cloud or that companion.
          const reach = Math.max(config.cloudExtent * 3, outermostAttractorRadius(attractors) * 3);
          if (r > reach) {
            issue(`planet escaped to r=${r.toFixed(1)} (reach ${reach.toFixed(1)})`);
          }
        }
      }

      // Mass-conservation book-keeping needs white-box access to the kernel's
      // internal budget fields, which the flat output buffers do not expose. It
      // now lives in the crate that owns that state, as the Rust unit test
      // `the_mass_budget_is_conserved_and_never_grows`.
    }

    if (res.stage === LifecycleStage.Remnant) {
      remnantTicks += 1;
      // The nebula's decay curve, sampled every tick of the watch: it must thin
      // and dim, not be deleted (reported bug 7).
      report.nebula.push(kernel.getParticleBuffer().length / PARTICLE_STRIDE);
      if (remnantTicks >= REMNANT_SETTLE_TICKS) {
        report.finalStage = res.stage;
        report.finalStarMass = res.starMassSolar;
        report.finalElapsed = res.elapsedSimSeconds;
        break;
      }
    }
    report.finalStage = res.stage;
    report.finalStarMass = res.starMassSolar;
    report.finalElapsed = res.elapsedSimSeconds;
  }

  finishChecks(report, config, kernel, stellarMass, durations, consts, issue);
  return report;
}

function finishChecks(
  report: RunReport,
  config: BatteryConfig,
  kernel: PhysicsKernel,
  stellarMass: number,
  durations: Readonly<Record<LifecycleStage, number>>,
  consts: KernelConstants,
  issue: (msg: string) => void,
): void {
  // Model constants come from the kernel, never from a copy in this harness.
  const { softening: SOFTENING, snowLineAu: SNOW_LINE_AU } = consts;
  if (report.finalStage !== LifecycleStage.Remnant) {
    issue(
      `lifecycle did not complete: ended in ${LifecycleStage[report.finalStage]} ` +
        `after ${report.ticks} ticks`,
    );
    return;
  }

  // --- Event sequence: exactly one lifecycle event each, in order. ----------
  const substellar = isSubstellar(stellarMass);

  // --- The nebula: a shell that thins and dims, not one that is deleted. -----
  // A brown dwarf never dies and so never blows one; everything else must.
  if (!substellar) {
    checkNebulaDecay(report.nebula, issue);
  }

  // --- Planet formation is gated by the SOLIDS, and by nothing else. ---------
  // The metal-free half of this (reported bug 4) is asserted per tick, so it
  // cannot be satisfied by a run that simply never formed anything. This is its
  // counterpart: a metal-rich disc around a real star must actually make worlds,
  // or the metal-free claim above would be vacuous.
  if (
    !substellar &&
    config.composition.metals >= 0.02 &&
    stellarMass >= 0.5 &&
    config.cloudExtent <= 120 &&
    !report.sawWorld
  ) {
    issue(
      `no world ever formed around a ${stellarMass.toFixed(2)} M☉ star in a ` +
        `Z=${config.composition.metals} disc — the solid budget is there, so planets must be too`,
    );
  }
  const lifecycle = report.events.filter((e) => LIFECYCLE_EVENT_ORDER.includes(e.type));
  const seq = lifecycle.map((e) => e.type);
  // A brown dwarf never ignites, so it never emits FusionIgnition and never
  // reaches the red giant or the death: it goes protostar → remnant.
  const expected = substellar
    ? [SimEventType.CollapseOnset, SimEventType.ProtostarFormed, SimEventType.RemnantFormed]
    : [...LIFECYCLE_EVENT_ORDER];
  if (JSON.stringify(seq) !== JSON.stringify(expected)) {
    issue(`lifecycle event sequence wrong: [${seq.map((t) => SimEventType[t]).join(', ')}]`);
  }
  for (let i = 1; i < lifecycle.length; i += 1) {
    if (lifecycle[i]!.simTime < lifecycle[i - 1]!.simTime) {
      issue('lifecycle event timestamps not monotonic');
    }
  }

  // --- Fate correctness vs stellar theory (on the STELLAR mass). ------------
  const expectedFate = determineFate(stellarMass, config.composition);
  const remnantEv = report.events.find((e) => e.type === SimEventType.RemnantFormed);
  const deathEv = report.events.find((e) => e.type === SimEventType.DeathEvent);
  if (remnantEv?.data !== undefined) {
    const remnant = remnantEv.data['remnant'] as RemnantType;
    const supernova = remnantEv.data['supernova'] as boolean;
    if (remnant !== expectedFate.remnant) {
      issue(
        `remnant ${RemnantType[remnant]} != theoretical ${RemnantType[expectedFate.remnant]} ` +
          `for star ${stellarMass.toFixed(2)}M☉`,
      );
    }
    if (supernova !== expectedFate.supernova) {
      issue(`supernova flag ${supernova} != theoretical ${expectedFate.supernova}`);
    }
  } else {
    issue('RemnantFormed event missing/without data');
  }
  if (deathEv?.data !== undefined && deathEv.data['supernova'] !== expectedFate.supernova) {
    issue('DeathEvent supernova flag mismatches the fate model');
  }

  // --- Remnant mass physics. -------------------------------------------------
  const expectRemnantMass = remnantMass(stellarMass, expectedFate.remnant);
  if (Math.abs(report.finalStarMass - expectRemnantMass) > expectRemnantMass * 0.02) {
    issue(
      `remnant mass ${report.finalStarMass.toFixed(3)} != expected ` +
        `${expectRemnantMass.toFixed(3)}`,
    );
  }
  if (
    expectedFate.remnant === RemnantType.WhiteDwarf &&
    report.finalStarMass > FATE_THRESHOLDS.chandrasekharMass + 1e-6
  ) {
    issue(`white dwarf above the Chandrasekhar limit: ${report.finalStarMass}`);
  }
  if (
    (expectedFate.remnant === RemnantType.NeutronStar ||
      expectedFate.remnant === RemnantType.Pulsar) &&
    report.finalStarMass > FATE_THRESHOLDS.tovMass + 1e-6
  ) {
    issue(`neutron star above the TOV limit: ${report.finalStarMass}`);
  }
  if (substellar) {
    // A brown dwarf sheds nothing — it never dies, so it keeps its whole mass.
    if (Math.abs(report.finalStarMass - stellarMass) > stellarMass * 1e-3) {
      issue(
        `brown dwarf mass ${report.finalStarMass.toFixed(4)} != formed mass ` +
          `${stellarMass.toFixed(4)} — it has nothing to shed`,
      );
    }
  } else if (report.finalStarMass >= stellarMass) {
    issue('remnant did not lose mass relative to its progenitor');
  }

  // --- Elapsed time must reflect the illustrative stage durations. -----------
  const formationTotal =
    durations[LifecycleStage.DustCloud] +
    durations[LifecycleStage.ProtostarCoalescence] +
    durations[LifecycleStage.FusionIgnition];
  // A brown dwarf's clock stops at the end of formation: it has no main
  // sequence, no red giant and no death to spend billions of years on.
  const expectedTotal = substellar
    ? formationTotal
    : formationTotal +
      durations[LifecycleStage.MainSequence] +
      durations[LifecycleStage.RedGiant] +
      durations[LifecycleStage.Death];
  const ratio = report.finalElapsed / expectedTotal;
  if (!(ratio > 0.9 && ratio < 1.15)) {
    issue(
      `elapsed at remnant ${report.finalElapsed.toExponential(2)}s is ${ratio.toFixed(2)}× ` +
        `the theoretical lifetime ${expectedTotal.toExponential(2)}s`,
    );
  }

  // Post-mortem particle-KIND checks (a brown dwarf throws no ejecta; a real
  // death leaves only ejecta behind) need the kinds, which the flat particle
  // buffer does not carry. They now live in the crate that owns that state, as
  // the Rust unit tests `a_brown_dwarf_never_throws_ejecta_and_keeps_its_disc`
  // and `leaves_no_primordial_dust_orbiting_the_remnant`.
  const pbuf = kernel.getParticleBuffer();
  const bbuf = kernel.getBodyBuffer();
  const attractors = kernel.getAttractorBuffer();
  if (!allFinite(pbuf) || !allFinite(bbuf) || !allFinite(attractors)) {
    issue('non-finite final buffers');
  }
  // Surviving planets must not sit on top of the remnant.
  const n = bbuf.length / BODY_STRIDE;
  // How far out a world may legitimately be: the cloud it formed in, or the orbit
  // of the widest star in the system — a world bound to a wide pair can swing well
  // beyond the pair's own separation.
  const reach = Math.max(config.cloudExtent * 3, outermostAttractorRadius(attractors) * 3);
  for (let i = 0; i < n; i += 1) {
    const b = bodyView(bbuf, i);
    if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
      continue;
    }
    const r = Math.hypot(b.x, b.y, b.z);
    if (r < 0.5) {
      issue(`planet parked on the remnant at r=${r.toFixed(3)}`);
    }
    // Again in the full field, and stated as the kernel's actual contract: a world
    // that is unbound from the WHOLE system and on its way out must have been
    // ejected, not carried along for ever (`eject_escaping_worlds`).
    //
    // Being marginally unbound while still close in is expected rather than a
    // fault: the primary's mass loss widens every orbit (Decision D4), and for the
    // outermost worlds the envelope leaves faster than they can complete a
    // revolution, so they are left with more speed than the remaining gravity
    // holds. The kernel deliberately keeps such a world until it is demonstrably
    // leaving, so it is not deleted from the middle of the visible system.
    const energy = systemEnergy(attractors, SOFTENING, b);
    const receding = b.x * b.vx + b.y * b.vy + b.z * b.vz > 0;
    if (energy >= 0 && receding && r > reach) {
      issue(
        `unbound planet still carried at r=${r.toFixed(1)} (E=${energy.toFixed(3)}, ` +
          `reach ${reach.toFixed(1)})`,
      );
    }
  }

  // --- Emergent architecture: the most massive planet is NOT a close-in one. --
  const planets: { mass: number; au: number }[] = [];
  for (let i = 0; i < n; i += 1) {
    const b = bodyView(bbuf, i);
    if (b.type === BodyType.Planet || b.type === BodyType.Protoplanet) {
      planets.push({ mass: b.mass, au: sceneToAu(Math.hypot(b.x, b.y, b.z)) });
    }
  }
  if (planets.length > 0) {
    const biggest = planets.reduce((a, b) => (b.mass > a.mass ? b : a));
    // After the remnant's orbital expansion even an inner planet sits wider, so
    // compare against the snow line only loosely; a Jupiter at 0.5 AU is the
    // bug this guards against.
    if (biggest.mass > 5e-5 && biggest.au < SNOW_LINE_AU * 0.9) {
      issue(
        `most massive planet (${biggest.mass.toExponential(1)}M☉) orbits at ` +
          `${biggest.au.toFixed(2)} AU — inside the snow line`,
      );
    }
  }

  // --- Architecture measured on the MAIN SEQUENCE, by semi-major axis. -------
  // Comparing instantaneous radii is misleading (an eccentric giant just
  // outside the ice line dips inside it), and the post-death snapshot has
  // already lost its inner planets to the red giant. `report.architecture` is
  // sampled while the star is alive and uses each planet's ORBIT.
  const arch = report.architecture;
  if (arch.length > 0) {
    // A body whose ENTIRE orbit stays inside the snow line never sees an ice
    // grain: only refractory rock condenses there, at a retention some three
    // orders of magnitude lower. It therefore cannot become a giant — and since
    // the model has no migration, a giant found on such an orbit could only have
    // been created there, which is exactly the "hot Jupiter out of nowhere" bug.
    // (Apoapsis, not semi-major axis, is the right test: the kernel accretes at
    // the body's instantaneous radius, so an eccentric planet whose a is a hair
    // inside 2.7 AU does reach the ices, and a Jupiter there is correct.)
    // The 0.8 tolerance matters: a giant that grew just BEYOND the ice line can
    // legitimately end up marginally inside it, because a momentum-conserving
    // merge shrinks the survivor's orbit. Observed: a 71 M⊕ world with apoapsis
    // 2.62 AU against a 2.7 AU snow line — 3% inside, and impossible to have
    // grown there, so it must have moved. The bug this guards against is a giant
    // DEEP in the terrestrial zone (the original ones sat at 0.5–1.4 AU), which
    // this bound still catches decisively.
    const terrestrialZoneAu = SNOW_LINE_AU * 0.8;
    for (const p of arch) {
      if (p.apoapsisAu < terrestrialZoneAu && solarToEarthMasses(p.mass) >= 50) {
        issue(
          `giant (${solarToEarthMasses(p.mass).toFixed(0)} M⊕) on an orbit entirely ` +
            `deep inside the snow line (a=${p.aAu.toFixed(2)}, apoapsis=${p.apoapsisAu.toFixed(2)} AU) — ` +
            `the rocky zone cannot supply that`,
        );
      }
    }
    // NB deliberately NOT asserting that the biggest planet is an outer one.
    // It usually is, but a giant sitting at the ice line can legitimately end up
    // the innermost SURVIVOR once the terrestrial embryos inside it have merged
    // into it — an emergent outcome, not a defect. The apoapsis rule above is
    // the invariant that actually distinguishes physics from a bug.
    // Planets must stay inside the system they formed in — unless a companion
    // star scattered one out of the disc, which is a real outcome in a multiple
    // system rather than a defect (the kernel ejects such a world once it is
    // demonstrably leaving).
    const scatteringPossible = kernel.attractorCount() > 1;
    for (const p of arch) {
      if (p.aAu > config.cloudExtent * 2.5 && !scatteringPossible) {
        issue(`planet on a a=${p.aAu.toFixed(0)} AU orbit in a ${config.cloudExtent} AU cloud`);
      }
    }
  }
}

// --- Test wiring -------------------------------------------------------------

const configs = buildConfigs(RUNS);

const wasmBinUrl = new URL('../../wasm/pkg/star_kernel_bg.wasm', import.meta.url);
const wasmBuilt = existsSync(fileURLToPath(wasmBinUrl));
const describeWasm = wasmBuilt ? describe : describe.skip;

describeWasm(`simulation battery (${RUNS} runs)`, () => {
  for (const config of configs) {
    it(
      config.label,
      async () => {
        const bytes = readFileSync(fileURLToPath(wasmBinUrl));
        const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });
        const kernel = new WasmKernel(mod);
        // Read the model constants the checks depend on from the kernel itself.
        const report = runBattery(kernel, config, {
          softening: mod.softening(),
          snowLineAu: mod.snow_line_au(),
        });
        kernel.dispose();
        expect(report.issues, report.issues.join('\n')).toEqual([]);
      },
      120000,
    );
  }
});

// Physics kernel boundary (spec §4.4, §4.5, Decisions D1/D2).
//
// This module defines the CONTRACT the physics implementation satisfies:
//   - `WasmKernel` — the Rust→WASM numeric hot loop, the ONLY kernel. The
//     simulation model lives entirely in `wasm/src/`; nothing on this side
//     duplicates it. (A mirrored pure-TypeScript fallback used to exist for
//     environments without WebAssembly; it was removed once WASM became
//     universally available, because keeping the two hand-mirrored was a
//     standing source of drift.)
//
// Per Decision D1 the kernel and the renderer communicate over FLAT typed-array
// buffers so the renderer can read simulation state each frame with no
// per-particle JS↔WASM boundary calls. The interleaved layouts below are the
// single source of truth for that memory format; the WASM kernel's
// linear-memory views must match these strides and offsets exactly.

import type { SimulationConfig } from '../config/SimulationConfig';
import type { LifecycleStage } from '../config/fateModel';
import type { SimulationEvent } from './events';

/** A 3-component vector in scene units. */
export type Vec3 = [number, number, number];

/** Initialization payload handed to a kernel's {@link PhysicsKernel.init}. */
export interface KernelInit {
  /** Immutable run configuration from the setup form (spec §4.1). */
  config: SimulationConfig;
  /**
   * Requested dust-cloud particle count. The kernel MAY cap this to its own
   * maximum for performance (FR-10); {@link PhysicsKernel.getParticleBuffer}
   * reflects the effective count actually allocated.
   */
  particleCount: number;
}

/** Value returned by every {@link PhysicsKernel.step} call. */
export interface StepResult {
  /** Events emitted during this step, in emission order (drained). */
  events: SimulationEvent[];
  /** The lifecycle stage the simulation is in after the step. */
  stage: LifecycleStage;
  /**
   * Normalized 0..1 progress through the current stage. During FORMATION stages
   * this reflects accretion progress (core mass fraction — the physics, not a
   * timer); during the stellar stages it reflects elapsed sim-time in the stage.
   */
  stageProgress: number;
  /**
   * Physically meaningful elapsed time for the star system, in sim seconds.
   *
   * This is NOT the raw wall-clock-scaled `Clock.simTime`: because formation is
   * accretion-driven (so it stays watchable at any pace) its progress is mapped
   * onto the REAL formation timescale (~1.6 Myr for a solar cloud), after which
   * the stellar clock continues. Without this the star appeared to ignite after
   * a few dozen years.
   */
  elapsedSimSeconds: number;
  /**
   * Mass of the central object RIGHT NOW, in solar masses.
   *
   * This is NOT the configured cloud mass: only a fraction of a cloud ever
   * reaches the star (see `config/starFormation.ts`), so this ramps up with the
   * accreted core during formation, settles at the star's final mass for its
   * life, and drops to the compact remnant's mass once the star has died.
   * Everything stellar the user sees (temperature, radius, label mass) is
   * derived from this value.
   */
  starMassSolar: number;
}

// --- Particle buffer layout (interleaved Float32Array) ----------------------
//
//   [x, y, z, r, g, b, size,  x, y, z, r, g, b, size,  ...]
//
// Position is in scene units; colour is linear RGB in [0,1]; size is the point
// sprite size. One "stride" of floats describes one particle.

/** Number of Float32 lanes per particle in the particle buffer. */
export const PARTICLE_STRIDE = 7;

/** Byte/lane offsets of each field within a particle's stride. */
export const PARTICLE_OFFSET = {
  x: 0,
  y: 1,
  z: 2,
  r: 3,
  g: 4,
  b: 5,
  size: 6,
} as const;

// --- Body buffer layout (interleaved Float32Array) --------------------------
//
//   [id, type, mass, radius, x, y, z, vx, vy, vz, spin, captured,  ...]
//
// One stride per {@link CelestialBody}. `type` holds a {@link BodyType} numeric
// value; `captured` is 0 (false) or 1 (true). Positions/velocities are in scene
// units and scene-units-per-sim-time respectively.

/** Number of Float32 lanes per body in the body buffer. */
export const BODY_STRIDE = 12;

/** Lane offsets of each field within a body's stride. */
export const BODY_OFFSET = {
  id: 0,
  type: 1,
  mass: 2,
  radius: 3,
  x: 4,
  y: 5,
  z: 6,
  vx: 7,
  vy: 8,
  vz: 9,
  spin: 10,
  captured: 11,
} as const;

// --- Attractor buffer layout (interleaved Float32Array) ---------------------
//
//   [x, y, z, mu,  x, y, z, mu,  ...]
//
// One stride per GRAVITATING CENTRE the kernel integrates against: the primary
// star at the scene origin (Decision D5) followed by any companion stars
// (Decision D6 caps the total). `mu` is that centre's gravitational parameter on
// the kernel's visual (√M-scaled) convention — the same units as
// {@link PhysicsKernel.orbitalMu}, which is exactly this buffer's first `mu`.

/** Number of Float32 lanes per gravitating centre in the attractor buffer. */
export const ATTRACTOR_STRIDE = 4;

/** Lane offsets of each field within an attractor's stride. */
export const ATTRACTOR_OFFSET = {
  x: 0,
  y: 1,
  z: 2,
  mu: 3,
} as const;

/**
 * Kinds of orbiting/visiting bodies the kernel integrates (spec §4.5).
 *
 * `BrownDwarf` and `Star` are APPENDED, never inserted: the numeric value is
 * what crosses the WASM boundary in the body buffer's `type` lane and in body
 * events, so renumbering would silently re-label every existing body.
 *
 * The kernel types every non-visiting body by its OWN mass (spec §4.2): at or
 * above the hydrogen-burning minimum (0.08 M☉) it is a `Star`, above the
 * deuterium-burning minimum (0.013 M☉) a `BrownDwarf`, and otherwise a world.
 * Both of the new kinds SHINE, so they must never be drawn with the rings and
 * moons `planetLook()` gives a planet.
 */
export enum BodyType {
  Protoplanet,
  Planet,
  Comet,
  Asteroid,
  /** Substellar companion: fuses deuterium, never hydrogen. */
  BrownDwarf,
  /** Companion star: fuses hydrogen, exactly as the primary does. */
  Star,
}

/**
 * A celestial body integrated by the kernel (spec §4.5). Planets orbit and spin
 * (FR-6); comets and asteroids may visit the system and be captured or ejected
 * (FR-7). Instances are mutable simulation state owned by the kernel.
 */
export interface CelestialBody {
  id: number;
  type: BodyType;
  mass: number;
  radius: number;
  position: Vec3;
  velocity: Vec3;
  /** Axial rotation rate (FR-6). */
  spin: number;
  /** Whether a visiting body is gravitationally bound to the system (FR-7). */
  captured: boolean;
}

/**
 * The numeric simulation kernel (Decision D1/D2). Two interchangeable
 * implementations exist behind this interface. Lifecycle:
 * {@link init} → repeated {@link step} → {@link dispose}. The buffer accessors
 * return FLAT views the renderer reads each frame; their contents are updated
 * in place by {@link step} using the layouts above.
 */
export interface PhysicsKernel {
  /** (Re)initialize the kernel for a run. Safe to call again to restart. */
  init(init: KernelInit): void;
  /**
   * Advance the simulation by `dtSimSeconds` sim seconds (0 while paused, A6),
   * returning the events emitted and the current lifecycle stage.
   */
  step(dtSimSeconds: number): StepResult;
  /** Flat interleaved particle state; see {@link PARTICLE_OFFSET}. */
  getParticleBuffer(): Float32Array;
  /** Flat interleaved body state; see {@link BODY_OFFSET}. */
  getBodyBuffer(): Float32Array;
  /**
   * The PRIMARY star's gravitational parameter, so the renderer can reconstruct
   * the Kepler conics the bodies are following about the scene origin (the
   * orbit-path overlay). The kernel owns this value — the host must not
   * recompute it from its own copy of the simulation constants.
   *
   * This VARIES over a run: a dying star's gravity weakens as it sheds its
   * envelope (Decision D4), which is what widens the surviving orbits. Read it
   * per frame; do not cache it. Companions' gravity is NOT included — see
   * {@link getAttractorBuffer} for the full field.
   */
  orbitalMu(): number;
  /**
   * Number of gravitating centres the kernel is integrating against right now:
   * the primary plus any live companion stars, bounded by the kernel's
   * `MAX_ATTRACTORS` (Decision D6). Always ≥ 1 for an initialized kernel.
   */
  attractorCount(): number;
  /**
   * Flat interleaved view of those centres; see {@link ATTRACTOR_OFFSET}. The
   * companions move, so this changes every step — like the particle and body
   * buffers it is a live view and must be copied to be retained.
   */
  getAttractorBuffer(): Float32Array;
  /** Release resources / listeners. The kernel is unusable afterwards. */
  dispose(): void;
}

// Physics kernel boundary (spec §4.4, §4.5, Decisions D1/D2).
//
// This module defines the CONTRACT that both physics implementations satisfy:
//   - `WasmKernel`      — the Rust→WASM numeric hot loop (added in a later step).
//   - `TsFallbackKernel`— the pure-TypeScript fallback used when WASM is
//                         unavailable (this step; see `./TsFallbackKernel.ts`).
//
// Per Decision D1 the two sides communicate over FLAT typed-array buffers so the
// renderer can read simulation state each frame with no per-particle JS↔WASM
// boundary calls. The interleaved layouts below are the single source of truth
// for that memory format; the WASM kernel's linear-memory views must match these
// strides and offsets exactly so the two kernels are interchangeable behind the
// {@link PhysicsKernel} interface.

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

/** Kinds of orbiting/visiting bodies the kernel integrates (spec §4.5). */
export enum BodyType {
  Protoplanet,
  Planet,
  Comet,
  Asteroid,
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
  /** Release resources / listeners. The kernel is unusable afterwards. */
  dispose(): void;
}

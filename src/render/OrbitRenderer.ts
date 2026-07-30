// Orbit-path renderer for planets, asteroids and comets.
//
// Each frame the body's instantaneous state vector is converted into the Kepler
// conic it is travelling on (see `orbitPath.ts`) and drawn as a line: a closed
// ellipse for bound planets, a finite arc for the hyperbolic fly-by of an
// unbound visitor. Lines are pooled and their vertex buffers rewritten in place,
// so toggling orbits on costs no allocations after the first few frames.
//
// Colour-coded by body kind so a captured comet is distinguishable from a
// planet at a glance.

import * as THREE from 'three';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import type { Vec3 } from '../sim/PhysicsKernel';
import { MAX_VIEW_RADIUS } from './cameraMath';
import { orbitPathPoints } from './orbitPath';

/** Maximum simultaneously drawn orbit paths (pooled lines). */
const MAX_ORBITS = 64;

/** Sampled points per orbit path. */
const ORBIT_SEGMENTS = 160;

/**
 * How much of an UNBOUND body's open branch to sample, as a fraction of its
 * asymptotic true anomaly — practically all of it. What keeps the line finite is
 * the draw extent it is cut at (see {@link OrbitRenderer.setMaxRadius}); also
 * truncating the span, as this did at 0.55, ended the fly-by in mid-air well
 * inside the frame (reported bug 5).
 */
const HYPERBOLIC_SPAN = 0.999;

/** Per-body-kind orbit colours (planets warm, visitors cool). */
const ORBIT_COLORS: Readonly<Record<BodyType, number>> = {
  [BodyType.Protoplanet]: 0x6f86c8,
  [BodyType.Planet]: 0x8fa8e8,
  [BodyType.Comet]: 0x6fd8e8,
  [BodyType.Asteroid]: 0xb9a184,
  // A companion's orbit is drawn in its own light: warm white for a star, dim
  // ember-red for a brown dwarf, so a stellar orbit is never mistaken for a
  // planet's.
  [BodyType.BrownDwarf]: 0xc98a6a,
  [BodyType.Star]: 0xf2e2b8,
};

/** One pooled orbit line with its own geometry/material. */
interface OrbitLine {
  line: THREE.Line;
  geometry: THREE.BufferGeometry;
  material: THREE.LineBasicMaterial;
  positions: Float32Array;
}

/**
 * Draws the orbital path of every body. Call {@link update} each frame with the
 * kernel body buffer and the central gravitational parameter.
 */
export class OrbitRenderer {
  readonly group: THREE.Group;

  private readonly pool: OrbitLine[] = [];
  private enabled = false;
  /** Radius at which a drawn path is cut off; see {@link setMaxRadius}. */
  private maxRadius = MAX_VIEW_RADIUS;

  constructor() {
    this.group = new THREE.Group();
    // Orbits start hidden; the HUD checkbox turns them on.
    this.group.visible = false;
  }

  /**
   * Set the extent (scene units) at which an orbit path is cut off — an open
   * conic is infinite, so it has to end somewhere.
   *
   * Keep it OUTSIDE anything the camera can frame (see {@link MAX_VIEW_RADIUS}).
   * A snug bound — this used to be twice the cloud extent — puts the cut inside
   * the view, where a fly-by visibly stops instead of running off the edge.
   */
  setMaxRadius(radius: number): void {
    if (Number.isFinite(radius) && radius > 0) {
      this.maxRadius = radius;
    }
  }

  /** Show or hide all orbit paths. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.group.visible = enabled;
  }

  /** Whether orbit paths are currently drawn. */
  get isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Rebuild the orbit paths from the interleaved body buffer. `mu` is the
   * central gravitational parameter the kernel integrates against. Does nothing
   * while disabled, so hidden orbits cost no per-frame work.
   */
  update(bodies: Float32Array, bodyCount: number, mu: number): void {
    if (!this.enabled) {
      return;
    }
    let index = 0;
    for (let i = 0; i < bodyCount && index < MAX_ORBITS; i += 1) {
      const base = i * BODY_STRIDE;
      const pos: Vec3 = [
        bodies[base + BODY_OFFSET.x] ?? 0,
        bodies[base + BODY_OFFSET.y] ?? 0,
        bodies[base + BODY_OFFSET.z] ?? 0,
      ];
      const vel: Vec3 = [
        bodies[base + BODY_OFFSET.vx] ?? 0,
        bodies[base + BODY_OFFSET.vy] ?? 0,
        bodies[base + BODY_OFFSET.vz] ?? 0,
      ];
      const points = orbitPathPoints(pos, vel, mu, {
        segments: ORBIT_SEGMENTS,
        hyperbolicSpan: HYPERBOLIC_SPAN,
        maxRadius: this.maxRadius,
      });
      if (points.length === 0) {
        continue; // no drawable orbit (radial fall)
      }
      const type = Math.round(bodies[base + BODY_OFFSET.type] ?? 0) as BodyType;
      this.writeOrbit(index, points, ORBIT_COLORS[type] ?? ORBIT_COLORS[BodyType.Planet]);
      index += 1;
    }

    // Hide unused pooled lines.
    for (let i = index; i < this.pool.length; i += 1) {
      this.pool[i]!.line.visible = false;
    }
  }

  /** Upload one orbit's vertices into the pooled line at `index`. */
  private writeOrbit(index: number, points: Float32Array, color: number): void {
    const entry = this.line(index);
    const floats = Math.min(points.length, entry.positions.length);
    entry.positions.set(points.subarray(0, floats));
    const attr = entry.geometry.getAttribute('position') as THREE.BufferAttribute;
    attr.needsUpdate = true;
    // The pooled buffer is fixed-size but a path's vertex count varies, so draw
    // only the vertices just written. Collapsing the unused tail onto the last
    // point instead (what this did before) leaves a pile of degenerate vertices
    // exactly where the line ends — which is now a point out at the draw extent.
    entry.geometry.setDrawRange(0, Math.floor(floats / 3));
    entry.material.color.setHex(color);
    entry.line.visible = true;
  }

  /** Get (or lazily create) the pooled line at `index`. */
  private line(index: number): OrbitLine {
    const existing = this.pool[index];
    if (existing !== undefined) {
      return existing;
    }
    const positions = new Float32Array((ORBIT_SEGMENTS + 1) * 3);
    const geometry = new THREE.BufferGeometry();
    const attribute = new THREE.BufferAttribute(positions, 3);
    attribute.setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position', attribute);
    const material = new THREE.LineBasicMaterial({
      color: ORBIT_COLORS[BodyType.Planet],
      transparent: true,
      // Faint: the orbit is a guide, never competing with the bodies themselves.
      opacity: 0.42,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    line.frustumCulled = false;
    this.group.add(line);
    const entry: OrbitLine = { line, geometry, material, positions };
    this.pool[index] = entry;
    return entry;
  }

  /** Release all GPU resources. */
  dispose(): void {
    for (const entry of this.pool) {
      entry.geometry.dispose();
      entry.material.dispose();
      this.group.remove(entry.line);
    }
    this.pool.length = 0;
  }
}

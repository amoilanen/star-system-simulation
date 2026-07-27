// Planet / comet / asteroid renderer (spec §3.2, FR-6, FR-7).
//
// Reads the kernel body buffer each frame and draws bodies as instanced meshes,
// one instanced mesh per kind. Planets spin on their axis (accumulated per body
// id from the buffer's spin rate) while their orbital position comes from the
// kernel. Comets additionally get an additive tail billboard oriented radially
// away from the star (bodyMath.tailDirectionAwayFromStar).

import * as THREE from 'three';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import type { Vec3 } from '../sim/PhysicsKernel';
import {
  advanceSpin,
  cometTailActivation,
  tailDirectionAwayFromStar,
  tailLength,
} from './bodyMath';
import { apparentRadius } from './screenScale';
import { cometTailFragmentShader, cometTailVertexShader } from './shaders/cometTail';

const MAX_PLANETS = 32;
const MAX_COMETS = 48;
const MAX_ASTEROIDS = 48;
/** Instanced-mesh capacity for planet moons (a few per planet). */
const MAX_MOONS = 96;
/** Local +Y axis a comet tail plane is built along, rotated toward the tail. */
const TAIL_AXIS = new THREE.Vector3(0, 1, 0);
/**
 * Maximum comet-tail length in scene units (= AU). Real comet tails reach ~1 AU
 * and are by far the largest thing about a comet, but they must not span the
 * whole planetary system.
 */
const MAX_TAIL_LENGTH = 2.5;

/**
 * Smallest apparent DIAMETER, in pixels, at which a body is drawn. Bodies are
 * modelled at true Solar-System proportions (a planet is ~1/1000 of its orbit),
 * so from a whole-system view they would be invisible without this floor; see
 * `screenScale.ts`. Small enough that bodies still read as points of light.
 */
const MIN_BODY_PIXELS = 7;

/** Apparent-size floor for a moon; below its planet's so the hierarchy reads. */
const MIN_MOON_PIXELS = 4;

/**
 * Deterministic moon count for a body: only true planets/protoplanets get
 * moons, 1–2 depending on the body id, so the system reads as a hierarchy of
 * orbits rather than lone planets (addresses the "planets have no moons"
 * over-simplification). Purely visual — moons are not kernel bodies.
 */
function moonCountForBody(id: number, type: BodyType): number {
  if (type !== BodyType.Planet && type !== BodyType.Protoplanet) {
    return 0;
  }
  return 1 + (Math.abs(Math.round(id)) % 2);
}

/** Draws all orbiting/visiting bodies read from the kernel body buffer. */
export class BodyRenderer {
  readonly group: THREE.Group;

  private readonly planets: THREE.InstancedMesh;
  private readonly comets: THREE.InstancedMesh;
  private readonly asteroids: THREE.InstancedMesh;
  private readonly moons: THREE.InstancedMesh;
  private readonly tails: THREE.InstancedMesh;
  private readonly tailMaterial: THREE.ShaderMaterial;

  private readonly dummy = new THREE.Object3D();
  /** Per-body accumulated axial spin angle, keyed by body id (FR-6). */
  private readonly spinAngles = new Map<number, number>();
  private readonly starPos: Vec3 = [0, 0, 0];
  /** Real-time accumulator driving moon orbital motion. */
  private moonElapsed = 0;
  /**
   * Distance from the star within which comets develop a tail (solar heating
   * sublimates their ices). Beyond it a comet is a bare iceball with no tail.
   * Set by the scene from the system scale; a safe default keeps tails sensible.
   */
  private tailActivationDistance = 25;
  /** Camera for this frame's apparent-size floor (null ⇒ draw at true size). */
  private camera: THREE.PerspectiveCamera | null = null;
  /** Viewport height in pixels for this frame's apparent-size floor. */
  private viewportHeightPx = 0;

  constructor() {
    this.group = new THREE.Group();

    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      roughness: 0.8,
      metalness: 0.1,
    });
    this.planets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 24, 24),
      planetMat,
      MAX_PLANETS,
    );
    this.planets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.planets.count = 0;
    this.planets.frustumCulled = false;
    this.group.add(this.planets);

    // Dim, unlit icy nucleus: bright enough to read against space but below the
    // bloom threshold so a comet doesn't glow like a star (its tail carries the
    // glow instead).
    const cometMat = new THREE.MeshBasicMaterial({ color: 0x4a6072 });
    this.comets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 12),
      cometMat,
      MAX_COMETS,
    );
    this.comets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.comets.count = 0;
    this.comets.frustumCulled = false;
    this.group.add(this.comets);

    // Moons: small rocky bodies orbiting the planets (diffuse-lit, never bloom).
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0x9a9488,
      roughness: 1,
      metalness: 0,
    });
    this.moons = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 12), moonMat, MAX_MOONS);
    this.moons.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.moons.count = 0;
    this.moons.frustumCulled = false;
    this.group.add(this.moons);

    const asteroidMat = new THREE.MeshStandardMaterial({
      color: 0x8a7a66,
      roughness: 1,
      metalness: 0,
    });
    this.asteroids = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(1, 0),
      asteroidMat,
      MAX_ASTEROIDS,
    );
    this.asteroids.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.asteroids.count = 0;
    this.asteroids.frustumCulled = false;
    this.group.add(this.asteroids);

    // Comet tails: a plane spanning local y∈[0,1] (head at the comet, tip away).
    const tailGeom = new THREE.PlaneGeometry(1, 1);
    tailGeom.translate(0, 0.5, 0);
    this.tailMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.7, 0.85, 1) },
        uOpacity: { value: 0.9 },
      },
      vertexShader: cometTailVertexShader,
      fragmentShader: cometTailFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.tails = new THREE.InstancedMesh(tailGeom, this.tailMaterial, MAX_COMETS);
    this.tails.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.tails.count = 0;
    this.tails.frustumCulled = false;
    this.group.add(this.tails);
  }

  /**
   * Update all instanced bodies from the interleaved kernel body buffer. `count`
   * is the number of bodies; `dt` (real seconds) advances axial spin. The camera
   * and viewport height are used only to keep astronomically small bodies above
   * a minimum apparent size (see `screenScale.ts`) — positions and distances are
   * always the kernel's true ones.
   */
  update(
    buffer: Float32Array,
    count: number,
    dt: number,
    camera?: THREE.PerspectiveCamera,
    viewportHeightPx?: number,
  ): void {
    this.camera = camera ?? null;
    this.viewportHeightPx = viewportHeightPx ?? 0;
    if (Number.isFinite(dt) && dt > 0) {
      this.moonElapsed += dt;
    }
    let planetIdx = 0;
    let cometIdx = 0;
    let asteroidIdx = 0;
    let moonIdx = 0;
    let tailIdx = 0;
    const seen = new Set<number>();

    for (let i = 0; i < count; i += 1) {
      const base = i * BODY_STRIDE;
      const id = buffer[base + BODY_OFFSET.id] ?? 0;
      const type = Math.round(buffer[base + BODY_OFFSET.type] ?? 0) as BodyType;
      const radius = buffer[base + BODY_OFFSET.radius] ?? 0.5;
      const pos: Vec3 = [
        buffer[base + BODY_OFFSET.x] ?? 0,
        buffer[base + BODY_OFFSET.y] ?? 0,
        buffer[base + BODY_OFFSET.z] ?? 0,
      ];
      const spinRate = buffer[base + BODY_OFFSET.spin] ?? 0;
      seen.add(id);
      const angle = advanceSpin(this.spinAngles.get(id) ?? 0, spinRate, dt);
      this.spinAngles.set(id, angle);

      switch (type) {
        case BodyType.Comet:
          cometIdx = this.writeInstance(this.comets, cometIdx, pos, radius, angle, MAX_COMETS);
          tailIdx = this.writeTail(tailIdx, pos, radius);
          break;
        case BodyType.Asteroid:
          asteroidIdx = this.writeInstance(
            this.asteroids,
            asteroidIdx,
            pos,
            radius,
            angle,
            MAX_ASTEROIDS,
          );
          break;
        case BodyType.Protoplanet:
        case BodyType.Planet:
        default:
          planetIdx = this.writeInstance(this.planets, planetIdx, pos, radius, angle, MAX_PLANETS);
          moonIdx = this.writeMoons(moonIdx, id, type, pos, radius);
          break;
      }
    }

    this.finalize(this.planets, planetIdx);
    this.finalize(this.comets, cometIdx);
    this.finalize(this.asteroids, asteroidIdx);
    this.finalize(this.moons, moonIdx);
    this.finalize(this.tails, tailIdx);

    // Drop spin state for bodies that have left the system.
    for (const id of this.spinAngles.keys()) {
      if (!seen.has(id)) {
        this.spinAngles.delete(id);
      }
    }
  }

  /**
   * The radius a body at `pos` should be DRAWN at: its true (Solar-System
   * scaled) radius, floored so it never falls below `minPixels` on screen. This
   * is a purely visual floor — nothing in the simulation sees it — and it is
   * what lets the bodies be modelled at honest proportions while still being
   * findable when the whole system is in frame.
   */
  private drawnRadius(pos: Vec3, radius: number, minPixels: number): number {
    const camera = this.camera;
    if (camera === null || this.viewportHeightPx <= 0) {
      return Math.max(radius, 0);
    }
    const distance = Math.hypot(
      pos[0] - camera.position.x,
      pos[1] - camera.position.y,
      pos[2] - camera.position.z,
    );
    return apparentRadius(radius, distance, camera.fov, this.viewportHeightPx, minPixels);
  }

  /** Write one body instance (position + axial spin + uniform scale). */
  private writeInstance(
    mesh: THREE.InstancedMesh,
    index: number,
    pos: Vec3,
    radius: number,
    spinAngle: number,
    max: number,
  ): number {
    if (index >= max) {
      return index;
    }
    this.dummy.position.set(pos[0], pos[1], pos[2]);
    this.dummy.rotation.set(0, spinAngle, 0);
    this.dummy.scale.setScalar(this.drawnRadius(pos, radius, MIN_BODY_PIXELS));
    this.dummy.updateMatrix();
    mesh.setMatrixAt(index, this.dummy.matrix);
    return index + 1;
  }

  /**
   * Write the moon instances for one planet: 1–2 small bodies on inclined
   * near-circular orbits around the planet's current position. Deterministic in
   * the body id (stable phases/inclinations) and animated by `moonElapsed`, so
   * moons visibly circle their planet without any kernel support.
   */
  private writeMoons(index: number, id: number, type: BodyType, pos: Vec3, radius: number): number {
    const moonCount = moonCountForBody(id, type);
    let idx = index;
    for (let k = 0; k < moonCount && idx < MAX_MOONS; k += 1) {
      // Stable per-moon seed → phase offset, inclination and a size jitter.
      const seed = Math.sin((Math.abs(id) + 1) * 12.9898 + k * 78.233) * 43758.5453;
      const phase0 = (seed - Math.floor(seed)) * Math.PI * 2;
      const incl = 0.25 + 0.5 * ((Math.abs(id) + k) % 3) * 0.1;
      const orbitRadius = radius * (2.3 + 1.4 * k);
      const angularSpeed = 0.9 / (1 + k) + 0.15 * ((Math.abs(id) + k) % 2);
      const angle = phase0 + this.moonElapsed * angularSpeed;

      // Circular orbit in the planet's local x–z plane, tilted by `incl`.
      const ox = Math.cos(angle) * orbitRadius;
      const oz = Math.sin(angle) * orbitRadius;
      const oy = Math.sin(angle) * orbitRadius * Math.sin(incl);
      const moonPos: Vec3 = [pos[0] + ox, pos[1] + oy, pos[2] + oz];
      // Skip the moon entirely once the planet is far enough away that its own
      // apparent-size floor would swallow the moon's orbit — otherwise moons
      // would be drawn buried inside their planet.
      if (this.drawnRadius(pos, radius, MIN_BODY_PIXELS) > orbitRadius * 0.8) {
        continue;
      }
      const moonRadius = this.drawnRadius(moonPos, radius * (0.16 + 0.05 * k), MIN_MOON_PIXELS);

      this.dummy.position.set(moonPos[0], moonPos[1], moonPos[2]);
      this.dummy.rotation.set(0, angle, 0);
      this.dummy.scale.setScalar(moonRadius);
      this.dummy.updateMatrix();
      this.moons.setMatrixAt(idx, this.dummy.matrix);
      idx += 1;
    }
    return idx;
  }

  /**
   * Set the distance from the star within which comets grow a tail (typically
   * derived from the system's scale by the scene).
   */
  setTailActivationDistance(distance: number): void {
    if (Number.isFinite(distance) && distance > 0) {
      this.tailActivationDistance = distance;
    }
  }

  /**
   * Write one comet-tail instance oriented away from the star — but ONLY when the
   * comet is close enough for solar heating to grow a tail. Far from the star the
   * comet has no tail at all; as it nears the inner system the tail appears and
   * lengthens, always pointing radially away from the star (FR-7).
   */
  private writeTail(index: number, pos: Vec3, radius: number): number {
    if (index >= MAX_COMETS) {
      return index;
    }
    const activation = cometTailActivation(pos, this.starPos, this.tailActivationDistance);
    if (activation <= 0.001) {
      return index; // Too far from the star: no tail.
    }
    const dir = tailDirectionAwayFromStar(pos, this.starPos);
    const len = activation * tailLength(pos, this.starPos, MAX_TAIL_LENGTH);
    if (len <= 0.001) {
      return index;
    }
    this.dummy.position.set(pos[0], pos[1], pos[2]);
    this.dummy.quaternion.setFromUnitVectors(TAIL_AXIS, new THREE.Vector3(dir[0], dir[1], dir[2]));
    // Tail width scales with the comet's DRAWN size so it stays attached to the
    // visible nucleus at any zoom.
    const width = this.drawnRadius(pos, radius, MIN_BODY_PIXELS) * 4 * (0.5 + 0.5 * activation);
    this.dummy.scale.set(width, len, 1);
    this.dummy.updateMatrix();
    this.tails.setMatrixAt(index, this.dummy.matrix);
    return index + 1;
  }

  /** Commit an instanced mesh's active count and flag its matrices for upload. */
  private finalize(mesh: THREE.InstancedMesh, activeCount: number): void {
    mesh.count = activeCount;
    mesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    for (const mesh of [this.planets, this.comets, this.asteroids, this.moons, this.tails]) {
      mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
    this.spinAngles.clear();
  }
}

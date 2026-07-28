// Planet / comet / asteroid renderer (spec §3.2, FR-6, FR-7).
//
// Reads the kernel body buffer each frame and draws bodies as instanced meshes,
// one instanced mesh per kind. Planets spin on their axis (accumulated per body
// id from the buffer's spin rate) around a per-world axial tilt, are tinted from
// `planetLook` so no two look alike, and carry ring systems and moons. Comets
// additionally get an additive tail billboard oriented radially away from the
// star (bodyMath.tailDirectionAwayFromStar).

import * as THREE from 'three';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import type { Vec3 } from '../sim/PhysicsKernel';
import {
  advanceSpin,
  cometTailActivation,
  tailDirectionAwayFromStar,
  tailLength,
} from './bodyMath';
import { MAX_MOONS_PER_PLANET, moonOffset, moonOrbit, planetLook } from './planetLook';
import { apparentRadius } from './screenScale';
import { cometTailFragmentShader, cometTailVertexShader } from './shaders/cometTail';

const MAX_PLANETS = 32;
const MAX_COMETS = 48;
const MAX_ASTEROIDS = 48;
/** Instanced-mesh capacity for planet moons. */
const MAX_MOONS = MAX_PLANETS * MAX_MOONS_PER_PLANET;
/** Instanced-mesh capacity for ring systems (a minority of planets have one). */
const MAX_RINGS = MAX_PLANETS;
/** Sampled points per drawn moon-orbit circle. */
const MOON_ORBIT_SEGMENTS = 64;
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
const MIN_MOON_PIXELS = 3;

/** Ring-system inner/outer radius as a multiple of the planet's drawn radius. */
const RING_INNER = 1.5;
const RING_OUTER = 2.5;

/** Draws all orbiting/visiting bodies read from the kernel body buffer. */
export class BodyRenderer {
  readonly group: THREE.Group;

  private readonly planets: THREE.InstancedMesh;
  private readonly comets: THREE.InstancedMesh;
  private readonly asteroids: THREE.InstancedMesh;
  private readonly moons: THREE.InstancedMesh;
  private readonly rings: THREE.InstancedMesh;
  private readonly tails: THREE.InstancedMesh;
  private readonly tailMaterial: THREE.ShaderMaterial;
  /** Pooled moon-orbit circles, shown with the orbit overlay. */
  private readonly moonOrbitGroup: THREE.Group;
  private readonly moonOrbitPool: THREE.LineLoop[] = [];
  private readonly moonOrbitGeometry: THREE.BufferGeometry;
  private readonly moonOrbitMaterial: THREE.LineBasicMaterial;

  private readonly dummy = new THREE.Object3D();
  private readonly color = new THREE.Color();
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

    // Planets: one instanced sphere, tinted PER INSTANCE from `planetLook` so a
    // rocky world, an ice giant and a gas giant are told apart at a glance.
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
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

    // Ring systems: a flat annulus in the planet's equatorial plane, so it tilts
    // with the world's axis exactly as Saturn's does.
    const ringGeom = new THREE.RingGeometry(RING_INNER, RING_OUTER, 48, 1);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd8c9a8,
      // Ring particles are icy and highly reflective, and a ring plane is often
      // nearly edge-on to the star — so a purely diffuse ring renders as a dark
      // smudge. A little self-illumination keeps it legible from any angle
      // without making it glow.
      emissive: 0x6a5f4a,
      emissiveIntensity: 1,
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.rings = new THREE.InstancedMesh(ringGeom, ringMat, MAX_RINGS);
    this.rings.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rings.count = 0;
    this.rings.frustumCulled = false;
    this.group.add(this.rings);

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

    // Moon-orbit rings: unit circles in the local x–z plane, transformed per
    // moon. Hidden until the orbit overlay is switched on.
    this.moonOrbitGroup = new THREE.Group();
    this.moonOrbitGroup.visible = false;
    this.group.add(this.moonOrbitGroup);
    this.moonOrbitGeometry = createUnitCircleGeometry(MOON_ORBIT_SEGMENTS);
    this.moonOrbitMaterial = new THREE.LineBasicMaterial({
      color: 0x9fb4d8,
      transparent: true,
      // Fainter than a planetary orbit: a moon's path is a detail, not the plot.
      opacity: 0.3,
      depthWrite: false,
    });

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
   * is the number of bodies; `dt` (real seconds) advances axial spin and the
   * moons — pass 0 to freeze them while the simulation is paused. The camera and
   * viewport height are used only to keep astronomically small bodies above a
   * minimum apparent size (see `screenScale.ts`) — positions and distances are
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
    let ringIdx = 0;
    let tailIdx = 0;
    let orbitIdx = 0;
    const seen = new Set<number>();

    for (let i = 0; i < count; i += 1) {
      const base = i * BODY_STRIDE;
      const id = buffer[base + BODY_OFFSET.id] ?? 0;
      const type = Math.round(buffer[base + BODY_OFFSET.type] ?? 0) as BodyType;
      const radius = buffer[base + BODY_OFFSET.radius] ?? 0.5;
      const mass = buffer[base + BODY_OFFSET.mass] ?? 0;
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
        default: {
          const look = planetLook(id, mass);
          const drawn = this.drawnRadius(pos, radius, MIN_BODY_PIXELS);
          planetIdx = this.writePlanet(planetIdx, pos, drawn, angle, look.axialTilt, look.color);
          if (look.hasRings) {
            ringIdx = this.writeRing(ringIdx, pos, drawn, look.axialTilt);
          }
          const moons = this.writeMoons(moonIdx, orbitIdx, id, look.moonCount, pos, drawn);
          moonIdx = moons.moonIndex;
          orbitIdx = moons.orbitIndex;
          break;
        }
      }
    }

    this.finalize(this.planets, planetIdx);
    this.finalize(this.comets, cometIdx);
    this.finalize(this.asteroids, asteroidIdx);
    this.finalize(this.moons, moonIdx);
    this.finalize(this.rings, ringIdx);
    this.finalize(this.tails, tailIdx);
    if (this.planets.instanceColor !== null) {
      this.planets.instanceColor.needsUpdate = true;
    }
    // Hide any pooled moon-orbit circles left over from a previous frame.
    for (let i = orbitIdx; i < this.moonOrbitPool.length; i += 1) {
      this.moonOrbitPool[i]!.visible = false;
    }

    // Drop spin state for bodies that have left the system.
    for (const id of this.spinAngles.keys()) {
      if (!seen.has(id)) {
        this.spinAngles.delete(id);
      }
    }
  }

  /** Show or hide the moon-orbit circles (follows the orbit overlay toggle). */
  setMoonOrbitsVisible(visible: boolean): void {
    this.moonOrbitGroup.visible = visible;
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

  /** Write one planet instance: tilted axis, own spin phase and own colour. */
  private writePlanet(
    index: number,
    pos: Vec3,
    drawnRadius: number,
    spinAngle: number,
    axialTilt: number,
    color: { r: number; g: number; b: number },
  ): number {
    if (index >= MAX_PLANETS) {
      return index;
    }
    this.dummy.position.set(pos[0], pos[1], pos[2]);
    // Tilt the pole, THEN spin about it — the order matters, or the world wobbles
    // instead of rotating.
    this.dummy.rotation.set(axialTilt, spinAngle, 0, 'ZXY');
    this.dummy.scale.setScalar(drawnRadius);
    this.dummy.updateMatrix();
    this.planets.setMatrixAt(index, this.dummy.matrix);
    this.color.setRGB(color.r, color.g, color.b);
    this.planets.setColorAt(index, this.color);
    return index + 1;
  }

  /** Write one ring system, lying in its planet's tilted equatorial plane. */
  private writeRing(index: number, pos: Vec3, drawnRadius: number, axialTilt: number): number {
    if (index >= MAX_RINGS) {
      return index;
    }
    this.dummy.position.set(pos[0], pos[1], pos[2]);
    this.dummy.rotation.set(axialTilt, 0, 0, 'ZXY');
    this.dummy.scale.setScalar(drawnRadius);
    this.dummy.updateMatrix();
    this.rings.setMatrixAt(index, this.dummy.matrix);
    return index + 1;
  }

  /**
   * Write the moons of one planet, plus their orbit circles.
   *
   * Everything is sized off the planet's DRAWN radius rather than its true one,
   * which is what makes moons visible at all: bodies are floored to a minimum
   * apparent size, so a moon placed a couple of TRUE radii out sat inside the
   * drawn planet at every zoom level and was previously skipped entirely.
   */
  private writeMoons(
    moonIndex: number,
    orbitIndex: number,
    id: number,
    moonCount: number,
    pos: Vec3,
    drawnRadius: number,
  ): { moonIndex: number; orbitIndex: number } {
    let mIdx = moonIndex;
    let oIdx = orbitIndex;
    for (let k = 0; k < moonCount && mIdx < MAX_MOONS; k += 1) {
      const orbit = moonOrbit(id, k);
      const offset = moonOffset(orbit, this.moonElapsed);
      const orbitRadius = drawnRadius * orbit.radiusFactor;
      const moonPos: Vec3 = [
        pos[0] + offset[0] * drawnRadius,
        pos[1] + offset[1] * drawnRadius,
        pos[2] + offset[2] * drawnRadius,
      ];
      const moonRadius = this.drawnRadius(moonPos, drawnRadius * orbit.sizeFactor, MIN_MOON_PIXELS);

      this.dummy.position.set(moonPos[0], moonPos[1], moonPos[2]);
      this.dummy.rotation.set(0, orbit.phase + this.moonElapsed * orbit.angularSpeed, 0);
      this.dummy.scale.setScalar(moonRadius);
      this.dummy.updateMatrix();
      this.moons.setMatrixAt(mIdx, this.dummy.matrix);
      mIdx += 1;

      // The matching orbit circle: same centre, same radius, same tilt — so the
      // moon is always drawn ON the line the overlay shows.
      if (this.moonOrbitGroup.visible) {
        const line = this.moonOrbitLine(oIdx);
        line.position.set(pos[0], pos[1], pos[2]);
        line.rotation.set(orbit.tilt, 0, 0, 'ZXY');
        line.scale.setScalar(orbitRadius);
        line.visible = true;
        oIdx += 1;
      }
    }
    return { moonIndex: mIdx, orbitIndex: oIdx };
  }

  /** Get (or lazily create) the pooled moon-orbit circle at `index`. */
  private moonOrbitLine(index: number): THREE.LineLoop {
    const existing = this.moonOrbitPool[index];
    if (existing !== undefined) {
      return existing;
    }
    const line = new THREE.LineLoop(this.moonOrbitGeometry, this.moonOrbitMaterial);
    line.frustumCulled = false;
    this.moonOrbitPool[index] = line;
    this.moonOrbitGroup.add(line);
    return line;
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
    for (const mesh of [
      this.planets,
      this.comets,
      this.asteroids,
      this.moons,
      this.rings,
      this.tails,
    ]) {
      mesh.geometry.dispose();
      const mat = mesh.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else {
        mat.dispose();
      }
    }
    for (const line of this.moonOrbitPool) {
      this.moonOrbitGroup.remove(line);
    }
    this.moonOrbitPool.length = 0;
    this.moonOrbitGeometry.dispose();
    this.moonOrbitMaterial.dispose();
    this.spinAngles.clear();
  }
}

/** A unit-radius circle in the local x–z plane, for the moon-orbit line loops. */
function createUnitCircleGeometry(segments: number): THREE.BufferGeometry {
  const positions = new Float32Array(segments * 3);
  for (let i = 0; i < segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    positions[i * 3] = Math.cos(a);
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(a);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geometry;
}

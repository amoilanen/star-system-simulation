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
import { advanceSpin, tailDirectionAwayFromStar, tailLength } from './bodyMath';
import { cometTailFragmentShader, cometTailVertexShader } from './shaders/cometTail';

const MAX_PLANETS = 32;
const MAX_COMETS = 48;
const MAX_ASTEROIDS = 48;
/** Local +Y axis a comet tail plane is built along, rotated toward the tail. */
const TAIL_AXIS = new THREE.Vector3(0, 1, 0);
/** Maximum comet-tail length in scene units. */
const MAX_TAIL_LENGTH = 12;

/** Draws all orbiting/visiting bodies read from the kernel body buffer. */
export class BodyRenderer {
  readonly group: THREE.Group;

  private readonly planets: THREE.InstancedMesh;
  private readonly comets: THREE.InstancedMesh;
  private readonly asteroids: THREE.InstancedMesh;
  private readonly tails: THREE.InstancedMesh;
  private readonly tailMaterial: THREE.ShaderMaterial;

  private readonly dummy = new THREE.Object3D();
  /** Per-body accumulated axial spin angle, keyed by body id (FR-6). */
  private readonly spinAngles = new Map<number, number>();
  private readonly starPos: Vec3 = [0, 0, 0];

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

    const cometMat = new THREE.MeshBasicMaterial({ color: 0xcfeaff });
    this.comets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 12),
      cometMat,
      MAX_COMETS,
    );
    this.comets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.comets.count = 0;
    this.comets.frustumCulled = false;
    this.group.add(this.comets);

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
   * is the number of bodies; `dt` (real seconds) advances axial spin.
   */
  update(buffer: Float32Array, count: number, dt: number): void {
    let planetIdx = 0;
    let cometIdx = 0;
    let asteroidIdx = 0;
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
          break;
      }
    }

    this.finalize(this.planets, planetIdx);
    this.finalize(this.comets, cometIdx);
    this.finalize(this.asteroids, asteroidIdx);
    this.finalize(this.tails, tailIdx);

    // Drop spin state for bodies that have left the system.
    for (const id of this.spinAngles.keys()) {
      if (!seen.has(id)) {
        this.spinAngles.delete(id);
      }
    }
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
    this.dummy.scale.setScalar(Math.max(radius, 0.05));
    this.dummy.updateMatrix();
    mesh.setMatrixAt(index, this.dummy.matrix);
    return index + 1;
  }

  /** Write one comet-tail instance oriented away from the star. */
  private writeTail(index: number, pos: Vec3, radius: number): number {
    if (index >= MAX_COMETS) {
      return index;
    }
    const dir = tailDirectionAwayFromStar(pos, this.starPos);
    const len = Math.max(radius * 2, tailLength(pos, this.starPos, MAX_TAIL_LENGTH));
    this.dummy.position.set(pos[0], pos[1], pos[2]);
    this.dummy.quaternion.setFromUnitVectors(TAIL_AXIS, new THREE.Vector3(dir[0], dir[1], dir[2]));
    this.dummy.scale.set(Math.max(radius * 1.5, 0.3), len, 1);
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
    for (const mesh of [this.planets, this.comets, this.asteroids, this.tails]) {
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

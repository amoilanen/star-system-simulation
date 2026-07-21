// Orbit camera with zoom + smooth focus/follow (spec §3.6, FR-8).
//
// Wraps Three.js `OrbitControls` for free orbit + mouse zoom, and adds:
//   - programmatic zoom in/out (HUD buttons),
//   - smooth center/focus on a body (star or any planet) that frames it, and
//   - follow: keep a moving body centered while the user still orbits/zooms.
// The pure framing/damping math lives in cameraMath.ts (unit-tested); this class
// only applies it to the Three.js camera each frame.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { Vec3 } from '../sim/PhysicsKernel';
import { dampVec3, frameDistance } from './cameraMath';

/** Supplies the live world position of a followed body, or null to stop. */
export type FollowProvider = () => Vec3 | null;

/** Damping rate for smooth focus target motion (larger = snappier). */
const FOCUS_LAMBDA = 4;

/** Orbit camera controller with zoom, focus and follow (FR-8). */
export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;

  private followProvider: FollowProvider | null = null;
  /** The smoothed look-at target the camera orbits around. */
  private readonly smoothedTarget: Vec3 = [0, 0, 0];

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 5000;
  }

  /**
   * Smoothly center and frame a body at `position` of the given `radius`. Stops
   * any active follow unless `follow` supplies the body's live position.
   */
  focusOn(position: Vec3, radius: number, follow: FollowProvider | null = null): void {
    this.followProvider = follow;
    const dist = frameDistance(radius, this.camera.fov, 2.2);
    // Preserve the current viewing direction; just re-place along it.
    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();
    if (dir.lengthSq() < 1e-8) {
      dir.set(0, 0.4, 1).normalize();
    }
    this.controls.target.set(position[0], position[1], position[2]);
    this.smoothedTarget[0] = position[0];
    this.smoothedTarget[1] = position[1];
    this.smoothedTarget[2] = position[2];
    this.camera.position.copy(this.controls.target).addScaledVector(dir, dist);
  }

  /** Follow a moving body, keeping the current orbit offset (FR-8). */
  setFollow(follow: FollowProvider | null): void {
    this.followProvider = follow;
  }

  /** Stop following; the camera stays where it is and keeps free orbit. */
  clearFollow(): void {
    this.followProvider = null;
  }

  /** Programmatic zoom in by a step (HUD control). */
  zoomIn(factor = 0.8): void {
    this.dolly(factor);
  }

  /** Programmatic zoom out by a step (HUD control). */
  zoomOut(factor = 1.25): void {
    this.dolly(factor);
  }

  /** Scale the camera's distance to the target by `factor`, clamped. */
  private dolly(factor: number): void {
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
    const dist = THREE.MathUtils.clamp(
      offset.length() * factor,
      this.controls.minDistance,
      this.controls.maxDistance,
    );
    offset.setLength(dist);
    this.camera.position.copy(this.controls.target).add(offset);
  }

  /**
   * Advance the controller by real `dt`. When following, smoothly moves the
   * orbit target toward the body's live position and carries the camera by the
   * same delta so the user's orbit offset is preserved.
   */
  update(dt: number): void {
    const provider = this.followProvider;
    if (provider !== null) {
      const target = provider();
      if (target !== null) {
        const prev: Vec3 = [this.controls.target.x, this.controls.target.y, this.controls.target.z];
        const next = dampVec3(prev, target, FOCUS_LAMBDA, dt);
        const delta = new THREE.Vector3(next[0] - prev[0], next[1] - prev[1], next[2] - prev[2]);
        this.controls.target.set(next[0], next[1], next[2]);
        this.camera.position.add(delta);
        this.smoothedTarget[0] = next[0];
        this.smoothedTarget[1] = next[1];
        this.smoothedTarget[2] = next[2];
      }
    }
    this.controls.update();
  }

  dispose(): void {
    this.controls.dispose();
  }
}

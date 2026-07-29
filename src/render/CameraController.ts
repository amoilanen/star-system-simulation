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
import { followStep, frameDistance, nearPlaneFor } from './cameraMath';

/** Supplies the live world position of a followed body, or null to stop. */
export type FollowProvider = () => Vec3 | null;

/** Damping rate for smooth focus target motion (larger = snappier). */
const FOCUS_LAMBDA = 4;

/** Orbit camera controller with zoom, focus and follow (FR-8). */
export class CameraController {
  readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;

  private followProvider: FollowProvider | null = null;
  /**
   * Body world-position recorded at the end of the last `update` call.
   * Used as `prevBodyPos` for the feed-forward follow step (spec §3.6).
   * `null` means "not yet initialised for this follow session" — on the
   * first update after a reset the body delta is treated as zero and only
   * residual damping applies (converges from the current camera position
   * to the body's initial location).
   */
  private lastFollowPos: Vec3 | null = null;
  /** The smoothed look-at target the camera orbits around. */
  private readonly smoothedTarget: Vec3 = [0, 0, 0];

  constructor(camera: THREE.PerspectiveCamera, domElement: HTMLElement) {
    this.camera = camera;
    this.controls = new OrbitControls(camera, domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    // Small enough to fly right up to a true-scale Earth-sized planet
    // (~4.26e-5 AU radius — see `bodyRadiusFromMass`).
    this.controls.minDistance = 5e-4;
    this.controls.maxDistance = 5000;
  }

  /**
   * Smoothly center and frame a body at `position` of the given `radius`. Stops
   * any active follow unless `follow` supplies the body's live position.
   */
  focusOn(position: Vec3, radius: number, follow: FollowProvider | null = null): void {
    this.followProvider = follow;
    // Seed lastFollowPos so the first update frame carries zero delta (the
    // camera target is already placed at `position` just below, so the
    // feed-forward term is (position − position) = 0 and only residual
    // damping acts on any subsequent initial-transition offset).
    this.lastFollowPos = [position[0], position[1], position[2]];
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
    // Reset so the first update after a new follow provider initialises
    // lastFollowPos from the body's current position (delta = 0 on frame 1).
    this.lastFollowPos = null;
  }

  /** Stop following; the camera stays where it is and keeps free orbit. */
  clearFollow(): void {
    this.followProvider = null;
    this.lastFollowPos = null;
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
   * Advance the controller by real `dt`. When following, uses a feed-forward
   * step (spec §3.6) to translate both the orbit target and the camera position
   * by the body's full per-frame delta, then damps any remaining residual
   * offset.  This keeps the body in frame at any simulation speed while
   * preserving the user's current zoom and viewing angle.
   */
  update(dt: number): void {
    const provider = this.followProvider;
    if (provider !== null) {
      const bodyPos = provider();
      if (bodyPos !== null) {
        // On the first frame after a follow reset, treat prevBodyPos as the
        // current body position so the feed-forward delta is zero and only
        // the residual damping (initial-offset convergence) acts.
        const prevBodyPos: Vec3 = this.lastFollowPos ?? [bodyPos[0], bodyPos[1], bodyPos[2]];
        const prevTarget: Vec3 = [
          this.controls.target.x,
          this.controls.target.y,
          this.controls.target.z,
        ];
        const next = followStep(prevTarget, bodyPos, prevBodyPos, FOCUS_LAMBDA, dt);
        const delta = new THREE.Vector3(
          next[0] - prevTarget[0],
          next[1] - prevTarget[1],
          next[2] - prevTarget[2],
        );
        // Translate both target and camera by the same delta to preserve the
        // user's orbit offset (zoom level and viewing angle are unchanged).
        this.controls.target.set(next[0], next[1], next[2]);
        this.camera.position.add(delta);
        this.smoothedTarget[0] = next[0];
        this.smoothedTarget[1] = next[1];
        this.smoothedTarget[2] = next[2];
        // Record the body's current position for the next frame's feed-forward.
        this.lastFollowPos = [bodyPos[0], bodyPos[1], bodyPos[2]];
      }
    }
    this.controls.update();
    this.syncNearPlane();
  }

  /**
   * Keep the near-clip plane below the current viewing distance so a true-scale
   * body the camera has flown up to is never clipped away (see
   * {@link nearPlaneFor}). Runs after `controls.update()` so it sees the
   * distance OrbitControls actually settled on.
   */
  private syncNearPlane(): void {
    const distance = this.camera.position.distanceTo(this.controls.target);
    const near = nearPlaneFor(distance);
    if (this.camera.near !== near) {
      this.camera.near = near;
      this.camera.updateProjectionMatrix();
    }
  }

  dispose(): void {
    this.controls.dispose();
  }
}

// Scene orchestration + render-loop hookup (spec §2 data-flow, §3.2, D6).
//
// Owns the Three.js renderer, scene, camera and every sub-renderer (star,
// particle field, bodies), plus the bloom/tone-mapping composer and the orbit
// camera. Each frame it reads the kernel's flat state buffers (RenderState) and
// pushes them into the GPU objects, then renders through the post-processing
// pipeline. It holds no simulation logic — buffers in, pixels out.

import * as THREE from 'three';
import { LifecycleStage, RemnantType } from '../config/fateModel';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import type { Vec3 } from '../sim/PhysicsKernel';
import { BodyRenderer } from './BodyRenderer';
import { CameraController } from './CameraController';
import { ParticleField } from './ParticleField';
import { StarRenderer } from './StarRenderer';
import { starAppearance } from './starVisual';
import { createPostProcessing, type PostProcessing } from './postprocess';

/** Per-frame simulation state the renderer consumes (read-only, buffers in). */
export interface RenderState {
  /** Interleaved particle buffer (PARTICLE_STRIDE lanes/particle). */
  particles: Float32Array;
  /** Number of active particles in {@link RenderState.particles}. */
  particleCount: number;
  /** Interleaved body buffer (BODY_STRIDE lanes/body). */
  bodies: Float32Array;
  /** Number of active bodies in {@link RenderState.bodies}. */
  bodyCount: number;
  /** Current lifecycle stage (drives star appearance). */
  stage: LifecycleStage;
  /** Normalized progress 0..1 through the current stage (smooth transitions). */
  stageProgress: number;
  /** Cloud mass in M☉ (drives main-sequence temperature/radius). */
  mass: number;
  /** Terminal remnant kind, or null before the remnant stage. */
  remnant: RemnantType | null;
}

/** Options for {@link SceneManager}. */
export interface SceneManagerOptions {
  /** GPU particle capacity; must be ≥ the kernel's particle count. */
  maxParticles: number;
}

/** A callback returning the next frame's {@link RenderState}, or null to idle. */
export type FrameProvider = (realDtSeconds: number) => RenderState | null;

/** Result of a click pick: the star itself, or a specific celestial body. */
export type ScenePick =
  | { kind: 'star' }
  | { kind: 'body'; id: number; type: BodyType; radius: number; captured: boolean };

/** Nearest non-negative ray-sphere intersection distance, or null if it misses. */
function rayHitsSphere(
  origin: THREE.Vector3,
  dir: THREE.Vector3,
  center: Vec3,
  radius: number,
): number | null {
  const ox = origin.x - center[0];
  const oy = origin.y - center[1];
  const oz = origin.z - center[2];
  const b = ox * dir.x + oy * dir.y + oz * dir.z;
  const c = ox * ox + oy * oy + oz * oz - radius * radius;
  const disc = b * b - c;
  if (disc < 0) {
    return null;
  }
  const sq = Math.sqrt(disc);
  const near = -b - sq;
  if (near >= 0) {
    return near;
  }
  const far = -b + sq;
  return far >= 0 ? far : null;
}

/** Orchestrates the whole Three.js render for one simulation run. */
export class SceneManager {
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly cameraController: CameraController;

  private readonly container: HTMLElement;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly starRenderer: StarRenderer;
  private readonly particleField: ParticleField;
  private readonly bodyRenderer: BodyRenderer;
  private readonly post: PostProcessing;
  private readonly starLight: THREE.PointLight;
  private readonly resizeHandler: () => void;

  private lastBodies: Float32Array = new Float32Array(0);
  private lastBodyCount = 0;
  private lastStarRadius = 1;
  private dustBrightness = 1;

  private frameProvider: FrameProvider | null = null;
  private rafId: number | null = null;
  private lastFrameTime = 0;

  constructor(container: HTMLElement, options: SceneManagerOptions) {
    this.container = container;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x01010a);
    this.scene.add(this.createStarfield());

    this.camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 20000);
    this.camera.position.set(0, 20, 60);

    this.cameraController = new CameraController(this.camera, this.renderer.domElement);

    // Lighting: the star illuminates the planets; a faint ambient lifts shadows.
    this.starLight = new THREE.PointLight(0xffffff, 3, 0, 0.0);
    this.scene.add(this.starLight);
    this.scene.add(new THREE.AmbientLight(0x223344, 0.4));

    this.starRenderer = new StarRenderer();
    this.scene.add(this.starRenderer.group);

    this.particleField = new ParticleField(options.maxParticles, this.renderer.getPixelRatio());
    this.scene.add(this.particleField.points);

    this.bodyRenderer = new BodyRenderer();
    this.scene.add(this.bodyRenderer.group);

    this.post = createPostProcessing(this.renderer, this.scene, this.camera, width, height);

    this.resizeHandler = () => this.resize();
    window.addEventListener('resize', this.resizeHandler);
  }

  /** Render a single frame from the given state and elapsed real time. */
  render(state: RenderState, realDtSeconds: number): void {
    const dt = Number.isFinite(realDtSeconds) && realDtSeconds > 0 ? realDtSeconds : 0;

    this.particleField.update(state.particles, state.particleCount);

    // Fade the birth dust once the star ignites so residual cloud stops
    // competing with the star system; flash it bright again for the supernova
    // ejecta at death. Eased toward the target so transitions never pop.
    const targetDust = dustBrightnessForStage(state.stage, state.stageProgress);
    const ease = dt > 0 ? Math.min(1, dt * 1.5) : 1;
    this.dustBrightness += (targetDust - this.dustBrightness) * ease;
    this.particleField.setBrightness(this.dustBrightness);

    this.bodyRenderer.update(state.bodies, state.bodyCount, dt);

    const appearance = starAppearance(state.stage, state.mass, state.stageProgress, state.remnant);
    this.starRenderer.update(appearance, dt, this.camera);
    this.starLight.visible = appearance.visible;
    this.starLight.color.setRGB(appearance.color.r, appearance.color.g, appearance.color.b);
    this.starLight.intensity = appearance.visible ? 2 + appearance.glow * 2 : 0;
    this.lastStarRadius = appearance.radius || 1;

    // Cache body state so focus/follow can locate bodies by id between frames.
    this.lastBodies = state.bodies;
    this.lastBodyCount = state.bodyCount;

    this.cameraController.update(dt);
    this.post.render(dt);
  }

  /**
   * Start an internal requestAnimationFrame loop that pulls a {@link RenderState}
   * from `provider` each frame. The app shell may instead drive {@link render}
   * directly; use whichever fits. Safe to call once; ignored if already running.
   */
  start(provider: FrameProvider): void {
    if (this.rafId !== null) {
      return;
    }
    this.frameProvider = provider;
    this.lastFrameTime = performance.now();
    const loop = (now: number): void => {
      this.rafId = requestAnimationFrame(loop);
      const dt = (now - this.lastFrameTime) / 1000;
      this.lastFrameTime = now;
      const state = this.frameProvider?.(dt) ?? null;
      if (state !== null) {
        this.render(state, dt);
      }
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** Stop the internal render loop started by {@link start}. */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.frameProvider = null;
  }

  /** Smoothly center and frame the star at the scene origin (FR-8). */
  focusOnStar(): void {
    this.cameraController.focusOn([0, 0, 0], this.lastStarRadius, null);
  }

  /** Smoothly center and follow a body by id (FR-8); no-op if it's gone. */
  focusOnBody(id: number): void {
    const found = this.findBody(id);
    if (found === null) {
      return;
    }
    this.cameraController.focusOn(found.position, found.radius, () => {
      const live = this.findBody(id);
      return live === null ? null : live.position;
    });
  }

  /** The canvas element, for attaching input listeners (e.g. click-to-inspect). */
  get domElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  /**
   * Pick the star or nearest celestial body under a client-space point (e.g. a
   * mouse click), via ray-sphere tests against the cached body positions. Pick
   * radii are enlarged so small bodies are easy to hit. Returns null on a miss.
   */
  pickAtClient(clientX: number, clientY: number): ScenePick | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return null;
    }
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.camera);
    const { origin, direction } = raycaster.ray;

    let best: ScenePick | null = null;
    let bestT = Infinity;

    // The star sits at the origin. Its bright core is small but its glow halo
    // reads much larger, so use a generous pick radius so clicking the star (or
    // its glow) reliably selects it.
    const starHit = rayHitsSphere(
      origin,
      direction,
      [0, 0, 0],
      Math.max(this.lastStarRadius * 2.5, 4),
    );
    if (starHit !== null && starHit < bestT) {
      bestT = starHit;
      best = { kind: 'star' };
    }

    for (let i = 0; i < this.lastBodyCount; i += 1) {
      const base = i * BODY_STRIDE;
      const position: Vec3 = [
        this.lastBodies[base + BODY_OFFSET.x] ?? 0,
        this.lastBodies[base + BODY_OFFSET.y] ?? 0,
        this.lastBodies[base + BODY_OFFSET.z] ?? 0,
      ];
      const radius = this.lastBodies[base + BODY_OFFSET.radius] ?? 0.5;
      const t = rayHitsSphere(origin, direction, position, Math.max(radius * 2.2, 1.4));
      if (t !== null && t < bestT) {
        bestT = t;
        best = {
          kind: 'body',
          id: this.lastBodies[base + BODY_OFFSET.id] ?? -1,
          type: (this.lastBodies[base + BODY_OFFSET.type] ?? BodyType.Planet) as BodyType,
          radius,
          captured: (this.lastBodies[base + BODY_OFFSET.captured] ?? 0) !== 0,
        };
      }
    }
    return best;
  }

  /** Locate a body's current position + radius in the cached body buffer. */
  private findBody(id: number): { position: Vec3; radius: number } | null {
    for (let i = 0; i < this.lastBodyCount; i += 1) {
      const base = i * BODY_STRIDE;
      if ((this.lastBodies[base + BODY_OFFSET.id] ?? -1) === id) {
        return {
          position: [
            this.lastBodies[base + BODY_OFFSET.x] ?? 0,
            this.lastBodies[base + BODY_OFFSET.y] ?? 0,
            this.lastBodies[base + BODY_OFFSET.z] ?? 0,
          ],
          radius: this.lastBodies[base + BODY_OFFSET.radius] ?? 0.5,
        };
      }
    }
    return null;
  }

  /** Resize the renderer + composer to the container's current size. */
  resize(): void {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.particleField.setPixelRatio(this.renderer.getPixelRatio());
    this.post.setSize(width, height);
  }

  /** Release all GPU resources and listeners; unusable afterwards. */
  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
    this.cameraController.dispose();
    this.starRenderer.dispose();
    this.particleField.dispose();
    this.bodyRenderer.dispose();
    this.post.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }

  /**
   * A faint static starfield backdrop for depth (purely decorative).
   *
   * Brightness is deliberately kept low and per-star varied so the backdrop
   * sits *below* the bloom threshold ({@link createPostProcessing}, ~0.2): the
   * distant stars read as subtle pinpricks and never bloom into glowing blobs
   * that compete with the actual star system in the foreground.
   */
  private createStarfield(): THREE.Points {
    const count = 1000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      // Distribute on a large sphere shell far behind the action.
      const r = 6000 + Math.random() * 3000;
      const cosT = 2 * Math.random() - 1;
      const sinT = Math.sqrt(Math.max(0, 1 - cosT * cosT));
      const phi = 2 * Math.PI * Math.random();
      positions[i * 3] = r * sinT * Math.cos(phi);
      positions[i * 3 + 1] = r * sinT * Math.sin(phi);
      positions[i * 3 + 2] = r * cosT;

      // Cubed random skews the population very faint, staying well under the
      // bloom threshold (~0.2) so distant stars read as subtle pinpricks rather
      // than glowing blobs. Cool blue-white through faint gold tint for variety.
      const brightness = 0.025 + Math.pow(Math.random(), 3) * 0.075;
      const warmth = Math.random();
      colors[i * 3] = brightness * (0.75 + 0.25 * warmth);
      colors[i * 3 + 1] = brightness * (0.8 + 0.1 * warmth);
      colors[i * 3 + 2] = brightness * (1.0 - 0.2 * warmth);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 1,
      sizeAttenuation: false,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const points = new THREE.Points(geom, mat);
    points.frustumCulled = false;
    return points;
  }
}

/**
 * Target brightness (0..1) for the dust/ejecta particle cloud at a given
 * lifecycle stage. The birth cloud is fully lit while it collapses, fades out as
 * the star ignites and clears its surroundings, stays dim through the star's
 * life, then flashes bright again as supernova ejecta before settling faint
 * around the remnant.
 */
function dustBrightnessForStage(stage: LifecycleStage, progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  switch (stage) {
    case LifecycleStage.DustCloud:
    case LifecycleStage.ProtostarCoalescence:
      return 1;
    case LifecycleStage.FusionIgnition:
      // Thin the surroundings as fusion switches on, but keep the residual
      // circumstellar dust/disk clearly visible around the young star.
      return 1 - 0.55 * clamped;
    case LifecycleStage.MainSequence:
    case LifecycleStage.RedGiant:
      return 0.45;
    case LifecycleStage.Death:
      // Supernova / envelope ejection re-illuminates the cloud.
      return 1;
    case LifecycleStage.Remnant:
      return 0.45;
    default:
      return 0.45;
  }
}

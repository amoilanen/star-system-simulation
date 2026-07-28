// Screen-space label overlay for the star and every orbiting body.
//
// Bodies are drawn at realistic (i.e. small) proportions relative to the star,
// which makes them hard to spot — so each object carries a floating label with
// its name and live physical statistics (mass, temperature, orbital velocity;
// the star additionally shows its CORE temperature). Labels are plain DOM nodes
// positioned each frame by projecting the object's world position through the
// camera, which keeps text crisp and fully localizable.
//
// The label CONTENT is computed by the pure `ui/labelInfo` module; this class
// only handles projection, DOM pooling and visibility.

import * as THREE from 'three';
import type { LifecycleStage, RemnantType } from '../config/fateModel';
import type { Locale } from '../config/SimulationConfig';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import {
  bodyLabelContent,
  starLabelContent,
  starSurfaceTemperatureK,
  type LabelContent,
} from '../ui/labelInfo';

/** Options for {@link BodyLabels}. */
export interface BodyLabelsOptions {
  /** Element the labels are appended to (must be positioned, pointer-events none). */
  container: HTMLElement;
  /** Active locale for all label text. */
  locale: Locale;
  /** i18n registry; defaults to the shared app instance. */
  i18n?: I18n;
}

/** Maximum simultaneously rendered labels (pooled DOM nodes). */
const MAX_LABELS = 48;

/** Beyond this normalized depth a label is hidden (behind camera / far away). */
const MAX_LABEL_DISTANCE = 900;

/** One pooled label element with its sub-nodes. */
interface LabelNode {
  root: HTMLDivElement;
  title: HTMLDivElement;
  stats: HTMLDivElement;
  /** Last rendered content signature, to skip redundant DOM writes. */
  signature: string;
}

/**
 * Renders floating, localized labels for the star and all bodies. Call
 * {@link update} once per frame with the current render state and camera.
 */
export class BodyLabels {
  private readonly container: HTMLElement;
  private readonly i18n: I18n;
  private locale: Locale;
  private readonly pool: LabelNode[] = [];
  private readonly projected = new THREE.Vector3();
  private enabled = true;

  constructor(options: BodyLabelsOptions) {
    this.container = options.container;
    this.i18n = options.i18n ?? sharedI18n;
    this.locale = options.locale;
  }

  /** Toggle the whole overlay (labels are hidden but kept allocated). */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      for (const node of this.pool) {
        node.root.style.display = 'none';
      }
    }
  }

  /** Whether labels are currently shown. */
  get isEnabled(): boolean {
    return this.enabled;
  }

  /** Switch locale; the next {@link update} re-renders all text. */
  setLocale(locale: Locale): void {
    this.locale = locale;
    // Invalidate cached signatures so every label re-translates.
    for (const node of this.pool) {
      node.signature = '';
    }
  }

  /**
   * Reposition and re-fill the labels for this frame.
   *
   * `bodies` is the interleaved kernel body buffer; `starRadius` is the star's
   * current scene radius (labels sit just above the object).
   */
  update(
    bodies: Float32Array,
    bodyCount: number,
    camera: THREE.PerspectiveCamera,
    canvas: HTMLElement,
    stage: LifecycleStage,
    starMass: number,
    remnant: RemnantType | null,
    starRadius: number,
  ): void {
    if (!this.enabled) {
      return;
    }
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) {
      return;
    }

    let index = 0;
    // --- The star itself, at the scene origin -------------------------------
    index = this.place(
      index,
      [0, Math.max(starRadius, 0.4), 0],
      starLabelContent(stage, starMass, remnant),
      camera,
      width,
      height,
      true,
    );

    // --- Every orbiting / visiting body -------------------------------------
    const starTeff = starSurfaceTemperatureK(stage, starMass, remnant);
    for (let i = 0; i < bodyCount && index < MAX_LABELS; i += 1) {
      const base = i * BODY_STRIDE;
      const x = bodies[base + BODY_OFFSET.x] ?? 0;
      const y = bodies[base + BODY_OFFSET.y] ?? 0;
      const z = bodies[base + BODY_OFFSET.z] ?? 0;
      const radius = bodies[base + BODY_OFFSET.radius] ?? 0.1;
      const content = bodyLabelContent(
        {
          id: Math.round(bodies[base + BODY_OFFSET.id] ?? 0),
          type: Math.round(bodies[base + BODY_OFFSET.type] ?? 0) as BodyType,
          mass: bodies[base + BODY_OFFSET.mass] ?? 0,
          radius,
          distanceScene: Math.hypot(x, y, z),
        },
        starMass,
        starTeff,
        stage,
        remnant,
      );
      index = this.place(index, [x, y + radius + 0.25, z], content, camera, width, height, false);
    }

    // Hide any unused pooled nodes.
    for (let i = index; i < this.pool.length; i += 1) {
      this.pool[i]!.root.style.display = 'none';
    }
  }

  /** Project one object and fill/position its label; returns the next index. */
  private place(
    index: number,
    world: [number, number, number],
    content: LabelContent,
    camera: THREE.PerspectiveCamera,
    width: number,
    height: number,
    isStar: boolean,
  ): number {
    if (index >= MAX_LABELS) {
      return index;
    }
    this.projected.set(world[0], world[1], world[2]);
    const distance = this.projected.distanceTo(camera.position);
    this.projected.project(camera);

    const node = this.node(index);
    // z > 1 means the point is behind the camera.
    const offscreen =
      this.projected.z > 1 ||
      this.projected.x < -1.1 ||
      this.projected.x > 1.1 ||
      this.projected.y < -1.1 ||
      this.projected.y > 1.1 ||
      distance > MAX_LABEL_DISTANCE;
    if (offscreen) {
      node.root.style.display = 'none';
      return index + 1;
    }

    const px = (this.projected.x * 0.5 + 0.5) * width;
    const py = (-this.projected.y * 0.5 + 0.5) * height;
    node.root.style.display = '';
    node.root.style.transform = `translate(-50%, -100%) translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
    node.root.classList.toggle('body-label--star', isStar);

    this.fill(node, content);
    return index + 1;
  }

  /** Write the localized content into a node, skipping redundant DOM work. */
  private fill(node: LabelNode, content: LabelContent): void {
    const signature = `${content.titleId}|${content.titleValues?.id ?? ''}|${content.stats
      .map((s) => `${s.labelId}=${s.value}`)
      .join(',')}`;
    if (node.signature === signature) {
      return;
    }
    node.signature = signature;

    node.title.textContent = this.i18n.translate(
      this.locale,
      content.titleId,
      content.titleValues ?? {},
    );
    node.stats.replaceChildren();
    for (const stat of content.stats) {
      const row = document.createElement('div');
      row.className = 'body-label__stat';
      const key = document.createElement('span');
      key.className = 'body-label__stat-key';
      key.textContent = this.i18n.translate(this.locale, stat.labelId);
      const value = document.createElement('span');
      value.className = 'body-label__stat-value';
      value.textContent = stat.value;
      row.append(key, value);
      node.stats.appendChild(row);
    }
  }

  /** Get (or lazily create) the pooled label node at `index`. */
  private node(index: number): LabelNode {
    const existing = this.pool[index];
    if (existing !== undefined) {
      return existing;
    }
    const root = document.createElement('div');
    root.className = 'body-label';
    const title = document.createElement('div');
    title.className = 'body-label__title';
    const stats = document.createElement('div');
    stats.className = 'body-label__stats';
    root.append(title, stats);
    this.container.appendChild(root);
    const node: LabelNode = { root, title, stats, signature: '' };
    this.pool[index] = node;
    return node;
  }

  /** Remove all label elements. */
  dispose(): void {
    for (const node of this.pool) {
      node.root.remove();
    }
    this.pool.length = 0;
  }
}

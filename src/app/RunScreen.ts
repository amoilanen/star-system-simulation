// Run screen: WebGL canvas + HUD overlay wiring (spec §2 data-flow, §3.1).
//
// Owns the presentation side of one simulation run and connects it to the
// headless {@link SimulationRunner}. Responsibilities:
//   - build the best available PhysicsKernel (WASM with TS fallback, FR-10),
//   - construct the SceneManager (renderer) and the SimulationRunner (logic),
//   - mount the HUD and event-annotation overlay,
//   - run the per-frame data flow: rAF → runner.tick → drain events to the
//     annotation layer (when enabled, FR-9) → update HUD → SceneManager render,
//   - route HUD controls (pace, pause, reset, zoom, focus) to the runner/camera.
//
// This module is DOM/Three.js-heavy and validated visually via `npm run dev`;
// the loop orchestration it wires is unit-tested through {@link SimulationRunner}.

import { RemnantType, type LifecycleStage } from '../config/fateModel';
import type { Locale, SimulationConfig } from '../config/SimulationConfig';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';
import { BODY_OFFSET, BODY_STRIDE, BodyType } from '../sim/PhysicsKernel';
import { simSecondsToYears } from '../sim/timeFormat';
import { createKernel } from '../sim/WasmKernel';
import { SceneManager, type RenderState } from '../render/SceneManager';
import { EventAnnotations, BODY_TYPE_MESSAGE_IDS } from '../ui/EventAnnotations';
import { FOCUS_NONE, FOCUS_STAR, Hud, type FocusOption } from '../ui/Hud';
import { BodyInfoPanel } from '../ui/BodyInfoPanel';
import { bodyInfoMessages, type PickTarget } from '../ui/bodyInfo';
import { ContextMenu } from '../ui/ContextMenu';
import { DEFAULT_PARTICLE_COUNT, SimulationRunner } from './SimulationRunner';

/** Max pointer travel (px) between press and release still treated as a click. */
const CLICK_MOVE_THRESHOLD = 6;

/** Prefix distinguishing per-body focus values from the star/free options. */
const BODY_FOCUS_PREFIX = 'body:';

/** Options for constructing a {@link RunScreen}. */
export interface RunScreenOptions {
  /** Element the run screen mounts into (cleared on {@link destroy}). */
  container: HTMLElement;
  /** Immutable run configuration from the setup form. */
  config: SimulationConfig;
  /** Invoked when the user hits reset — returns to the setup screen (FR-12). */
  onExit: () => void;
  /** i18n registry; defaults to the shared app instance. */
  i18n?: I18n;
}

/**
 * The run screen. Call {@link start} (async — it builds the kernel) once after
 * construction, and {@link destroy} to tear everything down.
 */
export class RunScreen {
  private readonly container: HTMLElement;
  private readonly config: SimulationConfig;
  private readonly locale: Locale;
  private readonly onExit: () => void;
  private readonly i18n: I18n;

  private readonly canvasHost: HTMLDivElement;
  private readonly overlay: HTMLDivElement;

  private scene: SceneManager | null = null;
  private runner: SimulationRunner | null = null;
  private hud: Hud | null = null;
  private annotations: EventAnnotations | null = null;
  private infoPanel: BodyInfoPanel | null = null;
  private contextMenu: ContextMenu | null = null;

  /** Signature of the current body set, so focus options rebuild only on change. */
  private focusSignature = '';
  private disposed = false;

  /** Latest star state, so a click on the star can describe its current stage. */
  private lastStage: LifecycleStage | null = null;
  private lastRemnant: RemnantType | null = null;

  /** Pointer-press position, to tell a click (inspect) from a drag (orbit). */
  private pointerDownX = 0;
  private pointerDownY = 0;
  private readonly onPointerDown = (e: PointerEvent): void => {
    this.pointerDownX = e.clientX;
    this.pointerDownY = e.clientY;
  };
  private readonly onPointerUp = (e: PointerEvent): void => this.handlePointerUp(e);
  private readonly onContextMenu = (e: MouseEvent): void => this.handleContextMenu(e);

  constructor(options: RunScreenOptions) {
    this.container = options.container;
    this.config = options.config;
    this.locale = options.config.locale;
    this.onExit = options.onExit;
    this.i18n = options.i18n ?? sharedI18n;

    this.container.classList.add('run-screen');
    this.container.style.position = 'relative';
    this.container.style.width = '100vw';
    this.container.style.height = '100vh';
    this.container.style.overflow = 'hidden';

    this.canvasHost = document.createElement('div');
    this.canvasHost.className = 'run-canvas';
    this.canvasHost.style.position = 'absolute';
    this.canvasHost.style.inset = '0';

    this.overlay = document.createElement('div');
    this.overlay.className = 'run-overlay';
    this.overlay.style.position = 'absolute';
    this.overlay.style.inset = '0';
    this.overlay.style.pointerEvents = 'none';

    this.container.append(this.canvasHost, this.overlay);
  }

  /**
   * Build the kernel, scene, runner and HUD, then start the render loop. Safe to
   * abort by calling {@link destroy} before or during the await.
   */
  async start(): Promise<void> {
    const particleCount = DEFAULT_PARTICLE_COUNT;
    const kernel = await createKernel();
    if (this.disposed) {
      kernel.dispose();
      return;
    }

    this.runner = new SimulationRunner(this.config, kernel, { particleCount });
    this.scene = new SceneManager(this.canvasHost, { maxParticles: particleCount });

    this.hud = new Hud({
      container: this.overlay,
      i18n: this.i18n,
      locale: this.locale,
      initialPace: this.config.pace,
      onPaceChange: (pace) => this.runner?.setPace(pace),
      onTogglePause: () => this.handleTogglePause(),
      onReset: () => this.onExit(),
      onZoomIn: () => this.scene?.cameraController.zoomIn(),
      onZoomOut: () => this.scene?.cameraController.zoomOut(),
      onFocusChange: (value) => this.handleFocusChange(value),
    });
    // The HUD is interactive; re-enable pointer events for its controls.
    this.hud.element.style.pointerEvents = 'auto';

    this.annotations = new EventAnnotations({
      container: this.overlay,
      i18n: this.i18n,
      locale: this.locale,
      enabled: this.config.showEventAnnotations,
    });

    this.infoPanel = new BodyInfoPanel({
      container: this.overlay,
      i18n: this.i18n,
      locale: this.locale,
    });
    // The panel is interactive (close button); re-enable pointer events for it.
    this.infoPanel.element.style.pointerEvents = 'auto';

    this.contextMenu = new ContextMenu(this.overlay);

    // Click-to-inspect: press + release without dragging picks a body/the star.
    this.scene.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.scene.domElement.addEventListener('pointerup', this.onPointerUp);
    // Right-click a body to center the camera on it.
    this.scene.domElement.addEventListener('contextmenu', this.onContextMenu);

    this.scene.start((dt) => this.frame(dt));
  }

  /** Tear down the run screen and release all resources. Idempotent. */
  destroy(): void {
    this.disposed = true;
    if (this.scene !== null) {
      this.scene.domElement.removeEventListener('pointerdown', this.onPointerDown);
      this.scene.domElement.removeEventListener('pointerup', this.onPointerUp);
      this.scene.domElement.removeEventListener('contextmenu', this.onContextMenu);
    }
    this.scene?.dispose();
    this.hud?.destroy();
    this.annotations?.destroy();
    this.infoPanel?.destroy();
    this.contextMenu?.destroy();
    this.runner?.dispose();
    this.scene = null;
    this.hud = null;
    this.annotations = null;
    this.infoPanel = null;
    this.contextMenu = null;
    this.runner = null;
    this.container.replaceChildren();
    this.container.classList.remove('run-screen');
  }

  /** The per-frame data flow (spec §2): one requestAnimationFrame tick. */
  private frame(realDtSeconds: number): RenderState | null {
    const runner = this.runner;
    if (runner === null) {
      return null;
    }
    const { state, events } = runner.tick(realDtSeconds);
    this.lastStage = state.stage;
    this.lastRemnant = state.remnant;

    // Annotations render only when the toggle is on (the layer no-ops otherwise).
    const annotations = this.annotations;
    if (annotations !== null) {
      for (const event of events) {
        annotations.show(event);
      }
    }

    const hud = this.hud;
    if (hud !== null) {
      hud.setStage(state.stage);
      hud.setBodyCount(state.bodyCount);
      hud.setElapsedYears(simSecondsToYears(runner.clock.simTime));
      hud.setSpeedYearsPerSecond(simSecondsToYears(runner.clock.currentRate()));
      this.syncFocusOptions(state);
    }

    return state;
  }

  /**
   * On pointer release, if the pointer barely moved (a click, not an orbit
   * drag), pick the object under it and show/hide the info panel accordingly.
   */
  private handlePointerUp(e: PointerEvent): void {
    // Primary button only — right/middle clicks are for the context menu.
    if (e.button !== 0) {
      return;
    }
    const moved = Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY);
    if (moved > CLICK_MOVE_THRESHOLD) {
      return;
    }
    const pick = this.scene?.pickAtClient(e.clientX, e.clientY);
    if (!pick) {
      this.infoPanel?.hide();
      return;
    }
    const target: PickTarget =
      pick.kind === 'star'
        ? { kind: 'star', stage: this.lastStage ?? 0, remnant: this.lastRemnant }
        : { kind: 'body', type: pick.type, radius: pick.radius, captured: pick.captured };
    this.infoPanel?.show(bodyInfoMessages(target));
  }

  /**
   * Right-click a body (or the star) to open a context menu with a "center on"
   * action that focuses/follows the camera on it (FR-8).
   */
  private handleContextMenu(e: MouseEvent): void {
    e.preventDefault();
    const pick = this.scene?.pickAtClient(e.clientX, e.clientY);
    if (!pick) {
      this.contextMenu?.close();
      return;
    }
    const value = pick.kind === 'star' ? FOCUS_STAR : `${BODY_FOCUS_PREFIX}${pick.id}`;
    const targetName =
      pick.kind === 'star'
        ? this.i18n.translate(this.locale, 'hud.focus.star')
        : this.i18n.translate(this.locale, 'hud.focus.body', {
            body: this.i18n.translate(
              this.locale,
              BODY_TYPE_MESSAGE_IDS[pick.type] ?? 'body.planet',
            ),
            id: pick.id,
          });
    const label = this.i18n.translate(this.locale, 'menu.centerOn', { target: targetName });
    this.contextMenu?.open(e.clientX, e.clientY, [
      { label, onSelect: () => this.applyFocus(value) },
    ]);
  }

  /** Apply a focus selection from the context menu: sync the HUD + move the camera. */
  private applyFocus(value: string): void {
    this.hud?.setFocusValue(value);
    this.handleFocusChange(value);
  }

  /** Pause/resume the clock and reflect the state in the HUD. */
  private handleTogglePause(): void {
    const paused = this.runner?.togglePause() ?? false;
    this.hud?.setPaused(paused);
  }

  /** Route a focus-selector change to the camera (star / free / a body). */
  private handleFocusChange(value: string): void {
    const scene = this.scene;
    if (scene === null) {
      return;
    }
    if (value === FOCUS_STAR) {
      scene.focusOnStar();
    } else if (value === FOCUS_NONE) {
      scene.cameraController.clearFollow();
    } else if (value.startsWith(BODY_FOCUS_PREFIX)) {
      const id = Number(value.slice(BODY_FOCUS_PREFIX.length));
      if (Number.isFinite(id)) {
        scene.focusOnBody(id);
      }
    }
  }

  /** Rebuild the HUD's body-focus options only when the body set changes. */
  private syncFocusOptions(state: RenderState): void {
    let signature = '';
    const options: FocusOption[] = [];
    for (let i = 0; i < state.bodyCount; i += 1) {
      const base = i * BODY_STRIDE;
      const id = state.bodies[base + BODY_OFFSET.id] ?? 0;
      const type = (state.bodies[base + BODY_OFFSET.type] ?? 0) as BodyType;
      signature += `${id}:${type},`;
      options.push({
        value: `${BODY_FOCUS_PREFIX}${id}`,
        labelMessageId: 'hud.focus.body',
        params: {
          body: this.i18n.translate(this.locale, BODY_TYPE_MESSAGE_IDS[type] ?? 'body.planet'),
          id,
        },
      });
    }
    if (signature !== this.focusSignature) {
      this.focusSignature = signature;
      this.hud?.setFocusOptions(options);
    }
  }
}

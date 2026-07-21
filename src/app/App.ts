// Application root component & screen routing (spec §3.1, FR-12).
//
// Single-page app with two logical screens swapped in place:
//   - Setup screen — the localized configuration form (SetupForm). On submit it
//     produces an immutable SimulationConfig and transitions to the run screen.
//   - Run screen  — the WebGL canvas + HUD overlay (RunScreen), driving the
//     simulation loop.
//
// `reset` (FR-12) returns to the setup screen preserving the last config's
// language and preset for quick re-runs.

import type { SimulationConfig } from '../config/SimulationConfig';
import { DEFAULT_PRESET_ID } from '../config/presets';
import { i18n as sharedI18n, type I18n } from '../i18n/i18n';
import { SetupForm } from '../ui/SetupForm';
import { RunScreen } from './RunScreen';

/** The application root. Construct once with the mount element. */
export class App {
  private readonly root: HTMLElement;
  private readonly i18n: I18n;

  private setupForm: SetupForm | null = null;
  private runScreen: RunScreen | null = null;
  /** Last submitted config, preserved so reset can pre-fill the setup form. */
  private lastConfig: SimulationConfig | null = null;

  constructor(root: HTMLElement, i18n: I18n = sharedI18n) {
    this.root = root;
    this.i18n = i18n;
    this.showSetup();
  }

  /** Show the setup screen, pre-selecting the last config's locale/preset. */
  private showSetup(): void {
    this.teardownRun();
    this.root.replaceChildren();

    this.setupForm = new SetupForm({
      container: this.root,
      i18n: this.i18n,
      initialLocale: this.lastConfig?.locale ?? 'en',
      initialPresetId: this.lastConfig?.presetId ?? DEFAULT_PRESET_ID,
      onSubmit: (config) => {
        void this.startRun(config);
      },
    });
  }

  /** Transition to the run screen for the given config. */
  private async startRun(config: SimulationConfig): Promise<void> {
    this.lastConfig = config;
    this.teardownSetup();
    this.root.replaceChildren();

    const run = new RunScreen({
      container: this.root,
      config,
      i18n: this.i18n,
      onExit: () => this.showSetup(),
    });
    this.runScreen = run;
    await run.start();
  }

  private teardownSetup(): void {
    this.setupForm?.destroy();
    this.setupForm = null;
  }

  private teardownRun(): void {
    this.runScreen?.destroy();
    this.runScreen = null;
  }
}

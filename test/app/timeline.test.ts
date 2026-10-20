// End-to-end timeline check on the real WASM kernel: with the adaptive warp at
// its default speed, EVERY preset's life must be watchable — each stage it
// really has must be on screen for a sensible stretch of wall-clock time, and
// the whole run must fit in a few minutes. Under the old fixed pace a Sun-like
// star sat on its main sequence for decades of wall-clock time, while the
// massive presets crossed their main sequence and giant phase inside a frame.

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { LifecycleStage, RemnantType } from '../../src/config/fateModel';
import { PRESETS, configFromPreset } from '../../src/config/presets';
import { loadWasmModule, WasmKernel, type WasmModule } from '../../src/sim/WasmKernel';
import { SimulationRunner } from '../../src/app/SimulationRunner';

const wasmBinUrl = new URL('../../wasm/pkg/star_kernel_bg.wasm', import.meta.url);
const describeWasm = existsSync(fileURLToPath(wasmBinUrl)) ? describe : describe.skip;
const FPS = 60;
const MAX_FRAMES = 6 * 60 * FPS;

async function loadModule(): Promise<WasmModule> {
  const bytes = readFileSync(fileURLToPath(wasmBinUrl));
  return loadWasmModule({ module_or_path: new Uint8Array(bytes) });
}

/** Wall-clock seconds spent in each stage until the remnant forms. */
function stageSeconds(runner: SimulationRunner): Map<LifecycleStage, number> {
  const seconds = new Map<LifecycleStage, number>();
  for (let frame = 0; frame < MAX_FRAMES; frame += 1) {
    const { state } = runner.tick(1 / FPS);
    seconds.set(state.stage, (seconds.get(state.stage) ?? 0) + 1 / FPS);
    if (state.stage === LifecycleStage.Remnant) {
      break;
    }
  }
  return seconds;
}

describeWasm('adaptive timeline (WASM kernel)', () => {
  for (const preset of Object.values(PRESETS)) {
    it(`${preset.id}: every stage it has is watchable`, async () => {
      const mod = await loadModule();
      const runner = new SimulationRunner(configFromPreset(preset.id), new WasmKernel(mod), {
        particleCount: 600,
      });
      const seconds = stageSeconds(runner);
      expect(seconds.has(LifecycleStage.Remnant), 'never reached the remnant').toBe(true);
      const total = [...seconds.values()].reduce((a, b) => a + b, 0);
      expect(total).toBeLessThan(150);
      if (runner.finalRemnant !== RemnantType.BrownDwarf) {
        const ms = seconds.get(LifecycleStage.MainSequence) ?? 0;
        const giant = seconds.get(LifecycleStage.RedGiant) ?? 0;
        const death = seconds.get(LifecycleStage.Death) ?? 0;
        expect(ms, 'main sequence').toBeGreaterThan(35);
        expect(ms, 'main sequence').toBeLessThan(55);
        expect(giant, 'giant').toBeGreaterThan(14);
        expect(giant, 'giant').toBeLessThan(26);
        expect(death, 'death').toBeGreaterThan(3);
      }
      runner.dispose();
    }, 120000);
  }

  it('skips the rest of a main sequence in a couple of seconds', async () => {
    const mod = await loadModule();
    const runner = new SimulationRunner(configFromPreset('sun-like'), new WasmKernel(mod), {
      particleCount: 600,
    });
    let frame = 0;
    while (runner.currentStage !== LifecycleStage.MainSequence && frame < MAX_FRAMES) {
      runner.tick(1 / FPS);
      frame += 1;
    }
    expect(runner.skipStage()).toBe(true);
    expect(runner.isSkipping).toBe(true);
    let skipFrames = 0;
    while (runner.currentStage === LifecycleStage.MainSequence && skipFrames < 10 * FPS) {
      runner.tick(1 / FPS);
      skipFrames += 1;
    }
    expect(runner.currentStage).toBe(LifecycleStage.RedGiant);
    expect(skipFrames / FPS).toBeLessThan(2.5);
    // …and the giant then runs at its ordinary pace again.
    runner.tick(1 / FPS);
    expect(runner.isSkipping).toBe(false);
    expect(runner.skipStage()).toBe(true);
    runner.dispose();
  }, 120000);

  it('keeps the old constant rate available in fixed mode', async () => {
    const mod = await loadModule();
    const runner = new SimulationRunner(
      { ...configFromPreset('sun-like'), pace: 0.5 },
      new WasmKernel(mod),
      { particleCount: 300 },
    );
    runner.setTimeMode('fixed');
    expect(runner.timeMode).toBe('fixed');
    const before = runner.clock.currentRate();
    runner.tick(1 / FPS);
    expect(runner.clock.currentRate()).toBe(before);
    runner.dispose();
  }, 60000);
});

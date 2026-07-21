// Bloom + tone-mapping post-processing (spec §3.2, D6 — the "beauty" goal).
//
// Builds an `EffectComposer` pipeline: scene render → UnrealBloom (blooms the
// bright star/corona/particles) → OutputPass (tone-mapping + color space). The
// SceneManager renders through this composer instead of the raw renderer.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/** Tunable bloom parameters (illustrative defaults chosen for the star glow). */
export interface BloomOptions {
  strength?: number;
  radius?: number;
  threshold?: number;
}

/** A configured bloom/tone-mapping composer plus resize/dispose helpers. */
export interface PostProcessing {
  composer: EffectComposer;
  bloom: UnrealBloomPass;
  setSize(width: number, height: number): void;
  render(deltaSeconds: number): void;
  dispose(): void;
}

/**
 * Create the bloom + tone-mapping pipeline for a scene/camera. The renderer's
 * tone mapping should be set by the caller (SceneManager) to ACESFilmic for a
 * cinematic response; OutputPass applies it during the final pass.
 */
export function createPostProcessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  width: number,
  height: number,
  options: BloomOptions = {},
): PostProcessing {
  const composer = new EffectComposer(renderer);
  composer.setSize(width, height);

  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    options.strength ?? 0.9,
    options.radius ?? 0.6,
    options.threshold ?? 0.2,
  );
  composer.addPass(bloom);

  composer.addPass(new OutputPass());

  return {
    composer,
    bloom,
    setSize(w: number, h: number): void {
      composer.setSize(w, h);
      bloom.setSize(w, h);
    },
    render(deltaSeconds: number): void {
      composer.render(deltaSeconds);
    },
    dispose(): void {
      composer.dispose();
    },
  };
}

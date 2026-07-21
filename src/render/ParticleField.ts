// Dust/gas cloud & supernova-ejecta particle system (spec §3.2, D6).
//
// Reads the kernel's flat, interleaved particle buffer each frame (see
// PARTICLE_OFFSET/PARTICLE_STRIDE) and streams it into a single additive-blended
// `THREE.Points` cloud. Per-particle color (H/He/metals tint, A2) and size come
// straight from the buffer, so no per-particle JS↔kernel calls are needed.

import * as THREE from 'three';
import { PARTICLE_OFFSET, PARTICLE_STRIDE } from '../sim/PhysicsKernel';
import { particleFragmentShader, particleVertexShader } from './shaders/particle';

/** GPU particle cloud driven by the kernel particle buffer. */
export class ParticleField {
  readonly points: THREE.Points;

  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;
  private readonly sizes: Float32Array;
  private readonly capacity: number;

  constructor(maxParticles: number, pixelRatio = 1) {
    this.capacity = Math.max(1, Math.floor(maxParticles));
    this.positions = new Float32Array(this.capacity * 3);
    this.colors = new Float32Array(this.capacity * 3);
    this.sizes = new Float32Array(this.capacity);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setDrawRange(0, 0);

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uPixelRatio: { value: pixelRatio },
        uSizeScale: { value: 1.0 },
        uBrightness: { value: 1.0 },
      },
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    // The cloud spans the whole scene; never frustum-cull it away.
    this.points.frustumCulled = false;
  }

  /**
   * Copy `count` particles from the interleaved kernel buffer into the GPU
   * attributes and mark them for upload. Excess particles beyond capacity are
   * ignored (the kernel caps its count, FR-10).
   */
  update(buffer: Float32Array, count: number): void {
    const n = Math.min(count, this.capacity);
    for (let i = 0; i < n; i += 1) {
      const base = i * PARTICLE_STRIDE;
      const p3 = i * 3;
      this.positions[p3] = buffer[base + PARTICLE_OFFSET.x] ?? 0;
      this.positions[p3 + 1] = buffer[base + PARTICLE_OFFSET.y] ?? 0;
      this.positions[p3 + 2] = buffer[base + PARTICLE_OFFSET.z] ?? 0;
      this.colors[p3] = buffer[base + PARTICLE_OFFSET.r] ?? 1;
      this.colors[p3 + 1] = buffer[base + PARTICLE_OFFSET.g] ?? 1;
      this.colors[p3 + 2] = buffer[base + PARTICLE_OFFSET.b] ?? 1;
      this.sizes[i] = buffer[base + PARTICLE_OFFSET.size] ?? 1;
    }
    this.geometry.setDrawRange(0, n);
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttr = this.geometry.getAttribute('aColor') as THREE.BufferAttribute;
    const sizeAttr = this.geometry.getAttribute('aSize') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
    this.geometry.computeBoundingSphere();
  }

  /** Update the device pixel ratio uniform on resize. */
  setPixelRatio(pixelRatio: number): void {
    this.material.uniforms.uPixelRatio!.value = pixelRatio;
  }

  /**
   * Set a global brightness multiplier (0..1) for the whole cloud. Used to fade
   * the residual birth dust once the star ignites so it stops competing with the
   * star system, and to flash the supernova ejecta bright again at death.
   */
  setBrightness(value: number): void {
    this.material.uniforms.uBrightness!.value = Math.max(0, value);
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

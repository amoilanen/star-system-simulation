import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { BodyRenderer } from '../../src/render/BodyRenderer';

// A custom ShaderMaterial on an InstancedMesh gets `instanceMatrix` declared but
// never applied — the shader has to do it. The comet tails once forgot, so every
// tail was drawn at the identity transform: a 1×1 AU quad standing on top of the
// star (a flat-bottomed "halo" pointing +Y) instead of trailing its comet.
describe('instanced custom shaders', () => {
  it('every ShaderMaterial drawn through an InstancedMesh applies instanceMatrix', () => {
    const renderer = new BodyRenderer();
    const offenders: string[] = [];
    let checked = 0;
    renderer.group.traverse((object) => {
      if (!(object instanceof THREE.InstancedMesh)) {
        return;
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (material instanceof THREE.ShaderMaterial) {
          checked += 1;
          if (!/instanceMatrix\s*\*/.test(material.vertexShader)) {
            offenders.push(object.name || object.uuid);
          }
        }
      }
    });
    // The comet tails are (at least) one such mesh; guard against the check
    // silently passing because nothing was inspected.
    expect(checked).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});

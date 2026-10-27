// Additive comet-tail billboard (spec §3.2, FR-7). A quad stretched along the
// star→comet direction (see bodyMath.tailDirectionAwayFromStar) that fades from
// a bright head to a transparent tip. Written for a Three.js `ShaderMaterial`.

//
// The tails are drawn through an `InstancedMesh` (one instance per comet), so the
// vertex shader MUST apply `instanceMatrix` itself: a custom `ShaderMaterial`
// gets the attribute declared under `USE_INSTANCING` but, unlike the built-in
// materials, never applies it. Without it every comet's tail was drawn with the
// identity transform — a 1×1 AU quad anchored at the star and pointing +Y, i.e.
// a flat-bottomed, semicircular "halo" standing on top of the star whenever any
// comet was close enough to grow a tail.
export const cometTailVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 local = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      local = instanceMatrix * local;
    #endif
    gl_Position = projectionMatrix * modelViewMatrix * local;
  }
`;

export const cometTailFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    // uv.y runs 0 (head, at the comet) → 1 (tail tip).
    float along = 1.0 - vUv.y;
    // Narrow the tail toward the tip and fade transparency.
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float body = across * along;
    float alpha = pow(body, 1.5) * uOpacity;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;

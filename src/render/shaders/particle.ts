// Additive-blended dust/gas & ejecta point sprites (spec §3.2). Per-particle
// color and size come from the kernel particle buffer (H/He/metals tint, A2);
// each point is drawn as a soft round sprite that accumulates into a nebula glow
// under additive blending. Written for a Three.js `ShaderMaterial` over
// `THREE.Points`.

export const particleVertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uPixelRatio;
  uniform float uSizeScale;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // Perspective size attenuation: nearer particles are larger. The factor is
    // kept modest and the result clamped so grains read as fine dust in scale
    // with the star, never as large blobs when close to the camera.
    float pt = aSize * uSizeScale * uPixelRatio * (110.0 / -mvPosition.z);
    gl_PointSize = clamp(pt, 0.75, 9.0 * uPixelRatio);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const particleFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  uniform float uBrightness;

  void main() {
    // Round soft sprite: fade to transparent at the point edge.
    vec2 c = gl_PointCoord - vec2(0.5);
    float d = length(c);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d) * uBrightness;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

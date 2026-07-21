// Additive billboard corona/glow halo around the star (spec §3.2). A camera-
// facing quad with a soft radial falloff; scaled with the star radius and tinted
// by its blackbody color. Feeds the bloom pass for the "beauty" goal.

export const coronaVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const coronaFragmentShader = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    // Radial distance from the quad center.
    float d = length(vUv - vec2(0.5)) * 2.0;
    // Soft inverse falloff: bright core, long faint skirt.
    float glow = smoothstep(1.0, 0.0, d);
    glow = pow(glow, 2.2);
    float alpha = glow * uIntensity;
    gl_FragColor = vec4(uColor * glow, alpha);
  }
`;

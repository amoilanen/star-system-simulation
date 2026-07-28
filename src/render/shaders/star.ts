// GLSL for the star sphere (spec §3.2): blackbody color driven from uniforms,
// animated surface granulation via value noise, and a fresnel corona rim that
// feeds the bloom pass. Written for a Three.js `ShaderMaterial` (WebGL2), which
// injects the standard attributes/uniforms (`position`, `normal`, matrices,
// `cameraPosition`).

export const starVertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  void main() {
    vLocalPos = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const starFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColorCore;   // blackbody color of the surface
  uniform vec3 uColorEdge;   // slightly cooler limb color
  uniform float uGlow;       // corona intensity multiplier
  uniform float uDetail;     // 0 = smooth degenerate crust, 1 = full granulation

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocalPos;

  // Hash-based value noise (cheap, tileable enough for surface granulation).
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 p = normalize(vLocalPos) * 3.0 + vec3(0.0, uTime * 0.15, 0.0);
    // A convective photosphere boils; a neutron star's degenerate crust does
    // not. uDetail blends between the two so a compact remnant renders as a
    // smooth, searing sphere rather than a few pixels of noise.
    float granulation = mix(0.5, fbm(p + uTime * 0.05), uDetail);
    float hotSpots = pow(granulation, 2.0);

    // Fresnel term brightens the limb into a corona rim.
    float fresnel = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);

    // Granulation modulates BRIGHTNESS ONLY. Blending between two differently
    // tinted colours (the old mix(edge, core, hotSpots)) dragged every hue
    // toward the average and, after the ACES tone-map and bloom, left a hot
    // O-star looking like the same pale ball as a G-star. Keeping the hue fixed
    // and varying only the intensity is both truer and far more legible.
    float bright = 0.72 + 0.52 * granulation + 0.18 * hotSpots;

    // Limb darkening: the edge of the disc looks through more atmosphere, so it
    // is dimmer and marginally cooler — a small shift, not a change of colour.
    float limb = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 1.2);
    vec3 surface = mix(uColorCore, uColorEdge, limb * 0.65) * bright;

    // Tinted rim glow, bounded so the limb flares without washing the disc out.
    vec3 color = surface + uColorCore * fresnel * (0.25 + 0.2 * uGlow);

    gl_FragColor = vec4(color, 1.0);
  }
`;

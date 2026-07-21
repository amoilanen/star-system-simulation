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
    float granulation = fbm(p + uTime * 0.05);
    float hotSpots = pow(granulation, 2.0);

    // Fresnel term brightens the limb into a corona rim.
    float fresnel = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.5);

    vec3 surface = mix(uColorEdge, uColorCore, hotSpots);
    vec3 color = surface + uColorCore * fresnel * uGlow;
    // Boost emission so the bloom pass produces a convincing glow.
    color *= (0.8 + 0.6 * granulation) * (1.0 + uGlow * 0.5);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// GLSL for the COMPACT remnants: the pulsar's radiation beams and magnetosphere,
// and the black hole's photon ring and accretion disc.
//
// These objects have no photosphere to speak of — a neutron star is 20 km across
// and a black hole has no surface at all — so what makes them beautiful is the
// structure AROUND them: relativistically beamed radiation from the magnetic
// poles, a synchrotron-bright magnetosphere, and (for a black hole) an
// accretion disc whose inner edge is heated to millions of kelvin plus the thin
// ring of light that grazes the photon sphere.
//
// All of them are ADDITIVE and depth-write-free: they are light, not matter.
// Written for Three.js `ShaderMaterial` (WebGL2).

/**
 * Pulsar beam: a camera-facing quad spanning local y ∈ [0, 1] from the star to
 * the beam tip, shaded as a soft cone.
 *
 * A literal cone MESH was the wrong tool — from the side its silhouette is a
 * hard-edged triangle, which is what made the remnant look like a paper party
 * hat. Drawing the cone in the SHADER instead gives a shaft of light with soft
 * edges in every direction and no geometry to catch the eye.
 */
export const beamVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const beamFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    float along = clamp(vUv.y, 0.0, 1.0);
    // Lateral distance from the beam axis, 0 on the axis and 1 at the quad edge.
    float lateral = abs(vUv.x - 0.5) * 2.0;

    // The cone opens up with distance, from a tight throat at the magnetic pole.
    float halfWidth = mix(0.07, 1.0, pow(along, 0.75));
    float across = 1.0 - smoothstep(halfWidth * 0.15, halfWidth, lateral);

    // Radiation is brightest at the poles and fades to nothing at the tip.
    float falloff = pow(1.0 - along, 2.0);
    // A slow travelling ripple so the beam breathes instead of sitting static.
    float pulse = 0.82 + 0.18 * sin(along * 9.0 - uTime * 3.0);

    float a = across * falloff * pulse;
    if (a < 0.003) discard;
    // A brighter core along the axis reads as the collimated part of the beam.
    float core = pow(1.0 - lateral, 6.0) * falloff;
    gl_FragColor = vec4(uColor * uIntensity * (a + core * 0.8), a * 0.75);
  }
`;

/**
 * Magnetosphere torus: a rotating ring of shocked, synchrotron-emitting plasma
 * around a neutron star. Brightest along its leading edge, with a travelling
 * intensity wave so it visibly spins.
 */
export const magnetosphereVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const magnetosphereFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec2 vUv;

  void main() {
    // uv.x runs around the ring, uv.y around the tube cross-section.
    float tube = sin(vUv.y * 6.2831853);
    float rim = 1.0 - abs(tube);              // brightest on the tube's spine
    float wave = 0.55 + 0.45 * sin(vUv.x * 12.566 - uTime * 4.0);
    float a = pow(rim, 1.5) * wave;
    gl_FragColor = vec4(uColor * uIntensity * a, a * 0.8);
  }
`;

/**
 * Photon ring: the razor-thin halo of light that has orbited the black hole and
 * escaped, seen at ~2.6 Schwarzschild radii whatever the viewing angle — so it
 * is drawn as a billboarded annulus. This single feature is what makes a black
 * hole legible as a black hole rather than as a hole in the canvas.
 */
export const photonRingVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const photonRingFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec2 vUv;

  void main() {
    // Distance from the quad's centre, in units of its half-width.
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    // A thin, very bright ring with soft shoulders on both sides.
    float ring = exp(-pow((r - 0.62) / 0.055, 2.0));
    // A faint outer glow so the ring is not a hairline at small scales.
    float halo = exp(-pow((r - 0.62) / 0.34, 2.0)) * 0.22;
    float a = clamp(ring + halo, 0.0, 1.0);
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor * uIntensity * (ring * 1.6 + halo), a);
  }
`;

/**
 * Accretion disc: a flat annulus of gas spiralling in. Its inner edge is heated
 * to millions of kelvin (blue-white) and cools outward through orange; spiral
 * shear is animated so the disc visibly turns, and the near/far halves differ in
 * brightness the way relativistic beaming makes a real one asymmetric.
 */
export const accretionDiscVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  void main() {
    vUv = uv;
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const accretionDiscFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uInnerColor;
  uniform vec3 uOuterColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uInnerRadius;
  uniform float uOuterRadius;

  varying vec3 vLocal;

  void main() {
    float r = length(vLocal.xy);
    float t = clamp((r - uInnerRadius) / max(uOuterRadius - uInnerRadius, 1e-4), 0.0, 1.0);

    // A LOGARITHMIC spiral that rotates rigidly. Winding the arms up with a
    // radius-dependent angular speed (the naive Keplerian shear) makes the
    // pattern's radial frequency grow without bound, and within seconds the disc
    // aliases into a stack of concentric rings instead of arms.
    float angle = atan(vLocal.y, vLocal.x);
    float spiral = angle * 2.0 - log(max(r / uInnerRadius, 1.0001)) * 5.0 + uTime * 1.6;
    float banding = 0.78 + 0.22 * sin(spiral);

    // Temperature falls outward (T ∝ r^-3/4), so colour and brightness do too.
    vec3 color = mix(uInnerColor, uOuterColor, pow(t, 0.55));
    float radial = pow(1.0 - t, 2.0);
    // Soft inner cut so the disc does not end in a hard circle at the horizon.
    float innerFade = smoothstep(0.0, 0.1, t);

    float a = radial * innerFade * banding;
    if (a < 0.004) discard;
    gl_FragColor = vec4(color * uIntensity * a, a);
  }
`;

/**
 * Supernova / planetary-nebula BLAST SHELL: an expanding, optically thin sphere
 * of shocked gas.
 *
 * The single most important property is LIMB BRIGHTENING. A thin shell is
 * transparent, so a line of sight through its edge passes through far more
 * emitting material than one through its face — which is exactly why every real
 * supernova remnant photograph shows a bright RING rather than a filled disc.
 * Rendering it that way (instead of as a solid expanding ball) is both truer and
 * far more beautiful.
 */
export const blastShellVertexShader = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    vLocal = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const blastShellFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  // Cheap hash noise, reused for the shell's filamentary structure.
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

  void main() {
    // Grazing incidence ⇒ a long path through the shell ⇒ bright limb.
    float facing = abs(dot(normalize(vNormalW), normalize(vViewDir)));
    float limb = pow(1.0 - facing, 3.5);

    // Rayleigh-Taylor filaments: a real shell is ragged, never a smooth bubble.
    vec3 dir = normalize(vLocal);
    float filaments = 0.55 + 0.75 * noise(dir * 7.0 + uTime * 0.06);
    filaments *= 0.7 + 0.5 * noise(dir * 17.0);

    float a = limb * filaments * uIntensity;
    if (a < 0.003) discard;
    // A hotter, whiter rim on top of the shell's own colour.
    vec3 color = uColor + vec3(0.35, 0.3, 0.25) * pow(limb, 2.0);
    gl_FragColor = vec4(color * a, a);
  }
`;

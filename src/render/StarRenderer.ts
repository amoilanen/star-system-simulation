// Star / red-giant / remnant renderer (spec §3.2, D6).
//
// Owns the central body's visuals:
//   - a shader sphere (blackbody surface + fresnel corona rim + granulation),
//   - an additive billboard glow halo,
//   - the compact-remnant furniture: a pulsar's soft radiation beams and its
//     magnetosphere ring, and a black hole's event horizon, photon ring and
//     accretion disc.
//
// All parameters come from the pure `starAppearance` model, so this class only
// maps them onto Three.js objects and animates time-based effects. The star sits
// at the scene origin (it is not a kernel body); its stage/mass/remnant come
// from the simulation orchestrator.

import * as THREE from 'three';
import { apparentRadius } from './screenScale';
import type { StarAppearance } from './starVisual';
import { coronaFragmentShader, coronaVertexShader } from './shaders/corona';
import { starFragmentShader, starVertexShader } from './shaders/star';
import {
  accretionDiscFragmentShader,
  accretionDiscVertexShader,
  beamFragmentShader,
  beamVertexShader,
  blastShellFragmentShader,
  blastShellVertexShader,
  magnetosphereFragmentShader,
  magnetosphereVertexShader,
  photonRingFragmentShader,
  photonRingVertexShader,
} from './shaders/compactRemnant';

/** Angular speed (rad/s) of the sweeping pulsar beam. */
const PULSAR_BEAM_SPEED = 3.0;

/** Angular speed (rad/s) of the neutron star's magnetosphere ring. */
const MAGNETOSPHERE_SPEED = 1.7;

/** Tilt of the pulsar's magnetic axis away from its spin axis (radians). */
const MAGNETIC_AXIS_TILT = Math.PI / 5;

/**
 * Accretion-disc extent as a multiple of the drawn event-horizon radius. The
 * innermost stable circular orbit of a non-spinning hole is 3 Schwarzschild
 * radii, and the luminous disc extends far beyond it.
 */
const DISC_INNER = 2.6;
const DISC_OUTER = 9;

/** Photon-ring quad size as a multiple of the drawn horizon radius. */
const PHOTON_RING_SCALE = 4.2;

/**
 * Smallest apparent DIAMETER, in pixels, at which the star's disk and its glow
 * halo are drawn. The star is modelled at Solar-System proportions (~0.047 AU
 * against orbits of many AU), so from a whole-system view it would otherwise be
 * sub-pixel. The halo keeps a larger floor than the disk so the star always
 * reads as a bright point of light with a glow, the way a real star does.
 */
const MIN_STAR_PIXELS = 7;
const MIN_CORONA_PIXELS = 44;

/**
 * A compact remnant is drawn from a much larger apparent floor than a star: its
 * beams, ring and disc are the whole point, and at a 7 px floor they collapse
 * into an indistinct dot. This is the same trick every astronomy illustration
 * uses — the structure is scaled up, the physics is not.
 */
const MIN_REMNANT_PIXELS = 16;

/** Renders the star and its terminal remnant into a single scene group. */
export class StarRenderer {
  readonly group: THREE.Group;

  private readonly starMesh: THREE.Mesh;
  private readonly starMaterial: THREE.ShaderMaterial;
  private readonly corona: THREE.Mesh;
  private readonly coronaMaterial: THREE.ShaderMaterial;
  private readonly beams: THREE.Mesh[];
  private readonly beamMaterial: THREE.ShaderMaterial;
  private readonly magnetosphere: THREE.Mesh;
  private readonly magnetosphereMaterial: THREE.ShaderMaterial;
  private readonly blackHole: THREE.Group;
  private readonly horizon: THREE.Mesh;
  private readonly horizonMaterial: THREE.MeshBasicMaterial;
  private readonly photonRing: THREE.Mesh;
  private readonly photonRingMaterial: THREE.ShaderMaterial;
  private readonly accretionDisc: THREE.Mesh;
  private readonly accretionDiscMaterial: THREE.ShaderMaterial;
  private readonly blastShell: THREE.Mesh;
  private readonly blastShellMaterial: THREE.ShaderMaterial;

  private elapsed = 0;
  private beamAngle = 0;
  private magnetosphereAngle = 0;

  // Scratch vectors reused every frame so the beam billboarding allocates nothing.
  private readonly axis = new THREE.Vector3();
  private readonly viewDir = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly basis = new THREE.Matrix4();
  private readonly scaleMatrix = new THREE.Matrix4();

  constructor() {
    this.group = new THREE.Group();

    // --- Star sphere -------------------------------------------------------
    this.starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color(1, 1, 1) },
        uColorEdge: { value: new THREE.Color(1, 0.6, 0.3) },
        uGlow: { value: 1 },
        uDetail: { value: 1 },
      },
      vertexShader: starVertexShader,
      fragmentShader: starFragmentShader,
    });
    this.starMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), this.starMaterial);
    this.group.add(this.starMesh);

    // --- Corona / glow billboard ------------------------------------------
    this.coronaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(1, 1, 1) },
        uIntensity: { value: 1 },
      },
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.corona = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.coronaMaterial);
    this.corona.frustumCulled = false;
    this.group.add(this.corona);

    // --- Pulsar beams (two opposed shafts of light) ------------------------
    this.beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.65, 0.85, 1) },
        uIntensity: { value: 1.6 },
        uTime: { value: 0 },
      },
      vertexShader: beamVertexShader,
      fragmentShader: beamFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    // Each beam is a camera-facing quad spanning local y ∈ [0, 1] outward from
    // the star; the shader draws the cone, so there is no hard mesh silhouette.
    const beamGeom = new THREE.PlaneGeometry(1, 1);
    beamGeom.translate(0, 0.5, 0);
    this.beams = [
      new THREE.Mesh(beamGeom, this.beamMaterial),
      new THREE.Mesh(beamGeom, this.beamMaterial),
    ];
    for (const beam of this.beams) {
      beam.visible = false;
      beam.frustumCulled = false;
      // The quad is oriented by hand every frame (see `updateBeams`).
      beam.matrixAutoUpdate = false;
      this.group.add(beam);
    }

    // --- Neutron-star magnetosphere ---------------------------------------
    this.magnetosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0.55, 0.8, 1) },
        uIntensity: { value: 2.2 },
        uTime: { value: 0 },
      },
      vertexShader: magnetosphereVertexShader,
      fragmentShader: magnetosphereFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.magnetosphere = new THREE.Mesh(
      new THREE.TorusGeometry(1, 0.06, 10, 96),
      this.magnetosphereMaterial,
    );
    // The ring lies in the rotational equator, perpendicular to the spin axis.
    this.magnetosphere.rotation.x = Math.PI / 2;
    this.magnetosphere.visible = false;
    this.magnetosphere.frustumCulled = false;
    this.group.add(this.magnetosphere);

    // --- Black hole: horizon + photon ring + accretion disc ----------------
    this.blackHole = new THREE.Group();
    // A genuinely black, opaque sphere: it must OCCLUDE the disc behind it.
    this.horizonMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.horizon = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), this.horizonMaterial);
    this.blackHole.add(this.horizon);

    this.photonRingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(1, 0.93, 0.78) },
        uIntensity: { value: 2.6 },
      },
      vertexShader: photonRingVertexShader,
      fragmentShader: photonRingFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.photonRing = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.photonRingMaterial);
    this.photonRing.frustumCulled = false;
    this.blackHole.add(this.photonRing);

    this.accretionDiscMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uInnerColor: { value: new THREE.Color(0.85, 0.93, 1) },
        uOuterColor: { value: new THREE.Color(1, 0.42, 0.12) },
        uIntensity: { value: 2.2 },
        uTime: { value: 0 },
        uInnerRadius: { value: DISC_INNER },
        uOuterRadius: { value: DISC_OUTER },
      },
      vertexShader: accretionDiscVertexShader,
      fragmentShader: accretionDiscFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    // RingGeometry is built in the local x–y plane; lay it flat and tilt it so
    // the disc is seen at an angle rather than edge-on from the default camera.
    this.accretionDisc = new THREE.Mesh(
      new THREE.RingGeometry(DISC_INNER, DISC_OUTER, 128, 12),
      this.accretionDiscMaterial,
    );
    this.accretionDisc.rotation.x = -Math.PI / 2 + 0.42;
    this.accretionDisc.frustumCulled = false;
    this.blackHole.add(this.accretionDisc);

    this.blackHole.visible = false;
    this.group.add(this.blackHole);

    // --- Supernova / planetary-nebula blast shell --------------------------
    this.blastShellMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(1, 0.8, 0.6) },
        uIntensity: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: blastShellVertexShader,
      fragmentShader: blastShellFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      // Both hemispheres emit, so the limb — where the two overlap — is doubly
      // bright. That is the whole visual signature of a thin expanding shell.
      side: THREE.DoubleSide,
    });
    this.blastShell = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), this.blastShellMaterial);
    this.blastShell.visible = false;
    this.blastShell.frustumCulled = false;
    this.group.add(this.blastShell);
  }

  /**
   * Update the star's visuals for this frame. `dt` is real elapsed seconds
   * (drives surface animation + beam sweep — pass 0 to freeze everything while
   * the simulation is paused); `camera` is used to billboard the corona halo and
   * the photon ring toward the viewer.
   */
  update(appearance: StarAppearance, dt: number, camera: THREE.Camera, viewportHeightPx = 0): void {
    this.elapsed += dt;
    this.group.visible = appearance.visible;
    if (!appearance.visible) {
      return;
    }

    // Star sphere: scale to radius, push blackbody color + glow into uniforms.
    // The disk color is scaled by surfaceLum so cool stars keep their hue rather
    // than washing to white (the bright halo below still carries full color).
    // The star sits at the origin, so its distance is just the camera's range.
    // Floor the DRAWN size (never the physical one) so the star stays visible
    // when the whole system is in frame; zoomed in, the true radius takes over.
    const cameraDistance = camera.position.length();
    const perspective = camera instanceof THREE.PerspectiveCamera ? camera : null;
    const compact = appearance.blackHole || appearance.magnetosphere;
    const minPixels = compact ? MIN_REMNANT_PIXELS : MIN_STAR_PIXELS;
    const drawn =
      perspective === null || viewportHeightPx <= 0
        ? appearance.radius
        : apparentRadius(
            appearance.radius,
            cameraDistance,
            perspective.fov,
            viewportHeightPx,
            minPixels,
          );

    // A black hole has no photosphere: the shader sphere is replaced wholesale
    // by the horizon + ring + disc group.
    this.starMesh.visible = !appearance.blackHole;
    this.corona.visible = !appearance.blackHole;

    if (!appearance.blackHole) {
      this.starMesh.scale.setScalar(drawn);
      this.starMaterial.uniforms.uTime!.value = this.elapsed;
      this.starMaterial.uniforms.uDetail!.value = appearance.surfaceDetail;
      const lum = appearance.surfaceLum;
      const core = this.starMaterial.uniforms.uColorCore!.value as THREE.Color;
      core.setRGB(appearance.color.r * lum, appearance.color.g * lum, appearance.color.b * lum);
      // Limb colour: dimmer and only SLIGHTLY warmer than the core. The old
      // per-channel weights (0.7, 0.5, 0.4) desaturated a blue star's limb to
      // grey, and since the limb dominates a small disc the whole star read as
      // white — reported bug 5.
      const edge = this.starMaterial.uniforms.uColorEdge!.value as THREE.Color;
      edge.setRGB(
        appearance.color.r * 0.68 * lum,
        appearance.color.g * 0.6 * lum,
        appearance.color.b * 0.54 * lum,
      );
      this.starMaterial.uniforms.uGlow!.value = appearance.glow;

      // Corona: billboard toward the camera, scale with radius + glow, tint.
      // NB: the corona is a 1x1 plane, so its scale is a DIAMETER — hence the 2x.
      // A generous minimum keeps the halo a smooth, multi-pixel source for the
      // bloom pass; a sub-pixel-bright star fed only the coarsest bloom mips and
      // produced a visibly blocky square of glow around it.
      // Glow is capped in the halo's SIZE (not its brightness): a supernova's
      // glow peaks around 14, and letting the halo grow in proportion turned the
      // explosion into a full-screen white wash instead of a blazing star.
      const coronaRadius = appearance.radius * (3.5 + Math.min(appearance.glow, 4));
      const coronaScale =
        perspective === null || viewportHeightPx <= 0
          ? coronaRadius * 2
          : 2 *
            apparentRadius(
              coronaRadius,
              cameraDistance,
              perspective.fov,
              viewportHeightPx,
              MIN_CORONA_PIXELS,
            );
      this.corona.scale.setScalar(coronaScale);
      this.corona.quaternion.copy(camera.quaternion);
      (this.coronaMaterial.uniforms.uColor!.value as THREE.Color).setRGB(
        appearance.color.r,
        appearance.color.g,
        appearance.color.b,
      );
      this.coronaMaterial.uniforms.uIntensity!.value = Math.min(1, 0.35 + appearance.glow * 0.25);
    }

    this.updateBlastShell(appearance);
    this.updateMagnetosphere(appearance, dt, drawn);
    this.updateBeams(appearance, dt, drawn, camera);
    this.updateBlackHole(appearance, drawn, camera);
  }

  /**
   * Scale, tint and fade the expanding blast shell. Its radius comes straight
   * from the appearance model, so the drawn shock front and the ejecta the
   * kernel actually integrates expand together.
   */
  private updateBlastShell(appearance: StarAppearance): void {
    const visible = appearance.shockwave > 0.001 && appearance.shockwaveRadius > 0;
    this.blastShell.visible = visible;
    if (!visible) {
      return;
    }
    this.blastShell.scale.setScalar(appearance.shockwaveRadius);
    this.blastShellMaterial.uniforms.uIntensity!.value = appearance.shockwave;
    this.blastShellMaterial.uniforms.uTime!.value = this.elapsed;
    (this.blastShellMaterial.uniforms.uColor!.value as THREE.Color).setRGB(
      appearance.shockwaveColor.r,
      appearance.shockwaveColor.g,
      appearance.shockwaveColor.b,
    );
  }

  /** Spin and scale the neutron star's magnetosphere ring. */
  private updateMagnetosphere(appearance: StarAppearance, dt: number, drawn: number): void {
    this.magnetosphere.visible = appearance.magnetosphere;
    if (!appearance.magnetosphere) {
      return;
    }
    this.magnetosphereAngle += MAGNETOSPHERE_SPEED * dt;
    this.magnetosphere.rotation.z = this.magnetosphereAngle;
    this.magnetosphere.scale.setScalar(drawn * 3.1);
    this.magnetosphereMaterial.uniforms.uTime!.value = this.elapsed;
    (this.magnetosphereMaterial.uniforms.uColor!.value as THREE.Color).setRGB(
      appearance.color.r,
      appearance.color.g,
      appearance.color.b,
    );
  }

  /**
   * Sweep the pulsar's twin radiation beams and orient each quad so its plane
   * contains the beam axis AND faces the camera — the standard "light shaft"
   * billboard, which keeps the shader-drawn cone soft from every viewpoint.
   */
  private updateBeams(
    appearance: StarAppearance,
    dt: number,
    drawn: number,
    camera: THREE.Camera,
  ): void {
    for (const beam of this.beams) {
      beam.visible = appearance.pulsarBeam;
    }
    if (!appearance.pulsarBeam) {
      return;
    }
    this.beamAngle += PULSAR_BEAM_SPEED * dt;
    this.beamMaterial.uniforms.uTime!.value = this.elapsed;

    // Magnetic axis: the spin axis (+Y) tilted by MAGNETIC_AXIS_TILT and then
    // rotated by the spin phase — that misalignment IS the lighthouse effect.
    const tilt = MAGNETIC_AXIS_TILT;
    const spin = this.beamAngle;
    this.axis
      .set(-Math.sin(tilt) * Math.cos(spin), Math.cos(tilt), Math.sin(tilt) * Math.sin(spin))
      .normalize();

    // The star sits at the origin, so the view direction is just the camera's.
    this.viewDir.copy(camera.position).normalize();
    this.right.copy(this.axis).cross(this.viewDir);
    if (this.right.lengthSq() < 1e-8) {
      // Looking straight down the beam: any perpendicular will do.
      this.right.set(1, 0, 0).cross(this.axis);
    }
    this.right.normalize();

    const length = drawn * 14;
    const width = drawn * 7;
    for (let i = 0; i < this.beams.length; i += 1) {
      const beam = this.beams[i]!;
      // The second beam points the opposite way out of the other magnetic pole.
      const sign = i === 0 ? 1 : -1;
      this.forward.copy(this.right).cross(this.axis).multiplyScalar(sign);
      this.basis.makeBasis(this.right, this.axis.clone().multiplyScalar(sign), this.forward);
      this.scaleMatrix.makeScale(width, length, 1);
      beam.matrix.multiplyMatrices(this.basis, this.scaleMatrix);
      beam.matrixWorldNeedsUpdate = true;
    }
  }

  /** Position, scale and animate the black hole's horizon, ring and disc. */
  private updateBlackHole(appearance: StarAppearance, drawn: number, camera: THREE.Camera): void {
    this.blackHole.visible = appearance.blackHole;
    if (!appearance.blackHole) {
      return;
    }
    this.horizon.scale.setScalar(drawn);
    // The photon ring is a billboard, so it looks the same from every angle —
    // which is exactly how light bent around a black hole behaves.
    this.photonRing.scale.setScalar(drawn * PHOTON_RING_SCALE);
    this.photonRing.quaternion.copy(camera.quaternion);
    this.photonRingMaterial.uniforms.uIntensity!.value = 1.6 + appearance.glow * 0.6;
    this.accretionDisc.scale.setScalar(drawn);
    this.accretionDiscMaterial.uniforms.uTime!.value = this.elapsed;
    this.accretionDiscMaterial.uniforms.uIntensity!.value = 0.9 + appearance.glow * 0.25;
  }

  dispose(): void {
    for (const mesh of [
      this.starMesh,
      this.corona,
      this.magnetosphere,
      this.horizon,
      this.photonRing,
      this.accretionDisc,
      this.blastShell,
    ]) {
      mesh.geometry.dispose();
    }
    for (const material of [
      this.starMaterial,
      this.coronaMaterial,
      this.beamMaterial,
      this.magnetosphereMaterial,
      this.horizonMaterial,
      this.photonRingMaterial,
      this.accretionDiscMaterial,
      this.blastShellMaterial,
    ]) {
      material.dispose();
    }
    this.beams[0]?.geometry.dispose();
  }
}

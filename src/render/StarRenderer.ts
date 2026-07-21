// Star / red-giant / remnant renderer (spec §3.2, D6).
//
// Owns the central body's visuals: a shader sphere (blackbody surface + fresnel
// corona rim + animated granulation), an additive billboard glow halo, and a
// rotating pulsar beam for the pulsar remnant. All parameters come from the pure
// `starAppearance` model, so this class only maps them onto Three.js objects and
// animates time-based effects. The star sits at the scene origin (it is not a
// kernel body); its stage/mass/remnant come from the simulation orchestrator.

import * as THREE from 'three';
import type { StarAppearance } from './starVisual';
import { coronaFragmentShader, coronaVertexShader } from './shaders/corona';
import { starFragmentShader, starVertexShader } from './shaders/star';

/** Angular speed (rad/s) of the sweeping pulsar beam. */
const PULSAR_BEAM_SPEED = 3.0;

/** Renders the star and its terminal remnant into a single scene group. */
export class StarRenderer {
  readonly group: THREE.Group;

  private readonly starMesh: THREE.Mesh;
  private readonly starMaterial: THREE.ShaderMaterial;
  private readonly corona: THREE.Mesh;
  private readonly coronaMaterial: THREE.ShaderMaterial;
  private readonly beam: THREE.Group;
  private readonly beamMaterial: THREE.MeshBasicMaterial;

  private elapsed = 0;
  private beamAngle = 0;

  constructor() {
    this.group = new THREE.Group();

    // --- Star sphere -------------------------------------------------------
    this.starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color(1, 1, 1) },
        uColorEdge: { value: new THREE.Color(1, 0.6, 0.3) },
        uGlow: { value: 1 },
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

    // --- Pulsar beam (two opposed cones) ----------------------------------
    this.beam = new THREE.Group();
    this.beamMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0.6, 0.85, 1),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const coneGeom = new THREE.ConeGeometry(1.2, 6, 24, 1, true);
    const coneA = new THREE.Mesh(coneGeom, this.beamMaterial);
    coneA.position.set(0, 3, 0);
    const coneB = new THREE.Mesh(coneGeom, this.beamMaterial);
    coneB.position.set(0, -3, 0);
    coneB.rotation.z = Math.PI;
    this.beam.add(coneA);
    this.beam.add(coneB);
    // Tilt the rotation axis so the sweep is visible from a typical camera.
    this.beam.rotation.z = Math.PI / 5;
    this.beam.visible = false;
    this.group.add(this.beam);
  }

  /**
   * Update the star's visuals for this frame. `dt` is real elapsed seconds
   * (drives surface animation + beam sweep); `camera` is used to billboard the
   * corona halo toward the viewer.
   */
  update(appearance: StarAppearance, dt: number, camera: THREE.Camera): void {
    this.elapsed += dt;
    this.group.visible = appearance.visible;
    if (!appearance.visible) {
      return;
    }

    // Star sphere: scale to radius, push blackbody color + glow into uniforms.
    this.starMesh.scale.setScalar(appearance.radius);
    this.starMaterial.uniforms.uTime!.value = this.elapsed;
    const core = this.starMaterial.uniforms.uColorCore!.value as THREE.Color;
    core.setRGB(appearance.color.r, appearance.color.g, appearance.color.b);
    const edge = this.starMaterial.uniforms.uColorEdge!.value as THREE.Color;
    edge.setRGB(appearance.color.r * 0.7, appearance.color.g * 0.5, appearance.color.b * 0.4);
    this.starMaterial.uniforms.uGlow!.value = appearance.glow;

    // Corona: billboard toward the camera, scale with radius + glow, tint.
    const coronaScale = appearance.radius * (3.5 + appearance.glow);
    this.corona.scale.setScalar(coronaScale);
    this.corona.quaternion.copy(camera.quaternion);
    (this.coronaMaterial.uniforms.uColor!.value as THREE.Color).setRGB(
      appearance.color.r,
      appearance.color.g,
      appearance.color.b,
    );
    this.coronaMaterial.uniforms.uIntensity!.value = Math.min(1, 0.35 + appearance.glow * 0.25);

    // Pulsar beam: rotate to visibly sweep, scaled to the compact remnant.
    this.beam.visible = appearance.pulsarBeam;
    if (appearance.pulsarBeam) {
      this.beamAngle += PULSAR_BEAM_SPEED * dt;
      this.beam.rotation.y = this.beamAngle;
      this.beam.scale.setScalar(appearance.radius * 2.5);
    }
  }

  dispose(): void {
    this.starMesh.geometry.dispose();
    this.starMaterial.dispose();
    this.corona.geometry.dispose();
    this.coronaMaterial.dispose();
    this.beamMaterial.dispose();
    this.beam.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
      }
    });
  }
}

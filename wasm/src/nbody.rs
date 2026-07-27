//! Softened Newtonian gravity primitives (spec §4.4, plan "nbody.rs").
//!
//! This module is the numeric core shared by the WASM kernel. It mirrors the
//! pure-TypeScript fallback (`src/sim/TsFallbackKernel.ts`) so the two kernels
//! are interchangeable behind the `PhysicsKernel` contract:
//!
//!   * the illustrative production model is a **central-force** softened collapse
//!     toward the forming core at the origin (`softened_accel`, `integrate_orbit`),
//!     using the exact same constants and integrator as the fallback so buffer
//!     outputs agree (kernel parity);
//!   * a genuine **uniform-grid spatial acceleration** N-body path
//!     (`UniformGrid`, `nbody_accelerations`) is provided and unit-tested for
//!     N-body integration correctness (bound orbit stays bounded, energy roughly
//!     conserved) and future full-N-body use.

use std::collections::HashMap;

/// A 3-component vector in scene units.
pub type Vec3 = [f64; 3];

/// Gravitational constant in scene units (masses in M☉, lengths in scene AU).
/// Matches `GRAVITY` in the TS fallback.
pub const GRAVITY: f64 = 1.0;

/// Softening length (scene units) that removes the 1/r² singularity at r→0.
/// Matches `SOFTENING` in the TS fallback.
pub const SOFTENING: f64 = 0.35;

/// Hard cap on simulated dust particles for interactive frame rates (FR-10).
pub const MAX_PARTICLES: usize = 4000;

/// Maximum integration substeps per kernel `step` call.
pub const MAX_SUBSTEPS: usize = 16;

/// Fixed internal integration timestep (dimensionless visual seconds).
pub const INTERNAL_DT: f64 = 1.0 / 60.0;

// --- Emergent-accretion constants (mirror the TS fallback) ------------------

/// Visual speed-up of the orbital dynamics: effective `mu` = cloud mass × this.
/// Sets the orbital/free-fall timescale so orbits are watchable and the cloud
/// collapses over a reasonable formation phase.
pub const ORBITAL_MASS_SCALE: f64 = 110.0;
/// Reference sim-seconds for the orbital-time compression curve (calibrated to
/// the per-frame `simDt` the Clock produces across the pace range).
pub const ORBITAL_REF: f64 = 2.0e4;
/// Orbital-time units produced per unit of the compression curve.
pub const ORBITAL_TIME_UNIT: f64 = 0.03;
/// Maximum orbital time advanced per `step` (integrator stability).
pub const ORBITAL_MAX: f64 = 0.2;
/// Rate at which vertical (out-of-plane) velocity is dissipated → flattening.
pub const VERTICAL_DAMP: f64 = 1.8;
/// Rate at which vertical POSITION relaxes toward the mid-plane (disc settling).
pub const DISK_SETTLE: f64 = 2.6;
/// Gas drag letting un-accreted dust lose angular momentum and spiral inward to
/// feed the growing star (formation only). Deliberately GENTLE so the cloud
/// drains onto the core GRADUALLY — a stronger drag made the star appear to be
/// born almost immediately. Dissipative and monotonic, so ignition is still
/// reached; it just takes more steps.
pub const GAS_DRAG: f64 = 0.28;

// --- Planet-formation constants (mirror the TS fallback) --------------------

/// Snow line in AU: ices condense beyond it, so solid supply jumps and giants
/// form there. One scene unit is one AU.
pub const SNOW_LINE_AU: f64 = 2.7;
/// Dust retained per sweep INSIDE the snow line (rock/metal only).
pub const ROCKY_ACCRETION_EFFICIENCY: f64 = 0.0001;
/// Extra retention just beyond the snow line (ices + runaway gas capture).
pub const GIANT_ACCRETION_EFFICIENCY: f64 = 0.02;
/// e-folding distance (AU) over which the giant-forming supply thins out.
pub const GIANT_EFOLD_AU: f64 = 7.0;
/// How strongly planetesimals feel the disc's vertical damping vs. the dust.
pub const BODY_DAMP_FRACTION: f64 = 0.02;

/// Fraction of swept dust a planetesimal RETAINS at `distance_au` (mirror of
/// `accretionEfficiency`): rocky worlds inside the snow line, giants just
/// beyond it, ice giants further out.
#[must_use]
pub fn accretion_efficiency(distance_au: f64) -> f64 {
    // NaN-safe: anything not strictly positive yields no accretion.
    if distance_au.is_nan() || distance_au <= 0.0 {
        return 0.0;
    }
    if distance_au < SNOW_LINE_AU {
        return ROCKY_ACCRETION_EFFICIENCY;
    }
    let falloff = (-(distance_au - SNOW_LINE_AU) / GIANT_EFOLD_AU).exp();
    ROCKY_ACCRETION_EFFICIENCY + GIANT_ACCRETION_EFFICIENCY * falloff
}

/// Compress the (astronomically scaled) stellar sim-time increment into a
/// bounded, always-visible amount of orbital time. Mirrors `orbitalStep`.
#[must_use]
pub fn orbital_step(sim_dt_seconds: f64) -> f64 {
    if !sim_dt_seconds.is_finite() || sim_dt_seconds <= 0.0 {
        return 0.0;
    }
    let compressed = ORBITAL_TIME_UNIT * (1.0 + sim_dt_seconds / ORBITAL_REF).ln();
    compressed.clamp(0.0, ORBITAL_MAX)
}

/// Accretion (feeding-zone) radius of a body of the given mass (oligarchic
/// growth heuristic ∝ cube-root of mass). Mirrors `accretionRadius`.
#[must_use]
pub fn accretion_radius(body_mass: f64, cloud_mass: f64) -> f64 {
    let reference = cloud_mass.max(f64::EPSILON);
    // Small so planetesimals only sip from their immediate feeding zone while the
    // central protostar (a far larger sink) swallows the overwhelming bulk of the
    // infalling dust — planets end up a tiny fraction of the stellar mass.
    0.4 + 1.2 * (body_mass.max(0.0) / reference).cbrt()
}

/// Visual radius bounds for celestial bodies, in scene units (= AU). Mirrors
/// the TS fallback's `MIN_BODY_RADIUS` / `MAX_BODY_RADIUS`.
///
/// Solar-System proportions, not arcade ones: Jupiter's true radius is 0.00048
/// AU against a 5.2 AU orbit, so a literal drawing would be sub-pixel. Bodies
/// are exaggerated ~30×, but no further — the largest gas giant is still ~1/3 of
/// the star's radius and ~1/300 of its orbit. Visibility when zoomed out is a
/// RENDERER concern (a minimum apparent size), not a physical one.
pub const MIN_BODY_RADIUS: f64 = 0.004;
pub const MAX_BODY_RADIUS: f64 = 0.016;

/// Visual radii of visiting comets/asteroids, in scene units (= AU).
pub const COMET_RADIUS: f64 = 0.008;
pub const ASTEROID_RADIUS: f64 = 0.006;

/// Visual radius (scene units) of a body from its accreted mass. Mirrors
/// `bodyRadiusFromMass`.
#[must_use]
pub fn body_radius_from_mass(body_mass: f64, cloud_mass: f64) -> f64 {
    // Reference ≈ one Jupiter mass so Jupiter-class planets read as gas giants.
    let reference = (cloud_mass * 1e-3).max(f64::EPSILON);
    let r = 0.0035 + 0.011 * (body_mass.max(0.0) / reference).cbrt();
    r.clamp(MIN_BODY_RADIUS, MAX_BODY_RADIUS)
}

/// Radius at which two growing oligarchs COLLIDE and merge. Mirrors `mergeRadius`.
///
/// Deliberately decoupled from `body_radius_from_mass`: this is a DYNAMICAL
/// radius (overlapping feeding zones plus gravitational focusing, which hugely
/// enlarges a planetesimal's effective cross-section), not the drawn size of the
/// body. Merging on the drawn radius would make the emergent planet count depend
/// on a purely visual choice.
#[must_use]
pub fn merge_radius(body_mass: f64, cloud_mass: f64) -> f64 {
    let reference = (cloud_mass * 1e-3).max(f64::EPSILON);
    let r = 0.026 + 0.085 * (body_mass.max(0.0) / reference).cbrt();
    r.clamp(0.03, 0.12)
}

/// Momentum-conserving merge of two masses' velocities (perfectly inelastic
/// collision). Mirrors `mergedVelocity`.
#[must_use]
pub fn merged_velocity(m1: f64, v1: Vec3, m2: f64, v2: Vec3) -> Vec3 {
    let m = m1 + m2;
    if m <= 0.0 {
        return [0.0, 0.0, 0.0];
    }
    [
        (m1 * v1[0] + m2 * v2[0]) / m,
        (m1 * v1[1] + m2 * v2[1]) / m,
        (m1 * v1[2] + m2 * v2[2]) / m,
    ]
}

/// Euclidean length of a vector.
#[must_use]
pub fn magnitude(v: Vec3) -> f64 {
    (v[0] * v[0] + v[1] * v[1] + v[2] * v[2]).sqrt()
}

/// Softened gravitational acceleration toward the origin (where the core sits)
/// for a body at `pos` around a central `mu = G·M`. The softening removes the
/// singularity so near-core bodies stay numerically stable. Mirrors
/// `softenedAccel` in the TS fallback exactly.
#[must_use]
pub fn softened_accel(mu: f64, softening: f64, pos: Vec3) -> Vec3 {
    let r2 = pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2];
    let denom = (r2 + softening * softening).powf(1.5);
    let factor = if denom > 0.0 { -mu / denom } else { 0.0 };
    [pos[0] * factor, pos[1] * factor, pos[2] * factor]
}

/// Total specific orbital energy under the SOFTENED potential, consistent with
/// [`softened_accel`]. Used for energy-conservation checks (tests / diagnostics).
#[allow(dead_code)]
#[must_use]
pub fn total_specific_energy_softened(mu: f64, softening: f64, pos: Vec3, vel: Vec3) -> f64 {
    let speed = magnitude(vel);
    let r = magnitude(pos);
    0.5 * speed * speed - mu / (r * r + softening * softening).sqrt()
}

/// Keplerian specific orbital energy `v²/2 − μ/r`. Negative ⇒ bound (FR-7).
#[must_use]
pub fn specific_orbital_energy(mu: f64, r: f64, speed: f64) -> f64 {
    let r_safe = r.max(f64::EPSILON);
    0.5 * speed * speed - mu / r_safe
}

/// Whether a body with the given radius/speed is bound (energy < 0).
#[must_use]
pub fn is_bound(mu: f64, r: f64, speed: f64) -> bool {
    specific_orbital_energy(mu, r, speed) < 0.0
}

/// Circular-orbit speed for the SOFTENED central force at radius `r`. Seeding
/// planets with this speed gives near-constant-radius orbits. Mirrors
/// `circularSpeed` in the TS fallback.
#[must_use]
pub fn circular_speed(mu: f64, softening: f64, r: f64) -> f64 {
    let denom = (r * r + softening * softening).powf(1.5);
    if denom > 0.0 {
        ((mu * r * r) / denom).sqrt()
    } else {
        0.0
    }
}

/// Advance a body one symplectic (semi-implicit) Euler substep under the softened
/// central force. Returns fresh position/velocity; the symplectic form keeps
/// bounded orbits bounded and conserves the softened energy well. Mirrors
/// `integrateOrbit` in the TS fallback.
#[must_use]
pub fn integrate_orbit(pos: Vec3, vel: Vec3, mu: f64, softening: f64, h: f64) -> (Vec3, Vec3) {
    let a = softened_accel(mu, softening, pos);
    let nvel: Vec3 = [vel[0] + a[0] * h, vel[1] + a[1] * h, vel[2] + a[2] * h];
    let npos: Vec3 = [
        pos[0] + nvel[0] * h,
        pos[1] + nvel[1] * h,
        pos[2] + nvel[2] * h,
    ];
    (npos, nvel)
}

/// A uniform spatial hash grid over 3D points, used to accelerate neighbour
/// queries for the full pairwise N-body path ("spatial acceleration"). Points
/// are bucketed into cubic cells of side `cell`; [`UniformGrid::neighbors`]
/// returns candidate indices from the 27 cells surrounding a query point.
///
/// This is the spatial-acceleration structure for the full pairwise N-body path
/// (`nbody_accelerations`); the illustrative production `step` uses the O(N)
/// central-force model for fallback parity, so these items are reserved for the
/// full-N-body mode and exercised by unit tests.
#[allow(dead_code)]
pub struct UniformGrid {
    cell: f64,
    buckets: HashMap<(i64, i64, i64), Vec<usize>>,
}

#[allow(dead_code)]
impl UniformGrid {
    /// Build a grid bucketing `points` into cells of side `cell` (must be > 0).
    #[must_use]
    pub fn build(points: &[Vec3], cell: f64) -> Self {
        let cell = if cell > 0.0 { cell } else { 1.0 };
        let mut buckets: HashMap<(i64, i64, i64), Vec<usize>> = HashMap::new();
        for (i, p) in points.iter().enumerate() {
            buckets.entry(Self::cell_of(*p, cell)).or_default().push(i);
        }
        Self { cell, buckets }
    }

    fn cell_of(p: Vec3, cell: f64) -> (i64, i64, i64) {
        (
            (p[0] / cell).floor() as i64,
            (p[1] / cell).floor() as i64,
            (p[2] / cell).floor() as i64,
        )
    }

    /// Candidate neighbour indices from the 27 cells surrounding `p`.
    #[must_use]
    pub fn neighbors(&self, p: Vec3) -> Vec<usize> {
        let (cx, cy, cz) = Self::cell_of(p, self.cell);
        let mut out = Vec::new();
        for dx in -1..=1 {
            for dy in -1..=1 {
                for dz in -1..=1 {
                    if let Some(idx) = self.buckets.get(&(cx + dx, cy + dy, cz + dz)) {
                        out.extend_from_slice(idx);
                    }
                }
            }
        }
        out
    }
}

/// Full pairwise softened-gravity accelerations using a uniform grid to restrict
/// summation to neighbours within `cutoff` (spec: "softened gravity with spatial
/// acceleration"). Bodies farther than `cutoff` are ignored (their contribution
/// is negligible for the illustrative model). Returned in input order.
#[allow(dead_code)]
#[must_use]
pub fn nbody_accelerations(
    points: &[Vec3],
    masses: &[f64],
    g: f64,
    softening: f64,
    cutoff: f64,
) -> Vec<Vec3> {
    let grid = UniformGrid::build(points, cutoff.max(f64::EPSILON));
    let soft2 = softening * softening;
    let cutoff2 = cutoff * cutoff;
    let mut acc = vec![[0.0f64; 3]; points.len()];
    for i in 0..points.len() {
        let pi = points[i];
        let mut ai = [0.0f64; 3];
        for j in grid.neighbors(pi) {
            if j == i {
                continue;
            }
            let dx = points[j][0] - pi[0];
            let dy = points[j][1] - pi[1];
            let dz = points[j][2] - pi[2];
            let r2 = dx * dx + dy * dy + dz * dz;
            if r2 > cutoff2 {
                continue;
            }
            let inv = g * masses[j] / (r2 + soft2).powf(1.5);
            ai[0] += dx * inv;
            ai[1] += dy * inv;
            ai[2] += dz * inv;
        }
        acc[i] = ai;
    }
    acc
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn softened_accel_points_toward_origin() {
        let a = softened_accel(1.0, 1.0, [10.0, 0.0, 0.0]);
        assert!(a[0] < 0.0, "acceleration should point back toward origin");
        assert_eq!(a[1], 0.0);
        assert_eq!(a[2], 0.0);
    }

    #[test]
    fn is_bound_matches_escape_speed_boundary() {
        let mu = 1.0_f64;
        let r = 10.0_f64;
        let escape = (2.0 * mu / r).sqrt();
        assert!(is_bound(mu, r, escape * 0.99));
        assert!(!is_bound(mu, r, escape * 1.01));
    }

    #[test]
    fn central_force_orbit_stays_bounded_and_conserves_energy() {
        // Mirrors the TS `integrateOrbit` two-body sanity test.
        let mu = 1.0;
        let softening = 0.1;
        let r0 = 10.0;
        let vc = circular_speed(mu, softening, r0);
        let mut pos = [r0, 0.0, 0.0];
        let mut vel = [0.0, vc, 0.0];
        let e0 = total_specific_energy_softened(mu, softening, pos, vel);

        let h = 0.01;
        let mut min_r = r0;
        let mut max_r = r0;
        let mut max_drift = 0.0f64;
        for _ in 0..20_000 {
            let (np, nv) = integrate_orbit(pos, vel, mu, softening, h);
            pos = np;
            vel = nv;
            let r = magnitude(pos);
            min_r = min_r.min(r);
            max_r = max_r.max(r);
            let e = total_specific_energy_softened(mu, softening, pos, vel);
            max_drift = max_drift.max(((e - e0) / e0).abs());
        }
        assert!(min_r > r0 * 0.8, "orbit spiralled inward: min_r={min_r}");
        assert!(max_r < r0 * 1.2, "orbit spiralled outward: max_r={max_r}");
        assert!(max_drift < 0.05, "energy drifted: {max_drift}");
    }

    #[test]
    fn pairwise_grid_two_body_orbit_is_bounded() {
        // A light body orbiting a heavy body via the full pairwise/grid path.
        // With a heavy central mass at the origin this reduces to a Kepler orbit.
        let g = 1.0_f64;
        let soft = 0.05_f64;
        let heavy = 1000.0_f64;
        let light = 1.0e-6_f64;
        let r0 = 8.0_f64;
        // Circular speed about the heavy central mass.
        let vc = (g * heavy / r0).sqrt();
        let mut pos = [[0.0, 0.0, 0.0], [r0, 0.0, 0.0]];
        let mut vel = [[0.0, 0.0, 0.0], [0.0, vc, 0.0]];
        let masses = [heavy, light];
        let cutoff = 100.0; // large enough to always include both bodies

        let h = 0.001;
        let mut min_r = r0;
        let mut max_r = r0;
        for _ in 0..20_000 {
            let acc = nbody_accelerations(&pos, &masses, g, soft, cutoff);
            for k in 0..pos.len() {
                for d in 0..3 {
                    vel[k][d] += acc[k][d] * h;
                    pos[k][d] += vel[k][d] * h;
                }
            }
            let dx = pos[1][0] - pos[0][0];
            let dy = pos[1][1] - pos[0][1];
            let dz = pos[1][2] - pos[0][2];
            let r = (dx * dx + dy * dy + dz * dz).sqrt();
            min_r = min_r.min(r);
            max_r = max_r.max(r);
        }
        assert!(min_r > r0 * 0.7, "pairwise orbit collapsed: min_r={min_r}");
        assert!(max_r < r0 * 1.3, "pairwise orbit escaped: max_r={max_r}");
    }

    #[test]
    fn uniform_grid_finds_close_neighbours() {
        let points = vec![[0.0, 0.0, 0.0], [0.5, 0.0, 0.0], [100.0, 0.0, 0.0]];
        let grid = UniformGrid::build(&points, 1.0);
        let near = grid.neighbors([0.0, 0.0, 0.0]);
        assert!(near.contains(&0));
        assert!(near.contains(&1));
        assert!(!near.contains(&2), "far point must not be a neighbour");
    }
}

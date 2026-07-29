//! Softened Newtonian gravity primitives (spec §4.4, plan "nbody.rs").
//!
//! This module is the numeric core of the WASM kernel, and the single source of
//! truth for the model's constants and formulae — nothing outside this crate
//! reimplements them:
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
pub const MAX_SUBSTEPS: usize = 64;

/// Largest internal integration timestep (dimensionless visual seconds).
pub const INTERNAL_DT: f64 = 1.0 / 60.0;

/// Largest orbital phase angle (radians) one substep may advance — the CFL-type
/// accuracy condition `h * omega <= ORBIT_RESOLUTION` for the FASTEST orbit in
/// the system (mirror of `ORBIT_RESOLUTION` in the TS fallback).
///
/// Semi-implicit Euler is symplectic only CONDITIONALLY: its energy error grows
/// with `h * omega` and it destabilizes past `h * omega ~ 2`. Since
/// `omega = sqrt(mu / (r^2 + eps^2)^1.5)` grows with cloud mass and shrinks with
/// orbit size, a heavy COMPACT cloud (78 M_sun across only 25 AU) under-sampled
/// its innermost orbit and the integrator MANUFACTURED energy — the inner planet
/// flipped from bound to unbound in one step and was flung to r ~ 550 AU with no
/// physical cause. Bounding the substep by the shortest dynamical time actually
/// present fixes it; 0.3 rad is ~21 substeps per innermost orbit.
pub const ORBIT_RESOLUTION: f64 = 0.3;

/// PERIAPSIS distance of the conic a body is on: `q = L^2 / (mu (1 + e))` with
/// `e = sqrt(1 + 2 E L^2 / mu^2)` (mirror of `periapsisDistance`).
///
/// Closest approach — not the body's present distance — is where an orbit is
/// hardest to integrate, because that is where it moves fastest. A planet
/// sitting quietly at 3.2 AU can be diving to 1.0 AU inside the very next step,
/// and a timestep chosen for 3.2 AU badly under-resolves that passage; that is
/// exactly where the integrator still manufactured energy after a CFL guard
/// keyed on the CURRENT radius. The `p/(1+e)` form stays finite for
/// near-parabolic orbits and is valid for hyperbolic ones too.
#[must_use]
pub fn periapsis_distance(mu: f64, pos: Vec3, vel: Vec3) -> f64 {
    let r = magnitude(pos);
    let v2 = vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2];
    let l = [
        pos[1] * vel[2] - pos[2] * vel[1],
        pos[2] * vel[0] - pos[0] * vel[2],
        pos[0] * vel[1] - pos[1] * vel[0],
    ];
    let l2 = l[0] * l[0] + l[1] * l[1] + l[2] * l[2];
    if !(mu > 0.0) || !l2.is_finite() {
        return r;
    }
    let energy = 0.5 * v2 - mu / (r * r + SOFTENING * SOFTENING).sqrt();
    let ecc = (1.0 + (2.0 * energy * l2) / (mu * mu)).max(0.0).sqrt();
    let q = l2 / (mu * (1.0 + ecc));
    if q.is_finite() {
        q.min(r)
    } else {
        r
    }
}

/// Largest substep that still resolves an orbit whose closest approach to the
/// star is `r_min`, per the `ORBIT_RESOLUTION` condition. Never exceeds
/// `INTERNAL_DT`.
#[must_use]
pub fn stable_substep(mu: f64, softening: f64, r_min: f64) -> f64 {
    let r2 = r_min.max(0.0).powi(2) + softening * softening;
    let omega = (mu.max(0.0) / r2.powf(1.5)).sqrt();
    if !(omega > 0.0) || !omega.is_finite() {
        return INTERNAL_DT;
    }
    INTERNAL_DT.min(ORBIT_RESOLUTION / omega)
}

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
pub const ROCKY_ACCRETION_EFFICIENCY: f64 = 3e-6;
/// Base retention beyond the snow line (ices + runaway gas capture).
pub const GIANT_ACCRETION_EFFICIENCY: f64 = 0.008;
/// How steeply the giant-forming retention RISES with distance beyond the snow
/// line, before `GIANT_EFOLD_AU` cuts it off again.
///
/// This exponent is what puts the gas giants where they belong. The RATE at
/// which a body sweeps dust falls as ~r^-1.5 (the disc thins outward and orbits
/// are slower), so a retention curve peaking AT the snow line handed the biggest
/// planet to whichever seed sat closest to the star. Rising as (r/snow)^2.4
/// over-compensates that gradient, so supply × retention peaks near ~6 AU.
pub const GIANT_RISE_EXPONENT: f64 = 1.4;
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
    let rise = (distance_au / SNOW_LINE_AU).powf(GIANT_RISE_EXPONENT);
    let falloff = (-(distance_au - SNOW_LINE_AU) / GIANT_EFOLD_AU).exp();
    (ROCKY_ACCRETION_EFFICIENCY + GIANT_ACCRETION_EFFICIENCY * rise * falloff).min(1.0)
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

/// Earth masses per solar mass. Mirrors `EARTH_MASSES_PER_SOLAR` in the TS
/// fallback and in `lib.rs`.
const EARTH_MASSES_PER_SOLAR: f64 = 332_946.0;

/// Earth radius in AU — rocky-planet normalisation point (spec §3.2).
const R_EARTH_AU: f64 = 4.26e-5;

/// Jupiter radius in AU — near-constant giant-regime limit (spec §3.2).
const R_JUPITER_AU: f64 = 4.78e-4;

/// ln(2 M⊕) — lower bound of the rocky-to-giant log-space transition.
const LOG_ROCKY_THRESH: f64 = std::f64::consts::LN_2;

/// ln(100 M⊕) — upper bound of the rocky-to-giant log-space transition.
const LOG_GIANT_THRESH: f64 = 4.605_170_185_988_092_f64; // ln(100)

/// Visual radius bounds for celestial bodies, in scene units (= AU). Mirrors
/// the TS fallback's `MIN_BODY_RADIUS` / `MAX_BODY_RADIUS`.
///
/// Bodies are drawn at TRUE physical scale (spec §3.2). Visibility when zoomed
/// out is a RENDERER concern (a minimum apparent size in `screenScale.ts`),
/// not a physical one.
pub const MIN_BODY_RADIUS: f64 = 1e-5;
pub const MAX_BODY_RADIUS: f64 = 8e-4;

/// Visual radii of visiting comets/asteroids, in scene units (= AU).
pub const COMET_RADIUS: f64 = 1e-5;
pub const ASTEROID_RADIUS: f64 = 8e-6;

/// Visual radius (scene units) of a body from its accreted mass using a
/// physical mass–radius relation (spec §3.2). Mirrors `bodyRadiusFromMass`.
///
/// - Rocky (< ~2 M⊕):  `4.26e-5 · (M/M⊕)^0.27`  (Earth = 4.26e-5 AU)
/// - Giant (> ~100 M⊕): ≈ 4.78e-4 AU  (1 R♃, degenerate EOS)
/// - Transition:         log-space blend between the two regimes.
///
/// `_cloud_mass` is retained for API compatibility but is NOT used; the
/// relation is absolute (depends only on the body's own mass).
#[must_use]
pub fn body_radius_from_mass(body_mass: f64, _cloud_mass: f64) -> f64 {
    let m_e = body_mass.max(0.0) * EARTH_MASSES_PER_SOLAR;
    let m_e_safe = m_e.max(1e-10);
    // Rocky end: constant-density power law anchored to Earth.
    let r_rocky = R_EARTH_AU * m_e_safe.powf(0.27);
    // Log-space blend from rocky (2 M⊕) to giant (100 M⊕) regime.
    let log_me = m_e_safe.ln();
    let t = ((log_me - LOG_ROCKY_THRESH) / (LOG_GIANT_THRESH - LOG_ROCKY_THRESH))
        .clamp(0.0, 1.0);
    // Blend in log(R) space to avoid kinks at the transition boundaries.
    let log_r = (1.0 - t) * r_rocky.ln() + t * R_JUPITER_AU.ln();
    log_r.exp().clamp(MIN_BODY_RADIUS, MAX_BODY_RADIUS)
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

/// Advance a body one VELOCITY-VERLET substep under the softened central force
/// (mirror of `integrateOrbit`):
///
///   v_half = v + a(x)*h/2 ;  x' = x + v_half*h ;  v' = v_half + a(x')*h/2
///
/// Symplectic (bounded orbits stay bounded, no secular drift) and second-order —
/// but the reason it replaced semi-implicit Euler is that its position and
/// velocity are SYNCHRONIZED.
///
/// Euler's are not: it returns `v` a half-step ahead of `x`, so the pair is not a
/// point on the true trajectory. The instantaneous energy computed from it
/// oscillates by O(h*omega), largest exactly at periapsis where the body moves
/// fastest — and that is the number the simulation makes DECISIONS from. A
/// marginally-bound eccentric planet was reported unbound on every perihelion
/// pass (E flipping -46 -> +15 and back, while the orbit never changed), and a
/// visitor's capture-or-escape is classified from the same quantity. Verlet's
/// error is O(h^2) and synchronized, so the reported state IS the physical state.
#[must_use]
pub fn integrate_orbit(pos: Vec3, vel: Vec3, mu: f64, softening: f64, h: f64) -> (Vec3, Vec3) {
    let half = 0.5 * h;
    let a0 = softened_accel(mu, softening, pos);
    let v_half: Vec3 = [
        vel[0] + a0[0] * half,
        vel[1] + a0[1] * half,
        vel[2] + a0[2] * half,
    ];
    let npos: Vec3 = [
        pos[0] + v_half[0] * h,
        pos[1] + v_half[1] * h,
        pos[2] + v_half[2] * h,
    ];
    let a1 = softened_accel(mu, softening, npos);
    let nvel: Vec3 = [
        v_half[0] + a1[0] * half,
        v_half[1] + a1[1] * half,
        v_half[2] + a1[2] * half,
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

    // ---- accretion_efficiency (snow line) -----------------------------------

    #[test]
    fn accretion_efficiency_is_low_and_flat_inside_snow_line() {
        // Rocky zone: same constant retention for any distance below the snow
        // line; positive but tiny — planets in that zone grow slowly.
        let a = accretion_efficiency(0.7);
        let b = accretion_efficiency(2.0);
        assert_eq!(
            a, b,
            "efficiency should be the same flat value anywhere inside the snow line"
        );
        assert!(a > 0.0, "rocky efficiency should be non-zero");
        assert!(a < 0.001, "rocky efficiency should be tiny, got {a}");
    }

    #[test]
    fn accretion_efficiency_jumps_sharply_beyond_snow_line() {
        // The ice + gas-capture transition is the dominant feature of the disc
        // model: immediately past the snow line, retention is >50× higher than
        // in the rocky zone, seeding the giant-forming region.
        let inside = accretion_efficiency(SNOW_LINE_AU - 0.1);
        let outside = accretion_efficiency(SNOW_LINE_AU + 0.1);
        assert!(
            outside > inside * 50.0,
            "giant-zone efficiency ({outside}) should be >50× rocky ({inside})"
        );
    }

    #[test]
    fn accretion_efficiency_rises_then_thins_beyond_snow_line() {
        // Bug-guard: the curve must RISE past the snow line before falling off.
        // A monotone-decreasing curve after the snow line would hand the biggest
        // planet to the innermost seed — the very bug this exponent fixes.
        assert!(
            accretion_efficiency(10.0) > accretion_efficiency(3.0),
            "efficiency should still be rising at 10 AU vs 3 AU"
        );
        assert!(
            accretion_efficiency(30.0) < accretion_efficiency(10.0),
            "efficiency should be falling at 30 AU vs 10 AU"
        );
    }

    #[test]
    fn accretion_efficiency_peaks_well_beyond_snow_line() {
        // The giant-forming supply peak must lie well outside the snow line so
        // that the biggest planets form in the outer disc (≈ Jupiter/Saturn).
        let mut best = 0.0f64;
        let mut best_au = 0.0f64;
        let mut au = 0.5f64;
        while au <= 60.0 {
            let e = accretion_efficiency(au);
            if e > best {
                best = e;
                best_au = au;
            }
            au += 0.1;
        }
        assert!(
            best_au > SNOW_LINE_AU * 2.0,
            "peak at {best_au} AU should be well outside 2× snow line ({:.1} AU)",
            SNOW_LINE_AU * 2.0
        );
        assert!(best_au < 20.0, "peak at {best_au} AU should be < 20 AU");
    }

    #[test]
    fn accretion_efficiency_never_exceeds_one() {
        // Physical invariant: a planetesimal can retain at most 100 % of the
        // swept mass — more would violate mass conservation.
        let mut au = 0.1f64;
        while au <= 200.0 {
            let e = accretion_efficiency(au);
            assert!(e <= 1.0, "efficiency {e} > 1.0 at {au} AU");
            au += 0.5;
        }
    }

    #[test]
    fn accretion_efficiency_returns_zero_for_degenerate_distances() {
        // Zero and negative distances are non-physical; returning 0 prevents
        // them from polluting the accretion calculus with NaN or a rocky value.
        assert_eq!(accretion_efficiency(0.0), 0.0);
        assert_eq!(accretion_efficiency(-1.0), 0.0);
    }

    // ---- body_radius_from_mass ----------------------------------------------

    #[test]
    fn body_radius_grows_with_mass_and_stays_in_sane_range() {
        // Masses spanning rocky → transition → giant zones (in solar masses).
        // The radius must grow monotonically and remain within the clamped range.
        let small = body_radius_from_mass(1e-4, 1.0); // ~33 M⊕ — transition zone
        let big = body_radius_from_mass(8e-4, 1.0); // ~266 M⊕ — giant zone
        assert!(big > small, "radius should grow with mass");
        assert!(
            small >= MIN_BODY_RADIUS,
            "radius {small} should be >= MIN_BODY_RADIUS {MIN_BODY_RADIUS}"
        );
        assert!(
            big <= MAX_BODY_RADIUS,
            "radius {big} should be <= MAX_BODY_RADIUS {MAX_BODY_RADIUS}"
        );
    }

    #[test]
    fn body_radius_anchors_earth_and_jupiter() {
        // Physical mass–radius anchors (spec §3.2). Earth within 20 %, Jupiter
        // within 5 %, so the radii read as plausible at true scale.
        let earth_mass_solar = 1.0_f64 / 332_946.0;
        let jupiter_mass_solar = 317.8_f64 / 332_946.0;
        let r_earth_au = 4.26e-5_f64;
        let r_jupiter_au = 4.78e-4_f64;

        let earth_r = body_radius_from_mass(earth_mass_solar, 1.0);
        assert!(
            earth_r > r_earth_au * 0.8,
            "Earth radius {earth_r} too small (expected > {:.2e})",
            r_earth_au * 0.8
        );
        assert!(
            earth_r < r_earth_au * 1.2,
            "Earth radius {earth_r} too large (expected < {:.2e})",
            r_earth_au * 1.2
        );

        let jup_r = body_radius_from_mass(jupiter_mass_solar, 1.0);
        assert!(
            jup_r > r_jupiter_au * 0.95,
            "Jupiter radius {jup_r} too small (expected > {:.2e})",
            r_jupiter_au * 0.95
        );
        assert!(
            jup_r < r_jupiter_au * 1.05,
            "Jupiter radius {jup_r} too large (expected < {:.2e})",
            r_jupiter_au * 1.05
        );
    }

    #[test]
    fn heaviest_body_clamps_to_max_body_radius_and_stays_below_sun() {
        // The very heaviest synthetic body is clamped to MAX_BODY_RADIUS, and
        // that cap must sit well below the solar radius (spec §3.2: bodies are
        // visually tiny compared to the star).
        let heaviest = body_radius_from_mass(1e6, 1.0);
        assert!(
            heaviest <= MAX_BODY_RADIUS,
            "heaviest body radius {heaviest} must be <= MAX_BODY_RADIUS {MAX_BODY_RADIUS}"
        );
        // Solar radius at 1 M☉ ≈ 4.65e-3 AU (spec §3.2 anchor).
        let solar_radius_au = 4.65e-3_f64;
        assert!(
            MAX_BODY_RADIUS < solar_radius_au,
            "MAX_BODY_RADIUS {MAX_BODY_RADIUS} must be < solar radius {solar_radius_au}"
        );
        // Tighter sanity-bound: planet radius cap below 1e-3 AU (compile-time).
        const { assert!(MAX_BODY_RADIUS < 1e-3) };
    }

    // ---- accretion_radius ---------------------------------------------------

    #[test]
    fn accretion_radius_grows_with_body_mass() {
        // Oligarchic growth: a larger body commands a wider feeding zone, so
        // accretion_radius must be strictly monotonic in body mass.
        let small = accretion_radius(0.001, 1.0);
        let big = accretion_radius(0.05, 1.0);
        assert!(
            big > small,
            "feeding-zone radius should grow with body mass: small={small}, big={big}"
        );
    }

    // ---- merge_radius -------------------------------------------------------

    #[test]
    fn merge_radius_exceeds_visual_radius_and_is_monotonic() {
        // The dynamical (merging) radius is intentionally decoupled from the
        // drawn (visual) radius: merging on the visual radius would make the
        // emergent planet count depend on a cosmetic choice. Must be > 3× the
        // visual radius so it represents a real dynamical feeding zone.
        assert!(
            merge_radius(1e-5, 1.0) > body_radius_from_mass(1e-5, 1.0) * 3.0,
            "merge_radius should be > 3× body_radius for small mass"
        );
        assert!(
            merge_radius(1e-3, 1.0) > body_radius_from_mass(1e-3, 1.0) * 3.0,
            "merge_radius should be > 3× body_radius for large mass"
        );
        // Still monotonic: a heavier oligarch has a larger merge radius.
        assert!(
            merge_radius(1e-3, 1.0) > merge_radius(1e-6, 1.0),
            "merge_radius should be monotonic in body mass"
        );
        // Compile-time: the visual radius bounds must be consistently ordered.
        const { assert!(MIN_BODY_RADIUS < MAX_BODY_RADIUS) };
    }

    // ---- orbital_step -------------------------------------------------------

    #[test]
    fn orbital_step_is_zero_when_paused_or_invalid() {
        // An integrator called with dt ≤ 0 or non-finite must not advance the
        // orbital phase — the simulation is paused or given junk input.
        assert_eq!(orbital_step(0.0), 0.0);
        assert_eq!(orbital_step(-5.0), 0.0);
        assert_eq!(orbital_step(f64::NAN), 0.0);
    }

    #[test]
    fn orbital_step_increases_with_sim_time_and_saturates_at_cap() {
        // A small sim-dt advances less phase than a large one, and extremely
        // large values are clamped to ORBITAL_MAX to keep the integrator stable
        // — an unbounded phase advance would skip over entire orbits.
        let small = orbital_step(1.0e4);
        let large = orbital_step(1.0e7);
        assert!(large > small, "orbital step should increase with sim time");
        assert!(large <= ORBITAL_MAX, "orbital step must not exceed ORBITAL_MAX");
        assert!(
            orbital_step(1.0e30) <= ORBITAL_MAX,
            "astronomically large dt must be clamped to ORBITAL_MAX"
        );
        assert!(
            (orbital_step(1.0e30) - ORBITAL_MAX).abs() < 1e-12,
            "orbital step for huge dt should be exactly ORBITAL_MAX"
        );
    }

    // ---- merged_velocity ----------------------------------------------------

    #[test]
    fn merged_velocity_conserves_momentum() {
        // Perfectly inelastic collision: v_merged = (m1·v1 + m2·v2) / (m1+m2).
        // p = 2·(+1) + 1·(−1) = 1; total mass = 3 → v = 1/3.
        let v = merged_velocity(2.0, [1.0, 0.0, 0.0], 1.0, [-1.0, 0.0, 0.0]);
        assert!(
            (v[0] - 1.0 / 3.0).abs() < 1e-12,
            "x component: expected 1/3, got {}",
            v[0]
        );
        assert!(v[1].abs() < 1e-12, "y component: expected 0, got {}", v[1]);
    }

    #[test]
    fn merged_velocity_equals_shared_velocity_when_both_move_alike() {
        // When both bodies have the same velocity, the merged velocity must
        // reproduce it exactly regardless of the mass ratio.
        let shared = [0.5_f64, -0.2, 0.1];
        let v = merged_velocity(3.0, shared, 5.0, shared);
        assert!((v[0] - 0.5).abs() < 1e-12, "x: got {}", v[0]);
        assert!((v[1] - (-0.2)).abs() < 1e-12, "y: got {}", v[1]);
        assert!((v[2] - 0.1).abs() < 1e-12, "z: got {}", v[2]);
    }
}

#[cfg(test)]
mod cfl_tests {
    use super::*;

    #[test]
    fn substep_always_satisfies_the_orbit_resolution_condition() {
        // h * omega <= ORBIT_RESOLUTION for the fastest orbit present, and never
        // above the fixed ceiling for slow ones. Violating this is what let
        // semi-implicit Euler manufacture energy and eject an inner planet.
        for mu in [50.0_f64, 200.0, 1000.0, 5000.0] {
            for r in [0.3_f64, 1.0, 5.0, 40.0] {
                let h = stable_substep(mu, SOFTENING, r);
                let omega = (mu / (r * r + SOFTENING * SOFTENING).powf(1.5)).sqrt();
                assert!(h * omega <= ORBIT_RESOLUTION + 1e-9);
                assert!(h <= INTERNAL_DT + 1e-12);
                assert!(h > 0.0);
            }
        }
    }

    #[test]
    fn periapsis_is_below_the_current_radius_for_an_eccentric_orbit() {
        // Closest approach is where a body moves fastest, so that is what must
        // size the substep: a planet at 3.2 AU can be diving to ~1 AU next step.
        let pos = [3.2, 0.0, 0.0];
        let vel = [0.0, 0.0, circular_speed(400.0, SOFTENING, 3.2) * 0.45];
        let q = periapsis_distance(400.0, pos, vel);
        assert!(q > 0.0 && q < 1.2, "periapsis {q} not inside the orbit");
        assert!(
            stable_substep(400.0, SOFTENING, q) < stable_substep(400.0, SOFTENING, magnitude(pos))
        );
    }

    #[test]
    fn periapsis_of_a_circular_orbit_is_the_orbit_radius_but_never_larger() {
        // The estimate mixes the SOFTENED energy with the Kepler conic formula,
        // so it slightly UNDER-states the periapsis (~9% at 4 AU). That error is
        // in the safe direction: a smaller periapsis buys a finer substep, so
        // the guard can only ever over-resolve, never under-resolve, an orbit.
        let r = 4.0;
        let pos = [r, 0.0, 0.0];
        let vel = [0.0, 0.0, circular_speed(400.0, SOFTENING, r)];
        let q = periapsis_distance(400.0, pos, vel);
        assert!(
            q <= r,
            "periapsis {q} must not exceed the current radius {r}"
        );
        assert!(
            q > 0.8 * r,
            "periapsis {q} unreasonably below the radius {r}"
        );
    }
}

//! Celestial-body integration, visiting comet/asteroid spawn, and capture logic
//! (spec §4.5, FR-6, FR-7). Rust twin of the body-handling half of
//! `src/sim/TsFallbackKernel.ts`; the deterministic RNG, seeding order and
//! capture/ejection rules are replicated exactly for kernel parity.

use crate::nbody::{is_bound, magnitude, Vec3, ASTEROID_RADIUS, COMET_RADIUS};

/// Kinds of orbiting/visiting bodies. Numeric values MUST match the TypeScript
/// `BodyType` enum ordering (`src/sim/PhysicsKernel.ts`). The full contract is
/// retained even though this kernel does not (yet) construct every variant
/// (`Planet` is a renderer-side promotion of a `Protoplanet`).
#[allow(dead_code)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum BodyType {
    Protoplanet = 0,
    Planet = 1,
    Comet = 2,
    Asteroid = 3,
}

/// A celestial body integrated by the kernel (spec §4.5).
#[derive(Clone, Copy, Debug)]
pub struct CelestialBody {
    pub id: f64,
    pub kind: BodyType,
    pub mass: f64,
    pub radius: f64,
    pub pos: Vec3,
    pub vel: Vec3,
    pub spin: f64,
    pub captured: bool,
}

/// Deterministic 32-bit PRNG (mulberry32). Bit-for-bit twin of the TypeScript
/// `mulberry32`, so a shared seed yields the same float stream on both kernels.
pub struct Mulberry32 {
    state: u32,
}

impl Mulberry32 {
    /// Seed the generator.
    #[must_use]
    pub fn new(seed: u32) -> Self {
        Self { state: seed }
    }

    /// Next float in [0, 1). Mirrors the JS implementation's `Math.imul` /
    /// unsigned-shift semantics via wrapping u32 arithmetic.
    pub fn next_f64(&mut self) -> f64 {
        self.state = self.state.wrapping_add(0x6d2b_79f5);
        let mut t = self.state;
        t = (t ^ (t >> 15)).wrapping_mul(t | 1);
        t ^= t.wrapping_add((t ^ (t >> 7)).wrapping_mul(t | 61));
        f64::from(t ^ (t >> 14)) / 4_294_967_296.0
    }
}

/// Fold a configuration into a stable 32-bit seed. Bit-for-bit twin of the
/// TypeScript `seedFromConfig` (FNV-style mix over truncated fixed-point bits).
#[must_use]
pub fn seed_from_config(
    mass: f64,
    cloud_extent: f64,
    pace: f64,
    h: f64,
    he: f64,
    metals: f64,
) -> u32 {
    let nums = [mass, cloud_extent, pace, h, he, metals];
    let mut hash: u32 = 0x811c_9dc5;
    for n in nums {
        // `Math.trunc(n * 1e6) >>> 0` — truncate toward zero, then take low 32 bits.
        let bits = ((n * 1.0e6).trunc() as i64) as u32;
        hash = (hash ^ (bits & 0xffff)).wrapping_mul(0x0100_0193);
        hash = (hash ^ (bits >> 16)).wrapping_mul(0x0100_0193);
    }
    hash
}

/// Classification of a visiting body's fate at a given instant (mirror of the
/// TS `VisitorClassification`).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum VisitorClassification {
    Captured,
    Ejected,
    Transit,
}

/// Classify a visiting comet/asteroid (FR-7). Bound ⇒ captured; unbound and
/// receding past the boundary ⇒ ejected; otherwise still in transit. Mirrors
/// `classifyVisitor`.
#[must_use]
pub fn classify_visitor(mu: f64, pos: Vec3, vel: Vec3, eject_radius: f64) -> VisitorClassification {
    let r = magnitude(pos);
    let speed = magnitude(vel);
    if is_bound(mu, r, speed) {
        return VisitorClassification::Captured;
    }
    let radial_velocity = if r > 0.0 {
        (pos[0] * vel[0] + pos[1] * vel[1] + pos[2] * vel[2]) / r
    } else {
        0.0
    };
    if r >= eject_radius && radial_velocity > 0.0 {
        VisitorClassification::Ejected
    } else {
        VisitorClassification::Transit
    }
}

/// A unit vector perpendicular to `axis`, rotated by `angle` around it — i.e. an
/// arbitrary direction in the plane normal to `axis`. Mirrors `perpendicularTo`.
///
/// Used to give an incoming visitor a tangential velocity component (a non-zero
/// impact parameter), which is what turns a degenerate radial plunge into a real
/// hyperbolic fly-by.
#[must_use]
pub fn perpendicular_to(axis: Vec3, angle: f64) -> Vec3 {
    let len = magnitude(axis);
    if len <= 0.0 || !len.is_finite() {
        return [1.0, 0.0, 0.0];
    }
    let a: Vec3 = [axis[0] / len, axis[1] / len, axis[2] / len];
    // Pick any reference not parallel to the axis, then build an orthonormal pair.
    let reference: Vec3 = if a[1].abs() < 0.9 {
        [0.0, 1.0, 0.0]
    } else {
        [1.0, 0.0, 0.0]
    };
    let e1: Vec3 = [
        a[1] * reference[2] - a[2] * reference[1],
        a[2] * reference[0] - a[0] * reference[2],
        a[0] * reference[1] - a[1] * reference[0],
    ];
    let e1_len = magnitude(e1);
    if e1_len <= 0.0 || !e1_len.is_finite() {
        return [1.0, 0.0, 0.0];
    }
    let u: Vec3 = [e1[0] / e1_len, e1[1] / e1_len, e1[2] / e1_len];
    // v = a x u completes the right-handed basis of the perpendicular plane.
    let v: Vec3 = [
        a[1] * u[2] - a[2] * u[1],
        a[2] * u[0] - a[0] * u[2],
        a[0] * u[1] - a[1] * u[0],
    ];
    let c = angle.cos();
    let s = angle.sin();
    [
        u[0] * c + v[0] * s,
        u[1] * c + v[1] * s,
        u[2] * c + v[2] * s,
    ]
}

/// Create a comet/asteroid at the system boundary heading inward (mirror of
/// `makeVisitor`). Consumes six RNG draws in the exact same order as the TS side.
pub fn make_visitor(rng: &mut Mulberry32, mu: f64, eject_radius: f64, id: f64) -> CelestialBody {
    let cos_theta = 2.0 * rng.next_f64() - 1.0;
    let sin_theta = (1.0 - cos_theta * cos_theta).max(0.0).sqrt();
    let phi = 2.0 * std::f64::consts::PI * rng.next_f64();
    let position: Vec3 = [
        eject_radius * sin_theta * phi.cos(),
        eject_radius * sin_theta * phi.sin(),
        eject_radius * cos_theta,
    ];
    let escape = (2.0 * mu / eject_radius.max(f64::EPSILON)).sqrt();
    // Mostly above escape speed so visitors typically fly through and leave;
    // only the slower minority (< escape) are gravitationally captured, making
    // capture an occasional event rather than the common case. Mirrors the TS
    // fallback's `makeVisitor`.
    let speed = escape * (0.9 + 0.7 * rng.next_f64());
    let dist = magnitude(position).max(f64::EPSILON);
    // Impact parameter: how far the incoming trajectory MISSES the star by. Real
    // interstellar visitors are never aimed exactly at the star, and this is what
    // makes them swing past it on a hyperbola.
    //
    // Aiming a visitor precisely at the star (the previous behaviour) gives it
    // ZERO angular momentum — a degenerate radial trajectory with no orbital
    // plane. Such a body fell straight through the softened core and oscillated
    // back and forth on a fixed line forever, and its "orbit" drew as a straight
    // line running through the star.
    let impact = eject_radius * (0.08 + 0.45 * rng.next_f64());
    let sin_alpha = (impact / dist).min(0.95);
    let cos_alpha = (1.0 - sin_alpha * sin_alpha).max(0.0).sqrt();
    let radial: Vec3 = [position[0] / dist, position[1] / dist, position[2] / dist];
    let tangent = perpendicular_to(radial, 2.0 * std::f64::consts::PI * rng.next_f64());
    let velocity: Vec3 = [
        speed * (-radial[0] * cos_alpha + tangent[0] * sin_alpha),
        speed * (-radial[1] * cos_alpha + tangent[1] * sin_alpha),
        speed * (-radial[2] * cos_alpha + tangent[2] * sin_alpha),
    ];
    let is_comet = rng.next_f64() < 0.5;
    CelestialBody {
        id,
        kind: if is_comet {
            BodyType::Comet
        } else {
            BodyType::Asteroid
        },
        mass: 1.0e-9,
        // Comets/asteroids are far smaller than planets (scene units).
        radius: if is_comet {
            COMET_RADIUS
        } else {
            ASTEROID_RADIUS
        },
        pos: position,
        vel: velocity,
        spin: rng.next_f64(),
        captured: false,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mulberry32_is_deterministic_and_in_range() {
        let mut a = Mulberry32::new(12345);
        let mut b = Mulberry32::new(12345);
        for _ in 0..100 {
            let x = a.next_f64();
            let y = b.next_f64();
            assert_eq!(x, y);
            assert!((0.0..1.0).contains(&x));
        }
    }

    #[test]
    fn seed_from_config_is_stable_and_parameter_sensitive() {
        assert_eq!(
            seed_from_config(1.0, 50.0, 0.5, 0.74, 0.24, 0.02),
            seed_from_config(1.0, 50.0, 0.5, 0.74, 0.24, 0.02)
        );
        assert_ne!(
            seed_from_config(1.0, 50.0, 0.5, 0.74, 0.24, 0.02),
            seed_from_config(2.0, 50.0, 0.5, 0.74, 0.24, 0.02)
        );
    }

    #[test]
    fn classify_visitor_captures_binds_and_ejects() {
        let mu = 1.0;
        let eject = 15.0;
        // Slow tangential ⇒ bound ⇒ captured.
        assert_eq!(
            classify_visitor(mu, [10.0, 0.0, 0.0], [0.0, 0.1, 0.0], eject),
            VisitorClassification::Captured
        );
        // Fast, outward, past the boundary ⇒ ejected.
        assert_eq!(
            classify_visitor(mu, [20.0, 0.0, 0.0], [2.0, 0.0, 0.0], eject),
            VisitorClassification::Ejected
        );
        // Unbound but still inside the boundary ⇒ transit.
        assert_eq!(
            classify_visitor(mu, [5.0, 0.0, 0.0], [3.0, 0.0, 0.0], eject),
            VisitorClassification::Transit
        );
        // Unbound past the boundary but still inbound ⇒ transit.
        assert_eq!(
            classify_visitor(mu, [20.0, 0.0, 0.0], [-2.0, 0.0, 0.0], eject),
            VisitorClassification::Transit
        );
    }

    #[test]
    fn make_visitor_spawns_on_boundary_heading_inward() {
        let mut rng = Mulberry32::new(7);
        let eject = 30.0;
        let v = make_visitor(&mut rng, 2.0, eject, 42.0);
        // Spawns on the boundary sphere.
        assert!((magnitude(v.pos) - eject).abs() < 1e-9);
        // Velocity has an inward radial component (moving toward the core).
        let radial =
            (v.pos[0] * v.vel[0] + v.pos[1] * v.vel[1] + v.pos[2] * v.vel[2]) / magnitude(v.pos);
        assert!(radial < 0.0, "visitor should head inward, radial={radial}");
        assert!(!v.captured);
        assert!(matches!(v.kind, BodyType::Comet | BodyType::Asteroid));
        assert_eq!(v.id, 42.0);
    }
}

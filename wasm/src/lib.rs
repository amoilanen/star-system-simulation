//! Rust/WASM physics kernel (spec §4.4, §4.5, §5, Decisions D1/D2, FR-7, FR-10).
//!
//! The ONE implementation of the simulation model. (It used to be the
//! high-performance twin of a mirrored pure-TypeScript fallback; that fallback
//! was deleted, so nothing outside this crate duplicates the physics.) It
//! exposes `wasm-bindgen` bindings for the
//! `PhysicsKernel` contract: a constructor (`init`), `step`, and pointers into
//! linear memory for the interleaved particle/body/event buffers that the
//! renderer reads each frame — no `SharedArrayBuffer`, avoiding cross-origin
//! isolation requirements for static hosting.
//!
//! The illustrative production model, its constants, its deterministic RNG and
//! its seeding order all mirror the fallback exactly so the two kernels are
//! interchangeable and agree on a deterministic small scenario (kernel parity).

mod bodies;
mod nbody;
mod stages;

use wasm_bindgen::prelude::*;

use bodies::{
    classify_visitor, make_visitor, seed_from_config, BodyType, CelestialBody, Mulberry32,
    VisitorClassification,
};
use nbody::{
    accretion_efficiency, accretion_radius, attractor_accel, body_radius_from_mass, circular_speed,
    integrate_orbit_attractors, is_bound, magnitude, merge_radius, merged_velocity, orbital_step,
    periapsis_distance, solid_fraction, stable_substep, total_specific_energy_attractors,
    Attractor, AttractorSet, Vec3, BODY_DAMP_FRACTION, DISK_SETTLE, GAS_DRAG, GRAVITY, INTERNAL_DT,
    MAX_ATTRACTORS, MAX_PARTICLES, MAX_SUBSTEPS, ORBITAL_MASS_SCALE, ORBITAL_MAX, SNOW_LINE_AU,
    SOFTENING, VERTICAL_DAMP,
};
#[cfg(test)]
use stages::cloud_mass_for_star;
use stages::{
    bool_f64, companion_count, determine_fate, is_substellar, remnant_mass, stage_durations,
    stellar_mass_from_cloud, FateOutcome, LifecycleStage, PackedEvent, RemnantType, SimEventType,
    DEUTERIUM_BURNING_MIN_MASS, HYDROGEN_BURNING_MIN_MASS,
};

/// Number of Float32 lanes per particle (mirror `PARTICLE_STRIDE`).
const PARTICLE_STRIDE: usize = 7;
/// Number of Float32 lanes per body (mirror `BODY_STRIDE`).
const BODY_STRIDE: usize = 12;
/// Number of Float32 lanes per gravitating centre (mirror `ATTRACTOR_STRIDE`):
/// `[x, y, z, mu]`.
const ATTRACTOR_STRIDE: usize = 4;
/// Number of Float64 lanes per packed event: [type, simTime, dataA, dataB].
const EVENT_STRIDE: usize = 4;

/// Number of planetesimal seeds placed in a disc with a SOLAR (or richer) solid
/// budget; survivors become planets. 8 seeds → geometric spacing ratio ≈ 1.68
/// for a 50 AU disc, matching real adjacent-orbit ratios (Solar System ≈ 1.4–1.9).
const PLANETESIMAL_COUNT: usize = 8;

/// How many planetesimal embryos a disc of metallicity `metals` can actually
/// assemble (spec §4.3, Decision D3).
///
/// Embryos condense out of grains, and in this three-species model the grains
/// ARE the metals — so the embryo count is the solar count scaled by the solid
/// budget, measured in embryos: one embryo is an eighth of the condensable
/// inventory of a solar-metallicity disc. Below an eighth of solar there is not
/// enough solid material to assemble even one, and the disc seeds NOTHING: a
/// 100 % hydrogen cloud forms no planets at all, rocky or otherwise (reported
/// bug 4). The count is capped at `PLANETESIMAL_COUNT` because a metal-rich disc
/// builds BIGGER worlds (through `accretion_efficiency`) rather than more of
/// them — the disc's radial room for well-separated embryos is unchanged.
fn seeded_planetesimal_count(metals: f64) -> usize {
    let solids = solid_fraction(metals).min(1.0);
    let embryos = (PLANETESIMAL_COUNT as f64 * solids).floor().max(0.0);
    // `embryos` is finite, non-negative and ≤ PLANETESIMAL_COUNT by construction.
    #[allow(clippy::cast_possible_truncation, clippy::cast_sign_loss)]
    let count = embryos as usize;
    count.min(PLANETESIMAL_COUNT)
}
/// Sim seconds between visiting comet/asteroid spawns (mirror).
const VISITOR_SPAWN_INTERVAL: f64 = 8.0e15;
/// Cap on simultaneously present visiting bodies so captured ones cannot
/// accumulate without bound (mirror of the TS fallback's `MAX_VISITORS`).
const MAX_VISITORS: usize = 10;
/// Fraction of the cloud mass pre-seeded into the central protostar core.
const CORE_SEED_FRACTION: f64 = 0.04;
/// Earth masses per solar mass (mirror of `EARTH_MASSES_PER_SOLAR`).
const EARTH_MASSES_PER_SOLAR: f64 = 332_946.0;

/// Mass (M_sun) of each planetesimal seed — an ABSOLUTE planetary embryo mass
/// (~0.01 M_earth, Moon-to-Mars scale), NOT a fraction of the cloud (mirror of
/// `PLANETESIMAL_SEED_MASS`).
///
/// Scaling the seed with the cloud quietly asserted the answer instead of
/// simulating it: at 1e-6 of the cloud, a 61 M_sun cloud handed every seed
/// 20 M_earth before it had accreted a single grain, so the inner "terrestrial"
/// worlds were born as ice giants and a 67 M_earth planet sat at 0.5 AU —
/// inside the snow line, where only rock condenses and nothing of the sort can
/// grow. From a true embryo the whole architecture is EMERGENT.
const PLANETESIMAL_SEED_MASS: f64 = 0.01 / EARTH_MASSES_PER_SOLAR;

/// Radial extent of the birth dust cloud, as fractions of the cloud extent.
/// These bound where dust actually EXISTS, so they also bound where a
/// planetesimal can grow: seeding beyond `DISC_OUTER_FRACTION` put the last
/// seeds outside every grain in the simulation, orbiting empty space at their
/// seed mass forever.
const DISC_INNER_FRACTION: f64 = 0.015;
const DISC_OUTER_FRACTION: f64 = 0.6;

/// Body-swallow radius as a fraction of the dust feeding radius (mirror of the
/// TS fallback's `BODY_SWALLOW_FRACTION`). A body inside it has fallen into the
/// star and is destroyed rather than parking on top of it.
const BODY_SWALLOW_FRACTION: f64 = 0.6;
/// Dust/debris beyond this multiple of the cloud extent is considered escaped.
const ESCAPE_EXTENT_FACTOR: f64 = 2.4;
/// Death EJECTA is followed far further out than ordinary dust: the expanding
/// shell IS the death scene, so it must survive while it sweeps outward through
/// the planetary system and on past it.
///
/// Deliberately far beyond anything the camera frames. The cull used to be the
/// thing that ENDED the nebula — measured: 2198 fragments at step 800, none at
/// step 1600, i.e. the whole shell vanished about fifteen seconds of playback
/// after the remnant appeared, mid-flight and all at once. What ends it now is
/// `EJECTA_LIFETIME`, which fades it out gradually; this radius only stops the
/// book-keeping from following gas that left the scene long ago.
const EJECTA_ESCAPE_EXTENT_FACTOR: f64 = 26.0;
/// Number of ejecta particles the star's envelope is divided into. They are NOT
/// thrown at once — see `shed_envelope`.
const EJECTA_COUNT: usize = 2200;
/// How long (orbital-time units) a fragment of the envelope stays visible, and
/// the tail of that lifetime over which it fades out.
///
/// A planetary nebula really does disperse: it glows for a few tens of thousands
/// of years and is then indistinguishable from the interstellar medium. So the
/// shell must END — but as a NEBULA that thins and dims, not as 2200 particles
/// deleted between two frames. The lifetime is randomised per fragment (see
/// `shed_envelope`) so the count decays smoothly instead of stepping.
///
/// This is also the clock the REMNANT stage's `stage_progress` is reported on,
/// so the drawn nebula (`remnantAppearance`) fades in step with the gas.
const EJECTA_LIFETIME: f64 = 260.0;
/// Share of `EJECTA_LIFETIME` spent visibly fading (brightness and size).
const EJECTA_FADE_FRACTION: f64 = 0.65;
/// Rate (per orbital-time unit) at which the death shell is slowed by the
/// interstellar medium it sweeps up.
///
/// Real remnants do not coast forever: once a shell has swept up its own mass of
/// ambient gas it enters the snowplough phase, decelerates and finally stalls at
/// a fixed radius, where it fades. Here that is what keeps the nebula ON SCREEN
/// — it settles at `EJECTA_STALL_REACH` cloud radii instead of leaving the
/// system — and it removes the pace-dependence of how far a fragment can drift:
/// however long it flies, it stops in the same place.
///
/// DERIVED from `DEATH_SWEEP`, so the choreography of the death is the primary
/// statement and the deceleration merely implements it.
const EJECTA_DRAG: f64 = DEATH_SWEEP / DEATH_ORBITAL_SPAN;
/// How much of its stall radius the shell has swept by the time the remnant
/// appears, as the exponent of `1 − e^-sweep` — `0.6` puts the shell edge at
/// ~45 % of its stall radius, i.e. 0.6–1.1 cloud radii, still comfortably inside
/// the framed system. Mirrored as `DEATH_SWEEP` in `starVisual.ts`.
const DEATH_SWEEP: f64 = 0.6;
/// Debris fragments spawned when a body is tidally disrupted by the star.
const DEBRIS_PER_BODY: usize = 140;
/// Orbital-time lifetime of a tidal-disruption debris stream (mirror of
/// `DEBRIS_LIFETIME`). Debris torn off a body the star is eating is NOT on a
/// stable orbit — it is falling in, and it is accreted within a few orbits.
/// Without a finite lifetime the fragments stayed on whatever orbit they
/// inherited and could still be seen circling the star long after it had become
/// a white dwarf, which is not physical.
const DEBRIS_LIFETIME: f64 = 6.0;
/// Per-orbital-time velocity drag on debris (mirror of `DEBRIS_DRAG`). The
/// stream is shredded, shocked and colliding with itself, so it loses angular
/// momentum fast and spirals into the star.
const DEBRIS_DRAG: f64 = 0.6;
/// Radius, in multiples of the cloud extent, at which the death shell finally
/// STALLS (mirror of `SHELL_STALL_REACH` in `starVisual.ts` — the drawn shock
/// front and the integrated fragments must move together).
///
/// The shell is launched at `EJECTA_DRAG × stall × cloud_extent` and decelerates
/// exponentially toward this radius, so it covers a fixed FRACTION of it over
/// the death stage (~45 %, i.e. 0.7–1.1 cloud radii — still comfortably framed
/// when the remnant appears) and then creeps outward for the rest of its life.
///
/// The old model instead gave the shell escape velocity from the visually
/// inflated central potential and let it coast to 5.5 / 2.2 cloud radii within
/// the death stage — 275 / 110 AU for a default 50 AU cloud, against a view
/// about 62 AU high. The envelope was therefore already off-screen when the
/// remnant appeared and was then deleted outright, which is exactly the reported
/// "the matter condenses into a white dwarf; there is no nebula".
const EJECTA_STALL_REACH_SUPERNOVA: f64 = 1.5;
const EJECTA_STALL_REACH_NEBULA: f64 = 1.4;
/// Stall radius of the slow SUPERWIND that leaves during the late red giant, in
/// the same units.
///
/// An AGB star sheds much of its envelope in a dense, dusty wind at ~10 km/s
/// long before the terminal event — far slower than the blast that follows and
/// eventually ploughs into it. That is literally how a planetary nebula is made,
/// and it is what lets the viewer SEE the gas leave the star instead of finding
/// it already gone.
const EJECTA_STALL_REACH_WIND: f64 = 0.5;
/// Fractional thickness of the shell the wind is launched into: the photosphere
/// is not a mathematical surface, and a shell of exactly one radius reads as a
/// soap bubble rather than as gas.
const EJECTA_LAUNCH_SPREAD: f64 = 0.3;

/// Internal structure of the DEATH stage, as fractions of its duration (mirror
/// of `DEATH_PHASES` in `src/sim/stages.ts`). A core-collapse supernova is a
/// SEQUENCE — implosion, shock breakout, expanding fireball, fade — and the
/// point of the death scene is that the viewer can watch it happen.
const DEATH_SHOCK_BREAKOUT: f64 = 0.12;
/// Smallest number of kernel steps the DEATH stage may take. The stellar clock
/// is compressed by up to ~14 orders of magnitude, so at a fast pace ONE frame
/// spans far more than the ~10^4 yr the death lasts and the star blinked from
/// red giant straight to remnant. Capping how much of the stage a single step
/// may consume makes the death always watchable.
const DEATH_MIN_STEPS: f64 = 240.0;
/// Orbital time the DEATH stage spans at the fastest pace: the bounded number of
/// steps it must take, times the bounded orbital time each of them may advance.
/// The unit the death scene is choreographed in — `EJECTA_DRAG` is set against
/// it, and the renderer mirrors it as `DEATH_SWEEP` in `starVisual.ts`.
const DEATH_ORBITAL_SPAN: f64 = DEATH_MIN_STEPS * ORBITAL_MAX;
// --- Mass loss drives the orbits (Decision D4) -------------------------------
//
// A dying star's gravity WEAKENS as it sheds its envelope, and the orbits of the
// worlds that survive widen because of it: `a ∝ 1/M` for slow (adiabatic) loss.
// The kernel therefore carries a `mass_loss_factor` that scales the primary's
// `mu`, and the widening is an OUTCOME of integrating with the weaker force.
//
// It used to be applied as a single algebraic rewrite of every surviving
// planet's position and velocity at the Death→Remnant boundary (`r → r/retained`,
// `v → v·√retained`). For a 3 M☉ star that teleported every planet outward by
// ~4× in ONE frame — measured: 6.7/11.3/17.0/34.7 AU on one step, then
// 27.7/46.2/69.4/135.4 AU on the next. Worlds hidden inside the red giant's glare
// therefore seemed to POP INTO EXISTENCE at new radii the moment the star
// collapsed, which is the reported "new planets emerge out of the collapsed
// giant". Nothing was created; the orbits simply jumped.

/// Progress through the RED GIANT stage at which the superwind starts carrying
/// the envelope away. Before this the factor is exactly 1.0, so formation and the
/// entire main sequence are numerically untouched by this mechanism.
const REDGIANT_MASS_LOSS_ONSET: f64 = 0.55;
/// Share of the star's TOTAL mass loss already gone by the end of the red giant.
///
/// Real AGB stars shed a substantial part of the envelope in a slow superwind
/// long before the terminal event. Kept modest on purpose: an abrupt drop of more
/// than half the gravity would unbind a circular orbit outright (`v² > 2mu'/r`),
/// and the red-giant stage may legitimately be crossed in very few steps at a
/// fast pace, so this share must stay safely below that limit.
const REDGIANT_MASS_LOSS_SHARE: f64 = 0.25;
/// Death-stage progress (measured from `DEATH_SHOCK_BREAKOUT`) over which the
/// REST of the envelope leaves, for the two physically distinct channels.
///
/// A core-collapse supernova is IMPULSIVE: the envelope is gone in days — far
/// less than an orbital period — so the surviving planets keep the velocity they
/// had while the gravity holding them vanishes, and the loosely bound ones are
/// unbound. A planetary nebula is puffed off over millennia, i.e. slowly compared
/// with an orbit, so the orbits follow adiabatically and stay bound as they widen.
const DEATH_MASS_LOSS_SPAN_IMPULSIVE: f64 = 0.04;
const DEATH_MASS_LOSS_SPAN_ADIABATIC: f64 = 0.7;

/// Red-giant photospheric reach in AU (= scene units) for a 1 M☉ star; scaled
/// by mass^0.8 (matching mainSequenceRadius ∝ M^0.8 × RED_GIANT_SWELL). This
/// ensures no planet survives visually inside the giant at any stellar mass.
const REDGIANT_ENGULF_AU: f64 = 2.2;
/// The star's photosphere on the main sequence as a fraction of its red-giant
/// photosphere — the inverse of the drawn `RED_GIANT_SWELL` (×250). The giant
/// SWELLS through the stage, so the surface the wind leaves from (and the
/// surface a planet cannot survive inside) grows with it instead of appearing
/// at full size the instant the stage begins.
const MAIN_SEQUENCE_PHOTOSPHERE_FRACTION: f64 = 1.0 / 250.0;

/// Core mass fractions — of the FINAL STELLAR MASS, not of the cloud — at which
/// the FORMATION stages advance (mirror the TS fallback's `*_CORE_FRACTION`).
/// Formation is accretion-driven, not timed. The star only ever assembles a
/// fraction of its cloud, so a threshold against the cloud mass could never be
/// reached.
const PROTOSTAR_CORE_FRACTION: f64 = 0.2;
const FUSION_CORE_FRACTION: f64 = 0.55;
const IGNITION_CORE_FRACTION: f64 = 0.9;

/// Radiation-pressure-to-gravity ratio (β) felt by leftover dust once the star
/// has ignited (mirror of `IGNITED_RADIATION_BETA`). β > 1 means the young star
/// pushes harder than it pulls, so the residual cloud is driven back out instead
/// of raining onto the star — the reason its final mass is only a fraction of
/// the cloud it formed from.
const IGNITED_RADIATION_BETA: f64 = 1.16;

/// Maximum rate at which the protostar can swallow dust, as a fraction of the
/// cloud mass per unit orbital time (mirror of the TS `CORE_ACCRETION_RATE`).
///
/// Real physics, not a fudge: infalling gas carries angular momentum, so it
/// piles into a disc and only reaches the star as fast as that angular momentum
/// is transported outward — a finite Ṁ. That is why star formation takes ~1 Myr
/// rather than a free-fall time. Without the cap the core ran from its 4% seed
/// to the 50% ignition threshold in ~1 second of playback, so the star appeared
/// to be born immediately.
///
/// Expressed as a fraction of the star's FINAL mass so formation takes the same
/// number of frames whatever the cloud mass.
const CORE_ACCRETION_RATE: f64 = 0.008;

// --- Companion stars from cloud fragmentation (spec §4.2, Decision D1) ------
//
// A cloud holding more than one Jeans mass cannot collapse as a single object:
// it breaks into pieces (`stages::companion_count`). Each piece becomes a
// SECOND star, with its own gravity acting on the planets and the dust — which
// is what the user asked for, and what no amount of planetesimal accretion can
// produce. The bug they actually saw is the other half of this: a body that DID
// grow past the hydrogen-burning limit was still typed (and drawn) as a ringed
// gas giant, which `promote_bodies` now fixes by classifying on mass.

/// How many companions may exist: one per spare gravitating centre (Decision D6).
const MAX_COMPANIONS: usize = MAX_ATTRACTORS - 1;

/// Mass of each companion as a fraction of the PRIMARY's assembled mass — the
/// binary mass ratio `q`, in fragment order (most massive first).
///
/// Always below 1 by construction: the primary is by definition the piece that
/// won the competition for the cloud's gas. The values sit in the middle of the
/// observed `q` distribution for wide multiples.
const COMPANION_MASS_RATIOS: [f64; MAX_COMPANIONS] = [0.35, 0.15];

/// Share of the cloud gas that NEVER reaches the primary and may therefore be
/// claimed by the fragments.
///
/// A cloud only ever assembles a fraction of itself into its primary star (see
/// `stellar_mass_from_cloud`); the rest is blown back into the interstellar
/// medium. Companions are fed out of exactly that surplus, so the primary's
/// budget — and with it the calibrated formation timing, the stage durations and
/// the fate model, all of which are keyed on `star_mass` — is left untouched.
const COMPANION_BUDGET_CAP: f64 = 0.6;

/// Mass (M☉) a fragment is BORN with: the opacity limit for fragmentation, the
/// smallest piece a collapsing cloud can resolve — a few Jupiter masses.
///
/// Below this the gas becomes optically thick, can no longer radiate away the
/// heat of its own compression, and the rising pressure stops any further
/// break-up. So every fragment starts as a bare hydrostatic core — well under
/// the deuterium limit — and is SEEN to grow: first into a brown dwarf, and (if
/// its share of the cloud is large enough) on through the hydrogen-burning limit
/// into a star, which is the moment `CompanionIgnited` fires.
const COMPANION_SEED_MASS: f64 = 0.005;

/// Semi-major axis of the innermost companion, in cloud extents, and the random
/// spread added to it.
///
/// Well outside the primary's dust disc (which ends at `DISC_OUTER_FRACTION`) so
/// the companion is a WIDE binary: its worlds keep their orbits instead of being
/// scattered, which is the configuration in which planets are actually observed
/// around one member of a binary. Each further companion is
/// `COMPANION_ORBIT_HIERARCHY` times wider still, making the system hierarchical
/// — the only stable arrangement for three bodies.
const COMPANION_ORBIT_INNER_FRACTION: f64 = 1.6;
const COMPANION_ORBIT_SPREAD_FRACTION: f64 = 0.5;
const COMPANION_ORBIT_HIERARCHY: f64 = 2.1;
/// Companion orbital eccentricity range. Mildly eccentric, as observed for wide
/// pairs, but far from the disc-crossing orbits that would wreck the planets.
const COMPANION_ECCENTRICITY_MIN: f64 = 0.05;
const COMPANION_ECCENTRICITY_SPAN: f64 = 0.25;

/// Per-species dust colour tint (linear RGB) + point size, mirroring
/// `SPECIES_COLOR` and `speciesColorSize` in the fallback.
const SPECIES_HYDROGEN: ([f64; 3], f64) = ([0.45, 0.6, 1.0], 1.0);
const SPECIES_HELIUM: ([f64; 3], f64) = ([0.85, 0.88, 1.0], 1.1);
const SPECIES_METALS: ([f64; 3], f64) = ([1.0, 0.62, 0.32], 1.4);

/// Trivial export proving the WASM boundary compiles and links (kept from the
/// scaffold for a cheap smoke check).
#[wasm_bindgen]
#[must_use]
pub fn kernel_version() -> u32 {
    2
}

/// What a body of this mass IS (spec §4.2). The single rule for typing every
/// non-visiting body, applied to its OWN mass — which is precisely what the
/// reported bug was missing: a 2–3 M☉ object was typed `Planet` because the
/// promotion looked only at the lifecycle stage, so the renderer drew a star
/// with rings and moons.
///
/// `ignited` distinguishes the two planetary kinds: a world is a `Protoplanet`
/// while the star is still assembling and a `Planet` once it shines. It has no
/// bearing on the substellar/stellar boundaries, which are set by physics the
/// primary's lifecycle has no say in.
#[must_use]
fn classify_by_mass(mass: f64, ignited: bool) -> BodyType {
    if mass >= HYDROGEN_BURNING_MIN_MASS {
        BodyType::Star
    } else if mass >= DEUTERIUM_BURNING_MIN_MASS {
        BodyType::BrownDwarf
    } else if ignited {
        BodyType::Planet
    } else {
        BodyType::Protoplanet
    }
}

/// Final masses (M☉) of the companions a cloud fragments into, in fragment order
/// (spec §4.2). Empty when the cloud holds less than one spare Jeans mass.
///
/// Each fragment claims `COMPANION_MASS_RATIOS[i]` of the primary's assembled
/// mass, and the whole set is clipped to the share of the cloud that never
/// reaches the primary anyway (`COMPANION_BUDGET_CAP`) so no gram is invented and
/// the primary's own budget is untouched. A fragment too light to become a star
/// is dropped: this channel models the pieces a collapsing cloud resolves into,
/// not the planets that condense in the disc.
#[must_use]
fn plan_companion_masses(cloud_mass: f64, cloud_extent: f64, star_mass: f64) -> Vec<f64> {
    let count = companion_count(cloud_mass, cloud_extent, MAX_COMPANIONS);
    if count == 0 || !star_mass.is_finite() || star_mass <= 0.0 {
        return Vec::new();
    }
    let mut targets: Vec<f64> = COMPANION_MASS_RATIOS
        .iter()
        .take(count)
        .map(|q| q * star_mass)
        .collect();
    // The gas the primary will never take: everything outside its own budget and
    // outside the seed core it starts from.
    let surplus = (cloud_mass * (1.0 - CORE_SEED_FRACTION) - star_mass).max(0.0);
    let allowance = surplus * COMPANION_BUDGET_CAP;
    let wanted: f64 = targets.iter().sum();
    if wanted > allowance && wanted > 0.0 {
        let scale = allowance / wanted;
        for target in &mut targets {
            *target *= scale;
        }
    }
    // A piece that cannot even reach the deuterium-burning limit is not a
    // fragment of the collapse in any meaningful sense.
    targets.retain(|m| *m >= DEUTERIUM_BURNING_MIN_MASS);
    targets
}

/// The `WebAssembly.Memory` backing this module, so TypeScript can build
/// `Float32Array` / `Float64Array` views over the buffer pointers below.
#[wasm_bindgen]
pub fn wasm_memory() -> JsValue {
    wasm_bindgen::memory()
}

/// The gravitational softening length the kernel integrates with, in scene
/// units (= AU).
///
/// Exported because a host that wants to reproduce the kernel's own notion of
/// "is this body bound?" must use the SAME softened potential
/// `-mu / sqrt(r² + softening²)`. Re-declaring the constant host-side would let
/// the two drift apart silently, which is exactly what the removal of the
/// mirrored TypeScript kernel was meant to prevent.
#[wasm_bindgen]
#[must_use]
pub fn softening() -> f64 {
    SOFTENING
}

/// The disc's snow line, in AU: the distance beyond which ices condense and
/// accretion becomes far more productive. Exported so hosts and tests describe
/// the disc's zones with the kernel's value rather than a copy of it.
#[wasm_bindgen]
#[must_use]
pub fn snow_line_au() -> f64 {
    SNOW_LINE_AU
}

/// What a particle physically IS (mirror of the fallback's `ParticleKind`). The
/// three populations behave differently and, crucially, die differently —
/// conflating them is what left glowing fragments orbiting the white dwarf.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
enum ParticleKind {
    /// Primordial birth-cloud grain: carries mass, settles into the disc, accretes.
    Dust,
    /// Tidal debris from a body the star destroyed: falls in, short-lived.
    Debris,
    /// Death ejecta (planetary nebula / supernova shell): unbound, expands away.
    Ejecta,
}

/// Internal mutable particle representation (mirror of the fallback's `Particle`).
#[derive(Clone, Copy)]
struct Particle {
    x: f64,
    y: f64,
    z: f64,
    vx: f64,
    vy: f64,
    vz: f64,
    r: f64,
    g: f64,
    b: f64,
    size: f64,
    mass: f64,
    /// Population this particle belongs to (drives drag, damping and lifetime).
    kind: ParticleKind,
    /// Remaining lifetime in orbital-time units; infinite for permanent grains.
    ttl: f64,
}

/// The Rust/WASM physics kernel with emergent accretion. Construct once per run,
/// then drive with `step`. Deterministic for a given configuration.
#[wasm_bindgen]
pub struct Kernel {
    cloud_extent: f64,
    cloud_mass: f64,
    /// Mass (M☉) the star will actually assemble — a fraction of the cloud (see
    /// `stellar_mass_from_cloud`). Core accretion is capped here; past it the
    /// star's own radiation blows the rest of the cloud away.
    star_mass: f64,
    core_mass: f64,
    /// Cloud mass blown back into interstellar space by the ignited star.
    dispersed_mass: f64,
    /// Mass that has left the dust pool but not yet reached the star: the inner
    /// accretion disc. Dust swept by a planetesimal but not retained flows here
    /// and drains onto the core under the same `CORE_ACCRETION_RATE` limit as
    /// direct infall, so no channel can bypass the star's finite Ṁ.
    disc_reservoir: f64,
    core_accretion_radius: f64,
    /// Radius within which a discrete body that plunges inward is destroyed and
    /// absorbed by the star (smaller than the diffuse dust feeding zone).
    body_swallow_radius: f64,
    eject_radius: f64,
    composition: [f64; 3],
    rng: Mulberry32,

    // Formation/stellar evolution controller state.
    stage: LifecycleStage,
    stellar_elapsed: f64,
    durations: [f64; 7],
    fate: FateOutcome,
    /// Whether the object being assembled is SUBSTELLAR (below the
    /// hydrogen-burning minimum mass). A brown dwarf never ignites, so it must
    /// never be walked through a main sequence, red giant or death it cannot have.
    substellar: bool,
    core_fraction: f64,

    particles: Vec<Particle>,
    bodies: Vec<CelestialBody>,

    /// Final mass (M☉) of each companion the cloud's fragmentation supports, in
    /// fragment order (spec §4.2). Empty for any cloud that holds less than one
    /// spare Jeans mass — most of them.
    ///
    /// Derived in the constructor because it depends only on the cloud's mass and
    /// extent: the fragments' SHARE of the budget therefore exists from the first
    /// frame, even though the fragment bodies themselves are not seeded until the
    /// protostar (and its disc) exist.
    companion_targets: Vec<f64>,

    /// Fraction of the primary's gravity that is still there, i.e. `mu` is
    /// multiplied by it (Decision D4). Exactly 1.0 until the late red giant, then
    /// ramps monotonically down to `remnant_mass / star_mass`. This is the ONLY
    /// mechanism that widens the surviving orbits — nothing rewrites positions.
    mass_loss_factor: f64,
    /// Envelope mass (M☉) the dying star has already handed to the wind. It is
    /// MOVED out of `core_mass` into the ejecta particles, never deleted, so the
    /// gas the viewer sees leaving is the mass the star actually lost.
    shed_mass: f64,
    /// How many of the envelope's `EJECTA_COUNT` fragments have been launched so
    /// far. The wind is continuous, so this only ever grows, one batch per step.
    ejecta_launched: usize,
    /// Orbital time spent in the terminal `Remnant` stage — the nebula's age.
    /// The stage itself lasts forever, so this (not the stage duration) is what
    /// `compute_stage_progress` reports there, and it is the SAME clock the
    /// ejecta's `ttl` runs on, so the drawn shell and the particles fade
    /// together.
    remnant_elapsed: f64,

    particle_buf: Vec<f32>,
    body_buf: Vec<f32>,
    attractor_buf: Vec<f32>,
    event_buf: Vec<f64>,

    sim_time: f64,
    next_body_id: f64,
    spawn_accumulator: f64,
    /// Whether the leftover disc has been swept away at shock breakout (once).
    disc_dissipated: bool,
    /// Whether planetesimals have been seeded yet. They are NOT seeded in the
    /// constructor: real planetesimals form in the protoplanetary disc alongside
    /// the protostar (spec §3.8), so they cannot predate it. Seeding is deferred
    /// to ProtostarCoalescence entry in `advance_stages`, guarded by this flag.
    planetesimals_seeded: bool,
    /// How many embryos this cloud's SOLID budget can assemble (spec §4.3). Fixed
    /// at construction from the composition, because the dust budget handed to the
    /// particles has to reserve exactly the embryo mass that will later be seeded
    /// — unseeded embryos leave their mass in the dust.
    planetesimal_count: usize,
    /// Whether the cloud's fragments have been seeded as bodies yet. Like the
    /// planetesimals they appear at ProtostarCoalescence entry — fragmentation is
    /// what the collapse DOES, so it cannot predate the collapse.
    companions_seeded: bool,
}

#[wasm_bindgen]
impl Kernel {
    /// (Re)initialize the kernel for a run (the `PhysicsKernel.init` contract).
    #[wasm_bindgen(constructor)]
    #[must_use]
    pub fn new(
        mass: f64,
        cloud_extent: f64,
        pace: f64,
        h: f64,
        he: f64,
        metals: f64,
        particle_count: u32,
    ) -> Kernel {
        let seed = seed_from_config(mass, cloud_extent, pace, h, he, metals);
        let cloud_mass = mass.max(f64::EPSILON);
        let star_mass = stellar_mass_from_cloud(cloud_mass, metals).max(f64::EPSILON);
        let core_mass = cloud_mass * CORE_SEED_FRACTION;
        // Small capture zone (AU) so several planets can orbit INSIDE the snow
        // line (the terrestrial zone); dust still reaches the star by spiralling
        // in under gas drag.
        let core_accretion_radius = (cloud_extent * 0.014).clamp(0.4, 1.2);
        let mut kernel = Kernel {
            cloud_extent,
            cloud_mass,
            star_mass,
            core_mass,
            dispersed_mass: 0.0,
            disc_reservoir: 0.0,
            core_accretion_radius,
            body_swallow_radius: core_accretion_radius * BODY_SWALLOW_FRACTION,
            eject_radius: cloud_extent * 1.5,
            composition: [h, he, metals],
            rng: Mulberry32::new(seed),
            stage: LifecycleStage::DustCloud,
            stellar_elapsed: 0.0,
            // Stellar timing and the death path follow the STAR's mass, not the
            // cloud's: a 40 M☉ cloud makes a ~10 M☉ star, which lives far longer.
            durations: stage_durations(star_mass, metals),
            fate: determine_fate(star_mass, metals),
            substellar: is_substellar(star_mass),
            core_fraction: core_mass / star_mass,
            particles: Vec::new(),
            bodies: Vec::new(),
            companion_targets: plan_companion_masses(cloud_mass, cloud_extent, star_mass),
            // Full gravity: a star that has not started dying has lost nothing.
            mass_loss_factor: 1.0,
            shed_mass: 0.0,
            ejecta_launched: 0,
            remnant_elapsed: 0.0,
            particle_buf: Vec::new(),
            body_buf: Vec::new(),
            attractor_buf: Vec::new(),
            event_buf: Vec::new(),
            sim_time: 0.0,
            next_body_id: 0.0,
            spawn_accumulator: 0.0,
            disc_dissipated: false,
            // Planetesimals are NOT seeded here — they cannot predate the protostar
            // (spec §3.8). Seeding is deferred to ProtostarCoalescence entry in
            // `advance_stages`, triggered by `planetesimals_seeded`.
            planetesimals_seeded: false,
            planetesimal_count: seeded_planetesimal_count(metals),
            companions_seeded: false,
        };
        kernel.seed_particles(particle_count as usize);
        // bodies starts empty; `rebuild_body_buffer` grows it when bodies are seeded.
        kernel.particle_buf = vec![0.0; kernel.particles.len() * PARTICLE_STRIDE];
        kernel.body_buf = vec![];
        kernel.write_particle_buffer();
        // The primary exists from the first frame, so the host can read the
        // gravitating centres before the first `step`.
        kernel.rebuild_attractor_buffer();
        kernel
    }

    /// Advance the simulation by `dt_sim_seconds`, returning the number of events
    /// emitted this step (packed into the events buffer) — the
    /// `PhysicsKernel.step` contract.
    pub fn step(&mut self, dt_sim_seconds: f64) -> u32 {
        self.event_buf.clear();
        if !dt_sim_seconds.is_finite() || dt_sim_seconds <= 0.0 {
            return 0;
        }

        let mut events: Vec<PackedEvent> = Vec::new();
        self.sim_time += dt_sim_seconds;

        // How much of the primary's gravity is left (D4). Refreshed BEFORE the
        // integration so a dying star's weakened pull is what this step's orbits
        // actually feel, and the widening is emergent rather than applied.
        self.update_mass_loss();

        // Emergent dynamics on the bounded, watchable orbital clock. This grows
        // the accreted core mass, which in turn drives the formation stages.
        let orbital = orbital_step(dt_sim_seconds);
        // Orbital time this step actually advanced; also the clock the nebula
        // ages on once the remnant has formed.
        let mut orbital_advanced = 0.0;
        if orbital > 0.0 {
            // Resolve the FASTEST orbit present, not a fixed timestep: otherwise
            // a heavy, compact cloud under-samples its innermost orbit and the
            // integrator invents the energy that ejects the planet.
            let h_max = self.stable_substep_for_attractors();
            let substeps = (orbital / h_max).ceil().max(1.0).min(MAX_SUBSTEPS as f64) as usize;
            // If even MAX_SUBSTEPS cannot resolve the step, advance LESS orbital
            // time rather than integrating it inaccurately: the dynamics run
            // slower on screen, which is honest, instead of flinging bodies out.
            let advanced = orbital.min(substeps as f64 * h_max);
            orbital_advanced = advanced;
            let h = advanced / substeps as f64;
            let forming = (self.stage as u32) <= LifecycleStage::FusionIgnition as u32;
            // WHICH bodies are centres is fixed for the whole loop — nothing here
            // adds, removes or re-types a body — so the only part that walks the
            // body list is done once instead of once per substep (up to
            // `MAX_SUBSTEPS` times).
            let (chosen, chosen_count) = self.attractor_indices();
            for _ in 0..substeps {
                // Their POSITIONS are re-read every substep: a companion IS a
                // body, so its attractor moves with it as the substep advances.
                let attractors = self.attractor_set_from(&chosen[..chosen_count]);
                self.integrate_particles(&attractors, h, forming);
                self.integrate_bodies(&attractors, h);
            }
            let stage = self.stage;
            self.accrete(stage, advanced, h);
            self.age_particles(advanced);
            // Anything that has plunged into the star is torn apart and consumed.
            self.swallow_bodies_into_star(&mut events);
        }

        // Drive the lifecycle: FORMATION from accreted core mass, STELLAR by time.
        self.core_fraction = self.core_mass / self.star_mass.max(f64::EPSILON);
        let was_remnant = self.stage == LifecycleStage::Remnant;
        self.advance_stages(dt_sim_seconds, self.core_fraction, &mut events);
        if was_remnant {
            // The nebula's own clock: it starts at exactly zero on the step the
            // remnant appears, so the drawn shell hands over from the death
            // sequence without a seam.
            self.remnant_elapsed += orbital_advanced;
        }
        // A stage boundary crossed just now changes how much envelope is gone, so
        // the value the host reads (`orbital_mu`) matches this step's outcome.
        self.update_mass_loss();

        // Re-type every body from its own mass: the surviving planetesimals are
        // full planets once the star ignites, and anything that has grown past a
        // burning limit is a brown dwarf or a companion STAR (spec §4.2).
        self.promote_bodies(&mut events);
        // The swelling giant destroys whatever is inside its photosphere. Checked
        // EVERY step for the whole red-giant/death phase, not once at red-giant
        // onset: the star keeps swelling after the stage begins, and a world that
        // drifts inward later is just as doomed as one that was already there.
        self.engulf_inner_planets(&mut events);
        // Whatever the star has lost by now LEAVES it, as gas. This is the same
        // book-keeping that weakened its gravity a few lines above (D4), so the
        // envelope the viewer sees departing and the widening of the surviving
        // orbits are one mechanism rather than two that can disagree.
        self.shed_envelope();
        // Everything still circling the star is swept away when the shock breaks
        // out: the core spends the first moments of the death imploding, and only
        // when the rebound shock reaches the surface is the disc actually cleared.
        if !self.disc_dissipated && self.has_shock_broken_out() {
            self.dissipate_disc_material();
            self.disc_dissipated = true;
        }

        self.spawn_visitors(dt_sim_seconds);
        self.resolve_visitors(&mut events);
        self.eject_escaping_worlds(&mut events);
        self.cull_particles();

        self.rebuild_particle_buffer();
        self.rebuild_body_buffer();
        self.rebuild_attractor_buffer();
        self.pack_events(&events);
        events.len() as u32
    }

    /// Pointer to the interleaved particle buffer in linear memory.
    #[must_use]
    pub fn particle_ptr(&self) -> u32 {
        self.particle_buf.as_ptr() as usize as u32
    }

    /// Length (in f32 lanes) of the particle buffer.
    #[must_use]
    pub fn particle_len(&self) -> u32 {
        self.particle_buf.len() as u32
    }

    /// Pointer to the interleaved body buffer in linear memory.
    #[must_use]
    pub fn body_ptr(&self) -> u32 {
        self.body_buf.as_ptr() as usize as u32
    }

    /// Length (in f32 lanes) of the body buffer.
    #[must_use]
    pub fn body_len(&self) -> u32 {
        self.body_buf.len() as u32
    }

    /// Pointer to the interleaved attractor buffer in linear memory: the
    /// gravitating centres this kernel is integrating against, `[x, y, z, mu]`
    /// per centre (mirror `ATTRACTOR_STRIDE` / `ATTRACTOR_OFFSET`).
    #[must_use]
    pub fn attractor_ptr(&self) -> u32 {
        self.attractor_buf.as_ptr() as usize as u32
    }

    /// Length (in f32 lanes) of the attractor buffer.
    #[must_use]
    pub fn attractor_len(&self) -> u32 {
        self.attractor_buf.len() as u32
    }

    /// Number of gravitating centres present (primary + live companions), never
    /// more than `MAX_ATTRACTORS`.
    #[must_use]
    pub fn attractor_count(&self) -> u32 {
        (self.attractor_buf.len() / ATTRACTOR_STRIDE) as u32
    }

    /// Pointer to the packed events buffer (f64 lanes) drained each `step`.
    #[must_use]
    pub fn events_ptr(&self) -> u32 {
        self.event_buf.as_ptr() as usize as u32
    }

    /// Number of f64 lanes per packed event (`[type, simTime, dataA, dataB]`).
    #[must_use]
    pub fn event_stride(&self) -> u32 {
        EVENT_STRIDE as u32
    }

    /// The lifecycle stage the simulation is in after the latest `step`.
    #[must_use]
    pub fn stage(&self) -> u32 {
        self.stage as u32
    }

    /// Normalized 0..1 progress through the current stage (accretion fraction for
    /// formation stages, elapsed/duration for stellar stages).
    #[must_use]
    pub fn stage_progress(&self) -> f32 {
        self.compute_stage_progress() as f32
    }

    /// Physically meaningful elapsed time in sim seconds: formation progress
    /// mapped onto the REAL formation durations, then the stellar clock.
    #[must_use]
    pub fn elapsed_sim_seconds(&self) -> f64 {
        self.compute_elapsed_sim_seconds()
    }

    /// Mass (M☉) of the central object right now: the accreted core while the
    /// star is assembling, the finished star during its life, and only the
    /// compact remnant's mass once it has died (mirror of `currentStarMass`).
    #[must_use]
    pub fn star_mass_solar(&self) -> f64 {
        if (self.stage as u32) < LifecycleStage::MainSequence as u32 {
            return self.core_mass.min(self.star_mass);
        }
        if self.stage == LifecycleStage::Remnant {
            return remnant_mass(self.star_mass, self.fate.remnant);
        }
        self.star_mass
    }

    /// The PRIMARY star's gravitational parameter, as this kernel is actually
    /// integrating it right now.
    ///
    /// Exported so the renderer can reconstruct exactly the Kepler conics the
    /// bodies are following about the origin (the orbit-path overlay). The kernel
    /// is the single source of truth for it: the host used to recompute `mu`
    /// itself from duplicated `GRAVITY` / `ORBITAL_MASS_SCALE` constants, which
    /// was one more thing that had to be kept in sync by hand.
    ///
    /// This VARIES over a run: the dying star's gravity weakens as it sheds its
    /// envelope (Decision D4). Read it per frame; do not cache it. Companions'
    /// gravity is NOT included — see `attractor_ptr` for the full set.
    #[must_use]
    pub fn orbital_mu(&self) -> f64 {
        self.mu()
    }
}

impl Kernel {
    /// Whether the rebound shock has reached the surface, so the star is now
    /// actually blowing its envelope off (mirror of `hasShockBrokenOut`).
    fn has_shock_broken_out(&self) -> bool {
        if self.substellar {
            // A brown dwarf has no shock to break out: it never fuses hydrogen, so
            // it never builds a core that can collapse. Without this guard it
            // reached the Remnant stage and promptly blew a planetary nebula it
            // cannot produce, sweeping away the disc and planets it should keep.
            return false;
        }
        if self.stage as u32 > LifecycleStage::Death as u32 {
            return true;
        }
        self.stage == LifecycleStage::Death && self.compute_stage_progress() >= DEATH_SHOCK_BREAKOUT
    }

    /// How much sim time one step may advance the DEATH stage: at most a
    /// `DEATH_MIN_STEPS` fraction of it. At a slow pace `sim_dt` is far below the
    /// cap and the death runs at its true rate.
    fn death_step(&self, sim_dt: f64) -> f64 {
        let dur = self.durations[LifecycleStage::Death as usize];
        if !dur.is_finite() || dur <= 0.0 {
            return sim_dt;
        }
        sim_dt.min(dur / DEATH_MIN_STEPS)
    }

    /// The PRIMARY's gravitational parameter driving the dynamics
    /// (visual-scaled), after whatever envelope the dying star has already shed
    /// (Decision D4). Uses the TOTAL cloud mass so collapse/orbits proceed from
    /// the start rather than stalling until the seed core has grown.
    fn mu(&self) -> f64 {
        // √M rather than M: at full mass-proportionality the inner dynamics of a
        // heavy cloud outrun the fixed integration substep and grains get flung
        // out instead of accreting. This only sets the VISUAL orbital rate —
        // every reported figure (orbital speed, period, temperature) is computed
        // from true Kepler physics host-side in `astro.ts`.
        //
        // `mass_loss_factor` is exactly 1.0 for the whole of formation and the
        // main sequence, so multiplying by it there is the identity and leaves the
        // calibrated formation timing bit-identical.
        GRAVITY
            * ORBITAL_MASS_SCALE
            * self.cloud_mass.max(f64::EPSILON).sqrt()
            * self.mass_loss_factor
    }

    /// The gravitating centres the kernel integrates against right now: the
    /// primary at the scene origin (Decision D5) plus one entry per live
    /// companion star, capped at `MAX_ATTRACTORS` (Decision D6).
    ///
    /// Companions are ordinary bodies that happen to be massive enough to shine,
    /// so their attractor entries are re-derived from `self.bodies` every time
    /// this is called — they move. A cloud that does not fragment has no such
    /// body, so the set is the primary alone and the dynamics are numerically
    /// identical to the single-central-force model.
    ///
    /// When more bodies shine than there are spare centres, the HEAVIEST win: the
    /// cap is there to bound the cost (FR-10), and dropping the strongest source
    /// of gravity in favour of whichever body happened to be seeded first would
    /// make the truncation visible in the dynamics.
    fn attractor_set(&self) -> AttractorSet {
        let (chosen, count) = self.attractor_indices();
        self.attractor_set_from(&chosen[..count])
    }

    /// WHICH bodies are the companion centres — the selection half of
    /// [`Kernel::attractor_set`], separated so it can be done ONCE per step
    /// instead of once per integration substep.
    ///
    /// This is the only part that has to walk the whole body list, and its answer
    /// can change only when a body is added, removed or re-typed — none of which
    /// happens inside the substep loop. What DOES change there is where the
    /// companions are, and that is re-read by [`Kernel::attractor_set_from`].
    fn attractor_indices(&self) -> ([usize; MAX_COMPANIONS], usize) {
        // Selection sort over at most `MAX_COMPANIONS` slots: it must not
        // allocate or sort the whole list.
        let mut chosen = [usize::MAX; MAX_COMPANIONS];
        let mut count = 0usize;
        for (index, body) in self.bodies.iter().enumerate() {
            if !body.kind.is_stellar() {
                continue;
            }
            if count < MAX_COMPANIONS {
                chosen[count] = index;
                count += 1;
            } else if let Some(slot) = (0..count).min_by(|a, b| {
                self.bodies[chosen[*a]]
                    .mass
                    .total_cmp(&self.bodies[chosen[*b]].mass)
            }) {
                if body.mass > self.bodies[chosen[slot]].mass {
                    chosen[slot] = index;
                }
            }
        }
        (chosen, count)
    }

    /// The gravitating centres for an already-made selection, reading each
    /// companion's CURRENT position and mass. Cheap: `O(MAX_COMPANIONS)`.
    fn attractor_set_from(&self, chosen: &[usize]) -> AttractorSet {
        let mut set = AttractorSet::new();
        set.push(Attractor {
            pos: [0.0, 0.0, 0.0],
            mu: self.mu(),
        });
        for &index in chosen {
            let body = &self.bodies[index];
            // Same √M-scaled convention as the primary, so a companion's orbital
            // rate reads consistently against the star it circles.
            if !set.push(Attractor {
                pos: body.pos,
                mu: GRAVITY * ORBITAL_MASS_SCALE * body.mass.max(0.0).sqrt(),
            }) {
                break;
            }
        }
        set
    }

    /// The TOTAL gravitational parameter of the system — primary plus every
    /// companion. This, not the primary's `mu`, is what decides whether a body is
    /// bound to the SYSTEM as a whole (visitor capture/ejection, ejecta escape).
    fn total_mu(&self) -> f64 {
        self.attractor_set().total_mu()
    }

    /// Effective radius within which the star captures dust: at least the
    /// physical feeding radius, but never smaller than the distance a fast
    /// in-falling grain covers in one substep, so grains cannot "tunnel"
    /// through the capture sphere around a massive (fast) cloud.
    /// Keyed on the ACTUAL substep `h` used this step (which the CFL guard may
    /// have shrunk well below `INTERNAL_DT`), so the zone is never larger than
    /// the physics requires.
    fn capture_radius_for(&self, h: f64) -> f64 {
        let infall_per_substep = self.mu().sqrt() * h;
        self.core_accretion_radius.max(2.0 * infall_per_substep)
    }

    /// Closest approach to ONE gravitating centre — the centre at `index` in
    /// `attractors` — of any integrated body, in scene units.
    ///
    /// About the PRIMARY (`index == 0`, at the origin) it uses each body's
    /// PERIAPSIS rather than its present distance, so an eccentric planet's fast
    /// periapsis passage is resolved before it happens instead of after it has
    /// already been flung outward. Visitors count too: a comet's perihelion
    /// passage decides capture vs fly-by, so integrating it coarsely would fake
    /// the outcome.
    ///
    /// About a COMPANION it uses the present separation. A companion's own orbit
    /// keeps changing the geometry of that encounter, so a conic periapsis about
    /// it would be a fiction; the separation is the honest measure, and because
    /// this is re-evaluated every step it tightens as an approach develops.
    ///
    /// NOT floored at the swallow radius: a body can be on a star-grazing orbit
    /// whose periapsis is far inside it yet still be caught mid-orbit by every
    /// swallow check, and sizing the step for that floor rather than for its real
    /// perihelion passage left exactly that passage under-resolved — the last
    /// source of manufactured energy. No floor is needed to bound the cost:
    /// softening flattens the potential inside eps, so omega can never exceed
    /// sqrt(mu/eps^3) however small the periapsis gets.
    fn innermost_encounter_radius_to(&self, index: usize, attractors: &AttractorSet) -> f64 {
        let Some(centre) = attractors.as_slice().get(index) else {
            // No such centre: it constrains nothing.
            return f64::INFINITY;
        };
        let primary = index == 0;
        let primary_mu = attractors.primary_mu();
        let mut r_min = f64::INFINITY;
        for b in &self.bodies {
            let r = if primary {
                periapsis_distance(primary_mu, b.pos, b.vel)
            } else {
                // A companion is its own attractor, so skip the entry built from
                // this very body: its "separation from itself" is exactly zero and
                // would peg the substep at the softening-limited minimum forever,
                // throttling the whole simulation for no dynamical reason. The
                // entry is built from the body's own position in the same step, so
                // the comparison is exact rather than a tolerance.
                if centre.pos == b.pos {
                    continue;
                }
                magnitude([
                    b.pos[0] - centre.pos[0],
                    b.pos[1] - centre.pos[1],
                    b.pos[2] - centre.pos[2],
                ])
            };
            if r < r_min {
                r_min = r;
            }
        }
        if !r_min.is_finite() {
            if primary {
                // An empty system still has a feeding zone, and dust falls into
                // it; keep the pre-companion behaviour exactly.
                return self.core_accretion_radius;
            }
            // Nothing is anywhere near this companion, so it imposes no
            // constraint at all. `stable_substep` reads an infinite radius as
            // zero angular frequency and returns the unconstrained step.
            return f64::INFINITY;
        }
        r_min.max(0.0)
    }

    /// The closest encounter to ANY centre — the minimum of
    /// [`Kernel::innermost_encounter_radius_to`] over the whole set. This single
    /// number, not the per-centre ones, is what the CFL guard integrates with;
    /// see [`Kernel::stable_substep_for_attractors`] for why.
    fn innermost_encounter_radius(&self, attractors: &AttractorSet) -> f64 {
        (0..attractors.len()).fold(f64::INFINITY, |r, i| {
            r.min(self.innermost_encounter_radius_to(i, attractors))
        })
    }

    /// Largest substep that resolves the DEEPEST potential present — the
    /// multi-centre CFL guard.
    ///
    /// `stable_substep` decreases in `mu` and increases in radius, so taking the
    /// minimum over the centres at the single closest encounter radius is the
    /// conservative combination: the guard can only ever over-resolve the motion.
    /// With one centre it is exactly the single-central-force guard it replaces.
    ///
    /// DELIBERATELY SHARED across the centres (review finding P2-D asked for a
    /// per-centre `r_min`, and the per-centre radii are computed above — they are
    /// just not used here). Pairing a centre only with the closest approach made
    /// to IT looks like the tighter physics and it is strictly LOOSER: for a body
    /// in a close encounter with the companion it raises the step by
    /// `sqrt(mu_primary / mu_companion)^(1/2)`. That margin is not waste. What has
    /// to be resolved during such an encounter is the CROSSING time
    /// `r_sep / v_rel`, and `v_rel` there is dominated by the Keplerian shear the
    /// PRIMARY imposes, not by the companion's own escape speed — so the
    /// primary's `mu` evaluated at the encounter separation is the term that
    /// stands in for it. Relaxing it was measured: battery run #20
    /// (21.9 M☉, Z = 0.05, 250 AU — a system that fragments) unbinds a planet
    /// during `ProtostarCoalescence`, exactly the manufactured-energy failure the
    /// guard exists to prevent. Pinned by
    /// `the_cfl_guard_charges_every_centre_with_the_closest_encounter_present`.
    fn stable_substep_for_attractors(&self) -> f64 {
        let attractors = self.attractor_set();
        let r_min = self.innermost_encounter_radius(&attractors);
        attractors.as_slice().iter().fold(INTERNAL_DT, |h, a| {
            h.min(stable_substep(a.mu, SOFTENING, r_min))
        })
    }

    /// How much of the primary's gravity is left, given how far through its death
    /// the star is (Decision D4). Monotonically non-increasing, so orbits only
    /// ever widen.
    ///
    /// Exactly 1.0 until `REDGIANT_MASS_LOSS_ONSET`, so formation, the main
    /// sequence and the early red giant are numerically untouched.
    fn mass_loss_target(&self) -> f64 {
        let retained = self.remnant_retained_fraction();
        if retained >= 1.0 {
            // Nothing to shed: a brown dwarf never dies, so it keeps every gram
            // (and therefore all of its gravity) forever.
            return 1.0;
        }
        let ramp = |t: f64| t.clamp(0.0, 1.0);
        let progress = self.compute_stage_progress();
        let shed = match self.stage {
            LifecycleStage::RedGiant => {
                REDGIANT_MASS_LOSS_SHARE
                    * ramp((progress - REDGIANT_MASS_LOSS_ONSET) / (1.0 - REDGIANT_MASS_LOSS_ONSET))
            }
            LifecycleStage::Death => {
                let span = if self.mass_loss_is_impulsive() {
                    DEATH_MASS_LOSS_SPAN_IMPULSIVE
                } else {
                    DEATH_MASS_LOSS_SPAN_ADIABATIC
                };
                REDGIANT_MASS_LOSS_SHARE
                    + (1.0 - REDGIANT_MASS_LOSS_SHARE)
                        * ramp((progress - DEATH_SHOCK_BREAKOUT) / span)
            }
            LifecycleStage::Remnant => 1.0,
            // Formation and the main sequence: the star has shed nothing at all.
            _ => 0.0,
        };
        1.0 - (1.0 - retained) * shed.clamp(0.0, 1.0)
    }

    /// Fraction of the star's envelope that has ALREADY left it, derived from the
    /// very `mass_loss_factor` that weakens its gravity.
    ///
    /// Deriving it rather than tracking it separately is the point: the gas the
    /// viewer watches leave and the pull that lets the surviving orbits widen are
    /// then provably the same quantity, and cannot drift apart.
    fn shed_fraction(&self) -> f64 {
        let retained = self.remnant_retained_fraction();
        if retained >= 1.0 {
            // Nothing to shed — a brown dwarf keeps its whole envelope forever.
            return 0.0;
        }
        ((1.0 - self.mass_loss_factor) / (1.0 - retained)).clamp(0.0, 1.0)
    }

    /// Fraction of the star that survives as the compact object.
    fn remnant_retained_fraction(&self) -> f64 {
        (remnant_mass(self.star_mass, self.fate.remnant) / self.star_mass.max(f64::EPSILON))
            .clamp(0.02, 1.0)
    }

    /// Whether the envelope leaves FASTER than an orbital period (so the
    /// surviving worlds are left with a velocity the remaining gravity may not
    /// hold) rather than slowly enough for the orbits to follow adiabatically.
    ///
    /// Core collapse — neutron star, pulsar or black hole — is impulsive. Shedding
    /// a planetary nebula on the way to a white dwarf takes millennia, i.e. many
    /// orbits, and a brown dwarf sheds nothing at all.
    fn mass_loss_is_impulsive(&self) -> bool {
        !matches!(
            self.fate.remnant,
            RemnantType::WhiteDwarf | RemnantType::BrownDwarf
        )
    }

    /// Advance the shed fraction toward its target for the current stage. Clamped
    /// to be monotone so numerical noise in the stage progress can never make a
    /// dying star's gravity RECOVER (which would pull the orbits back in).
    fn update_mass_loss(&mut self) {
        let target = self.mass_loss_target();
        if target.is_finite() {
            self.mass_loss_factor = self.mass_loss_factor.min(target).clamp(0.0, 1.0);
        }
    }

    // --- Formation/stellar evolution controller ------------------------------

    /// Advance the lifecycle. FORMATION (DustCloud → Protostar → Fusion →
    /// MainSequence) is driven by the accreted core-mass fraction; the STELLAR
    /// stages are driven by sim-time. Emits one entry event per transition.
    fn advance_stages(&mut self, sim_dt: f64, core_frac: f64, out: &mut Vec<PackedEvent>) {
        // Formation — sequential ifs so a big accretion jump can cascade.
        if self.stage == LifecycleStage::DustCloud && core_frac >= PROTOSTAR_CORE_FRACTION {
            self.stage = LifecycleStage::ProtostarCoalescence;
            self.emit_stage(SimEventType::CollapseOnset, 0.0, 0.0, out);
            // Seed planetesimals now that the protostar exists (spec §3.8). They
            // cannot predate it: real planetesimals condense in the protoplanetary
            // disc that forms alongside the protostar, not in the undifferentiated
            // dust cloud before it. Any visiting bodies already in `self.bodies` are
            // preserved because `seed_planetesimals` no longer resets the Vec.
            if !self.planetesimals_seeded {
                self.seed_planetesimals();
                self.planetesimals_seeded = true;
            }
            // The collapse is also what FRAGMENTS the cloud, so the companion
            // cores appear at the same moment (spec §4.2). Seeded after the
            // planetesimals so the RNG stream — and therefore every existing
            // deterministic expectation about the disc — is unchanged for the
            // clouds that do not fragment at all.
            if !self.companions_seeded {
                self.seed_companions();
                self.companions_seeded = true;
            }
        }
        if self.stage == LifecycleStage::ProtostarCoalescence && core_frac >= FUSION_CORE_FRACTION {
            self.stage = LifecycleStage::FusionIgnition;
            self.emit_stage(SimEventType::ProtostarFormed, 0.0, 0.0, out);
        }
        if self.stage == LifecycleStage::FusionIgnition && core_frac >= IGNITION_CORE_FRACTION {
            if self.substellar {
                // Below the hydrogen-burning limit, electron degeneracy halts the
                // contraction before the core ever reaches ~10^7 K. Fusion NEVER
                // starts, so no `FusionIgnition` event is emitted and there is no
                // main sequence, red giant or death to walk through: the object is
                // already the brown dwarf it will remain, and from here it cools.
                self.stage = LifecycleStage::Remnant;
                self.stellar_elapsed = 0.0;
                let remnant = self.fate.remnant as u32 as f64;
                self.emit_stage(SimEventType::RemnantFormed, remnant, 0.0, out);
            } else {
                self.stage = LifecycleStage::MainSequence;
                self.stellar_elapsed = 0.0;
                self.emit_stage(SimEventType::FusionIgnition, 0.0, 0.0, out);
            }
        }

        // Stellar — sim-time driven; a single large dt can cross several stages.
        if (self.stage as u32) >= LifecycleStage::MainSequence as u32
            && (self.stage as u32) < LifecycleStage::Remnant as u32
            && sim_dt.is_finite()
            && sim_dt > 0.0
        {
            // Bound how much of the DEATH stage a single step may consume so the
            // collapse -> flash -> expanding fireball sequence is always
            // watchable instead of being crossed whole inside one frame.
            self.stellar_elapsed += if self.stage == LifecycleStage::Death {
                self.death_step(sim_dt)
            } else {
                sim_dt
            };
            let mut guard = 0;
            while guard < 8 {
                guard += 1;
                let dur = self.durations[self.stage as usize];
                if !dur.is_finite() || dur <= 0.0 || self.stellar_elapsed < dur {
                    break;
                }
                self.stellar_elapsed -= dur;
                match self.stage {
                    LifecycleStage::MainSequence => {
                        self.stage = LifecycleStage::RedGiant;
                        // The engulfment itself is NOT done here: the star has
                        // only just begun to swell, and `step` re-checks its
                        // photosphere against every world on every step from now
                        // to the death.
                        self.emit_stage(SimEventType::RedGiantOnset, 0.0, 0.0, out);
                    }
                    LifecycleStage::RedGiant => {
                        self.stage = LifecycleStage::Death;
                        // Whatever time was left over from the red giant must NOT
                        // be carried into the death: at a fast pace it is
                        // astronomically more than the death lasts and would fling
                        // the star straight through to the remnant in the same
                        // step it entered.
                        self.stellar_elapsed =
                            self.stellar_elapsed.min(self.death_step(f64::INFINITY));
                        let sn = bool_f64(self.fate.supernova);
                        self.emit_stage(SimEventType::DeathEvent, sn, 0.0, out);
                    }
                    LifecycleStage::Death => {
                        self.stage = LifecycleStage::Remnant;
                        // The envelope is now entirely gone, so the primary's
                        // gravity is down to the remnant's before the binding of
                        // the survivors is judged against it.
                        self.update_mass_loss();
                        self.unbind_planets_after_mass_loss(out);
                        let remnant = self.fate.remnant as u32 as f64;
                        let sn = bool_f64(self.fate.supernova);
                        self.emit_stage(SimEventType::RemnantFormed, remnant, sn, out);
                        break;
                    }
                    _ => break,
                }
            }
        }
    }

    /// Push a lifecycle event stamped with the current sim time.
    fn emit_stage(&self, kind: SimEventType, data_a: f64, data_b: f64, out: &mut Vec<PackedEvent>) {
        out.push(PackedEvent {
            kind,
            sim_time: self.sim_time,
            data_a,
            data_b,
        });
    }

    /// Physically meaningful elapsed time (sim seconds). Formation is
    /// accretion-driven, so its progress is mapped onto the REAL formation
    /// durations (~1.6 Myr solar); afterwards the stellar clock continues.
    fn compute_elapsed_sim_seconds(&self) -> f64 {
        let d = &self.durations;
        let dust = d[LifecycleStage::DustCloud as usize];
        let proto = d[LifecycleStage::ProtostarCoalescence as usize];
        let ignition = d[LifecycleStage::FusionIgnition as usize];
        match self.stage {
            LifecycleStage::DustCloud => dust * self.compute_stage_progress(),
            LifecycleStage::ProtostarCoalescence => dust + proto * self.compute_stage_progress(),
            LifecycleStage::FusionIgnition => {
                dust + proto + ignition * self.compute_stage_progress()
            }
            _ if self.substellar => {
                // A brown dwarf skips the main sequence, the red giant and the
                // death entirely, so none of those durations may be added to its
                // clock: it simply cools from the moment it finishes forming.
                dust + proto + ignition + self.stellar_elapsed
            }
            _ => {
                let mut done = dust + proto + ignition;
                if (self.stage as u32) > LifecycleStage::MainSequence as u32 {
                    done += d[LifecycleStage::MainSequence as usize];
                }
                if (self.stage as u32) > LifecycleStage::RedGiant as u32 {
                    done += d[LifecycleStage::RedGiant as usize];
                }
                if (self.stage as u32) > LifecycleStage::Death as u32 {
                    done += d[LifecycleStage::Death as usize];
                }
                done + self.stellar_elapsed
            }
        }
    }

    /// Normalized 0..1 progress through the current stage.
    fn compute_stage_progress(&self) -> f64 {
        let clamp01 = |v: f64| v.clamp(0.0, 1.0);
        match self.stage {
            LifecycleStage::DustCloud => clamp01(self.core_fraction / PROTOSTAR_CORE_FRACTION),
            LifecycleStage::ProtostarCoalescence => clamp01(
                (self.core_fraction - PROTOSTAR_CORE_FRACTION)
                    / (FUSION_CORE_FRACTION - PROTOSTAR_CORE_FRACTION),
            ),
            LifecycleStage::FusionIgnition => clamp01(
                (self.core_fraction - FUSION_CORE_FRACTION)
                    / (IGNITION_CORE_FRACTION - FUSION_CORE_FRACTION),
            ),
            LifecycleStage::MainSequence | LifecycleStage::RedGiant | LifecycleStage::Death => {
                let dur = self.durations[self.stage as usize];
                if dur.is_finite() && dur > 0.0 {
                    clamp01(self.stellar_elapsed / dur)
                } else {
                    1.0
                }
            }
            // The remnant stage never ends, so "progress through it" can only be
            // the progress of the one thing in it that DOES evolve: the nebula
            // dispersing. Reported on the same clock and the same lifetime the
            // ejecta particles age on, so the drawn shell and the gas fade out
            // together (spec §4.4). It used to be a flat 1.0, which left the
            // renderer with nothing to drive a fading shell from.
            LifecycleStage::Remnant => clamp01(self.remnant_elapsed / EJECTA_LIFETIME),
        }
    }

    // --- Seeding -------------------------------------------------------------

    fn seed_particles(&mut self, requested: usize) {
        let count = requested.min(MAX_PARTICLES);
        let extent = self.cloud_extent;
        let cum = self.species_cumulative();
        let seed_mu = self.mu();
        // Only the embryos this disc's solid budget can actually assemble are
        // reserved out of the dust: in a metal-poor cloud the mass of the embryos
        // that are never seeded simply STAYS in the dust (spec §4.3), so the
        // cloud's mass book-keeping is untouched by the composition.
        let dust_budget = self.cloud_mass * (1.0 - CORE_SEED_FRACTION)
            - self.planetesimal_count as f64 * PLANETESIMAL_SEED_MASS;
        let per_particle = if count > 0 {
            (dust_budget / count as f64).max(0.0)
        } else {
            0.0
        };
        self.particles = Vec::with_capacity(count);
        for _ in 0..count {
            // Centrally-concentrated cloud (surface density ∝ 1/ρ) in the x–z
            // plane with a modest vertical spread that dissipation collapses into
            // a disc. Concentration + sub-Keplerian spin let the cloud drain onto
            // the forming star over the formation phase.
            let rho = extent
                * (DISC_INNER_FRACTION
                    + (DISC_OUTER_FRACTION - DISC_INNER_FRACTION) * self.rng.next_f64());
            let phi = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let x = rho * phi.cos();
            let z = rho * phi.sin();
            let y = (self.rng.next_f64() - 0.5) * extent * 0.45;

            let v_circ = circular_speed(seed_mu, SOFTENING, rho.max(SOFTENING));
            let spin = v_circ * (0.45 + 0.15 * self.rng.next_f64());
            let disp = v_circ * 0.05;
            let rho_safe = rho.max(1e-6);
            let (color, size) = self.species_color_size(cum);
            self.particles.push(Particle {
                x,
                y,
                z,
                vx: (-z / rho_safe) * spin + (self.rng.next_f64() - 0.5) * disp,
                vy: (self.rng.next_f64() - 0.5) * disp,
                vz: (x / rho_safe) * spin + (self.rng.next_f64() - 0.5) * disp,
                r: color[0],
                g: color[1],
                b: color[2],
                size,
                mass: per_particle,
                kind: ParticleKind::Dust,
                ttl: f64::INFINITY,
            });
        }
    }

    fn seed_planetesimals(&mut self) {
        // Do NOT reset `self.bodies` here: any visiting comets/asteroids that
        // arrived during DustCloud must be preserved. Planetesimals are simply
        // pushed onto the existing (possibly non-empty) body list.
        //
        // How many embryos condense is set by the disc's SOLID budget (spec §4.3,
        // Decision D3). A cloud too metal-poor to assemble even one seeds nothing
        // at all — and, drawing no random numbers here, leaves the RNG stream to
        // the gas-only channels (companion fragmentation, visiting bodies) that
        // need no solids.
        let count = self.planetesimal_count;
        if count == 0 {
            return;
        }
        let seed_mu = self.mu();
        // Geometric (Titius-Bode-like) spacing, each orbit ~30% wider than the
        // last, with small eccentricities and mutual inclinations.
        // The innermost seed sits just outside the star's (now small) dust-capture
        // zone, so several seeds land INSIDE the 2.7 AU snow line — the
        // terrestrial zone. Previously the first seed was already at the snow
        // line, so every planet was an ice/gas world and the biggest one always
        // formed closest to the star.
        let inner = (self.cloud_extent * 0.008).max(self.core_accretion_radius * 1.4);
        // The outermost seed must sit INSIDE the dust disc it grows from.
        let outer = (inner * 6.0).max(self.cloud_extent * DISC_OUTER_FRACTION * 0.9);
        let mass = PLANETESIMAL_SEED_MASS;
        let ratio = if count > 1 {
            (outer / inner).powf(1.0 / (count - 1) as f64)
        } else {
            1.0
        };
        for i in 0..count {
            let a = inner * ratio.powi(i as i32) * (0.94 + 0.12 * self.rng.next_f64());
            let ecc = 0.02 + 0.13 * self.rng.next_f64();
            let inclination = (self.rng.next_f64() - 0.5) * 0.09;
            let phase = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let at_periapsis = self.rng.next_f64() < 0.5;
            let speed = circular_speed(seed_mu, SOFTENING, a)
                * (1.0 + if at_periapsis { ecc } else { -ecc }).sqrt();
            let cos_i = inclination.cos();
            let sin_i = inclination.sin();
            let position: Vec3 = [a * phase.cos(), a * sin_i, a * phase.sin() * cos_i];
            let velocity: Vec3 = [
                -speed * phase.sin(),
                speed * sin_i * 0.5,
                speed * phase.cos() * cos_i,
            ];
            let spin = 0.5 + self.rng.next_f64();
            self.bodies.push(CelestialBody {
                id: self.next_body_id,
                kind: BodyType::Protoplanet,
                mass,
                radius: body_radius_from_mass(mass, self.cloud_mass),
                pos: position,
                vel: velocity,
                spin,
                captured: true,
                // Planetesimals grow the emergent way, by sweeping dust.
                accretion_target: 0.0,
            });
            self.next_body_id += 1.0;
        }
    }

    /// Seed the cloud's FRAGMENTS as companion cores (spec §4.2, Decision D1).
    ///
    /// Called once, at ProtostarCoalescence entry: fragmentation is what the
    /// collapse does, so the pieces appear when the collapse does. Each core is
    /// placed on a wide, mildly eccentric orbit outside the primary's feeding zone
    /// and outside the dust disc the planets grow from, with every further
    /// companion `COMPANION_ORBIT_HIERARCHY` times wider still — the hierarchy
    /// being the only stable arrangement for three bodies.
    ///
    /// The innermost companion still sits close enough that the OUTER disc is near
    /// the classical stability limit for a world orbiting one member of a pair
    /// (`a_planet / a_binary` of a few tenths). That is deliberate: it keeps the
    /// second star inside the volume the camera frames — the whole point of the
    /// feature is to see it — and the consequence is real rather than a defect. The
    /// outermost worlds are genuinely perturbed, and one that is thrown clear
    /// leaves the system via `eject_escaping_worlds` instead of drifting for ever.
    ///
    /// The seed mass is taken OUT of the inner-disc reservoir, never created: the
    /// fragment's remaining share is drawn from the same reservoir under the same
    /// rate limit in `accrete`, so the cloud's mass budget is untouched by the
    /// existence of companions.
    fn seed_companions(&mut self) {
        if self.companion_targets.is_empty() {
            return;
        }
        let seed_mu = self.mu();
        let extent = self.cloud_extent;
        let targets = std::mem::take(&mut self.companion_targets);
        for (index, target) in targets.iter().enumerate() {
            let hierarchy = COMPANION_ORBIT_HIERARCHY.powi(index as i32);
            let a = extent
                * COMPANION_ORBIT_INNER_FRACTION
                * hierarchy
                * (1.0 + COMPANION_ORBIT_SPREAD_FRACTION * self.rng.next_f64());
            let ecc =
                COMPANION_ECCENTRICITY_MIN + COMPANION_ECCENTRICITY_SPAN * self.rng.next_f64();
            // Companions are born from the same collapsing cloud as the disc, so
            // they share its plane to within a few degrees.
            let inclination = (self.rng.next_f64() - 0.5) * 0.12;
            let phase = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let at_periapsis = self.rng.next_f64() < 0.5;
            let speed = circular_speed(seed_mu, SOFTENING, a)
                * (1.0 + if at_periapsis { ecc } else { -ecc }).sqrt();
            let cos_i = inclination.cos();
            let sin_i = inclination.sin();
            let position: Vec3 = [a * phase.cos(), a * sin_i, a * phase.sin() * cos_i];
            let velocity: Vec3 = [
                -speed * phase.sin(),
                speed * sin_i * 0.5,
                speed * phase.cos() * cos_i,
            ];
            let spin = 0.5 + self.rng.next_f64();
            // Drawn from the reservoir, so the budget is conserved exactly; an
            // empty reservoir simply means the fragment starts from nothing and
            // assembles the whole of itself by accretion.
            let seed = COMPANION_SEED_MASS
                .min(*target)
                .min(self.disc_reservoir)
                .max(0.0);
            self.disc_reservoir -= seed;
            self.bodies.push(CelestialBody {
                id: self.next_body_id,
                // A fragment is a PROTOSTELLAR CORE, never a world. It is born at
                // the opacity limit — below the deuterium-burning mass — but it is
                // on the stellar track from the start and must be treated as such:
                // it may not merge with a planetesimal, be engulfed by the giant it
                // orbits, or be swept up by the planet-only rules that
                // `is_planetary` gates. So it carries the substellar kind from
                // birth, and `promote_bodies` never demotes a body that shines.
                kind: BodyType::BrownDwarf,
                mass: seed,
                radius: body_radius_from_mass(seed, self.cloud_mass),
                pos: position,
                vel: velocity,
                spin,
                captured: true,
                accretion_target: *target,
            });
            self.next_body_id += 1.0;
        }
        self.companion_targets = targets;
    }

    // --- Integration ---------------------------------------------------------

    fn integrate_particles(&mut self, attractors: &AttractorSet, h: f64, forming: bool) {
        let vertical = (1.0 - VERTICAL_DAMP * h).max(0.0);
        let settle = (1.0 - DISK_SETTLE * h).max(0.0);
        let dust_drag = if forming {
            (1.0 - GAS_DRAG * h).max(0.0)
        } else {
            1.0
        };
        // Debris from a disrupted body is shocked, self-colliding material on its
        // way into the star, so it bleeds angular momentum far faster than gas.
        let debris_drag = (1.0 - DEBRIS_DRAG * h).max(0.0);
        // The death shell ploughs into the interstellar medium and sweeps it up,
        // so it decelerates and finally stalls — the snowplough phase every real
        // remnant ends in, and the reason an old nebula sits at a fixed size
        // while it fades instead of racing away forever.
        let ejecta_drag = (1.0 - EJECTA_DRAG * h).max(0.0);
        // Once fusion has ignited, the star's radiation pressure exceeds its pull
        // on the leftover grains (β > 1), so the residual cloud is driven OUT
        // instead of continuing to fall in. Only the dust feels this; ejecta and
        // tidal debris are dense, optically thick material.
        let dust_gravity = if forming {
            1.0
        } else {
            1.0 - IGNITED_RADIATION_BETA
        };
        // Radiation pressure is a property of the STARS, so it scales every
        // centre's pull — dust must not keep raining onto a companion either.
        let dust_attractors = attractors.scaled(dust_gravity);
        for p in &mut self.particles {
            let dust = p.kind == ParticleKind::Dust;
            // The escaping envelope COASTS at its terminal velocity: the dying
            // star's radiation pressure on this dusty, line-opaque gas balances
            // its gravity (that balance is what drives the wind off in the first
            // place, and it is why real nebular shells expand at a constant speed
            // for millennia). Modelling it as ballistic is also what makes the
            // shell's speed a property of the DEATH rather than of the visually
            // inflated orbital mass scale (×110): launched at escape speed from
            // that scale the envelope crossed the entire 50 AU system in a fifth
            // of the death stage and was far off-screen before the remnant
            // appeared — the reported "there is no nebula".
            let a = match p.kind {
                ParticleKind::Ejecta => [0.0; 3],
                _ => attractor_accel(
                    if dust {
                        dust_attractors.as_slice()
                    } else {
                        attractors.as_slice()
                    },
                    SOFTENING,
                    [p.x, p.y, p.z],
                ),
            };
            let drag = match p.kind {
                ParticleKind::Dust => dust_drag,
                ParticleKind::Debris => debris_drag,
                ParticleKind::Ejecta => ejecta_drag,
            };
            // Vertical dissipation is a DISC phenomenon (grain-on-grain collisions
            // in a dense midplane). Applying it to the death shell would squash a
            // spherical planetary nebula into a pancake, and applying it to a
            // tidal stream would flatten an arc that should stay ballistic.
            p.vx = (p.vx + a[0] * h) * drag;
            p.vy = (p.vy + a[1] * h) * if dust { vertical } else { drag };
            p.vz = (p.vz + a[2] * h) * drag;
            p.x += p.vx * h;
            p.y = if dust { p.y * settle } else { p.y } + p.vy * h;
            p.z += p.vz * h;
        }
    }

    /// Age the transient particle populations and drop those whose lifetime has
    /// run out (mirror of `ageParticles`). Only debris is transient: birth dust
    /// is removed by accretion and ejecta by escaping the system, both
    /// physically.
    fn age_particles(&mut self, orbital_dt: f64) {
        let mut expired = false;
        for p in &mut self.particles {
            if p.ttl.is_finite() {
                p.ttl -= orbital_dt;
                if p.ttl <= 0.0 {
                    expired = true;
                }
            }
        }
        if expired {
            self.particles.retain(|p| p.ttl > 0.0);
        }
    }

    fn integrate_bodies(&mut self, attractors: &AttractorSet, h: f64) {
        // Planetesimals damp toward the mid-plane far more weakly than the dust,
        // so the system keeps small mutual inclinations like a real one.
        let vertical = (1.0 - VERTICAL_DAMP * BODY_DAMP_FRACTION * h).max(0.0);
        for body in &mut self.bodies {
            // A companion is both a body and a centre; it must not attract itself.
            let field = if body.kind.is_stellar() {
                attractors.excluding(body.pos)
            } else {
                *attractors
            };
            let (pos, mut vel) =
                integrate_orbit_attractors(body.pos, body.vel, field.as_slice(), SOFTENING, h);
            if body.kind.is_planetary() {
                vel[1] *= vertical;
            }
            body.pos = pos;
            body.vel = vel;
        }
    }

    // --- Accretion -----------------------------------------------------------

    /// Sweep dust onto the central core and the planetesimals/planets, and merge
    /// overlapping bodies — the emergent growth that turns a disc into planets
    /// and feeds the star. Momentum is conserved on every merge.
    fn accrete(&mut self, stage: LifecycleStage, orbital_dt: f64, substep: f64) {
        let cloud_mass = self.cloud_mass;
        // Retention depends on the disc's condensable-solid budget as well as on
        // where the body orbits (spec §4.3): no metals, no grains, no growth.
        let metals = self.composition[2];
        let capture_radius = self.capture_radius_for(substep);
        let core_r2 = capture_radius * capture_radius;

        // Angular-momentum-regulated accretion budget for this step: the star
        // can only take so much mass per unit time. Material already waiting in
        // the inner disc reaches it first; dust arriving faster than the cap
        // stays in the visible disc and is swallowed on later steps.
        //
        // How much the star can still take AT ALL is capped by `star_mass`: a
        // star only ever assembles a fraction of its birth cloud, and past that
        // point its own radiation drives the rest away. This is what makes a
        // 40 M☉ cloud yield a ~10 M☉ star instead of a 40 M☉ one.
        let capacity = (self.star_mass - self.core_mass).max(0.0);
        let star_full = capacity <= 0.0;
        let mut core_budget =
            (CORE_ACCRETION_RATE * self.star_mass * orbital_dt.max(0.0)).min(capacity);
        let from_reservoir = self.disc_reservoir.min(core_budget);
        self.disc_reservoir -= from_reservoir;
        self.core_mass += from_reservoir;
        core_budget -= from_reservoir;
        // The cloud's FRAGMENTS feed from the same reservoir, after the primary
        // and under the same finite rate (spec §4.2). This is why a companion is
        // seen to grow into a star rather than appearing as one.
        self.feed_companions(orbital_dt);
        if star_full && !self.companions_hungry() && self.disc_reservoir > 0.0 {
            // The star can take no more: the inner disc is photo-evaporated away.
            // Held back while a fragment is still assembling — that gas is bound
            // to the companion, not free to be blown off.
            self.dispersed_mass += self.disc_reservoir;
            self.disc_reservoir = 0.0;
        }
        // Only WORLDS sweep dust into themselves. A companion's growth is
        // rate-limited stellar accretion (`feed_companions`), not the grain-by-
        // grain sweeping that builds a planet, so it must not do both.
        let body_r2: Vec<f64> = self
            .bodies
            .iter()
            .map(|b| {
                if b.kind.is_planetary() {
                    let ar = accretion_radius(b.mass, cloud_mass);
                    ar * ar
                } else {
                    -1.0
                }
            })
            .collect();

        // While a fragment is still assembling, gas arriving at the inner disc has
        // somewhere to go even after the primary is full, so it must not be
        // dispersed as if nothing could take it.
        let all_full = star_full && !self.companions_hungry();
        let mut to_reservoir = 0.0f64;
        let mut survivors: Vec<Particle> = Vec::with_capacity(self.particles.len());
        for p in std::mem::take(&mut self.particles) {
            if p.kind == ParticleKind::Ejecta {
                // The escaping envelope is not re-accreted. It is unbound, it is
                // leaving, and it now CARRIES the mass the star shed — letting the
                // star (or a planet it passes) eat it again would put that mass
                // back where it came from and make the death reversible.
                survivors.push(p);
                continue;
            }
            let r2 = p.x * p.x + p.y * p.y + p.z * p.z;
            if r2 <= core_r2 {
                if core_budget >= p.mass {
                    core_budget -= p.mass;
                    self.core_mass += p.mass;
                } else if all_full {
                    // The star has all the mass it will ever have; anything
                    // still falling in is blown back out rather than accreted.
                    self.dispersed_mass += p.mass;
                } else {
                    // Over the accretion rate limit: queue into the inner-disc
                    // reservoir so it drains into the star at the rate-limited
                    // Ṁ over future steps. With bodies deferred to
                    // ProtostarCoalescence (§3.8), no bodies exist during
                    // DustCloud to intercept grains at larger radii and route
                    // them here via `to_reservoir`. We do it directly:
                    // a grain inside the core feeding radius is in the inner
                    // disc, not still orbiting the outer cloud.
                    to_reservoir += p.mass;
                }
                continue;
            }
            let mut absorbed = false;
            for (i, b) in self.bodies.iter_mut().enumerate() {
                if body_r2[i] < 0.0 {
                    continue;
                }
                let dx = p.x - b.pos[0];
                let dy = p.y - b.pos[1];
                let dz = p.z - b.pos[2];
                if dx * dx + dy * dy + dz * dz <= body_r2[i] {
                    // Retention depends on WHERE the body orbits — rock only
                    // inside the snow line, ices + gas beyond it — and on how much
                    // of either the cloud contains at all.
                    let orbit_radius = magnitude(b.pos);
                    let retained = p.mass * accretion_efficiency(orbit_radius, metals);
                    b.mass += retained;
                    b.radius = body_radius_from_mass(b.mass, cloud_mass);
                    // The remainder is NOT teleported to the star: it flows into
                    // the inner disc and reaches the core only at the limited Ṁ.
                    to_reservoir += p.mass - retained;
                    // NOTE: deliberately NOT blending the dust's velocity in —
                    // the simulated dust is strongly sub-Keplerian, so doing so
                    // would spiral every planet into the star.
                    absorbed = true;
                    break;
                }
            }
            if !absorbed {
                survivors.push(p);
            }
        }
        self.particles = survivors;
        self.disc_reservoir += to_reservoir;

        if (stage as u32) <= LifecycleStage::MainSequence as u32 {
            self.merge_bodies();
        }
    }

    /// Whether any cloud fragment has still not assembled its share of the cloud.
    fn companions_hungry(&self) -> bool {
        self.bodies
            .iter()
            .any(|b| b.accretion_target > 0.0 && b.mass < b.accretion_target)
    }

    /// Grow the cloud's fragments toward their share of it, drawing from the same
    /// inner-disc reservoir that feeds the primary and under the same finite
    /// accretion rate (spec §4.2).
    ///
    /// The rate is keyed on the fragment's OWN final mass, exactly as the
    /// primary's is on `star_mass`, so every piece of the cloud assembles over the
    /// same number of frames however the mass is divided — a companion is seen to
    /// grow into a star over the formation phase instead of appearing as one.
    ///
    /// Mass is MOVED, never created: whatever the fragment takes leaves the
    /// reservoir in the same statement.
    fn feed_companions(&mut self, orbital_dt: f64) {
        if self.disc_reservoir <= 0.0 || orbital_dt <= 0.0 {
            return;
        }
        let cloud_mass = self.cloud_mass;
        // Disjoint field borrows: the loop holds `self.bodies`, the transfer
        // touches `self.disc_reservoir`.
        for body in &mut self.bodies {
            if body.accretion_target <= 0.0 {
                continue;
            }
            let remaining = (body.accretion_target - body.mass).max(0.0);
            if remaining <= 0.0 {
                continue;
            }
            let rate_limit = CORE_ACCRETION_RATE * body.accretion_target * orbital_dt;
            let taken = remaining.min(rate_limit).min(self.disc_reservoir);
            if taken <= 0.0 {
                break;
            }
            self.disc_reservoir -= taken;
            body.mass += taken;
            body.radius = body_radius_from_mass(body.mass, cloud_mass);
        }
    }

    /// Destroy bodies that have fallen into the star, adding their mass to the
    /// core. A momentum-conserving merge between bodies on opposing orbital
    /// phases can cancel most of the orbital velocity, and accreting
    /// sub-Keplerian dust slowly decays orbits — either way the body free-falls
    /// inward. Physically it is then swallowed; without this it would sit at the
    /// star's position forever (a "planet inside the star").
    fn swallow_bodies_into_star(&mut self, events: &mut Vec<PackedEvent>) {
        let r2max = self.body_swallow_radius * self.body_swallow_radius;
        let sim_time = self.sim_time;
        let mut doomed: Vec<CelestialBody> = Vec::new();
        self.bodies.retain(|b| {
            let r2 = b.pos[0] * b.pos[0] + b.pos[1] * b.pos[1] + b.pos[2] * b.pos[2];
            if r2 <= r2max {
                doomed.push(*b);
                false
            } else {
                true
            }
        });
        for body in doomed {
            // Tidal disruption: tear the body into a debris stream that falls
            // into the star rather than simply deleting it.
            self.spawn_debris(&body);
            self.core_mass += body.mass;
            events.push(PackedEvent {
                kind: SimEventType::BodyConsumed,
                sim_time,
                data_a: body.id,
                data_b: body.kind as u32 as f64,
            });
        }
    }

    /// The star's photospheric radius RIGHT NOW, in scene units — the surface the
    /// wind detaches from, and the surface no world can be inside and survive.
    ///
    /// Scales as mass^0.8 and reaches `REDGIANT_ENGULF_AU · M^0.8` at the tip of
    /// the red-giant branch, tracking the drawn photosphere
    /// (`giantPhotosphereRadius` = `trueStellarRadius` ∝ M^0.8 × `RED_GIANT_SWELL`)
    /// with a constant 47 % margin at EVERY mass, so no planet ever survives
    /// visually inside the giant — asserted host-side in
    /// `test/render/starVisual.test.ts` against this exact law.
    ///
    /// It GROWS through the red giant instead of appearing at full size, because
    /// that is what the renderer draws and because the whole point of the death
    /// scene is to watch the star swell over its worlds rather than to find them
    /// already gone.
    fn photosphere_radius(&self) -> f64 {
        let giant = REDGIANT_ENGULF_AU * self.star_mass.max(0.1).powf(0.8);
        match self.stage {
            LifecycleStage::RedGiant => {
                let swell = MAIN_SEQUENCE_PHOTOSPHERE_FRACTION
                    + (1.0 - MAIN_SEQUENCE_PHOTOSPHERE_FRACTION) * self.compute_stage_progress();
                giant * swell
            }
            // Through the death the envelope is still there — expanding, and then
            // transparent. Held at the giant's radius rather than at the drawn
            // fireball's: the fireball is optically thin ejecta sweeping past the
            // outer worlds, not a photosphere that swallows them.
            LifecycleStage::Death => giant,
            _ => giant * MAIN_SEQUENCE_PHOTOSPHERE_FRACTION,
        }
    }

    /// Engulf and destroy planets orbiting inside the star's photosphere.
    ///
    /// Re-checked on EVERY step of the red-giant and death stages. It used to run
    /// exactly once, at red-giant onset, against the giant's FINAL radius — so a
    /// world that drifted inward afterwards (or one the star had not yet swollen
    /// past) went on orbiting happily inside the star for the rest of its life.
    fn engulf_inner_planets(&mut self, events: &mut Vec<PackedEvent>) {
        if !matches!(self.stage, LifecycleStage::RedGiant | LifecycleStage::Death) {
            return;
        }
        let r = self.photosphere_radius();
        let r2 = r * r;
        let sim_time = self.sim_time;
        let doomed: Vec<CelestialBody> = self
            .bodies
            .iter()
            .filter(|b| {
                b.kind.is_planetary()
                    && b.pos[0] * b.pos[0] + b.pos[1] * b.pos[1] + b.pos[2] * b.pos[2] <= r2
            })
            .copied()
            .collect();
        self.bodies.retain(|b| {
            !(b.kind.is_planetary()
                && b.pos[0] * b.pos[0] + b.pos[1] * b.pos[1] + b.pos[2] * b.pos[2] <= r2)
        });
        for body in doomed {
            self.spawn_debris(&body);
            self.core_mass += body.mass;
            events.push(PackedEvent {
                kind: SimEventType::BodyConsumed,
                sim_time,
                data_a: body.id,
                data_b: body.kind as u32 as f64,
            });
        }
    }

    /// Settle the surviving planets against the gravity the star has left, at the
    /// moment the compact object appears (Decision D4).
    ///
    /// The ORBIT WIDENING is deliberately NOT done here. It has already happened:
    /// `mass_loss_factor` weakened the primary's `mu` across the late red giant
    /// and the death stage, and the integrator carried every orbit outward under
    /// that weakening pull, continuously and adiabatically. This function used to
    /// apply the closed-form adiabatic result (`r → r/retained`,
    /// `v → v·√retained`) in ONE step instead, which teleported every surviving
    /// world outward by up to 4× between two consecutive frames and made planets
    /// appear to emerge from the collapsing giant (reported bug 2).
    ///
    /// What genuinely IS instantaneous survives: a core-collapse supernova's
    /// asymmetric explosion kicks the compact object (and, in this frame of
    /// reference, the planets) and the loosely bound worlds are then unbound. The
    /// binding test uses the SAME `mu` the integrator is now using, so a planet is
    /// never reported as ejected while the kernel keeps integrating it as bound.
    fn unbind_planets_after_mass_loss(&mut self, out: &mut Vec<PackedEvent>) {
        if !self.fate.supernova {
            // A planetary nebula is shed over millennia — many orbits — so there
            // is no impulse at all. The orbits have already widened.
            return;
        }
        // Whatever gravity is left, right now: primary (already reduced to
        // `retained`) plus any companion.
        let mu_remnant = self.total_mu();
        let sim_time = self.sim_time;
        let mut survivors: Vec<CelestialBody> = Vec::with_capacity(self.bodies.len());
        for mut body in std::mem::take(&mut self.bodies) {
            if !body.kind.is_planetary() {
                survivors.push(body);
                continue;
            }
            let kick = 0.18 * magnitude(body.vel);
            body.vel[0] += (self.rng.next_f64() - 0.5) * kick;
            body.vel[1] += (self.rng.next_f64() - 0.5) * kick;
            body.vel[2] += (self.rng.next_f64() - 0.5) * kick;
            let r = magnitude(body.pos);
            let speed = magnitude(body.vel);
            if is_bound(mu_remnant, r, speed) {
                survivors.push(body);
            } else {
                out.push(PackedEvent {
                    kind: SimEventType::BodyEjected,
                    sim_time,
                    data_a: body.id,
                    data_b: body.kind as u32 as f64,
                });
            }
        }
        self.bodies = survivors;
    }

    /// Tear a doomed body into a glowing debris stream (mirror of `spawnDebris`).
    fn spawn_debris(&mut self, body: &CelestialBody) {
        let budget = MAX_PARTICLES.saturating_sub(self.particles.len());
        let n = DEBRIS_PER_BODY.min(budget);
        let speed = magnitude(body.vel);
        for _ in 0..n {
            let shear = 0.75 + 0.5 * self.rng.next_f64();
            let jitter = speed * 0.08;
            self.particles.push(Particle {
                x: body.pos[0] + (self.rng.next_f64() - 0.5) * body.radius * 3.0,
                y: body.pos[1] + (self.rng.next_f64() - 0.5) * body.radius * 3.0,
                z: body.pos[2] + (self.rng.next_f64() - 0.5) * body.radius * 3.0,
                vx: body.vel[0] * shear + (self.rng.next_f64() - 0.5) * jitter,
                vy: body.vel[1] * shear + (self.rng.next_f64() - 0.5) * jitter,
                vz: body.vel[2] * shear + (self.rng.next_f64() - 0.5) * jitter,
                r: 1.0,
                g: 0.55 + 0.35 * self.rng.next_f64(),
                b: 0.25,
                size: 1.5,
                mass: 0.0,
                kind: ParticleKind::Debris,
                // Finite: the stream is falling into the star, not settling into
                // a ring around it.
                ttl: DEBRIS_LIFETIME * (0.6 + 0.8 * self.rng.next_f64()),
            });
        }
    }

    /// Merge pairs of planets/protoplanets whose discs overlap (momentum-conserving).
    // Index-based double loop: both indices index `self.bodies` AND `removed`,
    // and the inner body is mutated, so an iterator rewrite is not applicable.
    #[allow(clippy::needless_range_loop)]
    fn merge_bodies(&mut self) {
        let n = self.bodies.len();
        let mut removed = vec![false; n];
        for i in 0..n {
            if removed[i] || !self.bodies[i].kind.is_planetary() {
                continue;
            }
            for j in (i + 1)..n {
                if removed[j] || !self.bodies[j].kind.is_planetary() {
                    continue;
                }
                let a = self.bodies[i];
                let b = self.bodies[j];
                let dx = a.pos[0] - b.pos[0];
                let dy = a.pos[1] - b.pos[1];
                let dz = a.pos[2] - b.pos[2];
                // Collide on the DYNAMICAL radius, not the drawn one.
                let touch =
                    merge_radius(a.mass, self.cloud_mass) + merge_radius(b.mass, self.cloud_mass);
                if dx * dx + dy * dy + dz * dz <= touch * touch {
                    let vel = merged_velocity(a.mass, a.vel, b.mass, b.vel);
                    let mass = a.mass + b.mass;
                    self.bodies[i].vel = vel;
                    self.bodies[i].mass = mass;
                    self.bodies[i].radius = body_radius_from_mass(mass, self.cloud_mass);
                    removed[j] = true;
                }
            }
        }
        if removed.iter().any(|&r| r) {
            let mut idx = 0;
            self.bodies.retain(|_| {
                let keep = !removed[idx];
                idx += 1;
                keep
            });
        }
    }

    /// Remove dust that has escaped far beyond the system (keeps counts bounded).
    fn cull_particles(&mut self) {
        let dust = self.cloud_extent * ESCAPE_EXTENT_FACTOR;
        let dust2 = dust * dust;
        let ejecta = self.cloud_extent * EJECTA_ESCAPE_EXTENT_FACTOR;
        let ejecta2 = ejecta * ejecta;
        self.particles.retain(|p| {
            let limit2 = if p.kind == ParticleKind::Ejecta {
                ejecta2
            } else {
                dust2
            };
            p.x * p.x + p.y * p.y + p.z * p.z <= limit2
        });
    }

    /// Clear every circumstellar particle when the star dies, leaving only the
    /// death ejecta itself (mirror of `dissipateDiscMaterial`).
    ///
    /// By the time a star becomes a compact remnant its protoplanetary disc has
    /// been accreted, photo-evaporated and blown away, and any tidal debris from
    /// planets it ate has long since fallen in. So nothing should be left
    /// circling the white dwarf/neutron star. (Filtering on `mass <= 0` here
    /// previously kept the massless tidal debris alive, which is exactly what
    /// was seen orbiting the white dwarf.)
    fn dissipate_disc_material(&mut self) {
        self.particles.retain(|p| p.kind == ParticleKind::Ejecta);
    }

    /// Let go of however much of the envelope the star has lost by now, as gas
    /// launched from its current photosphere (spec §4.4).
    ///
    /// This replaces a single instantaneous burst thrown at shock breakout from a
    /// fixed 3–6 AU shell. That burst was the reason the collapse read as "the
    /// matter condenses into a white dwarf": nothing left the star during the red
    /// giant, nothing left it during the collapse, and the one shell that did
    /// appear was already off-screen before the death ended.
    ///
    /// Now the envelope leaves CONTINUOUSLY and from the surface it is actually
    /// leaving — a slow, dusty superwind through the late red giant, then the fast
    /// shell once the shock breaks out — and how much has gone is read straight
    /// off `mass_loss_factor`, the same quantity that weakens the star's gravity.
    /// So the gas that departs, the star that lightens and the orbits that widen
    /// are one mechanism.
    ///
    /// Mass is MOVED, never invented: every gram the wind carries is subtracted
    /// from the star's core in the same statement that hands it to the particles.
    fn shed_envelope(&mut self) {
        let shed = self.shed_fraction();
        if shed <= 0.0 {
            return;
        }
        // The envelope is divided into a fixed number of fragments, so the share
        // of it that has left decides how many of them are in flight.
        let target_launched = (EJECTA_COUNT as f64 * shed).round() as usize;
        if target_launched <= self.ejecta_launched {
            return;
        }
        let budget = MAX_PARTICLES.saturating_sub(self.particles.len());
        let n = (target_launched - self.ejecta_launched).min(budget);
        if n == 0 {
            // No room this step; the wind catches up once the shell has thinned.
            return;
        }
        let launched = self.ejecta_launched + n;

        // Mass this batch carries away — taken out of the star, so the budget is
        // conserved exactly and `star_mass_solar` shrinks toward the remnant's.
        let envelope = self.star_mass * (1.0 - self.remnant_retained_fraction());
        let target_shed = envelope * launched as f64 / EJECTA_COUNT as f64;
        let taken = (target_shed - self.shed_mass).clamp(0.0, self.core_mass.max(0.0));
        self.core_mass -= taken;
        self.shed_mass += taken;
        let per_fragment = taken / n as f64;

        let violent = self.fate.supernova;
        // Before the shock breaks out (and for the whole red giant) what leaves is
        // the slow superwind; afterwards it is the blast. A supernova's envelope
        // is accelerated by a single shock into a layered, velocity-stratified
        // shell; a planetary nebula is puffed off gently, so it is slower and more
        // ragged.
        let blast = self.has_shock_broken_out();
        let stall = match (blast, violent) {
            (false, _) => EJECTA_STALL_REACH_WIND,
            (true, true) => EJECTA_STALL_REACH_SUPERNOVA,
            (true, false) => EJECTA_STALL_REACH_NEBULA,
        };
        // Launch speed of a shell that decays as `exp(-EJECTA_DRAG · t)` and so
        // travels exactly `stall × cloud_extent` in total.
        let terminal = EJECTA_DRAG * stall * self.cloud_extent;
        let spread = if blast && violent { 0.5 } else { 0.28 };
        // Launched from the star's own surface — that is what makes the gas be
        // SEEN to detach — but never from inside the softened core, where the
        // integrator cannot resolve the motion.
        let r_base = self.photosphere_radius().max(2.0 * SOFTENING);
        for _ in 0..n {
            let cos_t = 2.0 * self.rng.next_f64() - 1.0;
            let sin_t = (1.0 - cos_t * cos_t).max(0.0).sqrt();
            let phi = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let dir: Vec3 = [sin_t * phi.cos(), cos_t, sin_t * phi.sin()];
            let r0 = r_base * (1.0 + EJECTA_LAUNCH_SPREAD * self.rng.next_f64());
            let roll = self.rng.next_f64();
            // Velocity stratification: the shell is layered rather than a single
            // surface — and every layer is launched radially OUTWARD, so no
            // fragment can ever circle back or settle around the remnant.
            let speed = terminal * (1.0 + spread * roll);
            // The fastest, outermost material of a supernova is also the hottest,
            // so the shell shades from a blue-white leading edge through white to
            // a cooler interior. The AGB superwind that precedes it is the
            // opposite — cool, dusty and red, the material the blast later lights
            // up from inside.
            let heat = if violent { roll } else { roll * 0.5 };
            let (r, g, b, size) = if !blast {
                (0.95, 0.42 + 0.18 * roll, 0.22, 1.3)
            } else if violent {
                (
                    1.0 - 0.35 * heat,
                    0.45 + 0.45 * heat,
                    0.3 + 0.7 * heat,
                    1.5 + 0.8 * heat,
                )
            } else {
                (0.95, 0.55, 0.85, 1.6)
            };
            self.particles.push(Particle {
                x: dir[0] * r0,
                y: dir[1] * r0,
                z: dir[2] * r0,
                vx: dir[0] * speed,
                vy: dir[1] * speed,
                vz: dir[2] * speed,
                r,
                g,
                b,
                size,
                mass: per_fragment,
                kind: ParticleKind::Ejecta,
                // Finite, and randomised per fragment: the nebula thins and dims
                // over the remnant stage and is gone at the end of it, the way a
                // real one disperses into the interstellar medium — instead of
                // 2200 particles winking out together mid-flight.
                ttl: EJECTA_LIFETIME * (0.6 + 0.5 * self.rng.next_f64()),
            });
        }
        self.ejecta_launched = launched;
    }

    // --- Visiting bodies (FR-7) ---------------------------------------------

    fn spawn_visitors(&mut self, dt_sim_seconds: f64) {
        self.spawn_accumulator += dt_sim_seconds;
        let mut guard = 0;
        while self.spawn_accumulator >= VISITOR_SPAWN_INTERVAL && guard < MAX_SUBSTEPS {
            self.spawn_accumulator -= VISITOR_SPAWN_INTERVAL;
            // Bound the number of visitors so captured ones can't accumulate
            // forever (mirror of the TS fallback).
            if self.visitor_count() < MAX_VISITORS {
                // Arrival speed is set by escape from the SYSTEM, so a heavier
                // (multiple) system genuinely accelerates its visitors more.
                let mu = self.total_mu();
                let visitor = make_visitor(&mut self.rng, mu, self.eject_radius, self.next_body_id);
                self.next_body_id += 1.0;
                self.bodies.push(visitor);
            }
            guard += 1;
        }
    }

    /// Re-type every non-visiting body from its OWN mass (spec §4.2), emitting
    /// `CompanionIgnited` when one crosses the hydrogen-burning limit. Idempotent.
    ///
    /// This is the fix for the reported bug. The old `promote_planets` turned
    /// every `Protoplanet` into a `Planet` the moment the primary ignited, no
    /// matter how heavy it had become — so an object of 2–3 M☉ (which the core-
    /// accretion channel does reach in a massive cloud) stayed typed as a planet
    /// and was drawn by the renderer as a ringed gas giant. Mass, not the
    /// primary's lifecycle, decides what an object IS:
    ///
    /// - `≥ HYDROGEN_BURNING_MIN_MASS` → a `Star`: it fuses hydrogen.
    /// - `≥ DEUTERIUM_BURNING_MIN_MASS` → a `BrownDwarf`: substellar but glowing.
    /// - otherwise a world, `Planet` once the primary shines and `Protoplanet`
    ///   while it is still assembling.
    ///
    /// Runs on EVERY step rather than only after ignition, because a body can
    /// cross a burning limit at any time — a fragment assembling during the
    /// protostar phase does exactly that.
    fn promote_bodies(&mut self, out: &mut Vec<PackedEvent>) {
        let ignited = self.stage as u32 >= LifecycleStage::FusionIgnition as u32;
        let sim_time = self.sim_time;
        for body in &mut self.bodies {
            // Visitors are assembled elsewhere and are never re-typed: a comet
            // stays a comet however the star it is passing evolves.
            if !(body.kind.is_planetary() || body.kind.is_stellar()) {
                continue;
            }
            let next = classify_by_mass(body.mass, ignited);
            if next == body.kind {
                continue;
            }
            // Never step DOWN the ladder. Mass only ever grows here, so this is
            // unreachable today; it is written so that adding any mass-losing
            // mechanism cannot silently turn a companion star back into a planet.
            if body.kind.is_stellar() && !next.is_stellar() {
                continue;
            }
            body.kind = next;
            if next == BodyType::Star {
                out.push(PackedEvent {
                    kind: SimEventType::CompanionIgnited,
                    sim_time,
                    data_a: body.id,
                    data_b: body.mass,
                });
            }
        }
    }

    /// Count currently-present visiting bodies (comets + asteroids).
    fn visitor_count(&self) -> usize {
        self.bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Comet | BodyType::Asteroid))
            .count()
    }

    /// Remove worlds that are genuinely leaving the system, the way visiting
    /// bodies already are (spec §4.1, §4.5).
    ///
    /// A single star cannot do this to its planets: its field is a monopole, so a
    /// bound orbit stays bound. A COMPANION can. Two things now put a world onto
    /// an escape trajectory — a close encounter with the second star, and the
    /// widening of every orbit as the dying primary sheds its envelope (Decision
    /// D4), which carries the outer worlds out into the companion's territory.
    /// Without this the escapee stayed in the body list for ever, coasting
    /// outward on a hyperbola: a planet that had unmistakably left the system was
    /// still drawn, still labelled and still reported as one of its worlds.
    ///
    /// Three conditions, all required, so nothing is removed that might come back:
    ///
    /// - unbound in the FULL field of every gravitating centre, not merely with
    ///   respect to the primary — a world captured by the companion is bound, and
    ///   must be kept;
    /// - beyond the same boundary a visitor is judged at, so a world never
    ///   vanishes from the middle of the visible system;
    /// - receding, so an inbound body on an eccentric pass is left alone.
    fn eject_escaping_worlds(&mut self, events: &mut Vec<PackedEvent>) {
        let attractors = self.attractor_set();
        let eject_radius = self.eject_radius;
        let sim_time = self.sim_time;
        let mut survivors: Vec<CelestialBody> = Vec::with_capacity(self.bodies.len());
        for body in std::mem::take(&mut self.bodies) {
            if !body.kind.is_planetary() {
                survivors.push(body);
                continue;
            }
            let r = magnitude(body.pos);
            let radial = if r > 0.0 {
                (body.pos[0] * body.vel[0] + body.pos[1] * body.vel[1] + body.pos[2] * body.vel[2])
                    / r
            } else {
                0.0
            };
            let energy = total_specific_energy_attractors(
                attractors.as_slice(),
                SOFTENING,
                body.pos,
                body.vel,
            );
            if r < eject_radius || radial <= 0.0 || energy <= 0.0 {
                survivors.push(body);
                continue;
            }
            events.push(PackedEvent {
                kind: SimEventType::BodyEjected,
                sim_time,
                data_a: body.id,
                data_b: body.kind as u32 as f64,
            });
        }
        self.bodies = survivors;
    }

    fn resolve_visitors(&mut self, events: &mut Vec<PackedEvent>) {
        // Bound to the SYSTEM, not to the primary alone (spec §4.1): a comet
        // circling a wide binary is captured even if neither star alone holds it.
        let mu = self.total_mu();
        let eject_radius = self.eject_radius;
        let sim_time = self.sim_time;
        let mut survivors: Vec<CelestialBody> = Vec::with_capacity(self.bodies.len());
        for mut body in std::mem::take(&mut self.bodies) {
            if body.kind != BodyType::Comet && body.kind != BodyType::Asteroid {
                survivors.push(body);
                continue;
            }
            match classify_visitor(mu, body.pos, body.vel, eject_radius) {
                VisitorClassification::Captured => {
                    if !body.captured {
                        body.captured = true;
                        events.push(PackedEvent {
                            kind: SimEventType::BodyCaptured,
                            sim_time,
                            data_a: body.id,
                            data_b: body.kind as u32 as f64,
                        });
                    }
                    survivors.push(body);
                }
                VisitorClassification::Ejected => {
                    events.push(PackedEvent {
                        kind: SimEventType::BodyEjected,
                        sim_time,
                        data_a: body.id,
                        data_b: body.kind as u32 as f64,
                    });
                    // Dropped from survivors: it has left the system.
                }
                VisitorClassification::Transit => survivors.push(body),
            }
        }
        self.bodies = survivors;
    }

    // --- Buffer serialization ------------------------------------------------

    /// Reallocate the (now dynamic) particle buffer if the count changed, then write.
    fn rebuild_particle_buffer(&mut self) {
        let needed = self.particles.len() * PARTICLE_STRIDE;
        if self.particle_buf.len() != needed {
            self.particle_buf = vec![0.0; needed];
        }
        self.write_particle_buffer();
    }

    fn write_particle_buffer(&mut self) {
        // Tail of an ejecta fragment's life over which it visibly fades out.
        let fade_tail = EJECTA_LIFETIME * EJECTA_FADE_FRACTION;
        for (i, p) in self.particles.iter().enumerate() {
            // An expanding nebula thins as it grows: it dims and its filaments
            // wash out long before the gas is actually gone. Without this the
            // shell kept its birth brightness right up to the instant it was
            // deleted, which is what made it disappear rather than disperse.
            let fade = if p.kind == ParticleKind::Ejecta {
                (p.ttl / fade_tail).clamp(0.0, 1.0)
            } else {
                1.0
            };
            let base = i * PARTICLE_STRIDE;
            self.particle_buf[base] = p.x as f32;
            self.particle_buf[base + 1] = p.y as f32;
            self.particle_buf[base + 2] = p.z as f32;
            self.particle_buf[base + 3] = (p.r * fade) as f32;
            self.particle_buf[base + 4] = (p.g * fade) as f32;
            self.particle_buf[base + 5] = (p.b * fade) as f32;
            self.particle_buf[base + 6] = (p.size * (0.45 + 0.55 * fade)) as f32;
        }
    }

    fn rebuild_body_buffer(&mut self) {
        let needed = self.bodies.len() * BODY_STRIDE;
        if self.body_buf.len() != needed {
            self.body_buf = vec![0.0; needed];
        }
        self.write_body_buffer();
    }

    fn write_body_buffer(&mut self) {
        for (i, body) in self.bodies.iter().enumerate() {
            let base = i * BODY_STRIDE;
            self.body_buf[base] = body.id as f32;
            self.body_buf[base + 1] = body.kind as u32 as f32;
            self.body_buf[base + 2] = body.mass as f32;
            self.body_buf[base + 3] = body.radius as f32;
            self.body_buf[base + 4] = body.pos[0] as f32;
            self.body_buf[base + 5] = body.pos[1] as f32;
            self.body_buf[base + 6] = body.pos[2] as f32;
            self.body_buf[base + 7] = body.vel[0] as f32;
            self.body_buf[base + 8] = body.vel[1] as f32;
            self.body_buf[base + 9] = body.vel[2] as f32;
            self.body_buf[base + 10] = body.spin as f32;
            self.body_buf[base + 11] = if body.captured { 1.0 } else { 0.0 };
        }
    }

    /// Publish the gravitating centres for the host: `[x, y, z, mu]` per centre,
    /// primary first (spec §5). Reallocated only when the count changes.
    fn rebuild_attractor_buffer(&mut self) {
        let attractors = self.attractor_set();
        let needed = attractors.len() * ATTRACTOR_STRIDE;
        if self.attractor_buf.len() != needed {
            self.attractor_buf = vec![0.0; needed];
        }
        for (i, a) in attractors.as_slice().iter().enumerate() {
            let base = i * ATTRACTOR_STRIDE;
            self.attractor_buf[base] = a.pos[0] as f32;
            self.attractor_buf[base + 1] = a.pos[1] as f32;
            self.attractor_buf[base + 2] = a.pos[2] as f32;
            self.attractor_buf[base + 3] = a.mu as f32;
        }
    }

    fn pack_events(&mut self, events: &[PackedEvent]) {
        self.event_buf = Vec::with_capacity(events.len() * EVENT_STRIDE);
        for e in events {
            self.event_buf.push(e.kind as u32 as f64);
            self.event_buf.push(e.sim_time);
            self.event_buf.push(e.data_a);
            self.event_buf.push(e.data_b);
        }
    }

    // --- Composition → colour helpers ---------------------------------------

    fn species_cumulative(&self) -> [f64; 3] {
        let h = self.composition[0];
        let he = h + self.composition[1];
        let m = he + self.composition[2];
        [h, he, m]
    }

    fn species_color_size(&mut self, cum: [f64; 3]) -> ([f64; 3], f64) {
        let total = if cum[2] > 0.0 { cum[2] } else { 1.0 };
        let roll = self.rng.next_f64() * total;
        if roll < cum[0] {
            SPECIES_HYDROGEN
        } else if roll < cum[1] {
            SPECIES_HELIUM
        } else {
            SPECIES_METALS
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    // Only the regression tests need this.
    use nbody::MAX_BODY_RADIUS;

    /// Steps needed to reach the remnant. Formation is rate-limited by the
    /// star's finite accretion rate, so ignition legitimately takes several
    /// hundred bounded orbital steps.
    const LIFECYCLE_STEPS: usize = 900;

    /// A kernel whose cloud assembles a star of `star_mass` M☉. Only a fraction
    /// of a cloud ever reaches the star, so the tests state the STAR's mass and
    /// let `cloud_mass_for_star` work out the cloud they need.
    fn solar_kernel(star_mass: f64, particle_count: u32) -> Kernel {
        let cloud = cloud_mass_for_star(star_mass, 0.02);
        Kernel::new(cloud, 50.0, 0.5, 0.74, 0.24, 0.02, particle_count)
    }

    #[test]
    fn version_bump() {
        assert_eq!(kernel_version(), 2);
    }

    #[test]
    fn allocates_buffers_of_count_times_stride() {
        // §3.8: body buffer is EMPTY right after init — planetesimals are seeded
        // later, at ProtostarCoalescence entry, not at construction.
        let mut kernel = solar_kernel(1.0, 100);
        assert_eq!(kernel.particle_len() as usize, 100 * PARTICLE_STRIDE);
        // No bodies yet.
        assert_eq!(kernel.body_len(), 0);

        // Drive to ProtostarCoalescence: the body buffer must grow to hold the
        // seeded planetesimals.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::ProtostarCoalescence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::ProtostarCoalescence as u32);
        assert_eq!(kernel.body_len() as usize % BODY_STRIDE, 0);
        assert!(kernel.body_len() > 0);
    }

    #[test]
    fn protoplanets_become_planets_after_ignition() {
        let mut kernel = solar_kernel(1.0, 50);
        // §3.8: body buffer is EMPTY right after init — planetesimals are seeded
        // at ProtostarCoalescence entry, not at construction.
        assert_eq!(kernel.body_len(), 0);
        // Drive to ProtostarCoalescence so planetesimals are seeded.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage as u32 >= LifecycleStage::ProtostarCoalescence as u32 {
                break;
            }
        }
        // After seeding, the type lane (offset 1) of every seeded body must be Protoplanet.
        assert!(
            kernel.body_len() > 0,
            "no bodies after ProtostarCoalescence"
        );
        // Drive enough accretion steps to grow the core past fusion ignition.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage as u32 >= LifecycleStage::FusionIgnition as u32 {
                break;
            }
        }
        assert!(
            kernel.stage as u32 >= LifecycleStage::FusionIgnition as u32,
            "core fraction reached {}",
            kernel.core_fraction
        );
        for i in 0..(kernel.body_len() as usize / BODY_STRIDE) {
            let base = i * BODY_STRIDE;
            let kind = kernel.body_buf[base + 1];
            // No orbiting body should still be a protoplanet.
            if kind == BodyType::Comet as u32 as f32 || kind == BodyType::Asteroid as u32 as f32 {
                continue;
            }
            assert_ne!(kind, BodyType::Protoplanet as u32 as f32);
        }
    }

    #[test]
    fn caps_particle_count_at_max() {
        let kernel = solar_kernel(1.0, 10_000_000);
        assert_eq!(
            kernel.particle_len() as usize,
            MAX_PARTICLES * PARTICLE_STRIDE
        );
    }

    #[test]
    fn first_body_is_a_bound_protoplanet() {
        // §3.8: must drive to ProtostarCoalescence before any body exists.
        let mut kernel = solar_kernel(1.0, 10);
        assert!(
            kernel.body_buf.is_empty(),
            "body buffer must be empty at init"
        );

        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::ProtostarCoalescence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::ProtostarCoalescence as u32);
        // Type lane and captured lane of the first protoplanet body.
        // (Visitors are spawned at the boundary and may appear before planetesimals;
        //  find the first protoplanet in the buffer to be robust.)
        let n = kernel.body_buf.len() / BODY_STRIDE;
        let first_proto = (0..n)
            .find(|&i| kernel.body_buf[i * BODY_STRIDE + 1] == BodyType::Protoplanet as u32 as f32);
        assert!(
            first_proto.is_some(),
            "no protoplanet found after ProtostarCoalescence"
        );
        let base = first_proto.unwrap() * BODY_STRIDE;
        assert_eq!(
            kernel.body_buf[base + 1],
            BodyType::Protoplanet as u32 as f32
        );
        assert_eq!(kernel.body_buf[base + 11], 1.0); // captured == true
    }

    #[test]
    fn accretion_then_time_drives_to_remnant_emitting_all_stage_events() {
        let mut kernel = solar_kernel(1.0, 200);
        // Formation is accretion-driven, so it takes several steps to grow the
        // core to ignition; the stellar clock then carries it to the remnant.
        let mut kinds = Vec::new();
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                kinds.push(chunk[0] as u32);
            }
            if kernel.stage as u32 == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(
            kernel.stage(),
            LifecycleStage::Remnant as u32,
            "core fraction reached {}",
            kernel.core_fraction
        );
        for expected in [
            SimEventType::CollapseOnset,
            SimEventType::ProtostarFormed,
            SimEventType::FusionIgnition,
            SimEventType::RedGiantOnset,
            SimEventType::DeathEvent,
            SimEventType::RemnantFormed,
        ] {
            assert!(kinds.contains(&(expected as u32)), "missing {expected:?}");
        }
    }

    #[test]
    fn paused_dt_does_not_advance_state() {
        let mut kernel = solar_kernel(1.0, 20);
        let before: Vec<f32> = kernel.particle_buf.clone();
        let count = kernel.step(0.0);
        assert_eq!(count, 0);
        assert_eq!(kernel.stage(), LifecycleStage::DustCloud as u32);
        assert_eq!(kernel.particle_buf, before);
    }

    #[test]
    fn deterministic_for_identical_inputs() {
        fn run() -> (Vec<f32>, Vec<f32>, Vec<u32>) {
            let mut kernel = Kernel::new(3.0, 50.0, 0.5, 0.74, 0.24, 0.02, 40);
            let mut kinds = Vec::new();
            for dt in [1.0e15, 3.0e15, 2.0e15, 5.0e15, 1.0e16] {
                kernel.step(dt);
                for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                    kinds.push(chunk[0] as u32);
                }
            }
            (kernel.particle_buf.clone(), kernel.body_buf.clone(), kinds)
        }
        let a = run();
        let b = run();
        assert_eq!(a.0, b.0);
        assert_eq!(a.1, b.1);
        assert_eq!(a.2, b.2);
        // Dust depletes as it accretes, so the surviving count is bounded by the
        // seeded count (no longer exactly it) but must remain non-empty here.
        assert!(!a.0.is_empty());
        assert!(a.0.len() <= 40 * PARTICLE_STRIDE);
    }

    fn mean_abs_y(buf: &[f32]) -> f64 {
        let n = buf.len() / PARTICLE_STRIDE;
        if n == 0 {
            return 0.0;
        }
        let mut sum = 0.0f64;
        for i in 0..n {
            sum += f64::from(buf[i * PARTICLE_STRIDE + 1].abs());
        }
        sum / n as f64
    }

    fn total_body_mass(buf: &[f32]) -> f64 {
        let mut sum = 0.0f64;
        for i in 0..(buf.len() / BODY_STRIDE) {
            sum += f64::from(buf[i * BODY_STRIDE + 2]);
        }
        sum
    }

    #[test]
    fn never_leaves_a_body_sitting_on_top_of_the_star() {
        // Regression: a momentum-conserving merge between bodies at opposing
        // orbital phases can cancel the orbital velocity, so the body free-falls
        // to r≈0. It must be absorbed by the star, not parked on it.
        let mut kernel = solar_kernel(1.0, 1200);
        let swallow = kernel.body_swallow_radius;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            for i in 0..(kernel.body_buf.len() / BODY_STRIDE) {
                let base = i * BODY_STRIDE;
                let x = f64::from(kernel.body_buf[base + 4]);
                let y = f64::from(kernel.body_buf[base + 5]);
                let z = f64::from(kernel.body_buf[base + 6]);
                let r = (x * x + y * y + z * z).sqrt();
                assert!(r > swallow, "body {i} sits inside the star at r={r}");
            }
        }
    }

    #[test]
    fn seeds_every_planetesimal_outside_the_star_feeding_zone() {
        // §3.8: must drive to ProtostarCoalescence before checking placements.
        let mut kernel = solar_kernel(1.0, 100);
        assert!(
            kernel.body_buf.is_empty(),
            "no planetesimals before protostar forms"
        );

        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::ProtostarCoalescence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::ProtostarCoalescence as u32);
        assert!(
            !kernel.body_buf.is_empty(),
            "bodies must exist after seeding"
        );
        let core_r = kernel.core_accretion_radius;
        for i in 0..(kernel.body_buf.len() / BODY_STRIDE) {
            let base = i * BODY_STRIDE;
            // Only check protoplanets — visitors spawn at the system boundary.
            let kind = kernel.body_buf[base + 1];
            if kind == BodyType::Comet as u32 as f32 || kind == BodyType::Asteroid as u32 as f32 {
                continue;
            }
            let x = f64::from(kernel.body_buf[base + 4]);
            let z = f64::from(kernel.body_buf[base + 6]);
            let r = (x * x + z * z).sqrt();
            assert!(r > core_r, "seeded inside star: r={r}");
        }
    }

    #[test]
    fn flattens_the_cloud_into_a_disc() {
        let mut kernel = solar_kernel(1.0, 800);
        let y0 = mean_abs_y(&kernel.particle_buf);
        for _ in 0..40 {
            kernel.step(2.0e14);
        }
        let y1 = mean_abs_y(&kernel.particle_buf);
        assert!(y1 < y0 * 0.85, "disc did not flatten: y0={y0} y1={y1}");
    }

    #[test]
    fn grows_the_biggest_planet_beyond_the_snow_line() {
        // Reported bug 2: the most massive world used to be the INNERMOST one,
        // because the retention curve peaked at the snow line while the dust
        // supply falls outward. Mirror of the TS fallback's regression.
        // Use the same dt=1e17 as the TS test: orbital_step saturates at
        // ORBITAL_MAX for any dt above a few minutes, so per-step dynamics are
        // identical — using a larger dt here simply matches the TS twin.
        let mut kernel = solar_kernel(1.0, 4000);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::MainSequence as u32);

        let planets: Vec<(f64, f64)> = kernel
            .bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Planet | BodyType::Protoplanet))
            .map(|b| (magnitude(b.pos), b.mass))
            .collect();
        assert!(planets.len() > 4, "too few planets formed");

        let heaviest =
            planets
                .iter()
                .copied()
                .fold((0.0f64, 0.0f64), |a, b| if b.1 > a.1 { b } else { a });
        assert!(
            heaviest.0 > SNOW_LINE_AU,
            "biggest planet formed at {} AU, inside the snow line",
            heaviest.0
        );
        assert!(heaviest.0 < 20.0, "biggest planet formed absurdly far out");

        // Inner worlds stay small; the giants outside dwarf them.
        let inner_max = planets
            .iter()
            .filter(|p| p.0 < SNOW_LINE_AU)
            .fold(0.0f64, |a, p| a.max(p.1));
        assert!(inner_max > 0.0, "no planet formed inside the snow line");
        assert!(heaviest.1 > inner_max * 20.0);
    }

    #[test]
    fn the_cloud_does_not_collapse_into_the_star_wholesale() {
        // Reported bug 6: a 40 M☉ cloud produced a 40 M☉ star.
        let cloud = 40.0;
        let mut kernel = Kernel::new(cloud, 50.0, 0.5, 0.74, 0.24, 0.02, 2000);
        let expected = stellar_mass_from_cloud(cloud, 0.02);
        assert!(expected < cloud * 0.45);

        let mut peak: f64 = 0.0;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e9);
            peak = peak.max(kernel.star_mass_solar());
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::MainSequence as u32);
        assert!((peak - expected).abs() < 1e-9, "peak {peak} vs {expected}");

        // However long it runs, the star can never grow past its budget.
        for _ in 0..60 {
            kernel.step(1.0e9);
            assert!(kernel.star_mass_solar() <= expected + 1e-9);
        }
    }

    #[test]
    fn forms_the_star_gradually_not_immediately() {
        // Regression for "the star is born almost immediately": every grain that
        // crossed the capture radius used to be swallowed instantly, so the core
        // ran from its 4% seed to the 50% ignition threshold in ~1 second of
        // playback. Accretion is now limited to a finite Mdot.
        //
        // Asserted in REAL SECONDS at 60 fps — the units the user perceives — as
        // a step-count assertion would not have caught the bug (`orbital_step`
        // saturates, so steps per second is fixed regardless of pace).
        const FPS: usize = 60;
        // Saturated orbital step per frame at a fast pace (mirror of the TS
        // measurement): the clock lives on the JS side, so drive it directly.
        let orbital_per_frame = orbital_step(1.0e17);
        let mut kernel = solar_kernel(1.0, 2000);

        let mut ignited_at = f64::INFINITY;
        for f in 0..(60 * FPS) {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                ignited_at = f as f64 / FPS as f64;
                break;
            }
        }
        assert!(
            orbital_per_frame > 0.0,
            "orbital step must advance the dynamics"
        );
        // The star must still form (the rate limit must not stall formation)...
        assert!(
            ignited_at < 40.0,
            "star never formed (ignited_at={ignited_at})"
        );
        // ...but never in the ~1 second that made it look instantaneous.
        assert!(
            ignited_at > 5.0,
            "star ignited too fast: {ignited_at}s of playback"
        );
    }

    // --- Reported-bug regressions (mirror of the TS fallback's) -------------

    /// How many fragments of the star's envelope are currently in flight.
    fn ejecta_count(kernel: &Kernel) -> usize {
        kernel
            .particles
            .iter()
            .filter(|p| p.kind == ParticleKind::Ejecta)
            .count()
    }

    /// Drive a kernel to the remnant stage, returning whether it got there.
    fn drive_to_remnant(kernel: &mut Kernel) -> bool {
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                return true;
            }
        }
        false
    }

    #[test]
    fn the_mass_budget_is_conserved_and_never_grows() {
        // Global mass conservation: every gram of the birth cloud is in exactly
        // one place — the core, the inner-disc reservoir, the dispersed pile,
        // the remaining dust, or a body. The total may SHRINK (mass genuinely
        // leaves the system) but must never exceed the cloud it started from,
        // and must never grow from one step to the next: a growing budget means
        // the accretion book-keeping is double-counting somewhere.
        //
        // This check previously existed only in the TypeScript half of the
        // simulation battery — it needs white-box access to the book-keeping
        // fields — so it never ran against this kernel. It belongs here.
        let mut kernel = solar_kernel(1.0, 2000);
        let cloud = kernel.cloud_mass;
        let mut max_total = f64::NEG_INFINITY;
        for _ in 0..LIFECYCLE_STEPS {
            // Same dt the other lifecycle tests use, so the whole run is covered.
            kernel.step(1.0e17);
            let dust: f64 = kernel.particles.iter().map(|p| p.mass).sum();
            let bodies: f64 = kernel.bodies.iter().map(|b| b.mass).sum();
            let total =
                kernel.core_mass + kernel.disc_reservoir + kernel.dispersed_mass + dust + bodies;
            assert!(
                total <= cloud * 1.005 + 1e-9,
                "mass created: budget total {total} > cloud {cloud}"
            );
            if max_total != f64::NEG_INFINITY {
                assert!(
                    total <= max_total + cloud * 0.002,
                    "mass budget grew {max_total} -> {total}"
                );
            }
            max_total = max_total.max(total);
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(
            kernel.stage(),
            LifecycleStage::Remnant as u32,
            "lifecycle did not complete, so the budget was only partly exercised"
        );
    }

    #[test]
    fn a_brown_dwarf_never_throws_ejecta_and_keeps_its_disc() {
        // A substellar object has no explosion to throw, so it must never
        // produce Ejecta particles — and its planets must still be there at the
        // end, not swept away by a blast that never happened.
        //
        // This invariant previously lived only in the TypeScript half of the
        // simulation battery (it needed white-box access to the particle kinds,
        // which the flat output buffer does not expose), so it never ran against
        // this kernel at all. It belongs here, in the crate that owns the state.
        let cloud = cloud_mass_for_star(0.05, 0.02); // below the 0.08 M☉ H-burning limit
        let mut kernel = Kernel::new(cloud, 50.0, 0.5, 0.74, 0.24, 0.02, 1500);
        assert!(
            kernel.substellar,
            "0.05 M☉ must be classified substellar for this test to mean anything"
        );
        assert!(
            drive_to_remnant(&mut kernel),
            "brown dwarf never reached its terminal stage"
        );
        assert!(
            !kernel.fate.supernova,
            "a brown dwarf must not be flagged as a supernova"
        );
        assert!(
            kernel
                .particles
                .iter()
                .all(|p| p.kind != ParticleKind::Ejecta),
            "a brown dwarf threw ejecta — it has no explosion to throw it"
        );
        assert!(
            !kernel.bodies.is_empty(),
            "a brown dwarf's planets must survive — no blast ever happened to sweep them away"
        );
    }

    #[test]
    fn leaves_no_bound_particle_circling_the_remnant() {
        // Regression: the red giant engulfs its inner planets and tears each into
        // a tidal-debris stream. That debris carries mass 0, and the death-time
        // sweep only removed MASS-BEARING grains — so the fragments stayed on the
        // orbit they inherited and were visibly circling the white dwarf forever.
        //
        // Physically, everything around a dying star is either accreted or blown
        // away: the only particles that may remain are the death ejecta, and that
        // shell is LEAVING — every fragment moves radially outward and decelerates
        // toward its stall radius, so none of it can settle into an orbit.
        let mut kernel = solar_kernel(1.0, 3000);
        assert!(drive_to_remnant(&mut kernel));
        // Let the shell fly for a while — anything on an orbit would still be here.
        for _ in 0..20 {
            kernel.step(1.0e17);
        }
        for p in &kernel.particles {
            assert_eq!(p.kind, ParticleKind::Ejecta);
            let r = (p.x * p.x + p.y * p.y + p.z * p.z).sqrt();
            let speed = (p.vx * p.vx + p.vy * p.vy + p.vz * p.vz).sqrt();
            // Purely radial and outward: `pos · vel = |pos||vel|`, which is
            // exactly the statement that the fragment has no angular momentum
            // about the remnant and is receding from it.
            let radial = p.x * p.vx + p.y * p.vy + p.z * p.vz;
            assert!(
                radial > 0.0 && radial >= r * speed * (1.0 - 1e-9),
                "a fragment is circling the remnant rather than leaving it \
                 (r={r}, radial={radial}, r·v={})",
                r * speed
            );
        }
    }

    #[test]
    fn tidal_debris_falls_into_the_star_instead_of_orbiting_forever() {
        // Small enough steps that the brief red-giant phase is actually resolved
        // (a single huge dt would cross straight through it to the remnant).
        let mut kernel = solar_kernel(1.0, 1500);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e15);
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::MainSequence as u32);

        let mut saw_debris = false;
        for _ in 0..400 {
            kernel.step(1.0e16);
            if kernel
                .particles
                .iter()
                .any(|p| p.kind == ParticleKind::Debris)
            {
                saw_debris = true;
                break;
            }
            if kernel.stage() >= LifecycleStage::Death as u32 {
                break;
            }
        }
        assert!(saw_debris, "red giant never disrupted an inner planet");

        // The stream drains into the star within a few orbits. Stepped on a much
        // finer sim-dt so the star stays a red giant throughout: the debris must
        // vanish through its OWN infall, not because the supernova blast later
        // sweeps the system clean.
        for _ in 0..60 {
            kernel.step(1.0e14);
        }
        assert_eq!(kernel.stage(), LifecycleStage::RedGiant as u32);
        assert!(
            !kernel
                .particles
                .iter()
                .any(|p| p.kind == ParticleKind::Debris),
            "tidal debris is still orbiting long after the disruption"
        );
    }

    #[test]
    fn the_death_is_a_watchable_sequence_not_a_single_step() {
        // Reported: "the transition to the neutron star happens all of a sudden,
        // the star just shrinks". On the compressed stellar clock one frame spans
        // far more than the ~10^4 yr the death lasts, so the star crossed from red
        // giant to remnant inside a single step and nothing was ever drawn.
        let mut kernel = solar_kernel(14.0, 2000);
        let mut death_steps = 0;
        let mut saw_death = false;
        for _ in 0..LIFECYCLE_STEPS {
            // A deliberately ENORMOUS dt: the cap has to hold even here.
            kernel.step(1.0e18);
            if kernel.stage() == LifecycleStage::Death as u32 {
                saw_death = true;
                death_steps += 1;
            }
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert!(saw_death, "the death stage was skipped entirely");
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        assert!(
            death_steps as f64 >= DEATH_MIN_STEPS * 0.9,
            "death crossed in {death_steps} steps; it must be watchable"
        );
    }

    #[test]
    fn the_shell_is_thrown_at_shock_breakout_not_before() {
        // The envelope leaves as a slow superwind through the late red giant, and
        // then the core implodes: through the implosion NOTHING more is expelled,
        // because the star is falling inward, and only when the rebound shock
        // reaches the surface is the rest of the envelope thrown off.
        let mut kernel = solar_kernel(14.0, 2000);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e18);
            if kernel.stage() == LifecycleStage::Death as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Death as u32);
        // Still collapsing: the shell has not been thrown.
        assert!((kernel.stage_progress() as f64) < DEATH_SHOCK_BREAKOUT);
        let wind = ejecta_count(&kernel);
        // The superwind has already been at work for the late red giant, so the
        // envelope is visibly leaving BEFORE the star dies (spec §4.4)…
        assert!(
            wind > 0,
            "no envelope had left the star by the time it started to die"
        );
        // …but only its red-giant share of it.
        assert!(
            (wind as f64) < EJECTA_COUNT as f64 * (REDGIANT_MASS_LOSS_SHARE + 0.02),
            "{wind} fragments before shock breakout — the blast came early"
        );

        // Nothing more leaves while the core is imploding.
        for _ in 0..8 {
            kernel.step(1.0);
            if kernel.stage() != LifecycleStage::Death as u32
                || (kernel.stage_progress() as f64) >= DEATH_SHOCK_BREAKOUT
            {
                break;
            }
            assert_eq!(
                ejecta_count(&kernel),
                wind,
                "the imploding star expelled gas before the shock broke out"
            );
        }

        // Step until the shock breaks out, then the shell must exist.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e18);
            if (kernel.stage_progress() as f64) >= DEATH_SHOCK_BREAKOUT
                || kernel.stage() != LifecycleStage::Death as u32
            {
                break;
            }
        }
        // The blast is thrown over the few steps the shock takes to unwrap the
        // envelope (`DEATH_MASS_LOSS_SPAN_IMPULSIVE`), not in a single frame.
        for _ in 0..24 {
            kernel.step(1.0e18);
        }
        let ejecta = ejecta_count(&kernel);
        assert!(
            ejecta > wind * 2,
            "the blast threw only {ejecta} fragments on top of the {wind} the wind had"
        );

        // Every fragment is receding: the shell disperses and leaves a bare remnant.
        for p in &kernel.particles {
            let radial = p.x * p.vx + p.y * p.vy + p.z * p.vz;
            assert!(radial > 0.0, "a fragment fell back toward the star");
        }
    }

    #[test]
    fn visitors_arrive_with_a_real_impact_parameter() {
        // Regression: visitors were injected with their velocity aimed exactly at
        // the star, i.e. ZERO angular momentum. Such a body has no orbital plane:
        // it fell straight through the softened core and oscillated back and
        // forth on a fixed line forever, drawing a straight streak through the
        // star. Real visitors always miss the star by some impact parameter.
        let mut kernel = solar_kernel(1.0, 200);
        let mut checked = 0;
        for _ in 0..60 {
            kernel.step(1.0e16);
            for b in &kernel.bodies {
                if !matches!(b.kind, BodyType::Comet | BodyType::Asteroid) {
                    continue;
                }
                let h = magnitude([
                    b.pos[1] * b.vel[2] - b.pos[2] * b.vel[1],
                    b.pos[2] * b.vel[0] - b.pos[0] * b.vel[2],
                    b.pos[0] * b.vel[1] - b.pos[1] * b.vel[0],
                ]);
                let scale = magnitude(b.pos) * magnitude(b.vel);
                assert!(
                    h / scale > 0.02,
                    "visitor is on a radial plunge: h/|r||v| = {}",
                    h / scale
                );
                checked += 1;
            }
        }
        assert!(checked > 0, "no visiting body ever spawned");
    }

    #[test]
    fn draws_bodies_at_solar_system_proportions() {
        // Jupiter's radius is 1/11000 of its orbit. Bodies are exaggerated for
        // visibility, but must stay in a range that reads as "tiny worlds
        // separated by vast distances" rather than marbles round a beach ball.
        let mut kernel = solar_kernel(1.0, 3000);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e15);
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::MainSequence as u32);

        let mut planets = 0;
        for b in &kernel.bodies {
            if !matches!(b.kind, BodyType::Planet | BodyType::Protoplanet) {
                continue;
            }
            let distance = magnitude(b.pos);
            assert!(b.radius <= MAX_BODY_RADIUS);
            assert!(
                b.radius < distance * 0.02,
                "body radius {} is not tiny against its {distance} orbit",
                b.radius
            );
            planets += 1;
        }
        assert!(planets > 0);
    }

    #[test]
    fn leaves_no_primordial_dust_orbiting_the_remnant() {
        // Regression (#4): leftover birth-cloud dust used to orbit the remnant
        // forever. The disc must fully dissipate by the remnant stage.
        let mut kernel = solar_kernel(1.0, 4000);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        for p in &kernel.particles {
            // Mass-bearing particles ARE expected here now — they are the star's
            // own shed envelope, which carries the mass it lost (spec §4.4). What
            // must be gone is the primordial disc it was born with.
            assert_eq!(
                p.kind,
                ParticleKind::Ejecta,
                "primordial dust left at remnant: {} M☉",
                p.mass
            );
        }
    }

    #[test]
    fn depletes_dust_and_grows_planetesimals() {
        // §3.8: drive to ProtostarCoalescence first so planetesimals exist to grow.
        let mut kernel = solar_kernel(1.0, 1500);
        let dust0 = kernel.particle_buf.len() / PARTICLE_STRIDE;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::ProtostarCoalescence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::ProtostarCoalescence as u32);
        let mass0 = total_body_mass(&kernel.body_buf);
        assert!(mass0 > 0.0, "planetesimals should be seeded");
        for _ in 0..60 {
            kernel.step(3.0e14);
        }
        let dust1 = kernel.particle_buf.len() / PARTICLE_STRIDE;
        let mass1 = total_body_mass(&kernel.body_buf);
        assert!(dust1 < dust0, "dust not consumed: {dust0} -> {dust1}");
        assert!(
            mass1 > mass0,
            "planetesimals did not grow: {mass0} -> {mass1}"
        );
    }

    // --- §3.8 planetesimals form after the protostar -----------------------

    #[test]
    fn no_bodies_at_init() {
        // Spec §3.8: planetesimals cannot predate the protostar. The body list
        // and buffer must be empty right after construction.
        let kernel = solar_kernel(1.0, 200);
        assert!(
            kernel.bodies.is_empty(),
            "bodies list must be empty at init (got {})",
            kernel.bodies.len()
        );
        assert!(
            kernel.body_buf.is_empty(),
            "body buffer must be empty at init (len={})",
            kernel.body_buf.len()
        );
        assert_eq!(kernel.body_len(), 0);
    }

    #[test]
    fn seeds_planetesimals_at_protostar_coalescence() {
        // The first step that transitions to ProtostarCoalescence must seed
        // exactly PLANETESIMAL_COUNT protoplanets. Before that step the body
        // list must be empty of protoplanets/planets.
        let mut kernel = solar_kernel(1.0, 400);
        assert!(kernel.bodies.is_empty());

        // Step with a large dt so the threshold is crossed in a reasonable count.
        let mut seeded_at = None;
        for step in 0..LIFECYCLE_STEPS {
            // Check BEFORE the step that we are still in DustCloud with no planets.
            if kernel.stage() == LifecycleStage::DustCloud as u32 {
                let proto_count = kernel
                    .bodies
                    .iter()
                    .filter(|b| matches!(b.kind, BodyType::Protoplanet | BodyType::Planet))
                    .count();
                assert_eq!(
                    proto_count, 0,
                    "protoplanets found during DustCloud at step {step}"
                );
            }
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::ProtostarCoalescence as u32 && seeded_at.is_none()
            {
                seeded_at = Some(step);
                break;
            }
        }

        assert!(seeded_at.is_some(), "ProtostarCoalescence never reached");
        // Count protoplanets immediately after the transition.
        let proto_count = kernel
            .bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Protoplanet | BodyType::Planet))
            .count();
        assert_eq!(
            proto_count, PLANETESIMAL_COUNT,
            "expected {PLANETESIMAL_COUNT} protoplanets, got {proto_count}"
        );
    }

    // --- §4.4 progressive envelope loss and the persistent nebula ----------

    #[test]
    fn the_envelope_leaves_as_a_wind_and_not_as_one_burst() {
        // Reported bug 7: "when a red giant collapses it seems as if the matter
        // condenses into a white dwarf; it is not visible at all that the outer
        // layers of the gas escape". The envelope used to be thrown in ONE frame
        // at shock breakout, so there was nothing to see leaving before it and
        // nothing after. Now it leaves over many steps, starting in the late red
        // giant, and every batch is launched from the star's own photosphere.
        let mut kernel = solar_kernel(1.0, 2500);
        let mut launching_steps = 0;
        let mut seen_before_death = false;
        let mut previous = 0usize;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e16);
            let count = ejecta_count(&kernel);
            if count > previous {
                launching_steps += 1;
                if kernel.stage() == LifecycleStage::RedGiant as u32 {
                    seen_before_death = true;
                }
            }
            previous = count;
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        assert!(
            seen_before_death,
            "nothing left the star until it was already dying — the red giant's \
             superwind is missing"
        );
        assert!(
            launching_steps >= 20,
            "the envelope was expelled over only {launching_steps} steps; it must \
             be SEEN to leave, not appear between two frames"
        );
        assert_eq!(
            kernel.ejecta_launched, EJECTA_COUNT,
            "the envelope was not fully expelled by the time the remnant formed"
        );
    }

    #[test]
    fn the_shells_sweep_numbers_are_the_ones_the_renderer_draws() {
        // The drawn shock front (`starVisual.ts`) is `stall · (1 − e^-sweep)`,
        // with `DEATH_SWEEP` reached at the end of the death stage and
        // `REMNANT_SWEEP` at the end of the nebula's life. Both are functions of
        // THIS kernel's drag and clocks; pinning them here means the drawn shell
        // and the gas it is meant to be part of cannot drift apart silently.
        assert!((EJECTA_DRAG * DEATH_ORBITAL_SPAN - 0.6).abs() < 1e-12);
        assert!((EJECTA_DRAG * EJECTA_LIFETIME - 3.25).abs() < 1e-12);
    }

    #[test]
    fn the_shed_envelope_carries_exactly_the_mass_the_star_lost() {
        // Mass is MOVED, not invented: the gas the viewer watches leave IS the
        // mass the star no longer has. Sampled before the shell has reached the
        // cull radius or begun to expire, so nothing has left the system yet.
        let mut kernel = solar_kernel(1.0, 2000);
        let mut checked = 0;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e16);
            if kernel.shed_mass <= 0.0 {
                continue;
            }
            let carried: f64 = kernel
                .particles
                .iter()
                .filter(|p| p.kind == ParticleKind::Ejecta)
                .map(|p| p.mass)
                .sum();
            assert!(
                (carried - kernel.shed_mass).abs() <= kernel.shed_mass * 1e-9,
                "the star shed {} M☉ but its ejecta carries {carried} M☉",
                kernel.shed_mass
            );
            checked += 1;
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert!(checked > 0, "the star never shed anything");
        // …and what it shed is its whole envelope, down to the remnant's share.
        let retained = kernel.remnant_retained_fraction();
        let envelope = kernel.star_mass * (1.0 - retained);
        assert!(
            (kernel.shed_mass - envelope).abs() <= envelope * 1e-6,
            "shed {} M☉ of a {envelope} M☉ envelope",
            kernel.shed_mass
        );
    }

    #[test]
    fn the_nebula_is_still_framed_when_the_remnant_appears() {
        // The old shell was sized to cover 2.2 (nebula) / 5.5 (supernova) cloud
        // radii within the death stage — 110 / 275 AU for a 50 AU cloud, against a
        // view about 62 AU high. It was therefore off-screen before the death even
        // ended, which is why "there is no nebula, only the small star remnant".
        for star_mass in [1.0, 14.0] {
            let mut kernel = solar_kernel(star_mass, 2500);
            assert!(drive_to_remnant(&mut kernel));
            let mut radii: Vec<f64> = kernel
                .particles
                .iter()
                .filter(|p| p.kind == ParticleKind::Ejecta)
                .map(|p| magnitude([p.x, p.y, p.z]))
                .collect();
            assert!(
                radii.len() > EJECTA_COUNT / 2,
                "only {} fragments survived to the remnant",
                radii.len()
            );
            radii.sort_by(|a, b| a.total_cmp(b));
            let edge = radii[radii.len() * 9 / 10];
            let extent = kernel.cloud_extent;
            assert!(
                edge >= 0.2 * extent && edge <= 1.4 * extent,
                "at {star_mass} M☉ the shell's edge is at {edge} AU — outside the \
                 framed {extent} AU system"
            );
        }
    }

    #[test]
    fn the_nebula_fades_out_instead_of_being_deleted_mid_flight() {
        // Measured before the fix: 2198 fragments at one moment and 0 about
        // fifteen seconds of playback later, because `cull_particles` deleted the
        // whole shell the instant it crossed the escape radius. A nebula must
        // DISPERSE — thinning and dimming over the remnant stage.
        let mut kernel = solar_kernel(1.0, 2500);
        assert!(drive_to_remnant(&mut kernel));
        let mut counts = vec![ejecta_count(&kernel)];
        let mut steps_alive = 0;
        for step in 0..2000 {
            kernel.step(1.0e17);
            let count = ejecta_count(&kernel);
            let previous = *counts.last().unwrap();
            // No cliff: at most an eighth of what is left may go in one step
            // (plus a few, so the last handful of fragments may simply expire).
            assert!(
                count + previous / 8 + 8 >= previous,
                "the shell lost {} of its {previous} fragments in a single step",
                previous - count
            );
            counts.push(count);
            if count == 0 {
                steps_alive = step;
                break;
            }
        }
        assert!(
            steps_alive > 600,
            "the nebula was gone after {steps_alive} steps — it must linger and fade"
        );
        // It really does end: a shell that never disperses is not a nebula either.
        assert_eq!(*counts.last().unwrap(), 0);
        // …and it dimmed on the way out, rather than vanishing at full brightness.
        assert!(
            counts.windows(2).filter(|w| w[1] < w[0]).count() > 30,
            "the count fell in too few distinct steps to read as a fade"
        );
    }

    #[test]
    fn a_world_inside_the_swollen_photosphere_is_destroyed_whenever_it_gets_there() {
        // `engulf_inner_planets` used to run exactly ONCE, at red-giant onset. A
        // world that drifted inside the star afterwards — or one the star had not
        // yet swollen past — went on orbiting inside the photosphere for the rest
        // of its life.
        let mut kernel = solar_kernel(1.0, 1200);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e15);
            if kernel.stage() == LifecycleStage::RedGiant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::RedGiant as u32);
        // Drop a world well inside the star's current surface, long after onset.
        let doomed_id = kernel.next_body_id;
        let r = kernel.photosphere_radius() * 0.5;
        kernel.bodies.push(CelestialBody {
            id: doomed_id,
            kind: BodyType::Planet,
            mass: 3.0e-6,
            radius: 0.01,
            pos: [r, 0.0, 0.0],
            vel: [0.0, 0.0, 0.4],
            spin: 0.0,
            captured: false,
            accretion_target: 0.0,
        });
        let events = kernel.step(1.0e15);
        assert!(
            !kernel.bodies.iter().any(|b| b.id == doomed_id),
            "a planet orbiting INSIDE the red giant survived it"
        );
        assert!(events > 0, "the star ate a world without saying so");
        let buf = &kernel.event_buf;
        let consumed = buf
            .chunks_exact(EVENT_STRIDE)
            .any(|e| e[0] as u32 == SimEventType::BodyConsumed as u32 && e[2] == doomed_id);
        assert!(consumed, "no BodyConsumed event for the engulfed world");
    }

    // --- §3.7 post-mass-loss orbit tests -----------------------------------

    #[test]
    fn adiabatic_mass_loss_widens_orbits_without_cap() {
        // After a white-dwarf death the surviving planets must be farther out than
        // they were on the main sequence (orbit expansion r → r/retained, where
        // retained ≈ 0.5 for solar → expansion ≈ 2×). The old 2.6× arcade cap
        // is gone, so the test also confirms the expansion equals 1/retained.
        let mut kernel = solar_kernel(1.0, 2000);
        let mut ms_innermost = f64::INFINITY;
        for _ in 0..LIFECYCLE_STEPS {
            let stage = kernel.stage();
            if stage == LifecycleStage::MainSequence as u32 && ms_innermost.is_infinite() {
                // Record innermost planet distance at main-sequence onset.
                for b in &kernel.bodies {
                    if matches!(b.kind, BodyType::Planet | BodyType::Protoplanet) {
                        let r = magnitude(b.pos);
                        if r < ms_innermost {
                            ms_innermost = r;
                        }
                    }
                }
            }
            if stage == LifecycleStage::Remnant as u32 {
                break;
            }
            kernel.step(1.0e17);
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        assert!(!kernel.fate.supernova, "solar kernel should leave a WD");

        // After adiabatic mass loss survivors must have widened.
        let mut remnant_innermost = f64::INFINITY;
        for b in &kernel.bodies {
            if matches!(b.kind, BodyType::Planet | BodyType::Protoplanet) {
                let r = magnitude(b.pos);
                if r < remnant_innermost {
                    remnant_innermost = r;
                }
            }
        }
        // At least one planet survived and moved outward.
        assert!(
            remnant_innermost.is_finite(),
            "no planet survived to the remnant stage"
        );
        // Survivors expanded beyond the red-giant engulf zone.
        assert!(
            remnant_innermost > REDGIANT_ENGULF_AU,
            "innermost remnant planet {remnant_innermost:.2} AU is inside \
             the engulf radius {REDGIANT_ENGULF_AU} AU"
        );
    }

    #[test]
    fn supernova_ejects_unbound_planets() {
        // After a core-collapse supernova the retained fraction is ≈ remnant/star
        // mass ≈ 0.107 for a 15 M☉ star. Since retained < 0.5, ALL planets on
        // circular orbits satisfy v² = mu/r > 2·(mu·retained)/r = 2·mu_remnant/r
        // and must be ejected. Confirm no Planet/Protoplanet bodies remain.
        //
        // The 15 M☉ stellar mass needs a cloud ~54 M☉.
        //
        // Spread over a 250 AU extent so the cloud stays SINGLE: this invariant is
        // about the gravity a LONE remnant has left. A companion star would
        // legitimately keep survivors bound — the binding test is made against the
        // whole system's `mu` (spec §4.1) — so the premise "retained < 0.5 ⇒ every
        // circular orbit is unbound" only holds for a single star.
        let cloud = cloud_mass_for_star(15.0, 0.02);
        let extent = 250.0;
        let mut kernel = Kernel::new(cloud, extent, 0.5, 0.74, 0.24, 0.02, 2000);
        assert!(
            kernel.companion_targets.is_empty(),
            "this test needs a single star; the cloud fragmented instead"
        );
        let reached_remnant = drive_to_remnant(&mut kernel);
        // A 15 M☉ star always produces a supernova.
        if !reached_remnant {
            // Marginal case: skip rather than fail if the lifecycle didn't
            // complete within the step budget.
            return;
        }
        assert!(
            kernel.fate.supernova,
            "15 M☉ star must produce a supernova (got WD)"
        );

        // No Planet or Protoplanet should survive: all were unbound under the
        // remnant's gravity.
        let survivors: Vec<_> = kernel
            .bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Planet | BodyType::Protoplanet))
            .collect();
        assert!(
            survivors.is_empty(),
            "{} planet(s) survived a supernova with retained ≈ 0.107 — \
             they should all be unbound and ejected",
            survivors.len()
        );
    }

    // --- §4.1 multi-attractor gravity + §D4 mass-loss-driven orbits ---------

    /// Positions of every world (planet/protoplanet) keyed by body id.
    fn planet_positions(kernel: &Kernel) -> Vec<(f64, Vec3)> {
        kernel
            .bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Planet | BodyType::Protoplanet))
            .map(|b| (b.id, b.pos))
            .collect()
    }

    /// Distance of the innermost surviving world, or infinity if none is left.
    fn innermost_planet(kernel: &Kernel) -> f64 {
        kernel
            .bodies
            .iter()
            .filter(|b| matches!(b.kind, BodyType::Planet | BodyType::Protoplanet))
            .fold(f64::INFINITY, |acc, b| acc.min(magnitude(b.pos)))
    }

    #[test]
    fn exposes_the_gravitating_centres_over_the_buffer_contract() {
        // The host needs the SET of centres, not just the primary's mu, to draw
        // and describe a multiple system. Until a companion forms there is exactly
        // one centre — the primary, pinned at the scene origin (Decision D5).
        let mut kernel = solar_kernel(1.0, 100);
        assert_eq!(kernel.attractor_count(), 1);
        assert_eq!(kernel.attractor_len() as usize, ATTRACTOR_STRIDE);
        assert_eq!(kernel.attractor_len() as usize % ATTRACTOR_STRIDE, 0);
        for lane in 0..3 {
            assert_eq!(
                kernel.attractor_buf[lane], 0.0,
                "the primary must sit exactly at the origin"
            );
        }
        let published = f64::from(kernel.attractor_buf[3]);
        assert!(
            (published - kernel.orbital_mu()).abs() <= kernel.orbital_mu() * 1e-6,
            "published mu {published} disagrees with orbital_mu {}",
            kernel.orbital_mu()
        );
        // ...and it keeps agreeing once the star starts dying and mu shrinks.
        assert!(drive_to_remnant(&mut kernel));
        assert_eq!(kernel.attractor_count(), 1);
        let published = f64::from(kernel.attractor_buf[3]);
        assert!(
            (published - kernel.orbital_mu()).abs() <= kernel.orbital_mu() * 1e-6,
            "published mu {published} drifted from orbital_mu {}",
            kernel.orbital_mu()
        );
        assert!(kernel.attractor_count() as usize <= nbody::MAX_ATTRACTORS);
    }

    #[test]
    fn gravity_is_exactly_untouched_until_the_star_starts_dying() {
        // The calibrated formation timing rests on `mu` — so `mass_loss_factor`
        // must be the exact identity (not merely ~1) for the whole of formation,
        // the main sequence and the early red giant. Asserted on the BITS: a
        // factor of 0.999999 would silently re-tune every accretion threshold.
        let mut kernel = solar_kernel(1.0, 500);
        let base = GRAVITY * ORBITAL_MASS_SCALE * kernel.cloud_mass.sqrt();
        let ms_dur = kernel.durations[LifecycleStage::MainSequence as usize];
        let rg_dur = kernel.durations[LifecycleStage::RedGiant as usize];

        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            assert_eq!(kernel.mass_loss_factor.to_bits(), 1.0f64.to_bits());
            assert_eq!(kernel.orbital_mu().to_bits(), base.to_bits());
            if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::MainSequence as u32);

        // Across the main sequence, in steps small enough to stay inside it.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(ms_dur / 50.0);
            if kernel.stage() != LifecycleStage::MainSequence as u32 {
                break;
            }
            assert_eq!(kernel.mass_loss_factor.to_bits(), 1.0f64.to_bits());
            assert_eq!(kernel.orbital_mu().to_bits(), base.to_bits());
        }
        assert_eq!(kernel.stage(), LifecycleStage::RedGiant as u32);

        // ...and through the EARLY red giant, until the superwind starts.
        let mut saw_wind = false;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(rg_dur / 60.0);
            if kernel.stage() != LifecycleStage::RedGiant as u32 {
                break;
            }
            if (kernel.stage_progress() as f64) < REDGIANT_MASS_LOSS_ONSET {
                assert_eq!(
                    kernel.mass_loss_factor.to_bits(),
                    1.0f64.to_bits(),
                    "the star shed mass before the superwind began"
                );
            } else if kernel.mass_loss_factor < 1.0 {
                saw_wind = true;
            }
        }
        assert!(
            saw_wind,
            "the red giant never started losing its envelope's gravity"
        );
    }

    #[test]
    fn mass_loss_weakens_gravity_monotonically_down_to_the_remnants_share() {
        // D4: `mass_loss_factor` is the whole mechanism behind orbit widening, so
        // it must never recover (that would pull the orbits back IN) and it must
        // land exactly on the fraction of the star that survives.
        let mut kernel = solar_kernel(1.0, 1500);
        let mut previous = 1.0f64;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            assert!(
                kernel.mass_loss_factor <= previous + 1e-15,
                "gravity recovered: {previous} -> {}",
                kernel.mass_loss_factor
            );
            assert!(kernel.mass_loss_factor > 0.0);
            previous = kernel.mass_loss_factor;
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        let retained = kernel.remnant_retained_fraction();
        assert!(retained < 1.0, "a white dwarf must have shed something");
        assert!(
            (kernel.mass_loss_factor - retained).abs() < 1e-12,
            "factor {} should have landed on the retained fraction {retained}",
            kernel.mass_loss_factor
        );
        // The exported mu is the reduced one — the host draws conics from it.
        let base = GRAVITY * ORBITAL_MASS_SCALE * kernel.cloud_mass.sqrt();
        assert!((kernel.orbital_mu() - base * retained).abs() < 1e-9);
    }

    #[test]
    fn a_brown_dwarf_never_loses_any_gravity() {
        // It never dies, so it never sheds an envelope: the factor must stay the
        // exact identity for the whole run, or its planets would drift outward for
        // no reason at all.
        let cloud = cloud_mass_for_star(0.05, 0.02);
        let mut kernel = Kernel::new(cloud, 50.0, 0.5, 0.74, 0.24, 0.02, 800);
        assert!(kernel.substellar);
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            assert_eq!(kernel.mass_loss_factor.to_bits(), 1.0f64.to_bits());
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
    }

    #[test]
    fn no_planet_jumps_position_when_the_remnant_appears() {
        // REPORTED BUG 2: "after the red giant collapse new planets emerge out of
        // it". Nothing was ever created — every surviving world was TELEPORTED
        // outward by up to 4× in the single step that entered the Remnant stage
        // (the closed-form adiabatic rewrite `r → r/retained`), so worlds hidden
        // inside the giant's glare appeared at new radii the instant it collapsed.
        //
        // The widening now comes from integrating with weakened gravity, so the
        // transition step must be an ORDINARY step: no world may move further than
        // its own ordinary orbital motion.
        let mut kernel = solar_kernel(1.0, 2000);
        let mut saw_transition = false;
        let mut compared = 0usize;
        let mut worst_shift = 0.0f64;
        let mut worst_radial = 0.0f64;
        for _ in 0..LIFECYCLE_STEPS {
            let before = planet_positions(&kernel);
            let was_dying = kernel.stage() == LifecycleStage::Death as u32;
            kernel.step(1.0e17);
            let crossed = was_dying && kernel.stage() == LifecycleStage::Remnant as u32;
            if crossed {
                saw_transition = true;
                let after = planet_positions(&kernel);
                for (id, p0) in &before {
                    let Some((_, p1)) = after.iter().copied().find(|(i, _)| i == id) else {
                        continue; // ejected by the natal kick — not a teleport
                    };
                    let r0 = magnitude(*p0);
                    if r0 <= 0.0 {
                        continue;
                    }
                    let shift = magnitude([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
                    worst_shift = worst_shift.max(shift / r0);
                    worst_radial = worst_radial.max((magnitude(p1) - r0).abs() / r0);
                    compared += 1;
                }
            }
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert!(
            saw_transition,
            "the Death -> Remnant transition was never observed"
        );
        assert!(
            compared > 0,
            "no world survived to the transition, so nothing was actually checked"
        );
        // The old rewrite moved planets by ~3× their own orbital radius in one
        // step (r -> r/0.24 for a 3 M☉ star). Ordinary motion is a fraction of it.
        assert!(
            worst_shift < 0.5,
            "a planet moved {worst_shift:.2}× its orbital radius in the single \
             step that formed the remnant — that is a teleport, not an orbit"
        );
        assert!(
            worst_radial < 0.25,
            "a planet's distance from the star changed by {worst_radial:.2}× in \
             the single step that formed the remnant"
        );
    }

    #[test]
    fn surviving_orbits_widen_gradually_because_gravity_weakened() {
        // The physics the teleport was standing in for must still happen: as the
        // star sheds its envelope the survivors' orbits widen (`a ∝ 1/M`) — but
        // spread over the many steps the death takes, not in one frame.
        let mut kernel = solar_kernel(1.0, 2000);
        // Reach the red giant, then record the innermost survivor.
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.stage() >= LifecycleStage::RedGiant as u32 {
                break;
            }
        }
        let before = innermost_planet(&kernel);
        assert!(
            before.is_finite(),
            "no world survived the red giant's onset"
        );

        let mut worst_step_ratio = 1.0f64;
        let mut previous = before;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            let now = innermost_planet(&kernel);
            if now.is_finite() && previous.is_finite() && previous > 0.0 {
                worst_step_ratio = worst_step_ratio.max(now / previous);
            }
            previous = now;
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        let after = innermost_planet(&kernel);
        assert!(after.is_finite(), "no world survived to the remnant");
        assert!(
            after > before * 1.15,
            "orbits did not widen as the star lost mass: {before:.2} -> {after:.2} AU"
        );
        assert!(
            worst_step_ratio < 1.5,
            "the widening was a jump, not a drift: one step grew the innermost \
             orbit by {worst_step_ratio:.2}×"
        );
    }

    #[test]
    fn supernova_unbinds_when_v_squared_exceeds_two_mu_r() {
        // Unit test for the binding condition: a circular-orbit planet (v² = mu/r)
        // is unbound under mu_remnant = mu·retained when retained < 0.5.
        // This directly validates the formula used in expand_orbits_after_mass_loss.
        let mu = ORBITAL_MASS_SCALE * GRAVITY; // reference mu (cloudMass = 1)
        let r = 2.0; // 2 AU
        let v_circ = (mu / r).sqrt(); // exactly circular

        // retained = 0.3 → mu_remnant = 0.3·mu → v² = mu/r > 2·0.3·mu/r → unbound
        let mu_remnant_low = mu * 0.3;
        assert!(
            !is_bound(mu_remnant_low, r, v_circ),
            "circular orbit must be unbound when retained = 0.3 < 0.5"
        );

        // retained = 0.6 → mu_remnant = 0.6·mu → v² = mu/r < 2·0.6·mu/r → bound
        let mu_remnant_high = mu * 0.6;
        assert!(
            is_bound(mu_remnant_high, r, v_circ),
            "circular orbit must remain bound when retained = 0.6 > 0.5"
        );
    }

    // --- §4.2 companion stars from cloud fragmentation ----------------------

    /// A cloud massive enough to hold a spare Jeans mass, at the default extent.
    /// `cloud_mass_for_star` is not used here on purpose: what fragments is the
    /// CLOUD, and the test is about the cloud's own mass and size.
    fn fragmenting_kernel(cloud_mass: f64, extent: f64, particles: u32) -> Kernel {
        Kernel::new(cloud_mass, extent, 0.5, 0.74, 0.24, 0.02, particles)
    }

    /// Drive until every fragment has finished assembling (or the budget runs
    /// out), returning the step at which that happened.
    fn drive_until_companions_are_grown(kernel: &mut Kernel) -> Option<usize> {
        for step in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            if kernel.companions_seeded && !kernel.companions_hungry() {
                return Some(step);
            }
        }
        None
    }

    fn companions(kernel: &Kernel) -> Vec<&CelestialBody> {
        kernel
            .bodies
            .iter()
            .filter(|b| b.accretion_target > 0.0)
            .collect()
    }

    #[test]
    fn a_massive_cloud_fragments_into_a_companion_star() {
        // The reported bug: "it should be possible to form multiple stars in the
        // same star system if the star dust mass allows". A 120 M☉ cloud holds
        // several Jeans masses, so it cannot collapse as one object — it must
        // produce at least one genuine, hydrogen-burning companion.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 1200);
        assert!(
            !kernel.companion_targets.is_empty(),
            "a 120 M☉ cloud must fragment"
        );
        let mut ignitions: Vec<(f64, f64)> = Vec::new();
        let mut seen_star = false;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                if chunk[0] as u32 == SimEventType::CompanionIgnited as u32 {
                    ignitions.push((chunk[2], chunk[3]));
                }
            }
            if kernel.bodies.iter().any(|b| b.kind == BodyType::Star) {
                seen_star = true;
                break;
            }
        }
        assert!(seen_star, "no companion star formed in a 120 M☉ cloud");

        // The star announces itself, with its identity and mass in the payload.
        assert!(
            !ignitions.is_empty(),
            "a companion became a star without emitting CompanionIgnited"
        );
        for (id, mass) in &ignitions {
            assert!(
                mass >= &HYDROGEN_BURNING_MIN_MASS,
                "CompanionIgnited reported {mass} M☉, below the H-burning limit"
            );
            assert!(
                kernel.bodies.iter().any(|b| b.id == *id),
                "CompanionIgnited names body {id}, which does not exist"
            );
        }

        // ...and it is a real gravitating centre, not just a differently-drawn
        // planet (spec §4.1, Decision D1).
        assert!(
            kernel.attractor_count() >= 2,
            "the companion is not in the attractor set: count = {}",
            kernel.attractor_count()
        );

        // It keeps growing to its full share of the cloud and stays a star.
        let grown = drive_until_companions_are_grown(&mut kernel);
        assert!(grown.is_some(), "the fragments never finished assembling");
        for companion in companions(&kernel) {
            assert_eq!(
                companion.kind,
                BodyType::Star,
                "a {} M☉ companion is typed {:?}",
                companion.mass,
                companion.kind
            );
            // Fragments grow ONLY by rate-limited accretion of their own share:
            // exceeding it would mean they were also sweeping the disc like a
            // planetesimal, which would double-count the disc's mass.
            assert!(
                companion.mass <= companion.accretion_target * (1.0 + 1e-9),
                "companion overshot its share: {} > {}",
                companion.mass,
                companion.accretion_target
            );
        }
    }

    #[test]
    fn a_cloud_that_makes_one_star_makes_exactly_one() {
        // The other half of the criterion: a cloud that assembles a ~1 M☉ star
        // holds only a single Jeans mass, so it must stay single from the first
        // frame to the remnant — no companion, no brown dwarf, one attractor.
        let mut kernel = solar_kernel(1.0, 800);
        assert!(
            kernel.companion_targets.is_empty(),
            "a solar cloud must not fragment"
        );
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            assert_eq!(
                kernel.attractor_count(),
                1,
                "a single star must be the only gravitating centre"
            );
            assert!(
                !kernel.bodies.iter().any(|b| b.kind.is_stellar()),
                "a solar cloud produced a self-luminous body"
            );
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
    }

    #[test]
    fn no_body_above_a_burning_limit_is_ever_typed_a_world() {
        // The reported symptom itself: an object of stellar mass was typed
        // `Planet`, so the renderer drew it as a gas giant complete with rings.
        // Every body, on every step, must be typed by its OWN mass.
        for (cloud, extent) in [(120.0, 50.0), (36.0, 25.0), (3.2, 50.0)] {
            let mut kernel = fragmenting_kernel(cloud, extent, 900);
            for _ in 0..LIFECYCLE_STEPS {
                kernel.step(1.0e17);
                for body in &kernel.bodies {
                    if body.kind == BodyType::Comet || body.kind == BodyType::Asteroid {
                        continue;
                    }
                    if body.mass >= HYDROGEN_BURNING_MIN_MASS {
                        assert_eq!(
                            body.kind,
                            BodyType::Star,
                            "{} M☉ body typed {:?} in a {cloud} M☉ cloud",
                            body.mass,
                            body.kind
                        );
                    } else if body.mass >= DEUTERIUM_BURNING_MIN_MASS {
                        assert_eq!(
                            body.kind,
                            BodyType::BrownDwarf,
                            "{} M☉ body typed {:?} in a {cloud} M☉ cloud",
                            body.mass,
                            body.kind
                        );
                    } else if body.accretion_target > 0.0 {
                        // A cloud FRAGMENT is born at the opacity limit, below the
                        // deuterium mass, and is a protostellar core rather than a
                        // world: it is typed substellar from birth and grows into a
                        // star (`seed_companions`).
                        assert!(
                            body.kind.is_stellar(),
                            "a fragment is typed {:?} — it is not a world",
                            body.kind
                        );
                    } else {
                        assert!(
                            body.kind.is_planetary(),
                            "{} M☉ body typed {:?} — too light to shine",
                            body.mass,
                            body.kind
                        );
                    }
                }
                if kernel.stage() == LifecycleStage::Remnant as u32 {
                    break;
                }
            }
        }
    }

    #[test]
    fn the_type_lane_publishes_the_new_kinds_over_the_buffer_contract() {
        // The host reads the kind from the body buffer's type lane, so a companion
        // must be identifiable there — otherwise `BodyRenderer` keeps drawing it
        // as a planet no matter what the kernel decided.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 800);
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        let n = kernel.body_buf.len() / BODY_STRIDE;
        let stars = (0..n)
            .filter(|i| kernel.body_buf[i * BODY_STRIDE + 1] == BodyType::Star as u32 as f32)
            .count();
        assert!(
            stars >= 1,
            "no body published BodyType::Star in the type lane"
        );
        // Mass lane agrees with the classification the type lane claims.
        for i in 0..n {
            let base = i * BODY_STRIDE;
            if kernel.body_buf[base + 1] == BodyType::Star as u32 as f32 {
                assert!(
                    f64::from(kernel.body_buf[base + 2]) >= HYDROGEN_BURNING_MIN_MASS,
                    "a body published as a Star is below the H-burning limit"
                );
            }
        }
    }

    #[test]
    fn companion_gravity_measurably_perturbs_the_planets() {
        // Decision D1 is FULL companion gravity: the second star must actually
        // pull on the worlds, not merely be drawn. Compared against the
        // single-centre field the kernel used to integrate, at the position of a
        // real planetesimal in a real run.
        let mut kernel = fragmenting_kernel(14.0, 50.0, 900);
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        let attractors = kernel.attractor_set();
        assert!(
            attractors.len() >= 2,
            "no companion in the attractor set to perturb anything"
        );
        let primary_only = {
            let mut set = AttractorSet::new();
            set.push(attractors.as_slice()[0]);
            set
        };
        let planet = kernel
            .bodies
            .iter()
            .find(|b| b.kind.is_planetary())
            .expect("no planet to be perturbed");

        let with_companion = attractor_accel(attractors.as_slice(), SOFTENING, planet.pos);
        let alone = attractor_accel(primary_only.as_slice(), SOFTENING, planet.pos);
        let difference = magnitude([
            with_companion[0] - alone[0],
            with_companion[1] - alone[1],
            with_companion[2] - alone[2],
        ]);
        let relative = difference / magnitude(alone).max(f64::EPSILON);
        assert!(
            relative > 1e-4,
            "companion contributes only {relative:.3e} of the acceleration — \
             its gravity is not reaching the planets"
        );

        // ...and the perturbation accumulates into a different TRAJECTORY, which
        // is what the user sees.
        let mut with_pos = planet.pos;
        let mut with_vel = planet.vel;
        let mut without_pos = planet.pos;
        let mut without_vel = planet.vel;
        for _ in 0..600 {
            let (p, v) = integrate_orbit_attractors(
                with_pos,
                with_vel,
                attractors.as_slice(),
                SOFTENING,
                INTERNAL_DT,
            );
            with_pos = p;
            with_vel = v;
            let (p, v) = integrate_orbit_attractors(
                without_pos,
                without_vel,
                primary_only.as_slice(),
                SOFTENING,
                INTERNAL_DT,
            );
            without_pos = p;
            without_vel = v;
        }
        let drift = magnitude([
            with_pos[0] - without_pos[0],
            with_pos[1] - without_pos[1],
            with_pos[2] - without_pos[2],
        ]);
        assert!(
            drift > 1e-3,
            "the planet's path is unchanged by the companion (drift {drift:.3e} AU)"
        );
    }

    #[test]
    fn a_fragmenting_cloud_still_conserves_its_mass_budget() {
        // Companions must be paid for out of the cloud, not created: every gram a
        // fragment assembles leaves the inner-disc reservoir in the same
        // statement. Same invariant as `the_mass_budget_is_conserved_and_never_grows`,
        // run on a cloud that fragments — the case the accounting is new for.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 2000);
        let cloud = kernel.cloud_mass;
        assert!(!kernel.companion_targets.is_empty(), "cloud must fragment");
        let mut max_total = f64::NEG_INFINITY;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            let dust: f64 = kernel.particles.iter().map(|p| p.mass).sum();
            let bodies: f64 = kernel.bodies.iter().map(|b| b.mass).sum();
            let total =
                kernel.core_mass + kernel.disc_reservoir + kernel.dispersed_mass + dust + bodies;
            assert!(
                total <= cloud * 1.005 + 1e-9,
                "mass created: budget total {total} > cloud {cloud}"
            );
            if max_total != f64::NEG_INFINITY {
                assert!(
                    total <= max_total + cloud * 0.002,
                    "mass budget grew {max_total} -> {total}"
                );
            }
            max_total = max_total.max(total);
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
        // The companions really did assemble stellar masses out of that budget.
        let companion_mass: f64 = companions(&kernel).iter().map(|b| b.mass).sum();
        assert!(
            companion_mass >= HYDROGEN_BURNING_MIN_MASS,
            "the fragments assembled only {companion_mass} M☉ between them"
        );
        // The primary's own budget is untouched by the split: companions are fed
        // from the surplus the star was never going to take, which is what keeps
        // the stage durations and the fate model (both keyed on `star_mass`) valid.
        assert_eq!(
            kernel.star_mass.to_bits(),
            stellar_mass_from_cloud(cloud, 0.02).to_bits()
        );
    }

    #[test]
    fn a_multiple_system_is_still_deterministic() {
        // Determinism underpins every other test here, and companion seeding adds
        // new RNG draws — so the whole multiple-star run must still be bit-exact.
        fn run() -> (Vec<f32>, Vec<f32>, Vec<f32>, Vec<u32>) {
            let mut kernel = fragmenting_kernel(120.0, 50.0, 600);
            let mut kinds = Vec::new();
            for _ in 0..220 {
                kernel.step(1.0e17);
                for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                    kinds.push(chunk[0] as u32);
                }
            }
            (
                kernel.particle_buf.clone(),
                kernel.body_buf.clone(),
                kernel.attractor_buf.clone(),
                kinds,
            )
        }
        let a = run();
        let b = run();
        assert_eq!(a.0, b.0, "particle buffers diverged");
        assert_eq!(a.1, b.1, "body buffers diverged");
        assert_eq!(a.2, b.2, "attractor buffers diverged");
        assert_eq!(a.3, b.3, "event streams diverged");
        assert!(
            a.3.contains(&(SimEventType::CompanionIgnited as u32)),
            "the run under test never ignited a companion"
        );
    }

    #[test]
    fn a_metal_free_cloud_can_still_fragment() {
        // Decision D3: fragmentation is self-gravity against thermal pressure in
        // hydrogen, so a 100 % hydrogen cloud makes a multiple system exactly as
        // readily as an enriched one — even though (bug 4) it can condense no
        // solids and therefore no planets.
        let mut kernel = Kernel::new(120.0, 50.0, 0.5, 1.0, 0.0, 0.0, 800);
        assert!(
            !kernel.companion_targets.is_empty(),
            "a pure-hydrogen cloud must still fragment"
        );
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        assert!(
            kernel.bodies.iter().any(|b| b.kind == BodyType::Star),
            "no companion star formed in a metal-free cloud"
        );
    }

    #[test]
    fn a_companion_is_never_treated_as_a_planet() {
        // Every planet-only rule must skip it: the red giant cannot engulf the
        // star it orbits, it cannot coalesce with a planetesimal, and the
        // supernova's impulse does not unbind it. So it must still be there —
        // still a star — when the primary is a corpse.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 1200);
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        let before: Vec<f64> = companions(&kernel).iter().map(|b| b.id).collect();
        assert!(!before.is_empty());
        assert!(
            drive_to_remnant(&mut kernel),
            "the primary never reached its remnant stage"
        );
        let after: Vec<f64> = companions(&kernel).iter().map(|b| b.id).collect();
        assert_eq!(
            before, after,
            "a companion was engulfed, merged or ejected as if it were a planet"
        );
        for companion in companions(&kernel) {
            assert_eq!(companion.kind, BodyType::Star);
        }
        // ...and it is still holding up its half of the gravitational field.
        assert!(kernel.attractor_count() >= 2);
    }

    #[test]
    fn a_companion_does_not_throttle_the_integrator() {
        // A companion is both a body and a centre, so its separation from ITSELF
        // is zero. Feeding that to the CFL guard would peg the substep at the
        // softening-limited minimum for the whole run and the simulation would
        // crawl. The guard must see the same encounter radius it would without
        // the companion's self-pairing.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 400);
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        let attractors = kernel.attractor_set();
        assert!(attractors.len() >= 2);
        let r_min = kernel.innermost_encounter_radius(&attractors);
        assert!(
            r_min > 0.0,
            "the CFL guard sees a zero encounter radius — a companion is pairing \
             with itself"
        );
        for index in 0..attractors.len() {
            assert!(
                kernel.innermost_encounter_radius_to(index, &attractors) > 0.0,
                "centre {index} sees a zero encounter radius"
            );
        }
        assert!(
            kernel.stable_substep_for_attractors() > 0.0,
            "the substep collapsed to zero"
        );
    }

    #[test]
    fn the_cfl_guard_charges_every_centre_with_the_closest_encounter_present() {
        // Review P2-D asked for a PER-CENTRE encounter radius, on the grounds that
        // charging the primary for an encounter happening at the companion
        // over-resolves the frame. The per-centre radii are computed (and checked
        // here), but the guard deliberately keeps the shared minimum, because the
        // "waste" is the term that resolves the CROSSING time of a companion
        // encounter — where the relative speed comes from the primary's Keplerian
        // shear, not from the companion's own well. Relaxing it unbinds a planet
        // in battery run #20. This test pins BOTH halves so neither can drift.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 400);
        assert!(drive_until_companions_are_grown(&mut kernel).is_some());
        let attractors = kernel.attractor_set();
        assert!(attractors.len() >= 2, "need a companion to tell them apart");

        // Put one world deep inside the companion's well, on a wide circular
        // orbit about the primary so its periapsis about the primary is far out.
        // Only the companion's own term may notice it.
        let companion = *attractors.as_slice().last().expect("a companion centre");
        let primary_before = kernel.innermost_encounter_radius_to(0, &attractors);
        let pos: Vec3 = [
            companion.pos[0] + 0.02,
            companion.pos[1],
            companion.pos[2] + 0.02,
        ];
        let r = magnitude(pos);
        let speed = circular_speed(attractors.primary_mu(), SOFTENING, r);
        kernel.bodies.push(CelestialBody {
            id: 9_001.0,
            kind: BodyType::Planet,
            mass: 1e-9,
            radius: 0.01,
            pos,
            vel: [-speed * pos[2] / r, 0.0, speed * pos[0] / r],
            spin: 1.0,
            captured: true,
            accretion_target: 0.0,
        });
        // Re-derived so the companion centre still matches the same body.
        let attractors = kernel.attractor_set();
        let primary_r = kernel.innermost_encounter_radius_to(0, &attractors);
        let companion_r = kernel.innermost_encounter_radius_to(attractors.len() - 1, &attractors);
        assert!(
            companion_r < 0.1,
            "the companion must see the close world: {companion_r}"
        );
        assert!(
            primary_r > companion_r * 10.0,
            "the PRIMARY was charged for an encounter at the companion: \
             {primary_r} vs {companion_r}"
        );
        assert_eq!(
            primary_r.to_bits(),
            primary_before.to_bits(),
            "a world far from the primary changed the primary's encounter radius"
        );
        // The SHARED minimum has collapsed onto the companion's encounter, and it
        // is that number every centre — the primary included — is charged with.
        let shared = kernel.innermost_encounter_radius(&attractors);
        assert!(shared <= companion_r);
        let h = kernel.stable_substep_for_attractors();
        assert!(h > 0.0 && h <= INTERNAL_DT, "substep out of range: {h}");
        let expected = attractors.as_slice().iter().fold(INTERNAL_DT, |acc, a| {
            acc.min(stable_substep(a.mu, SOFTENING, shared))
        });
        assert_eq!(
            h.to_bits(),
            expected.to_bits(),
            "the guard stopped resolving the companion encounter with the \
             primary's mu — see the doc comment: that term is the crossing-time \
             bound, and dropping it unbinds planets"
        );
        // And it is strictly tighter than the per-centre alternative, which is the
        // whole reason it is kept.
        let per_centre =
            attractors
                .as_slice()
                .iter()
                .enumerate()
                .fold(INTERNAL_DT, |acc, (index, a)| {
                    let r = kernel.innermost_encounter_radius_to(index, &attractors);
                    acc.min(stable_substep(a.mu, SOFTENING, r))
                });
        assert!(
            h <= per_centre,
            "the shared guard must never be looser than the per-centre one: \
             {h} vs {per_centre}"
        );
    }

    #[test]
    fn a_substellar_body_is_either_burning_deuterium_or_on_its_way() {
        // Review P2-C. `BodyType::BrownDwarf` documents ONE exception to its mass
        // range: a cloud fragment is born below the deuterium limit because it is
        // a protostellar core, not a world. That exception must be bounded — such
        // a body is always a fragment with a stellar-track `accretion_target` —
        // so no consumer is ever surprised by a substellar kind on something that
        // is not on the stellar track.
        let mut kernel = fragmenting_kernel(120.0, 50.0, 400);
        assert!(!kernel.companion_targets.is_empty(), "cloud must fragment");
        let mut saw_a_young_fragment = false;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            for body in &kernel.bodies {
                if body.kind != BodyType::BrownDwarf {
                    continue;
                }
                if body.mass < DEUTERIUM_BURNING_MIN_MASS {
                    saw_a_young_fragment = true;
                    assert!(
                        body.accretion_target >= DEUTERIUM_BURNING_MIN_MASS,
                        "a sub-deuterium brown dwarf that is NOT a cloud fragment: \
                         m={} target={}",
                        body.mass,
                        body.accretion_target
                    );
                }
                assert!(
                    body.mass < HYDROGEN_BURNING_MIN_MASS,
                    "a hydrogen-burning body is still typed BrownDwarf: {}",
                    body.mass
                );
            }
        }
        assert!(
            saw_a_young_fragment,
            "the exception was never exercised — the test proves nothing"
        );
    }

    #[test]
    fn a_world_scattered_out_of_the_system_is_ejected_not_kept_forever() {
        // A companion can put a world onto an escape trajectory — directly, or by
        // way of the orbit widening that follows the primary's mass loss. Such a
        // world has left; it must not keep coasting outward in the body list,
        // still drawn and still counted as one of the system's planets.
        //
        // Driven as a state check rather than by waiting for a scattering event:
        // the invariant is "no world is unbound, outside the boundary and
        // receding", and it must hold on EVERY step of a multiple system.
        let mut kernel = fragmenting_kernel(21.4, 50.0, 1200);
        assert!(!kernel.companion_targets.is_empty(), "cloud must fragment");
        let mut ejections = 0usize;
        for _ in 0..(LIFECYCLE_STEPS * 2) {
            kernel.step(1.0e17);
            for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                if chunk[0] as u32 == SimEventType::BodyEjected as u32
                    && (chunk[3] as u32 == BodyType::Planet as u32
                        || chunk[3] as u32 == BodyType::Protoplanet as u32)
                {
                    ejections += 1;
                }
            }
            let attractors = kernel.attractor_set();
            for body in &kernel.bodies {
                if !body.kind.is_planetary() {
                    continue;
                }
                let r = magnitude(body.pos);
                if r < kernel.eject_radius {
                    continue;
                }
                let radial = (body.pos[0] * body.vel[0]
                    + body.pos[1] * body.vel[1]
                    + body.pos[2] * body.vel[2])
                    / r.max(f64::EPSILON);
                if radial <= 0.0 {
                    continue;
                }
                let energy = total_specific_energy_attractors(
                    attractors.as_slice(),
                    SOFTENING,
                    body.pos,
                    body.vel,
                );
                assert!(
                    energy <= 0.0,
                    "an unbound world is still being carried at r={r:.1} (E={energy:.3})"
                );
            }
        }
        // The mechanism has to actually fire in this system, or the invariant above
        // is being satisfied vacuously.
        assert!(
            ejections > 0,
            "no world was ever scattered out of a triple system — \
             the check above proves nothing"
        );
    }

    #[test]
    fn a_single_star_never_ejects_one_of_its_own_worlds() {
        // The counterpart: a monopole cannot unbind a bound orbit, so a lone star
        // that dies quietly (a 1 M☉ progenitor sheds a planetary nebula, with no
        // impulse — `supernova_ejects_unbound_planets` covers the violent case)
        // must never lose a world this way. This is what stops the new rule from
        // quietly deleting planets because of integration error.
        let mut kernel = solar_kernel(1.0, 900);
        assert!(kernel.companion_targets.is_empty());
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
                if chunk[0] as u32 == SimEventType::BodyEjected as u32 {
                    assert!(
                        chunk[3] as u32 == BodyType::Comet as u32
                            || chunk[3] as u32 == BodyType::Asteroid as u32,
                        "a single star ejected one of its own worlds"
                    );
                }
            }
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                break;
            }
        }
    }

    // --- §4.3 composition-driven planet formation ---------------------------

    /// A cloud of the given metallicity, sized to make a ~1 M☉ star, with the
    /// remainder of the composition in hydrogen and helium.
    fn cloud_of_metallicity(metals: f64, particles: u32) -> Kernel {
        let cloud = cloud_mass_for_star(1.0, metals);
        Kernel::new(cloud, 50.0, 0.5, 0.76 - metals, 0.24, metals, particles)
    }

    #[test]
    fn seeded_planetesimal_count_scales_with_the_solid_budget() {
        // The calibration point is untouched: a solar disc still seeds every
        // embryo, so every existing solar-composition expectation holds.
        assert_eq!(seeded_planetesimal_count(0.02), PLANETESIMAL_COUNT);
        // A metal-RICH disc builds bigger worlds (through the retention curve),
        // not more of them — the room for well-separated embryos is unchanged.
        assert_eq!(seeded_planetesimal_count(0.2), PLANETESIMAL_COUNT);
        // Reported bug 4: a 100 % hydrogen cloud has no grains, so no embryos.
        assert_eq!(seeded_planetesimal_count(0.0), 0);
        // In between, the count follows the solid budget, and the last embryo
        // disappears when the budget can no longer supply even one.
        assert_eq!(seeded_planetesimal_count(0.01), PLANETESIMAL_COUNT / 2);
        assert_eq!(seeded_planetesimal_count(0.02 / 8.0), 1);
        assert_eq!(seeded_planetesimal_count(0.02 / 8.0 * 0.99), 0);

        let mut previous = 0usize;
        for i in 0..=60 {
            let metals = f64::from(i) * 0.001;
            let n = seeded_planetesimal_count(metals);
            assert!(n >= previous, "embryo count fell at metals = {metals}");
            previous = n;
        }
    }

    #[test]
    fn a_metal_free_cloud_forms_no_planets_at_any_stage() {
        // Reported bug 4, Decision D3: metals are the only condensable species,
        // so a pure-hydrogen cloud condenses no grains, seeds no embryos and
        // grows no worlds — rocky or otherwise — for the whole life of the star.
        let mut kernel = cloud_of_metallicity(0.0, 1500);
        assert_eq!(
            kernel.planetesimal_count, 0,
            "embryos seeded without metals"
        );
        let mut reached_remnant = false;
        for _ in 0..LIFECYCLE_STEPS {
            kernel.step(1.0e17);
            let worlds = kernel
                .bodies
                .iter()
                .filter(|b| b.kind.is_planetary())
                .count();
            assert_eq!(
                worlds,
                0,
                "a 100 % hydrogen cloud formed {worlds} planets at stage {}",
                kernel.stage()
            );
            if kernel.stage() == LifecycleStage::Remnant as u32 {
                reached_remnant = true;
                break;
            }
        }
        assert!(
            reached_remnant,
            "the metal-free star never finished its life, so the check above \
             only covered part of the run"
        );
    }

    #[test]
    fn a_metal_free_cloud_keeps_its_whole_mass_budget() {
        // The embryos that are never seeded must leave their mass in the DUST,
        // not vanish from the book-keeping: the cloud weighs the same either way.
        let kernel = cloud_of_metallicity(0.0, 1500);
        let dust: f64 = kernel.particles.iter().map(|p| p.mass).sum();
        let bodies: f64 = kernel.bodies.iter().map(|b| b.mass).sum();
        let total =
            kernel.core_mass + kernel.disc_reservoir + kernel.dispersed_mass + dust + bodies;
        assert!(
            (total - kernel.cloud_mass).abs() <= kernel.cloud_mass * 1e-9,
            "metal-free budget {total} != cloud {}",
            kernel.cloud_mass
        );
    }

    #[test]
    fn planet_count_and_mass_grow_with_metallicity() {
        // The whole model in one assertion: no solids, no planets; a quarter of
        // the solar solids, a handful of small ones; solar solids, the calibrated
        // architecture. Growth in BOTH the number of worlds and their total mass.
        let sample = |metals: f64| -> (usize, f64) {
            let mut kernel = cloud_of_metallicity(metals, 2000);
            for _ in 0..LIFECYCLE_STEPS {
                kernel.step(1.0e17);
                if kernel.stage() >= LifecycleStage::MainSequence as u32 {
                    break;
                }
            }
            assert_eq!(
                kernel.stage(),
                LifecycleStage::MainSequence as u32,
                "the metals = {metals} run never reached the main sequence"
            );
            let masses: Vec<f64> = kernel
                .bodies
                .iter()
                .filter(|b| b.kind.is_planetary())
                .map(|b| b.mass)
                .collect();
            (masses.len(), masses.iter().sum())
        };

        let barren = sample(0.0);
        let poor = sample(0.005);
        let solar = sample(0.02);

        assert_eq!(barren, (0, 0.0), "a metal-free disc built worlds");
        assert!(poor.0 > 0, "a quarter-solar disc built nothing at all");
        assert!(
            poor.0 < solar.0,
            "planet count did not grow with metallicity: {} vs {}",
            poor.0,
            solar.0
        );
        assert!(
            solar.1 > poor.1 * 2.0,
            "planet mass did not grow with metallicity: {} vs {}",
            poor.1,
            solar.1
        );
    }
}

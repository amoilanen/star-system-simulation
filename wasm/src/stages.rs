//! Numeric mirror of the lifecycle stage FSM and fate model (spec §4.2, §4.3,
//! FR-3, FR-4). This is the Rust twin of `src/sim/stages.ts` +
//! `src/config/fateModel.ts`; the constants, durations, transition ordering and
//! event types are replicated exactly so the WASM kernel produces the same
//! stage/event stream as the TypeScript fallback.

/// Ordered stages of the stellar lifecycle. Numeric values MUST match the
/// TypeScript `LifecycleStage` enum ordering.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum LifecycleStage {
    DustCloud = 0,
    ProtostarCoalescence = 1,
    FusionIgnition = 2,
    MainSequence = 3,
    RedGiant = 4,
    Death = 5,
    Remnant = 6,
}

/// Terminal compact-object types. Numeric values MUST match the TypeScript
/// `RemnantType` enum ordering.
///
/// `BrownDwarf` is deliberately last so the existing numeric values — which are
/// packed into the events buffer and decoded by the TS wrapper — keep meaning.
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum RemnantType {
    WhiteDwarf = 0,
    NeutronStar = 1,
    Pulsar = 2,
    BlackHole = 3,
    /// A SUBSTELLAR object: it never reached the core temperature hydrogen
    /// fusion needs, so it is not the corpse of a star but an object that never
    /// became one. Listed among the remnants because it is likewise a
    /// degenerate body that simply cools forever.
    BrownDwarf = 4,
}

/// Discrete simulation events. Numeric values MUST match the TypeScript
/// `SimEventType` enum ordering (`src/sim/events.ts`). The full contract is
/// retained even though this kernel does not emit every variant (`PlanetFormed`
/// is surfaced by the renderer/body layer, not the stage FSM).
#[allow(dead_code)]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum SimEventType {
    CollapseOnset = 0,
    ProtostarFormed = 1,
    FusionIgnition = 2,
    PlanetFormed = 3,
    RedGiantOnset = 4,
    DeathEvent = 5,
    RemnantFormed = 6,
    BodyCaptured = 7,
    BodyEjected = 8,
    BodyConsumed = 9,
    /// A cloud fragment crossed the hydrogen-burning minimum mass: the system has
    /// a second (or third) STAR. Payload: `data_a` = body id, `data_b` = its mass
    /// in M☉. Appended so the existing numeric values keep their meaning.
    CompanionIgnited = 10,
}

/// Outcome of a fate determination (spec §4.2).
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub struct FateOutcome {
    pub supernova: bool,
    pub remnant: RemnantType,
}

// --- Timing constants (mirror STAGE_TIMING in stages.ts) --------------------

/// One Julian year in seconds.
const YEAR_SECONDS: f64 = 365.25 * 24.0 * 3600.0;
/// One million years in seconds.
const MYR_SECONDS: f64 = 1.0e6 * YEAR_SECONDS;

const DUST_CLOUD_SECONDS: f64 = 1.0 * MYR_SECONDS;
const PROTOSTAR_BASE_SECONDS: f64 = 0.5 * MYR_SECONDS;
/// Kelvin–Helmholtz contraction of a 1 M☉ star to the ZAMS (~40 Myr).
const PRE_MAIN_SEQUENCE_SOLAR_SECONDS: f64 = 40.0 * MYR_SECONDS;
const PRE_MAIN_SEQUENCE_HIGH_MASS_EXPONENT: f64 = 2.5;
const PRE_MAIN_SEQUENCE_LOW_MASS_EXPONENT: f64 = 1.25;
const PRE_MAIN_SEQUENCE_MIN_SECONDS: f64 = 0.05 * MYR_SECONDS;
/// A brown dwarf's deuterium-burning phase (~10 Myr at 0.05 M☉, ∝ M^-1.5).
const DEUTERIUM_BURNING_SECONDS: f64 = 10.0 * MYR_SECONDS;
const DEUTERIUM_BURNING_REFERENCE_MASS: f64 = 0.05;
const DEUTERIUM_BURNING_EXPONENT: f64 = 1.5;
/// Hurley, Pols & Tout (2000) Z = 0.02 coefficients for t_BGB (Myr).
const MAIN_SEQUENCE_FIT: [f64; 5] = [1593.89, 2706.708, 146.6143, 0.041_419_6, 0.342_634_9];
const MAIN_SEQUENCE_FRACTION_OF_BGB: f64 = 0.95;
const RED_GIANT_FRACTION_OF_MAIN: f64 = 0.1;
/// Superwind + planetary-nebula ejection (~10^4 yr).
const PLANETARY_NEBULA_SECONDS: f64 = 1.0e4 * YEAR_SECONDS;
/// The drawn core-collapse sequence is a ~1-year event.
const CORE_COLLAPSE_SECONDS: f64 = 1.0 * YEAR_SECONDS;
const TIMING_SOLAR_METALLICITY: f64 = 0.02;
/// Metal-poor stars burn out sooner: t ∝ (Z/Z☉)^0.2, clamped.
const METALLICITY_LIFETIME_EXPONENT: f64 = 0.2;
const METALLICITY_LIFETIME_MIN: f64 = 0.45;
const METALLICITY_LIFETIME_MAX: f64 = 1.35;

/// Main-sequence lifetime in sim seconds (mirror of
/// `mainSequenceLifetimeSeconds`): the Hurley–Pols–Tout fit, metallicity-scaled.
#[must_use]
pub fn main_sequence_lifetime_seconds(mass: f64, metals: f64) -> f64 {
    let m = mass.max(1e-3);
    let [a1, a2, a3, a4, a5] = MAIN_SEQUENCE_FIT;
    let t_bgb_myr =
        (a1 + a2 * m.powi(4) + a3 * m.powf(5.5) + m.powi(7)) / (a4 * m.powi(2) + a5 * m.powi(7));
    let z = if metals.is_finite() {
        metals.max(1e-6)
    } else {
        TIMING_SOLAR_METALLICITY
    };
    let metallicity_factor = (z / TIMING_SOLAR_METALLICITY)
        .powf(METALLICITY_LIFETIME_EXPONENT)
        .clamp(METALLICITY_LIFETIME_MIN, METALLICITY_LIFETIME_MAX);
    MAIN_SEQUENCE_FRACTION_OF_BGB * t_bgb_myr * MYR_SECONDS * metallicity_factor
}

/// Pre-main-sequence contraction (star) or deuterium burning (brown dwarf), in
/// sim seconds (mirror of `preMainSequenceSeconds`).
#[must_use]
pub fn pre_main_sequence_seconds(mass: f64) -> f64 {
    let m = mass.max(1e-3);
    if is_substellar(m) {
        return DEUTERIUM_BURNING_SECONDS
            * (DEUTERIUM_BURNING_REFERENCE_MASS / m).powf(DEUTERIUM_BURNING_EXPONENT);
    }
    let exponent = if m >= 1.0 {
        PRE_MAIN_SEQUENCE_HIGH_MASS_EXPONENT
    } else {
        PRE_MAIN_SEQUENCE_LOW_MASS_EXPONENT
    };
    (PRE_MAIN_SEQUENCE_SOLAR_SECONDS * m.powf(-exponent)).max(PRE_MAIN_SEQUENCE_MIN_SECONDS)
}

// --- Fate thresholds (mirror FATE_THRESHOLDS in fateModel.ts) ---------------

/// Hydrogen-burning minimum mass (M_sun): the least massive object that can ever
/// sustain hydrogen fusion, ~0.08 M_sun (about 80 Jupiters) at solar composition.
///
/// Below it, ELECTRON DEGENERACY halts contraction before the core reaches the
/// ~10^7 K hydrogen needs, so fusion never starts. The object is a brown dwarf:
/// it burns its deuterium and then cools forever. It has no main sequence, no
/// red giant and no death, so it must not be walked through them.
pub const HYDROGEN_BURNING_MIN_MASS: f64 = 0.08;

/// Deuterium-burning minimum mass (M☉): ~0.013 M_sun, about 13 Jupiters.
///
/// The lower bound of the BROWN DWARF range. Below it an object never fuses
/// anything at all and is a planet however it formed; above it deuterium burns
/// briefly in the core, which is the conventional dividing line between a
/// planet and a substellar star-like object. Between this and
/// [`HYDROGEN_BURNING_MIN_MASS`] the object glows — so it is emphatically not a
/// world to be drawn with rings and moons, which is exactly the reported bug.
pub const DEUTERIUM_BURNING_MIN_MASS: f64 = 0.013;

const SUPERNOVA_MIN_MASS: f64 = 8.0;
const PULSAR_MIN_MASS: f64 = 12.0;
/// Above this effective final STELLAR mass the core exceeds the TOV limit and
/// collapses to a black hole (mirror of `blackHoleMinMass`).
const BLACK_HOLE_MIN_MASS: f64 = 22.0;
/// Above this the envelope is swallowed rather than expelled: direct collapse
/// with no (or only a failed) supernova (mirror of `directCollapseMinMass`).
const DIRECT_COLLAPSE_MIN_MASS: f64 = 40.0;
const FATE_SOLAR_METALLICITY: f64 = 0.02;
const METALS_MASS_LOSS_COEFFICIENT: f64 = 1.5;
/// Chandrasekhar limit (M☉): the heaviest possible white dwarf.
const CHANDRASEKHAR_MASS: f64 = 1.38;
/// Tolman-Oppenheimer-Volkoff limit (M☉): the heaviest possible neutron star.
const TOV_MASS: f64 = 2.2;

// --- Star formation efficiency (mirror src/config/starFormation.ts) ---------

/// Star formation efficiency of a 1 M☉ core.
const SFE_BASE: f64 = 0.34;
/// How the efficiency falls with cloud mass: eff proportional to M^-exponent.
const SFE_MASS_EXPONENT: f64 = 0.08;
const SFE_MIN: f64 = 0.16;
const SFE_MAX: f64 = 0.42;
const SFE_METALLICITY_COEFFICIENT: f64 = 1.2;

/// Fraction of a cloud that ends up in the star (mirror of
/// `starFormationEfficiency`).
#[must_use]
pub fn star_formation_efficiency(cloud_mass: f64, metals: f64) -> f64 {
    let m = cloud_mass.max(1e-3);
    let metal_excess = metals.max(0.0) - FATE_SOLAR_METALLICITY;
    let metal_factor = (1.0 - SFE_METALLICITY_COEFFICIENT * metal_excess).clamp(0.7, 1.15);
    (SFE_BASE * m.powf(-SFE_MASS_EXPONENT) * metal_factor).clamp(SFE_MIN, SFE_MAX)
}

/// Mass (M☉) of the star a cloud actually assembles — the rest ends up in the
/// disc, in planets, or is blown back into the interstellar medium (mirror of
/// `stellarMassFromCloud`). This is why a 40 M☉ cloud does NOT make a 40 M☉ star.
#[must_use]
pub fn stellar_mass_from_cloud(cloud_mass: f64, metals: f64) -> f64 {
    let m = cloud_mass.max(0.0);
    m * star_formation_efficiency(m, metals)
}

/// Cloud mass (M☉) needed to assemble a star of `stellar_mass` — the inverse of
/// `stellar_mass_from_cloud` (mirror of `cloudMassForStar`), solved by fixed-point
/// iteration because the efficiency itself depends on the cloud mass.
#[cfg_attr(not(test), allow(dead_code))]
#[must_use]
pub fn cloud_mass_for_star(stellar_mass: f64, metals: f64) -> f64 {
    let target = stellar_mass.max(0.0);
    if target == 0.0 {
        return 0.0;
    }
    let mut cloud = target / SFE_BASE;
    for _ in 0..24 {
        cloud = target / star_formation_efficiency(cloud, metals);
    }
    cloud
}

/// Mass (M☉) of the compact object a star of `stellar_mass` leaves behind
/// (mirror of `remnantMass`). Only a fraction of the star survives its death.
#[must_use]
pub fn remnant_mass(stellar_mass: f64, remnant: RemnantType) -> f64 {
    let m = stellar_mass.max(0.0);
    match remnant {
        // A brown dwarf never dies, so it never sheds anything: it IS the object
        // that formed. Unlike every other case, mass is retained in full.
        RemnantType::BrownDwarf => m,
        // The initial–final mass relation is calibrated on ≳0.8 M☉ progenitors;
        // below that its constant term would leave a remnant HEAVIER than the
        // star it came from (mass creation). Cap at 85% of the progenitor: a
        // star always sheds its envelope on the way out.
        RemnantType::WhiteDwarf => (0.4 + 0.11 * m)
            .clamp(0.15, CHANDRASEKHAR_MASS)
            .min(0.85 * m),
        RemnantType::NeutronStar | RemnantType::Pulsar => {
            (1.15 + 0.03 * m).clamp(CHANDRASEKHAR_MASS, TOV_MASS)
        }
        RemnantType::BlackHole => {
            let fallback = if m >= DIRECT_COLLAPSE_MIN_MASS {
                0.75
            } else {
                0.35
            };
            (m * fallback).max(TOV_MASS * 1.5)
        }
    }
}

/// Effective final stellar mass after composition-driven mass loss (mirrors
/// `effectiveFinalMass`).
#[must_use]
pub fn effective_final_mass(mass: f64, metals: f64) -> f64 {
    let metal_excess = metals - FATE_SOLAR_METALLICITY;
    let retained = 1.0 - METALS_MASS_LOSS_COEFFICIENT * metal_excess;
    (mass * retained).max(0.0)
}

/// Whether an object is SUBSTELLAR — below the hydrogen-burning minimum mass,
/// so it never ignites and is a brown dwarf rather than a star (mirror of
/// `isSubstellar`).
///
/// Tested against the RAW mass, not the wind-corrected one: the metallicity
/// correction models line-driven winds, a property of hot massive stars. A
/// 0.05 M_sun object has no such wind, so stripping mass from it before asking
/// whether it can fuse would be physically backwards.
#[must_use]
pub fn is_substellar(mass: f64) -> bool {
    mass < HYDROGEN_BURNING_MIN_MASS
}

/// Determine the death path from initial mass + composition (mirrors
/// `determineFate`, FR-4).
#[must_use]
pub fn determine_fate(mass: f64, metals: f64) -> FateOutcome {
    // Below the hydrogen-burning limit there is no death path at all, because
    // there is never a star: the object stalls as a brown dwarf and cools.
    if is_substellar(mass) {
        return FateOutcome {
            supernova: false,
            remnant: RemnantType::BrownDwarf,
        };
    }
    let final_mass = effective_final_mass(mass, metals);
    if final_mass < SUPERNOVA_MIN_MASS {
        return FateOutcome {
            supernova: false,
            remnant: RemnantType::WhiteDwarf,
        };
    }
    if final_mass >= BLACK_HOLE_MIN_MASS {
        // Above the direct-collapse mass the envelope is swallowed instead of
        // being expelled — the star simply winks out, leaving a black hole.
        return FateOutcome {
            supernova: final_mass < DIRECT_COLLAPSE_MIN_MASS,
            remnant: RemnantType::BlackHole,
        };
    }
    if final_mass >= PULSAR_MIN_MASS {
        return FateOutcome {
            supernova: true,
            remnant: RemnantType::Pulsar,
        };
    }
    FateOutcome {
        supernova: true,
        remnant: RemnantType::NeutronStar,
    }
}

/// Per-stage durations in sim seconds, keyed on mass + metallicity (mirrors
/// `stageDurations`). Index by [`LifecycleStage`] numeric value; the terminal
/// `Remnant` stage lasts forever (`f64::INFINITY`).
#[must_use]
pub fn stage_durations(mass: f64, metals: f64) -> [f64; 7] {
    let m = mass.max(f64::EPSILON);
    let main_sequence = main_sequence_lifetime_seconds(m, metals);
    // A white dwarf's progenitor sheds a planetary nebula over millennia; every
    // other star dies in a core collapse that is over within a year.
    let quiet_death = matches!(
        determine_fate(m, metals).remnant,
        RemnantType::WhiteDwarf | RemnantType::BrownDwarf
    );
    [
        DUST_CLOUD_SECONDS,                         // DustCloud
        PROTOSTAR_BASE_SECONDS * m.powf(-0.5),      // ProtostarCoalescence
        pre_main_sequence_seconds(m),               // FusionIgnition (pre-MS)
        main_sequence,                              // MainSequence
        main_sequence * RED_GIANT_FRACTION_OF_MAIN, // RedGiant
        if quiet_death {
            PLANETARY_NEBULA_SECONDS
        } else {
            CORE_COLLAPSE_SECONDS
        }, // Death
        f64::INFINITY,                              // Remnant
    ]
}

// --- Cloud fragmentation: how many stars a cloud makes (spec §4.2) ----------
//
// Multiple stars are NOT made by growing a planet until it ignites. Real
// multiplicity comes from the FRAGMENTATION of the collapsing cloud: a cloud
// that contains more than one Jeans mass cannot collapse as a single unit, so it
// breaks into several self-gravitating pieces which then collapse separately.
//
// The Jeans mass at fixed temperature goes as `M_J ∝ rho^(-1/2)`, and for a
// cloud of mass `M` and radius `R` the mean density is `rho ∝ M / R^3`. The
// number of Jeans masses the cloud holds is therefore
//
//     N = M / M_J  ∝  M * (M / R^3)^(1/2)  =  (M / R)^(3/2)
//
// which rises steeply with mass and falls with size — reproducing the observed
// rise of multiplicity with mass (~25 % of M dwarfs are multiple, >70 % of O/B
// stars are) out of the physics rather than out of a lookup table.
//
// Deliberately INDEPENDENT of metallicity: fragmentation is driven by
// self-gravity against thermal pressure in a hydrogen/helium gas, so a
// metal-free cloud fragments exactly as readily as an enriched one (Decision
// D3). A 100 % hydrogen cloud can still make a multiple system even though it
// can make no planets at all.

/// Cloud mass (M☉) at [`FRAGMENTATION_REFERENCE_EXTENT`] that supports exactly
/// ONE fragment beyond the primary — i.e. the lightest cloud that makes a binary.
///
/// Calibrated so that a cloud assembling a ~1 M☉ star (≈3 M☉ of gas) stays
/// single while a cloud assembling a few-M☉ star becomes multiple, matching the
/// observed multiplicity-vs-mass trend across the range the setup form exposes.
const FRAGMENTATION_REFERENCE_MASS: f64 = 14.0;
/// Cloud radius (AU) the reference mass is quoted at (the form's default extent).
const FRAGMENTATION_REFERENCE_EXTENT: f64 = 50.0;

/// How many fragments BEYOND the primary the cloud's Jeans mass allows, as a
/// continuous number (`(M/R)^(3/2)` normalized to the reference cloud).
///
/// Continuous rather than integer so it can be asserted to be monotone in mass
/// and in density; [`companion_count`] is what discretizes it.
#[must_use]
pub fn fragmentation_capacity(cloud_mass: f64, cloud_extent: f64) -> f64 {
    if !cloud_mass.is_finite() || !cloud_extent.is_finite() || cloud_extent <= 0.0 {
        return 0.0;
    }
    let mass_ratio = cloud_mass.max(0.0) / FRAGMENTATION_REFERENCE_MASS;
    let size_ratio = FRAGMENTATION_REFERENCE_EXTENT / cloud_extent;
    (mass_ratio * size_ratio).powf(1.5)
}

/// Number of companion fragments a cloud breaks into, capped at `max`
/// (`MAX_ATTRACTORS - 1`, Decision D6). Zero for any cloud that holds less than
/// one extra Jeans mass — such a cloud collapses as a single object.
#[must_use]
pub fn companion_count(cloud_mass: f64, cloud_extent: f64, max: usize) -> usize {
    let capacity = fragmentation_capacity(cloud_mass, cloud_extent);
    if !capacity.is_finite() || capacity < 1.0 {
        return 0;
    }
    // `capacity` can be astronomically large for a very dense cloud, so clamp
    // BEFORE the cast rather than relying on saturating float→int conversion.
    (capacity.min(max as f64)) as usize
}

/// A packed simulation event ready for the linear-memory events buffer. `data_a`
/// / `data_b` carry type-specific payload (see the kernel's event packing).
#[derive(Clone, Copy, Debug)]
pub struct PackedEvent {
    pub kind: SimEventType,
    pub sim_time: f64,
    pub data_a: f64,
    pub data_b: f64,
}

/// Encode a bool as the 0.0/1.0 the buffers use.
#[must_use]
pub fn bool_f64(v: bool) -> f64 {
    if v {
        1.0
    } else {
        0.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn determine_fate_covers_remnant_boundaries() {
        // Solar-metallicity so effective mass ≈ initial mass.
        let solar = 0.02;
        assert_eq!(determine_fate(1.0, solar).remnant, RemnantType::WhiteDwarf);
        assert!(!determine_fate(1.0, solar).supernova);
        assert_eq!(
            determine_fate(10.0, solar).remnant,
            RemnantType::NeutronStar
        );
        assert!(determine_fate(10.0, solar).supernova);
        assert_eq!(determine_fate(20.0, solar).remnant, RemnantType::Pulsar);
        assert!(determine_fate(20.0, solar).supernova);
        // Above the TOV-limit progenitor mass nothing can halt the collapse.
        assert_eq!(determine_fate(30.0, solar).remnant, RemnantType::BlackHole);
        assert!(determine_fate(30.0, solar).supernova);
        // ...and the heaviest progenitors collapse directly, with no supernova.
        assert_eq!(determine_fate(60.0, solar).remnant, RemnantType::BlackHole);
        assert!(!determine_fate(60.0, solar).supernova);
    }

    #[test]
    fn only_a_fraction_of_the_cloud_reaches_the_star() {
        for cloud in [1.0, 10.0, 40.0, 120.0] {
            let star = stellar_mass_from_cloud(cloud, 0.02);
            assert!(star < cloud * 0.45, "cloud {cloud} kept too much mass");
            assert!(star > cloud * 0.15, "cloud {cloud} kept too little mass");
        }
        // Monotonic: a bigger cloud still makes a bigger star.
        assert!(stellar_mass_from_cloud(50.0, 0.02) > stellar_mass_from_cloud(10.0, 0.02));
    }

    #[test]
    fn a_remnant_is_never_heavier_than_the_star_it_came_from() {
        // The initial-final mass relation M_f = 0.4 + 0.11 M_i is calibrated on
        // >=0.8 M_sun progenitors; applied literally to a red dwarf its CONSTANT
        // term dominates, so a 0.07 M_sun star "left behind" a 0.41 M_sun white
        // dwarf - six times its own mass, created from nothing.
        for m in [0.05_f64, 0.07, 0.1, 0.2, 0.4, 0.5, 0.8, 1.0, 3.0, 7.0] {
            assert!(
                remnant_mass(m, RemnantType::WhiteDwarf) < m,
                "white dwarf from {m} M_sun is heavier than its progenitor"
            );
        }
        for m in [10.0_f64, 15.0, 25.0, 50.0, 100.0] {
            for remnant in [
                RemnantType::NeutronStar,
                RemnantType::Pulsar,
                RemnantType::BlackHole,
            ] {
                assert!(remnant_mass(m, remnant) < m);
            }
        }
    }

    #[test]
    fn remnant_keeps_only_part_of_the_star() {
        assert!(remnant_mass(1.0, RemnantType::WhiteDwarf) < 1.0);
        assert!(remnant_mass(15.0, RemnantType::NeutronStar) <= TOV_MASS);
        assert!(remnant_mass(30.0, RemnantType::BlackHole) < 30.0);
    }

    #[test]
    fn high_metallicity_mass_loss_can_downgrade_remnant() {
        // Excess metals shed mass via winds, lowering the effective final mass.
        let low_z = determine_fate(9.0, 0.02);
        let high_z = determine_fate(9.0, 0.5);
        assert!(low_z.supernova);
        assert_eq!(high_z.remnant, RemnantType::WhiteDwarf);
    }

    #[test]
    fn stage_durations_scale_with_mass_and_are_ordered() {
        let solar = stage_durations(1.0, 0.02);
        let heavy = stage_durations(10.0, 0.02);
        // Main-sequence lifetime falls steeply with mass (massive stars die young).
        assert!(
            heavy[LifecycleStage::MainSequence as usize]
                < solar[LifecycleStage::MainSequence as usize]
        );
        // The remnant is terminal (lasts forever).
        assert!(solar[LifecycleStage::Remnant as usize].is_infinite());
        // Red giant is a fraction of the main-sequence lifetime.
        assert!(
            solar[LifecycleStage::RedGiant as usize] < solar[LifecycleStage::MainSequence as usize]
        );
    }

    #[test]
    fn main_sequence_lifetimes_match_stellar_models() {
        // Reference: detailed solar-metallicity stellar models (Myr).
        let myr = MYR_SECONDS;
        for (m, reference) in [(1.0, 1.0e4), (3.0, 350.0), (20.0, 8.1), (60.0, 3.5)] {
            let t = main_sequence_lifetime_seconds(m, 0.02) / myr;
            assert!(
                (t / reference - 1.0).abs() < 0.12,
                "{m} M_sun lives {t} Myr, models say {reference}"
            );
        }
    }

    #[test]
    fn metal_poor_stars_burn_out_sooner() {
        let poor = main_sequence_lifetime_seconds(1.0, 0.001);
        let solar = main_sequence_lifetime_seconds(1.0, 0.02);
        let rich = main_sequence_lifetime_seconds(1.0, 0.06);
        assert!(poor < solar && solar < rich);
        assert!(main_sequence_lifetime_seconds(1.0, 0.0) > 0.0);
    }

    #[test]
    fn a_supernova_is_brief_and_a_planetary_nebula_is_not() {
        let sun = stage_durations(1.0, 0.02)[LifecycleStage::Death as usize];
        let massive = stage_durations(20.0, 0.02)[LifecycleStage::Death as usize];
        assert!(massive <= 2.0 * YEAR_SECONDS);
        assert!(sun >= 1.0e3 * YEAR_SECONDS);
    }

    #[test]
    fn the_sun_contracts_for_tens_of_millions_of_years_before_ignition() {
        let pms = stage_durations(1.0, 0.02)[LifecycleStage::FusionIgnition as usize] / MYR_SECONDS;
        assert!((20.0..60.0).contains(&pms), "pre-MS {pms} Myr");
        // Massive stars arrive on the main sequence almost at once.
        assert!(pre_main_sequence_seconds(30.0) < pre_main_sequence_seconds(1.0) / 100.0);
    }

    #[test]
    fn the_substellar_range_sits_between_the_two_burning_limits() {
        // The two limits bracket the brown-dwarf range, and both must be well
        // inside the masses bodies actually reach in this kernel — the whole
        // point of the mass-based classification is that it triggers.
        const { assert!(DEUTERIUM_BURNING_MIN_MASS < HYDROGEN_BURNING_MIN_MASS) };
        const { assert!(DEUTERIUM_BURNING_MIN_MASS > 0.0) };
        // ~13 Jupiters, in solar masses (1 M♃ = 1/1047 M☉).
        assert!((DEUTERIUM_BURNING_MIN_MASS * 1047.0 - 13.0).abs() < 1.0);
    }

    #[test]
    fn fragmentation_rises_with_mass_and_with_density() {
        // N ∝ (M/R)^1.5: a heavier cloud fragments more, and so does a more
        // compact one of the same mass.
        assert!(fragmentation_capacity(100.0, 50.0) > fragmentation_capacity(50.0, 50.0));
        assert!(fragmentation_capacity(50.0, 25.0) > fragmentation_capacity(50.0, 50.0));
        // Monotone across the whole form range, with no NaN/negative excursions.
        let mut previous = 0.0;
        for mass in [0.1_f64, 1.0, 3.0, 10.0, 30.0, 90.0, 250.0] {
            let capacity = fragmentation_capacity(mass, 50.0);
            assert!(capacity.is_finite() && capacity >= 0.0, "mass {mass}");
            assert!(capacity > previous, "not monotone at mass {mass}");
            previous = capacity;
        }
        // Degenerate inputs are answered with "no fragmentation", never a NaN
        // that would later become a companion count.
        assert_eq!(fragmentation_capacity(f64::NAN, 50.0), 0.0);
        assert_eq!(fragmentation_capacity(10.0, 0.0), 0.0);
        assert_eq!(fragmentation_capacity(-5.0, 50.0), 0.0);
    }

    #[test]
    fn only_clouds_above_a_jeans_mass_make_companions() {
        // A cloud that assembles a ~1 M☉ star stays SINGLE: 44 % of solar-type
        // stars are multiple in reality, but at this cloud mass the model's Jeans
        // criterion is not met, and the reported bug is about massive clouds.
        let solar_cloud = cloud_mass_for_star(1.0, 0.02);
        assert_eq!(companion_count(solar_cloud, 50.0, 2), 0);
        // A massive cloud does fragment...
        assert!(companion_count(120.0, 50.0, 2) >= 1);
        // ...and the count is capped by the attractor budget (Decision D6),
        // however extreme the cloud.
        assert_eq!(companion_count(250.0, 10.0, 2), 2);
        assert_eq!(companion_count(250.0, 10.0, 1), 1);
        assert_eq!(companion_count(250.0, 10.0, 0), 0);
        // Monotone in cloud mass: growing a cloud never REMOVES a companion.
        let mut previous = 0;
        for mass in [0.1_f64, 1.0, 3.0, 10.0, 30.0, 90.0, 250.0] {
            let n = companion_count(mass, 50.0, 2);
            assert!(n >= previous, "companion count fell at mass {mass}");
            previous = n;
        }
    }

    #[test]
    fn fragmentation_ignores_metallicity_entirely() {
        // Decision D3: fragmentation is self-gravity against thermal pressure in
        // hydrogen and helium, so a 100 % hydrogen cloud must fragment exactly as
        // readily as an enriched one. The signature takes no metallicity at all —
        // this test pins that down as intentional rather than an oversight.
        let capacity = fragmentation_capacity(60.0, 50.0);
        for metals in [0.0_f64, 0.004, 0.02, 0.12] {
            // The star the cloud assembles does depend on metallicity...
            let _ = stellar_mass_from_cloud(60.0, metals);
            // ...but how many pieces it breaks into does not.
            assert_eq!(fragmentation_capacity(60.0, 50.0), capacity);
        }
    }

    #[test]
    fn bool_f64_encodes_flags() {
        assert_eq!(bool_f64(true), 1.0);
        assert_eq!(bool_f64(false), 0.0);
    }
}

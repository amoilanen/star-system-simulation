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
const FUSION_IGNITION_SECONDS: f64 = 0.1 * MYR_SECONDS;
const MAIN_SEQUENCE_SOLAR_SECONDS: f64 = 10.0e9 * YEAR_SECONDS;
const RED_GIANT_FRACTION_OF_MAIN: f64 = 0.1;
const DEATH_SECONDS: f64 = 0.01 * MYR_SECONDS;
const TIMING_SOLAR_METALLICITY: f64 = 0.02;
const METALLICITY_LIFETIME_COEFFICIENT: f64 = 2.0;

// --- Fate thresholds (mirror FATE_THRESHOLDS in fateModel.ts) ---------------

/// Hydrogen-burning minimum mass (M_sun): the least massive object that can ever
/// sustain hydrogen fusion, ~0.08 M_sun (about 80 Jupiters) at solar composition.
///
/// Below it, ELECTRON DEGENERACY halts contraction before the core reaches the
/// ~10^7 K hydrogen needs, so fusion never starts. The object is a brown dwarf:
/// it burns its deuterium and then cools forever. It has no main sequence, no
/// red giant and no death, so it must not be walked through them.
pub const HYDROGEN_BURNING_MIN_MASS: f64 = 0.08;

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
    let metal_excess = metals - TIMING_SOLAR_METALLICITY;
    let metallicity_factor = (1.0 - METALLICITY_LIFETIME_COEFFICIENT * metal_excess).max(0.1);
    let main_sequence = MAIN_SEQUENCE_SOLAR_SECONDS * m.powf(-2.5) * metallicity_factor;
    [
        DUST_CLOUD_SECONDS,                         // DustCloud
        PROTOSTAR_BASE_SECONDS * m.powf(-0.5),      // ProtostarCoalescence
        FUSION_IGNITION_SECONDS,                    // FusionIgnition
        main_sequence,                              // MainSequence
        main_sequence * RED_GIANT_FRACTION_OF_MAIN, // RedGiant
        DEATH_SECONDS,                              // Death
        f64::INFINITY,                              // Remnant
    ]
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
    fn bool_f64_encodes_flags() {
        assert_eq!(bool_f64(true), 1.0);
        assert_eq!(bool_f64(false), 0.0);
    }
}

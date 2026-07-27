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
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum RemnantType {
    WhiteDwarf = 0,
    NeutronStar = 1,
    Pulsar = 2,
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

const SUPERNOVA_MIN_MASS: f64 = 8.0;
const PULSAR_MIN_MASS: f64 = 12.0;
const FATE_SOLAR_METALLICITY: f64 = 0.02;
const METALS_MASS_LOSS_COEFFICIENT: f64 = 1.5;

/// Effective final stellar mass after composition-driven mass loss (mirrors
/// `effectiveFinalMass`).
#[must_use]
pub fn effective_final_mass(mass: f64, metals: f64) -> f64 {
    let metal_excess = metals - FATE_SOLAR_METALLICITY;
    let retained = 1.0 - METALS_MASS_LOSS_COEFFICIENT * metal_excess;
    (mass * retained).max(0.0)
}

/// Determine the death path from initial mass + composition (mirrors
/// `determineFate`, FR-4).
#[must_use]
pub fn determine_fate(mass: f64, metals: f64) -> FateOutcome {
    let final_mass = effective_final_mass(mass, metals);
    if final_mass < SUPERNOVA_MIN_MASS {
        return FateOutcome {
            supernova: false,
            remnant: RemnantType::WhiteDwarf,
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

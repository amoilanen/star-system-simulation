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

/// The event emitted when the FSM ENTERS a stage, mirroring `STAGE_ENTRY_EVENT`.
/// `DustCloud` is the initial stage and has no entry event.
fn stage_entry_event(stage: LifecycleStage) -> Option<SimEventType> {
    match stage {
        LifecycleStage::DustCloud => None,
        LifecycleStage::ProtostarCoalescence => Some(SimEventType::CollapseOnset),
        LifecycleStage::FusionIgnition => Some(SimEventType::ProtostarFormed),
        LifecycleStage::MainSequence => Some(SimEventType::FusionIgnition),
        LifecycleStage::RedGiant => Some(SimEventType::RedGiantOnset),
        LifecycleStage::Death => Some(SimEventType::DeathEvent),
        LifecycleStage::Remnant => Some(SimEventType::RemnantFormed),
    }
}

/// Ordered stages the FSM walks through, initial → terminal.
const STAGE_ORDER: [LifecycleStage; 7] = [
    LifecycleStage::DustCloud,
    LifecycleStage::ProtostarCoalescence,
    LifecycleStage::FusionIgnition,
    LifecycleStage::MainSequence,
    LifecycleStage::RedGiant,
    LifecycleStage::Death,
    LifecycleStage::Remnant,
];

/// A packed simulation event ready for the linear-memory events buffer. `data_a`
/// / `data_b` carry type-specific payload (see the kernel's event packing).
#[derive(Clone, Copy, Debug)]
pub struct PackedEvent {
    pub kind: SimEventType,
    pub sim_time: f64,
    pub data_a: f64,
    pub data_b: f64,
}

/// Deterministic lifecycle stage machine (mirror of `StageMachine`). Advanced by
/// sim-time `dt`; emits exactly one entry event per stage transition into the
/// provided sink, stamped with the machine's internal sim time.
pub struct StageMachine {
    stage_index: usize,
    elapsed_in_stage: f64,
    sim_time: f64,
    durations: [f64; 7],
    fate: FateOutcome,
}

impl StageMachine {
    /// Construct for a run with the given mass + metallicity.
    #[must_use]
    pub fn new(mass: f64, metals: f64) -> Self {
        Self {
            stage_index: 0,
            elapsed_in_stage: 0.0,
            sim_time: 0.0,
            durations: stage_durations(mass, metals),
            fate: determine_fate(mass, metals),
        }
    }

    /// The stage the star system is currently in.
    #[must_use]
    pub fn current_stage(&self) -> LifecycleStage {
        STAGE_ORDER[self.stage_index]
    }

    /// Advance the FSM by `sim_dt` sim seconds, pushing one correctly-typed,
    /// correctly-timed entry event per crossed transition into `out`. Mirrors
    /// `StageMachine.update`. Non-positive / non-finite `dt` is ignored.
    pub fn update(&mut self, sim_dt: f64, out: &mut Vec<PackedEvent>) {
        if !sim_dt.is_finite() || sim_dt <= 0.0 {
            return;
        }
        let mut remaining = sim_dt;
        while remaining > 0.0 && self.current_stage() != LifecycleStage::Remnant {
            let stage_duration = self.durations[self.stage_index];
            let remaining_in_stage = stage_duration - self.elapsed_in_stage;
            if remaining < remaining_in_stage {
                self.elapsed_in_stage += remaining;
                self.sim_time += remaining;
                remaining = 0.0;
            } else {
                self.sim_time += remaining_in_stage;
                remaining -= remaining_in_stage;
                self.elapsed_in_stage = 0.0;
                self.advance_stage(out);
            }
        }
        if remaining > 0.0 {
            self.sim_time += remaining;
        }
    }

    fn advance_stage(&mut self, out: &mut Vec<PackedEvent>) {
        if self.stage_index + 1 >= STAGE_ORDER.len() {
            return;
        }
        self.stage_index += 1;
        let stage = self.current_stage();
        if let Some(kind) = stage_entry_event(stage) {
            let (data_a, data_b) = self.event_data(kind);
            out.push(PackedEvent {
                kind,
                sim_time: self.sim_time,
                data_a,
                data_b,
            });
        }
    }

    /// Structured payload for events carrying the selected death path (mirrors
    /// `StageMachine.eventData`).
    fn event_data(&self, kind: SimEventType) -> (f64, f64) {
        match kind {
            SimEventType::DeathEvent => (bool_f64(self.fate.supernova), 0.0),
            SimEventType::RemnantFormed => (
                self.fate.remnant as u32 as f64,
                bool_f64(self.fate.supernova),
            ),
            _ => (0.0, 0.0),
        }
    }
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
    fn stages_advance_in_order_emitting_one_event_each() {
        let mut m = StageMachine::new(1.0, 0.02);
        let mut events = Vec::new();
        // One huge dt crosses every boundary.
        m.update(1.0e30, &mut events);
        assert_eq!(m.current_stage(), LifecycleStage::Remnant);
        let kinds: Vec<SimEventType> = events.iter().map(|e| e.kind).collect();
        assert_eq!(
            kinds,
            vec![
                SimEventType::CollapseOnset,
                SimEventType::ProtostarFormed,
                SimEventType::FusionIgnition,
                SimEventType::RedGiantOnset,
                SimEventType::DeathEvent,
                SimEventType::RemnantFormed,
            ]
        );
        // Events are monotonically non-decreasing in sim time.
        for w in events.windows(2) {
            assert!(w[1].sim_time >= w[0].sim_time);
        }
    }

    #[test]
    fn high_mass_death_path_is_supernova_and_pulsar() {
        let mut m = StageMachine::new(20.0, 0.02);
        let mut events = Vec::new();
        m.update(1.0e30, &mut events);
        let remnant = events
            .iter()
            .find(|e| e.kind == SimEventType::RemnantFormed)
            .expect("remnant event");
        assert_eq!(remnant.data_a as u32, RemnantType::Pulsar as u32);
        assert_eq!(remnant.data_b, 1.0, "supernova flag set");
    }

    #[test]
    fn low_mass_death_path_is_white_dwarf_without_supernova() {
        let mut m = StageMachine::new(1.0, 0.02);
        let mut events = Vec::new();
        m.update(1.0e30, &mut events);
        let death = events
            .iter()
            .find(|e| e.kind == SimEventType::DeathEvent)
            .expect("death event");
        assert_eq!(death.data_a, 0.0, "no supernova for low mass");
        let remnant = events
            .iter()
            .find(|e| e.kind == SimEventType::RemnantFormed)
            .expect("remnant event");
        assert_eq!(remnant.data_a as u32, RemnantType::WhiteDwarf as u32);
    }

    #[test]
    fn paused_dt_emits_nothing_and_holds_stage() {
        let mut m = StageMachine::new(1.0, 0.02);
        let mut events = Vec::new();
        m.update(0.0, &mut events);
        m.update(-5.0, &mut events);
        m.update(f64::NAN, &mut events);
        assert!(events.is_empty());
        assert_eq!(m.current_stage(), LifecycleStage::DustCloud);
    }
}

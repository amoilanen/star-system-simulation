//! Rust/WASM physics kernel (spec §4.4, §4.5, §5, Decisions D1/D2, FR-7, FR-10).
//!
//! High-performance numeric twin of the pure-TypeScript fallback
//! (`src/sim/TsFallbackKernel.ts`). It exposes `wasm-bindgen` bindings for the
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
    accretion_efficiency, accretion_radius, body_radius_from_mass, circular_speed, integrate_orbit,
    magnitude, merge_radius, merged_velocity, orbital_step, softened_accel, Vec3,
    BODY_DAMP_FRACTION, DISK_SETTLE, GAS_DRAG, GRAVITY, INTERNAL_DT, MAX_PARTICLES, MAX_SUBSTEPS,
    ORBITAL_MASS_SCALE, SOFTENING, VERTICAL_DAMP,
};
use stages::{
    bool_f64, determine_fate, stage_durations, FateOutcome, LifecycleStage, PackedEvent,
    SimEventType,
};

/// Number of Float32 lanes per particle (mirror `PARTICLE_STRIDE`).
const PARTICLE_STRIDE: usize = 7;
/// Number of Float32 lanes per body (mirror `BODY_STRIDE`).
const BODY_STRIDE: usize = 12;
/// Number of Float64 lanes per packed event: [type, simTime, dataA, dataB].
const EVENT_STRIDE: usize = 4;

/// Number of planetesimal seeds placed in the disc (survivors become planets).
const PLANETESIMAL_COUNT: usize = 12;
/// Sim seconds between visiting comet/asteroid spawns (mirror).
const VISITOR_SPAWN_INTERVAL: f64 = 8.0e15;
/// Cap on simultaneously present visiting bodies so captured ones cannot
/// accumulate without bound (mirror of the TS fallback's `MAX_VISITORS`).
const MAX_VISITORS: usize = 10;
/// Fraction of the cloud mass pre-seeded into the central protostar core.
const CORE_SEED_FRACTION: f64 = 0.04;
/// Fraction of the cloud mass in each planetesimal seed (~3 M⊕ for 1 M☉).
const PLANETESIMAL_MASS_FRACTION: f64 = 1e-5;

/// Body-swallow radius as a fraction of the dust feeding radius (mirror of the
/// TS fallback's `BODY_SWALLOW_FRACTION`). A body inside it has fallen into the
/// star and is destroyed rather than parking on top of it.
const BODY_SWALLOW_FRACTION: f64 = 0.6;
/// Particles beyond this multiple of the cloud extent are considered escaped.
const ESCAPE_EXTENT_FACTOR: f64 = 2.4;
/// Number of ejecta particles thrown out when the star dies (nebula/supernova).
const EJECTA_COUNT: usize = 1200;
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
/// Minimum death-ejecta speed as a multiple of the LOCAL ESCAPE SPEED (mirror of
/// `EJECTA_ESCAPE_MARGIN`). Real ejecta always exceeds escape velocity — that is
/// why the shell disperses and leaves a bare remnant instead of a ring around it.
const EJECTA_ESCAPE_MARGIN: f64 = 1.25;
/// Red-giant photospheric reach in AU (= scene units) for a 1 M☉ star; scaled by
/// mass^0.3. Planets inside it are engulfed when the star becomes a red giant.
const REDGIANT_ENGULF_AU: f64 = 2.2;
/// Cap on how much surviving orbits widen when the dying star sheds its mass.
const REMNANT_ORBIT_EXPANSION_MAX: f64 = 2.6;

/// Core mass fractions at which the FORMATION stages advance (mirror the TS
/// fallback's `*_CORE_FRACTION`). Formation is accretion-driven, not timed.
const PROTOSTAR_CORE_FRACTION: f64 = 0.1;
const FUSION_CORE_FRACTION: f64 = 0.3;
const IGNITION_CORE_FRACTION: f64 = 0.5;

/// Maximum rate at which the protostar can swallow dust, as a fraction of the
/// cloud mass per unit orbital time (mirror of the TS `CORE_ACCRETION_RATE`).
///
/// Real physics, not a fudge: infalling gas carries angular momentum, so it
/// piles into a disc and only reaches the star as fast as that angular momentum
/// is transported outward — a finite Ṁ. That is why star formation takes ~1 Myr
/// rather than a free-fall time. Without the cap the core ran from its 4% seed
/// to the 50% ignition threshold in ~1 second of playback, so the star appeared
/// to be born immediately.
const CORE_ACCRETION_RATE: f64 = 0.0055;

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

/// The `WebAssembly.Memory` backing this module, so TypeScript can build
/// `Float32Array` / `Float64Array` views over the buffer pointers below.
#[wasm_bindgen]
pub fn wasm_memory() -> JsValue {
    wasm_bindgen::memory()
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
    core_mass: f64,
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
    core_fraction: f64,

    particles: Vec<Particle>,
    bodies: Vec<CelestialBody>,

    particle_buf: Vec<f32>,
    body_buf: Vec<f32>,
    event_buf: Vec<f64>,

    sim_time: f64,
    next_body_id: f64,
    spawn_accumulator: f64,
    ejecta_done: bool,
}

#[wasm_bindgen]
impl Kernel {
    /// (Re)initialize the kernel for a run (mirror of `TsFallbackKernel.init`).
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
        let core_mass = cloud_mass * CORE_SEED_FRACTION;
        let core_accretion_radius = (cloud_extent * 0.02).clamp(0.5, 2.0);
        let mut kernel = Kernel {
            cloud_extent,
            cloud_mass,
            core_mass,
            disc_reservoir: 0.0,
            core_accretion_radius,
            body_swallow_radius: core_accretion_radius * BODY_SWALLOW_FRACTION,
            eject_radius: cloud_extent * 1.5,
            composition: [h, he, metals],
            rng: Mulberry32::new(seed),
            stage: LifecycleStage::DustCloud,
            stellar_elapsed: 0.0,
            durations: stage_durations(mass, metals),
            fate: determine_fate(mass, metals),
            core_fraction: core_mass / cloud_mass,
            particles: Vec::new(),
            bodies: Vec::new(),
            particle_buf: Vec::new(),
            body_buf: Vec::new(),
            event_buf: Vec::new(),
            sim_time: 0.0,
            next_body_id: 0.0,
            spawn_accumulator: 0.0,
            ejecta_done: false,
        };
        kernel.seed_particles(particle_count as usize);
        kernel.seed_planetesimals();
        kernel.particle_buf = vec![0.0; kernel.particles.len() * PARTICLE_STRIDE];
        kernel.body_buf = vec![0.0; kernel.bodies.len() * BODY_STRIDE];
        kernel.write_particle_buffer();
        kernel.write_body_buffer();
        kernel
    }

    /// Advance the simulation by `dt_sim_seconds`, returning the number of events
    /// emitted this step (packed into the events buffer). Mirror of
    /// `TsFallbackKernel.step`.
    pub fn step(&mut self, dt_sim_seconds: f64) -> u32 {
        self.event_buf.clear();
        if !dt_sim_seconds.is_finite() || dt_sim_seconds <= 0.0 {
            return 0;
        }

        let mut events: Vec<PackedEvent> = Vec::new();
        self.sim_time += dt_sim_seconds;

        // Emergent dynamics on the bounded, watchable orbital clock. This grows
        // the accreted core mass, which in turn drives the formation stages.
        let orbital = orbital_step(dt_sim_seconds);
        if orbital > 0.0 {
            let substeps = (orbital / INTERNAL_DT)
                .ceil()
                .max(1.0)
                .min(MAX_SUBSTEPS as f64) as usize;
            let h = orbital / substeps as f64;
            let forming = (self.stage as u32) <= LifecycleStage::FusionIgnition as u32;
            for _ in 0..substeps {
                self.integrate_particles(h, forming);
                self.integrate_bodies(h);
            }
            let stage = self.stage;
            self.accrete(stage, orbital);
            self.age_particles(orbital);
            // Anything that has plunged into the star is torn apart and consumed.
            self.swallow_bodies_into_star(&mut events);
        }

        // Drive the lifecycle: FORMATION from accreted core mass, STELLAR by time.
        self.core_fraction = self.core_mass / self.cloud_mass.max(f64::EPSILON);
        self.advance_stages(dt_sim_seconds, self.core_fraction, &mut events);

        // Once the star ignites, the surviving planetesimals are full planets.
        if self.stage as u32 >= LifecycleStage::FusionIgnition as u32 {
            self.promote_planets();
        }
        // When the star dies, sweep away leftover primordial disc dust (so none
        // lingers orbiting the remnant) and throw a shell of ejecta out.
        if self.stage as u32 >= LifecycleStage::Death as u32 && !self.ejecta_done {
            self.dissipate_disc_material();
            self.spawn_ejecta();
            self.ejecta_done = true;
        }

        self.spawn_visitors(dt_sim_seconds);
        self.resolve_visitors(&mut events);
        self.cull_particles();

        self.rebuild_particle_buffer();
        self.rebuild_body_buffer();
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
}

impl Kernel {
    /// Gravitational parameter driving the dynamics (visual-scaled). Uses the
    /// TOTAL cloud mass so collapse/orbits proceed from the start rather than
    /// stalling until the seed core has grown.
    fn mu(&self) -> f64 {
        // √M rather than M — see `orbitalMu` in the TS fallback: full
        // mass-proportionality outruns the integration substep for heavy clouds.
        GRAVITY * ORBITAL_MASS_SCALE * self.cloud_mass.max(f64::EPSILON).sqrt()
    }

    /// Effective radius within which the star captures dust: at least the
    /// physical feeding radius, but never smaller than the distance a fast
    /// in-falling grain covers in one substep, so grains cannot "tunnel"
    /// through the capture sphere around a massive (fast) cloud.
    fn capture_radius(&self) -> f64 {
        let infall_per_substep = self.mu().sqrt() * INTERNAL_DT;
        self.core_accretion_radius.max(2.0 * infall_per_substep)
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
        }
        if self.stage == LifecycleStage::ProtostarCoalescence && core_frac >= FUSION_CORE_FRACTION {
            self.stage = LifecycleStage::FusionIgnition;
            self.emit_stage(SimEventType::ProtostarFormed, 0.0, 0.0, out);
        }
        if self.stage == LifecycleStage::FusionIgnition && core_frac >= IGNITION_CORE_FRACTION {
            self.stage = LifecycleStage::MainSequence;
            self.stellar_elapsed = 0.0;
            self.emit_stage(SimEventType::FusionIgnition, 0.0, 0.0, out);
        }

        // Stellar — sim-time driven; a single large dt can cross several stages.
        if (self.stage as u32) >= LifecycleStage::MainSequence as u32
            && (self.stage as u32) < LifecycleStage::Remnant as u32
            && sim_dt.is_finite()
            && sim_dt > 0.0
        {
            self.stellar_elapsed += sim_dt;
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
                        // The swelling giant engulfs and destroys its inner planets.
                        self.engulf_inner_planets(out);
                        self.emit_stage(SimEventType::RedGiantOnset, 0.0, 0.0, out);
                    }
                    LifecycleStage::RedGiant => {
                        self.stage = LifecycleStage::Death;
                        let sn = bool_f64(self.fate.supernova);
                        self.emit_stage(SimEventType::DeathEvent, sn, 0.0, out);
                    }
                    LifecycleStage::Death => {
                        self.stage = LifecycleStage::Remnant;
                        // Mass loss widens the surviving planets' orbits.
                        self.expand_orbits_after_mass_loss();
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
            LifecycleStage::Remnant => 1.0,
        }
    }

    // --- Seeding -------------------------------------------------------------

    fn seed_particles(&mut self, requested: usize) {
        let count = requested.min(MAX_PARTICLES);
        let extent = self.cloud_extent;
        let cum = self.species_cumulative();
        let seed_mu = self.mu();
        let dust_budget = self.cloud_mass
            * (1.0 - CORE_SEED_FRACTION - PLANETESIMAL_COUNT as f64 * PLANETESIMAL_MASS_FRACTION);
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
            let rho = extent * (0.04 + 0.56 * self.rng.next_f64());
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
        self.bodies = Vec::new();
        let seed_mu = self.mu();
        // Geometric (Titius-Bode-like) spacing, each orbit ~30% wider than the
        // last, with small eccentricities and mutual inclinations.
        let inner = (self.cloud_extent * 0.02).max(self.core_accretion_radius * 1.3);
        let outer = (inner * 4.0).max(self.cloud_extent * 0.8);
        let mass = self.cloud_mass * PLANETESIMAL_MASS_FRACTION;
        let ratio = if PLANETESIMAL_COUNT > 1 {
            (outer / inner).powf(1.0 / (PLANETESIMAL_COUNT - 1) as f64)
        } else {
            1.0
        };
        for i in 0..PLANETESIMAL_COUNT {
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
            });
            self.next_body_id += 1.0;
        }
    }

    // --- Integration ---------------------------------------------------------

    fn integrate_particles(&mut self, h: f64, forming: bool) {
        let mu = self.mu();
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
        for p in &mut self.particles {
            let a = softened_accel(mu, SOFTENING, [p.x, p.y, p.z]);
            let dust = p.kind == ParticleKind::Dust;
            let drag = match p.kind {
                ParticleKind::Dust => dust_drag,
                ParticleKind::Debris => debris_drag,
                ParticleKind::Ejecta => 1.0,
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

    fn integrate_bodies(&mut self, h: f64) {
        let mu = self.mu();
        // Planetesimals damp toward the mid-plane far more weakly than the dust,
        // so the system keeps small mutual inclinations like a real one.
        let vertical = (1.0 - VERTICAL_DAMP * BODY_DAMP_FRACTION * h).max(0.0);
        for body in &mut self.bodies {
            let (pos, mut vel) = integrate_orbit(body.pos, body.vel, mu, SOFTENING, h);
            if matches!(body.kind, BodyType::Protoplanet | BodyType::Planet) {
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
    fn accrete(&mut self, stage: LifecycleStage, orbital_dt: f64) {
        let cloud_mass = self.cloud_mass;
        let capture_radius = self.capture_radius();
        let core_r2 = capture_radius * capture_radius;

        // Angular-momentum-regulated accretion budget for this step: the star
        // can only take so much mass per unit time. Material already waiting in
        // the inner disc reaches it first; dust arriving faster than the cap
        // stays in the visible disc and is swallowed on later steps.
        let mut core_budget = CORE_ACCRETION_RATE * cloud_mass * orbital_dt.max(0.0);
        let from_reservoir = self.disc_reservoir.min(core_budget);
        self.disc_reservoir -= from_reservoir;
        self.core_mass += from_reservoir;
        core_budget -= from_reservoir;
        let body_r2: Vec<f64> = self
            .bodies
            .iter()
            .map(|b| {
                if matches!(b.kind, BodyType::Protoplanet | BodyType::Planet) {
                    let ar = accretion_radius(b.mass, cloud_mass);
                    ar * ar
                } else {
                    -1.0
                }
            })
            .collect();

        let mut to_reservoir = 0.0f64;
        let mut survivors: Vec<Particle> = Vec::with_capacity(self.particles.len());
        for p in std::mem::take(&mut self.particles) {
            let r2 = p.x * p.x + p.y * p.y + p.z * p.z;
            if r2 <= core_r2 {
                if core_budget >= p.mass {
                    core_budget -= p.mass;
                    self.core_mass += p.mass;
                } else {
                    // Over the accretion rate limit: the grain waits in the
                    // inner disc (still visible, still orbiting).
                    survivors.push(p);
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
                    // Retention depends on WHERE the body orbits: rock only
                    // inside the snow line, ices + gas beyond it.
                    let orbit_radius = magnitude(b.pos);
                    let retained = p.mass * accretion_efficiency(orbit_radius);
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

    /// Red-giant photospheric reach in scene units (∝ mass^0.3).
    fn red_giant_engulf_radius(&self) -> f64 {
        REDGIANT_ENGULF_AU * self.cloud_mass.max(0.1).powf(0.3)
    }

    /// Engulf and destroy planets orbiting inside the swollen red giant. Done
    /// ONCE at red-giant onset so it is deterministic at any pace (mirror of
    /// `engulfInnerPlanets`).
    fn engulf_inner_planets(&mut self, events: &mut Vec<PackedEvent>) {
        let r = self.red_giant_engulf_radius();
        let r2 = r * r;
        let sim_time = self.sim_time;
        let doomed: Vec<CelestialBody> = self
            .bodies
            .iter()
            .filter(|b| {
                matches!(b.kind, BodyType::Planet | BodyType::Protoplanet)
                    && b.pos[0] * b.pos[0] + b.pos[1] * b.pos[1] + b.pos[2] * b.pos[2] <= r2
            })
            .copied()
            .collect();
        self.bodies.retain(|b| {
            !(matches!(b.kind, BodyType::Planet | BodyType::Protoplanet)
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

    /// Expand surviving planets' orbits when the dying star sheds its mass
    /// (mirror of `expandOrbitsAfterMassLoss`).
    fn expand_orbits_after_mass_loss(&mut self) {
        let retained: f64 = if self.fate.supernova { 0.16 } else { 0.55 };
        let f = (1.0 / retained).clamp(1.0, REMNANT_ORBIT_EXPANSION_MAX);
        let v_scale = 1.0 / f.sqrt();
        let supernova = self.fate.supernova;
        for body in &mut self.bodies {
            if !matches!(body.kind, BodyType::Planet | BodyType::Protoplanet) {
                continue;
            }
            body.pos = [body.pos[0] * f, body.pos[1] * f, body.pos[2] * f];
            body.vel = [
                body.vel[0] * v_scale,
                body.vel[1] * v_scale,
                body.vel[2] * v_scale,
            ];
            if supernova {
                let kick = 0.18 * magnitude(body.vel);
                body.vel[0] += (self.rng.next_f64() - 0.5) * kick;
                body.vel[1] += (self.rng.next_f64() - 0.5) * kick;
                body.vel[2] += (self.rng.next_f64() - 0.5) * kick;
            }
        }
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
            if removed[i]
                || !matches!(
                    self.bodies[i].kind,
                    BodyType::Protoplanet | BodyType::Planet
                )
            {
                continue;
            }
            for j in (i + 1)..n {
                if removed[j]
                    || !matches!(
                        self.bodies[j].kind,
                        BodyType::Protoplanet | BodyType::Planet
                    )
                {
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
        let escape = self.cloud_extent * ESCAPE_EXTENT_FACTOR;
        let escape2 = escape * escape;
        self.particles
            .retain(|p| p.x * p.x + p.y * p.y + p.z * p.z <= escape2);
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

    /// Throw a shell of glowing ejecta outward when the star dies (planetary
    /// nebula / supernova). Reuses the particle pool so the death is visible.
    fn spawn_ejecta(&mut self) {
        let budget = MAX_PARTICLES.saturating_sub(self.particles.len());
        let n = EJECTA_COUNT.min(budget);
        let violent = self.cloud_mass >= 8.0;
        let base_speed =
            (if violent { 26.0 } else { 12.0 }) * (self.mu() / (self.cloud_extent + 1.0)).sqrt();
        for _ in 0..n {
            let cos_t = 2.0 * self.rng.next_f64() - 1.0;
            let sin_t = (1.0 - cos_t * cos_t).max(0.0).sqrt();
            let phi = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let dir: Vec3 = [sin_t * phi.cos(), cos_t, sin_t * phi.sin()];
            let r0 = 1.0 + self.rng.next_f64() * 2.0;
            // Never below the local escape speed: real nebula/supernova ejecta is
            // unbound, which is why the shell disperses and leaves a BARE remnant
            // instead of settling into a ring of particles around it.
            let escape_speed = (2.0 * self.mu() / r0.max(f64::EPSILON)).sqrt();
            let speed = (base_speed * (0.6 + 0.8 * self.rng.next_f64()))
                .max(EJECTA_ESCAPE_MARGIN * escape_speed);
            self.particles.push(Particle {
                x: dir[0] * r0,
                y: dir[1] * r0,
                z: dir[2] * r0,
                vx: dir[0] * speed,
                vy: dir[1] * speed,
                vz: dir[2] * speed,
                r: if violent { 1.0 } else { 0.9 },
                g: if violent { 0.7 } else { 0.5 },
                b: if violent { 0.5 } else { 0.9 },
                size: 1.6,
                mass: 0.0,
                kind: ParticleKind::Ejecta,
                ttl: f64::INFINITY,
            });
        }
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
                let mu = self.mu();
                let visitor = make_visitor(&mut self.rng, mu, self.eject_radius, self.next_body_id);
                self.next_body_id += 1.0;
                self.bodies.push(visitor);
            }
            guard += 1;
        }
    }

    /// Promote any remaining protoplanets to full planets (idempotent).
    fn promote_planets(&mut self) {
        for body in &mut self.bodies {
            if matches!(body.kind, BodyType::Protoplanet) {
                body.kind = BodyType::Planet;
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

    fn resolve_visitors(&mut self, events: &mut Vec<PackedEvent>) {
        let mu = self.mu();
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
        for (i, p) in self.particles.iter().enumerate() {
            let base = i * PARTICLE_STRIDE;
            self.particle_buf[base] = p.x as f32;
            self.particle_buf[base + 1] = p.y as f32;
            self.particle_buf[base + 2] = p.z as f32;
            self.particle_buf[base + 3] = p.r as f32;
            self.particle_buf[base + 4] = p.g as f32;
            self.particle_buf[base + 5] = p.b as f32;
            self.particle_buf[base + 6] = p.size as f32;
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
    // Only the regression tests need these.
    use nbody::{is_bound, MAX_BODY_RADIUS};

    /// Steps needed to reach the remnant. Formation is rate-limited by the
    /// star's finite accretion rate, so ignition legitimately takes several
    /// hundred bounded orbital steps.
    const LIFECYCLE_STEPS: usize = 900;

    fn solar_kernel(mass: f64, particle_count: u32) -> Kernel {
        Kernel::new(mass, 50.0, 0.5, 0.74, 0.24, 0.02, particle_count)
    }

    #[test]
    fn version_bump() {
        assert_eq!(kernel_version(), 2);
    }

    #[test]
    fn allocates_buffers_of_count_times_stride() {
        let kernel = solar_kernel(1.0, 100);
        assert_eq!(kernel.particle_len() as usize, 100 * PARTICLE_STRIDE);
        assert_eq!(kernel.body_len() as usize % BODY_STRIDE, 0);
        assert!(kernel.body_len() > 0);
    }

    #[test]
    fn protoplanets_become_planets_after_ignition() {
        let mut kernel = solar_kernel(1.0, 50);
        // Seeded planets start as protoplanets (type lane 1 == Protoplanet == 0).
        assert_eq!(kernel.body_buf[1], BodyType::Protoplanet as u32 as f32);
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
        let kernel = solar_kernel(1.0, 10);
        // type lane and captured lane of the first body.
        assert_eq!(kernel.body_buf[1], BodyType::Protoplanet as u32 as f32);
        assert_eq!(kernel.body_buf[11], 1.0);
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
        let kernel = solar_kernel(1.0, 100);
        for i in 0..(kernel.body_buf.len() / BODY_STRIDE) {
            let base = i * BODY_STRIDE;
            let x = f64::from(kernel.body_buf[base + 4]);
            let z = f64::from(kernel.body_buf[base + 6]);
            let r = (x * x + z * z).sqrt();
            assert!(
                r > kernel.core_accretion_radius,
                "seeded inside star: r={r}"
            );
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
    fn leaves_no_bound_particle_circling_the_remnant() {
        // Regression: the red giant engulfs its inner planets and tears each into
        // a tidal-debris stream. That debris carries mass 0, and the death-time
        // sweep only removed MASS-BEARING grains — so the fragments stayed on the
        // orbit they inherited and were visibly circling the white dwarf forever.
        //
        // Physically, everything around a dying star is either accreted or blown
        // away: the only particles that may remain are the UNBOUND death ejecta.
        let mut kernel = solar_kernel(1.0, 3000);
        assert!(drive_to_remnant(&mut kernel));
        // Let the shell fly for a while — anything bound would still be here.
        for _ in 0..20 {
            kernel.step(1.0e17);
        }
        let mu = ORBITAL_MASS_SCALE * GRAVITY;
        for p in &kernel.particles {
            let r = (p.x * p.x + p.y * p.y + p.z * p.z).sqrt();
            let speed = (p.vx * p.vx + p.vy * p.vy + p.vz * p.vz).sqrt();
            assert!(
                !is_bound(mu, r, speed),
                "bound particle still orbiting the remnant at r={r}"
            );
            assert_eq!(p.kind, ParticleKind::Ejecta);
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

        // The stream drains into the star within a few orbits.
        for _ in 0..60 {
            if kernel.stage() >= LifecycleStage::Death as u32 {
                break;
            }
            kernel.step(1.0e16);
        }
        assert!(
            !kernel
                .particles
                .iter()
                .any(|p| p.kind == ParticleKind::Debris),
            "tidal debris is still orbiting long after the disruption"
        );
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
            assert!(p.mass <= 0.0, "primordial dust left at remnant: {}", p.mass);
        }
    }

    #[test]
    fn depletes_dust_and_grows_planetesimals() {
        let mut kernel = solar_kernel(1.0, 1500);
        let dust0 = kernel.particle_buf.len() / PARTICLE_STRIDE;
        let mass0 = total_body_mass(&kernel.body_buf);
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
}

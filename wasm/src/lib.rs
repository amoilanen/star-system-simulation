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
    circular_speed, integrate_orbit, softened_accel, Vec3, GRAVITY, INTERNAL_DT, MAX_PARTICLES,
    MAX_SUBSTEPS, SOFTENING,
};
use stages::{LifecycleStage, PackedEvent, SimEventType, StageMachine};

/// Number of Float32 lanes per particle (mirror `PARTICLE_STRIDE`).
const PARTICLE_STRIDE: usize = 7;
/// Number of Float32 lanes per body (mirror `BODY_STRIDE`).
const BODY_STRIDE: usize = 12;
/// Number of Float64 lanes per packed event: [type, simTime, dataA, dataB].
const EVENT_STRIDE: usize = 4;

/// Sim seconds that map to one internal integration substep (mirror).
const SIM_SECONDS_PER_SUBSTEP: f64 = 5.0e14;
/// Number of planets seeded into the system at init (mirror).
const PLANET_COUNT: usize = 4;
/// Sim seconds between visiting comet/asteroid spawns (mirror).
const VISITOR_SPAWN_INTERVAL: f64 = 8.0e15;
/// Cap on simultaneously present visiting bodies so captured ones cannot
/// accumulate without bound (mirror of the TS fallback's `MAX_VISITORS`).
const MAX_VISITORS: usize = 10;

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
}

/// The Rust/WASM physics kernel. Construct once per run, then drive with `step`.
/// Deterministic for a given configuration.
#[wasm_bindgen]
pub struct Kernel {
    mass: f64,
    mu: f64,
    eject_radius: f64,
    cloud_extent: f64,
    composition: [f64; 3],
    rng: Mulberry32,
    machine: StageMachine,

    particles: Vec<Particle>,
    bodies: Vec<CelestialBody>,

    particle_buf: Vec<f32>,
    body_buf: Vec<f32>,
    event_buf: Vec<f64>,

    sim_time: f64,
    next_body_id: f64,
    spawn_accumulator: f64,
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
        let mu = GRAVITY * mass.max(f64::EPSILON);
        let seed = seed_from_config(mass, cloud_extent, pace, h, he, metals);
        let mut kernel = Kernel {
            mass,
            mu,
            eject_radius: cloud_extent * 1.5,
            cloud_extent,
            composition: [h, he, metals],
            rng: Mulberry32::new(seed),
            machine: StageMachine::new(mass, metals),
            particles: Vec::new(),
            bodies: Vec::new(),
            particle_buf: Vec::new(),
            body_buf: Vec::new(),
            event_buf: Vec::new(),
            sim_time: 0.0,
            next_body_id: 0.0,
            spawn_accumulator: 0.0,
        };
        kernel.seed_particles(particle_count as usize);
        kernel.seed_planets();
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

        // Narrative FSM over the full sim-time increment.
        self.machine.update(dt_sim_seconds, &mut events);
        self.sim_time += dt_sim_seconds;

        // Once the star ignites, protoplanets have finished accreting and are now
        // full planets — reflect that in their type (mirror of the TS fallback).
        if self.machine.current_stage() as u32 >= LifecycleStage::FusionIgnition as u32 {
            self.promote_planets();
        }

        // Numeric model with a bounded number of internal substeps.
        let substeps = (dt_sim_seconds / SIM_SECONDS_PER_SUBSTEP)
            .round()
            .max(1.0)
            .min(MAX_SUBSTEPS as f64) as usize;
        for _ in 0..substeps {
            self.integrate_particles(INTERNAL_DT);
            self.integrate_bodies(INTERNAL_DT);
        }

        self.spawn_visitors(dt_sim_seconds);
        self.resolve_visitors(&mut events);

        self.write_particle_buffer();
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
        self.machine.current_stage() as u32
    }
}

impl Kernel {
    // --- Seeding -------------------------------------------------------------

    fn seed_particles(&mut self, requested: usize) {
        let count = requested.min(MAX_PARTICLES);
        let extent = self.cloud_extent;
        let cum = self.species_cumulative();
        self.particles = Vec::with_capacity(count);
        for _ in 0..count {
            let radius = extent * self.rng.next_f64().cbrt();
            let cos_theta = 2.0 * self.rng.next_f64() - 1.0;
            let sin_theta = (1.0 - cos_theta * cos_theta).max(0.0).sqrt();
            let phi = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let x = radius * sin_theta * phi.cos();
            let y = radius * sin_theta * phi.sin();
            let z = radius * cos_theta;

            let swirl = 0.05 * circular_speed(self.mu, SOFTENING, radius.max(SOFTENING));
            let hyp = x.hypot(z);
            let rho = if hyp == 0.0 { 1.0 } else { hyp };
            let (color, size) = self.species_color_size(cum);
            self.particles.push(Particle {
                x,
                y,
                z,
                vx: (-z / rho) * swirl,
                vy: 0.0,
                vz: (x / rho) * swirl,
                r: color[0],
                g: color[1],
                b: color[2],
                size,
            });
        }
    }

    fn seed_planets(&mut self) {
        self.bodies = Vec::new();
        let inner = self.cloud_extent * 0.15;
        let spacing = (self.cloud_extent * 0.55) / PLANET_COUNT as f64;
        for i in 0..PLANET_COUNT {
            let r = inner + spacing * i as f64;
            let speed = circular_speed(self.mu, SOFTENING, r);
            let phase = 2.0 * std::f64::consts::PI * self.rng.next_f64();
            let position: Vec3 = [r * phase.cos(), 0.0, r * phase.sin()];
            let velocity: Vec3 = [-speed * phase.sin(), 0.0, speed * phase.cos()];
            let spin = 0.5 + self.rng.next_f64();
            self.bodies.push(CelestialBody {
                id: self.next_body_id,
                kind: BodyType::Protoplanet,
                mass: 1.0e-6 * self.mass * (i as f64 + 1.0),
                radius: 0.4 + 0.15 * i as f64,
                pos: position,
                vel: velocity,
                spin,
                captured: true,
            });
            self.next_body_id += 1.0;
        }
    }

    // --- Integration ---------------------------------------------------------

    fn integrate_particles(&mut self, h: f64) {
        let mu = self.mu;
        for p in &mut self.particles {
            let a = softened_accel(mu, SOFTENING, [p.x, p.y, p.z]);
            p.vx += a[0] * h;
            p.vy += a[1] * h;
            p.vz += a[2] * h;
            p.x += p.vx * h;
            p.y += p.vy * h;
            p.z += p.vz * h;
        }
    }

    fn integrate_bodies(&mut self, h: f64) {
        let mu = self.mu;
        for body in &mut self.bodies {
            let (pos, vel) = integrate_orbit(body.pos, body.vel, mu, SOFTENING, h);
            body.pos = pos;
            body.vel = vel;
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
                let visitor =
                    make_visitor(&mut self.rng, self.mu, self.eject_radius, self.next_body_id);
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
        let mu = self.mu;
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
        // Drive well past fusion ignition.
        kernel.step(1.0e17);
        assert!(kernel.machine.current_stage() as u32 >= LifecycleStage::FusionIgnition as u32);
        for i in 0..(kernel.body_len() as usize / BODY_STRIDE) {
            let base = i * BODY_STRIDE;
            let kind = kernel.body_buf[base + 1];
            // No body should still be a protoplanet.
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
    fn huge_dt_drives_fsm_to_remnant_and_emits_all_stage_events() {
        let mut kernel = solar_kernel(1.0, 50);
        let count = kernel.step(1.0e30);
        assert_eq!(kernel.stage(), LifecycleStage::Remnant as u32);
        assert!(count >= 6, "expected the six stage events, got {count}");

        // Decode packed events and confirm all six stage transitions appear.
        let mut kinds = Vec::new();
        for chunk in kernel.event_buf.chunks(EVENT_STRIDE) {
            kinds.push(chunk[0] as u32);
        }
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
        assert_eq!(a.0.len(), 40 * PARTICLE_STRIDE);
    }
}

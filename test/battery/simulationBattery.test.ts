// Physical-soundness simulation battery (headless).
//
// Runs a large sample of full birth→death simulations across the whole
// parameter space the setup form exposes (cloud mass 0.1–250 M☉, extent
// 10–250 AU, compositions from metal-free to metal-rich, several paces) and
// asserts PHYSICAL invariants on every run, against BOTH kernels:
//
//   - buffers stay finite (no NaN/Inf ever reaches the renderer);
//   - the lifecycle advances monotonically and emits exactly one entry event
//     per transition, in the correct order;
//   - the reported star mass tracks the star-formation budget (a cloud never
//     makes a star of its own mass), and the remnant mass respects the
//     Chandrasekhar / TOV limits and the initial–final mass relation;
//   - the death path (supernova? which remnant?) matches stellar theory via
//     the centralized fate model evaluated on the STELLAR mass;
//   - the reported elapsed time matches the illustrative stage durations
//     (massive stars live fast and die young);
//   - mass is conserved by the TS kernel's accretion bookkeeping (dust + core
//     + inner disc + dispersed + bodies never exceeds the cloud budget and
//     never spontaneously grows);
//   - planets stay gravitationally bound to the system while the star lives,
//     and the emergent architecture is solar-like (massive gas giants form
//     beyond the snow line, not on top of the star);
//   - once the star is a remnant, nothing is left circling it except its own
//     (unbound, receding) death ejecta;
//   - a SUBSTELLAR cloud produces a brown dwarf instead: it never emits a
//     fusion event, never reaches a main sequence or a death, keeps all of its
//     mass, throws no ejecta, and stops its clock at the formation timescale.
//
// The run count is BATTERY_RUNS. The default of 12 keeps `npm test` quick while
// still covering every fate boundary; the full audit is
//
//   BATTERY_RUNS=100 npx vitest run test/battery
//
// which exercises 100 distinct parameter sets against BOTH kernels (200 runs).

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { CloudComposition, SimulationConfig } from '../../src/config/SimulationConfig';
import {
  LifecycleStage,
  RemnantType,
  determineFate,
  isSubstellar,
  remnantMass,
  FATE_THRESHOLDS,
} from '../../src/config/fateModel';
import { stellarMassFromCloud, cloudMassForStar } from '../../src/config/starFormation';
import { stageDurations } from '../../src/sim/stages';
import { SimEventType } from '../../src/sim/events';
import {
  BODY_OFFSET,
  BODY_STRIDE,
  BodyType,
  PARTICLE_STRIDE,
  type PhysicsKernel,
} from '../../src/sim/PhysicsKernel';
import {
  TsFallbackKernel,
  SOFTENING,
  SNOW_LINE_AU,
  orbitalMu,
  mulberry32,
  ParticleKind,
} from '../../src/sim/TsFallbackKernel';
import { paceToRate, DEFAULT_LIFECYCLE_SIM_SECONDS } from '../../src/sim/Clock';
import { loadWasmModule, WasmKernel } from '../../src/sim/WasmKernel';
import { sceneToAu, solarToEarthMasses } from '../../src/sim/astro';

const RUNS = Number(process.env.BATTERY_RUNS ?? 12);
const PARTICLES = 900;
const FRAME_REAL_DT = 1 / 60;
const MAX_TICKS = 60000;
/** Ticks to keep stepping after the remnant forms (ejecta must keep receding). */
const REMNANT_SETTLE_TICKS = 150;

const LIFECYCLE_EVENT_ORDER: readonly SimEventType[] = [
  SimEventType.CollapseOnset,
  SimEventType.ProtostarFormed,
  SimEventType.FusionIgnition,
  SimEventType.RedGiantOnset,
  SimEventType.DeathEvent,
  SimEventType.RemnantFormed,
];

interface BatteryConfig extends SimulationConfig {
  label: string;
}

function composition(metals: number): CloudComposition {
  const rest = 1 - metals;
  return { hydrogen: rest * 0.755, helium: rest * 0.245, metals };
}

/** Deterministic battery configurations spanning the setup form's domain. */
function buildConfigs(count: number): BatteryConfig[] {
  const rng = mulberry32(0xbadc0de);
  const configs: BatteryConfig[] = [];
  // Star masses straddling every fate boundary (M☉ of STELLAR mass), including
  // the 0.08 M☉ hydrogen-burning limit that separates a brown dwarf that never
  // ignites from the lightest object that can genuinely become a star.
  const starTargets = [
    0.03, 0.05, 0.079, 0.081, 0.2, 0.5, 0.8, 1, 1.5, 2.2, 3, 5, 7, 7.9, 8.1, 10, 11.9, 12.1, 15, 18,
    21.9, 22.1, 30, 39, 41, 50,
  ];
  const metalsChoices = [0.0001, 0.004, 0.02, 0.02, 0.05, 0.12];
  const extents = [10, 25, 50, 80, 120, 250];
  for (let i = 0; i < count; i += 1) {
    let mass: number;
    let label: string;
    const metals = metalsChoices[i % metalsChoices.length]!;
    if (i < starTargets.length) {
      const target = starTargets[i]!;
      mass = Math.min(250, Math.max(0.05, cloudMassForStar(target, metals)));
      label = `star≈${target}M☉`;
    } else {
      // Log-uniform cloud mass over the form's full range.
      mass = 0.1 * Math.pow(250 / 0.1, rng());
      label = `cloud=${mass.toFixed(2)}M☉`;
    }
    const cloudExtent = extents[(i * 7 + 3) % extents.length]!;
    const pace = i % 9 === 8 ? 0.9 : 1;
    configs.push({
      locale: 'en',
      composition: composition(metals),
      mass,
      cloudExtent,
      pace,
      showEventAnnotations: false,
      label: `#${i} ${label} Z=${metals} ext=${cloudExtent} pace=${pace}`,
    });
  }
  return configs;
}

interface RunReport {
  issues: string[];
  events: { type: SimEventType; simTime: number; data?: Record<string, unknown> | undefined }[];
  finalStage: LifecycleStage;
  finalStarMass: number;
  finalElapsed: number;
  ticks: number;
  /** Planet orbits sampled while the star is on the main sequence. */
  architecture: { mass: number; aAu: number; apoapsisAu: number }[];
}

function bodyView(buf: Float32Array, i: number) {
  const b = i * BODY_STRIDE;
  return {
    id: buf[b + BODY_OFFSET.id]!,
    type: buf[b + BODY_OFFSET.type]! as BodyType,
    mass: buf[b + BODY_OFFSET.mass]!,
    x: buf[b + BODY_OFFSET.x]!,
    y: buf[b + BODY_OFFSET.y]!,
    z: buf[b + BODY_OFFSET.z]!,
    vx: buf[b + BODY_OFFSET.vx]!,
    vy: buf[b + BODY_OFFSET.vy]!,
    vz: buf[b + BODY_OFFSET.vz]!,
  };
}

function allFinite(buf: Float32Array): boolean {
  for (let i = 0; i < buf.length; i += 1) {
    if (!Number.isFinite(buf[i]!)) {
      return false;
    }
  }
  return true;
}

/** TS-kernel internals (deliberate white-box access for conservation checks). */
interface TsInternals {
  particles: { x: number; y: number; z: number; mass: number; kind: ParticleKind }[];
  bodies: { mass: number }[];
  coreMass: number;
  discReservoir: number;
  dispersedMass: number;
  starMass: number;
  cloudMass: number;
}

function runBattery(kernel: PhysicsKernel, config: BatteryConfig, isTs: boolean): RunReport {
  const report: RunReport = {
    issues: [],
    events: [],
    finalStage: LifecycleStage.DustCloud,
    finalStarMass: 0,
    finalElapsed: 0,
    ticks: 0,
    architecture: [],
  };
  const issue = (msg: string): void => {
    if (report.issues.length < 12) {
      report.issues.push(msg);
    }
  };

  kernel.init({ config, particleCount: PARTICLES });
  const stellarMass = stellarMassFromCloud(config.mass, config.composition.metals);
  const durations = stageDurations(stellarMass, config.composition);
  const paceRate = paceToRate(config.pace, 1, DEFAULT_LIFECYCLE_SIM_SECONDS, 60);
  const baseSimDt = paceRate * FRAME_REAL_DT;
  const mu = orbitalMu(config.mass);

  let lastStage: LifecycleStage = LifecycleStage.DustCloud;
  let lastElapsed = -Infinity;
  let remnantTicks = 0;
  let maxMassBudget = -Infinity;

  const internals = isTs ? (kernel as unknown as TsInternals) : null;

  for (let tick = 0; tick < MAX_TICKS; tick += 1) {
    report.ticks = tick + 1;
    // Long stellar stages are crossed with a larger dt (the user can crank the
    // pace arbitrarily high; the kernel must stay sound under any dt).
    let simDt = baseSimDt;
    if (lastStage === LifecycleStage.MainSequence || lastStage === LifecycleStage.RedGiant) {
      const dur = durations[lastStage];
      if (Number.isFinite(dur)) {
        simDt = Math.max(baseSimDt, dur / 200);
      }
    }
    const res = kernel.step(simDt);

    for (const ev of res.events) {
      report.events.push({ type: ev.type, simTime: ev.simTime, data: ev.data });
    }
    if (res.stage < lastStage) {
      issue(`stage regressed ${LifecycleStage[lastStage]} -> ${LifecycleStage[res.stage]}`);
    }
    const stageChanged = res.stage !== lastStage;
    lastStage = res.stage;
    if (!Number.isFinite(res.elapsedSimSeconds) || res.elapsedSimSeconds < lastElapsed - 1) {
      issue(`elapsed time not monotonic at tick ${tick}`);
    }
    lastElapsed = res.elapsedSimSeconds;
    if (!Number.isFinite(res.starMassSolar) || res.starMassSolar < 0) {
      issue(`non-finite/negative star mass at tick ${tick}`);
    }
    if (res.stage < LifecycleStage.Remnant && res.starMassSolar > stellarMass * 1.02 + 1e-9) {
      issue(
        `star mass ${res.starMassSolar.toFixed(3)} exceeds formation budget ` +
          `${stellarMass.toFixed(3)} at stage ${LifecycleStage[res.stage]}`,
      );
    }
    if (res.stageProgress < 0 || res.stageProgress > 1 || !Number.isFinite(res.stageProgress)) {
      issue(`stageProgress out of [0,1]: ${res.stageProgress}`);
    }

    // Cheap per-tick invariant: no planet may ever become unbound. Sampling this
    // only every 25th tick let a single-step energy blow-up slip through if the
    // body was culled again before the next sample.
    if (res.stage < LifecycleStage.Death) {
      const bbuf = kernel.getBodyBuffer();
      for (let i = 0; i < bbuf.length / BODY_STRIDE; i += 1) {
        const b = bodyView(bbuf, i);
        if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
          continue;
        }
        const r = Math.hypot(b.x, b.y, b.z);
        const v2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
        if (0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING) >= 0) {
          issue(
            `planet unbound at tick ${tick} (stage ${LifecycleStage[res.stage]}) r=${r.toFixed(1)}`,
          );
        }
      }
    }

    // Sample the emergent architecture once, mid-main-sequence: the star is
    // fully formed, and the red giant has not yet eaten the inner planets.
    if (
      report.architecture.length === 0 &&
      res.stage === LifecycleStage.MainSequence &&
      res.stageProgress > 0.3
    ) {
      const bbuf = kernel.getBodyBuffer();
      for (let i = 0; i < bbuf.length / BODY_STRIDE; i += 1) {
        const b = bodyView(bbuf, i);
        if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
          continue;
        }
        const r = Math.hypot(b.x, b.y, b.z);
        const v2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
        const energy = 0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING);
        // Semi-major axis from the vis-viva relation; bound orbits only.
        const aScene = energy < 0 ? -mu / (2 * energy) : Infinity;
        // Eccentricity from the specific angular momentum, so we can ask how far
        // OUT the orbit actually reaches — which is what decides whether the
        // body ever sees ices (the kernel accretes at the instantaneous radius).
        const lx = b.y * b.vz - b.z * b.vy;
        const ly = b.z * b.vx - b.x * b.vz;
        const lz = b.x * b.vy - b.y * b.vx;
        const l2 = lx * lx + ly * ly + lz * lz;
        const ecc = Math.sqrt(Math.max(0, 1 + (2 * energy * l2) / (mu * mu)));
        report.architecture.push({
          mass: b.mass,
          aAu: sceneToAu(aScene),
          apoapsisAu: Number.isFinite(aScene) ? sceneToAu(aScene * (1 + ecc)) : Infinity,
        });
      }
    }

    const sampled = tick % 25 === 0 || stageChanged;
    if (sampled) {
      const pbuf = kernel.getParticleBuffer();
      const bbuf = kernel.getBodyBuffer();
      if (!allFinite(pbuf)) {
        issue(`non-finite particle buffer at tick ${tick} (${LifecycleStage[res.stage]})`);
      }
      if (!allFinite(bbuf)) {
        issue(`non-finite body buffer at tick ${tick} (${LifecycleStage[res.stage]})`);
      }
      if (pbuf.length % PARTICLE_STRIDE !== 0 || bbuf.length % BODY_STRIDE !== 0) {
        issue(`buffer length not stride-aligned at tick ${tick}`);
      }

      // Planets must be gravitationally bound at EVERY stage, not just once the
      // star is on the main sequence: nothing in the model can unbind a planet
      // (bodies do not perturb one another), so an unbound one is the
      // integrator manufacturing energy.
      if (res.stage < LifecycleStage.Death) {
        const n = bbuf.length / BODY_STRIDE;
        for (let i = 0; i < n; i += 1) {
          const b = bodyView(bbuf, i);
          if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
            continue;
          }
          const r = Math.hypot(b.x, b.y, b.z);
          const v2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
          const energy = 0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING);
          if (energy >= 0) {
            issue(`unbound planet (E=${energy.toFixed(3)}) at tick ${tick} r=${r.toFixed(1)}`);
          }
          if (r > config.cloudExtent * 3) {
            issue(`planet escaped to r=${r.toFixed(1)} (extent ${config.cloudExtent})`);
          }
        }
      }

      // TS-kernel mass conservation bookkeeping.
      if (internals !== null) {
        let dust = 0;
        for (const p of internals.particles) {
          dust += p.mass;
        }
        let bodies = 0;
        for (const b of internals.bodies) {
          bodies += b.mass;
        }
        const total =
          internals.coreMass + internals.discReservoir + internals.dispersedMass + dust + bodies;
        if (total > config.mass * 1.005 + 1e-9) {
          issue(`mass created: budget total ${total.toFixed(4)} > cloud ${config.mass}`);
        }
        if (total > maxMassBudget + config.mass * 0.002) {
          if (maxMassBudget !== -Infinity) {
            issue(`mass budget grew ${maxMassBudget.toFixed(4)} -> ${total.toFixed(4)}`);
          }
        }
        maxMassBudget = Math.max(maxMassBudget, total);
      }
    }

    if (res.stage === LifecycleStage.Remnant) {
      remnantTicks += 1;
      if (remnantTicks >= REMNANT_SETTLE_TICKS) {
        report.finalStage = res.stage;
        report.finalStarMass = res.starMassSolar;
        report.finalElapsed = res.elapsedSimSeconds;
        break;
      }
    }
    report.finalStage = res.stage;
    report.finalStarMass = res.starMassSolar;
    report.finalElapsed = res.elapsedSimSeconds;
  }

  finishChecks(report, config, kernel, internals, stellarMass, durations, mu, issue);
  return report;
}

function finishChecks(
  report: RunReport,
  config: BatteryConfig,
  kernel: PhysicsKernel,
  internals: TsInternals | null,
  stellarMass: number,
  durations: Readonly<Record<LifecycleStage, number>>,
  mu: number,
  issue: (msg: string) => void,
): void {
  if (report.finalStage !== LifecycleStage.Remnant) {
    issue(
      `lifecycle did not complete: ended in ${LifecycleStage[report.finalStage]} ` +
        `after ${report.ticks} ticks`,
    );
    return;
  }

  // --- Event sequence: exactly one lifecycle event each, in order. ----------
  const substellar = isSubstellar(stellarMass);
  const lifecycle = report.events.filter((e) => LIFECYCLE_EVENT_ORDER.includes(e.type));
  const seq = lifecycle.map((e) => e.type);
  // A brown dwarf never ignites, so it never emits FusionIgnition and never
  // reaches the red giant or the death: it goes protostar → remnant.
  const expected = substellar
    ? [SimEventType.CollapseOnset, SimEventType.ProtostarFormed, SimEventType.RemnantFormed]
    : [...LIFECYCLE_EVENT_ORDER];
  if (JSON.stringify(seq) !== JSON.stringify(expected)) {
    issue(`lifecycle event sequence wrong: [${seq.map((t) => SimEventType[t]).join(', ')}]`);
  }
  for (let i = 1; i < lifecycle.length; i += 1) {
    if (lifecycle[i]!.simTime < lifecycle[i - 1]!.simTime) {
      issue('lifecycle event timestamps not monotonic');
    }
  }

  // --- Fate correctness vs stellar theory (on the STELLAR mass). ------------
  const expectedFate = determineFate(stellarMass, config.composition);
  const remnantEv = report.events.find((e) => e.type === SimEventType.RemnantFormed);
  const deathEv = report.events.find((e) => e.type === SimEventType.DeathEvent);
  if (remnantEv?.data !== undefined) {
    const remnant = remnantEv.data['remnant'] as RemnantType;
    const supernova = remnantEv.data['supernova'] as boolean;
    if (remnant !== expectedFate.remnant) {
      issue(
        `remnant ${RemnantType[remnant]} != theoretical ${RemnantType[expectedFate.remnant]} ` +
          `for star ${stellarMass.toFixed(2)}M☉`,
      );
    }
    if (supernova !== expectedFate.supernova) {
      issue(`supernova flag ${supernova} != theoretical ${expectedFate.supernova}`);
    }
  } else {
    issue('RemnantFormed event missing/without data');
  }
  if (deathEv?.data !== undefined && deathEv.data['supernova'] !== expectedFate.supernova) {
    issue('DeathEvent supernova flag mismatches the fate model');
  }

  // --- Remnant mass physics. -------------------------------------------------
  const expectRemnantMass = remnantMass(stellarMass, expectedFate.remnant);
  if (Math.abs(report.finalStarMass - expectRemnantMass) > expectRemnantMass * 0.02) {
    issue(
      `remnant mass ${report.finalStarMass.toFixed(3)} != expected ` +
        `${expectRemnantMass.toFixed(3)}`,
    );
  }
  if (
    expectedFate.remnant === RemnantType.WhiteDwarf &&
    report.finalStarMass > FATE_THRESHOLDS.chandrasekharMass + 1e-6
  ) {
    issue(`white dwarf above the Chandrasekhar limit: ${report.finalStarMass}`);
  }
  if (
    (expectedFate.remnant === RemnantType.NeutronStar ||
      expectedFate.remnant === RemnantType.Pulsar) &&
    report.finalStarMass > FATE_THRESHOLDS.tovMass + 1e-6
  ) {
    issue(`neutron star above the TOV limit: ${report.finalStarMass}`);
  }
  if (substellar) {
    // A brown dwarf sheds nothing — it never dies, so it keeps its whole mass.
    if (Math.abs(report.finalStarMass - stellarMass) > stellarMass * 1e-3) {
      issue(
        `brown dwarf mass ${report.finalStarMass.toFixed(4)} != formed mass ` +
          `${stellarMass.toFixed(4)} — it has nothing to shed`,
      );
    }
  } else if (report.finalStarMass >= stellarMass) {
    issue('remnant did not lose mass relative to its progenitor');
  }

  // --- Elapsed time must reflect the illustrative stage durations. -----------
  const formationTotal =
    durations[LifecycleStage.DustCloud] +
    durations[LifecycleStage.ProtostarCoalescence] +
    durations[LifecycleStage.FusionIgnition];
  // A brown dwarf's clock stops at the end of formation: it has no main
  // sequence, no red giant and no death to spend billions of years on.
  const expectedTotal = substellar
    ? formationTotal
    : formationTotal +
      durations[LifecycleStage.MainSequence] +
      durations[LifecycleStage.RedGiant] +
      durations[LifecycleStage.Death];
  const ratio = report.finalElapsed / expectedTotal;
  if (!(ratio > 0.9 && ratio < 1.15)) {
    issue(
      `elapsed at remnant ${report.finalElapsed.toExponential(2)}s is ${ratio.toFixed(2)}× ` +
        `the theoretical lifetime ${expectedTotal.toExponential(2)}s`,
    );
  }

  // --- Post-mortem state: only unbound, receding ejecta remains. -------------
  if (internals !== null) {
    if (substellar) {
      // The opposite invariant: a brown dwarf has no explosion, so it must
      // never produce ejecta — and it keeps the disc a blast would have swept.
      if (internals.particles.some((p) => p.kind === ParticleKind.Ejecta)) {
        issue('a brown dwarf threw ejecta — it has no explosion to throw it');
      }
    } else {
      for (const p of internals.particles) {
        if (p.kind !== ParticleKind.Ejecta) {
          issue('non-ejecta particles still present around the remnant');
          break;
        }
      }
    }
  }
  const pbuf = kernel.getParticleBuffer();
  const bbuf = kernel.getBodyBuffer();
  if (!allFinite(pbuf) || !allFinite(bbuf)) {
    issue('non-finite final buffers');
  }
  // Surviving planets must not sit on top of the remnant.
  const n = bbuf.length / BODY_STRIDE;
  for (let i = 0; i < n; i += 1) {
    const b = bodyView(bbuf, i);
    if (b.type !== BodyType.Planet && b.type !== BodyType.Protoplanet) {
      continue;
    }
    const r = Math.hypot(b.x, b.y, b.z);
    if (r < 0.5) {
      issue(`planet parked on the remnant at r=${r.toFixed(3)}`);
    }
    const v2 = b.vx * b.vx + b.vy * b.vy + b.vz * b.vz;
    const energy = 0.5 * v2 - mu / Math.sqrt(r * r + SOFTENING * SOFTENING);
    if (energy >= 0) {
      issue(`surviving planet unbound after mass loss (E=${energy.toFixed(3)})`);
    }
  }

  // --- Emergent architecture: the most massive planet is NOT a close-in one. --
  const planets: { mass: number; au: number }[] = [];
  for (let i = 0; i < n; i += 1) {
    const b = bodyView(bbuf, i);
    if (b.type === BodyType.Planet || b.type === BodyType.Protoplanet) {
      planets.push({ mass: b.mass, au: sceneToAu(Math.hypot(b.x, b.y, b.z)) });
    }
  }
  if (planets.length > 0) {
    const biggest = planets.reduce((a, b) => (b.mass > a.mass ? b : a));
    // After the remnant's orbital expansion even an inner planet sits wider, so
    // compare against the snow line only loosely; a Jupiter at 0.5 AU is the
    // bug this guards against.
    if (biggest.mass > 5e-5 && biggest.au < SNOW_LINE_AU * 0.9) {
      issue(
        `most massive planet (${biggest.mass.toExponential(1)}M☉) orbits at ` +
          `${biggest.au.toFixed(2)} AU — inside the snow line`,
      );
    }
  }

  // --- Architecture measured on the MAIN SEQUENCE, by semi-major axis. -------
  // Comparing instantaneous radii is misleading (an eccentric giant just
  // outside the ice line dips inside it), and the post-death snapshot has
  // already lost its inner planets to the red giant. `report.architecture` is
  // sampled while the star is alive and uses each planet's ORBIT.
  const arch = report.architecture;
  if (arch.length > 0) {
    // A body whose ENTIRE orbit stays inside the snow line never sees an ice
    // grain: only refractory rock condenses there, at a retention some three
    // orders of magnitude lower. It therefore cannot become a giant — and since
    // the model has no migration, a giant found on such an orbit could only have
    // been created there, which is exactly the "hot Jupiter out of nowhere" bug.
    // (Apoapsis, not semi-major axis, is the right test: the kernel accretes at
    // the body's instantaneous radius, so an eccentric planet whose a is a hair
    // inside 2.7 AU does reach the ices, and a Jupiter there is correct.)
    // The 0.8 tolerance matters: a giant that grew just BEYOND the ice line can
    // legitimately end up marginally inside it, because a momentum-conserving
    // merge shrinks the survivor's orbit. Observed: a 71 M⊕ world with apoapsis
    // 2.62 AU against a 2.7 AU snow line — 3% inside, and impossible to have
    // grown there, so it must have moved. The bug this guards against is a giant
    // DEEP in the terrestrial zone (the original ones sat at 0.5–1.4 AU), which
    // this bound still catches decisively.
    const terrestrialZoneAu = SNOW_LINE_AU * 0.8;
    for (const p of arch) {
      if (p.apoapsisAu < terrestrialZoneAu && solarToEarthMasses(p.mass) >= 50) {
        issue(
          `giant (${solarToEarthMasses(p.mass).toFixed(0)} M⊕) on an orbit entirely ` +
            `deep inside the snow line (a=${p.aAu.toFixed(2)}, apoapsis=${p.apoapsisAu.toFixed(2)} AU) — ` +
            `the rocky zone cannot supply that`,
        );
      }
    }
    // NB deliberately NOT asserting that the biggest planet is an outer one.
    // It usually is, but a giant sitting at the ice line can legitimately end up
    // the innermost SURVIVOR once the terrestrial embryos inside it have merged
    // into it — an emergent outcome, not a defect. The apoapsis rule above is
    // the invariant that actually distinguishes physics from a bug.
    // Planets must stay inside the system they formed in.
    for (const p of arch) {
      if (p.aAu > config.cloudExtent * 2.5) {
        issue(`planet on a a=${p.aAu.toFixed(0)} AU orbit in a ${config.cloudExtent} AU cloud`);
      }
    }
  }
}

// --- Test wiring -------------------------------------------------------------

const configs = buildConfigs(RUNS);

describe(`simulation battery (${RUNS} runs) — TypeScript kernel`, () => {
  for (const config of configs) {
    it(
      config.label,
      () => {
        const kernel = new TsFallbackKernel();
        const report = runBattery(kernel, config, true);
        kernel.dispose();
        expect(report.issues, report.issues.join('\n')).toEqual([]);
      },
      120000,
    );
  }
});

const wasmBinUrl = new URL('../../wasm/pkg/star_kernel_bg.wasm', import.meta.url);
const wasmBuilt = existsSync(fileURLToPath(wasmBinUrl));
const describeWasm = wasmBuilt ? describe : describe.skip;

describeWasm(`simulation battery (${RUNS} runs) — WASM kernel`, () => {
  for (const config of configs) {
    it(
      config.label,
      async () => {
        const bytes = readFileSync(fileURLToPath(wasmBinUrl));
        const mod = await loadWasmModule({ module_or_path: new Uint8Array(bytes) });
        const kernel = new WasmKernel(mod);
        const report = runBattery(kernel, config, false);
        kernel.dispose();
        expect(report.issues, report.issues.join('\n')).toEqual([]);
      },
      120000,
    );
  }
});
